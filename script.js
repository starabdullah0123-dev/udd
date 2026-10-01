const KEYS = {
  menu: "mh-menu",
  sales: "mh-sales",
  billNo: "mh-bill-no",
};

const DEFAULT_MENU = [
  {
    id: "chicken-mandhi",
    name: "Chicken Mandhi",
    price: 280,
    desc: "Slow-cooked mandhi rice with spiced chicken.",
    image:
      "https://images.unsplash.com/photo-1701579231305-d84d8af9a3fd?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "chicken-briyani",
    name: "Chicken Briyani",
    price: 220,
    desc: "Fragrant basmati, chicken, and dum spices.",
    image:
      "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "egg-briyani",
    name: "Egg Briyani",
    price: 160,
    desc: "Layered rice with boiled eggs and masala.",
    image:
      "https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "fish-sappadu",
    name: "Fish Sappadu",
    price: 320,
    desc: "Full fish meal with rice, curry, and sides.",
    image:
      "https://images.unsplash.com/photo-1535399831218-d5bd36d1a6b3?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "kalari-kari",
    name: "Kalari Kari",
    price: 250,
    desc: "Fiery Kerala-style meat curry.",
    image:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=800&q=80",
  },
  {
    id: "nei-soru",
    name: "Nei Soru",
    price: 90,
    desc: "Ghee rice with fried cashew and spices.",
    image:
      "https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80",
  },
];

const money = (n) => `₹${Number(n).toLocaleString("en-IN")}`;
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};
const save = (key, value) => localStorage.setItem(key, JSON.stringify(value));

let menu = load(KEYS.menu, DEFAULT_MENU);
let sales = load(KEYS.sales, []);
let cart = [];
let billNo = Number(localStorage.getItem(KEYS.billNo) || 1001);

const els = {
  menuGrid: document.querySelector("#menu-grid"),
  cartList: document.querySelector("#cart-list"),
  itemCount: document.querySelector("#item-count"),
  subtotal: document.querySelector("#subtotal"),
  total: document.querySelector("#total"),
  billNo: document.querySelector("#bill-no"),
  billMeta: document.querySelector("#bill-meta"),
  payModal: document.querySelector("#pay-modal"),
  payAmount: document.querySelector("#pay-amount"),
  qrImage: document.querySelector("#qr-image"),
  toast: document.querySelector("#toast"),
  salesMonth: document.querySelector("#sales-month"),
  salesStats: document.querySelector("#sales-stats"),
  salesBody: document.querySelector("#sales-body"),
  manageList: document.querySelector("#manage-list"),
  form: document.querySelector("#menu-form"),
  itemId: document.querySelector("#item-id"),
  itemName: document.querySelector("#item-name"),
  itemPrice: document.querySelector("#item-price"),
  itemDesc: document.querySelector("#item-desc"),
  itemImage: document.querySelector("#item-image"),
  saveItem: document.querySelector("#save-item"),
};

function uid() {
  return `dish-${Date.now()}`;
}

function notify(text) {
  els.toast.textContent = text;
  els.toast.hidden = false;
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => {
    els.toast.hidden = true;
  }, 2200);
}

function cartTotal() {
  return cart.reduce((sum, line) => sum + line.price * line.qty, 0);
}

function cartQty() {
  return cart.reduce((sum, line) => sum + line.qty, 0);
}

function addToCart(id) {
  const item = menu.find((dish) => dish.id === id);
  if (!item) return;
  const existing = cart.find((line) => line.id === id);
  if (existing) existing.qty += 1;
  else cart.push({ ...item, qty: 1 });
  renderCart();
}

function changeQty(id, delta) {
  const line = cart.find((item) => item.id === id);
  if (!line) return;
  line.qty += delta;
  if (line.qty <= 0) cart = cart.filter((item) => item.id !== id);
  renderCart();
}

function clearCart() {
  cart = [];
  renderCart();
}

function renderMenu() {
  els.menuGrid.innerHTML = menu
    .map(
      (item) => `
      <button class="dish" type="button" data-add="${item.id}">
        <img src="${item.image}" alt="${item.name}" />
        <div class="dish-body">
          <h3>${item.name}</h3>
          <p>${item.desc || ""}</p>
          <span class="price">${money(item.price)}</span>
        </div>
      </button>`
    )
    .join("");
}

function renderCart() {
  els.billNo.textContent = `#${billNo}`;
  els.billMeta.textContent = new Date().toLocaleString("en-IN");

  if (!cart.length) {
    els.cartList.innerHTML = `<li class="empty">Click a menu item to start a bill.</li>`;
  } else {
    els.cartList.innerHTML = cart
      .map(
        (line) => `
        <li>
          <div>
            <strong>${line.name}</strong>
            <div class="qty-row">
              <button type="button" data-qty="${line.id}" data-delta="-1">−</button>
              <span>${line.qty}</span>
              <button type="button" data-qty="${line.id}" data-delta="1">+</button>
            </div>
          </div>
          <strong>${money(line.price * line.qty)}</strong>
        </li>`
      )
      .join("");
  }

  els.itemCount.textContent = String(cartQty());
  els.subtotal.textContent = money(cartTotal());
  els.total.textContent = money(cartTotal());
}

function renderManage() {
  els.manageList.innerHTML = menu
    .map(
      (item) => `
      <article class="manage-item">
        <img src="${item.image}" alt="" />
        <div>
          <strong>${item.name}</strong>
          <p>${money(item.price)} · ${item.desc || "No description"}</p>
        </div>
        <div class="manage-actions">
          <button class="btn btn-ghost btn-small" type="button" data-edit="${item.id}">Edit</button>
          <button class="btn btn-danger btn-small" type="button" data-delete="${item.id}">Delete</button>
        </div>
      </article>`
    )
    .join("");
}

function monthKey(date) {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function renderSales() {
  const selected = els.salesMonth.value || monthKey(new Date());
  if (!els.salesMonth.value) els.salesMonth.value = selected;

  const rows = sales.filter((sale) => monthKey(sale.paidAt) === selected);
  const total = rows.reduce((sum, sale) => sum + sale.total, 0);

  els.salesStats.innerHTML = `
    <div><span>Bills</span><strong>${rows.length}</strong></div>
    <div><span>Items sold</span><strong>${rows.reduce((s, r) => s + r.qty, 0)}</strong></div>
    <div><span>Revenue</span><strong>${money(total)}</strong></div>
  `;

  els.salesBody.innerHTML = rows.length
    ? rows
        .map(
          (sale) => `
        <tr>
          <td>#${sale.billNo}</td>
          <td>${new Date(sale.paidAt).toLocaleString("en-IN")}</td>
          <td>${sale.items.map((i) => `${i.name} × ${i.qty}`).join("<br>")}</td>
          <td>${money(sale.total)}</td>
        </tr>`
        )
        .join("")
    : `<tr><td colspan="4">No paid bills this month.</td></tr>`;
}

function openPay() {
  if (!cart.length) {
    notify("Add at least one item before paying.");
    return;
  }
  const amount = cartTotal();
  const upi = `upi://pay?pa=malabarhouse@upi&pn=Malabar%20House&am=${amount}&cu=INR&tn=Bill%20${billNo}`;
  els.payAmount.textContent = `Amount due: ${money(amount)}`;
  els.qrImage.src = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(upi)}`;
  els.payModal.hidden = false;
}

function markPaid() {
  sales.unshift({
    billNo,
    paidAt: new Date().toISOString(),
    total: cartTotal(),
    qty: cartQty(),
    items: cart.map(({ name, qty, price }) => ({ name, qty, price })),
  });
  save(KEYS.sales, sales);
  billNo += 1;
  localStorage.setItem(KEYS.billNo, String(billNo));
  els.payModal.hidden = true;
  clearCart();
  renderSales();
  notify("Payment recorded. Bill saved to monthly sales.");
}

function resetForm() {
  els.form.reset();
  els.itemId.value = "";
  els.saveItem.textContent = "Add dish";
}

function saveMenuItem(event) {
  event.preventDefault();
  const data = {
    id: els.itemId.value || uid(),
    name: els.itemName.value.trim(),
    price: Number(els.itemPrice.value),
    desc: els.itemDesc.value.trim(),
    image:
      els.itemImage.value.trim() ||
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80",
  };

  const index = menu.findIndex((item) => item.id === data.id);
  if (index >= 0) menu[index] = data;
  else menu.push(data);

  save(KEYS.menu, menu);
  renderMenu();
  renderManage();
  resetForm();
}

function editItem(id) {
  const item = menu.find((dish) => dish.id === id);
  if (!item) return;
  els.itemId.value = item.id;
  els.itemName.value = item.name;
  els.itemPrice.value = item.price;
  els.itemDesc.value = item.desc || "";
  els.itemImage.value = item.image;
  els.saveItem.textContent = "Update dish";
}

function deleteItem(id) {
  if (!confirm("Remove this dish from the menu?")) return;
  menu = menu.filter((item) => item.id !== id);
  cart = cart.filter((item) => item.id !== id);
  save(KEYS.menu, menu);
  renderMenu();
  renderManage();
  renderCart();
}

document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((btn) => btn.classList.remove("is-active"));
    tab.classList.add("is-active");
    document.querySelectorAll(".view").forEach((view) => {
      const match = view.id === `view-${tab.dataset.view}`;
      view.classList.toggle("is-active", match);
      view.hidden = !match;
    });
  });
});

els.menuGrid.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-add]");
  if (btn) addToCart(btn.dataset.add);
});

els.cartList.addEventListener("click", (event) => {
  const btn = event.target.closest("[data-qty]");
  if (btn) changeQty(btn.dataset.qty, Number(btn.dataset.delta));
});

els.manageList.addEventListener("click", (event) => {
  const edit = event.target.closest("[data-edit]");
  const del = event.target.closest("[data-delete]");
  if (edit) editItem(edit.dataset.edit);
  if (del) deleteItem(del.dataset.delete);
});

document.querySelector("#pay-now").addEventListener("click", openPay);
document.querySelector("#print-bill").addEventListener("click", () => {
  if (!cart.length) {
    notify("Cart is empty.");
    return;
  }
  window.print();
});
document.querySelector("#clear-cart").addEventListener("click", () => {
  if (!cart.length) {
    notify("Cart is already empty.");
    return;
  }
  clearCart();
  notify("Cart cleared.");
});
document.querySelector("#mark-paid").addEventListener("click", markPaid);
document.querySelector("#close-pay").addEventListener("click", () => {
  els.payModal.hidden = true;
});
document.querySelector("#reset-form").addEventListener("click", resetForm);
els.form.addEventListener("submit", saveMenuItem);
els.salesMonth.addEventListener("change", renderSales);

save(KEYS.menu, menu);
renderMenu();
renderCart();
renderManage();
renderSales();
