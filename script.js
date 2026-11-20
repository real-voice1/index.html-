/* REAL VOICE — المرحلة الأولى: الواجهة والتفاعلات (بيانات محلية على الجهاز) */
(function () {
  "use strict";

  /* ========= إعدادات مركزية (تُعدَّل في المراحل القادمة) ========= */
  var CONFIG = {
    storageKey: "rv_state_v1",
    startCoins: 1000,
    xpPerLevel: 100,
    badWords: ["شتيمة", "قذر", "حقير", "غبي", "كلب", "حمار"]
  };

  var GIFTS = [
    { id: "heart", e: "❤️", n: "قلب", p: 10 },
    { id: "rose", e: "🌹", n: "وردة", p: 25 },
    { id: "crown", e: "👑", n: "تاج", p: 150 },
    { id: "car", e: "🏎️", n: "سيارة", p: 300 },
    { id: "rocket", e: "🚀", n: "صاروخ", p: 500 },
    { id: "diamond", e: "💎", n: "ألماس", p: 800 },
    { id: "vip", e: "🦁", n: "أسد VIP", p: 1500 },
    { id: "castle", e: "🏰", n: "قصر متحرك", p: 3000 }
  ];
  var EMOJIS = ["😀", "😂", "😍", "🔥", "👏", "❤️", "😎", "🎉", "🙏", "😢", "👍", "💎"];
  var CATEGORIES = { chat: "دردشة", games: "ألعاب", vip: "VIP", music: "موسيقى", friends: "أصدقاء" };
  var COVERS = ["#7c3aed", "#2563eb", "#db2777", "#0891b2", "#ea580c", "#16a34a"];
  var COVER_ICONS = ["🎙️", "🎮", "🎵", "👑", "☕", "🌙"];
  var ACHIEVEMENTS = [
    { id: "first", t: "🎙️ أول دخول" },
    { id: "chatter", t: "💬 أرسلت 5 رسائل" },
    { id: "giver", t: "🎁 أرسلت هدية" },
    { id: "host", t: "🏠 أنشأت غرفة" },
    { id: "social", t: "👥 أضفت صديقاً" },
    { id: "lvl3", t: "⭐ وصلت المستوى 3" }
  ];

  /* ========= أدوات ========= */
  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(n) { n = String(n || "").trim(); return n ? n.slice(0, 2) : "RV"; }
  function now() { return Date.now(); }
  function timeStr(t) {
    var d = new Date(t);
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function uid() { return "u" + Math.random().toString(36).slice(2, 9); }
  function clean(text) {
    var out = String(text);
    CONFIG.badWords.forEach(function (w) { out = out.split(w).join("***"); });
    return out;
  }
  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  /* ========= الحالة ========= */
  var S = null;       // الحالة المحفوظة
  var UI = {          // حالة الواجهة المؤقتة
    page: "home", filter: "all", rfilter: "mine", ftab: "friends", query: "", findQ: "",
    roomId: null, dmId: null, msgColor: "", micMuted: false, giftSel: "heart", giftTarget: "room"
  };

  function demoUsers() {
    return [
      { id: "RV-1001", name: "ليلى", online: true, bio: "أحب الموسيقى 🎵", vip: 2, level: 7 },
      { id: "RV-1002", name: "أحمد", online: true, bio: "لاعب محترف 🎮", vip: 0, level: 4 },
      { id: "RV-1003", name: "سارة", online: false, bio: "هنا للدردشة ☕", vip: 1, level: 5 },
      { id: "RV-1004", name: "خالد", online: true, bio: "صاحب غرف VIP 👑", vip: 4, level: 12 },
      { id: "RV-1005", name: "مريم", online: false, bio: "مرحباً بالجميع", vip: 0, level: 2 },
      { id: "RV-1006", name: "يوسف", online: true, bio: "تحدي الأسئلة 🧠", vip: 3, level: 9 }
    ];
  }
  function makeSeats(n, occ) {
    var seats = [];
    for (var i = 0; i < n; i++) seats.push({ uid: occ && occ[i] ? occ[i] : null, locked: false, muted: false, vip: i === 0 });
    return seats;
  }
  function demoRooms() {
    var t = now();
    return [
      { id: "r1", name: "سهرة الأصدقاء", desc: "دردشة مفتوحة للجميع", cat: "friends", owner: "RV-1001", mods: [], seats: makeSeats(9, ["RV-1001", "RV-1002", "RV-1003"]), listeners: ["RV-1004", "RV-1005"], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 7200000, msgs: [], color: 0, icon: 0, recvTop: {} },
      { id: "r2", name: "تحدي الأسئلة", desc: "مسابقات وجوائز", cat: "games", owner: "RV-1006", mods: [], seats: makeSeats(6, ["RV-1006", "RV-1002"]), listeners: ["RV-1003"], bans: [], pass: "", priv: false, locked: false, pinned: "مسابقة اليوم الساعة 9 مساءً", created: t - 3600000, msgs: [], color: 1, icon: 1, recvTop: {} },
      { id: "r3", name: "قصر الملوك", desc: "غرفة VIP حصرية", cat: "vip", owner: "RV-1004", mods: [], seats: makeSeats(12, ["RV-1004"]), listeners: ["RV-1001", "RV-1006", "RV-1002", "RV-1003"], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 86400000, msgs: [], color: 3, icon: 3, recvTop: {} },
      { id: "r4", name: "ليالي الطرب", desc: "أغاني وموسيقى", cat: "music", owner: "RV-1003", mods: [], seats: makeSeats(4, ["RV-1003"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 600000, msgs: [], color: 2, icon: 2, recvTop: {} }
    ];
  }
  function freshState() {
    return {
      me: { id: "RV-" + Math.floor(10000 + Math.random() * 89999), name: "مستخدم جديد", bio: "مرحباً! أنا جديد في REAL VOICE 👋", coins: CONFIG.startCoins, xp: 0, vip: 0, followers: 0, following: 0, visits: 0, joined: now(), country: "🌍 غير محدد", gifts: 0, sent: 0, msgCount: 0, ach: {} },
      users: demoUsers(), rooms: demoRooms(),
      friends: ["RV-1001", "RV-1004"], requests: ["RV-1002"], sentReq: [], blocked: [], follows: [],
      dms: {}, unread: {}, notifs: [], txs: [], giftsLog: [],
      settings: { notif: true, sound: true }
    };
  }
  function load() {
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) { S = JSON.parse(raw); if (S && S.me && S.rooms) return; }
    } catch (e) { /* تجاهل */ }
    S = freshState();
    addNotif("🎉", "أهلاً بك في REAL VOICE! حصلت على " + CONFIG.startCoins + " عملة هدية.");
    addNotif("👥", "أحمد أرسل لك طلب صداقة.");
    save();
  }
  function save() { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(S)); } catch (e) { /* تجاهل */ } }

  /* ========= بيانات مساعدة ========= */
  function getUser(id) {
    if (id === S.me.id) return { id: S.me.id, name: S.me.name, online: true, bio: S.me.bio, vip: S.me.vip, level: level(), me: true };
    for (var i = 0; i < S.users.length; i++) if (S.users[i].id === id) return S.users[i];
    return { id: id, name: "مستخدم", online: false, bio: "", vip: 0, level: 1 };
  }
  function getRoom(id) { for (var i = 0; i < S.rooms.length; i++) if (S.rooms[i].id === id) return S.rooms[i]; return null; }
  function level() { return Math.floor(S.me.xp / CONFIG.xpPerLevel) + 1; }
  function addXP(n) {
    var before = level();
    S.me.xp += n;
    var after = level();
    if (after > before) {
      S.me.coins += after * 20;
      addNotif("⭐", "ارتفع مستواك إلى " + after + "! مكافأتك " + after * 20 + " عملة.");
      toast("🎉 مستوى جديد: " + after);
    }
    if (after >= 3) S.me.ach.lvl3 = true;
  }
  function addNotif(icon, text) {
    S.notifs.unshift({ id: uid(), icon: icon, text: text, t: now(), read: false });
    if (S.notifs.length > 60) S.notifs.length = 60;
  }
  function count(room) {
    var n = room.listeners.length;
    room.seats.forEach(function (s) { if (s.uid) n++; });
    return n;
  }
  function seatIndexOf(room, id) {
    for (var i = 0; i < room.seats.length; i++) if (room.seats[i].uid === id) return i;
    return -1;
  }
  function inRoom(room, id) { return seatIndexOf(room, id) >= 0 || room.listeners.indexOf(id) >= 0; }
  function role(room, id) {
    if (room.owner === id) return "owner";
    if (room.mods.indexOf(id) >= 0) return "mod";
    return "user";
  }
  function avatarHTML(u, cls) {
    return '<div class="avatar ' + (cls || "") + '">' + esc(initials(u.name)) + "</div>";
  }
  function userNameHTML(u) {
    var v = u.vip > 0 ? '<span class="tag vip">VIP' + u.vip + "</span>" : "";
    return esc(u.name) + v;
  }

  /* ========= التنقل ========= */
  function go(page) {
    UI.page = page;
    document.querySelectorAll(".page").forEach(function (p) { p.classList.toggle("active", p.id === "page-" + page); });
    document.querySelectorAll(".navbtn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-page") === page); });
    var pg = $("page-" + page);
    if (pg) pg.scrollTop = 0;
    renderAll();
  }

  /* ========= رسم الصفحات ========= */
  function renderTop() {
    $("coins-top").textContent = S.me.coins;
    $("level-top").textContent = level();
    $("avatar-top").textContent = initials(S.me.name);
    var unread = S.notifs.filter(function (n) { return !n.read; }).length;
    var b = $("notif-badge");
    b.textContent = unread; b.classList.toggle("hidden", unread === 0);
    var mu = 0; for (var k in S.unread) mu += S.unread[k] || 0;
    var mb = $("msg-badge"); mb.textContent = mu; mb.classList.toggle("hidden", mu === 0);
    var fb = $("friends-badge"); fb.textContent = S.requests.length; fb.classList.toggle("hidden", S.requests.length === 0);
  }

  function roomCard(r) {
    var owner = getUser(r.owner);
    var lock = r.pass ? "🔒 " : (r.priv ? "🕵️ " : "");
    return '<div class="row glass">' +
      '<div class="roomcover" style="background:' + COVERS[r.color % COVERS.length] + '">' + COVER_ICONS[r.icon % COVER_ICONS.length] + "</div>" +
      '<div class="info"><div class="name">' + lock + esc(r.name) + '<span class="tag">' + esc(CATEGORIES[r.cat] || "عام") + "</span></div>" +
      '<div class="meta">👤 ' + esc(owner.name) + " • 🎧 " + count(r) + " • 🪑 " + r.seats.filter(function (s) { return s.uid; }).length + "/" + r.seats.length + "</div>" +
      '<div class="meta">' + esc(r.desc || "") + "</div></div>" +
      '<button class="btn sm" data-enter="' + r.id + '" type="button">دخول</button></div>';
  }

  function filterRooms() {
    var list = S.rooms.filter(function (r) { return !r.priv || r.owner === S.me.id || inRoom(r, S.me.id); });
    var q = UI.query.trim().toLowerCase();
    if (q) list = list.filter(function (r) { return r.name.toLowerCase().indexOf(q) >= 0 || r.id.toLowerCase().indexOf(q) >= 0 || (r.desc || "").toLowerCase().indexOf(q) >= 0; });
    var f = UI.filter;
    if (f === "popular") list = list.slice().sort(function (a, b) { return count(b) - count(a); });
    else if (f === "new") list = list.slice().sort(function (a, b) { return b.created - a.created; });
    else if (f === "friends") list = list.filter(function (r) { return S.friends.some(function (fid) { return inRoom(r, fid); }); });
    else if (f === "vip") list = list.filter(function (r) { return r.cat === "vip"; });
    else if (f === "games") list = list.filter(function (r) { return r.cat === "games"; });
    return list;
  }

  function renderHome() {
    var list = filterRooms();
    $("home-rooms").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty">لا توجد غرف مطابقة 🔎</div>';
    var box = $("search-users");
    var q = UI.query.trim().toLowerCase();
    if (q) {
      var us = S.users.filter(function (u) { return u.name.toLowerCase().indexOf(q) >= 0 || u.id.toLowerCase().indexOf(q) >= 0; });
      box.classList.toggle("hidden", us.length === 0);
      box.innerHTML = us.length ? '<h2 class="title">المستخدمون</h2>' + us.map(function (u) {
        return '<div class="row glass" data-profile="' + u.id + '">' + avatarHTML(u) + '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + esc(u.id) + "</div></div></div>";
      }).join("") : "";
    } else { box.classList.add("hidden"); box.innerHTML = ""; }
    document.querySelectorAll("#home-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-filter") === UI.filter); });
  }

  function renderRooms() {
    var list = UI.rfilter === "mine"
      ? S.rooms.filter(function (r) { return r.owner === S.me.id; })
      : S.rooms.filter(function (r) { return (!r.priv || r.owner === S.me.id) && count(r) > 0; }).sort(function (a, b) { return count(b) - count(a); });
    $("rooms-list").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty">' + (UI.rfilter === "mine" ? "لم تنشئ غرفة بعد. اضغط ＋ لإنشاء غرفتك الأولى" : "لا توجد غرف نشطة") + "</div>";
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-rfilter") === UI.rfilter); });
  }

  function personRow(u, actions) {
    var where = "";
    for (var i = 0; i < S.rooms.length; i++) if (inRoom(S.rooms[i], u.id)) { where = " • في غرفة: " + esc(S.rooms[i].name); break; }
    return '<div class="row glass"><div data-profile="' + u.id + '" style="position:relative">' + avatarHTML(u) + '<span class="dot ' + (u.online ? "on" : "") + '"></span></div>' +
      '<div class="info" data-profile="' + u.id + '"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + (u.online ? "متصل" : "غير متصل") + where + "</div></div>" + actions + "</div>";
  }

  function renderFriends() {
    $("req-count").textContent = S.requests.length ? "(" + S.requests.length + ")" : "";
    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-ftab") === UI.ftab); });
    $("find-box").classList.toggle("hidden", UI.ftab !== "find");
    var html = "";
    if (UI.ftab === "friends") {
      var fr = S.friends.map(getUser).sort(function (a, b) { return (b.online ? 1 : 0) - (a.online ? 1 : 0); });
      html = fr.length ? fr.map(function (u) {
        var room = null;
        for (var i = 0; i < S.rooms.length; i++) if (inRoom(S.rooms[i], u.id)) { room = S.rooms[i]; break; }
        var btns = (room ? '<button class="btn sm" data-enter="' + room.id + '" type="button">🚪 انضم</button>' : "") +
          '<button class="btn sm ghost" data-dm="' + u.id + '" type="button">💬</button>';
        return personRow(u, btns);
      }).join("") : '<div class="empty">لا يوجد أصدقاء بعد. استخدم تبويب "بحث" لإضافة أصدقاء</div>';
    } else if (UI.ftab === "requests") {
      html = S.requests.length ? S.requests.map(function (id) {
        return personRow(getUser(id), '<button class="btn sm" data-accept="' + id + '" type="button">قبول</button><button class="btn sm ghost" data-reject="' + id + '" type="button">رفض</button>');
      }).join("") : '<div class="empty">لا توجد طلبات صداقة</div>';
      if (S.sentReq.length) {
        html += '<h2 class="title">طلبات أرسلتها</h2>' + S.sentReq.map(function (id) {
          return personRow(getUser(id), '<button class="btn sm ghost" data-cancelreq="' + id + '" type="button">إلغاء</button>');
        }).join("");
      }
    } else {
      var q = UI.findQ.trim().toLowerCase();
      var res = S.users.filter(function (u) { return !q || u.name.toLowerCase().indexOf(q) >= 0 || u.id.toLowerCase().indexOf(q) >= 0; });
      html = res.length ? res.map(function (u) {
        var btn;
        if (S.friends.indexOf(u.id) >= 0) btn = '<span class="small">صديق ✔</span>';
        else if (S.sentReq.indexOf(u.id) >= 0) btn = '<span class="small">تم الإرسال</span>';
        else btn = '<button class="btn sm" data-addfriend="' + u.id + '" type="button">+ إضافة</button>';
        return personRow(u, btn);
      }).join("") : '<div class="empty">لا نتائج</div>';
    }
    $("friends-list").innerHTML = html;
  }

  function renderMessages() {
    var ids = Object.keys(S.dms).filter(function (id) { return S.dms[id].length && S.blocked.indexOf(id) < 0; });
    ids.sort(function (a, b) { return S.dms[b][S.dms[b].length - 1].t - S.dms[a][S.dms[a].length - 1].t; });
    $("dm-list").innerHTML = ids.length ? ids.map(function (id) {
      var u = getUser(id), last = S.dms[id][S.dms[id].length - 1], un = S.unread[id] || 0;
      return '<div class="row glass" data-dm="' + id + '">' + avatarHTML(u) + '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + (last.from === S.me.id ? "أنت: " : "") + esc(last.text) + '</div></div><div style="text-align:left"><div class="small">' + timeStr(last.t) + "</div>" + (un ? '<span class="badge" style="position:static;display:inline-flex;margin-top:4px">' + un + "</span>" : "") + "</div></div>";
    }).join("") : '<div class="empty">لا توجد محادثات بعد.<br>افتح ملف صديق واضغط "رسالة".</div>';
  }

  function renderProfile() {
    var m = S.me, lv = level(), into = m.xp % CONFIG.xpPerLevel;
    $("pf-avatar").textContent = initials(m.name);
    $("pf-name").textContent = m.name;
    $("pf-id").textContent = "ID: " + m.id;
    $("pf-badges").innerHTML = '<span class="tag">المستوى ' + lv + "</span>" + (m.vip > 0 ? '<span class="tag vip">👑 VIP ' + m.vip + "</span>" : "");
    $("pf-level").textContent = lv;
    $("pf-xp").textContent = into + " / " + CONFIG.xpPerLevel + " XP";
    $("pf-bar").style.width = (into / CONFIG.xpPerLevel * 100) + "%";
    $("pf-coins").textContent = m.coins;
    $("pf-friends").textContent = S.friends.length;
    $("pf-visits").textContent = m.visits;
    $("pf-followers").textContent = m.followers;
    $("pf-following").textContent = S.follows.length;
    $("pf-gifts").textContent = m.gifts;
    $("pf-bio").textContent = m.bio;
    $("pf-meta").textContent = m.country + " • انضم في " + new Date(m.joined).toLocaleDateString("ar");
    $("pf-ach").innerHTML = ACHIEVEMENTS.map(function (a) { return '<span class="' + (m.ach[a.id] ? "" : "off") + '">' + a.t + "</span>"; }).join("");
  }

  function renderAll() {
    renderTop();
    if (UI.page === "home") renderHome();
    else if (UI.page === "rooms") renderRooms();
    else if (UI.page === "friends") renderFriends();
    else if (UI.page === "messages") renderMessages();
    else if (UI.page === "profile") renderProfile();
  }

  /* ========= النوافذ السفلية ========= */
  function openSheet(html) { $("sheet").innerHTML = html; $("scrim").classList.add("open"); }
  function closeSheet() { $("scrim").classList.remove("open"); }

  function actionList(title, items) {
    // items: [{label, fn, danger}]
    var html = "<h3>" + esc(title) + '</h3><div class="actlist">';
    items.forEach(function (it, i) { html += '<button class="' + (it.danger ? "danger" : "") + '" data-act="' + i + '" type="button">' + esc(it.label) + "</button>"; });
    html += '<button data-act="cancel" type="button">إلغاء</button></div>';
    openSheet(html);
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var a = b.getAttribute("data-act");
      closeSheet();
      if (a !== "cancel") items[Number(a)].fn();
    };
  }

  function confirmBox(text, yes) {
    openSheet("<h3>تأكيد</h3><p style='margin-bottom:14px;line-height:1.7'>" + esc(text) + '</p><div style="display:flex;gap:10px"><button class="btn" id="cf-yes" style="flex:1" type="button">تأكيد</button><button class="btn ghost" id="cf-no" style="flex:1" type="button">إلغاء</button></div>');
    $("sheet").onclick = null;
    $("cf-yes").onclick = function () { closeSheet(); yes(); };
    $("cf-no").onclick = closeSheet;
  }

  /* ========= الإشعارات ========= */
  function openNotifs() {
    var html = "<h3>🔔 الإشعارات</h3>";
    if (!S.notifs.length) html += '<div class="empty">لا توجد إشعارات</div>';
    S.notifs.forEach(function (n) {
      html += '<div class="row glass" style="margin-bottom:8px"><div style="font-size:24px">' + n.icon + '</div><div class="info"><div class="name" style="white-space:normal;font-weight:' + (n.read ? "normal" : "bold") + '">' + esc(n.text) + '</div><div class="meta">' + timeStr(n.t) + '</div></div><button class="btn sm ghost" data-delnotif="' + n.id + '" type="button">🗑</button></div>';
    });
    if (S.notifs.length) html += '<button class="btn red block" id="clear-notifs" type="button">مسح الكل</button>';
    openSheet(html);
    S.notifs.forEach(function (n) { n.read = true; });
    save(); renderTop();
    $("sheet").onclick = function (e) {
      var d = e.target.closest("[data-delnotif]");
      if (d) {
        S.notifs = S.notifs.filter(function (n) { return n.id !== d.getAttribute("data-delnotif"); });
        save(); openNotifs(); return;
      }
      if (e.target.id === "clear-notifs") { S.notifs = []; save(); openNotifs(); }
    };
  }

  /* ========= إنشاء غرفة ========= */
  function openCreateRoom() {
    var cats = Object.keys(CATEGORIES).map(function (k) { return '<option value="' + k + '">' + CATEGORIES[k] + "</option>"; }).join("");
    openSheet("<h3>🎙️ إنشاء غرفة جديدة</h3>" +
      '<label>اسم الغرفة</label><input id="cr-name" maxlength="30" placeholder="مثال: سهرة الليل" />' +
      '<label>وصف الغرفة</label><input id="cr-desc" maxlength="80" placeholder="وصف قصير" />' +
      '<label>التصنيف</label><select id="cr-cat">' + cats + "</select>" +
      '<label>عدد المقاعد</label><select id="cr-seats"><option value="4">4</option><option value="6">6</option><option value="9" selected>9</option><option value="12">12</option></select>' +
      '<label>كلمة المرور (اختياري)</label><input id="cr-pass" maxlength="20" placeholder="اتركها فارغة للغرفة المفتوحة" />' +
      '<label>نوع الغرفة</label><select id="cr-priv"><option value="0">عامة</option><option value="1">خاصة (لا تظهر في القائمة)</option></select>' +
      '<button class="btn block" id="cr-ok" type="button">إنشاء الغرفة</button>');
    $("sheet").onclick = null;
    $("cr-ok").onclick = function () {
      var name = $("cr-name").value.trim();
      if (!name) { toast("اكتب اسم الغرفة أولاً"); return; }
      var n = Number($("cr-seats").value);
      var room = {
        id: "r" + Math.random().toString(36).slice(2, 7), name: clean(name), desc: clean($("cr-desc").value.trim()), cat: $("cr-cat").value,
        owner: S.me.id, mods: [], seats: makeSeats(n, []), listeners: [], bans: [], pass: $("cr-pass").value.trim(),
        priv: $("cr-priv").value === "1", locked: false, pinned: "", created: now(), msgs: [],
        color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length), recvTop: {}
      };
      S.rooms.unshift(room);
      S.me.ach.host = true;
      addXP(20);
      save(); closeSheet(); renderAll();
      toast("تم إنشاء الغرفة ✅");
      enterRoom(room.id, true);
    };
  }

  /* ========= الدخول للغرفة ========= */
  function enterRoom(id, skipPass) {
    var room = getRoom(id);
    if (!room) { toast("الغرفة غير موجودة"); return; }
    if (room.bans.indexOf(S.me.id) >= 0) { toast("أنت محظور من هذه الغرفة 🚫"); return; }
    if (room.locked && room.owner !== S.me.id && !inRoom(room, S.me.id)) { toast("الغرفة مقفلة من المالك 🔒"); return; }
    if (room.pass && !skipPass && room.owner !== S.me.id && !inRoom(room, S.me.id)) {
      openSheet('<h3>🔒 الغرفة محمية</h3><label>أدخل كلمة المرور</label><input id="pw-in" type="password" /><button class="btn block" id="pw-ok" type="button">دخول</button>');
      $("sheet").onclick = null;
      $("pw-ok").onclick = function () {
        if ($("pw-in").value === room.pass) { closeSheet(); enterRoom(id, true); }
        else toast("كلمة المرور خاطئة");
      };
      return;
    }
    if (UI.roomId && UI.roomId !== id) leaveRoom(true);
    if (!inRoom(room, S.me.id)) {
      room.listeners.push(S.me.id);
      room.msgs.push({ sys: true, text: S.me.name + " دخل الغرفة 👋", t: now() });
      S.me.visits++;
      S.me.ach.first = true;
      addXP(5);
    }
    UI.roomId = id;
    UI.micMuted = false;
    save();
    $("room-view").classList.add("open");
    renderRoom();
    simulateRoomActivity(room);
  }

  function leaveRoom(silent) {
    var room = getRoom(UI.roomId);
    if (room) {
      var si = seatIndexOf(room, S.me.id);
      if (si >= 0) room.seats[si].uid = null;
      room.listeners = room.listeners.filter(function (x) { return x !== S.me.id; });
      room.msgs.push({ sys: true, text: S.me.name + " غادر الغرفة", t: now() });
    }
    UI.roomId = null;
    save();
    $("room-view").classList.remove("open");
    if (!silent) renderAll();
  }

  /* نشاط تجريبي للمستخدمين الوهميين داخل الغرف التجريبية (يختفي عند ربط Firebase) */
  var simTimer = null;
  function simulateRoomActivity(room) {
    clearInterval(simTimer);
    var lines = ["مساء الخير 🌙", "كيف حالكم؟", "الصوت واضح؟", "😂😂", "أهلاً بالجميع 👋", "رائع! 🔥"];
    simTimer = setInterval(function () {
      if (UI.roomId !== room.id) { clearInterval(simTimer); return; }
      var pool = [];
      room.seats.forEach(function (s) { if (s.uid && s.uid !== S.me.id && s.uid.indexOf("RV-1") === 0) pool.push(s.uid); });
      room.listeners.forEach(function (l) { if (l !== S.me.id && l.indexOf("RV-1") === 0) pool.push(l); });
      if (!pool.length) return;
      var who = pool[Math.floor(Math.random() * pool.length)];
      room.msgs.push({ from: who, text: lines[Math.floor(Math.random() * lines.length)], t: now(), color: "" });
      if (room.msgs.length > 120) room.msgs.shift();
      renderRoomChat();
    }, 9000);
  }

  /* ========= رسم الغرفة ========= */
  function renderRoom() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var mySeat = seatIndexOf(room, S.me.id);
    $("room-title").textContent = (room.pass ? "🔒 " : "") + room.name;
    $("room-sub").textContent = "ID: " + room.id + " • 🎧 " + count(room) + " • " + (CATEGORIES[room.cat] || "");
    var pin = $("room-pinned");
    pin.classList.toggle("hidden", !room.pinned);
    pin.textContent = "📌 " + room.pinned;
    var cols = { 4: 4, 6: 3, 9: 3, 12: 4 }[room.seats.length] || 3;
    var grid = $("room-seats");
    grid.style.gridTemplateColumns = "repeat(" + cols + ",1fr)";
    grid.innerHTML = room.seats.map(function (s, i) {
      var cls = "seat", inner, name, sub;
      if (s.uid) {
        var u = getUser(s.uid);
        cls += " occ" + (u.vip > 0 || s.vip ? " vip" : "") + (!s.muted && !(s.uid === S.me.id && UI.micMuted) ? " speak" : "");
        inner = esc(initials(u.name)) + ((s.muted || (s.uid === S.me.id && UI.micMuted)) ? '<span class="mutedmark">🔇</span>' : "");
        name = esc(u.name); sub = s.uid === room.owner ? "👑 المالك" : (room.mods.indexOf(s.uid) >= 0 ? "🛡️ مشرف" : (u.me ? "أنت" : "متحدث"));
      } else if (s.locked) { cls += " locked"; inner = "🔒"; name = "مقفل"; sub = "مقعد " + (i + 1); }
      else { inner = s.vip ? "👑" : "+"; name = "مقعد " + (i + 1); sub = s.vip ? "VIP" : "فارغ"; }
      return '<div class="seat ' + cls.replace("seat ", "") + '" data-seat="' + i + '"><div class="seatav">' + inner + '</div><div class="seatname">' + name + '</div><div class="seatsub">' + sub + "</div></div>";
    }).join("");
    var mic = $("mic-btn");
    var onSeat = mySeat >= 0;
    mic.classList.toggle("hidden", !onSeat);
    mic.classList.toggle("off", UI.micMuted);
    mic.classList.toggle("on", !UI.micMuted);
    mic.textContent = UI.micMuted ? "🔇" : "🎤";
    renderRoomChat();
  }

  function renderRoomChat() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var box = $("room-chat");
    var stick = box.scrollTop + box.clientHeight >= box.scrollHeight - 40;
    box.innerHTML = room.msgs.map(function (m, i) {
      if (m.sys) return '<div class="msg sys">' + esc(m.text) + "</div>";
      var u = getUser(m.from), me = m.from === S.me.id;
      return '<div class="msg ' + (me ? "me " : "") + (m.color ? "col-" + m.color : "") + '"' + (me ? ' data-delmsg="' + i + '"' : "") + '><div class="who">' + userNameHTML(u) + "</div>" + esc(m.text) + '<div class="tm">' + timeStr(m.t) + (me ? " • اضغط للحذف" : "") + "</div></div>";
    }).join("");
    if (stick) box.scrollTop = box.scrollHeight;
  }

  function sendRoomMsg(text) {
    var room = getRoom(UI.roomId);
    text = String(text || "").trim();
    if (!room || !text) return;
    room.msgs.push({ from: S.me.id, text: clean(text), t: now(), color: UI.msgColor });
    S.me.msgCount++;
    if (S.me.msgCount >= 5) S.me.ach.chatter = true;
    addXP(2);
    save(); renderRoomChat(); renderTop();
  }

  /* ========= المقاعد ========= */
  function onSeatTap(i) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var s = room.seats[i], myRole = role(room, S.me.id), mySeat = seatIndexOf(room, S.me.id);
    var canManage = myRole === "owner" || myRole === "mod";
    var items = [];
    if (!s.uid) {
      if (s.locked && !canManage) { toast("هذا المقعد مقفل 🔒"); return; }
      if (!s.locked) items.push({ label: mySeat >= 0 ? "🪑 انتقل إلى هذا المقعد" : "🪑 اصعد إلى المايك", fn: function () { takeSeat(room, i); } });
      if (canManage) items.push({ label: s.locked ? "🔓 فتح المقعد" : "🔒 قفل المقعد", fn: function () { s.locked = !s.locked; save(); renderRoom(); } });
      if (myRole === "owner") items.push({ label: s.vip ? "إلغاء VIP للمقعد" : "👑 جعل المقعد VIP", fn: function () { s.vip = !s.vip; save(); renderRoom(); } });
      if (!items.length) return;
      actionList("مقعد " + (i + 1), items);
      return;
    }
    var u = getUser(s.uid);
    items.push({ label: "👤 عرض الملف الشخصي", fn: function () { openProfile(s.uid); } });
    if (s.uid !== S.me.id) items.push({ label: "🎁 إرسال هدية", fn: function () { openGifts(s.uid); } });
    if (s.uid === S.me.id) {
      items.push({ label: "⬇️ مغادرة المقعد", fn: function () { s.uid = null; UI.micMuted = false; room.listeners.push(S.me.id); save(); renderRoom(); } });
    } else if (canManage && s.uid !== room.owner && !(myRole === "mod" && room.mods.indexOf(s.uid) >= 0)) {
      items.push({ label: s.muted ? "🔊 إلغاء كتم المستخدم" : "🔇 كتم المستخدم", fn: function () { s.muted = !s.muted; toast(s.muted ? "تم كتم " + u.name : "تم إلغاء الكتم"); save(); renderRoom(); } });
      items.push({ label: "⬇️ إنزال من المقعد", fn: function () { s.uid = null; room.listeners.push(u.id); save(); renderRoom(); toast("تم إنزال " + u.name); } });
      items.push({ label: s.locked ? "🔓 فتح المقعد" : "🔒 قفل المقعد بعد الإنزال", fn: function () { s.uid = null; s.locked = true; room.listeners.push(u.id); save(); renderRoom(); } });
      if (myRole === "owner") items.push({ label: room.mods.indexOf(u.id) >= 0 ? "إزالة الإشراف" : "🛡️ تعيين مشرف", fn: function () { toggleMod(room, u.id); } });
      items.push({ label: "🚫 طرد من الغرفة", danger: true, fn: function () { kickUser(room, u.id, false); } });
      items.push({ label: "⛔ حظر من الغرفة", danger: true, fn: function () { kickUser(room, u.id, true); } });
    }
    if (canManage && mySeat >= 0 && mySeat !== i && s.uid !== S.me.id) {
      items.push({ label: "🔄 تبديل المكان معي", fn: function () { var a = room.seats[mySeat].uid; room.seats[mySeat].uid = s.uid; s.uid = a; save(); renderRoom(); } });
    }
    actionList(u.name, items);
  }

  function takeSeat(room, i) {
    var cur = seatIndexOf(room, S.me.id);
    if (cur >= 0) room.seats[cur].uid = null;
    room.listeners = room.listeners.filter(function (x) { return x !== S.me.id; });
    room.seats[i].uid = S.me.id;
    UI.micMuted = false;
    room.msgs.push({ sys: true, text: S.me.name + " صعد إلى المايك 🎤", t: now() });
    addXP(3);
    save(); renderRoom(); renderTop();
  }

  function toggleMod(room, id) {
    var k = room.mods.indexOf(id);
    if (k >= 0) room.mods.splice(k, 1); else room.mods.push(id);
    toast(k >= 0 ? "تمت إزالة الإشراف" : "تم تعيين مشرف 🛡️");
    save(); renderRoom();
  }

  function kickUser(room, id, ban) {
    var si = seatIndexOf(room, id);
    if (si >= 0) room.seats[si].uid = null;
    room.listeners = room.listeners.filter(function (x) { return x !== id; });
    if (ban && room.bans.indexOf(id) < 0) room.bans.push(id);
    room.msgs.push({ sys: true, text: getUser(id).name + (ban ? " تم حظره من الغرفة" : " تم طرده من الغرفة"), t: now() });
    save(); renderRoom();
  }

  /* قائمة الغرفة */
  function openRoomMenu() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var r = role(room, S.me.id), items = [];
    items.push({ label: "👥 عرض الموجودين (" + count(room) + ")", fn: function () { showMembers(room); } });
    items.push({ label: "🔗 نسخ رابط الغرفة", fn: copyRoomLink });
    items.push({ label: "💬 مشاركة عبر واتساب", fn: function () { window.open("https://wa.me/?text=" + encodeURIComponent("انضم إلى غرفتي في REAL VOICE: " + room.name + " — " + roomLink(room)), "_blank"); } });
    items.push({ label: "📨 دعوة صديق", fn: function () { inviteFriend(room); } });
    if (r === "owner" || r === "mod") {
      items.push({ label: "📌 تثبيت رسالة", fn: function () { promptRoom("تثبيت رسالة", "اكتب الرسالة المثبتة", room.pinned, function (v) { room.pinned = clean(v); save(); renderRoom(); }); } });
    }
    if (r === "owner") {
      items.push({ label: "✏️ تغيير اسم الغرفة", fn: function () { promptRoom("اسم الغرفة", "الاسم الجديد", room.name, function (v) { if (v) { room.name = clean(v); save(); renderRoom(); } }); } });
      items.push({ label: "🖼️ تغيير صورة الغرفة", fn: function () { room.color = (room.color + 1) % COVERS.length; room.icon = (room.icon + 1) % COVER_ICONS.length; save(); toast("تم تغيير صورة الغرفة"); } });
      items.push({ label: room.locked ? "🔓 فتح الغرفة" : "🔒 قفل الغرفة", fn: function () { room.locked = !room.locked; save(); toast(room.locked ? "تم قفل الغرفة" : "تم فتح الغرفة"); } });
      items.push({ label: "🗑️ حذف الغرفة", danger: true, fn: function () { confirmBox("هل تريد حذف الغرفة نهائياً؟", function () { S.rooms = S.rooms.filter(function (x) { return x.id !== room.id; }); UI.roomId = null; $("room-view").classList.remove("open"); save(); renderAll(); toast("تم حذف الغرفة"); }); } });
    }
    items.push({ label: "🚪 مغادرة الغرفة", danger: true, fn: function () { leaveRoom(false); } });
    actionList(room.name, items);
  }

  function promptRoom(title, label, val, cb) {
    openSheet("<h3>" + esc(title) + "</h3><label>" + esc(label) + '</label><input id="pr-in" maxlength="100" value="' + esc(val) + '" /><button class="btn block" id="pr-ok" type="button">حفظ</button>');
    $("sheet").onclick = null;
    $("pr-ok").onclick = function () { var v = $("pr-in").value.trim(); closeSheet(); cb(v); };
  }

  function roomLink(room) { return location.href.split("#")[0].split("?")[0] + "#room=" + room.id; }
  function copyRoomLink() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var link = roomLink(room);
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = link; document.body.appendChild(ta); ta.select();
      try { document.execCommand("copy"); toast("تم نسخ الرابط 📋"); } catch (e) { toast(link); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(link).then(function () { toast("تم نسخ الرابط 📋"); }, fallback);
    else fallback();
  }

  function showMembers(room) {
    var html = "<h3>👥 الموجودون في الغرفة</h3>";
    function row(id, tag) {
      var u = getUser(id);
      return '<div class="row glass" data-profile="' + id + '">' + avatarHTML(u) + '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + tag + "</div></div></div>";
    }
    var sp = room.seats.filter(function (s) { return s.uid; });
    html += '<div class="small" style="margin:6px 0">🎤 المتحدثون (' + sp.length + ")</div>" + (sp.map(function (s) { return row(s.uid, "متحدث"); }).join("") || '<div class="small">لا أحد</div>');
    html += '<div class="small" style="margin:10px 0 6px">🎧 المستمعون (' + room.listeners.length + ")</div>" + (room.listeners.map(function (id) { return row(id, "مستمع"); }).join("") || '<div class="small">لا أحد</div>');
    openSheet(html);
    $("sheet").onclick = null;
  }

  function inviteFriend(room) {
    if (!S.friends.length) { toast("أضف أصدقاء أولاً"); return; }
    actionList("اختر صديقاً للدعوة", S.friends.map(function (id) {
      return { label: "📨 " + getUser(id).name, fn: function () { toast("تم إرسال الدعوة إلى " + getUser(id).name); addNotif("📨", "أرسلت دعوة إلى " + getUser(id).name + " للانضمام إلى " + room.name); save(); } };
    }));
  }

  /* ========= الهدايا ========= */
  function openGifts(targetId) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    UI.giftTarget = targetId || "room";
    var opts = '<option value="room">🏠 كل الغرفة</option>';
    room.seats.forEach(function (s) { if (s.uid && s.uid !== S.me.id) opts += '<option value="' + s.uid + '">🎤 ' + esc(getUser(s.uid).name) + "</option>"; });
    room.listeners.forEach(function (id) { if (id !== S.me.id) opts += '<option value="' + id + '">🎧 ' + esc(getUser(id).name) + "</option>"; });
    var grid = GIFTS.map(function (g) {
      return '<button class="gift ' + (g.id === UI.giftSel ? "sel" : "") + '" data-gift="' + g.id + '" type="button"><div class="e">' + g.e + "</div><small>" + g.n + '</small><div class="p">🪙 ' + g.p + "</div></button>";
    }).join("");
    openSheet("<h3>🎁 إرسال هدية</h3>" + '<div class="small" style="margin-bottom:8px">رصيدك: 🪙 <b id="gift-bal">' + S.me.coins + "</b></div>" +
      '<div class="giftgrid">' + grid + "</div>" + '<label>إلى</label><select id="gift-target">' + opts + "</select>" +
      '<button class="btn block" id="gift-send" type="button">إرسال الهدية</button>');
    $("gift-target").value = UI.giftTarget;
    if ($("gift-target").value !== UI.giftTarget) $("gift-target").value = "room";
    $("sheet").onclick = function (e) {
      var g = e.target.closest("[data-gift]");
      if (g) {
        UI.giftSel = g.getAttribute("data-gift");
        document.querySelectorAll(".gift").forEach(function (x) { x.classList.toggle("sel", x === g); });
      }
    };
    $("gift-send").onclick = function () {
      var gift = GIFTS.filter(function (x) { return x.id === UI.giftSel; })[0];
      var target = $("gift-target").value;
      if (S.me.coins < gift.p) { toast("رصيدك غير كافٍ ❌"); return; }
      var tname = target === "room" ? "كل الغرفة" : getUser(target).name;
      confirmBox("إرسال " + gift.e + " " + gift.n + " إلى " + tname + " مقابل " + gift.p + " عملة؟", function () { sendGift(gift, target); });
    };
  }

  function sendGift(gift, target) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    if (S.me.coins < gift.p) { toast("رصيدك غير كافٍ ❌"); return; }
    S.me.coins -= gift.p;
    S.me.sent++;
    S.me.ach.giver = true;
    S.txs.unshift({ t: now(), text: "هدية " + gift.n + " إلى " + (target === "room" ? "الغرفة" : getUser(target).name), amount: -gift.p });
    S.giftsLog.unshift({ from: S.me.id, to: target, gift: gift.id, t: now() });
    var tname = target === "room" ? "الغرفة" : getUser(target).name;
    room.msgs.push({ sys: true, text: "🎁 " + S.me.name + " أرسل " + gift.e + " " + gift.n + " إلى " + tname, t: now() });
    room.recvTop[target] = (room.recvTop[target] || 0) + gift.p;
    addXP(Math.max(5, Math.round(gift.p / 10)));
    save(); renderRoom(); renderTop();
    var fly = document.createElement("div");
    fly.className = "fly";
    fly.innerHTML = gift.e + "<small>" + esc(S.me.name) + " ➜ " + esc(tname) + "</small>";
    $("app").appendChild(fly);
    setTimeout(function () { if (fly.parentNode) fly.parentNode.removeChild(fly); }, 2500);
    toast("تم إرسال الهدية ✅");
  }

  /* ========= الملف الشخصي لمستخدم ========= */
  function openProfile(id) {
    if (id === S.me.id) { closeSheet(); if (UI.roomId) { /* يبقى في الغرفة */ } else go("profile"); return; }
    var u = getUser(id);
    var isF = S.friends.indexOf(id) >= 0, isFol = S.follows.indexOf(id) >= 0, blocked = S.blocked.indexOf(id) >= 0;
    var html = '<div style="text-align:center">' + '<div class="frame" style="display:inline-block"><div class="avatar lg">' + esc(initials(u.name)) + "</div></div>" +
      '<h3 style="margin-top:8px">' + userNameHTML(u) + '</h3><div class="small">ID: ' + esc(u.id) + " • المستوى " + (u.level || 1) + " • " + (u.online ? "🟢 متصل" : "⚪ غير متصل") + "</div>" +
      '<p class="small" style="margin:10px 0;line-height:1.7">' + esc(u.bio || "") + "</p></div>" +
      '<div class="actlist">' +
      '<button data-pa="follow" type="button">' + (isFol ? "إلغاء المتابعة" : "➕ متابعة") + "</button>" +
      (isF ? '<button data-pa="unfriend" type="button">💔 حذف من الأصدقاء</button>' : (S.sentReq.indexOf(id) >= 0 ? '<button data-pa="cancelreq" type="button">إلغاء طلب الصداقة</button>' : '<button data-pa="add" type="button">👥 إضافة إلى الأصدقاء</button>')) +
      '<button data-pa="dm" type="button">💬 إرسال رسالة خاصة</button>' +
      '<button data-pa="block" class="danger" type="button">' + (blocked ? "إلغاء الحظر" : "🚫 حظر المستخدم") + "</button>" +
      '<button data-pa="report" class="danger" type="button">⚠️ الإبلاغ عن المستخدم</button></div>';
    openSheet(html);
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-pa]");
      if (!b) return;
      var a = b.getAttribute("data-pa");
      if (a === "follow") { if (isFol) { S.follows = S.follows.filter(function (x) { return x !== id; }); toast("تم إلغاء المتابعة"); } else { S.follows.push(id); toast("تمت المتابعة ✅"); } save(); openProfile(id); }
      else if (a === "add") { sendFriendReq(id); openProfile(id); }
      else if (a === "cancelreq") { S.sentReq = S.sentReq.filter(function (x) { return x !== id; }); save(); openProfile(id); }
      else if (a === "unfriend") { S.friends = S.friends.filter(function (x) { return x !== id; }); save(); toast("تم حذف الصديق"); openProfile(id); renderAll(); }
      else if (a === "dm") { closeSheet(); openDM(id); }
      else if (a === "block") { toggleBlock(id); openProfile(id); }
      else if (a === "report") { closeSheet(); toast("تم إرسال البلاغ، شكراً لك"); addNotif("⚠️", "تم استلام بلاغك ضد " + u.name); save(); }
    };
  }

  function toggleBlock(id) {
    var k = S.blocked.indexOf(id);
    if (k >= 0) { S.blocked.splice(k, 1); toast("تم إلغاء الحظر"); }
    else { S.blocked.push(id); S.friends = S.friends.filter(function (x) { return x !== id; }); toast("تم حظر المستخدم 🚫"); }
    save(); renderAll();
  }

  function sendFriendReq(id) {
    if (S.sentReq.indexOf(id) >= 0 || S.friends.indexOf(id) >= 0) return;
    S.sentReq.push(id);
    toast("تم إرسال طلب الصداقة ✅");
    save(); renderAll();
    // رد تجريبي من المستخدم الوهمي بعد قليل (يُستبدل عند ربط Firebase)
    setTimeout(function () {
      if (S.sentReq.indexOf(id) < 0) return;
      S.sentReq = S.sentReq.filter(function (x) { return x !== id; });
      S.friends.push(id);
      S.me.ach.social = true;
      addNotif("✅", getUser(id).name + " قبل طلب الصداقة.");
      addXP(10);
      save(); renderAll();
      toast(getUser(id).name + " قبل طلب صداقتك 🎉");
    }, 4000);
  }

  /* ========= الرسائل الخاصة ========= */
  function openDM(id) {
    if (S.blocked.indexOf(id) >= 0) { toast("هذا المستخدم محظور"); return; }
    UI.dmId = id;
    S.unread[id] = 0;
    if (!S.dms[id]) S.dms[id] = [];
    save();
    var u = getUser(id);
    $("chat-title").textContent = u.name;
    $("chat-sub").textContent = u.online ? "متصل الآن" : "غير متصل";
    $("chat-avatar").textContent = initials(u.name);
    $("chat-view").classList.add("open");
    renderDM(); renderTop();
  }
  function renderDM() {
    var list = S.dms[UI.dmId] || [];
    var box = $("chat-msgs");
    box.innerHTML = list.length ? list.map(function (m, i) {
      var me = m.from === S.me.id;
      return '<div class="msg ' + (me ? "me" : "") + '"' + (me ? ' data-deldm="' + i + '"' : "") + ">" + esc(m.text) + '<div class="tm">' + timeStr(m.t) + (me ? " • اضغط للحذف" : "") + "</div></div>";
    }).join("") : '<div class="empty">ابدأ المحادثة بإرسال رسالة 👋</div>';
    box.scrollTop = box.scrollHeight;
  }
  function sendDM() {
    var inp = $("chat-input"), text = inp.value.trim();
    if (!text || !UI.dmId) return;
    S.dms[UI.dmId].push({ from: S.me.id, text: clean(text), t: now() });
    inp.value = "";
    save(); renderDM();
    var to = UI.dmId, u = getUser(to);
    // رد تجريبي (يُستبدل بالرسائل الحقيقية مع Firebase)
    var replies = ["أهلاً! كيف حالك؟ 😊", "تمام والحمد لله", "هيا ندخل غرفة ونتحدث 🎙️", "😂😂", "جميل جداً 👌"];
    setTimeout(function () {
      if (!S.dms[to]) S.dms[to] = [];
      S.dms[to].push({ from: to, text: replies[Math.floor(Math.random() * replies.length)], t: now() });
      if (UI.dmId === to && $("chat-view").classList.contains("open")) renderDM();
      else { S.unread[to] = (S.unread[to] || 0) + 1; if (S.settings.notif) toast("💬 رسالة جديدة من " + u.name); }
      save(); renderTop(); if (UI.page === "messages") renderMessages();
    }, 1800);
  }
  function openDMMenu() {
    var id = UI.dmId;
    actionList(getUser(id).name, [
      { label: "👤 عرض الملف الشخصي", fn: function () { openProfile(id); } },
      { label: "🗑️ حذف المحادثة", danger: true, fn: function () { S.dms[id] = []; save(); renderDM(); renderAll(); toast("تم حذف المحادثة"); } },
      { label: "🚫 حظر المستخدم", danger: true, fn: function () { toggleBlock(id); $("chat-view").classList.remove("open"); UI.dmId = null; } }
    ]);
  }

  /* ========= الإعدادات / الترتيب / تعديل الملف ========= */
  function openEditProfile() {
    openSheet("<h3>✏️ تعديل الملف الشخصي</h3>" +
      '<label>الاسم</label><input id="ep-name" maxlength="20" value="' + esc(S.me.name) + '" />' +
      '<label>النبذة</label><textarea id="ep-bio" rows="3" maxlength="120">' + esc(S.me.bio) + "</textarea>" +
      '<label>الدولة</label><input id="ep-country" maxlength="20" value="' + esc(S.me.country) + '" />' +
      '<button class="btn block" id="ep-ok" type="button">حفظ</button>');
    $("sheet").onclick = null;
    $("ep-ok").onclick = function () {
      var n = $("ep-name").value.trim();
      if (!n) { toast("الاسم لا يمكن أن يكون فارغاً"); return; }
      S.me.name = clean(n); S.me.bio = clean($("ep-bio").value.trim()); S.me.country = clean($("ep-country").value.trim()) || S.me.country;
      save(); closeSheet(); renderAll(); toast("تم حفظ الملف الشخصي ✅");
    };
  }

  function openSettings() {
    openSheet("<h3>⚙️ الإعدادات</h3>" +
      '<div class="switchrow"><span>إشعارات التطبيق</span><button class="btn sm ' + (S.settings.notif ? "" : "ghost") + '" data-set="notif" type="button">' + (S.settings.notif ? "مفعّل" : "متوقف") + "</button></div>" +
      '<div class="switchrow"><span>المؤثرات الصوتية</span><button class="btn sm ' + (S.settings.sound ? "" : "ghost") + '" data-set="sound" type="button">' + (S.settings.sound ? "مفعّل" : "متوقف") + "</button></div>" +
      '<div class="switchrow"><span>المستخدمون المحظورون</span><button class="btn sm ghost" data-set="blocked" type="button">' + S.blocked.length + " ◀</button></div>" +
      '<div class="switchrow"><span>اللغة</span><span class="small">العربية</span></div>' +
      '<div class="switchrow"><span>معلومات التطبيق</span><span class="small">REAL VOICE v1.0 (المرحلة 1)</span></div>' +
      '<button class="btn ghost block" data-set="reset" type="button">🔄 إعادة تعيين بيانات التطبيق التجريبية</button>');
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-set]");
      if (!b) return;
      var k = b.getAttribute("data-set");
      if (k === "notif" || k === "sound") { S.settings[k] = !S.settings[k]; save(); openSettings(); }
      else if (k === "blocked") openBlocked();
      else if (k === "reset") confirmBox("سيتم حذف كل البيانات التجريبية وإنشاء حساب جديد. متابعة؟", function () { try { localStorage.removeItem(CONFIG.storageKey); } catch (x) { /* */ } location.reload(); });
    };
  }
  function openBlocked() {
    var html = "<h3>🚫 المحظورون</h3>" + (S.blocked.length ? S.blocked.map(function (id) {
      return '<div class="row glass">' + avatarHTML(getUser(id), "sm") + '<div class="info"><div class="name">' + esc(getUser(id).name) + '</div></div><button class="btn sm" data-unblock="' + id + '" type="button">إلغاء الحظر</button></div>';
    }).join("") : '<div class="empty">لا يوجد محظورون</div>');
    openSheet(html);
    $("sheet").onclick = function (e) { var b = e.target.closest("[data-unblock]"); if (b) { toggleBlock(b.getAttribute("data-unblock")); openBlocked(); } };
  }

  function openLeaderboard() {
    var all = S.users.map(function (u) { return { name: u.name, lv: u.level || 1, vip: u.vip }; });
    all.push({ name: S.me.name + " (أنت)", lv: level(), vip: S.me.vip });
    all.sort(function (a, b) { return b.lv - a.lv; });
    var medals = ["🥇", "🥈", "🥉"];
    var html = "<h3>🏆 لوحة الترتيب (حسب المستوى)</h3>" + all.map(function (u, i) {
      return '<div class="row glass"><div style="font-size:22px;width:32px;text-align:center">' + (medals[i] || (i + 1)) + '</div><div class="info"><div class="name">' + esc(u.name) + '</div></div><span class="tag">المستوى ' + u.lv + "</span></div>";
    }).join("") + '<p class="small" style="margin-top:8px">الترتيب اليومي والأسبوعي وترتيب الهدايا يُضاف مع Firebase في المرحلة الثانية.</p>';
    openSheet(html);
    $("sheet").onclick = null;
  }

  /* ========= الأحداث (تفويض واحد لكل التطبيق) ========= */
  function bind() {
    document.addEventListener("click", function (e) {
      var t = e.target;
      var el;
      if ((el = t.closest("[data-enter]"))) { closeSheet(); enterRoom(el.getAttribute("data-enter")); return; }
      if ((el = t.closest(".navbtn"))) { go(el.getAttribute("data-page")); return; }
      if ((el = t.closest("#home-tabs .tab"))) { UI.filter = el.getAttribute("data-filter"); renderHome(); return; }
      if ((el = t.closest("#rooms-tabs .tab"))) { UI.rfilter = el.getAttribute("data-rfilter"); renderRooms(); return; }
      if ((el = t.closest("#friends-tabs .tab"))) { UI.ftab = el.getAttribute("data-ftab"); renderFriends(); return; }
      if ((el = t.closest("[data-seat]"))) { onSeatTap(Number(el.getAttribute("data-seat"))); return; }
      if ((el = t.closest("[data-accept]"))) {
        var a = el.getAttribute("data-accept");
        S.requests = S.requests.filter(function (x) { return x !== a; });
        if (S.friends.indexOf(a) < 0) S.friends.push(a);
        S.me.ach.social = true; addXP(10); toast("تمت إضافة " + getUser(a).name + " ✅"); save(); renderAll(); return;
      }
      if ((el = t.closest("[data-reject]"))) { S.requests = S.requests.filter(function (x) { return x !== el.getAttribute("data-reject"); }); save(); renderAll(); return; }
      if ((el = t.closest("[data-cancelreq]"))) { S.sentReq = S.sentReq.filter(function (x) { return x !== el.getAttribute("data-cancelreq"); }); save(); renderAll(); return; }
      if ((el = t.closest("[data-addfriend]"))) { sendFriendReq(el.getAttribute("data-addfriend")); return; }
      if ((el = t.closest("[data-delmsg]"))) {
        var room = getRoom(UI.roomId), i = Number(el.getAttribute("data-delmsg"));
        if (room && room.msgs[i] && room.msgs[i].from === S.me.id) { room.msgs.splice(i, 1); save(); renderRoomChat(); toast("تم حذف الرسالة"); }
        return;
      }
      if ((el = t.closest("[data-deldm]"))) {
        var list = S.dms[UI.dmId], j = Number(el.getAttribute("data-deldm"));
        if (list && list[j]) { list.splice(j, 1); save(); renderDM(); }
        return;
      }
      if ((el = t.closest("[data-dm]"))) { openDM(el.getAttribute("data-dm")); return; }
      if ((el = t.closest("[data-profile]"))) { openProfile(el.getAttribute("data-profile")); return; }
      if ((el = t.closest("#room-colors button"))) {
        UI.msgColor = el.getAttribute("data-color");
        document.querySelectorAll("#room-colors button").forEach(function (b) { b.classList.toggle("sel", b === el); });
        return;
      }
      if ((el = t.closest("#room-emojis button"))) { var inp = $("room-input"); inp.value += el.textContent; inp.focus(); return; }
      if (t === $("scrim")) closeSheet();
    });

    $("notif-btn").onclick = openNotifs;
    $("avatar-top").onclick = function () { go("profile"); };
    $("banner-create").onclick = openCreateRoom;
    $("fab-create").onclick = openCreateRoom;
    $("refresh-rooms").onclick = function () { renderHome(); toast("تم تحديث قائمة الغرف 🔄"); };
    $("search-input").addEventListener("input", function (e) { UI.query = e.target.value; renderHome(); });
    $("find-input").addEventListener("input", function (e) { UI.findQ = e.target.value; renderFriends(); });
    $("pf-edit").onclick = openEditProfile;
    $("pf-settings").onclick = openSettings;
    $("pf-leader").onclick = openLeaderboard;
    $("pf-topup").onclick = function () {
      S.me.coins += 500;
      S.txs.unshift({ t: now(), text: "رصيد تجريبي", amount: 500 });
      save(); renderAll(); toast("تمت إضافة 500 عملة 🪙");
    };
    $("room-back").onclick = function () { leaveRoom(false); };
    $("room-menu").onclick = openRoomMenu;
    $("room-share").onclick = copyRoomLink;
    $("room-send").onclick = function () { var i = $("room-input"); sendRoomMsg(i.value); i.value = ""; };
    $("room-input").addEventListener("keydown", function (e) { if (e.key === "Enter") { sendRoomMsg(this.value); this.value = ""; } });
    $("room-gift").onclick = function () { openGifts("room"); };
    $("mic-btn").onclick = function () {
      UI.micMuted = !UI.micMuted;
      toast(UI.micMuted ? "تم إغلاق المايك 🔇" : "تم تشغيل المايك 🎤");
      renderRoom();
    };
    $("chat-back").onclick = function () { $("chat-view").classList.remove("open"); UI.dmId = null; renderAll(); };
    $("chat-send").onclick = sendDM;
    $("chat-input").addEventListener("keydown", function (e) { if (e.key === "Enter") sendDM(); });
    $("chat-emoji").onclick = function () { var inp = $("chat-input"); inp.value += EMOJIS[Math.floor(Math.random() * EMOJIS.length)]; inp.focus(); };
    $("chat-menu").onclick = openDMMenu;
    $("room-emojis").innerHTML = EMOJIS.map(function (e) { return '<button type="button">' + e + "</button>"; }).join("");
  }

  /* ========= تشغيل ========= */
  function init() {
    load();
    bind();
    // فتح غرفة من الرابط المشارك
    var m = location.hash.match(/room=([\w-]+)/);
    renderAll();
    if (m && getRoom(m[1])) enterRoom(m[1]);
    // محاكاة دخول صديق (إشعار تجريبي)
    setTimeout(function () {
      if (!S.settings.notif) return;
      var f = S.friends.map(getUser).filter(function (u) { return u.online; })[0];
      if (f) { addNotif("🟢", f.name + " دخل التطبيق."); save(); renderTop(); }
    }, 20000);
  }

  try { init(); } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML("afterbegin", '<div style="padding:20px;color:#fca5a5">حدث خطأ في تشغيل التطبيق. جرّب مسح بيانات الموقع وإعادة التحميل.</div>');
  }
})();
