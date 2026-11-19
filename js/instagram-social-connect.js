/*
 * FlowTrade Instagram official-account connector.
 * Load after core-app.js. It never contains an App Secret, OAuth token or Meta app id.
 */
(function () {
  'use strict';

  var CARD_ID = 'ftInstagramOfficialConnectCard';
  var CONNECTED = 'Connected';

  function ensureStyles() {
    if (document.getElementById('ftInstagramConnectStyles')) return;
    var style = document.createElement('style');
    style.id = 'ftInstagramConnectStyles';
    style.textContent = '.ft-instagram-connect-card{border:1px solid #e2e9f2;background:linear-gradient(135deg,#fff 0%,#f8fbff 100%)}.ft-instagram-profile{display:flex;align-items:center;gap:12px;margin-top:14px}.fta-instagram-avatar{display:grid;place-items:center;width:44px;height:44px;border-radius:50%;object-fit:cover;background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);color:#fff;font-weight:800}.fta-actions{display:flex;gap:9px;flex-wrap:wrap}.fta-module-btn.danger{color:#a12626;border-color:#e8b7b7;background:#fff7f7}.fta-status-active{background:#e8f7ed;color:#137333}.fta-status-draft{background:#f0f3f7;color:#536276}';
    document.head.appendChild(style);
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value).replace(/[&<>"']/g, function (character) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character];
    });
  }

  function api(action, payload) {
    var firebase = window.firebase;
    var config = window.LUXORA_CONFIG || {};
    var auth = firebase && firebase.auth && firebase.auth();
    var user = auth && auth.currentUser;
    if (!user) return Promise.reject(new Error('Please log in as an authorized FlowTrade administrator.'));
    if (!config.ORDER_API_URL) return Promise.reject(new Error('FlowTrade admin API URL is not configured.'));
    return user.getIdToken().then(function (token) {
      return fetch(String(config.ORDER_API_URL), {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
        body: JSON.stringify(Object.assign({ action: action, firebaseIdToken: token }, payload || {}))
      });
    }).then(function (response) {
      return response.text().then(function (text) {
        var data;
        try { data = JSON.parse(text); } catch (ignore) { throw new Error('Instagram connection service returned an invalid response.'); }
        if (!response.ok || !data.success) throw new Error(data && data.message || 'Instagram connection request failed.');
        return data;
      });
    });
  }

  function socialWorkspace() { return document.getElementById('ftaMarketingBody'); }
  function clearCard() { var old = document.getElementById(CARD_ID); if (old) old.remove(); }

  function render(profile) {
    var workspace = socialWorkspace();
    if (!workspace || !workspace.querySelector('#ftaSocialPlatforms')) return;
    ensureStyles(); clearCard(); profile = profile || {};
    var connected = String(profile.connectionStatus || '') === CONNECTED;
    var displayName = profile.profileName ? '@' + profile.profileName : 'No verified FlowTrade Instagram account is connected.';
    var image = profile.profileImageUrl ? '<img class="fta-instagram-avatar" src="' + escapeHtml(profile.profileImageUrl) + '" alt=""/>' : '<span class="fta-instagram-avatar fta-instagram-avatar-fallback">IG</span>';
    var actions = connected ? '<button class="fta-module-btn" data-ft-instagram-reconnect="1" type="button">Reconnect</button><button class="fta-module-btn danger" data-ft-instagram-disconnect="1" type="button">Disconnect</button>' : '<button class="fta-module-btn primary" data-ft-instagram-connect="1" type="button">Connect official Instagram</button>';
    var card = document.createElement('section');
    card.id = CARD_ID; card.className = 'fta-module-card ft-instagram-connect-card';
    card.innerHTML = '<div class="fta-section-title"><div><h3>Official Instagram account</h3><div class="sub">One verified FlowTrade business account only. Access tokens are kept server-side.</div></div><span class="fta-status ' + (connected ? 'fta-status-active' : 'fta-status-draft') + '">' + escapeHtml(profile.connectionStatus || 'Not Connected') + '</span></div><div class="ft-instagram-profile">' + image + '<div><b>' + escapeHtml(displayName) + '</b>' + (profile.profileUrl ? '<div class="fta-small"><a target="_blank" rel="noopener" href="' + escapeHtml(profile.profileUrl) + '">View official profile</a></div>' : '') + '</div></div><div class="fta-actions" style="margin-top:14px">' + actions + '</div><p class="fta-small" data-ft-instagram-status="1" aria-live="polite"></p>';
    workspace.insertBefore(card, workspace.firstChild); bind(card);
  }

  function setStatus(card, message, isError) { var element = card.querySelector('[data-ft-instagram-status]'); if (element) { element.textContent = message || ''; element.className = 'fta-small ' + (isError ? 'fta-err' : ''); } }
  function refresh() { return api('admin_marketing_instagram_connection_status').then(function (data) { render(data.profile); return data.profile; }); }
  function bind(card) {
    var connect = card.querySelector('[data-ft-instagram-connect], [data-ft-instagram-reconnect]');
    if (connect) connect.addEventListener('click', function () { connect.disabled = true; setStatus(card, 'Opening official Instagram authorization…', false); api('admin_marketing_instagram_begin_connect', { adminReturnUrl: window.location.origin + '/p/flowtrade-admin.html' }).then(function (data) { if (!data.authorizationUrl) throw new Error('Instagram did not provide an authorization URL.'); window.location.assign(data.authorizationUrl); }).catch(function (error) { connect.disabled = false; setStatus(card, error.message || 'Instagram authorization could not be started.', true); }); });
    var disconnect = card.querySelector('[data-ft-instagram-disconnect]');
    if (disconnect) disconnect.addEventListener('click', function () { if (!window.confirm('Disconnect the verified FlowTrade Instagram account? Scheduled or draft posts will not be deleted.')) return; disconnect.disabled = true; setStatus(card, 'Disconnecting Instagram…', false); api('admin_marketing_instagram_disconnect').then(function () { return refresh(); }).catch(function (error) { disconnect.disabled = false; setStatus(card, error.message || 'Instagram could not be disconnected.', true); }); });
  }
  function mountWhenSocialWorkspaceAppears() { var workspace = socialWorkspace(); if (!workspace || !workspace.querySelector('#ftaSocialPlatforms') || document.getElementById(CARD_ID)) return; api('admin_marketing_instagram_connection_status').then(function (data) { render(data.profile); }).catch(function () {}); }
  var observer = new MutationObserver(mountWhenSocialWorkspaceAppears); observer.observe(document.documentElement, { childList: true, subtree: true });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mountWhenSocialWorkspaceAppears); else mountWhenSocialWorkspaceAppears();
}());
