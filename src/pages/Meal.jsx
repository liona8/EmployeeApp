import { useState } from "react";
import { ShoppingCart, Clock, CheckCircle, ChevronRight, Plus, Minus, Utensils, X } from "lucide-react";

// ─── Hardcoded menu data ─────────────────────────────────────────────────────
const MENU = {
  "Main Course": [
    { id: "M01", name: "Nasi Lemak Set", desc: "Fragrant coconut rice, sambal, anchovies, egg, cucumber", price: 8.50, tag: "🍚", popular: true },
    { id: "M02", name: "Chicken Rice Set", desc: "Poached chicken, fragrant rice, chilli sauce, soup", price: 9.00, tag: "🍗", popular: true },
    { id: "M03", name: "Beef Rendang Rice", desc: "Slow-cooked beef rendang with steamed white rice", price: 12.00, tag: "🥩", popular: false },
    { id: "M04", name: "Veg Fried Rice", desc: "Wok-fried rice with seasonal vegetables & egg", price: 7.50, tag: "🍳", popular: false },
    { id: "M05", name: "Mee Goreng Mamak", desc: "Spicy fried noodles with egg, tofu, and prawn", price: 8.00, tag: "🍜", popular: true },
  ],
  "Snacks & Light Bites": [
    { id: "S01", name: "Roti Canai (2 pcs)", desc: "Flaky flatbread served with dhal & curry", price: 4.00, tag: "🫓", popular: true },
    { id: "S02", name: "Karipap (3 pcs)", desc: "Crispy curry puffs with potato filling", price: 3.50, tag: "🥐", popular: false },
    { id: "S03", name: "Kuih of the Day", desc: "Ask the counter for today's selection", price: 2.50, tag: "🍡", popular: false },
    { id: "S04", name: "Sandwich (Tuna)", desc: "Wholemeal bread, tuna mayo, lettuce, tomato", price: 5.50, tag: "🥪", popular: false },
  ],
  "Drinks": [
    { id: "D01", name: "Teh Tarik", desc: "Pulled milk tea, hot or iced", price: 2.50, tag: "🧋", popular: true },
    { id: "D02", name: "Kopi O", desc: "Black coffee, traditional style", price: 2.00, tag: "☕", popular: false },
    { id: "D03", name: "Milo Ais", desc: "Iced Milo with condensed milk", price: 3.00, tag: "🥛", popular: true },
    { id: "D04", name: "Fresh Orange Juice", desc: "Freshly squeezed, no added sugar", price: 4.50, tag: "🍊", popular: false },
    { id: "D05", name: "Mineral Water", desc: "500ml chilled", price: 1.50, tag: "💧", popular: false },
  ],
};

const ORDER_SESSIONS = [
  { label: "Breakfast", time: "07:30 – 09:30 AM", cutoff: "09:00 AM" },
  { label: "Lunch",     time: "12:00 – 02:00 PM", cutoff: "11:30 AM" },
  { label: "Tea Break", time: "03:30 – 04:30 PM", cutoff: "03:00 PM" },
];

const PAST_ORDERS = [
  {
    id: "ORD-20260306-001", date: "2026-03-06", session: "Lunch",
    items: [{ name: "Chicken Rice Set", qty: 1, price: 9.00 }, { name: "Teh Tarik", qty: 1, price: 2.50 }],
    total: 11.50, status: "delivered",
  },
  {
    id: "ORD-20260305-002", date: "2026-03-05", session: "Breakfast",
    items: [{ name: "Roti Canai (2 pcs)", qty: 2, price: 4.00 }, { name: "Kopi O", qty: 1, price: 2.00 }],
    total: 10.00, status: "delivered",
  },
  {
    id: "ORD-20260304-003", date: "2026-03-04", session: "Lunch",
    items: [{ name: "Nasi Lemak Set", qty: 1, price: 8.50 }, { name: "Milo Ais", qty: 1, price: 3.00 }],
    total: 11.50, status: "delivered",
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    delivered:  ["badge-green",  "Delivered"],
    preparing:  ["badge-orange", "Preparing"],
    pending:    ["badge-gray",   "Pending"],
    cancelled:  ["badge-red",    "Cancelled"],
  };
  const [cls, label] = map[status] || ["badge-gray", status];
  return <span className={`badge ${cls}`}>{label}</span>;
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function Meal({ setActivePage }) {
  const [activeCategory, setActiveCategory] = useState("Main Course");
  const [cart, setCart] = useState({});           // { itemId: qty }
  const [orderPlaced, setOrderPlaced] = useState(null);
  const [tab, setTab] = useState("order");        // "order" | "history"
  const [selectedSession, setSelectedSession] = useState("Lunch");

  const categories = Object.keys(MENU);

  const addToCart = (id) => setCart((c) => ({ ...c, [id]: (c[id] || 0) + 1 }));
  const removeFromCart = (id) => setCart((c) => {
    if (!c[id]) return c;
    const next = { ...c, [id]: c[id] - 1 };
    if (next[id] === 0) delete next[id];
    return next;
  });

  const cartItems = Object.entries(cart).map(([id, qty]) => {
    const item = Object.values(MENU).flat().find((m) => m.id === id);
    return { ...item, qty };
  });
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  const placeOrder = () => {
    const id = `ORD-${new Date().toISOString().split("T")[0].replace(/-/g, "")}-${Math.random().toString(36).slice(2, 5).toUpperCase()}`;
    setOrderPlaced({ id, items: cartItems, total: cartTotal, session: selectedSession, status: "preparing" });
    setCart({});
  };

  // ── Order Success Screen ──────────────────────────────────────────────────
  if (orderPlaced) {
    return (
      <div style={{ padding: "0 24px 24px 24px" }}>
        <div className="page-header">
          <div className="flex-between">
            <div>
              <div className="page-title">Order Confirmed! 🎉</div>
              <div className="page-subtitle">Your meal is being prepared — collect at the canteen counter</div>
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setOrderPlaced(null)}>
              ← Order Again
            </button>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
          <div className="card" style={{ textAlign: "center", padding: "32px 24px" }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>🍽️</div>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Order Placed!</div>
            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 20 }}>
              Your {orderPlaced.session} order is confirmed
            </div>
            <div style={{
              fontFamily: "monospace", fontSize: 16, fontWeight: 700,
              color: "var(--accent)", background: "var(--bg3)",
              padding: "12px 20px", borderRadius: 8, marginBottom: 20,
              border: "1px solid var(--border)",
            }}>
              {orderPlaced.id}
            </div>

            <div style={{ textAlign: "left", marginBottom: 20 }}>
              {orderPlaced.items.map((item) => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                  <span>{item.tag} {item.name} <span style={{ color: "var(--text3)" }}>×{item.qty}</span></span>
                  <span style={{ fontWeight: 600 }}>RM {(item.price * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontWeight: 700, fontSize: 14 }}>
                <span>Total</span>
                <span style={{ color: "var(--accent)" }}>RM {orderPlaced.total.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => { setTab("history"); setOrderPlaced(null); }}>
                View History
              </button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => setOrderPlaced(null)}>
                New Order
              </button>
            </div>
          </div>

          <div className="card">
            <div className="card-title">What's Next?</div>
            {[
              ["🕐", "Estimated Ready", "15–20 minutes from now"],
              ["📍", "Collection Point", "Ground Floor Canteen, Counter 2"],
              ["🪪", "Show Your ID", "Staff ID or order reference when collecting"],
              ["💳", "Payment", "Deducted from your meal allowance (if applicable)"],
            ].map(([icon, title, desc]) => (
              <div key={title} style={{ display: "flex", gap: 14, marginBottom: 16 }}>
                <div style={{ fontSize: 22, flexShrink: 0 }}>{icon}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{title}</div>
                  <div style={{ fontSize: 12, color: "var(--text3)", marginTop: 2 }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Main View ─────────────────────────────────────────────────────────────
  return (
    <div style={{ padding: "0 24px 24px 24px" }}>
      <div className="page-header">
        <div className="flex-between">
          <div>
            <div className="page-title">Meal Ordering</div>
            <div className="page-subtitle">Order from the canteen — available for breakfast, lunch & tea break</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className={tab === "order" ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"} onClick={() => setTab("order")}>
              <Utensils size={14} style={{ marginRight: 6 }} /> Order
            </button>
            <button className={tab === "history" ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"} onClick={() => setTab("history")}>
              <Clock size={14} style={{ marginRight: 6 }} /> History
            </button>
          </div>
        </div>
      </div>

      {tab === "history" ? (
        // ── History tab ────────────────────────────────────────────────────
        <div>
          <div className="stat-grid" style={{ marginBottom: 16 }}>
            {[
              { label: "Orders This Month", value: PAST_ORDERS.length, cls: "blue" },
              { label: "Total Spent", value: `RM ${PAST_ORDERS.reduce((s, o) => s + o.total, 0).toFixed(2)}`, cls: "green" },
              { label: "Favourite", value: "Chicken Rice", cls: "purple" },
              { label: "Avg per Order", value: `RM ${(PAST_ORDERS.reduce((s, o) => s + o.total, 0) / PAST_ORDERS.length).toFixed(2)}`, cls: "orange" },
            ].map(({ label, value, cls }) => (
              <div key={label} className={`stat-card ${cls}`}>
                <div className="stat-label">{label}</div>
                <div className="stat-value" style={{ fontSize: 20 }}>{value}</div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-title">Past Orders</div>
            {PAST_ORDERS.map((order) => (
              <div key={order.id} style={{
                background: "var(--bg3)", border: "1px solid var(--border)",
                borderRadius: 10, padding: "14px 16px", marginBottom: 10,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{order.session} · {order.date}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", fontFamily: "monospace", marginTop: 2 }}>{order.id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <StatusBadge status={order.status} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: "var(--accent)", marginTop: 4 }}>
                      RM {order.total.toFixed(2)}
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {order.items.map((item, i) => (
                    <span key={i} className="badge badge-gray" style={{ fontSize: 11 }}>
                      {item.name} ×{item.qty}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // ── Order tab ─────────────────────────────────────────────────────
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
          {/* Menu */}
          <div>
            {/* Session selector */}
            <div className="card" style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text3)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.6px" }}>
                Select Session
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                {ORDER_SESSIONS.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSession(s.label)}
                    className={selectedSession === s.label ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                    style={{ flexDirection: "column", alignItems: "flex-start", padding: "10px 14px", height: "auto", lineHeight: 1.4 }}
                  >
                    <span style={{ fontWeight: 700 }}>{s.label}</span>
                    <span style={{ fontSize: 11, opacity: 0.75 }}>{s.time}</span>
                  </button>
                ))}
              </div>
              <div style={{ fontSize: 11, color: "var(--text3)", marginTop: 10 }}>
                ⏰ Order cutoff: <strong>{ORDER_SESSIONS.find(s => s.label === selectedSession)?.cutoff}</strong>
              </div>
            </div>

            {/* Category tabs */}
            <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={activeCategory === cat ? "btn btn-primary btn-sm" : "btn btn-ghost btn-sm"}
                  style={{ fontSize: 12 }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Menu items */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {MENU[activeCategory].map((item) => {
                const qty = cart[item.id] || 0;
                return (
                  <div key={item.id} style={{
                    background: "var(--surface, var(--bg2))",
                    border: `1px solid ${qty > 0 ? "var(--accent)" : "var(--border)"}`,
                    borderRadius: 10, padding: "14px 16px",
                    transition: "border-color 0.15s",
                    position: "relative",
                  }}>
                    {item.popular && (
                      <span style={{
                        position: "absolute", top: 10, right: 10,
                        fontSize: 10, fontWeight: 700, padding: "2px 7px",
                        background: "rgba(79,110,247,0.15)", color: "var(--accent)",
                        borderRadius: 4,
                      }}>Popular</span>
                    )}
                    <div style={{ fontSize: 24, marginBottom: 6 }}>{item.tag}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "var(--text3)", marginBottom: 10, lineHeight: 1.4 }}>{item.desc}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span style={{ fontWeight: 700, fontSize: 14, color: "var(--accent)" }}>
                        RM {item.price.toFixed(2)}
                      </span>
                      {qty === 0 ? (
                        <button className="btn btn-primary btn-sm" style={{ padding: "5px 14px", fontSize: 12 }}
                          onClick={() => addToCart(item.id)}>
                          + Add
                        </button>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <button onClick={() => removeFromCart(item.id)}
                            style={{ width: 26, height: 26, borderRadius: "50%", border: "1px solid var(--border)", background: "var(--bg3)", cursor: "pointer", color: "var(--text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Minus size={12} />
                          </button>
                          <span style={{ fontWeight: 700, fontSize: 14, minWidth: 16, textAlign: "center" }}>{qty}</span>
                          <button onClick={() => addToCart(item.id)}
                            style={{ width: 26, height: 26, borderRadius: "50%", background: "var(--accent)", border: "none", cursor: "pointer", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Plus size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Cart */}
          <div style={{ position: "sticky", top: 20, alignSelf: "start" }}>
            <div className="card">
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <ShoppingCart size={16} />
                <div className="card-title" style={{ marginBottom: 0 }}>Your Order</div>
                {cartCount > 0 && (
                  <span style={{
                    marginLeft: "auto", background: "var(--accent)", color: "white",
                    borderRadius: "50%", width: 20, height: 20, fontSize: 11,
                    display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700,
                  }}>{cartCount}</span>
                )}
              </div>

              <div style={{ fontSize: 12, color: "var(--text3)", marginBottom: 12 }}>
                Session: <strong style={{ color: "var(--text)" }}>{selectedSession}</strong>
              </div>

              {cartItems.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 0", color: "var(--text3)" }}>
                  <div style={{ fontSize: 32, marginBottom: 8 }}>🛒</div>
                  <div style={{ fontSize: 13 }}>Your cart is empty</div>
                  <div style={{ fontSize: 11, marginTop: 4 }}>Add items from the menu</div>
                </div>
              ) : (
                <>
                  {cartItems.map((item) => (
                    <div key={item.id} style={{
                      display: "flex", justifyContent: "space-between", alignItems: "center",
                      padding: "8px 0", borderBottom: "1px solid var(--border)", fontSize: 13,
                    }}>
                      <div>
                        <span>{item.tag} {item.name}</span>
                        <span style={{ color: "var(--text3)", marginLeft: 6 }}>×{item.qty}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontWeight: 600 }}>RM {(item.price * item.qty).toFixed(2)}</span>
                        <button onClick={() => removeFromCart(item.id)}
                          style={{ border: "none", background: "none", cursor: "pointer", color: "var(--text3)", padding: 2 }}>
                          <X size={13} />
                        </button>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 0 0", fontWeight: 700, fontSize: 15 }}>
                    <span>Total</span>
                    <span style={{ color: "var(--accent)" }}>RM {cartTotal.toFixed(2)}</span>
                  </div>

                  <button className="btn btn-primary" style={{ width: "100%", marginTop: 14 }} onClick={placeOrder}>
                    Place Order →
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginTop: 8, fontSize: 12 }}
                    onClick={() => setCart({})}>
                    Clear Cart
                  </button>
                </>
              )}
            </div>

            {/* Canteen info */}
            <div className="card" style={{ marginTop: 14 }}>
              <div className="card-title" style={{ fontSize: 12 }}>Canteen Info</div>
              {[
                ["📍", "Ground Floor, Block B"],
                ["🕐", "7:00 AM – 5:00 PM"],
                ["📞", "Ext. 1234"],
              ].map(([icon, text]) => (
                <div key={text} style={{ display: "flex", gap: 8, fontSize: 12, color: "var(--text2)", marginBottom: 6 }}>
                  <span>{icon}</span><span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
