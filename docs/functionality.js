const STORAGE_KEY = "connect_marketplace_v1";

const seedData = {
  users: [],
  merchants: [
    { id: "m1", name: "Nova Retail", mobile: "9876543210", password: "merchant1", storeName: "Nova HyperStore" },
    { id: "m2", name: "Quantum Services", mobile: "9123456780", password: "merchant2", storeName: "Quantum Help Hub" }
  ],
  listings: [
    { id: "l1", merchantId: "m1", title: "NeoPods X", type: "Product", category: "Electronics", price: 2999, description: "Spatial audio earbuds with adaptive noise shield." },
    { id: "l2", merchantId: "m1", title: "Photon Desk Lamp", type: "Product", category: "Home", price: 1499, description: "Smart ambient lamp with holographic controls." },
    { id: "l3", merchantId: "m2", title: "Express Device Repair", type: "Service", category: "Repair", price: 799, description: "At-home diagnostics and same-day gadget repair." },
    { id: "l4", merchantId: "m2", title: "Cloud POS Setup", type: "Service", category: "Business", price: 3499, description: "Merchant-first billing, analytics and automation setup." }
  ]
};

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seedData));
    return structuredClone(seedData);
  }
  return JSON.parse(saved);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function makeId(prefix) {
  return `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

function showToast(message) {
  const toastArea = document.getElementById("toastArea");
  toastArea.innerHTML = `<div class="toast-note">${message}</div>`;
  setTimeout(() => {
    toastArea.innerHTML = "";
  }, 2500);
}

function merchantName(id) {
  const merchant = state.merchants.find((m) => m.id === id);
  return merchant ? merchant.name : "Unknown";
}

function merchantStore(id) {
  const merchant = state.merchants.find((m) => m.id === id);
  return merchant ? merchant.storeName : "N/A";
}

function renderStats() {
  document.getElementById("merchantCount").textContent = state.merchants.length;
  document.getElementById("listingCount").textContent = state.listings.length;
  document.getElementById("userCount").textContent = state.users.length;
  document.getElementById("serviceCount").textContent = state.listings.filter((item) => item.type === "Service").length;
}

function renderMerchantOptions() {
  const select = document.getElementById("merchantSelect");
  select.innerHTML = state.merchants
    .map((merchant) => `<option value="${merchant.id}">${merchant.name} — ${merchant.storeName}</option>`)
    .join("");
}

function renderMerchantTable() {
  const tbody = document.getElementById("merchantTableBody");
  tbody.innerHTML = state.listings
    .map((item) => `
      <tr>
        <td>${merchantName(item.merchantId)}</td>
        <td>${merchantStore(item.merchantId)}</td>
        <td>${item.title}</td>
        <td>${item.type}</td>
        <td>₹${Number(item.price).toLocaleString("en-IN")}</td>
      </tr>
    `)
    .join("");
}

function renderListings() {
  const query = document.getElementById("searchInput").value.toLowerCase().trim();
  const grid = document.getElementById("listingGrid");

  const filtered = state.listings.filter((item) => {
    const haystack = `${item.title} ${item.category} ${item.type} ${merchantName(item.merchantId)} ${merchantStore(item.merchantId)}`.toLowerCase();
    return haystack.includes(query);
  });

  grid.innerHTML = filtered
    .map((item) => `
      <div class="col-md-6 col-xl-4">
        <article class="listing-card">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <span class="badge-chip">${item.type}</span>
            <span class="price">₹${Number(item.price).toLocaleString("en-IN")}</span>
          </div>
          <h3 class="h5">${item.title}</h3>
          <p class="mb-2">${item.description}</p>
          <p class="mb-1"><strong>Category:</strong> ${item.category}</p>
          <p class="mb-0"><strong>Merchant:</strong> ${merchantName(item.merchantId)} · ${merchantStore(item.merchantId)}</p>
        </article>
      </div>
    `)
    .join("");

  if (!filtered.length) {
    grid.innerHTML = '<p class="text-center py-4">No listing found. Try a different keyword.</p>';
  }
}

function rerenderAll() {
  renderStats();
  renderMerchantOptions();
  renderMerchantTable();
  renderListings();
}

const state = loadState();

document.getElementById("userForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const mobile = formData.get("mobile");

  if (state.users.some((user) => user.mobile === mobile) || state.merchants.some((merchant) => merchant.mobile === mobile)) {
    showToast("Mobile number already registered on Connect.");
    return;
  }

  state.users.push({
    id: makeId("u"),
    name: formData.get("name"),
    mobile,
    password: formData.get("password")
  });

  saveState();
  rerenderAll();
  event.target.reset();
  showToast("User registration complete. Welcome to Connect.");
});

document.getElementById("merchantForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  const mobile = formData.get("mobile");

  if (state.users.some((user) => user.mobile === mobile) || state.merchants.some((merchant) => merchant.mobile === mobile)) {
    showToast("Mobile number already registered on Connect.");
    return;
  }

  state.merchants.push({
    id: makeId("m"),
    name: formData.get("name"),
    mobile,
    password: formData.get("password"),
    storeName: formData.get("storeName")
  });

  saveState();
  rerenderAll();
  event.target.reset();
  showToast("Merchant account activated. You can now add listings.");
});

document.getElementById("listingForm").addEventListener("submit", (event) => {
  event.preventDefault();

  state.listings.unshift({
    id: makeId("l"),
    merchantId: document.getElementById("merchantSelect").value,
    title: document.getElementById("listingTitle").value,
    type: document.getElementById("listingType").value,
    category: document.getElementById("listingCategory").value,
    price: Number(document.getElementById("listingPrice").value),
    description: document.getElementById("listingDescription").value
  });

  saveState();
  rerenderAll();
  event.target.reset();
  showToast("Listing synced to marketplace.");
});

document.getElementById("searchInput").addEventListener("input", renderListings);

rerenderAll();
