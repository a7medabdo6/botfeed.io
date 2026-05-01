(function () {
  'use strict';

  var SCRIPT = document.currentScript;
  var API_KEY = SCRIPT && SCRIPT.getAttribute('data-widget-id');
  if (!API_KEY) { console.error('[BotfeedWidget] Missing data-widget-id'); return; }

  var BASE_URL = SCRIPT.src.replace(/\/public\/widget\.js.*$/, '').replace(/\/widget\.js.*$/, '');
  var API_BASE = BASE_URL + '/api/public/widget/' + API_KEY;
  var SOCKET_URL = BASE_URL;

  var VISITOR_KEY = 'bf_widget_vid_' + API_KEY.slice(0, 8);

  function uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0;
      return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
    });
  }

  function getVisitorId() {
    var vid = localStorage.getItem(VISITOR_KEY);
    if (!vid) { vid = uuid(); localStorage.setItem(VISITOR_KEY, vid); }
    return vid;
  }

  var visitorId = getVisitorId();
  var config = null;
  var conversationId = null;
  var socket = null;
  var isOpen = false;
  var messages = [];

  /* ---------- Helpers ---------- */
  function el(tag, cls) { var e = document.createElement(tag); if (cls) e.className = cls; return e; }
  function esc(s) { var d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

  /* ---------- Icons ---------- */
  var ICONS = {
    chat: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>',
    close: '<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>',
    send: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>',
    whatsapp: '<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="#25D366"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>',
  };

  /* ============ SHADOW DOM HOST ============ */
  var host = document.createElement('div');
  host.id = 'bf-widget-host';
  document.body.appendChild(host);
  var shadow = host.attachShadow({ mode: 'open' });

  /* ============ STYLES ============ */
  var style = document.createElement('style');
  style.textContent = CSS();
  shadow.appendChild(style);

  /* ============ CONTAINER ============ */
  var container = document.createElement('div');
  container.className = 'bf-widget';
  shadow.appendChild(container);

  /* ============ BUBBLE ============ */
  var bubble = document.createElement('button');
  bubble.className = 'bf-bubble';
  bubble.innerHTML = ICONS.chat;
  bubble.addEventListener('click', toggle);
  container.appendChild(bubble);

  /* ============ PANEL (built after config loads) ============ */
  var panel = document.createElement('div');
  panel.className = 'bf-panel bf-hidden';
  container.appendChild(panel);

  /* ============ INIT ============ */
  fetchConfig();

  /* ---------- API helpers ---------- */
  function fetchConfig() {
    fetch(API_BASE + '/config')
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) return;
        config = res.data;
        applyConfig();
        buildPanel();
      })
      .catch(function (e) { console.error('[BotfeedWidget] config fetch failed', e); });
  }

  function initSession(cb) {
    fetch(API_BASE + '/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ visitor_id: visitorId, referrer: document.referrer, page_url: location.href }),
    })
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (!res.success) return;
        conversationId = res.data.conversation_id;
        loadHistory(cb);
      })
      .catch(function (e) { console.error('[BotfeedWidget] session error', e); });
  }

  function loadHistory(cb) {
    fetch(API_BASE + '/session/' + visitorId + '/messages')
      .then(function (r) { return r.json(); })
      .then(function (res) {
        if (res.success && res.data) {
          messages = res.data;
          renderMessages();
        }
        if (cb) cb();
      })
      .catch(function () { if (cb) cb(); });
  }

  /* ---------- Socket ---------- */
  function connectSocket() {
    if (socket) return;
    var ioScript = document.createElement('script');
    ioScript.src = BASE_URL + '/socket.io/socket.io.js';
    ioScript.onload = function () {
      socket = io(SOCKET_URL + '/widget', {
        auth: { apiKey: API_KEY, visitorId: visitorId, conversationId: conversationId },
        transports: ['websocket', 'polling'],
      });
      socket.on('widget:reply', function (msg) {
        messages.push(msg);
        renderMessages();
      });
      socket.on('widget:escalate', function () {
        appendSystemMsg('You have been connected to a live agent.');
      });
      socket.on('widget:close', function () {
        appendSystemMsg('Conversation closed.');
      });
    };
    document.head.appendChild(ioScript);
  }

  /* ---------- UI Helpers ---------- */
  function applyConfig() {
    if (!config) return;
    var c = config.primary_color || '#0ea5e9';
    style.textContent = CSS(c, config.position || 'right');
  }

  function toggle() {
    isOpen = !isOpen;
    if (isOpen) {
      panel.classList.remove('bf-hidden');
      bubble.innerHTML = ICONS.close;
      if (!conversationId && (config.mode === 'chatbot' || config.mode === 'both')) {
        initSession(function () { connectSocket(); });
      }
    } else {
      panel.classList.add('bf-hidden');
      bubble.innerHTML = ICONS.chat;
    }
  }

  function buildPanel() {
    if (!config) return;
    panel.innerHTML = '';

    // Header
    var header = el('div', 'bf-header');
    header.innerHTML = '<div class="bf-header-text"><div class="bf-title">' + esc(config.title || 'Chat with us') + '</div><div class="bf-subtitle">' + esc(config.subtitle || '') + '</div></div><button class="bf-close">' + ICONS.close + '</button>';
    panel.appendChild(header);
    header.querySelector('.bf-close').addEventListener('click', toggle);

    if (config.mode === 'both') {
      var tabs = el('div', 'bf-tabs');
      var tabChat = el('button', 'bf-tab bf-tab-active');
      tabChat.textContent = 'Chat';
      var tabWa = el('button', 'bf-tab');
      tabWa.textContent = 'WhatsApp';
      tabs.appendChild(tabChat);
      tabs.appendChild(tabWa);
      panel.appendChild(tabs);

      var chatView = buildChatView();
      var waView = buildWaView();
      waView.classList.add('bf-hidden');
      panel.appendChild(chatView);
      panel.appendChild(waView);

      tabChat.addEventListener('click', function () {
        tabChat.classList.add('bf-tab-active'); tabWa.classList.remove('bf-tab-active');
        chatView.classList.remove('bf-hidden'); waView.classList.add('bf-hidden');
      });
      tabWa.addEventListener('click', function () {
        tabWa.classList.add('bf-tab-active'); tabChat.classList.remove('bf-tab-active');
        waView.classList.remove('bf-hidden'); chatView.classList.add('bf-hidden');
      });
    } else if (config.mode === 'chatbot') {
      panel.appendChild(buildChatView());
    } else {
      panel.appendChild(buildWaView());
    }
  }

  function buildChatView() {
    var wrap = el('div', 'bf-chat-view');
    var msgArea = el('div', 'bf-messages');
    msgArea.id = 'bf-msg-area';

    if (config.welcome_message) {
      var welcome = el('div', 'bf-msg bf-msg-bot');
      welcome.textContent = config.welcome_message;
      msgArea.appendChild(welcome);
    }
    wrap.appendChild(msgArea);

    var form = el('form', 'bf-input-bar');
    var input = el('input', 'bf-input');
    input.type = 'text';
    input.placeholder = config.placeholder_text || 'Type a message…';
    input.autocomplete = 'off';
    var btn = el('button', 'bf-send');
    btn.type = 'submit';
    btn.innerHTML = ICONS.send;
    form.appendChild(input);
    form.appendChild(btn);
    wrap.appendChild(form);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) return;
      input.value = '';

      if (socket && conversationId) {
        messages.push({ content: text, direction: 'inbound', sender_type: 'visitor', created_at: new Date().toISOString() });
        renderMessages();
        socket.emit('widget:message', { content: text });
      } else {
        initSession(function () {
          connectSocket();
          messages.push({ content: text, direction: 'inbound', sender_type: 'visitor', created_at: new Date().toISOString() });
          renderMessages();
          if (socket) socket.emit('widget:message', { content: text });
        });
      }
    });

    return wrap;
  }

  function buildWaView() {
    var wrap = el('div', 'bf-wa-view');
    var num = config.whatsapp_number || '';
    var msg = encodeURIComponent(config.prefill_message || '');
    var link = 'https://wa.me/' + num.replace(/[^0-9]/g, '') + (msg ? '?text=' + msg : '');

    wrap.innerHTML = '<div class="bf-wa-body"><div class="bf-wa-icon">' + ICONS.whatsapp + '</div><p class="bf-wa-text">Chat with us on WhatsApp</p><a class="bf-wa-btn" href="' + link + '" target="_blank" rel="noopener">Open WhatsApp</a></div>';
    return wrap;
  }

  function renderMessages() {
    var area = shadow.getElementById('bf-msg-area');
    if (!area) return;
    // keep welcome message node if present
    var nodes = area.querySelectorAll('.bf-msg-dynamic, .bf-msg-system');
    nodes.forEach(function (n) { n.remove(); });

    messages.forEach(function (m) {
      var cls = m.sender_type === 'visitor' ? 'bf-msg bf-msg-user bf-msg-dynamic' : 'bf-msg bf-msg-bot bf-msg-dynamic';
      var d = el('div', cls);
      d.textContent = m.content;
      area.appendChild(d);
    });
    area.scrollTop = area.scrollHeight;
  }

  function appendSystemMsg(text) {
    var area = shadow.getElementById('bf-msg-area');
    if (!area) return;
    var d = el('div', 'bf-msg bf-msg-system');
    d.textContent = text;
    area.appendChild(d);
    area.scrollTop = area.scrollHeight;
  }

  /* ---------- Util ---------- */
  /* ---------- CSS factory ---------- */
  function CSS(primary, position) {
    primary = primary || '#0ea5e9';
    position = position || 'right';
    var posRule = position === 'left' ? 'left:20px;right:auto;' : 'right:20px;left:auto;';
    var bubblePos = position === 'left' ? 'left:20px;right:auto;' : 'right:20px;left:auto;';
    return ':host{all:initial;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}'
      + '.bf-widget{position:fixed;bottom:20px;z-index:2147483647;' + posRule + '}'
      + '.bf-bubble{position:fixed;bottom:20px;' + bubblePos + 'width:60px;height:60px;border-radius:50%;background:' + primary + ';color:#fff;border:none;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(0,0,0,.15);transition:transform .2s;z-index:2147483647;}'
      + '.bf-bubble:hover{transform:scale(1.08);}'
      + '.bf-panel{position:fixed;bottom:90px;' + posRule + 'width:380px;max-width:calc(100vw - 32px);height:520px;max-height:calc(100vh - 120px);background:#fff;border-radius:16px;box-shadow:0 8px 30px rgba(0,0,0,.12);display:flex;flex-direction:column;overflow:hidden;z-index:2147483647;}'
      + '.bf-hidden{display:none!important;}'
      + '.bf-header{background:' + primary + ';color:#fff;padding:16px 18px;display:flex;align-items:center;justify-content:space-between;}'
      + '.bf-header-text{flex:1;}'
      + '.bf-title{font-size:16px;font-weight:600;}'
      + '.bf-subtitle{font-size:12px;opacity:.85;margin-top:2px;}'
      + '.bf-close{background:none;border:none;color:#fff;cursor:pointer;padding:4px;display:flex;align-items:center;justify-content:center;}'
      + '.bf-tabs{display:flex;border-bottom:1px solid #e5e7eb;}'
      + '.bf-tab{flex:1;padding:10px;font-size:13px;font-weight:500;background:none;border:none;cursor:pointer;color:#6b7280;border-bottom:2px solid transparent;transition:all .2s;}'
      + '.bf-tab-active{color:' + primary + ';border-bottom-color:' + primary + ';}'
      + '.bf-chat-view{display:flex;flex-direction:column;flex:1;min-height:0;}'
      + '.bf-messages{flex:1;overflow-y:auto;padding:14px;display:flex;flex-direction:column;gap:8px;}'
      + '.bf-msg{max-width:80%;padding:10px 14px;border-radius:14px;font-size:14px;line-height:1.45;word-break:break-word;}'
      + '.bf-msg-bot{align-self:flex-start;background:#f3f4f6;color:#111827;border-bottom-left-radius:4px;}'
      + '.bf-msg-user{align-self:flex-end;background:' + primary + ';color:#fff;border-bottom-right-radius:4px;}'
      + '.bf-msg-system{align-self:center;background:transparent;color:#6b7280;font-size:12px;font-style:italic;}'
      + '.bf-input-bar{display:flex;align-items:center;border-top:1px solid #e5e7eb;padding:8px 10px;gap:8px;}'
      + '.bf-input{flex:1;border:1px solid #d1d5db;border-radius:20px;padding:8px 14px;font-size:14px;outline:none;transition:border-color .2s;}'
      + '.bf-input:focus{border-color:' + primary + ';}'
      + '.bf-send{background:' + primary + ';color:#fff;border:none;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;}'
      + '.bf-send:hover{opacity:.9;}'
      + '.bf-wa-view{flex:1;display:flex;align-items:center;justify-content:center;padding:24px;}'
      + '.bf-wa-body{text-align:center;}'
      + '.bf-wa-icon{margin-bottom:16px;}'
      + '.bf-wa-text{font-size:15px;color:#374151;margin-bottom:16px;}'
      + '.bf-wa-btn{display:inline-block;background:#25D366;color:#fff;padding:12px 28px;border-radius:24px;text-decoration:none;font-weight:600;font-size:15px;transition:opacity .2s;}'
      + '.bf-wa-btn:hover{opacity:.9;}'
      + '@media(max-width:480px){.bf-panel{width:100vw;height:100vh;max-height:100vh;bottom:0;left:0;right:0;border-radius:0;}}';
  }
})();
