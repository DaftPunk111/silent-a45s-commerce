const controls = document.querySelectorAll(".slide-control");
const stage = document.querySelector("[data-slide-stage]");
const frame = document.querySelector(".figma-frame");
const slideArts = document.querySelectorAll("[data-slide-art]");
const leftDrawer = document.querySelector("[data-left-drawer]");
const rightDrawer = document.querySelector("[data-right-drawer]");
const cartDrawer = document.querySelector("[data-cart-drawer]");
const backdrop = document.querySelector("[data-backdrop]");
const submenuButtons = document.querySelectorAll("[data-submenu]");
const secondaryPanels = document.querySelectorAll("[data-secondary-panel]");
const slideCaption = document.querySelector("[data-slide-caption]");
const views = document.querySelectorAll("[data-view]");
const readMoreButton = document.querySelector("[data-read-more]");
const homeButton = document.querySelector("[data-home]");
const backButton = document.querySelector("[data-page-back]");
const productTrack = document.querySelector("[data-product-track]");
const productPositionButtons = document.querySelectorAll("[data-product-index]");
const extremeTrack = document.querySelector("[data-extreme-track]");
const extremePositionButtons = document.querySelectorAll("[data-extreme-index]");
const quantityInput = document.querySelector("[data-quantity]");
const productFeedback = document.querySelector("[data-product-feedback]");
const cartCount = document.querySelector("[data-cart-count]");
const emptyCart = document.querySelector("[data-empty-cart]");
const cartItems = document.querySelector("[data-cart-items]");
const cartSummary = document.querySelector("[data-cart-summary]");
const cartSubtotal = document.querySelector("[data-cart-subtotal]");
const cartShipping = document.querySelector("[data-cart-shipping]");
const cartTotal = document.querySelector("[data-cart-total]");
const checkoutForm = document.querySelector("[data-checkout-form]");
const checkoutEmail = document.querySelector("[data-checkout-email]");
const checkoutCountry = document.querySelector("[data-checkout-country]");
const checkoutStatus = document.querySelector("[data-checkout-status]");
const orderConfirmation = document.querySelector("[data-order-confirmation]");
const orderMessage = document.querySelector("[data-order-message]");
const accountForm = document.querySelector("[data-account-form]");
const accountTabs = document.querySelectorAll("[data-account-mode]");
const accountHeading = document.querySelector("[data-account-heading]");
const accountSubmit = document.querySelector("[data-account-submit]");
const accountEmail = document.querySelector("[data-account-email]");
const accountPassword = document.querySelector("[data-account-password]");
const accountConfirm = document.querySelector("[data-account-confirm]");
const registerOnly = document.querySelector("[data-register-only]");
const accountStatus = document.querySelector("[data-account-status]");
const accountSession = document.querySelector("[data-account-session]");
const accountCurrent = document.querySelector("[data-account-current]");
const captions = [
  "",
  "SOURCE OF INSPIRATION.",
  "FOCUS ON PERFORMANCE.",
  "EXTREME PROCESS.",
];
let activeSlide = 0;
let autoplayTimer;
let touchStartX = 0;
let currentView = "home";
let transitionTimer;
let activeProduct = 0;
let activeExtremePage = 0;
let cartQuantity = 0;
let currentExtremeProduct = "dashboard";
let accountMode = "login";
let currentAccount = "";
let viewHistory = [];
const cartProducts = new Map();
const PRODUCT_PRICE = 1500;
const SHIPPING_PRICE = 85;
const STORAGE_KEYS = {
  users: "silent-demo-users",
  account: "silent-demo-account",
  token: "silent-api-token",
  orders: "silent-demo-orders",
};
const extremeProducts = {
  dashboard: {
    title: "Dashboard Trim Panel",
    main: "web-assets/products/dashboard-1-1.png",
    thumbnails: [
      "web-assets/products/dashboard-1-2.png",
      "web-assets/products/dashboard-1-3.jpg",
    ],
    installation: {
      type: "composition",
      main: "web-assets/products/dashboard-2-1.jpg",
      inset: "web-assets/products/dashboard-2-2.jpg",
    },
    description: [
      "Our Carbon Fiber Dashboard Trim Panel boasts factory - level precision. Replacing the original trim, it seamlessly blends with the interior, delivering a harmonious and premium look, upgrading your cockpit style effortlessly.",
    ],
  },
  storage: {
    title: "Central Control Storage Compartment Trim Panel",
    main: "web-assets/products/storage-1-1.png",
    thumbnails: [
      "web-assets/products/storage-1-2.png",
      "web-assets/products/storage-1-3.png",
      "web-assets/products/storage-1-4.png",
    ],
    installation: {
      type: "composition",
      main: "web-assets/products/storage-2-1.jpg",
      inset: "web-assets/products/storage-2-2.jpg",
    },
    description: [
      "Our Carbon Fiber Central Control Storage Compartment Trim Panel is meticulously crafted from high - quality carbon fiber. Replacing the original panel, it instantly elevates the interior texture to a whole new level. It creates a more immersive and stylish atmosphere for the driving cockpit, turning every touch into an advanced exploration of a refined driving experience.",
    ],
  },
  outlet: {
    title: "Outlet Decorative Panel",
    main: "web-assets/products/outlet-1-1.png",
    thumbnails: [
      "web-assets/products/outlet-1-2.png",
      "web-assets/products/outlet-1-4.png",
    ],
    installation: {
      type: "composition",
      main: "web-assets/products/outlet-2-1.jpg",
      inset: "web-assets/products/outlet-2-2.jpg",
    },
    description: [
      "Elevate your interior style! Our Carbon Fiber Air Outlet Decorative Panel Set is designed to replace the original high - gloss painted panels. Crafted from premium carbon fiber, it not only infuses unique personality into the cabin but also creates a strikingly dynamic driving atmosphere. Make every drive a showcase of your exclusive style, and redefine the cockpit aesthetics with hardcore texture.",
    ],
  },
  wiper: {
    title: "Wiper Removal Kit",
    main: "web-assets/products/wiper-1-1.png",
    thumbnails: ["web-assets/products/wiper-1-3.png"],
    installation: {
      type: "annotated",
      images: [
        {
          src: "web-assets/products/wiper-2-1.jpg",
          caption: "Light-colored matte carbon fiber surface",
        },
        {
          src: "web-assets/products/wiper-4-1.png",
          caption: "Dark matte carbon fiber surface",
        },
      ],
    },
    description: [
      "Introducing our Wiper Removal Kit tailored for W177 A35/45 models, crafted to elevate your vehicle’s aesthetics:",
      "• Aesthetic Upgrade: Eliminate the wiper for a cleaner, sleeker rear windshield line, enhancing the vehicle’s refined look and creating a unique appearance.",
      "• Premium Material: Made from high - quality carbon fiber, it’s lightweight yet strong, durable and exuding a sense of luxury.",
      "• Precise Fit: With high - precision design, it perfectly matches the rear windshield. Once installed, it fits snugly, maximizing the premium feel.",
      "It helps take your vehicle’s exterior to the next level, ditching the wiper’s bulk and reshaping a neat, sharp style.",
    ],
  },
};

function showSlide(index) {
  activeSlide = (index + controls.length) % controls.length;
  controls.forEach((item) => {
    item.classList.toggle("active", Number(item.dataset.slide) === activeSlide);
  });
  slideArts.forEach((art) => {
    art.classList.toggle("active", Number(art.dataset.slideArt) === activeSlide);
  });
  frame.classList.toggle("has-art", activeSlide > 0);
  slideCaption.textContent = captions[activeSlide];

  if (activeSlide === 0) {
    stage.classList.add("is-changing");
    window.setTimeout(() => {
      stage.classList.remove("is-changing");
    }, 180);
  }
}

function startAutoplay() {
  window.clearInterval(autoplayTimer);
  autoplayTimer = window.setInterval(() => {
    if (!leftDrawer.classList.contains("open") && !rightDrawer.classList.contains("open")) {
      showSlide(activeSlide + 1);
    }
  }, 6500);
}

function updateGlassVisibility() {
  document.body.classList.toggle("glass-visible", window.scrollY > 8);
}

function hashForView(name) {
  return {
    studio: "silent-studio",
    brand: "brand-story",
    catalog: "performance-products",
    product: "gt3-specification-hood",
    "extreme-catalog": "extreme-process-products",
    "extreme-product": currentExtremeProduct,
  }[name] || "";
}

function updateHashForView(name) {
  const hash = hashForView(name);
  if (hash) {
    window.location.hash = hash;
    return;
  }
  window.history.replaceState(null, "", window.location.pathname + window.location.search);
}

function showView(name, options = {}) {
  if (name === currentView) return;

  const shouldTrackHistory = options.trackHistory !== false;
  if (shouldTrackHistory) {
    viewHistory.push(currentView);
  }
  if (name === "home") {
    viewHistory = [];
  }

  window.clearTimeout(transitionTimer);
  const outgoingView = document.querySelector(`[data-view="${currentView}"]`);
  const incomingView = document.querySelector(`[data-view="${name}"]`);

  outgoingView.classList.add("view-leaving");
  incomingView.hidden = false;
  incomingView.classList.add("view-entering");

  window.requestAnimationFrame(() => {
    window.requestAnimationFrame(() => {
      incomingView.classList.remove("view-entering");
    });
  });

  transitionTimer = window.setTimeout(() => {
    outgoingView.hidden = true;
    outgoingView.classList.remove("view-leaving");
  }, 520);

  currentView = name;
  document.body.classList.toggle("home-mode", name === "home");
  document.body.classList.toggle("brand-mode", name === "brand");
  document.body.classList.toggle(
    "content-mode",
    name === "product" || name === "extreme-product" || name === "extreme-catalog"
  );
  backButton.hidden = name === "home";
  window.scrollTo({ top: 0, behavior: "auto" });
  updateGlassVisibility();

  if (name === "home") {
    startAutoplay();
  } else {
    window.clearInterval(autoplayTimer);
  }
}

controls.forEach((control) => {
  control.addEventListener("click", () => {
    showSlide(Number(control.dataset.slide));
    startAutoplay();
  });
});

function closeDrawers() {
  leftDrawer.classList.remove("open", "secondary-open");
  rightDrawer.classList.remove("open");
  cartDrawer.classList.remove("open");
  backdrop.classList.remove("open");
  leftDrawer.setAttribute("aria-hidden", "true");
  rightDrawer.setAttribute("aria-hidden", "true");
  cartDrawer.setAttribute("aria-hidden", "true");
  submenuButtons.forEach((button) => button.classList.remove("active"));
  secondaryPanels.forEach((panel) => panel.classList.remove("active"));
}

function openDrawer(drawer) {
  closeDrawers();
  drawer.classList.add("open");
  drawer.setAttribute("aria-hidden", "false");
  backdrop.classList.add("open");
}

document.querySelector("[data-open-left]").addEventListener("click", () => {
  openDrawer(leftDrawer);
});

document.querySelector("[data-open-right]").addEventListener("click", () => {
  openDrawer(rightDrawer);
});

document.querySelector("[data-open-cart]").addEventListener("click", () => {
  openDrawer(cartDrawer);
});

document.querySelectorAll("[data-close-drawers]").forEach((button) => {
  button.addEventListener("click", closeDrawers);
});

backdrop.addEventListener("click", closeDrawers);

submenuButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.submenu;
    const isCurrent = button.classList.contains("active");

    submenuButtons.forEach((item) => item.classList.remove("active"));
    secondaryPanels.forEach((panel) => panel.classList.remove("active"));

    if (isCurrent) {
      leftDrawer.classList.remove("secondary-open");
      return;
    }

    button.classList.add("active");
    document.querySelector(`[data-secondary-panel="${name}"]`).classList.add("active");
    leftDrawer.classList.add("secondary-open");
  });
});

document.querySelectorAll("[data-left-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    openDrawer(leftDrawer);
    const target = document.querySelector(`[data-submenu="${link.dataset.leftLink}"]`);
    target.click();
  });
});

function formatMoney(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(value);
}

function storedUsers() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.users)) || {};
  } catch {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEYS.users, JSON.stringify(users));
}

async function apiRequest(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = localStorage.getItem(STORAGE_KEYS.token);
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers,
    });
  } catch (error) {
    error.isNetworkError = true;
    throw error;
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || "API request failed.");
    error.status = response.status;
    throw error;
  }
  return payload;
}

function localAccountSubmit(email, password) {
  const users = storedUsers();

  if (accountMode === "register") {
    if (password !== accountConfirm.value) {
      accountStatus.textContent = "Passwords do not match.";
      return false;
    }
    if (users[email]) {
      accountStatus.textContent = "This email is already registered.";
      return false;
    }
    users[email] = { password };
    saveUsers(users);
    accountStatus.textContent = "Account created. You are signed in.";
  } else if (!users[email] || users[email].password !== password) {
    accountStatus.textContent = "Email or password is incorrect.";
    return false;
  }

  currentAccount = email;
  localStorage.setItem(STORAGE_KEYS.account, currentAccount);
  accountForm.reset();
  updateAccountUI();
  return true;
}

function setAccountMode(mode) {
  accountMode = mode;
  accountTabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.accountMode === mode);
  });
  accountHeading.textContent = mode === "login" ? "LOG IN" : "REGISTER";
  accountSubmit.textContent = mode === "login" ? "LOG IN" : "CREATE ACCOUNT";
  registerOnly.hidden = mode === "login";
  accountConfirm.required = mode === "register";
  accountPassword.autocomplete = mode === "login" ? "current-password" : "new-password";
  accountStatus.textContent = "";
}

function updateAccountUI() {
  const signedIn = Boolean(currentAccount);
  accountForm.hidden = signedIn;
  accountSession.hidden = !signedIn;
  accountCurrent.textContent = currentAccount;
  if (signedIn) {
    checkoutEmail.value = currentAccount;
  }
}

async function restoreBackendSession() {
  if (!localStorage.getItem(STORAGE_KEYS.token)) return;
  try {
    const payload = await apiRequest("/api/me");
    currentAccount = payload.user.email;
    localStorage.setItem(STORAGE_KEYS.account, currentAccount);
    updateAccountUI();
  } catch {
    localStorage.removeItem(STORAGE_KEYS.token);
  }
}

accountTabs.forEach((button) => {
  button.addEventListener("click", () => setAccountMode(button.dataset.accountMode));
});

accountForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const email = accountEmail.value.trim().toLowerCase();
  const password = accountPassword.value;

  if (accountMode === "register" && password !== accountConfirm.value) {
    accountStatus.textContent = "Passwords do not match.";
    return;
  }

  accountSubmit.disabled = true;
  accountStatus.textContent = "Connecting...";
  try {
    const payload = await apiRequest(`/api/auth/${accountMode === "register" ? "register" : "login"}`, {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    currentAccount = payload.user.email;
    localStorage.setItem(STORAGE_KEYS.account, currentAccount);
    localStorage.setItem(STORAGE_KEYS.token, payload.token);
    accountForm.reset();
    accountStatus.textContent = accountMode === "register" ? "Account created. You are signed in." : "";
    updateAccountUI();
  } catch (error) {
    if (error.isNetworkError) {
      localAccountSubmit(email, password);
    } else {
      accountStatus.textContent = error.message;
    }
  } finally {
    accountSubmit.disabled = false;
  }
});

document.querySelector("[data-account-logout]").addEventListener("click", () => {
  currentAccount = "";
  localStorage.removeItem(STORAGE_KEYS.account);
  localStorage.removeItem(STORAGE_KEYS.token);
  setAccountMode("login");
  updateAccountUI();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeDrawers();
  }
  if (event.key === "ArrowLeft" && currentView === "home") {
    showSlide(activeSlide - 1);
    startAutoplay();
  }
  if (event.key === "ArrowRight" && currentView === "home") {
    showSlide(activeSlide + 1);
    startAutoplay();
  }
});

frame.addEventListener("touchstart", (event) => {
  touchStartX = event.changedTouches[0].clientX;
}, { passive: true });

frame.addEventListener("touchend", (event) => {
  const distance = event.changedTouches[0].clientX - touchStartX;
  if (Math.abs(distance) < 45) return;
  if (currentView === "home") {
    showSlide(activeSlide + (distance < 0 ? 1 : -1));
    startAutoplay();
  }
  if (currentView === "catalog") {
    showProduct(activeProduct + (distance < 0 ? 1 : -1));
  }
  if (currentView === "extreme-catalog") {
    showExtremePage(activeExtremePage + (distance < 0 ? 1 : -1));
  }
}, { passive: true });

document.querySelector("[data-discover]").addEventListener("click", (event) => {
  event.preventDefault();
  if (activeSlide === 1) {
    showView("studio");
    window.location.hash = "silent-studio";
    return;
  }
  if (activeSlide === 2) {
    showView("catalog");
    showProduct(0);
    window.location.hash = "performance-products";
    return;
  }
  if (activeSlide === 3) {
    showView("extreme-catalog");
    showExtremePage(0);
    window.location.hash = "extreme-process-products";
    return;
  }
  window.location.hash = `discover-${activeSlide + 1}`;
});

readMoreButton.addEventListener("click", () => {
  showView("brand");
  window.location.hash = "brand-story";
});

homeButton.addEventListener("click", () => {
  closeDrawers();
  showView("home", { trackHistory: false });
  updateHashForView("home");
});

backButton.addEventListener("click", () => {
  const fallbackView = {
    brand: "studio",
    studio: "home",
    product: "catalog",
    catalog: "home",
    "extreme-product": "extreme-catalog",
    "extreme-catalog": "home",
  }[currentView] || "home";
  const previousView = viewHistory.pop() || fallbackView;
  closeDrawers();
  showView(previousView, { trackHistory: false });
  updateHashForView(previousView);
});

function showProduct(index) {
  const itemCount = productTrack.querySelectorAll(".product-choice").length;
  const itemsPerPage = window.matchMedia("(min-width: 761px) and (max-width: 980px)").matches ? 2 : 1;
  const pageCount = Math.ceil(itemCount / itemsPerPage);
  activeProduct = Math.max(0, Math.min(pageCount - 1, index));
  productTrack.style.transform = `translateX(-${activeProduct * 100}vw)`;
  productPositionButtons.forEach((button) => {
    const buttonIndex = Number(button.dataset.productIndex);
    button.hidden = buttonIndex >= pageCount;
    button.classList.toggle("active", buttonIndex === activeProduct);
  });
}

document.querySelector("[data-product-previous]").addEventListener("click", () => {
  showProduct(activeProduct - 1);
});

document.querySelector("[data-product-next]").addEventListener("click", () => {
  showProduct(activeProduct + 1);
});

productPositionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    showProduct(Number(button.dataset.productIndex));
  });
});

document.querySelector(".performance-catalog").addEventListener("wheel", (event) => {
  if (Math.abs(event.deltaY) < 15 && Math.abs(event.deltaX) < 15) return;
  event.preventDefault();
  showProduct(activeProduct + ((event.deltaY || event.deltaX) > 0 ? 1 : -1));
}, { passive: false });

function showExtremePage(index) {
  const pageCount = window.matchMedia("(max-width: 760px)").matches ? 4 : 2;
  activeExtremePage = Math.max(0, Math.min(pageCount - 1, index));
  extremeTrack.style.transform = `translateX(-${activeExtremePage * 100}vw)`;
  extremePositionButtons.forEach((button) => {
    const buttonIndex = Number(button.dataset.extremeIndex);
    button.hidden = buttonIndex >= pageCount;
    button.classList.toggle("active", buttonIndex === activeExtremePage);
  });
}

document.querySelector("[data-extreme-previous]").addEventListener("click", () => {
  showExtremePage(activeExtremePage - 1);
});

document.querySelector("[data-extreme-next]").addEventListener("click", () => {
  showExtremePage(activeExtremePage + 1);
});

extremePositionButtons.forEach((button) => {
  button.addEventListener("click", () => showExtremePage(Number(button.dataset.extremeIndex)));
});

document.querySelector(".extreme-catalog").addEventListener("wheel", (event) => {
  if (window.innerWidth <= 760) return;
  if (Math.abs(event.deltaY) < 15 && Math.abs(event.deltaX) < 15) return;
  event.preventDefault();
  showExtremePage(activeExtremePage + ((event.deltaY || event.deltaX) > 0 ? 1 : -1));
}, { passive: false });

document.querySelector("[data-order-gt3]").addEventListener("click", () => {
  showView("product");
  window.location.hash = "gt3-specification-hood";
});

document.querySelectorAll(".product-detail-view [data-gallery-image]").forEach((button) => {
  button.addEventListener("click", () => {
    button.closest(".product-gallery").querySelector(".product-main-image img").src = button.dataset.galleryImage;
    button.closest(".product-thumbnails").querySelectorAll("[data-gallery-image]").forEach((item) => {
      item.classList.toggle("active", item === button);
    });
  });
});

function selectedQuantity() {
  const quantity = Math.max(1, Math.floor(Number(quantityInput.value) || 1));
  quantityInput.value = quantity;
  return quantity;
}

quantityInput.addEventListener("change", selectedQuantity);
quantityInput.addEventListener("blur", selectedQuantity);

function renderCart() {
  cartItems.innerHTML = "";
  let subtotal = 0;
  cartProducts.forEach((item, key) => {
    subtotal += item.quantity * PRODUCT_PRICE;
    const element = document.createElement("div");
    element.className = "cart-item";
    element.innerHTML = `
      <img src="${item.image}" alt="${item.title}" />
      <div>
        <h3>${item.title}</h3>
        <p>${formatMoney(PRODUCT_PRICE)}</p>
        <label class="cart-quantity">
          <span>Quantity</span>
          <input type="number" min="1" step="1" value="${item.quantity}" data-cart-quantity="${key}" />
        </label>
        <button class="cart-remove" type="button" data-cart-remove="${key}">REMOVE</button>
      </div>
    `;
    cartItems.appendChild(element);
  });
  const hasItems = cartProducts.size > 0;
  const shipping = hasItems ? SHIPPING_PRICE : 0;
  emptyCart.hidden = hasItems;
  cartSummary.hidden = !hasItems;
  checkoutForm.hidden = true;
  orderConfirmation.hidden = true;
  cartSubtotal.textContent = formatMoney(subtotal);
  cartShipping.textContent = formatMoney(shipping);
  cartTotal.textContent = formatMoney(subtotal + shipping);
  cartItems.querySelectorAll("[data-cart-quantity]").forEach((input) => {
    input.addEventListener("change", () => {
      const key = input.dataset.cartQuantity;
      const item = cartProducts.get(key);
      const quantity = Math.max(1, Math.floor(Number(input.value) || 1));
      item.quantity = quantity;
      cartQuantity = [...cartProducts.values()].reduce((sum, product) => sum + product.quantity, 0);
      cartCount.textContent = cartQuantity;
      renderCart();
    });
  });
  cartItems.querySelectorAll("[data-cart-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      cartProducts.delete(button.dataset.cartRemove);
      cartQuantity = [...cartProducts.values()].reduce((sum, product) => sum + product.quantity, 0);
      cartCount.textContent = cartQuantity;
      cartCount.hidden = cartQuantity === 0;
      renderCart();
    });
  });
}

function addProduct(productKey, title, image, quantity, message, feedbackElement) {
  const existing = cartProducts.get(productKey);
  cartProducts.set(productKey, {
    title,
    image,
    quantity: (existing?.quantity || 0) + quantity,
  });
  cartQuantity += quantity;
  cartCount.textContent = cartQuantity;
  cartCount.hidden = false;
  feedbackElement.textContent = message;
  renderCart();
}

document.querySelector("[data-start-checkout]").addEventListener("click", () => {
  if (!cartProducts.size) return;
  cartSummary.hidden = true;
  orderConfirmation.hidden = true;
  checkoutForm.hidden = false;
  checkoutStatus.textContent = "";
  if (currentAccount) {
    checkoutEmail.value = currentAccount;
  }
});

document.querySelectorAll('input[name="payment"]').forEach((input) => {
  input.addEventListener("change", () => {
    document.querySelector("[data-card-fields]").hidden = input.value !== "Card";
  });
});

checkoutForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!cartProducts.size) {
    checkoutStatus.textContent = "Your cart is empty.";
    return;
  }
  const payment = document.querySelector('input[name="payment"]:checked').value;
  const orderItems = [...cartProducts.entries()].map(([productId, item]) => ({
    productId,
    quantity: item.quantity,
  }));
  checkoutStatus.textContent = "Creating secure checkout...";
  try {
    const payload = await apiRequest("/api/payments/create-checkout-session", {
      method: "POST",
      body: JSON.stringify({
        email: checkoutEmail.value.trim(),
        country: checkoutCountry.value,
        address: document.querySelector("[data-checkout-address]").value.trim(),
        payment,
        items: orderItems,
      }),
    });
    if (payload.checkoutUrl) {
      window.location.href = payload.checkoutUrl;
      return;
    }
    cartProducts.clear();
    cartQuantity = 0;
    cartCount.hidden = true;
    cartItems.innerHTML = "";
    emptyCart.hidden = true;
    cartSummary.hidden = true;
    checkoutForm.hidden = true;
    orderConfirmation.hidden = false;
    orderMessage.textContent = `Order ${payload.order.id} is saved in the backend demo checkout. Add a Stripe test key to redirect customers to hosted payment.`;
    return;
  } catch (error) {
    if (!error.isNetworkError) {
      checkoutStatus.textContent = error.message;
      return;
    }
  }

  const orderNumber = `SL-${Date.now().toString().slice(-6)}`;
  const order = {
    orderNumber,
    email: checkoutEmail.value.trim(),
    country: checkoutCountry.value,
    payment,
    items: [...cartProducts.values()],
    createdAt: new Date().toISOString(),
  };
  const orders = JSON.parse(localStorage.getItem(STORAGE_KEYS.orders) || "[]");
  orders.unshift(order);
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(orders.slice(0, 12)));
  cartProducts.clear();
  cartQuantity = 0;
  cartCount.hidden = true;
  cartItems.innerHTML = "";
  emptyCart.hidden = true;
  cartSummary.hidden = true;
  checkoutForm.hidden = true;
  orderConfirmation.hidden = false;
  orderMessage.textContent = `Order ${orderNumber} is ready for ${payment}. This is a front-end demo checkout; a live payment gateway can be connected later.`;
});

document.querySelector("[data-new-order]").addEventListener("click", () => {
  closeDrawers();
  orderConfirmation.hidden = true;
  emptyCart.hidden = false;
  checkoutForm.reset();
});

document.querySelector("[data-add-cart]").addEventListener("click", () => {
  addProduct("gt3", "GT3 Specification Hood", "web-assets/products/hood-1-5.png", selectedQuantity(), "Added to shopping cart.", productFeedback);
});

document.querySelector("[data-add-wishlist]").addEventListener("click", () => {
  addProduct("gt3", "GT3 Specification Hood", "web-assets/products/hood-1-5.png", selectedQuantity(), "Added to wish list and available in your cart.", productFeedback);
});

function loadExtremeProduct(key, options = {}) {
  currentExtremeProduct = key;
  const product = extremeProducts[key];
  const main = document.querySelector("[data-extreme-main]");
  const thumbnails = document.querySelector("[data-extreme-thumbnails]");
  document.querySelector("[data-extreme-title]").textContent = product.title;
  main.src = product.main;
  main.alt = product.title;
  thumbnails.innerHTML = [product.main, ...product.thumbnails].slice(0, 3).map((image, index) => `
    <button class="${index === 0 ? "active" : ""}" type="button" data-extreme-gallery="${image}">
      <img src="${image}" alt="${product.title} detail ${index + 1}" />
    </button>
  `).join("");
  thumbnails.querySelectorAll("[data-extreme-gallery]").forEach((button) => {
    button.addEventListener("click", () => {
      main.src = button.dataset.extremeGallery;
      thumbnails.querySelectorAll("button").forEach((item) => item.classList.toggle("active", item === button));
    });
  });
  document.querySelector("[data-extreme-description]").innerHTML = product.description.map((text) => `<p>${text}</p>`).join("");
  const installation = document.querySelector("[data-extreme-installation]");
  if (product.installation.type === "composition") {
    installation.className = `extreme-installation installation-composition installation-${key}`;
    installation.innerHTML = `
      <img class="installation-main" src="${product.installation.main}" alt="${product.title} installed view" />
      <img class="installation-inset" src="${product.installation.inset}" alt="${product.title} detail view" />
    `;
  } else {
    installation.className = "extreme-installation installation-annotated";
    installation.innerHTML = product.installation.images.map((image) => `
      <figure class="annotated-product-image">
        <figcaption>${image.caption}</figcaption>
        <img src="${image.src}" alt="${product.title}, ${image.caption}" />
      </figure>
    `).join("");
  }
  document.querySelector("[data-extreme-quantity]").value = 1;
  document.querySelector("[data-extreme-feedback]").textContent = "";
  showView("extreme-product", options);
  window.location.hash = key;
}

document.querySelectorAll("[data-extreme-order]").forEach((button) => {
  button.addEventListener("click", () => loadExtremeProduct(button.dataset.extremeOrder));
});

function extremeQuantity() {
  const input = document.querySelector("[data-extreme-quantity]");
  const quantity = Math.max(1, Math.floor(Number(input.value) || 1));
  input.value = quantity;
  return quantity;
}

document.querySelector("[data-extreme-quantity]").addEventListener("change", extremeQuantity);
document.querySelector("[data-extreme-quantity]").addEventListener("blur", extremeQuantity);

document.querySelector("[data-extreme-add-cart]").addEventListener("click", () => {
  const product = extremeProducts[currentExtremeProduct];
  addProduct(currentExtremeProduct, product.title, product.main, extremeQuantity(), "Added to shopping cart.", document.querySelector("[data-extreme-feedback]"));
});

document.querySelector("[data-extreme-add-wishlist]").addEventListener("click", () => {
  const product = extremeProducts[currentExtremeProduct];
  addProduct(currentExtremeProduct, product.title, product.main, extremeQuantity(), "Added to wish list and available in your cart.", document.querySelector("[data-extreme-feedback]"));
});

function openInitialHash() {
  const hash = window.location.hash.replace("#", "");
  if (!hash) {
    showView("home", { trackHistory: false });
    return;
  }

  if (hash === "silent-studio") {
    viewHistory = ["home"];
    showView("studio", { trackHistory: false });
    return;
  }
  if (hash === "brand-story") {
    viewHistory = ["home", "studio"];
    showView("brand", { trackHistory: false });
    return;
  }
  if (hash === "performance-products") {
    viewHistory = ["home"];
    showView("catalog", { trackHistory: false });
    showProduct(0);
    return;
  }
  if (hash === "gt3-specification-hood") {
    viewHistory = ["home", "catalog"];
    showView("product", { trackHistory: false });
    return;
  }
  if (hash === "extreme-process-products") {
    viewHistory = ["home"];
    showView("extreme-catalog", { trackHistory: false });
    showExtremePage(0);
    return;
  }
  if (extremeProducts[hash]) {
    viewHistory = ["home", "extreme-catalog"];
    loadExtremeProduct(hash, { trackHistory: false });
  }
}

window.addEventListener("hashchange", openInitialHash);
window.addEventListener("scroll", updateGlassVisibility, { passive: true });
window.addEventListener("resize", () => {
  showProduct(activeProduct);
  showExtremePage(activeExtremePage);
  updateGlassVisibility();
});

showSlide(0);
showProduct(0);
showExtremePage(0);
backButton.hidden = true;
currentAccount = localStorage.getItem(STORAGE_KEYS.account) || "";
setAccountMode("login");
updateAccountUI();
renderCart();
openInitialHash();
updateGlassVisibility();
restoreBackendSession();
startAutoplay();
