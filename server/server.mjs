import crypto from "node:crypto";
import fs from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createDatabase } from "./db.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const dataPath = path.join(__dirname, "data", "store.json");
const productsPath = path.join(__dirname, "products.json");
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || (process.env.NODE_ENV === "production" ? "0.0.0.0" : "127.0.0.1");
const sessionSecret = process.env.SESSION_SECRET || "silent-local-dev-secret";
const baseUrl = process.env.BASE_URL || `http://localhost:${port}`;
const db = await createDatabase({ dataPath, databaseUrl: process.env.DATABASE_URL });

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
};

async function readJson(filePath, fallback) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(filePath, value) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(value, null, 2));
}

function sendJson(res, status, payload) {
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(payload));
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) return {};
  try {
    return JSON.parse(raw);
  } catch {
    throw new Error("Request body must be valid JSON.");
  }
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.pbkdf2Sync(String(password), salt, 120000, 32, "sha256").toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored || "").split(":");
  if (!salt || !hash) return false;
  const candidate = hashPassword(password, salt).split(":")[1];
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function signToken(userId) {
  const payload = Buffer.from(JSON.stringify({
    sub: userId,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
  })).toString("base64url");
  const signature = crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
  return `${payload}.${signature}`;
}

function readToken(req) {
  const header = req.headers.authorization || "";
  return header.startsWith("Bearer ") ? header.slice(7) : "";
}

function verifyToken(token) {
  try {
    const [payload, signature] = String(token || "").split(".");
    if (!payload || !signature) return null;
    const expected = crypto.createHmac("sha256", sessionSecret).update(payload).digest("base64url");
    const signatureBuffer = Buffer.from(signature);
    const expectedBuffer = Buffer.from(expected);
    if (signatureBuffer.length !== expectedBuffer.length) return null;
    if (!crypto.timingSafeEqual(signatureBuffer, expectedBuffer)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    return data.exp > Date.now() ? data.sub : null;
  } catch {
    return null;
  }
}

async function currentUser(req) {
  const userId = verifyToken(readToken(req));
  return userId ? db.findUserById(userId) : null;
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    createdAt: user.createdAt,
  };
}

async function requireUser(req, res) {
  const user = await currentUser(req);
  if (!user) {
    sendJson(res, 401, { error: "Authentication required." });
    return null;
  }
  return user;
}

function orderItemsFromRequest(items, products) {
  const productMap = new Map(products.map((product) => [product.id, product]));
  return (Array.isArray(items) ? items : []).map((item) => {
    const product = productMap.get(item.productId || item.id);
    if (!product) return null;
    const quantity = Math.max(1, Math.floor(Number(item.quantity) || 1));
    return {
      productId: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      image: product.image,
      quantity,
    };
  }).filter(Boolean);
}

function totalForItems(items) {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shipping = items.length ? 85 : 0;
  return { subtotal, shipping, total: subtotal + shipping };
}

async function createStripeCheckoutSession(order, req) {
  if (!process.env.STRIPE_SECRET_KEY) return null;

  const successUrl = `${baseUrl}/index.html#order-success`;
  const cancelUrl = `${baseUrl}/index.html#cart`;
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  params.set("customer_email", order.email);
  params.set("metadata[order_id]", order.id);

  order.items.forEach((item, index) => {
    params.set(`line_items[${index}][quantity]`, String(item.quantity));
    params.set(`line_items[${index}][price_data][currency]`, item.currency);
    params.set(`line_items[${index}][price_data][unit_amount]`, String(Math.round(item.price * 100)));
    params.set(`line_items[${index}][price_data][product_data][name]`, item.name);
    params.set(`line_items[${index}][price_data][product_data][images][0]`, new URL(item.image, baseUrl).href);
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const payload = await response.json();
  if (!response.ok) {
    throw new Error(payload.error?.message || "Stripe Checkout session failed.");
  }
  return payload;
}

async function handleApi(req, res, pathname) {
  const products = await readJson(productsPath, []);

  if (req.method === "GET" && pathname === "/api/health") {
    sendJson(res, 200, { ok: true, service: "silent-commerce-api", storage: db.type });
    return;
  }

  if (req.method === "GET" && pathname === "/api/products") {
    sendJson(res, 200, { products });
    return;
  }

  if (req.method === "GET" && pathname.startsWith("/api/products/")) {
    const id = decodeURIComponent(pathname.split("/").pop());
    const product = products.find((item) => item.id === id || item.slug === id);
    sendJson(res, product ? 200 : 404, product ? { product } : { error: "Product not found." });
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/register") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const password = String(body.password || "");
    if (!email || password.length < 6) {
      sendJson(res, 400, { error: "A valid email and password with at least 6 characters are required." });
      return;
    }
    if (await db.findUserByEmail(email)) {
      sendJson(res, 409, { error: "This email is already registered." });
      return;
    }
    const user = {
      id: crypto.randomUUID(),
      email,
      passwordHash: hashPassword(password),
      createdAt: new Date().toISOString(),
    };
    await db.createUser(user);
    sendJson(res, 201, { user: publicUser(user), token: signToken(user.id) });
    return;
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readBody(req);
    const email = normalizeEmail(body.email);
    const user = await db.findUserByEmail(email);
    if (!user || !verifyPassword(body.password, user.passwordHash)) {
      sendJson(res, 401, { error: "Email or password is incorrect." });
      return;
    }
    sendJson(res, 200, { user: publicUser(user), token: signToken(user.id) });
    return;
  }

  if (req.method === "GET" && pathname === "/api/me") {
    const user = await requireUser(req, res);
    if (user) sendJson(res, 200, { user: publicUser(user) });
    return;
  }

  if (pathname === "/api/cart") {
    const user = await requireUser(req, res);
    if (!user) return;
    if (req.method === "GET") {
      sendJson(res, 200, { items: await db.getCart(user.id) });
      return;
    }
    if (req.method === "POST") {
      const body = await readBody(req);
      const product = products.find((item) => item.id === body.productId);
      if (!product) {
        sendJson(res, 404, { error: "Product not found." });
        return;
      }
      const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1));
      sendJson(res, 200, { items: await db.addCartItem(user.id, product.id, quantity) });
      return;
    }
  }

  if (pathname.startsWith("/api/cart/")) {
    const user = await requireUser(req, res);
    if (!user) return;
    const productId = decodeURIComponent(pathname.split("/").pop());
    if (req.method === "PATCH") {
      const body = await readBody(req);
      const items = await db.updateCartItem(user.id, productId, Math.max(1, Math.floor(Number(body.quantity) || 1)));
      if (!items) {
        sendJson(res, 404, { error: "Cart item not found." });
        return;
      }
      sendJson(res, 200, { items });
      return;
    }
    if (req.method === "DELETE") {
      sendJson(res, 200, { items: await db.deleteCartItem(user.id, productId) });
      return;
    }
  }

  if (req.method === "GET" && pathname === "/api/orders") {
    const user = await requireUser(req, res);
    if (!user) return;
    sendJson(res, 200, { orders: await db.listOrdersForUser(user.id) });
    return;
  }

  if ((req.method === "POST" && pathname === "/api/orders") || (req.method === "POST" && pathname === "/api/payments/create-checkout-session")) {
    const user = await currentUser(req);
    const body = await readBody(req);
    const items = orderItemsFromRequest(body.items, products);
    if (!items.length) {
      sendJson(res, 400, { error: "Order needs at least one valid item." });
      return;
    }
    const totals = totalForItems(items);
    const order = {
      id: `SL-${Date.now().toString().slice(-6)}`,
      userId: user?.id || null,
      email: normalizeEmail(body.email || user?.email),
      country: String(body.country || ""),
      address: String(body.address || ""),
      paymentProvider: pathname.includes("payments") ? "stripe" : String(body.payment || "manual"),
      status: pathname.includes("payments") && process.env.STRIPE_SECRET_KEY ? "pending_payment" : "demo_received",
      items,
      ...totals,
      createdAt: new Date().toISOString(),
    };
    const savedOrder = await db.createOrder(order);
    if (user) await db.clearCart(user.id);

    if (pathname.includes("payments")) {
      try {
        const session = await createStripeCheckoutSession(savedOrder, req);
        if (session) {
          const updatedOrder = await db.updateOrderStripeSession(savedOrder.id, session.id);
          sendJson(res, 200, { order: updatedOrder || savedOrder, checkoutUrl: session.url, stripeSessionId: session.id });
          return;
        }
      } catch (error) {
        sendJson(res, 502, { error: error.message, order: savedOrder });
        return;
      }
    }

    sendJson(res, 201, { order: savedOrder, checkoutUrl: null });
    return;
  }

  if (req.method === "POST" && pathname === "/api/payments/webhook") {
    const body = await readBody(req);
    await db.recordStripeEvent(body);
    sendJson(res, 200, { received: true });
    return;
  }

  sendJson(res, 404, { error: "API route not found." });
}

async function serveStatic(req, res, pathname) {
  const safePath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.normalize(path.join(rootDir, decodeURIComponent(safePath)));
  if (!filePath.startsWith(rootDir)) {
    res.writeHead(403);
    res.end("Forbidden");
    return;
  }
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    res.end(data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) {
      await handleApi(req, res, url.pathname);
      return;
    }
    await serveStatic(req, res, url.pathname);
  } catch (error) {
    sendJson(res, 500, { error: error.message || "Server error." });
  }
});

server.listen(port, host, () => {
  console.log(`Silent commerce server running at ${baseUrl}`);
});
