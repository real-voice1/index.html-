/* REAL VOICE — الجزء 1: النواة (الإعدادات، الأدوات، Firebase، الهوية، الحضور، مزامنة الغرف)
   يُحمَّل قبل ملفات الأجزاء التالية، ويعرض كل شيء عبر window.RV */
(function (global) {
  "use strict";

  /* ========= ضع مفاتيح مشروعك هنا (Firebase Console > Project settings > Your apps) ========= */
  var FIREBASE_CONFIG = {
    apiKey: "YOUR_API_KEY",
    authDomain: "YOUR_PROJECT.firebaseapp.com",
    databaseURL: "https://YOUR_PROJECT-default-rtdb.firebaseio.com",
    projectId: "YOUR_PROJECT",
    appId: "YOUR_APP_ID"
  };
  var TOKEN_URL = "https://indexhtml-production-8a2533cd.up.railway.app/rtc-token";

  var CONFIG = {
    storageKey: "rv_state_v1",
    startCoins: 1000,
    xpPerLevel: 100,
    badWords: ["شتيمة", "قذر", "حقير", "غبي", "كلب", "حمار"]
  };

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
    var d = new Date(t), h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function uid() { return "u" + Math.random().toString(36).slice(2, 9); }

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2400);
  }

  /* فلترة مُحسَّنة: مطابقة الكلمة كاملة فقط (بعد تطبيع التشكيل والألف)، وتتجاهل الروابط */
  function normWord(w) {
    return String(w).replace(/[\u064B-\u065F\u0670\u0640]/g, "").replace(/[أإآ]/g, "ا").toLowerCase();
  }
  var BAD_SET = {};
  CONFIG.badWords.forEach(function (w) { BAD_SET[normWord(w)] = true; });
  function clean(text) {
    return String(text == null ? "" : text).replace(
      /(https?:\/\/\S+|www\.\S+)|([\u0600-\u06FFA-Za-z0-9_]+)/g,
      function (m, url, word) { return url ? m : (BAD_SET[normWord(word)] ? "***" : m); }
    );
  }

  /* uid رقمي موجب (1..2147483646) ثابت لنفس النص، متوافق مع Agora */
  function hashNum(str) {
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (Math.abs(h) % 2147483646) + 1;
  }

  /* ========= سجل المستمعين والمؤقتات (للتنظيف ومنع التسرب) ========= */
  var registry = {}; // scope -> [{ref, ev, fn} | {timer, kind}]
  function trackListener(scope, ref, ev, fn) {
    ref.on(ev, fn);
    (registry[scope] = registry[scope] || []).push({ ref: ref, ev: ev, fn: fn });
  }
  function trackTimer(scope, id, kind) {
    (registry[scope] = registry[scope] || []).push({ timer: id, kind: kind || "timeout" });
    return id;
  }
  function cleanup(scope) {
    (registry[scope] || []).forEach(function (r) {
      try {
        if (r.ref) r.ref.off(r.ev, r.fn);
        else if (r.kind === "interval") clearInterval(r.timer);
        else clearTimeout(r.timer);
      } catch (e) { /* تجاهل */ }
    });
    registry[scope] = [];
  }

  /* ========= Firebase ========= */
  var cloud = { on: false, db: null, auth: null, fbUser: null };

  function configReady() {
    return FIREBASE_CONFIG.apiKey && FIREBASE_CONFIG.apiKey.indexOf("YOUR_") !== 0 &&
      FIREBASE_CONFIG.databaseURL.indexOf("YOUR_") < 0;
  }

  function initCloud() {
    if (!global.firebase || !configReady()) return false;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      cloud.db = firebase.database();
      cloud.auth = firebase.auth();
      cloud.on = true;
    } catch (e) {
      console.error("Firebase init failed", e);
      cloud.on = false;
    }
    return cloud.on;
  }

  /* تسجيل دخول مجهول → يعيد وعداً بـ { key, num } أو null في الوضع المحلي */
  function signIn() {
    if (!cloud.on) return Promise.resolve(null);
    return new Promise(function (resolve) {
      var done = false;
      cloud.auth.onAuthStateChanged(function (u) {
        if (u) { cloud.fbUser = u; if (!done) { done = true; resolve(u); } }
      });
      cloud.auth.signInAnonymously().catch(function (e) {
        console.error(e);
        toast("تعذّر تسجيل الدخول السحابي، سيعمل التطبيق محلياً");
        cloud.on = false;
        if (!done) { done = true; resolve(null); }
      });
    });
  }

  /* ينشئ/يحمّل users/{uid} ويضمن وجود num ثابت */
  function ensureProfile(fbUser, defaults) {
    var ref = cloud.db.ref("users/" + fbUser.uid);
    return ref.once("value").then(function (snap) {
      var p = snap.val();
      if (p && p.num) return p;
      var num = hashNum(fbUser.uid);
      var profile = Object.assign({}, defaults, {
        key: fbUser.uid, num: num, sid: "RV-" + num, online: true, joined: now()
      });
      return ref.update(profile).then(function () { return profile; });
    });
  }

  /* حالة الاتصال الفعلية مع onDisconnect */
  function startPresence(key) {
    var uRef = cloud.db.ref("users/" + key);
    var conRef = cloud.db.ref(".info/connected");
    trackListener("app", conRef, "value", function (s) {
      if (s.val() !== true) return;
      uRef.child("online").onDisconnect().set(false).then(function () {
        uRef.update({ online: true });
      });
      uRef.child("lastSeen").onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
    });
  }

  /* ========= تحويل بيانات Firebase (تحذف المصفوفات الفارغة) إلى شكل التطبيق ========= */
  function toArr(v) {
    if (!v) return [];
    if (Array.isArray(v)) return v.filter(function (x) { return x != null; });
    return Object.keys(v).map(function (k) { return v[k]; });
  }
  function normalizeRoom(id, r) {
    r = r || {};
    var n = Number(r.seatCount) || 9, seats = [];
    for (var i = 0; i < n; i++) {
      var s = (r.seats && r.seats[i]) || {};
      seats.push({ uid: s.uid || null, locked: !!s.locked, muted: !!s.muted, vip: s.vip != null ? !!s.vip : i === 0 });
    }
    return {
      id: id, name: r.name || "غرفة", desc: r.desc || "", cat: r.cat || "chat", owner: r.owner || "",
      mods: Object.keys(r.mods || {}), seats: seats, listeners: Object.keys(r.listeners || {}),
      bans: Object.keys(r.bans || {}), pass: r.pass || "", priv: !!r.priv, locked: !!r.locked,
      pinned: r.pinned || "", created: r.created || 0, color: r.color || 0, icon: r.icon || 0,
      recvTop: r.recvTop || {}, seatCount: n, msgs: []
    };
  }

  /* ========= مزامنة الغرف ========= */
  function watchRooms(cb) {
    if (!cloud.on) return false;
    cleanup("rooms");
    trackListener("rooms", cloud.db.ref("rooms"), "value", function (snap) {
      var v = snap.val() || {}, out = [];
      Object.keys(v).forEach(function (id) { out.push(normalizeRoom(id, v[id])); });
      cb(out);
    });
    return true;
  }

  function watchRoom(id, cb) {
    if (!cloud.on) return false;
    cleanup("room");
    trackListener("room", cloud.db.ref("rooms/" + id), "value", function (snap) {
      cb(snap.exists() ? normalizeRoom(id, snap.val()) : null);
    });
    return true;
  }

  function createRoom(room) {
    var data = {
      name: room.name, desc: room.desc, cat: room.cat, owner: room.owner, seatCount: room.seats.length,
      pass: room.pass || "", priv: !!room.priv, locked: false, pinned: "", created: now(),
      color: room.color, icon: room.icon
    };
    return cloud.db.ref("rooms/" + room.id).set(data);
  }

  /* صعود آمن على مقعد (transaction يمنع تعارض مستخدمين على نفس المقعد) */
  function takeSeatCloud(roomId, index, me, fromIndex) {
    var ref = cloud.db.ref("rooms/" + roomId + "/seats/" + index);
    return ref.transaction(function (cur) {
      if (cur && cur.uid && cur.uid !== me) return; // مشغول: إلغاء
      if (cur && cur.locked) return;
      return Object.assign({}, cur || {}, { uid: me, muted: false });
    }).then(function (res) {
      if (!res.committed) return false;
      var ups = {};
      ups["rooms/" + roomId + "/listeners/" + me] = null;
      if (fromIndex != null && fromIndex >= 0 && fromIndex !== index) {
        ups["rooms/" + roomId + "/seats/" + fromIndex + "/uid"] = null;
      }
      return cloud.db.ref().update(ups).then(function () { return true; });
    });
  }

  function leaveSeatCloud(roomId, index, me) {
    var ups = {};
    ups["rooms/" + roomId + "/seats/" + index + "/uid"] = null;
    ups["rooms/" + roomId + "/listeners/" + me] = true;
    return cloud.db.ref().update(ups);
  }

  global.RV = {
    FIREBASE_CONFIG: FIREBASE_CONFIG, TOKEN_URL: TOKEN_URL, CONFIG: CONFIG, cloud: cloud,
    $: $, esc: esc, initials: initials, now: now, timeStr: timeStr, uid: uid, toast: toast,
    clean: clean, hashNum: hashNum, toArr: toArr, normalizeRoom: normalizeRoom,
    trackListener: trackListener, trackTimer: trackTimer, cleanup: cleanup,
    initCloud: initCloud, signIn: signIn, ensureProfile: ensureProfile, startPresence: startPresence,
    watchRooms: watchRooms, watchRoom: watchRoom, createRoom: createRoom,
    takeSeatCloud: takeSeatCloud, leaveSeatCloud: leaveSeatCloud
  };
})(window);
