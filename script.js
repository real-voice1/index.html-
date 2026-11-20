/* REAL VOICE — نسخة مستقرة ومربوطة بالكامل */
(function (global) {
  "use strict";

  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDyx4MBxvRM0L5FrrjVOfVePlKRSxGpMg4",
    authDomain: "real-voice-aec71.firebaseapp.com",
    databaseURL: "https://real-voice-aec71-default-rtdb.firebaseio.com",
    projectId: "real-voice-aec71",
    appId: "1:1051527775983:web:ae3794c162184fd56b7d1a"
  };

  var TOKEN_URL = "https://indexhtml-production-8a2533cd.up.railway.app/rtc-token";

  var CONFIG = {
    storageKey: "rv_state_v10",
    fixedUidKey: "rv_fixed_uid_v1",
    authSessionKey: "rv_auth_logged_v1",
    onboardDoneKey: "rv_onboard_done_v1",
    startCoins: 1000,
    maxLevel: 100,
    xpPerLevel: 100,
    initialSpecialIdNumber: 1000,
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

  var DEFAULT_TRACKS = [
    { id: "t1", title: "Night Chill Beat", artist: "موسيقى هادئة", cover: "🎵", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "t2", title: "Acoustic Vibes", artist: "جيتار ليلي", cover: "🎸", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "t3", title: "Midnight Lounge", artist: "سهرة رايقة", cover: "🌙", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" }
  ];

  var STICKERS = [
    { id: "s1", e: "🥳", n: "حفلة" }, { id: "s2", e: "🎤", n: "غناء" }, { id: "s3", e: "👑", n: "ملكي" },
    { id: "s4", e: "🔥", n: "نار" }, { id: "s5", e: "💖", n: "حب" }, { id: "s6", e: "😂", n: "ضحك" }
  ];

  function $(id) { return document.getElementById(id); }
  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }
  function initials(n) { n = String(n || "").trim(); return n ? n.slice(0, 2) : "RV"; }
  function now() { return Date.now(); }
  function serverTs() {
    if (global.firebase && firebase.database && firebase.database.ServerValue && firebase.database.ServerValue.TIMESTAMP) {
      return firebase.database.ServerValue.TIMESTAMP;
    }
    return Date.now();
  }
  function timeStr(t) {
    var d = new Date(typeof t === "number" ? t : Date.now());
    var h = d.getHours(), m = d.getMinutes();
    return (h < 10 ? "0" : "") + h + ":" + (m < 10 ? "0" : "") + m;
  }
  function uid() { return "u" + Math.random().toString(36).slice(2, 9); }
  function formatSpecialId(numVal) {
    var n = Math.max(0, Math.floor(Number(numVal || 0)));
    var str = String(n);
    while (str.length < 7) str = "0" + str;
    return str.length > 7 ? str.slice(-7) : str;
  }
  function normalizeSpecialId(val, fallbackNum) {
    if (typeof val === "string" && /^\d{7}$/.test(val.trim())) return val.trim();
    if (typeof val === "string" && /^\d+$/.test(val.trim())) return formatSpecialId(Number(val.trim()));
    if (typeof val === "number" && isFinite(val) && val >= 0) return formatSpecialId(val);
    if (typeof fallbackNum === "number" && isFinite(fallbackNum) && fallbackNum >= 0) return formatSpecialId(fallbackNum);
    return "0001000";
  }
  function displayUserId(u) { return !u ? "0001000" : normalizeSpecialId(u.specialId, u.num); }
  function getOrCreateFixedUid() {
    try {
      var saved = localStorage.getItem(CONFIG.fixedUidKey);
      if (saved && saved.trim()) return saved.trim();
      var fresh = "rv_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(CONFIG.fixedUidKey, fresh);
      return fresh;
    } catch (e) { return "rv_" + Math.random().toString(36).slice(2, 10); }
  }

  var toastTimer = null;
  function toast(msg) {
    var t = $("toast");
    if (!t) return;
    t.textContent = String(msg || "");
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2200);
  }

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
  function hashNum(str) {
    var s = String(str || "rv"), h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (Math.abs(h) % 2147483646) + 1;
  }
  function dmThreadId(a, b) { return [String(a), String(b)].sort().join("__"); }

  function readImageFileAsDataUrl(file, maxSize, quality) {
    maxSize = maxSize || 240; quality = quality || 0.65;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) { reject(new Error("اختر ملف صورة صحيح")); return; }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width || maxSize, h = img.height || maxSize;
          if (w > h) { if (w > maxSize) { h = Math.round((h * maxSize) / w); w = maxSize; } }
          else { if (h > maxSize) { w = Math.round((w * maxSize) / h); h = maxSize; } }
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, w); canvas.height = Math.max(1, h);
          canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
          try { resolve(canvas.toDataURL("image/jpeg", quality)); } catch (e) { resolve(String(reader.result || "")); }
        };
        img.onerror = function () { resolve(String(reader.result || "")); };
        img.src = String(reader.result || "");
      };
      reader.onerror = function () { reject(new Error("تعذر قراءة الصورة")); };
      reader.readAsDataURL(file);
    });
  }

  function computeLevelFromXp(xp) { return Math.max(1, Math.min(CONFIG.maxLevel, Math.floor(Math.max(0, Number(xp || 0)) / CONFIG.xpPerLevel) + 1)); }
  function getCharmLevel(charm) { return Math.max(1, Math.min(CONFIG.maxLevel, Math.floor(Math.max(0, Number(charm || 0)) / 100) + 1)); }
  function getWealthLevel(wealth) { return Math.max(1, Math.min(CONFIG.maxLevel, Math.floor(Math.max(0, Number(wealth || 0)) / 100) + 1)); }

  var deferredInstallPrompt = null;
  function initPwaInstall() {
    window.addEventListener("beforeinstallprompt", function (e) {
      e.preventDefault();
      deferredInstallPrompt = e;
      var bar = $("install-app-bar");
      if (bar) bar.classList.remove("hidden");
    });
    var btn = $("install-app-btn");
    if (btn) {
      btn.onclick = async function () {
        if (deferredInstallPrompt) {
          deferredInstallPrompt.prompt();
          await deferredInstallPrompt.userChoice.catch(function () { /* */ });
          deferredInstallPrompt = null;
          $("install-app-bar").classList.add("hidden");
        } else {
          toast("من قائمة المتصفح (⋮) اختر: إضافة إلى الشاشة الرئيسية");
        }
      };
    }
    try {
      var manifestData = {
        name: "REAL VOICE",
        short_name: "REAL VOICE",
        start_url: "./",
        display: "standalone",
        background_color: "#090612",
        theme_color: "#7c3aed"
      };
      var blob = new Blob([JSON.stringify(manifestData)], { type: "application/manifest+json" });
      var link = document.createElement("link");
      link.rel = "manifest";
      link.href = URL.createObjectURL(blob);
      document.head.appendChild(link);
    } catch (e) { /* */ }
  }

  /* ========= الصوت (Agora RTC) ========= */
  var voice = { client: null, localTrack: null, channel: null, role: null, uidNum: 0, joining: false, speakingNums: {} };
  var musicState = { roomAudio: null, currentTitle: "" };

  function setVoiceStatusUI(connected, label) {
    var dot = $("voice-status-dot"), txt = $("voice-status-text");
    if (dot) dot.classList.toggle("live", !!connected);
    if (txt) txt.textContent = label || (connected ? "الصوت المباشر متصل 🔊" : "غير متصل");
  }
  function showAudioUnlockBar(show) { var bar = $("audio-unlock-bar"); if (bar) bar.classList.toggle("hidden", !show); }
  function applyRoomSpeakerMuteState() {
    var muted = !!UI.roomSpeakerMuted;
    if (voice.client && Array.isArray(voice.client.remoteUsers)) {
      voice.client.remoteUsers.forEach(function (u) {
        if (u && u.audioTrack) { try { u.audioTrack.setVolume(muted ? 0 : 100); } catch (e) { /* */ } }
      });
    }
    if (musicState.roomAudio) { try { musicState.roomAudio.muted = muted; } catch (e) { /* */ } }
    var spkBtn = $("room-speaker-btn");
    if (spkBtn) { spkBtn.classList.toggle("spk-muted", muted); spkBtn.textContent = muted ? "🔇" : "🔊"; }
  }
  async function subscribeAndPlayRemoteUser(user, mediaType) {
    if (!voice.client || !user || (!UI.roomId && !UI.floatingRoomId)) return;
    try {
      await voice.client.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.setVolume(UI.roomSpeakerMuted ? 0 : 100);
        try { user.audioTrack.play(); showAudioUnlockBar(false); } catch (e) { showAudioUnlockBar(true); }
      }
    } catch (e) { /* */ }
  }
  function resumeAllRemoteAudioTracks() {
    if (!voice.client || !Array.isArray(voice.client.remoteUsers)) return;
    voice.client.remoteUsers.forEach(function (u) {
      if (u && u.hasAudio) {
        if (u.audioTrack) {
          try { u.audioTrack.setVolume(UI.roomSpeakerMuted ? 0 : 100); u.audioTrack.play(); showAudioUnlockBar(false); } catch (e) { /* */ }
        } else { subscribeAndPlayRemoteUser(u, "audio"); }
      }
    });
  }
  function setupAgoraClient() {
    if (voice.client || !global.AgoraRTC) return;
    try {
      AgoraRTC.onAutoplayFailed = function () { showAudioUnlockBar(true); };
      voice.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      voice.client.enableAudioVolumeIndicator();
      voice.client.on("user-published", async function (user, mediaType) { await subscribeAndPlayRemoteUser(user, mediaType); });
      voice.client.on("user-unpublished", function (user) {
        if (user && user.audioTrack) { try { user.audioTrack.stop(); } catch (e) { /* */ } }
        if (user) delete voice.speakingNums[user.uid];
        updateSpeakingIndicators();
      });
      voice.client.on("user-left", function (user) {
        if (user) delete voice.speakingNums[user.uid];
        updateSpeakingIndicators();
      });
      voice.client.on("volume-indicator", function (volumes) {
        var active = {};
        (volumes || []).forEach(function (v) { if (v.level > 6) active[v.uid === 0 ? voice.uidNum : v.uid] = true; });
        voice.speakingNums = active;
        updateSpeakingIndicators();
      });
    } catch (e) { /* */ }
  }
  async function fetchRtcToken(channelName, uidNum, roleName) {
    var url = new URL(TOKEN_URL);
    url.searchParams.set("channelName", channelName);
    url.searchParams.set("uid", String(uidNum));
    url.searchParams.set("role", roleName);
    var res = await fetch(url.toString(), { method: "GET" });
    var data = await res.json();
    if (!res.ok || !data.token || !data.appId) throw new Error(data.error || "فشل جلب التوكن");
    return data;
  }
  async function stopLocalMic() {
    if (voice.localTrack) {
      try { if (voice.client && voice.client.connectionState === "CONNECTED") await voice.client.unpublish([voice.localTrack]); } catch (e) { /* */ }
      try { voice.localTrack.stop(); voice.localTrack.close(); } catch (e) { /* */ }
      voice.localTrack = null;
    }
  }
  async function publishLocalMic() {
    if (!voice.client || voice.client.connectionState !== "CONNECTED") return false;
    try {
      if (!voice.localTrack) voice.localTrack = await AgoraRTC.createMicrophoneAudioTrack({ AEC: true, ANS: true, AGC: true });
      var room = getRoom(UI.roomId || UI.floatingRoomId);
      var mySeatIdx = room ? seatIndexOf(room, S.me.id) : -1;
      var muted = UI.micMuted || (mySeatIdx >= 0 && room.seats[mySeatIdx].muted);
      await voice.localTrack.setEnabled(!muted);
      await voice.client.publish([voice.localTrack]);
      resumeAllRemoteAudioTracks();
      return true;
    } catch (e) { toast("اسمح للمتصفح بالوصول للميكروفون 🎤"); return false; }
  }
  async function syncMicHardwareState() {
    var room = getRoom(UI.roomId || UI.floatingRoomId);
    if (!room) return;
    var mySeatIdx = seatIndexOf(room, S.me.id);
    if (mySeatIdx < 0) { await stopLocalMic(); return; }
    var muted = UI.micMuted || !!room.seats[mySeatIdx].muted;
    if (!voice.localTrack && !muted) { await publishLocalMic(); return; }
    if (voice.localTrack) { try { await voice.localTrack.setEnabled(!muted); } catch (e) { /* */ } }
  }
  async function joinVoiceChannel(channelName, desiredRole) {
    if (!global.AgoraRTC) { setVoiceStatusUI(false, "مكتبة الصوت غير متاحة"); return false; }
    setupAgoraClient();
    if (!voice.client) { setVoiceStatusUI(false, "تعذر تهيئة الصوت"); return false; }
    voice.joining = true;
    setVoiceStatusUI(false, "جاري الاتصال بالصوت...");
    try {
      var targetUid = S.me.num || hashNum(S.me.id);
      voice.uidNum = targetUid;
      if (voice.client.connectionState !== "DISCONNECTED") await leaveVoiceChannel();
      if (!UI.roomId && !UI.floatingRoomId) { voice.joining = false; return false; }
      var tokenData = await fetchRtcToken(channelName, targetUid, "publisher");
      await voice.client.join(tokenData.appId, channelName, tokenData.token, tokenData.uid || targetUid);
      voice.channel = channelName;
      voice.role = desiredRole;
      if (Array.isArray(voice.client.remoteUsers)) {
        for (var i = 0; i < voice.client.remoteUsers.length; i++) {
          if (voice.client.remoteUsers[i] && voice.client.remoteUsers[i].hasAudio) await subscribeAndPlayRemoteUser(voice.client.remoteUsers[i], "audio");
        }
      }
      if (desiredRole === "publisher") await publishLocalMic();
      setVoiceStatusUI(true, "الصوت المباشر متصل 🔊");
      return true;
    } catch (e) { setVoiceStatusUI(false, "تعذر ربط الصوت"); return false; }
    finally { voice.joining = false; }
  }
  async function leaveVoiceChannel() {
    showAudioUnlockBar(false);
    if (musicState.roomAudio) {
      try { musicState.roomAudio.pause(); musicState.roomAudio.src = ""; } catch (e) { /* */ }
      musicState.roomAudio = null;
    }
    var mm = $("music-mini");
    if (mm) mm.classList.add("hidden");
    await stopLocalMic();
    if (voice.client) {
      try {
        (voice.client.remoteUsers || []).forEach(function (u) {
          if (u && u.audioTrack) { try { u.audioTrack.stop(); } catch (e) { /* */ } }
        });
      } catch (e) { /* */ }
      try { if (voice.client.connectionState !== "DISCONNECTED") await voice.client.leave(); } catch (e) { /* */ }
    }
    voice.channel = null;
    voice.role = null;
    voice.speakingNums = {};
    setVoiceStatusUI(false, "غير متصل");
  }
  function updateSpeakingIndicators() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var seatEls = document.querySelectorAll("#room-seats .seat");
    room.seats.forEach(function (s, idx) {
      var el = seatEls[idx];
      if (!el) return;
      if (!s.uid) { el.classList.remove("speak"); return; }
      var u = resolveLiveUser(s.uid);
      var muted = s.muted || (s.uid === S.me.id && UI.micMuted);
      el.classList.toggle("speak", !muted && !!voice.speakingNums[u.num || hashNum(s.uid)]);
    });
  }

  /* ========= الحالة والمزامنة وقاعدة البيانات ========= */
  var cloud = { on: false, db: null, auth: null, usersMap: {}, roomMsgs: {} };
  var S = null;
  var UI = {
    page: "home", filter: "all", rfilter: "mine", ftab: "friends",
    query: "", findQ: "", roomId: null, floatingRoomId: null, dmId: null,
    micMuted: false, roomSpeakerMuted: false, giftSel: "heart", giftTarget: "",
    authReady: false, authSigningIn: false, onboardPhoto: "", onboardGender: "ذكر"
  };
  var listenersMap = {};

  function onDb(key, ref, ev, fn) {
    ref.on(ev, fn);
    (listenersMap[key] = listenersMap[key] || []).push({ ref: ref, ev: ev, fn: fn });
  }
  function offDb(key) {
    (listenersMap[key] || []).forEach(function (x) { try { x.ref.off(x.ev, x.fn); } catch (e) { /* */ } });
    listenersMap[key] = [];
  }

  function demoUsers() {
    return [
      { id: "RV-1001", num: 1001, specialId: "0001001", name: "ليلى", gender: "أنثى", age: 21, photo: "", online: true, bio: "أحب الموسيقى 🎵", vip: 2, verified: true, wealth: 1850, charm: 2400, followers: 120, following: 45, friendsCount: 18, gifts: 32, xp: 1140, level: 12 },
      { id: "RV-1002", num: 1002, specialId: "0001002", name: "أحمد", gender: "ذكر", age: 24, photo: "", online: true, bio: "لاعب محترف 🎮", vip: 0, verified: false, wealth: 620, charm: 310, followers: 40, following: 22, friendsCount: 9, gifts: 11, xp: 420, level: 5 },
      { id: "RV-1003", num: 1003, specialId: "0001003", name: "سارة", gender: "أنثى", age: 22, photo: "", online: false, bio: "هنا للدردشة ☕", vip: 1, verified: true, wealth: 1200, charm: 1650, followers: 85, following: 30, friendsCount: 14, gifts: 21, xp: 750, level: 8 }
    ];
  }
  function makeSeats(n) {
    var arr = [];
    for (var i = 0; i < n; i++) arr.push({ uid: null, locked: false, muted: false, vip: i === 0 });
    return arr;
  }
  function demoRooms() {
    var t = now();
    return [
      { id: "r1", name: "سهرة الأصدقاء", desc: "دردشة مفتوحة", cat: "friends", owner: "RV-1001", mods: [], seats: makeSeats(9), listeners: [], bans: [], priv: false, locked: false, pinned: "", created: t - 7200000, msgs: [], color: 0, icon: 0, roomPhoto: "" },
      { id: "r2", name: "تحدي الأسئلة", desc: "مسابقات", cat: "games", owner: "RV-1002", mods: [], seats: makeSeats(6), listeners: [], bans: [], priv: false, locked: false, pinned: "", created: t - 3600000, msgs: [], color: 1, icon: 1, roomPhoto: "" },
      { id: "r3", name: "ليالي الطرب", desc: "موسيقى", cat: "music", owner: "RV-1003", mods: [], seats: makeSeats(6), listeners: [], bans: [], priv: false, locked: false, pinned: "", created: t - 600000, msgs: [], color: 2, icon: 2, roomPhoto: "" }
    ];
  }
  function freshState() {
    var id = getOrCreateFixedUid();
    return {
      me: {
        id: id, num: hashNum(id), specialId: "", name: "", gender: "ذكر", age: "", email: "", photo: "",
        bio: "مرحباً بك في REAL VOICE", coins: CONFIG.startCoins, xp: 0, level: 1,
        wealth: 0, wealthLevel: 1, charm: 0, charmLevel: 1, vip: 0, verified: false,
        followers: 0, following: 0, friendsCount: 0, gifts: 0, daily: 0, joined: now()
      },
      users: demoUsers(), rooms: demoRooms(),
      friends: [], requests: [], sentReq: [], blocked: [], follows: [],
      dms: {}, unread: {}, notifs: [],
      banners: [],
      settings: { notif: true, sound: true, lightTheme: false }
    };
  }
  function applyThemeMode() { document.body.classList.toggle("light-theme", !!(S && S.settings && S.settings.lightTheme)); }
  function loadLocal() {
    var fixedId = getOrCreateFixedUid();
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) {
        var p = JSON.parse(raw);
        if (p && p.me && Array.isArray(p.rooms)) {
          S = p; S.me.id = fixedId;
          if (!S.me.num) S.me.num = hashNum(fixedId);
          if (!Array.isArray(S.banners)) S.banners = [];
          if (!S.friends) S.friends = [];
          if (!S.requests) S.requests = [];
          if (!S.sentReq) S.sentReq = [];
          if (!S.blocked) S.blocked = [];
          if (!S.follows) S.follows = [];
          if (!S.dms) S.dms = {};
          if (!S.unread) S.unread = {};
          if (!S.notifs) S.notifs = [];
          if (!S.settings) S.settings = { notif: true, sound: true, lightTheme: false };
          applyThemeMode();
          return;
        }
      }
    } catch (e) { /* */ }
    S = freshState();
    applyThemeMode();
    saveLocal();
  }
  function saveLocal() { try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(S)); } catch (e) { /* */ } }

  function save() {
    saveLocal();
    if (!S || !S.me) return;
    var xpVal = Number(S.me.xp || 0);
    var wealthVal = Number(S.me.wealth || 0);
    var charmVal = Number(S.me.charm || 0);
    var lv = computeLevelFromXp(xpVal);
    var wLv = getWealthLevel(wealthVal);
    var cLv = getCharmLevel(charmVal);
    S.me.level = lv;
    S.me.wealthLevel = wLv;
    S.me.charmLevel = cLv;

    var userPayload = {
      id: S.me.id, num: S.me.num, specialId: S.me.specialId || "",
      name: S.me.name || "مستخدم", username: S.me.name || "مستخدم",
      gender: S.me.gender || "ذكر", age: S.me.age || "",
      email: S.me.email || "", photo: S.me.photo || "",
      bio: S.me.bio || "", coins: Number(S.me.coins || 0),
      xp: xpVal, level: lv,
      wealth: wealthVal, wealthLevel: wLv,
      charm: charmVal, charmLevel: cLv,
      vip: Number(S.me.vip || 0),
      followers: Number(S.me.followers || 0),
      following: S.follows.length || 0,
      friendsCount: S.friends.length || 0,
      online: true
    };
    cloud.usersMap[S.me.id] = Object.assign({}, cloud.usersMap[S.me.id] || {}, userPayload);

    if (cloud.on && cloud.db) {
      cloud.db.ref("users/" + S.me.id).update(Object.assign({}, userPayload, { updatedAt: serverTs() })).catch(function () { /* */ });
    }
  }

  function resolveLiveUser(id) {
    if (!id) return { id: "", num: 0, specialId: "0001000", name: "مستخدم", gender: "", age: "", photo: "", online: false, level: 1 };
    if (id === S.me.id) {
      return Object.assign({}, cloud.usersMap[id] || {}, S.me, { level: computeLevelFromXp(S.me.xp || 0), me: true });
    }
    var fromCloud = cloud.usersMap[id];
    var fromLocal = null;
    for (var i = 0; i < (S.users || []).length; i++) {
      if (S.users[i].id === id) { fromLocal = S.users[i]; break; }
    }
    var base = Object.assign({
      id: id, num: hashNum(id), specialId: "", name: "مستخدم", gender: "", age: "", photo: "", online: false, level: 1
    }, fromLocal || {}, fromCloud || {});
    if (!base.name) base.name = "مستخدم";
    return base;
  }

  function hasLocalSession() { try { return localStorage.getItem(CONFIG.authSessionKey) === "1"; } catch (e) { return false; } }
  function setLocalSession(v) { try { if (v) localStorage.setItem(CONFIG.authSessionKey, "1"); else localStorage.removeItem(CONFIG.authSessionKey); } catch (e) { /* */ } }
  function isOnboardDone() { try { return localStorage.getItem(CONFIG.onboardDoneKey) === "1" && !!(S && S.me && S.me.name && String(S.me.name).trim()); } catch (e) { return false; } }
  function setOnboardDone(v) { try { if (v) localStorage.setItem(CONFIG.onboardDoneKey, "1"); else localStorage.removeItem(CONFIG.onboardDoneKey); } catch (e) { /* */ } }

  function showAuthGate(show, step) {
    var g = $("auth-gate");
    if (!g) return;
    g.classList.toggle("hidden", !show);
    if (!show) return;
    var loginBox = $("auth-step-login");
    var obBox = $("auth-step-onboard");
    var targetStep = step || (hasLocalSession() ? "onboard" : "login");
    loginBox.classList.toggle("hidden", targetStep !== "login");
    obBox.classList.toggle("hidden", targetStep !== "onboard");
    if (targetStep === "onboard") {
      if ($("ob-name") && !$("ob-name").value) $("ob-name").value = S.me.name || "";
      if ($("ob-age") && !$("ob-age").value) $("ob-age").value = S.me.age || "";
      UI.onboardPhoto = S.me.photo || "";
      UI.onboardGender = S.me.gender || "ذكر";
      renderOnboardPreview();
      document.querySelectorAll(".gender-pill").forEach(function (p) {
        p.classList.toggle("active", p.getAttribute("data-gender") === UI.onboardGender);
      });
    }
  }

  function renderOnboardPreview() {
    var prev = $("ob-av-preview");
    if (!prev) return;
    var nm = ($("ob-name") && $("ob-name").value.trim()) || S.me.name || "RV";
    if (UI.onboardPhoto) prev.innerHTML = '<img src="' + esc(UI.onboardPhoto) + '" alt="" />';
    else prev.textContent = initials(nm);
  }

  function initCloud() {
    if (!global.firebase || !FIREBASE_CONFIG.apiKey) return false;
    try {
      if (!firebase.apps.length) firebase.initializeApp(FIREBASE_CONFIG);
      cloud.db = firebase.database();
      cloud.auth = firebase.auth();
      cloud.on = true;
      return true;
    } catch (e) { cloud.on = false; return false; }
  }

  async function ensureSequentialSpecialId(userId) {
    if (!userId) return "0001000";
    if (S.me.specialId && /^\d{7}$/.test(S.me.specialId)) return S.me.specialId;
    if (!cloud.on || !cloud.db) {
      S.me.specialId = formatSpecialId(CONFIG.initialSpecialIdNumber);
      return S.me.specialId;
    }
    try {
      var snap = await cloud.db.ref("users/" + userId + "/specialId").once("value");
      var v = snap.val();
      if (typeof v === "string" && /^\d{7}$/.test(v.trim())) { S.me.specialId = v.trim(); return S.me.specialId; }
      var assigned = null;
      await cloud.db.ref("system/userIdCounter/lastAssignedId").transaction(function (curr) {
        var next = (typeof curr === "number" && curr >= CONFIG.initialSpecialIdNumber) ? Math.floor(curr) + 1 : CONFIG.initialSpecialIdNumber;
        assigned = formatSpecialId(next);
        return next;
      });
      if (assigned) {
        S.me.specialId = assigned;
        await cloud.db.ref("users/" + userId + "/specialId").set(assigned);
      }
      return S.me.specialId || "0001000";
    } catch (e) {
      if (!S.me.specialId) S.me.specialId = formatSpecialId((hashNum(userId) % 8999) + 1000);
      return S.me.specialId;
    }
  }

  function normalizeRoom(id, r) {
    r = r || {};
    var n = Number(r.seatCount) || (Array.isArray(r.seats) ? r.seats.length : 9) || 9;
    var seats = [];
    for (var i = 0; i < n; i++) {
      var s = (r.seats && r.seats[i]) || {};
      seats.push({
        uid: s.uid || null,
        locked: !!s.locked,
        muted: !!s.muted,
        vip: s.vip != null ? !!s.vip : i === 0
      });
    }
    var listenersArr = Array.isArray(r.listeners) ? r.listeners : Object.keys(r.listeners || {}).filter(function (k) { return r.listeners[k]; });
    var modsArr = Array.isArray(r.mods) ? r.mods : Object.keys(r.mods || {});
    var bansArr = Array.isArray(r.bans) ? r.bans : Object.keys(r.bans || {});
    var existing = getRoom(id);
    return {
      id: id,
      name: r.name || (existing && existing.name) || "غرفة",
      desc: r.desc || "",
      cat: r.cat || "chat",
      owner: r.owner || "",
      mods: modsArr,
      seats: seats,
      listeners: listenersArr,
      bans: bansArr,
      priv: !!r.priv,
      locked: !!r.locked,
      pinned: r.pinned || "",
      created: typeof r.created === "number" ? r.created : ((existing && existing.created) || now()),
      color: r.color != null ? r.color : 0,
      icon: r.icon != null ? r.icon : 0,
      roomPhoto: r.roomPhoto || (existing && existing.roomPhoto) || "",
      msgs: cloud.roomMsgs[id] || (existing && existing.msgs) || r.msgs || []
    };
  }

  function startCloudSync() {
    if (!cloud.on) return Promise.resolve();
    return new Promise(function (resolve) {
      var done = false;
      function finish() { if (!done) { done = true; resolve(); } }
      setTimeout(finish, 2000);
      var myId = getOrCreateFixedUid();
      S.me.id = myId;
      S.me.num = hashNum(myId);

      var uRef = cloud.db.ref("users/" + myId);
      uRef.once("value").then(async function (snap) {
        var p = snap.val();
        if (p && p.id) {
          S.me = Object.assign({}, S.me, p, { id: myId, num: p.num || S.me.num });
          if (S.me.name && String(S.me.name).trim()) setOnboardDone(true);
        }
        await ensureSequentialSpecialId(myId);
        try { uRef.child("online").onDisconnect().set(false); } catch (e) { /* */ }
        uRef.update({ online: true, specialId: S.me.specialId }).catch(function () { /* */ });

        onDb("app", cloud.db.ref("users"), "value", function (us) {
          var val = us.val() || {};
          cloud.usersMap = val;
          S.users = Object.keys(val).filter(function (k) { return k !== S.me.id; }).map(function (k) {
            return Object.assign({ id: k }, val[k]);
          });
          renderAll();
          if (UI.roomId) renderRoom();
        });

        onDb("app", cloud.db.ref("rooms"), "value", function (rs) {
          var val = rs.val() || {};
          var list = Object.keys(val).map(function (rid) { return normalizeRoom(rid, val[rid]); });
          if (list.length) {
            var localOnly = (S.rooms || []).filter(function (lr) { return !val[lr.id]; });
            S.rooms = list.concat(localOnly);
          }
          if (UI.roomId) {
            var cur = getRoom(UI.roomId);
            if (!cur) { leaveRoom(false); }
            else { syncMicHardwareState(); renderRoom(); }
          }
          renderFloatingOrb();
          if (UI.page === "home") renderHome();
          else if (UI.page === "rooms") renderRooms();
        });

        onDb("app", cloud.db.ref("social/" + S.me.id), "value", function (ss) {
          var sv = ss.val() || {};
          S.friends = Object.keys(sv.friends || {});
          S.requests = Object.keys(sv.requests || {});
          S.sentReq = Object.keys(sv.sentReq || {});
          S.follows = Object.keys(sv.follows || {});
          S.blocked = Object.keys(sv.blocked || {});
          renderAll();
        });

        onDb("app", cloud.db.ref("userDms/" + myId), "value", function (ds) {
          var threads = ds.val() || {};
          Object.keys(threads).forEach(function (peerId) {
            cloud.db.ref("dms/" + dmThreadId(myId, peerId)).limitToLast(50).once("value").then(function (ms) {
              var v = ms.val() || {};
              S.dms[peerId] = Object.keys(v).map(function (k) { return Object.assign({ key: k }, v[k]); });
              saveLocal();
              if (UI.page === "messages") renderMessages();
              if (UI.dmId === peerId) renderDM();
            }).catch(function () { /* */ });
          });
        });

        finish();
      }).catch(finish);
    });
  }

  async function signInWithGoogle() {
    if (UI.authSigningIn) return;
    UI.authSigningIn = true;
    try {
      if (cloud.on && cloud.auth && global.firebase && firebase.auth.GoogleAuthProvider) {
        var prov = new firebase.auth.GoogleAuthProvider();
        prov.setCustomParameters({ prompt: "select_account" });
        var res = await cloud.auth.signInWithPopup(prov);
        if (res && res.user) {
          if (res.user.displayName && !S.me.name) S.me.name = clean(res.user.displayName);
          if (res.user.email) S.me.email = res.user.email;
          if (res.user.photoURL && !S.me.photo) S.me.photo = res.user.photoURL;
        }
      }
      setLocalSession(true);
      await ensureSequentialSpecialId(S.me.id);
      if (isOnboardDone()) {
        UI.authReady = true;
        showAuthGate(false);
        save(); renderAll();
        toast("مرحباً بعودتك ✅");
      } else {
        showAuthGate(true, "onboard");
      }
    } catch (e) { toast((e && e.message) || "تعذر تسجيل الدخول"); }
    finally { UI.authSigningIn = false; }
  }

  async function signInAsGuest() {
    setLocalSession(true);
    await ensureSequentialSpecialId(S.me.id);
    if (isOnboardDone()) {
      UI.authReady = true;
      showAuthGate(false);
      save(); renderAll();
    } else {
      showAuthGate(true, "onboard");
    }
  }

  function completeOnboarding() {
    var nameInput = $("ob-name");
    var ageInput = $("ob-age");
    var nm = clean((nameInput && nameInput.value) || "").trim();
    var ag = ageInput ? String(ageInput.value || "").trim() : "";
    if (!nm) { toast("من فضلك اكتب اسمك أولاً"); return; }
    S.me.name = nm;
    S.me.age = ag;
    S.me.gender = UI.onboardGender || "ذكر";
    if (UI.onboardPhoto) S.me.photo = UI.onboardPhoto;
    setOnboardDone(true);
    UI.authReady = true;
    showAuthGate(false);
    save();
    renderAll();
    toast("تم حفظ بياناتك بنجاح ✅");
  }

  function getRoom(id) {
    if (!id || !S || !Array.isArray(S.rooms)) return null;
    for (var i = 0; i < S.rooms.length; i++) if (S.rooms[i].id === id) return S.rooms[i];
    return null;
  }

  function isFriendWith(otherId) { return !!(otherId && otherId !== S.me.id && Array.isArray(S.friends) && S.friends.indexOf(otherId) >= 0); }

  function avatarInnerHTML(u) {
    if (u && u.photo) return '<img src="' + esc(u.photo) + '" alt="' + esc(u.name || "avatar") + '" />';
    return esc(initials(u && u.name));
  }
  function avatarHTML(u, cls) { return '<div class="avatar ' + (cls || "") + '">' + avatarInnerHTML(u) + "</div>"; }
  function setAvatarEl(el, u) { if (el) el.innerHTML = avatarInnerHTML(u); }

  function roomSqMediaHTML(r, insideCount) {
    var bg = COVERS[(r.color || 0) % COVERS.length];
    var ic = COVER_ICONS[(r.icon || 0) % COVER_ICONS.length];
    var inner = r.roomPhoto ? '<img src="' + esc(r.roomPhoto) + '" alt="' + esc(r.name || "") + '" />' : "<span>" + ic + "</span>";
    return '<div class="room-sq-media" style="background:' + bg + '">' +
      '<span class="room-sq-live-pill">🎧 ' + insideCount + "</span>" +
      inner + "</div>";
  }

  function getRoomParticipantIds(room) {
    var seen = {}, ids = [];
    if (!room) return ids;
    (room.seats || []).forEach(function (s) { if (s && s.uid && !seen[s.uid]) { seen[s.uid] = true; ids.push(s.uid); } });
    (room.listeners || []).forEach(function (uidItem) { if (uidItem && !seen[uidItem]) { seen[uidItem] = true; ids.push(uidItem); } });
    return ids;
  }
  function count(room) { return getRoomParticipantIds(room).length; }
  function seatIndexOf(room, id) {
    if (!room || !Array.isArray(room.seats)) return -1;
    for (var i = 0; i < room.seats.length; i++) if (room.seats[i].uid === id) return i;
    return -1;
  }
  function inRoom(room, id) { return !!room && (seatIndexOf(room, id) >= 0 || (room.listeners || []).indexOf(id) >= 0); }

  function pushRoomMsg(room, msgObj) {
    if (!room) return;
    if (!Array.isArray(room.msgs)) room.msgs = [];
    room.msgs.push(Object.assign({ key: uid() }, msgObj, { t: now() }));
    if (UI.roomId === room.id) renderRoomChat();
    if (cloud.on && cloud.db) cloud.db.ref("roomMessages/" + room.id).push(Object.assign({}, msgObj, { t: serverTs() })).catch(function () { /* */ });
  }

  function showEntryBanner(userObj) {
    var wrap = $("entry-banner-wrap");
    if (!wrap || !userObj) return;
    var u = typeof userObj === "string" ? resolveLiveUser(userObj) : userObj;
    var ribbon = document.createElement("div");
    ribbon.className = "entry-ribbon";
    ribbon.innerHTML = "<span>✨ دخل الغرفة: " + esc(u.name || "مستخدم") + "</span>";
    wrap.appendChild(ribbon);
    setTimeout(function () { if (ribbon.parentNode) ribbon.parentNode.removeChild(ribbon); }, 3000);
  }

  function showFlyGiftToSeat(emoji, senderName, targetUid, targetName) {
    var room = getRoom(UI.roomId || UI.floatingRoomId);
    var appEl = $("app");
    if (!appEl) return;
    var startX = window.innerWidth / 2, startY = window.innerHeight - 90;
    var endX = window.innerWidth / 2, endY = window.innerHeight * 0.28;
    var targetSeatIdx = -1;
    if (room && targetUid && targetUid !== "room" && UI.roomId) {
      targetSeatIdx = seatIndexOf(room, targetUid);
      if (targetSeatIdx >= 0) {
        var seatEl = document.querySelector('#room-seats .seat[data-seat="' + targetSeatIdx + '"]');
        if (seatEl) {
          var rect = seatEl.getBoundingClientRect();
          endX = rect.left + rect.width / 2;
          endY = rect.top + rect.height / 2;
        }
      }
    }
    var proj = document.createElement("div");
    proj.className = "gift-projectile";
    proj.style.left = startX + "px"; proj.style.top = startY + "px";
    proj.innerHTML = emoji + "<small>" + esc(senderName) + " ➔ " + esc(targetName) + "</small>";
    appEl.appendChild(proj);
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        proj.style.left = endX + "px"; proj.style.top = endY + "px";
        proj.style.transform = "translate(-50%,-50%) scale(1.2)";
      });
    });
    setTimeout(function () {
      if (targetSeatIdx >= 0) {
        var hitEl = document.querySelector('#room-seats .seat[data-seat="' + targetSeatIdx + '"]');
        if (hitEl) { hitEl.classList.add("gift-hit"); setTimeout(function () { hitEl.classList.remove("gift-hit"); }, 1400); }
      }
    }, 750);
    setTimeout(function () { proj.style.opacity = "0"; }, 1900);
    setTimeout(function () { if (proj.parentNode) proj.parentNode.removeChild(proj); }, 2400);
  }

  function renderHomeBanners() {
    var slot = $("home-banners-slot");
    if (!slot) return;
    if (!S || !Array.isArray(S.banners) || !S.banners.length) {
      slot.innerHTML = '<div class="banners-placeholder">🖼️ مكان البنرات — سيتم إضافتها لاحقاً</div>';
      return;
    }
    slot.innerHTML = '<img src="' + esc(S.banners[0]) + '" alt="Banner" />';
  }

  function go(page) {
    closeSheet();
    UI.page = page;
    document.querySelectorAll(".page").forEach(function (p) { p.classList.toggle("active", p.id === "page-" + page); });
    document.querySelectorAll(".navbtn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-page") === page); });
    renderCurrentPage();
  }

  function renderTop() {
    setAvatarEl($("avatar-top"), resolveLiveUser(S.me.id));
    var tBtn = $("theme-toggle-btn");
    if (tBtn) tBtn.textContent = (S.settings && S.settings.lightTheme) ? "🌙" : "☀️";
    var unread = S.notifs.filter(function (n) { return !n.read; }).length;
    var b = $("notif-badge");
    if (b) { b.textContent = unread; b.classList.toggle("hidden", unread === 0); }
    var mu = 0; for (var k in S.unread) mu += S.unread[k] || 0;
    var mb = $("msg-badge");
    if (mb) { mb.textContent = mu; mb.classList.toggle("hidden", mu === 0); }
    var fb = $("friends-badge");
    if (fb) { fb.textContent = S.requests.length; fb.classList.toggle("hidden", S.requests.length === 0); }
  }

  function roomCard(r) {
    var inside = count(r);
    return '<div class="room-sq-card" data-enter="' + esc(r.id) + '">' +
      roomSqMediaHTML(r, inside) +
      '<div class="room-sq-footer">' +
        '<div class="room-sq-name-full">' + esc(r.name) + "</div>" +
        '<div class="room-sq-inside-count">داخل الغرفة: ' + inside + "</div>" +
      "</div></div>";
  }

  function renderIdSearchHighlight(q) {
    var box = $("id-search-result-box");
    if (!box) return;
    if (!q) { box.classList.add("hidden"); box.innerHTML = ""; return; }

    var allIds = [S.me.id].concat(Object.keys(cloud.usersMap || {}), (S.users || []).map(function (u) { return u.id; }));
    var uniqueIds = [], seen = {};
    allIds.forEach(function (id) { if (id && !seen[id]) { seen[id] = true; uniqueIds.push(id); } });

    var matched = [];
    uniqueIds.forEach(function (id) {
      var u = resolveLiveUser(id);
      var sid = displayUserId(u).toLowerCase();
      var rawId = String(u.id || "").toLowerCase();
      if (sid.indexOf(q) >= 0 || rawId.indexOf(q) >= 0) {
        matched.push(u);
      }
    });

    if (!matched.length) { box.classList.add("hidden"); box.innerHTML = ""; return; }

    box.classList.remove("hidden");
    box.innerHTML = matched.slice(0, 3).map(function (u) {
      return '<div class="id-result-banner" data-profile="' + esc(u.id) + '">' +
        '<div style="display:flex;align-items:center;gap:12px">' +
          avatarHTML(u) +
          '<div class="info">' +
            '<div class="name">' + esc(u.name) + ' <span class="tag verified">ID: ' + esc(displayUserId(u)) + "</span></div>" +
            '<div class="meta">' + (u.gender ? esc(u.gender) + " • " : "") + (u.age ? esc(u.age) + " سنة • " : "") + (u.online ? "متصل الآن" : "حساب مسجل") + "</div>" +
          "</div>" +
          (u.id !== S.me.id ? '<button class="btn sm" data-profile="' + esc(u.id) + '" type="button">فتح</button>' : '<span class="tag">أنت</span>') +
        "</div></div>";
    }).join("");
  }

  function renderHome() {
    renderHomeBanners();
    var q = UI.query.trim().toLowerCase();
    var clrBtn = $("search-clear-btn");
    if (clrBtn) clrBtn.classList.toggle("hidden", !q);
    renderIdSearchHighlight(q);

    var list = S.rooms.filter(function (r) { return !r.priv || r.owner === S.me.id || inRoom(r, S.me.id); });
    if (q) list = list.filter(function (r) { return r.name.toLowerCase().indexOf(q) >= 0 || r.id.toLowerCase().indexOf(q) >= 0; });
    if (UI.filter === "popular") list = list.slice().sort(function (a, b) { return count(b) - count(a); });
    else if (UI.filter === "new") list = list.slice().sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
    else if (UI.filter === "friends") list = list.filter(function (r) { return S.friends.some(function (fid) { return inRoom(r, fid); }); });
    else if (UI.filter === "vip") list = list.filter(function (r) { return r.cat === "vip"; });
    else if (UI.filter === "games") list = list.filter(function (r) { return r.cat === "games"; });

    $("home-rooms").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty" style="grid-column:1/-1">لا توجد غرف مطابقة</div>';

    var uBox = $("search-users");
    if (q) {
      var us = S.users.filter(function (u) {
        var live = resolveLiveUser(u.id);
        var sid = displayUserId(live).toLowerCase();
        return sid.indexOf(q) >= 0 || String(live.id || "").toLowerCase().indexOf(q) >= 0 || (live.name || "").toLowerCase().indexOf(q) >= 0;
      });
      uBox.classList.toggle("hidden", us.length === 0);
      uBox.innerHTML = us.map(function (u) {
        var live = resolveLiveUser(u.id);
        return '<div class="row glass" data-profile="' + esc(live.id) + '">' + avatarHTML(live) +
          '<div class="info"><div class="name">' + esc(live.name) + ' <span class="tag">ID: ' + esc(displayUserId(live)) + '</span></div><div class="meta">' + (live.gender ? live.gender + " • " : "") + "Lv." + (live.level || 1) + "</div></div></div>";
      }).join("");
    } else { uBox.classList.add("hidden"); }

    document.querySelectorAll("#home-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-filter") === UI.filter); });
  }

  function renderRooms() {
    var list = UI.rfilter === "mine"
      ? S.rooms.filter(function (r) { return r.owner === S.me.id; })
      : S.rooms.filter(function (r) { return !r.priv || r.owner === S.me.id; });
    $("rooms-list").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty" style="grid-column:1/-1">لا توجد غرف</div>';
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-rfilter") === UI.rfilter); });
  }

  function personRow(u, actions) {
    var live = resolveLiveUser(u.id);
    return '<div class="row glass"><div data-profile="' + esc(live.id) + '" style="position:relative">' + avatarHTML(live) + '<span class="dot ' + (live.online ? "on" : "") + '"></span></div>' +
      '<div class="info" data-profile="' + esc(live.id) + '"><div class="name">' + esc(live.name) + '</div><div class="meta">ID: ' + esc(displayUserId(live)) + " • " + (live.online ? "متصل" : "غير متصل") + "</div></div>" +
      actions + "</div>";
  }

  function renderFriends() {
    $("req-count").textContent = S.requests.length ? "(" + S.requests.length + ")" : "";
    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-ftab") === UI.ftab); });
    $("find-box").classList.toggle("hidden", UI.ftab !== "find");
    var html = "";
    if (UI.ftab === "friends") {
      var fr = S.friends.map(resolveLiveUser);
      html = fr.length ? fr.map(function (u) {
        return personRow(u, '<button class="btn sm ghost" data-dm="' + esc(u.id) + '" type="button">💬 خاص</button>');
      }).join("") : '<div class="empty">لا يوجد أصدقاء بعد</div>';
    } else if (UI.ftab === "requests") {
      html = S.requests.length ? S.requests.map(function (id) {
        return personRow(resolveLiveUser(id), '<button class="btn sm" data-accept="' + esc(id) + '" type="button">قبول</button><button class="btn sm ghost" data-reject="' + esc(id) + '" type="button">رفض</button>');
      }).join("") : '<div class="empty">لا توجد طلبات صداقة</div>';
    } else {
      var q = UI.findQ.trim().toLowerCase();
      var res = S.users.filter(function (u) {
        var live = resolveLiveUser(u.id);
        return !q || (live.name || "").toLowerCase().indexOf(q) >= 0 || displayUserId(live).toLowerCase().indexOf(q) >= 0;
      });
      html = res.length ? res.map(function (u) {
        var live = resolveLiveUser(u.id);
        var btn = S.friends.indexOf(live.id) >= 0 ? '<span class="tag verified">صديق ✔</span>'
          : (S.sentReq.indexOf(live.id) >= 0 ? '<span class="tag">تم الإرسال</span>'
          : '<button class="btn sm" data-addfriend="' + esc(live.id) + '" type="button">+ إضافة</button>');
        return personRow(live, btn);
      }).join("") : '<div class="empty">لا نتائج</div>';
    }
    $("friends-list").innerHTML = html;
  }

  function renderMessages() {
    var ids = Object.keys(S.dms).filter(function (id) { return isFriendWith(id) && S.dms[id] && S.dms[id].length; });
    $("dm-list").innerHTML = ids.length ? ids.map(function (id) {
      var u = resolveLiveUser(id), last = S.dms[id][S.dms[id].length - 1];
      return '<div class="row glass" data-dm="' + esc(id) + '">' + avatarHTML(u) +
        '<div class="info"><div class="name">' + esc(u.name) + '</div><div class="meta">' + esc(last.text || "رسالة") + '</div></div>' +
        '<div class="meta">' + timeStr(last.t) + "</div></div>";
    }).join("") : '<div class="empty">لا توجد رسائل خاصة للأصدقاء حالياً</div>';
  }

  function renderProfile() {
    var m = resolveLiveUser(S.me.id);
    var covEl = $("pf-cover");
    if (covEl) covEl.style.backgroundImage = m.photo ? 'url("' + String(m.photo).replace(/"/g, '\\"') + '")' : "linear-gradient(135deg,#7c3aed,#db2777,#0891b2)";
    setAvatarEl($("pf-avatar"), m);
    $("pf-name").textContent = m.name || "مستخدم";
    $("pf-id").textContent = "ID: " + displayUserId(m);
    var ga = [];
    if (m.gender) ga.push(m.gender);
    if (m.age) ga.push(m.age + " سنة");
    $("pf-gender-age").textContent = ga.length ? ga.join(" • ") : "—";
    $("pf-charm-level").textContent = "Lv." + getCharmLevel(m.charm || 0) + " (" + Number(m.charm || 0) + ")";
    $("pf-wealth-level").textContent = "Lv." + getWealthLevel(m.wealth || 0) + " (" + Number(m.wealth || 0) + ")";
    $("pf-friends-count").textContent = String((S.friends || []).length);
    $("pf-followers-count").textContent = String(Number(m.followers || 0));
    $("pf-wallet-coins").textContent = String(Number(m.coins || 0));
  }

  function renderCurrentPage() {
    if (UI.page === "home") renderHome();
    else if (UI.page === "rooms") renderRooms();
    else if (UI.page === "friends") renderFriends();
    else if (UI.page === "messages") renderMessages();
    else if (UI.page === "profile") renderProfile();
  }
  function renderAll() { renderTop(); renderCurrentPage(); }

  function openSheet(html) {
    var sh = $("sheet"), sc = $("scrim");
    sh.innerHTML = '<div class="sheet-handle"></div>' + html;
    sh.scrollTop = 0;
    sc.classList.add("open");
    sh.classList.add("open");
  }
  function closeSheet() {
    var sh = $("sheet"), sc = $("scrim");
    if (sc) sc.classList.remove("open");
    if (sh) sh.classList.remove("open");
  }

  function openProfileSettingsSheet() {
    var m = S.me;
    var nextPhoto = m.photo || "";
    var canDaily = !m.daily || (Date.now() - Number(m.daily) >= 24 * 60 * 60 * 1000);

    openSheet("<h3>⚙️ إعدادات الملف الشخصي</h3>" +
      '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' +
        '<div class="avatar lg" id="set-av-live">' + (nextPhoto ? '<img src="' + esc(nextPhoto) + '" alt="" />' : esc(initials(m.name))) + "</div>" +
        '<div class="info"><div class="name">' + esc(m.name || "مستخدم") + '</div><div class="meta">ID: ' + esc(displayUserId(m)) + "</div></div>" +
      "</div>" +
      "<label>الاسم</label><input id='set-name' maxlength='24' value='" + esc(m.name) + "' />" +
      "<label>العمر</label><input id='set-age' type='number' min='10' max='99' value='" + esc(m.age || "") + "' />" +
      "<label>النوع</label><select id='set-gender'><option value='ذكر' " + (m.gender !== "أنثى" ? "selected" : "") + ">ذكر</option><option value='أنثى' " + (m.gender === "أنثى" ? "selected" : "") + ">أنثى</option></select>" +
      "<label>النبذة التعريفية</label><textarea id='set-bio' rows='2' maxlength='140'>" + esc(m.bio || "") + "</textarea>" +
      "<label>تغيير صورة البروفايل</label><input id='set-photo-file' type='file' accept='image/*' />" +
      '<button class="btn block" id="set-save-profile" type="button">💾 حفظ ونشر الصورة</button>' +
      '<div style="display:flex;gap:8px;margin-top:10px">' +
        '<button class="btn ghost" style="flex:1" id="set-daily" type="button">' + (canDaily ? "🎁 مكافأة اليوم (+100)" : "✅ تم استلام اليوم") + "</button>" +
        '<button class="btn ghost" style="flex:1" id="set-topup" type="button">+ شحن 500 عملة</button>' +
      "</div>" +
      '<div class="switchrow" style="margin-top:8px"><span>الوضع النهاري</span><input type="checkbox" id="set-theme" ' + (S.settings.lightTheme ? "checked" : "") + " /></div>" +
      '<button class="btn ghost block" id="set-google" type="button">🔄 تبديل / تسجيل دخول Google</button>' +
      '<button class="btn red block" id="set-reset" type="button">إعادة ضبط البيانات</button>');

    $("set-photo-file").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        nextPhoto = await readImageFileAsDataUrl(f, 220, 0.65);
        var avEl = $("set-av-live");
        if (avEl) avEl.innerHTML = '<img src="' + esc(nextPhoto) + '" alt="" />';
        toast("تم تحميل الصورة — اضغط حفظ ونشر الصورة ✅");
      } catch (e) { toast(e.message); }
    };

    $("set-save-profile").onclick = function () {
      var n = $("set-name").value.trim();
      if (!n) { toast("الاسم مطلوب"); return; }
      m.name = clean(n);
      m.age = $("set-age").value.trim();
      m.gender = $("set-gender").value;
      m.bio = clean($("set-bio").value.trim());
      m.photo = nextPhoto;

      cloud.usersMap[m.id] = Object.assign({}, cloud.usersMap[m.id] || {}, {
        id: m.id, name: m.name, photo: m.photo, gender: m.gender, age: m.age, specialId: m.specialId || ""
      });
      if (cloud.on && cloud.db) {
        cloud.db.ref("users/" + m.id).update({
          name: m.name, username: m.name, photo: m.photo, gender: m.gender, age: m.age, updatedAt: serverTs()
        }).catch(function () { /* */ });
      }
      save();
      closeSheet();
      renderAll();
      if (UI.roomId) renderRoom();
      toast("تم تحديث صورتك وبياناتك للجميع ✅");
    };

    $("set-daily").onclick = function () {
      if (!canDaily) { toast("استلمت مكافأة اليوم بالفعل"); return; }
      m.daily = Date.now(); m.coins += 100;
      save(); renderAll(); openProfileSettingsSheet(); toast("حصلت على 100 عملة 🪙");
    };
    $("set-topup").onclick = function () {
      m.coins += 500; m.wealth = Number(m.wealth || 0) + 500;
      save(); renderAll(); openProfileSettingsSheet(); toast("تم شحن 500 عملة 🪙");
    };
    $("set-theme").onchange = function () {
      S.settings.lightTheme = this.checked; applyThemeMode(); saveLocal(); renderTop();
    };
    $("set-google").onclick = function () { closeSheet(); signInWithGoogle(); };
    $("set-reset").onclick = function () {
      localStorage.removeItem(CONFIG.storageKey);
      localStorage.removeItem(CONFIG.onboardDoneKey);
      location.reload();
    };
  }

  function openRenameRoomSheet(room) {
    if (!room) return;
    openSheet("<h3>✏️ تغيير اسم الغرفة</h3><input id='rn-input' maxlength='40' value='" + esc(room.name) + "' /><button class='btn block' id='rn-ok' type='button'>حفظ الاسم</button>");
    $("rn-ok").onclick = function () {
      var nextName = clean($("rn-input").value.trim());
      if (!nextName) { toast("اكتب اسم الغرفة"); return; }
      room.name = nextName;
      if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/name").set(nextName).catch(function () { /* */ });
      saveLocal(); closeSheet(); renderRoom(); renderFloatingOrb(); renderHome(); renderRooms();
      toast("تم تغيير اسم الغرفة ✅");
    };
  }

  function openCreateRoom() {
    var cats = Object.keys(CATEGORIES).map(function (k) { return '<option value="' + k + '">' + CATEGORIES[k] + "</option>"; }).join("");
    openSheet("<h3>🎙️ إنشاء غرفة جديدة</h3>" +
      '<label>اسم الغرفة</label><input id="cr-name" maxlength="40" placeholder="مثال: سهرة الأصدقاء" />' +
      '<label>التصنيف</label><select id="cr-cat">' + cats + "</select>" +
      '<label>عدد المقاعد</label><select id="cr-seats"><option value="6">6 مقاعد</option><option value="9" selected>9 مقاعد</option><option value="12">12 مقعد</option></select>' +
      '<button class="btn block" id="cr-ok" type="button">إنشاء الغرفة</button>');
    $("cr-ok").onclick = function () {
      var name = $("cr-name").value.trim();
      if (!name) { toast("اكتب اسم الغرفة"); return; }
      var n = Number($("cr-seats").value);
      var roomId = "r" + Math.random().toString(36).slice(2, 7);
      var room = {
        id: roomId, name: clean(name), desc: "", cat: $("cr-cat").value,
        owner: S.me.id, mods: [], seats: makeSeats(n), listeners: [], bans: [],
        priv: false, locked: false, pinned: "", created: now(), msgs: [],
        color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length), roomPhoto: ""
      };
      S.rooms.unshift(room);
      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + roomId).set({
          name: room.name, cat: room.cat, owner: room.owner, seatCount: n,
          created: serverTs(), color: room.color, icon: room.icon
        }).catch(function () { /* */ });
      }
      save(); closeSheet(); renderAll();
      enterRoom(roomId);
    };
  }

  function enterRoom(id) {
    closeSheet();
    var room = getRoom(id);
    if (!room) { toast("الغرفة غير موجودة"); return; }
    offDb("room");
    if (!inRoom(room, S.me.id)) {
      if (!Array.isArray(room.listeners)) room.listeners = [];
      if (room.listeners.indexOf(S.me.id) < 0) room.listeners.push(S.me.id);
      if (cloud.on && cloud.db) {
        var lRef = cloud.db.ref("rooms/" + id + "/listeners/" + S.me.id);
        try { lRef.onDisconnect().remove(); } catch (e) { /* */ }
        lRef.set(true).catch(function () { /* */ });
      }
      pushRoomMsg(room, { sys: true, joinUser: { uid: S.me.id, name: S.me.name || "مستخدم" }, text: (S.me.name || "مستخدم") + " دخل الغرفة 👋" });
      showEntryBanner(S.me);
    }
    UI.roomId = id;
    UI.floatingRoomId = null;
    UI.micMuted = false;
    renderFloatingOrb();
    $("room-view").classList.add("open");
    renderRoom();
    renderHome();

    if (cloud.on && cloud.db) {
      onDb("room", cloud.db.ref("roomMessages/" + id).limitToLast(100), "value", function (ms) {
        var mv = ms.val() || {};
        var arr = Object.keys(mv).map(function (k) { return Object.assign({ key: k }, mv[k]); });
        cloud.roomMsgs[id] = arr;
        var r = getRoom(id);
        if (r) r.msgs = arr;
        renderRoomChat();
        var last = arr[arr.length - 1];
        if (last && last.giftAnim && last.from !== S.me.id && (now() - (last.t || 0) < 8000)) {
          showFlyGiftToSeat(last.giftAnim.e, last.giftAnim.fromName, last.giftAnim.toUid, last.giftAnim.toName);
        }
        if (last && last.joinUser && last.joinUser.uid !== S.me.id && (now() - (last.t || 0) < 8000)) {
          showEntryBanner(last.joinUser);
        }
      });
    }
    joinVoiceChannel(id, seatIndexOf(room, S.me.id) >= 0 ? "publisher" : "subscriber");
  }

  async function leaveRoom(silent) {
    closeSheet();
    offDb("room");
    var targetRoomId = UI.roomId || UI.floatingRoomId;
    UI.roomId = null;
    UI.floatingRoomId = null;
    $("room-view").classList.remove("open");
    renderFloatingOrb();

    await leaveVoiceChannel();

    var room = getRoom(targetRoomId);
    if (room) {
      var si = seatIndexOf(room, S.me.id);
      if (si >= 0) room.seats[si].uid = null;
      room.listeners = (room.listeners || []).filter(function (x) { return x !== S.me.id; });
      if (cloud.on && cloud.db) {
        var ups = {};
        if (si >= 0) ups["rooms/" + room.id + "/seats/" + si + "/uid"] = null;
        ups["rooms/" + room.id + "/listeners/" + S.me.id] = null;
        cloud.db.ref().update(ups).catch(function () { /* */ });
      }
      pushRoomMsg(room, { sys: true, text: (S.me.name || "مستخدم") + " غادر الغرفة" });
    }
    if (!silent) renderAll();
  }

  function renderFloatingOrb() {
    var orb = $("floating-room-orb");
    if (!orb) return;
    if (!UI.floatingRoomId) { orb.classList.add("hidden"); return; }
    var r = getRoom(UI.floatingRoomId);
    if (!r) { UI.floatingRoomId = null; orb.classList.add("hidden"); return; }
    orb.classList.remove("hidden");
    $("floating-orb-avatar").innerHTML = r.roomPhoto ? '<img src="' + esc(r.roomPhoto) + '" alt="" />' : esc(COVER_ICONS[(r.icon || 0) % COVER_ICONS.length]);
    $("floating-orb-label").textContent = r.name || "روم";
  }

  function renderRoom() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    $("room-title").textContent = room.name;
    $("room-right-id").textContent = "ID: " + displayUserId(S.me);
    $("room-online-count").textContent = String(count(room));

    var thumbInner = $("room-top-thumb-inner");
    if (thumbInner) {
      thumbInner.innerHTML = room.roomPhoto ? '<img src="' + esc(room.roomPhoto) + '" alt="" />' : esc(COVER_ICONS[(room.icon || 0) % COVER_ICONS.length]);
    }

    var cols = { 4: 4, 6: 3, 9: 3, 12: 4 }[room.seats.length] || 3;
    var grid = $("room-seats");
    grid.style.gridTemplateColumns = "repeat(" + cols + ",1fr)";
    grid.innerHTML = room.seats.map(function (s, i) {
      var cls = "seat", inner, fullName, sub;
      if (s.uid) {
        var u = resolveLiveUser(s.uid);
        var muted = s.muted || (s.uid === S.me.id && UI.micMuted);
        var speaking = !muted && !!voice.speakingNums[u.num || hashNum(s.uid)];
        cls += " occ" + (speaking ? " speak" : "");
        inner = avatarInnerHTML(u);
        fullName = esc(u.name || "مستخدم");
        sub = s.uid === room.owner ? "👑 المالك" : (u.me ? "أنت" : "مقعد " + (i + 1));
      } else if (s.locked) {
        cls += " locked"; inner = "🔒"; fullName = "مقفل"; sub = "مقعد " + (i + 1);
      } else {
        inner = s.vip ? "👑" : "🎙️"; fullName = "مقعد " + (i + 1); sub = "فارغ";
      }
      var isMuted = s.uid && (s.muted || (s.uid === S.me.id && UI.micMuted));
      return '<div class="' + cls + '" data-seat="' + i + '">' +
        '<div class="seat-orb"><span class="seat-num-badge">' + (i + 1) + '</span><div class="seatav">' + inner + "</div>" + (isMuted ? '<span class="mutedmark">🔇</span>' : "") + "</div>" +
        '<div class="seat-meta-pill"><div class="seatname-full">' + fullName + '</div><div class="seatsub">' + sub + "</div></div></div>";
    }).join("");

    var mic = $("mic-btn");
    var mySeat = seatIndexOf(room, S.me.id);
    if (mic) {
      mic.classList.remove("mic-on", "mic-off");
      if (mySeat < 0) mic.textContent = "🎙️";
      else if (UI.micMuted || room.seats[mySeat].muted) { mic.classList.add("mic-off"); mic.textContent = "🔇"; }
      else { mic.classList.add("mic-on"); mic.textContent = "🎤"; }
    }
    renderRoomChat();
  }

  function renderRoomChat() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var box = $("room-chat");
    var stick = box.scrollTop + box.clientHeight >= box.scrollHeight - 48;
    box.innerHTML = (room.msgs || []).map(function (m) {
      if (m.sys) return '<div class="msg sys">' + esc(m.text) + "</div>";
      var u = resolveLiveUser(m.from), me = m.from === S.me.id;
      var body = m.sticker ? '<div style="font-size:36px">' + esc(m.sticker) + "</div>"
        : (m.img ? '<img src="' + esc(m.img) + '" alt="" style="max-width:190px;border-radius:10px" />' : esc(m.text));
      return '<div class="msg ' + (me ? "me" : "") + '"><div class="who">' + esc(u.name) + "</div>" + body + '<div class="tm">' + timeStr(m.t) + "</div></div>";
    }).join("");
    if (stick) box.scrollTop = box.scrollHeight;
  }

  function sendRoomMsg(text, extra) {
    var room = getRoom(UI.roomId);
    text = String(text || "").trim();
    if (!room || (!text && (!extra || (!extra.img && !extra.sticker)))) return;
    pushRoomMsg(room, Object.assign({ from: S.me.id, text: clean(text) }, extra || {}));
    S.me.xp = Number(S.me.xp || 0) + 5;
    save();
  }

  function seatClick(i) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var s = room.seats[i];
    if (s.uid) {
      if (s.uid !== S.me.id) openUserProfile(s.uid);
      else {
        UI.micMuted = !UI.micMuted;
        renderRoom(); syncMicHardwareState();
      }
      return;
    }
    if (s.locked) { toast("المقعد مقفل 🔒"); return; }

    var prevSeat = seatIndexOf(room, S.me.id);
    if (prevSeat >= 0) {
      room.seats[prevSeat].uid = null;
      if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + prevSeat + "/uid").set(null).catch(function () { /* */ });
    }

    s.uid = S.me.id;
    s.muted = false;
    UI.micMuted = false;

    cloud.usersMap[S.me.id] = Object.assign({}, cloud.usersMap[S.me.id] || {}, {
      id: S.me.id, name: S.me.name || "مستخدم", photo: S.me.photo || "",
      gender: S.me.gender || "", age: S.me.age || "", specialId: S.me.specialId || ""
    });

    if (cloud.on && cloud.db) {
      var ups = {};
      ups["users/" + S.me.id + "/name"] = S.me.name || "مستخدم";
      ups["users/" + S.me.id + "/photo"] = S.me.photo || "";
      ups["rooms/" + room.id + "/seats/" + i + "/uid"] = S.me.id;
      ups["rooms/" + room.id + "/seats/" + i + "/muted"] = false;
      cloud.db.ref().update(ups).catch(function () { /* */ });
      try { cloud.db.ref("rooms/" + room.id + "/seats/" + i + "/uid").onDisconnect().set(null); } catch (e) { /* */ }
    }

    renderRoom();
    joinVoiceChannel(room.id, "publisher");
  }

  function openDM(id) {
    if (!isFriendWith(id)) { toast("الدردشة الخاصة متاحة للأصدقاء فقط 👥"); return; }
    closeSheet();
    UI.dmId = id;
    if (!S.dms[id]) S.dms[id] = [];
    var u = resolveLiveUser(id);
    setAvatarEl($("chat-avatar"), u);
    $("chat-title").textContent = u.name;
    $("chat-sub").textContent = "صديق • ID: " + displayUserId(u);
    $("chat-view").classList.add("open");
    renderDM();
    offDb("dm");
    if (cloud.on && cloud.db) {
      onDb("dm", cloud.db.ref("dms/" + dmThreadId(S.me.id, id)).limitToLast(100), "value", function (snap) {
        var v = snap.val() || {};
        S.dms[id] = Object.keys(v).map(function (k) { return Object.assign({ key: k }, v[k]); });
        saveLocal();
        renderDM();
      });
    }
  }

  function closeDM() {
    offDb("dm");
    UI.dmId = null;
    $("chat-view").classList.remove("open");
    renderAll();
  }

  function renderDM() {
    var id = UI.dmId;
    if (!id) return;
    var box = $("chat-msgs");
    box.innerHTML = (S.dms[id] || []).map(function (m) {
      var me = m.from === S.me.id;
      return '<div class="msg ' + (me ? "me" : "") + '"><div>' + esc(m.text) + '</div><div class="tm">' + timeStr(m.t) + "</div></div>";
    }).join("");
    box.scrollTop = box.scrollHeight;
  }

  function sendDM(text) {
    var id = UI.dmId;
    text = String(text || "").trim();
    if (!id || !text) return;
    if (!isFriendWith(id)) {
      toast("لا يمكنك إرسال رسالة؛ يجب أن يكون المستخدم صديقاً 👥");
      closeDM();
      return;
    }
    var msgObj = { from: S.me.id, to: id, text: clean(text), t: now() };
    if (!S.dms[id]) S.dms[id] = [];
    S.dms[id].push(msgObj);
    if (cloud.on && cloud.db) {
      var tid = dmThreadId(S.me.id, id);
      cloud.db.ref("dms/" + tid).push(Object.assign({}, msgObj, { t: serverTs() })).catch(function () { /* */ });
      cloud.db.ref("userDms/" + S.me.id + "/" + id).set(true).catch(function () { /* */ });
      cloud.db.ref("userDms/" + id + "/" + S.me.id).set(true).catch(function () { /* */ });
    }
    saveLocal();
    renderDM();
  }

  function openUserProfile(id) {
    var u = resolveLiveUser(id);
    if (!u || !u.id || id === S.me.id) return;
    var isF = isFriendWith(id);
    var details = ["ID: " + displayUserId(u)];
    if (u.gender) details.push(u.gender);
    if (u.age) details.push(u.age + " سنة");
    details.push(isF ? "صديق ✔" : "ليس صديقاً");
    var html = '<div style="display:flex;gap:12px;align-items:center">' + avatarHTML(u, "lg") +
      '<div class="info"><div class="name">' + esc(u.name) + '</div><div class="meta">' + esc(details.join(" • ")) + "</div></div></div>" +
      '<div class="social-grid">' +
        (isF
          ? '<button class="btn" id="up-dm" type="button">💬 رسالة خاصة</button>'
          : '<button class="btn" id="up-add" type="button">+ إضافة صديق</button>') +
        '<button class="btn ghost" id="up-close" type="button">إغلاق</button>' +
      "</div>";
    openSheet(html);
    if ($("up-dm")) $("up-dm").onclick = function () { closeSheet(); if (UI.roomId) leaveRoom(true); openDM(id); };
    if ($("up-add")) $("up-add").onclick = function () {
      if (S.friends.indexOf(id) < 0) S.friends.push(id);
      if (cloud.on && cloud.db) {
        var ups = {};
        ups["social/" + S.me.id + "/friends/" + id] = true;
        ups["social/" + id + "/friends/" + S.me.id] = true;
        cloud.db.ref().update(ups).catch(function () { /* */ });
      }
      save(); closeSheet(); renderAll(); toast("تمت الإضافة كصديق ✅");
    };
    if ($("up-close")) $("up-close").onclick = closeSheet;
  }

  function openGiftSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var seatedIds = [];
    room.seats.forEach(function (s) { if (s && s.uid && seatedIds.indexOf(s.uid) < 0) seatedIds.push(s.uid); });
    if (!seatedIds.length) { toast("لا يوجد عضو جالس على مقعد لإرسال الهدية له"); return; }
    if (!UI.giftTarget || seatedIds.indexOf(UI.giftTarget) < 0) UI.giftTarget = seatedIds[0];

    var targetsHtml = seatedIds.map(function (id) {
      var u = resolveLiveUser(id);
      return '<button class="gt-chip ' + (UI.giftTarget === id ? "sel" : "") + '" data-gtarget="' + esc(id) + '" type="button">' + esc(u.name) + "</button>";
    }).join("");
    var gridHtml = GIFTS.map(function (g) {
      return '<div class="gift ' + (UI.giftSel === g.id ? "sel" : "") + '" data-gift="' + g.id + '"><div class="e">' + g.e + "</div><small>" + g.n + '</small><span class="p">🪙 ' + g.p + "</span></div>";
    }).join("");

    openSheet("<h3>🎁 إرسال هدية</h3><div class='gift-targets-bar'>" + targetsHtml + "</div><div class='giftgrid'>" + gridHtml + "</div><button class='btn block' id='send-gift' type='button'>إرسال</button>");
  }

  function openRoomPresenceSheet(room) {
    if (!room) return;
    var ids = getRoomParticipantIds(room);
    if (!ids.length) { toast("لا يوجد متواجدون حالياً"); return; }
    var rows = ids.map(function (id) {
      var u = resolveLiveUser(id);
      var isSeated = seatIndexOf(room, id) >= 0;
      return '<div class="row glass" data-profile="' + esc(id) + '">' + avatarHTML(u, "sm") +
        '<div class="info"><div class="name">' + esc(u.name) + '</div><div class="meta">' + (isSeated ? "على مقعد 🎙️" : "مستمع 🎧") + " • ID: " + esc(displayUserId(u)) + "</div></div></div>";
    }).join("");
    openSheet("<h3>🎧 المتواجدون في الغرفة (" + ids.length + ")</h3><div class='list'>" + rows + "</div>");
  }

  function openMusicSheet(room) {
    if (!room) return;
    openSheet("<h3>🎵 الموسيقى</h3>" + DEFAULT_TRACKS.map(function (t) {
      return '<div class="track-row" data-turl="' + esc(t.url) + '" data-ttitle="' + esc(t.title) + '">' +
        '<div style="font-size:20px">' + t.cover + '</div><div class="info"><div class="name">' + esc(t.title) + '</div><div class="meta">' + esc(t.artist) + '</div></div><button class="btn sm" type="button">▶ تشغيل</button></div>';
    }).join(""));
  }

  function bindEvents() {
    $("google-login-btn").onclick = signInWithGoogle;
    $("guest-login-btn").onclick = signInAsGuest;
    document.querySelectorAll(".gender-pill").forEach(function (pill) {
      pill.onclick = function () {
        UI.onboardGender = pill.getAttribute("data-gender");
        document.querySelectorAll(".gender-pill").forEach(function (p) { p.classList.toggle("active", p === pill); });
      };
    });
    $("ob-photo-input").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try { UI.onboardPhoto = await readImageFileAsDataUrl(f, 220, 0.65); renderOnboardPreview(); toast("تم اختيار الصورة ✅"); } catch (e) { toast(e.message); }
    };
    $("ob-name").oninput = renderOnboardPreview;
    $("ob-submit-btn").onclick = completeOnboarding;

    document.querySelectorAll(".navbtn").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-page")); }; });
    $("avatar-top").onclick = function () { go("profile"); };
    $("notif-btn").onclick = function () { toast("لا توجد إشعارات جديدة حالياً 🔔"); };
    $("theme-toggle-btn").onclick = function () { S.settings.lightTheme = !S.settings.lightTheme; applyThemeMode(); saveLocal(); renderTop(); };
    $("pf-settings-btn").onclick = openProfileSettingsSheet;
    $("pf-copy-id").onclick = function () {
      var idVal = displayUserId(S.me);
      if (navigator.clipboard) navigator.clipboard.writeText(idVal).catch(function () { /* */ });
      toast("تم نسخ ID: " + idVal);
    };
    $("fab-create").onclick = openCreateRoom;
    $("refresh-rooms").onclick = function () { renderHome(); toast("تم التحديث"); };

    $("search-input").oninput = function () { UI.query = this.value; renderHome(); };
    $("search-go-btn").onclick = function () { UI.query = $("search-input").value; renderHome(); };
    $("search-clear-btn").onclick = function () { $("search-input").value = ""; UI.query = ""; renderHome(); };

    $("find-input").oninput = function () { UI.findQ = this.value; renderFriends(); };
    document.querySelectorAll("#home-tabs .tab").forEach(function (t) { t.onclick = function () { UI.filter = t.getAttribute("data-filter"); renderHome(); }; });
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) { t.onclick = function () { UI.rfilter = t.getAttribute("data-rfilter"); renderRooms(); }; });
    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) { t.onclick = function () { UI.ftab = t.getAttribute("data-ftab"); renderFriends(); }; });

    $("sheet").addEventListener("click", function (e) {
      var gt = e.target.closest("[data-gtarget]");
      if (gt) {
        UI.giftTarget = gt.getAttribute("data-gtarget");
        $("sheet").querySelectorAll("[data-gtarget]").forEach(function (c) { c.classList.toggle("sel", c.getAttribute("data-gtarget") === UI.giftTarget); });
        return;
      }
      var g = e.target.closest("[data-gift]");
      if (g) {
        UI.giftSel = g.getAttribute("data-gift");
        $("sheet").querySelectorAll(".gift").forEach(function (x) { x.classList.toggle("sel", x.getAttribute("data-gift") === UI.giftSel); });
        return;
      }
      if (e.target.id === "send-gift") {
        var room = getRoom(UI.roomId);
        if (!room) return;
        var giftObj = GIFTS.filter(function (x) { return x.id === UI.giftSel; })[0];
        if (!giftObj) return;
        if (S.me.coins < giftObj.p) { toast("رصيد المحفظة غير كافٍ"); return; }
        var recU = resolveLiveUser(UI.giftTarget);
        S.me.coins -= giftObj.p;
        S.me.wealth = Number(S.me.wealth || 0) + giftObj.p;
        S.me.xp = Number(S.me.xp || 0) + Math.max(10, Math.floor(giftObj.p / 2));
        if (UI.giftTarget === S.me.id) S.me.charm = Number(S.me.charm || 0) + giftObj.p;
        else if (cloud.on && cloud.db) {
          cloud.db.ref("users/" + UI.giftTarget + "/charm").transaction(function (c) { return (Number(c) || 0) + giftObj.p; }).catch(function () { /* */ });
        }
        pushRoomMsg(room, { from: S.me.id, text: "أرسل " + giftObj.e + " " + giftObj.n + " إلى " + recU.name, giftAnim: { e: giftObj.e, fromName: S.me.name, toUid: UI.giftTarget, toName: recU.name } });
        save(); closeSheet(); renderAll();
        showFlyGiftToSeat(giftObj.e, S.me.name, UI.giftTarget, recU.name);
        toast("تم إرسال الهدية ✅");
        return;
      }
      var row = e.target.closest("[data-turl]");
      if (row) {
        var u = row.getAttribute("data-turl"), title = row.getAttribute("data-ttitle");
        if (!musicState.roomAudio) musicState.roomAudio = new Audio();
        musicState.roomAudio.src = u;
        musicState.roomAudio.muted = !!UI.roomSpeakerMuted;
        musicState.roomAudio.play().catch(function () { toast("اضغط مرة أخرى لتشغيل الصوت"); });
        musicState.currentTitle = title;
        $("music-mini").classList.remove("hidden");
        $("music-mini-title").textContent = "🎵 " + title;
        closeSheet();
        return;
      }
      var item = e.target.closest("[data-stk]");
      if (item) {
        var st = STICKERS.filter(function (x) { return x.id === item.getAttribute("data-stk"); })[0];
        if (!st) return;
        closeSheet(); sendRoomMsg(st.n, { sticker: st.e });
        return;
      }
      var b = e.target.closest("[data-em]");
      if (b) { $("chat-input").value += b.getAttribute("data-em"); closeSheet(); }
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest("#sheet")) return;
      var en = e.target.closest("[data-enter]"); if (en) { enterRoom(en.getAttribute("data-enter")); return; }
      var pr = e.target.closest("[data-profile]"); if (pr) { openUserProfile(pr.getAttribute("data-profile")); return; }
      var dm = e.target.closest("[data-dm]"); if (dm) { openDM(dm.getAttribute("data-dm")); return; }
      var af = e.target.closest("[data-addfriend]"); if (af) {
        var fid = af.getAttribute("data-addfriend");
        if (S.friends.indexOf(fid) < 0) S.friends.push(fid);
        save(); renderAll(); toast("تمت الإضافة كصديق ✅");
      }
      var ac = e.target.closest("[data-accept]"); if (ac) {
        var aid = ac.getAttribute("data-accept");
        S.requests = S.requests.filter(function (x) { return x !== aid; });
        if (S.friends.indexOf(aid) < 0) S.friends.push(aid);
        save(); renderAll(); toast("أصبحتما صديقين ✅");
      }
      var rj = e.target.closest("[data-reject]"); if (rj) {
        var rid = rj.getAttribute("data-reject");
        S.requests = S.requests.filter(function (x) { return x !== rid; });
        save(); renderAll();
      }
    });

    $("scrim").onclick = closeSheet;
    $("room-back").onclick = function () { leaveRoom(false); };
    $("room-rename-quick").onclick = function () { var r = getRoom(UI.roomId); if (r) openRenameRoomSheet(r); };
    $("room-presence-btn").onclick = function () { var r = getRoom(UI.roomId); if (r) openRoomPresenceSheet(r); };
    $("room-top-thumb").onclick = function () { $("room-photo-input").click(); };
    $("room-photo-input").onchange = async function () {
      var f = this.files && this.files[0]; var r = getRoom(UI.roomId);
      if (!f || !r) return;
      try {
        r.roomPhoto = await readImageFileAsDataUrl(f, 260, 0.72);
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + r.id + "/roomPhoto").set(r.roomPhoto).catch(function () { /* */ });
        saveLocal(); renderRoom(); renderHome(); renderRooms();
        toast("تم تحديث صورة الغرفة ✅");
      } catch (err) { toast(err.message); }
    };
    $("room-menu").onclick = function () {
      var r = getRoom(UI.roomId); if (!r) return;
      openSheet("<h3>خيارات الغرفة</h3><div class='actlist'>" +
        '<button id="rm-act-rename" type="button">✏️ تغيير اسم الغرفة</button>' +
        '<button id="rm-act-float" type="button">⬇️ تصغير لدائرة عائمة</button>' +
        '<button class="danger" id="rm-act-leave" type="button">🚪 مغادرة وإيقاف الصوت</button></div>');
      $("rm-act-rename").onclick = function () { closeSheet(); openRenameRoomSheet(r); };
      $("rm-act-float").onclick = function () {
        closeSheet(); offDb("room"); UI.floatingRoomId = r.id; UI.roomId = null;
        $("room-view").classList.remove("open"); renderFloatingOrb(); renderAll();
      };
      $("rm-act-leave").onclick = function () { leaveRoom(false); };
    };
    $("room-music").onclick = function () { var r = getRoom(UI.roomId); if (r) openMusicSheet(r); };
    $("mmini-open").onclick = function () { var r = getRoom(UI.roomId); if (r) openMusicSheet(r); };
    $("mmini-toggle").onclick = function () {
      if (!musicState.roomAudio) return;
      if (musicState.roomAudio.paused) musicState.roomAudio.play().catch(function () { /* */ });
      else musicState.roomAudio.pause();
    };
    $("mmini-skip").onclick = function () {
      if (musicState.roomAudio) { musicState.roomAudio.pause(); musicState.roomAudio.src = ""; musicState.roomAudio = null; }
      $("music-mini").classList.add("hidden");
    };
    $("room-speaker-btn").onclick = function () {
      UI.roomSpeakerMuted = !UI.roomSpeakerMuted;
      applyRoomSpeakerMuteState();
      if (!UI.roomSpeakerMuted) resumeAllRemoteAudioTracks();
    };
    $("audio-unlock-btn").onclick = function () {
      UI.roomSpeakerMuted = false; applyRoomSpeakerMuteState(); resumeAllRemoteAudioTracks(); showAudioUnlockBar(false);
    };
    $("mic-btn").onclick = function () {
      var r = getRoom(UI.roomId); if (!r) return;
      if (seatIndexOf(r, S.me.id) < 0) {
        var freeIdx = -1;
        for (var i = 0; i < r.seats.length; i++) if (!r.seats[i].uid && !r.seats[i].locked) { freeIdx = i; break; }
        if (freeIdx >= 0) seatClick(freeIdx);
        else toast("لا يوجد مقعد فارغ");
        return;
      }
      UI.micMuted = !UI.micMuted;
      renderRoom(); syncMicHardwareState();
    };
    $("room-gift").onclick = openGiftSheet;
    $("room-sticker").onclick = function () {
      openSheet("<h3>🎭 ملصقات</h3><div class='giftgrid'>" + STICKERS.map(function (st) {
        return '<div class="gift" data-stk="' + st.id + '"><div class="e">' + st.e + '</div><small>' + st.n + "</small></div>";
      }).join("") + "</div>");
    };
    $("room-photo").onclick = function () {
      openSheet('<h3>📷 إرسال صورة</h3><input id="rm-img-file" type="file" accept="image/*" />');
      $("rm-img-file").onchange = async function () {
        var f = this.files && this.files[0]; if (!f) return;
        try {
          var url = await readImageFileAsDataUrl(f, 380, 0.65);
          closeSheet(); sendRoomMsg("", { img: url });
        } catch (err) { toast(err.message); }
      };
    };
    $("room-send").onclick = function () { var i = $("room-input"); sendRoomMsg(i.value); i.value = ""; };
    $("room-input").onkeydown = function (e) { if (e.key === "Enter") { sendRoomMsg(this.value); this.value = ""; } };
    $("room-seats").onclick = function (e) { var st = e.target.closest("[data-seat]"); if (st) seatClick(Number(st.getAttribute("data-seat"))); };

    $("chat-back").onclick = closeDM;
    $("chat-send").onclick = function () { var i = $("chat-input"); sendDM(i.value); i.value = ""; };
    $("chat-input").onkeydown = function (e) { if (e.key === "Enter") { sendDM(this.value); this.value = ""; } };
    $("chat-voice").onclick = function () { toast("الرسائل الصوتية الخاصة قيد التطوير 🎙️"); };
    $("chat-menu").onclick = function () {
      if (!UI.dmId) return;
      openSheet("<h3>خيارات المحادثة</h3><div class='actlist'><button class='danger' id='dm-clear-btn' type='button'>🗑️ مسح المحادثة محلياً</button></div>");
      $("dm-clear-btn").onclick = function () {
        S.dms[UI.dmId] = [];
        saveLocal(); closeSheet(); renderDM(); renderMessages();
        toast("تم مسح المحادثة");
      };
    };
    $("chat-emoji").onclick = function () {
      openSheet("<h3>إيموجي</h3><div style='display:grid;grid-template-columns:repeat(6,1fr);gap:8px;font-size:24px;text-align:center'>" +
        EMOJIS.map(function (em) { return '<button type="button" data-em="' + em + '">' + em + "</button>"; }).join("") + "</div>");
    };

    var orb = $("floating-room-orb");
    if (orb) {
      orb.onclick = function () {
        var nextR = S.rooms.filter(function (x) { return x.id !== UI.floatingRoomId; })[0];
        if (!nextR) { toast("لا توجد غرفة أخرى متاحة"); return; }
        leaveRoom(true);
        enterRoom(nextR.id);
      };
    }

    window.addEventListener("beforeunload", function () {
      if (UI.roomId || UI.floatingRoomId) leaveRoom(true);
    });
  }

  async function boot() {
    loadLocal();
    initPwaInstall();
    bindEvents();
    renderAll();

    var logged = hasLocalSession();
    if (!logged) {
      showAuthGate(true, "login");
    } else if (!isOnboardDone()) {
      showAuthGate(true, "onboard");
    } else {
      UI.authReady = true;
      showAuthGate(false);
    }

    initCloud();
    await startCloudSync();
    await ensureSequentialSpecialId(S.me.id);

    if (hasLocalSession() && isOnboardDone()) {
      UI.authReady = true;
      showAuthGate(false);
      save();
      renderAll();
    } else if (hasLocalSession() && !isOnboardDone()) {
      showAuthGate(true, "onboard");
    }
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window);
