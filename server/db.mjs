import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";

const defaultStore = { users: [], carts: {}, orders: [], stripeEvents: [] };

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

function publicOrder(row) {
  return {
    id: row.id,
    userId: row.user_id ?? row.userId ?? null,
    email: row.email,
    country: row.country,
    address: row.address,
    paymentProvider: row.payment_provider ?? row.paymentProvider,
    status: row.status,
    items: row.items,
    subtotal: Number(row.subtotal),
    shipping: Number(row.shipping),
    total: Number(row.total),
    stripeSessionId: row.stripe_session_id ?? row.stripeSessionId ?? null,
    createdAt: row.created_at ?? row.createdAt,
  };
}

function publicUserRow(row) {
  return {
    id: row.id,
    email: row.email,
    passwordHash: row.password_hash ?? row.passwordHash,
    createdAt: row.created_at ?? row.createdAt,
  };
}

class JsonDatabase {
  constructor(dataPath) {
    this.type = "json";
    this.dataPath = dataPath;
  }

  async readStore() {
    return readJson(this.dataPath, defaultStore);
  }

  async writeStore(store) {
    await writeJson(this.dataPath, store);
  }

  async findUserByEmail(email) {
    const store = await this.readStore();
    return store.users.find((user) => user.email === email) || null;
  }

  async findUserById(id) {
    const store = await this.readStore();
    return store.users.find((user) => user.id === id) || null;
  }

  async createUser(user) {
    const store = await this.readStore();
    store.users.push(user);
    await this.writeStore(store);
    return user;
  }

  async getCart(userId) {
    const store = await this.readStore();
    return store.carts[userId] || [];
  }

  async addCartItem(userId, productId, quantity) {
    const store = await this.readStore();
    store.carts[userId] ||= [];
    const existing = store.carts[userId].find((item) => item.productId === productId);
    if (existing) existing.quantity += quantity;
    else store.carts[userId].push({ productId, quantity });
    await this.writeStore(store);
    return store.carts[userId];
  }

  async updateCartItem(userId, productId, quantity) {
    const store = await this.readStore();
    store.carts[userId] ||= [];
    const item = store.carts[userId].find((entry) => entry.productId === productId);
    if (!item) return null;
    item.quantity = quantity;
    await this.writeStore(store);
    return store.carts[userId];
  }

  async deleteCartItem(userId, productId) {
    const store = await this.readStore();
    store.carts[userId] = (store.carts[userId] || []).filter((item) => item.productId !== productId);
    await this.writeStore(store);
    return store.carts[userId];
  }

  async clearCart(userId) {
    const store = await this.readStore();
    store.carts[userId] = [];
    await this.writeStore(store);
  }

  async createOrder(order) {
    const store = await this.readStore();
    store.orders.unshift(order);
    await this.writeStore(store);
    return order;
  }

  async updateOrderStripeSession(orderId, stripeSessionId) {
    const store = await this.readStore();
    const order = store.orders.find((item) => item.id === orderId);
    if (order) order.stripeSessionId = stripeSessionId;
    await this.writeStore(store);
    return order || null;
  }

  async listOrdersForUser(userId) {
    const store = await this.readStore();
    return store.orders.filter((order) => order.userId === userId);
  }

  async recordStripeEvent(body) {
    const store = await this.readStore();
    const event = { id: crypto.randomUUID(), body, receivedAt: new Date().toISOString() };
    store.stripeEvents.unshift(event);
    await this.writeStore(store);
    return event;
  }
}

class PostgresDatabase {
  constructor(pool) {
    this.type = "postgres";
    this.pool = pool;
  }

  async findUserByEmail(email) {
    const result = await this.pool.query("select * from users where email = $1 limit 1", [email]);
    return result.rows[0] ? publicUserRow(result.rows[0]) : null;
  }

  async findUserById(id) {
    const result = await this.pool.query("select * from users where id = $1 limit 1", [id]);
    return result.rows[0] ? publicUserRow(result.rows[0]) : null;
  }

  async createUser(user) {
    const result = await this.pool.query(
      "insert into users (id, email, password_hash, created_at) values ($1, $2, $3, $4) returning *",
      [user.id, user.email, user.passwordHash, user.createdAt]
    );
    return publicUserRow(result.rows[0]);
  }

  async getCart(userId) {
    const result = await this.pool.query(
      "select product_id as \"productId\", quantity from cart_items where user_id = $1 order by created_at",
      [userId]
    );
    return result.rows;
  }

  async addCartItem(userId, productId, quantity) {
    await this.pool.query(
      `insert into cart_items (user_id, product_id, quantity)
       values ($1, $2, $3)
       on conflict (user_id, product_id)
       do update set quantity = cart_items.quantity + excluded.quantity, updated_at = now()`,
      [userId, productId, quantity]
    );
    return this.getCart(userId);
  }

  async updateCartItem(userId, productId, quantity) {
    const result = await this.pool.query(
      "update cart_items set quantity = $3, updated_at = now() where user_id = $1 and product_id = $2 returning product_id",
      [userId, productId, quantity]
    );
    if (!result.rowCount) return null;
    return this.getCart(userId);
  }

  async deleteCartItem(userId, productId) {
    await this.pool.query("delete from cart_items where user_id = $1 and product_id = $2", [userId, productId]);
    return this.getCart(userId);
  }

  async clearCart(userId) {
    await this.pool.query("delete from cart_items where user_id = $1", [userId]);
  }

  async createOrder(order) {
    const result = await this.pool.query(
      `insert into orders
        (id, user_id, email, country, address, payment_provider, status, items, subtotal, shipping, total, created_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8::jsonb, $9, $10, $11, $12)
       returning *`,
      [
        order.id,
        order.userId,
        order.email,
        order.country,
        order.address,
        order.paymentProvider,
        order.status,
        JSON.stringify(order.items),
        order.subtotal,
        order.shipping,
        order.total,
        order.createdAt,
      ]
    );
    return publicOrder(result.rows[0]);
  }

  async updateOrderStripeSession(orderId, stripeSessionId) {
    const result = await this.pool.query(
      "update orders set stripe_session_id = $2 where id = $1 returning *",
      [orderId, stripeSessionId]
    );
    return result.rows[0] ? publicOrder(result.rows[0]) : null;
  }

  async listOrdersForUser(userId) {
    const result = await this.pool.query("select * from orders where user_id = $1 order by created_at desc", [userId]);
    return result.rows.map(publicOrder);
  }

  async recordStripeEvent(body) {
    const result = await this.pool.query(
      "insert into stripe_events (id, payload, received_at) values ($1, $2::jsonb, $3) returning *",
      [crypto.randomUUID(), JSON.stringify(body), new Date().toISOString()]
    );
    return result.rows[0];
  }
}

export async function createDatabase({ dataPath, databaseUrl }) {
  if (!databaseUrl) {
    return new JsonDatabase(dataPath);
  }

  let pg;
  try {
    pg = await import("pg");
  } catch {
    throw new Error("DATABASE_URL is set, but the pg package is not installed. Run npm install first.");
  }
  const pool = new pg.Pool({
    connectionString: databaseUrl,
    ssl: process.env.DATABASE_SSL === "false" ? false : { rejectUnauthorized: false },
  });
  await pool.query("select 1");
  return new PostgresDatabase(pool);
}
