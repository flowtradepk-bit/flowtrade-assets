/* FlowTrade checkout route repair. Loaded after core-app.js only. */
(function () {
  'use strict';
  if (!/\/p\/checkout\.html$/i.test(location.pathname)) return;
  if (window.__flowTradeCheckoutRepairLoaded) return;
  window.__flowTradeCheckoutRepairLoaded = true;

  var config = window.LUXORA_CONFIG || {};
  var root = document.querySelector('#staticPageShell') || document.querySelector('main');
  if (!root) return;

  function read(key, fallback) {
    try { var value = JSON.parse(localStorage.getItem(key)); return value == null ? fallback : value; }
    catch (ignore) { return fallback; }
  }
  function write(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (ignore) {}
  }
  function money(value) {
    return (config.CURRENCY_SYMBOL || 'PKR ') + Number(value || 0).toLocaleString();
  }
  function esc(value) {
    var holder = document.createElement('div');
    holder.textContent = String(value == null ? '' : value);
    return holder.innerHTML;
  }
  function field(id) { return document.getElementById(id); }
  function getCart() { return Array.isArray(read('luxora_cart', [])) ? read('luxora_cart', []) : []; }
  function updateCartCount() {
    var count = getCart().reduce(function (sum, item) { return sum + Math.max(0, Number(item.qty || 1)); }, 0);
    ['cartCount', 'mobileCartCount'].forEach(function (id) { var el = field(id); if (el) el.textContent = String(count); });
    document.dispatchEvent(new CustomEvent('flowtrade-cart-updated', { detail: { count: count } }));
  }
  function orderId() {
    var d = new Date(), pad = function (n) { return String(n).padStart(2, '0'); };
    return 'FT-' + d.getFullYear() + pad(d.getMonth() + 1) + pad(d.getDate()) + String(d.getTime() % 1000000).padStart(6, '0');
  }
  function selectedItems() {
    var params = new URLSearchParams(location.search);
    var direct = params.get('buyNow') === '1' ? read('luxora_buy_now', []) : [];
    if (Array.isArray(direct) && direct.length) return { items: direct, direct: true };
    return { items: getCart().filter(function (item) { return item && item.selected !== false; }), direct: false };
  }
  function renderSuccess(params) {
    var id = String(params.get('orderId') || '').trim();
    if (params.get('success') !== '1' || !id) return false;
    var payment = read('luxora_last_order_payment', {});
    root.innerHTML = '<section class="page-wrap"><div class="container"><div class="checkout-panel" style="max-width:650px;margin:auto;text-align:center"><div class="eyebrow">FlowTrade</div><h1 class="serif">Order Placed Successfully</h1><p>Thank you for your order. We have received it and will contact you using the information provided.</p><p><b>Order ID: ' + esc(id) + '</b><br/><b>Payment Method:</b> ' + esc(payment.method || 'Cash on Delivery') + '<br/><b>Payment Status:</b> ' + esc(payment.status || 'Pending') + '</p><a class="btn btn-dark" href="/">Continue Shopping</a></div></div></section>';
    return true;
  }
  function render() {
    var params = new URLSearchParams(location.search);
    if (renderSuccess(params)) return;
    var selection = selectedItems(), items = selection.items;
    var subtotal = items.reduce(function (sum, item) { return sum + Number(item.price || 0) * Math.max(1, Number(item.qty || 1)); }, 0);
    var shipping = subtotal >= Number(config.FREE_SHIPPING_LIMIT || 0) ? 0 : Number(config.SHIPPING_COST || 0);
    var total = subtotal + shipping;
    var rows = items.length ? items.map(function (item) {
      var qty = Math.max(1, Number(item.qty || 1));
      return '<div class="checkout-summary-item"><img src="' + esc(item.image || '') + '" alt=""/><div><b>' + esc(item.title || 'Product') + '</b><br/><small>' + qty + ' × ' + money(item.price) + (item.variant ? ' · ' + esc(item.variant) : '') + '</small></div><b>' + money(Number(item.price || 0) * qty) + '</b></div>';
    }).join('') : '<p>Your cart is empty. <a href="/">Continue shopping</a></p>';
    root.innerHTML = '<section class="page-wrap"><div class="container"><div class="breadcrumbs">Home / Checkout</div><div class="checkout-grid"><form class="checkout-panel" id="luxoraCheckoutForm" novalidate="novalidate"><h1 class="serif">Checkout</h1><div class="ft-guest-checkout-banner"><strong>Checkout as a guest</strong>Create an account to view your complete order history, track deliveries and manage your saved details in one place.</div><p class="checkout-note">Enter your details to place your order securely.</p><div class="checkout-field"><label for="coName">Full name</label><input id="coName" name="name" required="required" placeholder="Enter recipient full name"/></div><div class="checkout-field"><label for="coPhone">Phone</label><input id="coPhone" name="phone" required="required" type="tel" placeholder="Enter active mobile / WhatsApp number"/></div><div class="checkout-field"><label for="coEmail">Email</label><input id="coEmail" name="email" type="email" placeholder="Enter email address (optional)"/></div><div class="checkout-field"><label for="coAddress">Address</label><textarea id="coAddress" name="address" required="required" rows="3" placeholder="House number, street and area"></textarea></div><div class="checkout-field"><label for="coCity">City</label><input id="coCity" name="city" required="required" placeholder="Enter your city"/></div><div class="checkout-field"><label for="coVoucher">Voucher code</label><input id="coVoucher" name="voucherCode" placeholder="Enter voucher code (optional)"/></div><div class="checkout-field"><label for="coNotes">Order notes</label><textarea id="coNotes" name="notes" rows="2" placeholder="Optional delivery instructions"></textarea></div><h2 class="payment-heading">Payment Method</h2><div class="payment-methods"><label class="payment-option active"><input checked="checked" name="paymentMethod" type="radio" value="Cash on Delivery"/><b>Cash on Delivery</b><small>Pay securely when your order arrives.</small></label></div><div class="payment-information visible"><h3>CASH ON DELIVERY</h3><p>Pay cash when your order is delivered.</p></div><div id="orderStatus" class="checkout-note" aria-live="polite"></div><button class="btn btn-dark" id="placeOrderButton" ' + (items.length ? '' : 'disabled="disabled"') + ' type="submit">PLACE NOW</button></form><aside class="checkout-panel"><h2>Order summary</h2>' + rows + '<div class="totals"><span>Subtotal</span><b>' + money(subtotal) + '</b></div><div class="totals"><span>Shipping</span><b>' + (shipping ? money(shipping) : 'Free') + '</b></div><div class="totals grand"><span>Total</span><b>' + money(total) + '</b></div></aside></div></div></section>';

    var form = field('luxoraCheckoutForm');
    if (!form) return;
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      var status = field('orderStatus'), button = field('placeOrderButton'), endpoint = String(config.ORDER_API_URL || '');
      var required = [
        { id: 'coName', message: 'Please enter your full name.', valid: function (value) { return value.length >= 2; } },
        { id: 'coPhone', message: 'Please enter a valid phone number.', valid: function (value) { return value.replace(/[^0-9+]/g, '').length >= 7; } },
        { id: 'coAddress', message: 'Please enter a complete delivery address.', valid: function (value) { return value.length >= 5; } },
        { id: 'coCity', message: 'Please enter your city.', valid: function (value) { return value.length >= 2; } }
      ];
      var invalid = required.filter(function (rule) { var input = field(rule.id); var value = String(input && input.value || '').trim(); if (input) { input.style.borderColor = rule.valid(value) ? '' : '#c63b3b'; input.removeAttribute('aria-invalid'); if (!rule.valid(value)) input.setAttribute('aria-invalid', 'true'); } return !rule.valid(value); })[0];
      if (invalid) { status.textContent = invalid.message; var invalidField = field(invalid.id); if (invalidField) invalidField.focus(); return; }
      if (!items.length) { status.textContent = 'Your cart is empty.'; return; }
      if (items.some(function (item) { return Number(item.qty || 1) > 10; })) { status.textContent = 'Online orders are limited to 10 units per product.'; return; }
      if (!endpoint || endpoint.indexOf('YOUR_GOOGLE_APPS_SCRIPT') !== -1) { status.textContent = 'Order service is not configured yet. Please contact the store.'; return; }
      var data = new FormData(form), id = orderId();
      var payload = { orderId: id, orderDate: new Date().toISOString(), customer: { name: data.get('name'), phone: data.get('phone'), email: data.get('email'), address: data.get('address'), city: data.get('city'), notes: data.get('notes') }, voucherCode: String(data.get('voucherCode') || '').trim(), payment: { method: 'Cash on Delivery', reference: '', status: 'Cash on Delivery / Pending' }, paymentMethod: 'Cash on Delivery', paymentReference: '', paymentStatus: 'Cash on Delivery / Pending', items: items.map(function (item) { var qty = Math.max(1, Number(item.qty || 1)); return { id: item.id, url: item.url || '', title: item.title, price: Number(item.price || 0), quantity: qty, variant: item.variant || '', lineTotal: Number(item.price || 0) * qty }; }), subtotal: subtotal, shipping: shipping, total: total, currency: config.CURRENCY || 'PKR' };
      button.disabled = true; button.textContent = 'PROCESSING...'; status.textContent = '';
      fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(payload) })
        .then(function (response) { return response.text().then(function (text) { var result; try { result = JSON.parse(text); } catch (ignore) { throw new Error('Order service returned an invalid response. Please contact the store.'); } if (!response.ok || !result || !result.success) throw new Error(result && result.message ? result.message : 'Unable to process order'); return result; }); })
        .then(function (result) { var confirmed = result.orderId || id; if (!selection.direct) { var ordered = {}; items.forEach(function (item) { ordered[String(item.id || item.url || item.title)] = true; }); write('luxora_cart', getCart().filter(function (item) { return !ordered[String(item.id || item.url || item.title)]; })); updateCartCount(); } write('luxora_buy_now', []); write('luxora_last_order_payment', { method: 'Cash on Delivery', status: 'Cash on Delivery / Pending' }); location.href = (config.CHECKOUT_URL || '/p/checkout.html') + '?success=1&orderId=' + encodeURIComponent(confirmed); })
        .catch(function (error) { button.disabled = false; button.textContent = 'PLACE NOW'; var message = error && error.message ? String(error.message) : 'Unable to place your order right now. Please try again.'; status.textContent = /failed to fetch|networkerror|load failed/i.test(message) ? 'Order service could not be reached. Please try again in a moment.' : message; console.error('FlowTrade checkout failed:', error); });
    });
  }
  render();
}());
