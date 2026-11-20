/* REAL VOICE — نسخة 3D احترافية + مستويات (1-100) + ثروة وجاذبية + لوحة متصدرين (100) + نظام User ID (0001000) */
(function (global) {
  "use strict";

  /* ========= 1. الإعدادات المركزية والقواعد المستقلة ========= */
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDyx4MBxvRM0L5FrrjVOfVePlKRSxGpMg4",
    authDomain: "real-voice-aec71.firebaseapp.com",
    databaseURL: "https://real-voice-aec71-default-rtdb.firebaseio.com",
    projectId: "real-voice-aec71",
    appId: "1:1051527775983:web:ae3794c162184fd56b7d1a"
  };

  var TOKEN_URL = "https://indexhtml-production-8a2533cd.up.railway.app/rtc-token";

  var CONFIG = {
    storageKey: "rv_state_v5",
    fixedUidKey: "rv_fixed_uid_v1",
    startCoins: 1000,
    maxLevel: 100,
    xpPerLevel: 100,
    initialSpecialIdNumber: 1000,
    badWords: ["شتيمة", "قذر", "حقير", "غبي", "كلب", "حمار"],
    economyRules: {
      defaultCharmMultiplier: 1,
      defaultWealthMultiplier: 1,
      defaultXpPerGift: 6,
      giftOverrides: {
        heart:   { charmPerCoin: 1,    wealthPerCoin: 1,    xpBonus: 4 },
        rose:    { charmPerCoin: 1,    wealthPerCoin: 1,    xpBonus: 6 },
        crown:   { charmPerCoin: 1.1,  wealthPerCoin: 1,    xpBonus: 15 },
        car:     { charmPerCoin: 1.15, wealthPerCoin: 1,    xpBonus: 25 },
        rocket:  { charmPerCoin: 1.2,  wealthPerCoin: 1.1,  xpBonus: 40 },
        diamond: { charmPerCoin: 1.25, wealthPerCoin: 1.1,  xpBonus: 60 },
        vip:     { charmPerCoin: 1.3,  wealthPerCoin: 1.2,  xpBonus: 100 },
        castle:  { charmPerCoin: 1.5,  wealthPerCoin: 1.25, xpBonus: 180 }
      }
    }
  };

  var CHARM_RANKS = [
    { min: 0,      name: "مبتدئ",       icon: "🌱" },
    { min: 100,    name: "محبوب",       icon: "🌸" },
    { min: 500,    name: "جذاب",        icon: "✨" },
    { min: 1500,   name: "نجم",         icon: "🌟" },
    { min: 4000,   name: "مشهور",       icon: "🎭" },
    { min: 10000,  name: "ساحر",        icon: "🔮" },
    { min: 25000,  name: "أسطوري",      icon: "🔥" },
    { min: 60000,  name: "ملك الجاذبية", icon: "👑" }
  ];

  var WEALTH_RANKS = [
    { min: 0,      name: "بداية الثروة", icon: "🪙" },
    { min: 250,    name: "مقتنٍ",        icon: "💰" },
    { min: 1000,   name: "ثرِي",         icon: "💵" },
    { min: 3500,   name: "أرستقراطي",   icon: "🏦" },
    { min: 12000,  name: "إمبراطور",     icon: "💎" },
    { min: 35000,  name: "أسطورة المال", icon: "👑" }
  ];

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

  var VIP_TIERS = [
    { level: 1, title: "VIP فضي", cost: 300, days: 30, perks: ["إطار VIP مميز", "أولوية في الغرف", "شارة VIP 1"] },
    { level: 2, title: "VIP ذهبي", cost: 700, days: 30, perks: ["هالة ذهبية 3D", "مزايا إضافية للملف", "شارة VIP 2"] },
    { level: 3, title: "VIP ماسي", cost: 1500, days: 30, perks: ["دخول ملكي مميز", "مقتنيات VIP حصرية", "شارة VIP 3"] }
  ];

  var DEFAULT_TRACKS = [
    { id: "t1", title: "Night Chill Beat", artist: "موسيقى هادئة", cover: "🎵", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "t2", title: "Acoustic Vibes", artist: "جيتار ليلي", cover: "🎸", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "t3", title: "Midnight Lounge", artist: "سهرة رايقة", cover: "🌙", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: "t4", title: "Energy Pulse", artist: "إيقاع حماسي", cover: "⚡", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
  ];

  var STICKERS = [
    { id: "s1", e: "🥳", n: "حفلة" }, { id: "s2", e: "🎤", n: "غناء" }, { id: "s3", e: "👑", n: "ملكي" },
    { id: "s4", e: "🔥", n: "نار" }, { id: "s5", e: "💖", n: "حب" }, { id: "s6", e: "😂", n: "ضحك" },
    { id: "s7", e: "🎮", n: "جيمر" }, { id: "s8", e: "☕", n: "قهوة" }, { id: "s9", e: "🌙", n: "سهرة" },
    { id: "s10", e: "👏", n: "تصفيق" }, { id: "s11", e: "💎", n: "ألماس" }, { id: "s12", e: "🚀", n: "انطلاق" }
  ];

  var ROOM_THEMES = [
    { id: "default", name: "بنفسجي ليلي 3D", bg: "linear-gradient(175deg, #170e2e, #090612 68%)", accent: "#ec4899" },
    { id: "ocean", name: "أزرق المحيط", bg: "linear-gradient(175deg, #082f49, #061322 70%)", accent: "#22d3ee" },
    { id: "rose", name: "وردي نيون", bg: "linear-gradient(175deg, #4a0d2e, #120610 70%)", accent: "#f472b6" },
    { id: "emerald", name: "زمردي VIP", bg: "linear-gradient(175deg, #064e3b, #051410 70%)", accent: "#34d399" }
  ];

  var TRUTH_OR_DARE = [
    "صراحة: ما أكثر شيء تحبه في غرف الدردشة الصوتية؟",
    "صراحة: ما آخر أغنية سمعتها اليوم؟",
    "تحدٍ: غنّي مقطعاً قصيراً لمدة 10 ثوانٍ على المايك!",
    "تحدٍ: صف يومك في 3 كلمات فقط في الشات!"
  ];

  var QUIZ_BANK = [
    { q: "ما هي عاصمة مصر؟", opts: ["الإسكندرية", "القاهرة", "الجيزة", "أسوان"], ans: 1 },
    { q: "كم عدد كواكب المجموعة الشمسية؟", opts: ["7", "8", "9", "10"], ans: 1 },
    { q: "ما هو أسرع حيوان بري؟", opts: ["الفهد", "الأسد", "الحصان", "الذئب"], ans: 0 },
    { q: "في أي قارة تقع البرازيل؟", opts: ["أوروبا", "أفريقيا", "أمريكا الجنوبية", "آسيا"], ans: 2 }
  ];

  /* ========= 2. أدوات مساعدة + نظام specialId (0001000+) ========= */
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
    if (str.length > 7) str = str.slice(-7);
    return str;
  }

  function normalizeSpecialId(val, fallbackNum) {
    if (typeof val === "string" && /^\d{7}$/.test(val.trim())) {
      return val.trim();
    }
    if (typeof val === "string" && /^\d+$/.test(val.trim())) {
      return formatSpecialId(Number(val.trim()));
    }
    if (typeof val === "number" && isFinite(val) && val >= 0) {
      return formatSpecialId(val);
    }
    if (typeof fallbackNum === "number" && isFinite(fallbackNum) && fallbackNum >= 0) {
      return formatSpecialId(fallbackNum);
    }
    return "0001000";
  }

  function displayUserId(u) {
    if (!u) return "0001000";
    return normalizeSpecialId(u.specialId, u.num);
  }

  function copyBtnHTML(val, label) {
    return '<button class="copy-id-btn" type="button" data-copyval="' + esc(val || "") + '" title="نسخ الرقم">' + esc(label || "📋 نسخ") + "</button>";
  }

  function copyText(txt, msg) {
    var val = String(txt || "");
    function fallback() {
      var ta = document.createElement("textarea");
      ta.value = val;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); toast(msg || "تم النسخ 📋"); } catch (e) { toast(val); }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(val).then(function () { toast(msg || "تم النسخ 📋"); }, fallback);
    } else {
      fallback();
    }
  }

  function getOrCreateFixedUid() {
    try {
      var saved = localStorage.getItem(CONFIG.fixedUidKey);
      if (saved && saved.trim()) return saved.trim();
      var fresh = "rv_" + Date.now().toString(36) + "_" + Math.random().toString(36).slice(2, 8);
      localStorage.setItem(CONFIG.fixedUidKey, fresh);
      return fresh;
    } catch (e) {
      return "rv_" + Math.random().toString(36).slice(2, 10);
    }
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
    var s = String(str || "rv");
    var h = 5381;
    for (var i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0;
    return (Math.abs(h) % 2147483646) + 1;
  }

  function dmThreadId(a, b) {
    return [String(a), String(b)].sort().join("__");
  }

  function readImageFileAsDataUrl(file, maxSize, quality) {
    maxSize = maxSize || 320;
    quality = quality || 0.72;
    return new Promise(function (resolve, reject) {
      if (!file || !file.type || file.type.indexOf("image/") !== 0) {
        reject(new Error("اختر ملف صورة صحيح"));
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var img = new Image();
        img.onload = function () {
          var w = img.width || maxSize;
          var h = img.height || maxSize;
          if (w > h) {
            if (w > maxSize) { h = Math.round((h * maxSize) / w); w = maxSize; }
          } else {
            if (h > maxSize) { w = Math.round((w * maxSize) / h); h = maxSize; }
          }
          var canvas = document.createElement("canvas");
          canvas.width = Math.max(1, w);
          canvas.height = Math.max(1, h);
          var ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          try {
            resolve(canvas.toDataURL("image/jpeg", quality));
          } catch (e) {
            resolve(String(reader.result || ""));
          }
        };
        img.onerror = function () { resolve(String(reader.result || "")); };
        img.src = String(reader.result || "");
      };
      reader.onerror = function () { reject(new Error("تعذر قراءة الصورة")); };
      reader.readAsDataURL(file);
    });
  }

  /* ========= 3. دوال المستويات (1 - 100) والثروة والجاذبية ========= */
  function computeLevelFromXp(xp) {
    var safeXp = Math.max(0, Number(xp || 0));
    var lv = Math.floor(safeXp / CONFIG.xpPerLevel) + 1;
    if (lv < 1) lv = 1;
    if (lv > CONFIG.maxLevel) lv = CONFIG.maxLevel;
    return lv;
  }

  function getLevelTierMeta(lv) {
    var n = Math.max(1, Math.min(CONFIG.maxLevel, Number(lv || 1)));
    if (n === 100) return { cls: "lvl-t100", label: "Lv.100 أسطوري", icon: "👑" };
    if (n >= 90) return { cls: "lvl-t9", label: "Lv." + n + " ملكي", icon: "💠" };
    if (n >= 80) return { cls: "lvl-t8", label: "Lv." + n + " ماسي", icon: "💎" };
    if (n >= 70) return { cls: "lvl-t7", label: "Lv." + n + " كريستال", icon: "🔮" };
    if (n >= 60) return { cls: "lvl-t6", label: "Lv." + n + " أحمر", icon: "🔥" };
    if (n >= 50) return { cls: "lvl-t5", label: "Lv." + n + " ذهبي ملكي", icon: "🏅" };
    if (n >= 40) return { cls: "lvl-t4", label: "Lv." + n + " بنفسجي", icon: "💜" };
    if (n >= 30) return { cls: "lvl-t3", label: "Lv." + n + " أزرق", icon: "🔷" };
    if (n >= 20) return { cls: "lvl-t2", label: "Lv." + n + " ذهبي", icon: "🥇" };
    if (n >= 10) return { cls: "lvl-t1", label: "Lv." + n + " فضي", icon: "🥈" };
    return { cls: "lvl-t1", label: "Lv." + n + " برونزي", icon: "🥉" };
  }

  function levelBadgeHTML(lv) {
    var meta = getLevelTierMeta(lv);
    return '<span class="lvl-badge ' + meta.cls + '">' + meta.icon + " " + esc(meta.label) + "</span>";
  }

  function getWealthRankMeta(wealth) {
    var val = Math.max(0, Number(wealth || 0));
    var current = WEALTH_RANKS[0];
    var next = null;
    for (var i = 0; i < WEALTH_RANKS.length; i++) {
      if (val >= WEALTH_RANKS[i].min) {
        current = WEALTH_RANKS[i];
        next = WEALTH_RANKS[i + 1] || null;
      }
    }
    var pct = 100;
    var progText = "الحد الأقصى (" + val + ")";
    if (next) {
      var span = Math.max(1, next.min - current.min);
      pct = Math.max(0, Math.min(100, ((val - current.min) / span) * 100));
      progText = val + " / " + next.min;
    }
    return { rank: current, next: next, pct: pct, progText: progText, value: val };
  }

  function wealthBadgeHTML(wealth) {
    var w = getWealthRankMeta(wealth);
    return '<span class="wealth-badge">' + w.rank.icon + " " + esc(w.rank.name) + " • " + w.value + "</span>";
  }

  function getCharmRankMeta(charm) {
    var val = Math.max(0, Number(charm || 0));
    var current = CHARM_RANKS[0];
    var next = null;
    for (var i = 0; i < CHARM_RANKS.length; i++) {
      if (val >= CHARM_RANKS[i].min) {
        current = CHARM_RANKS[i];
        next = CHARM_RANKS[i + 1] || null;
      }
    }
    var pct = 100;
    var progText = "الحد الأقصى (" + val + ")";
    if (next) {
      var span = Math.max(1, next.min - current.min);
      pct = Math.max(0, Math.min(100, ((val - current.min) / span) * 100));
      progText = val + " / " + next.min;
    }
    return { rank: current, next: next, pct: pct, progText: progText, value: val };
  }

  function charmBadgeHTML(charm) {
    var c = getCharmRankMeta(charm);
    return '<span class="charm-badge">' + c.rank.icon + " " + esc(c.rank.name) + " • " + c.value + "</span>";
  }

  function getGiftEconomyRule(gift) {
    var ov = (CONFIG.economyRules.giftOverrides && gift && CONFIG.economyRules.giftOverrides[gift.id]) || {};
    var price = Math.max(1, Number(gift && gift.p || 0));
    var charmPerCoin = typeof ov.charmPerCoin === "number" ? ov.charmPerCoin : CONFIG.economyRules.defaultCharmMultiplier;
    var wealthPerCoin = typeof ov.wealthPerCoin === "number" ? ov.wealthPerCoin : CONFIG.economyRules.defaultWealthMultiplier;
    var xpBonus = typeof ov.xpBonus === "number" ? ov.xpBonus : CONFIG.economyRules.defaultXpPerGift;
    return {
      charmGain: Math.max(1, Math.round(price * charmPerCoin)),
      wealthGain: Math.max(1, Math.round(price * wealthPerCoin)),
      xpGain: Math.max(1, xpBonus)
    };
  }

  /* ========= 4. إدارة المستمعين والمؤقتات ========= */
  var registry = {};
  function trackListener(scope, ref, ev, fn) {
    try {
      ref.on(ev, fn);
      (registry[scope] = registry[scope] || []).push({ ref: ref, ev: ev, fn: fn });
    } catch (e) { /* تجاهل */ }
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

  /* ========= 5. محرك الصوت (Agora RTC) + كتم صوت الغرفة + المشغل المبسط ========= */
  var voice = {
    client: null,
    localTrack: null,
    channel: null,
    role: null,
    uidNum: 0,
    joining: false,
    leaving: false,
    speakingNums: {},
    autoplayBlocked: false,
    boundSeatRef: null
  };

  var musicState = {
    data: null,
    queue: [],
    bufferTrack: null,
    roomAudio: null,
    roomXpEarned: 0,
    syncing: false
  };

  function setVoiceStatusUI(connected, label) {
    var dot = $("voice-status-dot");
    var txt = $("voice-status-text");
    if (dot) dot.classList.toggle("live", !!connected);
    if (txt) txt.textContent = label || (connected ? "الصوت المباشر متصل 🔊" : "جاري ربط الصوت...");
  }

  function showAudioUnlockBar(show) {
    voice.autoplayBlocked = !!show;
    var bar = $("audio-unlock-bar");
    if (bar) bar.classList.toggle("hidden", !show);
  }

  function applyRoomSpeakerMuteState() {
    var muted = !!UI.roomSpeakerMuted;
    if (voice.client && Array.isArray(voice.client.remoteUsers)) {
      voice.client.remoteUsers.forEach(function (u) {
        if (u && u.audioTrack) {
          try {
            u.audioTrack.setVolume(muted ? 0 : 100);
          } catch (e) { /* */ }
        }
      });
    }
    if (musicState.roomAudio) {
      try { musicState.roomAudio.muted = muted; } catch (e) { /* */ }
    }
    var spkBtn = $("room-speaker-btn");
    if (spkBtn) {
      spkBtn.classList.toggle("spk-muted", muted);
      spkBtn.classList.toggle("spk-on", !muted);
      spkBtn.textContent = muted ? "🔇" : "🔊";
      spkBtn.title = muted ? "فك كتم صوت الغرفة" : "كتم صوت الغرفة";
    }
  }

  async function subscribeAndPlayRemoteUser(user, mediaType) {
    if (!voice.client || !user) return;
    try {
      await voice.client.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.setVolume(UI.roomSpeakerMuted ? 0 : 100);
        try {
          user.audioTrack.play();
          showAudioUnlockBar(false);
        } catch (playErr) {
          showAudioUnlockBar(true);
        }
      }
    } catch (e) { /* */ }
  }

  function resumeAllRemoteAudioTracks() {
    if (!voice.client || !Array.isArray(voice.client.remoteUsers)) return;
    var anyPlayed = false;
    voice.client.remoteUsers.forEach(function (u) {
      if (u && u.hasAudio) {
        if (u.audioTrack) {
          try {
            u.audioTrack.setVolume(UI.roomSpeakerMuted ? 0 : 100);
            u.audioTrack.play();
            anyPlayed = true;
          } catch (e) { /* */ }
        } else {
          subscribeAndPlayRemoteUser(u, "audio");
        }
      }
    });
    if (anyPlayed) showAudioUnlockBar(false);
  }

  function setupAgoraClient() {
    if (voice.client || !global.AgoraRTC) return;
    try {
      AgoraRTC.onAutoplayFailed = function () {
        showAudioUnlockBar(true);
      };

      voice.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      voice.client.enableAudioVolumeIndicator();

      voice.client.on("user-published", async function (user, mediaType) {
        await subscribeAndPlayRemoteUser(user, mediaType);
      });

      voice.client.on("user-unpublished", function (user) {
        if (user && user.audioTrack) {
          try { user.audioTrack.stop(); } catch (e) { /* */ }
        }
        if (user) delete voice.speakingNums[user.uid];
        updateSpeakingIndicators();
        applyMusicDucking();
      });

      voice.client.on("user-left", function (user) {
        if (user) delete voice.speakingNums[user.uid];
        updateSpeakingIndicators();
        applyMusicDucking();
      });

      voice.client.on("volume-indicator", function (volumes) {
        var active = {};
        (volumes || []).forEach(function (v) {
          if (v.level > 6) {
            var key = v.uid === 0 ? voice.uidNum : v.uid;
            active[key] = true;
          }
        });
        voice.speakingNums = active;
        updateSpeakingIndicators();
        applyMusicDucking();
      });

      voice.client.on("connection-state-change", function (curState) {
        if (curState === "CONNECTED") {
          setVoiceStatusUI(true, "الصوت المباشر متصل 🔊");
        } else if (curState === "RECONNECTING") {
          setVoiceStatusUI(false, "إعادة الاتصال بالصوت...");
        } else if (curState === "DISCONNECTED") {
          setVoiceStatusUI(false, "غير متصل بالصوت");
        }
      });
    } catch (e) { /* */ }
  }

  async function fetchRtcToken(channelName, uidNum, roleName) {
    var url = new URL(TOKEN_URL);
    url.searchParams.set("channelName", channelName);
    url.searchParams.set("uid", String(uidNum));
    url.searchParams.set("role", roleName);

    var ctrl = typeof AbortController !== "undefined" ? new AbortController() : null;
    var tid = ctrl ? setTimeout(function () { ctrl.abort(); }, 6000) : null;
    try {
      var res = await fetch(url.toString(), { method: "GET", signal: ctrl ? ctrl.signal : undefined });
      var data = await res.json();
      if (!res.ok || !data.token || !data.appId) {
        throw new Error(data.error || "فشل جلب التوكن");
      }
      return data;
    } finally {
      if (tid) clearTimeout(tid);
    }
  }

  async function stopLocalMic() {
    if (voice.localTrack) {
      try {
        if (voice.client && voice.client.connectionState === "CONNECTED") {
          await voice.client.unpublish([voice.localTrack]);
        }
      } catch (e) { /* */ }
      try {
        voice.localTrack.stop();
        voice.localTrack.close();
      } catch (e) { /* */ }
      voice.localTrack = null;
    }
  }

  async function stopBufferTrackOnly() {
    if (musicState.bufferTrack) {
      try { musicState.bufferTrack.stopProcessAudioBuffer(); } catch (e0) { /* */ }
      try {
        if (voice.client && voice.client.connectionState === "CONNECTED") {
          await voice.client.unpublish([musicState.bufferTrack]);
        }
      } catch (e1) { /* */ }
      try {
        musicState.bufferTrack.stop();
        musicState.bufferTrack.close();
      } catch (e2) { /* */ }
      musicState.bufferTrack = null;
    }
  }

  async function stopMusicBroadcast() {
    await stopBufferTrackOnly();
    if (musicState.roomAudio) {
      try {
        musicState.roomAudio.pause();
        musicState.roomAudio.removeAttribute("src");
        musicState.roomAudio.load();
      } catch (e3) { /* */ }
      musicState.roomAudio = null;
    }
  }

  function applyMusicDucking() {
    var m = musicState.data;
    if (!m) return;
    var baseVol = typeof m.volume === "number" ? m.volume : 0.7;
    var someoneSpeaking = Object.keys(voice.speakingNums || {}).length > 0;
    var targetVol = someoneSpeaking ? Math.max(0.14, baseVol * 0.25) : baseVol;

    if (musicState.bufferTrack && typeof musicState.bufferTrack.setVolume === "function") {
      try { musicState.bufferTrack.setVolume(Math.round(targetVol * 100)); } catch (e) { /* */ }
    }
    if (musicState.roomAudio) {
      try {
        musicState.roomAudio.muted = !!UI.roomSpeakerMuted;
        musicState.roomAudio.volume = Math.min(1, Math.max(0, targetVol));
      } catch (e) { /* */ }
    }
  }

  async function syncRoomMusicForEveryone(m) {
    if (musicState.syncing) return;
    musicState.syncing = true;
    try {
      var activeRoomId = UI.roomId || UI.floatingRoomId;
      if (!activeRoomId || !m || !m.url) {
        await stopMusicBroadcast();
        return;
      }

      var isDj = m.djUid === S.me.id;
      var publishedViaAgora = false;

      if (isDj && !m.paused && m.url.indexOf("blob:") !== 0) {
        if (voice.role !== "publisher") {
          await joinVoiceChannel(activeRoomId, "publisher");
        }
        if (global.AgoraRTC && typeof AgoraRTC.createBufferSourceAudioTrack === "function" && voice.client && voice.client.connectionState === "CONNECTED") {
          try {
            await stopBufferTrackOnly();
            var bTrack = await AgoraRTC.createBufferSourceAudioTrack({ source: m.url });
            musicState.bufferTrack = bTrack;
            applyMusicDucking();
            await voice.client.publish([bTrack]);
            bTrack.startProcessAudioBuffer();
            publishedViaAgora = true;
          } catch (err) {
            publishedViaAgora = false;
          }
        }
      } else {
        await stopBufferTrackOnly();
      }

      try {
        if (!musicState.roomAudio) {
          musicState.roomAudio = new Audio();
          musicState.roomAudio.preload = "auto";
        }
        var audio = musicState.roomAudio;
        audio.muted = !!UI.roomSpeakerMuted;
        if (isDj && publishedViaAgora) {
          audio.pause();
          return;
        }
        if (audio.src !== m.url) {
          audio.src = m.url;
        }
        applyMusicDucking();

        if (m.paused) {
          audio.pause();
          return;
        }

        var started = typeof m.startedAt === "number" ? m.startedAt : Date.now();
        var expectedSec = Math.max(0, (Date.now() - started) / 1000);
        var applySeekAndPlay = function () {
          if (audio.duration && isFinite(audio.duration) && audio.duration > 0) {
            expectedSec = expectedSec % audio.duration;
          }
          if (Math.abs((audio.currentTime || 0) - expectedSec) > 1.5) {
            try { audio.currentTime = expectedSec; } catch (eSeek) { /* */ }
          }
          audio.play().catch(function () { /* */ });
        };

        if (audio.readyState >= 1) {
          applySeekAndPlay();
        } else {
          audio.onloadedmetadata = applySeekAndPlay;
        }
      } catch (eAudio) { /* */ }
    } finally {
      musicState.syncing = false;
    }
  }

  function renderMusicMini() {
    var mini = $("music-mini");
    if (!mini) return;
    var m = musicState.data;
    if (!m || !m.url) {
      mini.classList.add("hidden");
      return;
    }
    mini.classList.remove("hidden");
    var statusIcon = m.paused ? "⏸️" : "🎵";
    $("music-mini-title").textContent = statusIcon + " " + (m.title || "أغنية");
  }

  async function startTrackNow(room, trackObj) {
    if (!room) return;
    var payload = {
      djUid: S.me.id,
      trackId: trackObj.id || uid(),
      url: trackObj.url,
      title: clean(trackObj.title || "أغنية"),
      artist: clean(trackObj.artist || S.me.name),
      cover: trackObj.cover || "🎵",
      startedAt: Date.now(),
      paused: false,
      volume: 0.7,
      duck: true
    };
    musicState.data = Object.assign({}, payload);
    renderMusicMini();
    await syncRoomMusicForEveryone(musicState.data);
    if (cloud.on && cloud.db && payload.url.indexOf("blob:") !== 0) {
      cloud.db.ref("rooms/" + room.id + "/music").set(Object.assign({}, payload, { startedAt: serverTs() })).catch(function () { /* */ });
    }
    toast("🎵 تم تشغيل: " + payload.title);
  }

  async function togglePlayPauseMusic(room) {
    if (!room || !musicState.data || !musicState.data.url) return;
    var nextPaused = !musicState.data.paused;
    var upd = {
      paused: nextPaused,
      startedAt: nextPaused ? musicState.data.startedAt : Date.now()
    };
    musicState.data = Object.assign({}, musicState.data, upd);
    renderMusicMini();
    await syncRoomMusicForEveryone(musicState.data);
    if (cloud.on && cloud.db && musicState.data.url.indexOf("blob:") !== 0) {
      cloud.db.ref("rooms/" + room.id + "/music").update(Object.assign({}, upd, {
        startedAt: nextPaused ? musicState.data.startedAt : serverTs()
      })).catch(function () { /* */ });
    }
  }

  async function skipMusicTrack(room) {
    if (!room) return;
    var curId = musicState.data && musicState.data.trackId;
    var idx = -1;
    for (var i = 0; i < DEFAULT_TRACKS.length; i++) {
      if (DEFAULT_TRACKS[i].id === curId) { idx = i; break; }
    }
    var next = DEFAULT_TRACKS[(idx + 1) % DEFAULT_TRACKS.length];
    await startTrackNow(room, next);
  }

  async function stopMusicCompletely(room) {
    musicState.data = null;
    await stopMusicBroadcast();
    renderMusicMini();
    if (room && cloud.on && cloud.db) {
      cloud.db.ref("rooms/" + room.id + "/music").remove().catch(function () { /* */ });
    }
    toast("⏹️ تم إيقاف الموسيقى");
  }

  function openMusicSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var curId = musicState.data && musicState.data.trackId;

    var tracksHtml = DEFAULT_TRACKS.map(function (t) {
      var isPlaying = curId === t.id && musicState.data && !musicState.data.paused;
      return '<div class="track-row ' + (isPlaying ? "playing" : "") + '" data-playtrack="' + t.id + '">' +
        '<div style="font-size:22px">' + t.cover + "</div>" +
        '<div class="info"><div class="name">' + esc(t.title) + '</div><div class="meta">' + esc(t.artist) + "</div></div>" +
        '<button class="btn sm" type="button">' + (isPlaying ? "يعمل 🔊" : "▶ تشغيل") + "</button></div>";
    }).join("");

    var html = "<h3>🎵 تشغيل الموسيقى</h3>" +
      '<div class="small" style="margin-bottom:8px">اضغط على أي أغنية لتشغيلها فوراً في الغرفة:</div>' +
      tracksHtml +
      '<div style="display:flex;gap:8px;margin-top:10px">' +
      '<label class="btn ghost" style="flex:1;text-align:center;margin:0;cursor:pointer">📁 اختر من جهازك<input id="ms-file" type="file" accept="audio/*" class="hidden" /></label>' +
      (musicState.data ? '<button class="btn red" id="ms-stop" type="button">⏹ إيقاف</button>' : "") +
      "</div>";

    openSheet(html);

    $("sheet").querySelectorAll("[data-playtrack]").forEach(function (row) {
      row.onclick = async function () {
        var tid = row.getAttribute("data-playtrack");
        var found = DEFAULT_TRACKS.filter(function (x) { return x.id === tid; })[0];
        if (found) {
          closeSheet();
          await startTrackNow(room, found);
        }
      };
    });

    $("ms-file").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var blobUrl = URL.createObjectURL(f);
      var cleanTitle = f.name.replace(/\.[^/.]+$/, "");
      closeSheet();
      await startTrackNow(room, { id: uid(), url: blobUrl, title: cleanTitle, artist: "من جهازي", cover: "🎧" });
    };

    if ($("ms-stop")) {
      $("ms-stop").onclick = async function () {
        closeSheet();
        await stopMusicCompletely(room);
      };
    }
  }

  function clearSeatDisconnectBinding() {
    if (voice.boundSeatRef) {
      try { voice.boundSeatRef.onDisconnect().cancel(); } catch (e) { /* */ }
      voice.boundSeatRef = null;
    }
  }

  function bindSeatDisconnect(roomId, seatIdx) {
    clearSeatDisconnectBinding();
    if (!cloud.on || !cloud.db) return;
    try {
      var ref = cloud.db.ref("rooms/" + roomId + "/seats/" + seatIdx + "/uid");
      ref.onDisconnect().set(null);
      voice.boundSeatRef = ref;
    } catch (e) { /* */ }
  }

  async function joinVoiceChannel(channelName, desiredRole) {
    if (!global.AgoraRTC) {
      setVoiceStatusUI(false, "مكتبة الصوت غير متاحة");
      return false;
    }
    if (voice.joining || voice.leaving) return false;

    setupAgoraClient();
    if (!voice.client) return false;
    voice.joining = true;
    setVoiceStatusUI(false, "جاري الاتصال بالصوت...");

    try {
      var targetUid = S.me.num || hashNum(S.me.id);
      voice.uidNum = targetUid;

      if (voice.client.connectionState === "CONNECTED" && voice.channel === channelName) {
        if (desiredRole === "publisher" && !voice.localTrack) {
          await publishLocalMic();
        } else if (desiredRole === "subscriber" && voice.localTrack) {
          await stopLocalMic();
        }
        voice.role = desiredRole;
        resumeAllRemoteAudioTracks();
        setVoiceStatusUI(true, "الصوت المباشر متصل 🔊");
        return true;
      }

      if (voice.client.connectionState !== "DISCONNECTED") {
        await leaveVoiceChannel();
      }

      var tokenData = await fetchRtcToken(channelName, targetUid, "publisher");
      var joinUid = (tokenData.uid !== undefined && tokenData.uid !== null) ? tokenData.uid : targetUid;
      await voice.client.join(tokenData.appId, channelName, tokenData.token, joinUid);

      voice.channel = channelName;
      voice.role = desiredRole;

      if (Array.isArray(voice.client.remoteUsers)) {
        for (var i = 0; i < voice.client.remoteUsers.length; i++) {
          var ru = voice.client.remoteUsers[i];
          if (ru && ru.hasAudio) {
            await subscribeAndPlayRemoteUser(ru, "audio");
          }
        }
      }

      if (desiredRole === "publisher") {
        await publishLocalMic();
      }

      setVoiceStatusUI(true, "الصوت المباشر متصل 🔊");
      return true;
    } catch (err) {
      setVoiceStatusUI(false, "تعذر ربط الصوت — تأكد من الشبكة");
      return false;
    } finally {
      voice.joining = false;
    }
  }

  async function publishLocalMic() {
    if (!voice.client || voice.client.connectionState !== "CONNECTED") return false;
    try {
      if (!voice.localTrack) {
        voice.localTrack = await AgoraRTC.createMicrophoneAudioTrack({
          AEC: true,
          ANS: true,
          AGC: true
        });
      }
      var activeRoomId = UI.roomId || UI.floatingRoomId;
      var room = getRoom(activeRoomId);
      var mySeatIdx = room ? seatIndexOf(room, S.me.id) : -1;
      var adminMuted = mySeatIdx >= 0 && room.seats[mySeatIdx].muted;
      var effectiveMuted = UI.micMuted || adminMuted;

      await voice.localTrack.setEnabled(!effectiveMuted);
      await voice.client.publish([voice.localTrack]);
      resumeAllRemoteAudioTracks();
      return true;
    } catch (err) {
      toast("اسمح للمتصفح بالوصول للميكروفون ليسمعك الجميع 🎤");
      return false;
    }
  }

  async function syncMicHardwareState() {
    var activeRoomId = UI.roomId || UI.floatingRoomId;
    var room = getRoom(activeRoomId);
    if (!room) return;
    var mySeatIdx = seatIndexOf(room, S.me.id);
    if (mySeatIdx < 0) {
      clearSeatDisconnectBinding();
      await stopLocalMic();
      return;
    }
    var adminMuted = !!room.seats[mySeatIdx].muted;
    var effectiveMuted = UI.micMuted || adminMuted;
    if (!voice.localTrack && !effectiveMuted) {
      await publishLocalMic();
      return;
    }
    if (voice.localTrack) {
      try {
        await voice.localTrack.setEnabled(!effectiveMuted);
      } catch (e) { /* */ }
    }
  }

  async function leaveVoiceChannel() {
    if (voice.leaving) return;
    voice.leaving = true;
    clearSeatDisconnectBinding();
    showAudioUnlockBar(false);
    try {
      await stopMusicBroadcast();
      await stopLocalMic();
      if (voice.client && voice.client.connectionState !== "DISCONNECTED") {
        await voice.client.leave();
      }
    } catch (e) { /* */ } finally {
      voice.channel = null;
      voice.role = null;
      voice.speakingNums = {};
      voice.leaving = false;
      setVoiceStatusUI(false, "غير متصل");
    }
  }

  function updateSpeakingIndicators() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var seatEls = document.querySelectorAll("#room-seats .seat");
    room.seats.forEach(function (s, idx) {
      var el = seatEls[idx];
      if (!el) return;
      if (!s.uid) {
        el.classList.remove("speak");
        return;
      }
      var u = getUser(s.uid);
      var uNum = u.num || hashNum(s.uid);
      var isMuted = s.muted || (s.uid === S.me.id && UI.micMuted);
      var isSpeaking = !isMuted && !!voice.speakingNums[uNum];
      el.classList.toggle("speak", isSpeaking);

      if (UI.activeSeatProfileUid === s.uid && UI.activeSeatProfileIdx === idx) {
        var spBadge = $("sp-live-speak-pill");
        if (spBadge) {
          spBadge.className = "seat-pill " + (isMuted ? "muted" : (isSpeaking ? "live" : ""));
          spBadge.textContent = isMuted ? "🔇 مكتوم" : (isSpeaking ? "🎙️ يتحدث الآن" : "🎤 صامت");
        }
      }
    });
  }

  /* ========= 6. الحالة والبيانات + نظام الترقيم المتسلسل (0001000+) ========= */
  var cloud = { on: false, db: null, auth: null, fbUser: null, usersMap: {}, roomsMap: {}, roomMsgs: {}, seenFly: {}, seenReact: {}, seenJoin: {} };
  var S = null;
  var UI = {
    page: "home", filter: "all", rfilter: "mine", ftab: "friends", pftab: "overview",
    leaderTab: "wealth",
    query: "", findQ: "",
    roomId: null, floatingRoomId: null, dmId: null, micMuted: false, roomSpeakerMuted: false,
    giftSel: "heart", giftTarget: "room",
    giftSending: false,
    processedGiftIds: {},
    theme: null, quiz: null,
    celebratedProfiles: {},
    activeSeatProfileUid: null,
    activeSeatProfileIdx: -1,
    idAssigning: false
  };

  function configReady() {
    return FIREBASE_CONFIG.apiKey &&
      FIREBASE_CONFIG.apiKey.indexOf("YOUR_") !== 0 &&
      FIREBASE_CONFIG.databaseURL &&
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
      cloud.on = false;
    }
    return cloud.on;
  }

  function demoUsers() {
    return [
      { id: "RV-1001", num: 1001, specialId: "0001001", name: "ليلى", photo: "", cover: "", online: true, bio: "أحب الموسيقى 🎵", vip: 2, vipExp: Date.now() + 20 * 86400000, verified: true, country: "🇪🇬 مصر", roomsJoined: 14, roomSeconds: 4200, level: 12, xp: 1140, wealth: 1850, charm: 2400, followers: 120, following: 45, friendsCount: 18, gifts: 32, receivedGifts: [], wealthLog: [], charmLog: [] },
      { id: "RV-1002", num: 1002, specialId: "0001002", name: "أحمد", photo: "", cover: "", online: true, bio: "لاعب محترف 🎮", vip: 0, verified: false, country: "🇸🇦 السعودية", roomsJoined: 8, roomSeconds: 1900, level: 5, xp: 420, wealth: 620, charm: 310, followers: 40, following: 22, friendsCount: 9, gifts: 11, receivedGifts: [], wealthLog: [], charmLog: [] },
      { id: "RV-1003", num: 1003, specialId: "0001003", name: "سارة", photo: "", cover: "", online: false, bio: "هنا للدردشة ☕", vip: 1, vipExp: Date.now() + 12 * 86400000, verified: true, country: "🇦🇪 الإمارات", roomsJoined: 11, roomSeconds: 3100, level: 8, xp: 750, wealth: 1200, charm: 1650, followers: 85, following: 30, friendsCount: 14, gifts: 21, receivedGifts: [], wealthLog: [], charmLog: [] },
      { id: "RV-1004", num: 1004, specialId: "0001004", name: "خالد", photo: "", cover: "", online: true, bio: "صاحب غرف VIP 👑", vip: 3, vipExp: Date.now() + 28 * 86400000, verified: true, country: "🇰🇼 الكويت", roomsJoined: 25, roomSeconds: 9500, level: 24, xp: 2350, wealth: 14500, charm: 11200, followers: 340, following: 60, friendsCount: 42, gifts: 95, receivedGifts: [], wealthLog: [], charmLog: [] },
      { id: "RV-1005", num: 1005, specialId: "0001005", name: "مريم", photo: "", cover: "", online: false, bio: "مرحباً بالجميع", vip: 0, verified: false, country: "🇯🇴 الأردن", roomsJoined: 4, roomSeconds: 900, level: 3, xp: 230, wealth: 180, charm: 90, followers: 15, following: 12, friendsCount: 5, gifts: 4, receivedGifts: [], wealthLog: [], charmLog: [] },
      { id: "RV-1006", num: 1006, specialId: "0001006", name: "يوسف", photo: "", cover: "", online: true, bio: "تحدي الأسئلة 🧠", vip: 2, vipExp: Date.now() + 18 * 86400000, verified: true, country: "🇲🇦 المغرب", roomsJoined: 19, roomSeconds: 6100, level: 15, xp: 1420, wealth: 4300, charm: 5800, followers: 190, following: 51, friendsCount: 27, gifts: 48, receivedGifts: [], wealthLog: [], charmLog: [] }
    ];
  }

  function makeSeats(n, occ) {
    var seats = [];
    for (var i = 0; i < n; i++) {
      seats.push({ uid: occ && occ[i] ? occ[i] : null, locked: false, muted: false, vip: i === 0 });
    }
    return seats;
  }

  function demoRooms() {
    var t = now();
    return [
      { id: "r1", name: "سهرة الأصدقاء", desc: "دردشة مفتوحة للجميع", cat: "friends", owner: "RV-1001", mods: [], seats: makeSeats(9, []), listeners: [], bans: [], priv: false, locked: false, pinned: "", created: t - 7200000, msgs: [], color: 0, icon: 0, roomPhoto: "", recvTop: {}, theme: ROOM_THEMES[0] },
      { id: "r2", name: "تحدي الأسئلة", desc: "مسابقات وجوائز", cat: "games", owner: "RV-1006", mods: [], seats: makeSeats(6, []), listeners: [], bans: [], priv: false, locked: false, pinned: "مسابقة اليوم الساعة 9 مساءً", created: t - 3600000, msgs: [], color: 1, icon: 1, roomPhoto: "", recvTop: {}, theme: ROOM_THEMES[1] },
      { id: "r3", name: "قصر الملوك", desc: "غرفة VIP حصرية", cat: "vip", owner: "RV-1004", mods: [], seats: makeSeats(12, []), listeners: [], bans: [], priv: false, locked: false, pinned: "", created: t - 86400000, msgs: [], color: 3, icon: 3, roomPhoto: "", recvTop: {}, theme: ROOM_THEMES[3] },
      { id: "r4", name: "ليالي الطرب", desc: "أغاني وموسيقى", cat: "music", owner: "RV-1003", mods: [], seats: makeSeats(4, []), listeners: [], bans: [], priv: false, locked: false, pinned: "", created: t - 600000, msgs: [], color: 2, icon: 2, roomPhoto: "", recvTop: {}, theme: ROOM_THEMES[2] }
    ];
  }

  function freshState() {
    var fixedId = getOrCreateFixedUid();
    var num = hashNum(fixedId);
    return {
      me: {
        id: fixedId, num: num, specialId: "",
        name: "مستخدم جديد", photo: "", cover: "",
        bio: "مرحباً! أنا جديد في REAL VOICE 👋", coins: CONFIG.startCoins,
        xp: 0, level: 1, wealth: 0, charm: 0,
        vip: 0, vipExp: 0,
        verified: false, followers: 0, following: 0, friendsCount: 0, visits: 0, joined: now(),
        country: "🇪🇬 مصر", gifts: 0, sent: 0, msgCount: 0,
        roomsJoined: 0, roomSeconds: 0,
        receivedGifts: [], wealthLog: [], charmLog: [],
        ach: {}, daily: 0, invites: 0,
        tasks: { dayKey: new Date().toDateString(), msg: false, friend: false, mic: false, room: false }
      },
      users: demoUsers(),
      rooms: demoRooms(),
      friends: [], requests: [], sentReq: [], blocked: [], follows: [],
      dms: {}, unread: {}, notifs: [], txs: [], giftsLog: [],
      settings: { notif: true, sound: true, lightTheme: false }
    };
  }

  function applyThemeMode() {
    var isLight = !!(S && S.settings && S.settings.lightTheme);
    document.body.classList.toggle("light-theme", isLight);
  }

  function ensureDailyTasks() {
    var today = new Date().toDateString();
    if (!S.me.tasks || S.me.tasks.dayKey !== today) {
      S.me.tasks = { dayKey: today, msg: false, friend: false, mic: false, room: false };
    }
  }

  function completeTask(key, rewardCoins) {
    ensureDailyTasks();
    if (!S.me.tasks[key]) {
      S.me.tasks[key] = true;
      S.me.coins += (rewardCoins || 25);
      addXP(10);
      toast("مهمة مكتملة! +" + (rewardCoins || 25) + " عملة 🪙");
      save();
    }
  }

  function loadLocal() {
    var fixedId = getOrCreateFixedUid();
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && parsed.me && Array.isArray(parsed.rooms)) {
          S = parsed;
          S.me.id = fixedId;
          if (!S.me.num) S.me.num = hashNum(fixedId);
          if (S.me.specialId && /^\d{7}$/.test(String(S.me.specialId))) {
            S.me.specialId = String(S.me.specialId);
          } else {
            S.me.specialId = "";
          }
          if (S.me.photo == null) S.me.photo = "";
          if (S.me.cover == null) S.me.cover = "";
          if (S.me.roomsJoined == null) S.me.roomsJoined = S.me.visits || 0;
          if (S.me.roomSeconds == null) S.me.roomSeconds = 0;
          if (S.me.wealth == null) S.me.wealth = 0;
          if (S.me.charm == null) S.me.charm = 0;
          if (S.me.xp == null) S.me.xp = 0;
          S.me.level = computeLevelFromXp(S.me.xp);
          if (!Array.isArray(S.me.receivedGifts)) S.me.receivedGifts = [];
          if (!Array.isArray(S.me.wealthLog)) S.me.wealthLog = [];
          if (!Array.isArray(S.me.charmLog)) S.me.charmLog = [];
          if (!S.me.country) S.me.country = "🇪🇬 مصر";
          if (!S.unread) S.unread = {};
          if (!S.dms) S.dms = {};
          if (!S.users) S.users = demoUsers();
          if (!S.friends) S.friends = [];
          if (!S.requests) S.requests = [];
          if (!S.sentReq) S.sentReq = [];
          if (!S.blocked) S.blocked = [];
          if (!S.follows) S.follows = [];
          if (!S.notifs) S.notifs = [];
          if (!S.txs) S.txs = [];
          if (!S.giftsLog) S.giftsLog = [];
          if (!S.settings) S.settings = { notif: true, sound: true, lightTheme: false };
          ensureDailyTasks();
          applyThemeMode();
          return;
        }
      }
    } catch (e) { /* */ }
    S = freshState();
    addNotif("🎉", "أهلاً بك في REAL VOICE! حصلت على " + CONFIG.startCoins + " عملة هدية.");
    applyThemeMode();
    saveLocal();
  }

  function saveLocal() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(S)); } catch (e) { /* */ }
  }

  async function ensureSequentialSpecialId(userId, username) {
    if (!userId) return "0001000";
    if (S && S.me && S.me.id === userId && /^\d{7}$/.test(String(S.me.specialId || ""))) {
      return String(S.me.specialId);
    }
    if (!cloud.on || !cloud.db) {
      var localFallback = formatSpecialId(CONFIG.initialSpecialIdNumber);
      if (S && S.me && S.me.id === userId) S.me.specialId = localFallback;
      return localFallback;
    }

    if (UI.idAssigning) {
      return S.me.specialId || "0001000";
    }
    UI.idAssigning = true;

    try {
      var userSpecRef = cloud.db.ref("users/" + userId + "/specialId");
      var existingSnap = await userSpecRef.once("value");
      var existingVal = existingSnap.val();
      if (typeof existingVal === "string" && /^\d{7}$/.test(existingVal.trim())) {
        var validId = existingVal.trim();
        if (S && S.me && S.me.id === userId) S.me.specialId = validId;
        return validId;
      }

      var counterRef = cloud.db.ref("system/userIdCounter/lastAssignedId");
      var assignedId = null;

      await counterRef.transaction(function (curr) {
        if (curr === null || typeof curr !== "number" || !isFinite(curr) || curr < CONFIG.initialSpecialIdNumber) {
          assignedId = formatSpecialId(CONFIG.initialSpecialIdNumber);
          return CONFIG.initialSpecialIdNumber;
        }
        var nextNum = Math.floor(curr) + 1;
        if (nextNum > 9999999) {
          return;
        }
        assignedId = formatSpecialId(nextNum);
        return nextNum;
      });

      if (!assignedId) {
        return S.me.specialId || "0001000";
      }

      var indexRef = cloud.db.ref("specialIdIndex/" + assignedId);
      var idxTx = await indexRef.transaction(function (ownerUid) {
        if (!ownerUid || ownerUid === userId) {
          return userId;
        }
        return;
      });

      if (idxTx.committed && idxTx.snapshot && idxTx.snapshot.val() === userId) {
        await cloud.db.ref("users/" + userId).update({
          specialId: assignedId,
          username: clean(username || (S.me && S.me.name) || "مستخدم"),
          createdAt: (S.me && S.me.joined) || Date.now()
        });
        if (S && S.me && S.me.id === userId) {
          S.me.specialId = assignedId;
          saveLocal();
        }
        return assignedId;
      }

      UI.idAssigning = false;
      return await ensureSequentialSpecialId(userId, username);
    } catch (e) {
      return S.me.specialId || "";
    } finally {
      UI.idAssigning = false;
    }
  }

  function saveMeCloud() {
    if (!cloud.on || !cloud.db || !S || !S.me) return;
    var curLv = level();
    var payload = {
      id: S.me.id, num: S.me.num,
      name: S.me.name, username: S.me.name,
      photo: S.me.photo || "", cover: S.me.cover || "",
      bio: S.me.bio, coins: S.me.coins,
      xp: S.me.xp || 0, level: curLv,
      wealth: Number(S.me.wealth || 0),
      charm: Number(S.me.charm || 0),
      vip: S.me.vip || 0, vipExp: S.me.vipExp || 0, verified: !!S.me.verified,
      followers: S.me.followers || 0, following: S.follows.length || 0,
      friendsCount: S.friends.length || 0,
      visits: S.me.visits || 0, roomsJoined: S.me.roomsJoined || 0,
      roomSeconds: S.me.roomSeconds || 0,
      receivedGifts: (S.me.receivedGifts || []).slice(-30),
      wealthLog: (S.me.wealthLog || []).slice(-25),
      charmLog: (S.me.charmLog || []).slice(-25),
      country: S.me.country, gifts: S.me.gifts || 0, sent: S.me.sent || 0,
      msgCount: S.me.msgCount || 0, ach: S.me.ach || {},
      daily: S.me.daily || 0, tasks: S.me.tasks || {}, invites: S.me.invites || 0,
      online: true
    };
    if (/^\d{7}$/.test(String(S.me.specialId || ""))) {
      payload.specialId = String(S.me.specialId);
    }
    cloud.db.ref("users/" + S.me.id).update(payload).catch(function () { /* */ });
  }

  function save() {
    saveLocal();
    saveMeCloud();
  }

  function normalizeRoom(id, r) {
    r = r || {};
    var n = Number(r.seatCount) || (Array.isArray(r.seats) ? r.seats.length : 9) || 9;
    var seats = [];
    var seenSeatUids = {};
    for (var i = 0; i < n; i++) {
      var s = (r.seats && r.seats[i]) || {};
      var seatUid = s.uid || null;
      if (seatUid) {
        if (seenSeatUids[seatUid]) seatUid = null;
        else seenSeatUids[seatUid] = true;
      }
      seats.push({
        uid: seatUid,
        locked: !!s.locked,
        muted: !!s.muted,
        vip: s.vip != null ? !!s.vip : i === 0
      });
    }
    var listenersArr = [];
    if (Array.isArray(r.listeners)) {
      r.listeners.forEach(function (uidKey) {
        if (uidKey && !seenSeatUids[uidKey] && listenersArr.indexOf(uidKey) < 0) listenersArr.push(uidKey);
      });
    } else if (r.listeners && typeof r.listeners === "object") {
      Object.keys(r.listeners).forEach(function (uidKey) {
        if (r.listeners[uidKey] && !seenSeatUids[uidKey] && listenersArr.indexOf(uidKey) < 0) listenersArr.push(uidKey);
      });
    }
    var modsArr = Array.isArray(r.mods) ? r.mods : Object.keys(r.mods || {});
    var bansArr = Array.isArray(r.bans) ? r.bans : Object.keys(r.bans || {});

    return {
      id: id, name: r.name || "غرفة", desc: r.desc || "", cat: r.cat || "chat",
      owner: r.owner || "", mods: modsArr,
      seats: seats, listeners: listenersArr,
      bans: bansArr, priv: !!r.priv, locked: !!r.locked, pinned: r.pinned || "",
      created: typeof r.created === "number" ? r.created : now(),
      color: r.color || 0, icon: r.icon || 0,
      roomPhoto: r.roomPhoto || "",
      theme: r.theme || null,
      recvTop: r.recvTop || {}, seatCount: n, msgs: cloud.roomMsgs[id] || r.msgs || []
    };
  }

  function requestBrowserNotifPermission() {
    if ("Notification" in global && Notification.permission === "default") {
      try { Notification.requestPermission().catch(function () { /* */ }); } catch (e) { /* */ }
    }
  }

  function triggerBrowserNotif(title, body) {
    if (!S || !S.settings || !S.settings.notif) return;
    if ("Notification" in global && Notification.permission === "granted") {
      try { new Notification(title, { body: body }); } catch (e) { /* */ }
    }
  }

  function attachDmInboxListener(myId) {
    if (!cloud.on || !cloud.db) return;
    trackListener("app", cloud.db.ref("userDms/" + myId), "value", function (snap) {
      var threads = snap.val() || {};
      Object.keys(threads).forEach(function (peerId) {
        if (S.blocked.indexOf(peerId) >= 0) return;
        var tid = dmThreadId(myId, peerId);
        cloud.db.ref("dms/" + tid).limitToLast(50).once("value").then(function (msnap) {
          var v = msnap.val() || {};
          var msgs = Object.keys(v).map(function (k) { return Object.assign({ key: k }, v[k]); });
          var prevLen = (S.dms[peerId] && S.dms[peerId].length) || 0;
          S.dms[peerId] = msgs;
          if (msgs.length > prevLen && UI.dmId !== peerId) {
            var last = msgs[msgs.length - 1];
            if (last && last.from !== myId) {
              S.unread[peerId] = (S.unread[peerId] || 0) + (msgs.length - prevLen);
            }
          }
          saveLocal();
          renderTop();
          if (UI.page === "messages") renderMessages();
          if (UI.dmId === peerId) renderDM();
        }).catch(function () { /* */ });
      });
    });
  }

  function startCloudSync() {
    if (!cloud.on) return Promise.resolve();
    return new Promise(function (resolve) {
      var resolved = false;
      function finish() { if (!resolved) { resolved = true; resolve(); } }
      var safetyTimer = setTimeout(finish, 3000);

      var myId = getOrCreateFixedUid();
      var myNum = hashNum(myId);
      S.me.id = myId;
      S.me.num = myNum;
      S.me.level = level();

      var uRef = cloud.db.ref("users/" + myId);
      uRef.once("value").then(async function (snap) {
        var p = snap.val();
        if (p && p.id) {
          var mergedXp = Math.max(Number(S.me.xp || 0), Number(p.xp || 0));
          S.me = Object.assign({}, S.me, p, {
            id: myId,
            num: p.num || myNum,
            specialId: (typeof p.specialId === "string" && /^\d{7}$/.test(p.specialId.trim())) ? p.specialId.trim() : "",
            xp: mergedXp,
            level: computeLevelFromXp(mergedXp),
            wealth: Math.max(Number(S.me.wealth || 0), Number(p.wealth || 0)),
            charm: Math.max(Number(S.me.charm || 0), Number(p.charm || 0))
          });
        } else {
          await uRef.set(Object.assign({}, S.me, {
            username: S.me.name,
            createdAt: S.me.joined || Date.now(),
            online: true,
            level: level()
          })).catch(function () { /* */ });
        }

        await ensureSequentialSpecialId(myId, S.me.name);
        ensureDailyTasks();

        var params = new URLSearchParams(location.search);
        var refUid = params.get("ref");
        if (refUid && refUid !== S.me.id && !S.me._invitedBy) {
          S.me._invitedBy = refUid;
          cloud.db.ref("users/" + refUid + "/invites").transaction(function (c) { return (c || 0) + 1; }).catch(function () { /* */ });
        }

        trackListener("app", cloud.db.ref(".info/connected"), "value", function (cs) {
          if (cs.val() !== true) return;
          uRef.child("online").onDisconnect().set(false);
          uRef.child("lastSeen").onDisconnect().set(serverTs());
          uRef.update({ online: true, level: level() }).catch(function () { /* */ });
        });

        trackListener("app", cloud.db.ref("users"), "value", function (usnap) {
          var val = usnap.val() || {};
          cloud.usersMap = val;
          var list = [];
          Object.keys(val).forEach(function (k) {
            if (k !== S.me.id) {
              var uObj = Object.assign({ id: k }, val[k]);
              uObj.level = computeLevelFromXp(uObj.xp || 0);
              list.push(uObj);
            }
          });
          S.users = list;
          renderTop();
          if (UI.page === "home" && UI.query.trim()) renderHome();
          if (UI.page === "friends") renderFriends();
          if (UI.page === "messages") renderMessages();
          if (UI.page === "profile") renderProfile();
          if (UI.roomId) renderRoom();
        });

        trackListener("app", cloud.db.ref("rooms"), "value", function (rsnap) {
          var val = rsnap.val() || {};
          var list = [];
          Object.keys(val).forEach(function (rid) {
            list.push(normalizeRoom(rid, val[rid]));
          });
          if (list.length) {
            S.rooms = list;
          }

          if (UI.roomId) {
            var cur = getRoom(UI.roomId);
            if (!cur && list.length) {
              toast("تم إغلاق الغرفة من المالك");
              leaveRoom(false);
            } else if (cur && cur.bans.indexOf(S.me.id) >= 0) {
              toast("تم حظرك من هذه الغرفة 🚫");
              leaveRoom(false);
            } else if (cur) {
              if (cur.theme) applyRoomTheme(cur.theme);
              syncMicHardwareState();
              renderRoom();
            }
          }
          renderFloatingOrb();
          if (UI.page === "home") renderHome();
          else if (UI.page === "rooms") renderRooms();
          else if (UI.page === "friends") renderFriends();
        });

        trackListener("app", cloud.db.ref("social/" + S.me.id), "value", function (ssnap) {
          var sv = ssnap.val() || {};
          S.friends = Object.keys(sv.friends || {});
          S.requests = Object.keys(sv.requests || {});
          S.sentReq = Object.keys(sv.sentReq || {});
          S.follows = Object.keys(sv.follows || {});
          S.blocked = Object.keys(sv.blocked || {});
          renderTop();
          if (UI.page === "friends") renderFriends();
          if (UI.page === "profile") renderProfile();
        });

        trackListener("app", cloud.db.ref("notifications/" + S.me.id).limitToLast(50), "value", function (nsnap) {
          var nv = nsnap.val() || {};
          var arr = Object.keys(nv).map(function (k) {
            return Object.assign({ id: k }, nv[k]);
          }).sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
          S.notifs = arr;
          renderTop();
        });

        attachDmInboxListener(myId);

        saveLocal();
        clearTimeout(safetyTimer);
        finish();
      }).catch(function () {
        clearTimeout(safetyTimer);
        finish();
      });

      if (cloud.auth) {
        cloud.auth.signInAnonymously().catch(function () { /* */ });
      }
    });
  }

  /* ========= 7. دوال البيانات المساعدة ========= */
  function getUser(id) {
    if (!id) return { id: "", num: 0, specialId: "0001000", name: "مستخدم", photo: "", cover: "", online: false, bio: "", vip: 0, vipExp: 0, verified: false, level: 1, wealth: 0, charm: 0, followers: 0, following: 0, friendsCount: 0, visits: 0, roomsJoined: 0, roomSeconds: 0, gifts: 0, xp: 0, ach: {}, receivedGifts: [], wealthLog: [], charmLog: [] };
    if (id === S.me.id) {
      var meLv = level();
      return {
        id: S.me.id, num: S.me.num,
        specialId: S.me.specialId || "",
        name: S.me.name,
        photo: S.me.photo || "", cover: S.me.cover || "",
        online: true, bio: S.me.bio, vip: S.me.vip || 0, vipExp: S.me.vipExp || 0,
        verified: !!(S.me.verified || (S.me.vip || 0) >= 2 || meLv >= 5),
        level: meLv,
        wealth: Number(S.me.wealth || 0),
        charm: Number(S.me.charm || 0),
        followers: S.me.followers || 0, following: S.follows.length || 0,
        friendsCount: S.friends.length || 0,
        visits: S.me.visits || 0, roomsJoined: S.me.roomsJoined || 0,
        roomSeconds: S.me.roomSeconds || 0, gifts: S.me.gifts || 0,
        xp: S.me.xp || 0, country: S.me.country || "🇪🇬 مصر",
        ach: S.me.ach || {},
        receivedGifts: S.me.receivedGifts || [],
        wealthLog: S.me.wealthLog || [],
        charmLog: S.me.charmLog || [],
        me: true
      };
    }
    if (cloud.usersMap[id]) {
      var cu = cloud.usersMap[id];
      var cLv = computeLevelFromXp(cu.xp || 0);
      return Object.assign({
        id: id, specialId: cu.specialId || "", photo: "", cover: "", online: false, bio: "",
        vip: 0, vipExp: 0, verified: false, level: cLv,
        wealth: Number(cu.wealth || 0),
        charm: Number(cu.charm || 0),
        followers: 0, following: 0, friendsCount: 0, visits: 0, roomsJoined: 0,
        roomSeconds: 0, gifts: 0, xp: 0, country: "🌍 غير محدد",
        ach: {}, receivedGifts: [], wealthLog: [], charmLog: []
      }, cu, { level: cLv });
    }
    for (var i = 0; i < S.users.length; i++) {
      if (S.users[i].id === id) {
        var su = S.users[i];
        return Object.assign({
          specialId: su.specialId || "", friendsCount: 0, wealth: 0, charm: 0, ach: {},
          receivedGifts: [], wealthLog: [], charmLog: []
        }, su, { level: computeLevelFromXp(su.xp || 0) });
      }
    }
    return { id: id, num: hashNum(id), specialId: "", name: "مستخدم", photo: "", cover: "", online: false, bio: "", vip: 0, vipExp: 0, verified: false, level: 1, wealth: 0, charm: 0, followers: 0, following: 0, friendsCount: 0, visits: 0, roomsJoined: 0, roomSeconds: 0, gifts: 0, xp: 0, ach: {}, receivedGifts: [], wealthLog: [], charmLog: [] };
  }

  function getRoom(id) {
    if (!id || !S || !Array.isArray(S.rooms)) return null;
    for (var i = 0; i < S.rooms.length; i++) if (S.rooms[i].id === id) return S.rooms[i];
    return null;
  }

  function level() { return computeLevelFromXp(S.me.xp || 0); }

  function addXP(n) {
    var delta = Math.max(0, Number(n || 0));
    if (!delta) return;
    var before = level();
    S.me.xp = Math.max(0, Number(S.me.xp || 0)) + delta;
    var after = computeLevelFromXp(S.me.xp);
    S.me.level = after;

    if (after > before) {
      var bonusCoins = after * 20;
      S.me.coins += bonusCoins;
      var tierChanged = Math.floor(after / 10) > Math.floor(before / 10);
      var msg = tierChanged
        ? "تهانينا! وصلت للمستوى " + after + " وحصلت على شارة مستوى جديدة ومكافأة " + bonusCoins + " عملة!"
        : "ارتفع مستواك إلى " + after + "! مكافأتك " + bonusCoins + " عملة.";
      addNotif("⭐", msg);
      toast("🎉 مستوى " + after + (tierChanged ? " — شارة جديدة!" : ""));
    }
    if (after >= 3) S.me.ach.lvl3 = true;
  }

  function addNotif(icon, text, targetUserId) {
    var uidTarget = targetUserId || S.me.id;
    var item = { id: uid(), icon: icon, text: text, t: now(), read: false };
    requestBrowserNotifPermission();
    triggerBrowserNotif("REAL VOICE " + icon, text);

    if (cloud.on && cloud.db) {
      cloud.db.ref("notifications/" + uidTarget).push({ icon: icon, text: text, t: serverTs(), read: false }).catch(function () { /* */ });
    }
    if (uidTarget === S.me.id) {
      S.notifs.unshift(item);
      if (S.notifs.length > 60) S.notifs.length = 60;
    }
  }

  function pushRoomMsg(room, msgObj) {
    if (!room) return;
    if (!Array.isArray(room.msgs)) room.msgs = [];
    var localKey = uid();
    var localMsg = Object.assign({ key: localKey }, msgObj, { t: now() });
    room.msgs.push(localMsg);
    if (room.msgs.length > 150) room.msgs.shift();
    if (UI.roomId === room.id) renderRoomChat();

    if (cloud.on && cloud.db) {
      cloud.db.ref("roomMessages/" + room.id).push(Object.assign({}, msgObj, { t: serverTs() })).catch(function () { /* */ });
    }
  }

  function getRoomParticipantIds(room) {
    var seen = {};
    var ids = [];
    if (!room) return ids;
    (room.seats || []).forEach(function (s) {
      if (s && s.uid && !seen[s.uid]) {
        seen[s.uid] = true;
        ids.push(s.uid);
      }
    });
    (room.listeners || []).forEach(function (uidItem) {
      if (uidItem && !seen[uidItem]) {
        seen[uidItem] = true;
        ids.push(uidItem);
      }
    });
    return ids;
  }

  function count(room) {
    return getRoomParticipantIds(room).length;
  }

  function seatIndexOf(room, id) {
    if (!room || !Array.isArray(room.seats)) return -1;
    for (var i = 0; i < room.seats.length; i++) if (room.seats[i].uid === id) return i;
    return -1;
  }

  function inRoom(room, id) {
    if (!room) return false;
    return seatIndexOf(room, id) >= 0 || (room.listeners || []).indexOf(id) >= 0;
  }

  function role(room, id) {
    if (!room) return "user";
    if (room.owner === id) return "owner";
    if ((room.mods || []).indexOf(id) >= 0) return "mod";
    return "user";
  }

  function avatarInnerHTML(u) {
    if (u && u.photo) {
      return '<img src="' + esc(u.photo) + '" alt="' + esc(u.name || "avatar") + '" />';
    }
    return esc(initials(u && u.name));
  }

  function avatarHTML(u, cls) {
    return '<div class="avatar ' + (cls || "") + '">' + avatarInnerHTML(u) + "</div>";
  }

  function setAvatarEl(el, u) {
    if (!el) return;
    el.innerHTML = avatarInnerHTML(u);
  }

  function roomSqMediaHTML(r) {
    var bg = COVERS[(r.color || 0) % COVERS.length];
    var ic = COVER_ICONS[(r.icon || 0) % COVER_ICONS.length];
    var pCount = count(r);
    var catTxt = CATEGORIES[r.cat] || "عام";
    var mediaInner = r.roomPhoto
      ? '<img src="' + esc(r.roomPhoto) + '" alt="' + esc(r.name || "room") + '" />'
      : "<span>" + ic + "</span>";
    return '<div class="room-sq-media" style="background:' + bg + '">' +
      mediaInner +
      '<span class="room-sq-top-pill">' + esc(catTxt) + "</span>" +
      '<span class="room-sq-bottom-pill">🎧 ' + pCount + "</span>" +
      "</div>";
  }

  function userNameHTML(u) {
    var lv = computeLevelFromXp(u && u.xp ? u.xp : (u && u.level ? (u.level - 1) * CONFIG.xpPerLevel : 0));
    var lvBadge = levelBadgeHTML(lv);
    var v = (u && u.vip > 0) ? '<span class="tag vip">VIP' + u.vip + "</span>" : "";
    var ver = (u && (u.verified || (u.vip || 0) >= 2 || lv >= 5)) ? '<span class="tag verified">✔ موثق</span>' : "";
    return esc(u.name) + lvBadge + ver + v;
  }

  function updateAppBadge(unreadCount) {
    if (navigator && typeof navigator.setAppBadge === "function") {
      if (unreadCount > 0) navigator.setAppBadge(unreadCount).catch(function () { /* */ });
      else navigator.clearAppBadge().catch(function () { /* */ });
    }
  }

  /* ========= 8. شريط دخول الأعضاء الاحترافي (3 ثوانٍ) ========= */
  function showEntryBanner(userObj) {
    var wrap = $("entry-banner-wrap");
    if (!wrap || !userObj) return;
    var u = typeof userObj === "string" ? getUser(userObj) : userObj;
    var ribbon = document.createElement("div");
    ribbon.className = "entry-ribbon";
    var avHtml = u.photo
      ? '<img src="' + esc(u.photo) + '" alt="" />'
      : esc(initials(u.name));
    ribbon.innerHTML =
      '<span class="entry-ribbon-av">' + avHtml + "</span>" +
      "<span>✨ دخل الغرفة: " + esc(u.name || "مستخدم") + "</span>";
    wrap.appendChild(ribbon);
    setTimeout(function () {
      if (ribbon.parentNode) ribbon.parentNode.removeChild(ribbon);
    }, 3050);
  }

  /* ========= 9. حركة طيران الهدية مباشرة نحو المقعد المستهدف ========= */
  function showFlyGiftToSeat(emoji, senderName, targetUid, targetName) {
    var activeRId = UI.roomId || UI.floatingRoomId;
    var room = getRoom(activeRId);
    var appEl = $("app");
    if (!appEl) return;

    var startX = window.innerWidth / 2;
    var startY = window.innerHeight - 90;
    var endX = window.innerWidth / 2;
    var endY = window.innerHeight * 0.28;
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
    proj.style.left = startX + "px";
    proj.style.top = startY + "px";
    proj.innerHTML = emoji + "<small>" + esc(senderName) + " ➔ " + esc(targetName) + "</small>";
    appEl.appendChild(proj);

    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        proj.style.left = endX + "px";
        proj.style.top = endY + "px";
        proj.style.transform = "translate(-50%, -50%) scale(1.22)";
      });
    });

    setTimeout(function () {
      if (targetSeatIdx >= 0) {
        var hitEl = document.querySelector('#room-seats .seat[data-seat="' + targetSeatIdx + '"]');
        if (hitEl) {
          hitEl.classList.remove("gift-hit");
          void hitEl.offsetWidth;
          hitEl.classList.add("gift-hit");
          setTimeout(function () { hitEl.classList.remove("gift-hit"); }, 1900);
        }
      }
    }, 800);

    setTimeout(function () {
      proj.style.opacity = "0";
      proj.style.transform = "translate(-50%, -65%) scale(1.35)";
    }, 2100);

    setTimeout(function () {
      if (proj.parentNode) proj.parentNode.removeChild(proj);
    }, 2600);
  }

  /* ========= 10. الغرفة العائمة الدائرية القابلة للسحب + الانتقال لغرفة أخرى مع حفظ الصوت ========= */
  function renderFloatingOrb() {
    var orb = $("floating-room-orb");
    if (!orb) return;
    if (!UI.floatingRoomId) {
      orb.classList.add("hidden");
      return;
    }
    var r = getRoom(UI.floatingRoomId);
    if (!r) {
      UI.floatingRoomId = null;
      orb.classList.add("hidden");
      return;
    }
    orb.classList.remove("hidden");
    var avBox = $("floating-orb-avatar");
    var lblBox = $("floating-orb-label");
    if (avBox) {
      avBox.innerHTML = r.roomPhoto
        ? '<img src="' + esc(r.roomPhoto) + '" alt="" />'
        : esc(COVER_ICONS[(r.icon || 0) % COVER_ICONS.length]);
    }
    if (lblBox) lblBox.textContent = r.name || "روم";
  }

  function findNextRoomToEnter(currentRoomId) {
    var candidates = S.rooms.filter(function (r) {
      return r.id !== currentRoomId && (!r.priv || r.owner === S.me.id || inRoom(r, S.me.id));
    });
    if (candidates.length) return candidates[0];
    return null;
  }

  function minimizeRoomToFloatingOrb() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var rid = room.id;
    closeSheet();
    cleanup("room");
    UI.roomId = null;
    UI.floatingRoomId = rid;
    $("room-view").classList.remove("open");
    renderFloatingOrb();
    renderAll();
    toast("تم تصغير الغرفة لدائرة — اسحبها أو اضغط لدخول غرفة أخرى مع بقاء الصوت 🎧");
  }

  function attachFloatingOrbDragAndClick() {
    var orb = $("floating-room-orb");
    if (!orb) return;
    var dragging = false;
    var moved = false;
    var startX = 0, startY = 0, origLeft = 0, origTop = 0;

    function onStart(clientX, clientY) {
      dragging = true;
      moved = false;
      var rect = orb.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      origLeft = rect.left;
      origTop = rect.top;
      orb.style.left = origLeft + "px";
      orb.style.top = origTop + "px";
      orb.style.right = "auto";
      orb.style.bottom = "auto";
    }

    function onMove(clientX, clientY) {
      if (!dragging) return;
      var dx = clientX - startX;
      var dy = clientY - startY;
      if (Math.abs(dx) > 6 || Math.abs(dy) > 6) moved = true;
      if (!moved) return;
      var maxX = Math.max(8, window.innerWidth - orb.offsetWidth - 8);
      var maxY = Math.max(8, window.innerHeight - orb.offsetHeight - 8);
      var nextX = Math.min(maxX, Math.max(8, origLeft + dx));
      var nextY = Math.min(maxY, Math.max(8, origTop + dy));
      orb.style.left = nextX + "px";
      orb.style.top = nextY + "px";
    }

    function onEnd() {
      if (!dragging) return;
      dragging = false;
      if (moved) return;

      var sourceRoomId = UI.floatingRoomId;
      var nextRoom = findNextRoomToEnter(sourceRoomId);
      if (!nextRoom) {
        toast("لا توجد غرفة أخرى متاحة حالياً — أنشئ غرفة جديدة أولاً");
        return;
      }

      UI.floatingRoomId = null;
      renderFloatingOrb();
      enterRoom(nextRoom.id, true, { keepVoiceAlive: true, previousRoomId: sourceRoomId });
      toast("تم الانتقال إلى: " + nextRoom.name + " مع الإبقاء على الصوت 🔊");
    }

    orb.addEventListener("pointerdown", function (e) {
      e.preventDefault();
      onStart(e.clientX, e.clientY);
      var moveEv = function (ev) { onMove(ev.clientX, ev.clientY); };
      var upEv = function () {
        document.removeEventListener("pointermove", moveEv);
        document.removeEventListener("pointerup", upEv);
        onEnd();
      };
      document.addEventListener("pointermove", moveEv);
      document.addEventListener("pointerup", upEv);
    });
  }

  /* ========= 11. التنقل ورسم الصفحات ========= */
  function go(page) {
    closeSheet();
    UI.page = page;
    document.querySelectorAll(".page").forEach(function (p) { p.classList.toggle("active", p.id === "page-" + page); });
    document.querySelectorAll(".navbtn").forEach(function (b) { b.classList.toggle("active", b.getAttribute("data-page") === page); });
    var pg = $("page-" + page);
    if (pg) pg.scrollTop = 0;
    renderCurrentPage();
  }

  function renderTop() {
    $("coins-top").textContent = S.me.coins;
    $("level-top").textContent = level();
    setAvatarEl($("avatar-top"), S.me);
    var tBtn = $("theme-toggle-btn");
    if (tBtn) tBtn.textContent = (S.settings && S.settings.lightTheme) ? "🌙" : "☀️";
    var unread = S.notifs.filter(function (n) { return !n.read; }).length;
    var b = $("notif-badge");
    b.textContent = unread; b.classList.toggle("hidden", unread === 0);
    var mu = 0; for (var k in S.unread) mu += S.unread[k] || 0;
    var mb = $("msg-badge"); mb.textContent = mu; mb.classList.toggle("hidden", mu === 0);
    updateAppBadge(mu);
    var fb = $("friends-badge"); fb.textContent = S.requests.length; fb.classList.toggle("hidden", S.requests.length === 0);
  }

  function roomCard(r) {
    var owner = getUser(r.owner);
    var privTag = r.priv ? "🕵️ " : "";
    var occSeats = r.seats.filter(function (s) { return s.uid; }).length;
    return '<div class="room-sq-card" data-enter="' + esc(r.id) + '">' +
      roomSqMediaHTML(r) +
      '<div class="room-sq-body">' +
        '<div class="room-sq-title">' + privTag + esc(r.name) + "</div>" +
        '<div class="room-sq-sub"><span>' + esc(owner.country || "🌍") + " " + esc(owner.name) + "</span><span>🪑 " + occSeats + "/" + r.seats.length + "</span></div>" +
      "</div></div>";
  }

  function filterRooms() {
    var list = S.rooms.filter(function (r) { return !r.priv || r.owner === S.me.id || inRoom(r, S.me.id); });
    var q = UI.query.trim().toLowerCase();
    if (q) {
      list = list.filter(function (r) {
        var hasPhotoMatch = ("صورة".indexOf(q) >= 0 || "photo".indexOf(q) >= 0) && !!r.roomPhoto;
        return r.name.toLowerCase().indexOf(q) >= 0 ||
          r.id.toLowerCase().indexOf(q) >= 0 ||
          (r.desc || "").toLowerCase().indexOf(q) >= 0 ||
          hasPhotoMatch;
      });
    }
    var f = UI.filter;
    if (f === "popular") list = list.slice().sort(function (a, b) { return count(b) - count(a); });
    else if (f === "new") list = list.slice().sort(function (a, b) { return (b.created || 0) - (a.created || 0); });
    else if (f === "friends") list = list.filter(function (r) { return S.friends.some(function (fid) { return inRoom(r, fid); }); });
    else if (f === "vip") list = list.filter(function (r) { return r.cat === "vip"; });
    else if (f === "games") list = list.filter(function (r) { return r.cat === "games"; });
    return list;
  }

  function renderHome() {
    var list = filterRooms();
    $("home-rooms").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty" style="grid-column:1/-1">لا توجد غرف مطابقة 🔎</div>';
    var box = $("search-users");
    var q = UI.query.trim().toLowerCase();
    if (q) {
      var us = S.users.filter(function (u) {
        var sp = String(u.specialId || "").toLowerCase();
        return (u.name || "").toLowerCase().indexOf(q) >= 0 ||
          (u.id || "").toLowerCase().indexOf(q) >= 0 ||
          sp.indexOf(q) >= 0;
      });
      box.classList.toggle("hidden", us.length === 0);
      box.innerHTML = us.length ? '<h2 class="title">المستخدمون</h2>' + us.map(function (u) {
        var spId = displayUserId(u);
        return '<div class="row glass" data-profile="' + esc(u.id) + '">' +
          avatarHTML(u) +
          '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">ID: ' + esc(spId) + "</div></div>" +
          copyBtnHTML(spId, "📋") +
          "</div>";
      }).join("") : "";
    } else { box.classList.add("hidden"); box.innerHTML = ""; }
    document.querySelectorAll("#home-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-filter") === UI.filter); });
  }

  function renderRooms() {
    var list = UI.rfilter === "mine"
      ? S.rooms.filter(function (r) { return r.owner === S.me.id; })
      : S.rooms.filter(function (r) { return !r.priv || r.owner === S.me.id; }).sort(function (a, b) { return count(b) - count(a); });
    $("rooms-list").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty" style="grid-column:1/-1">' + (UI.rfilter === "mine" ? "لم تنشئ غرفة بعد. اضغط ＋ لإنشاء غرفتك الأولى" : "لا توجد غرف متاحة") + "</div>";
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) { t.classList.toggle("active", t.getAttribute("data-rfilter") === UI.rfilter); });
  }

  function personRow(u, actions) {
    var where = "";
    var spId = displayUserId(u);
    for (var i = 0; i < S.rooms.length; i++) if (inRoom(S.rooms[i], u.id)) { where = " • في غرفة: " + esc(S.rooms[i].name); break; }
    return '<div class="row glass"><div data-profile="' + esc(u.id) + '" style="position:relative">' + avatarHTML(u) + '<span class="dot ' + (u.online ? "on" : "") + '"></span></div>' +
      '<div class="info" data-profile="' + esc(u.id) + '"><div class="name">' + userNameHTML(u) + '</div><div class="meta">ID: ' + esc(spId) + " • " + (u.online ? "متصل" : "غير متصل") + where + "</div></div>" +
      copyBtnHTML(spId, "📋") + actions + "</div>";
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
        var btns = (room ? '<button class="btn sm" data-enter="' + esc(room.id) + '" type="button">🚪 انضم</button>' : "") +
          '<button class="btn sm ghost" data-dm="' + esc(u.id) + '" type="button">💬</button>';
        return personRow(u, btns);
      }).join("") : '<div class="empty">لا يوجد أصدقاء بعد. استخدم تبويب "بحث" لإضافة أصدقاء</div>';
    } else if (UI.ftab === "requests") {
      html = S.requests.length ? S.requests.map(function (id) {
        return personRow(getUser(id), '<button class="btn sm" data-accept="' + esc(id) + '" type="button">قبول</button><button class="btn sm ghost" data-reject="' + esc(id) + '" type="button">رفض</button>');
      }).join("") : '<div class="empty">لا توجد طلبات صداقة</div>';
      if (S.sentReq.length) {
        html += '<h2 class="title">طلبات أرسلتها</h2>' + S.sentReq.map(function (id) {
          return personRow(getUser(id), '<button class="btn sm ghost" data-cancelreq="' + esc(id) + '" type="button">إلغاء</button>');
        }).join("");
      }
    } else {
      var q = UI.findQ.trim().toLowerCase();
      var res = S.users.filter(function (u) {
        var sp = String(u.specialId || "").toLowerCase();
        return !q ||
          (u.name || "").toLowerCase().indexOf(q) >= 0 ||
          (u.id || "").toLowerCase().indexOf(q) >= 0 ||
          sp.indexOf(q) >= 0;
      });
      html = res.length ? res.map(function (u) {
        var btn;
        if (S.friends.indexOf(u.id) >= 0) btn = '<span class="small">صديق ✔</span>';
        else if (S.sentReq.indexOf(u.id) >= 0) btn = '<span class="small">تم الإرسال</span>';
        else btn = '<button class="btn sm" data-addfriend="' + esc(u.id) + '" type="button">+ إضافة</button>';
        return personRow(u, btn);
      }).join("") : '<div class="empty">لا نتائج</div>';
    }
    $("friends-list").innerHTML = html;
  }

  function renderMessages() {
    var ids = Object.keys(S.dms).filter(function (id) { return S.dms[id] && S.dms[id].length && S.blocked.indexOf(id) < 0; });
    ids.sort(function (a, b) { return (S.dms[b][S.dms[b].length - 1].t || 0) - (S.dms[a][S.dms[a].length - 1].t || 0); });
    $("dm-list").innerHTML = ids.length ? ids.map(function (id) {
      var u = getUser(id), last = S.dms[id][S.dms[id].length - 1], un = S.unread[id] || 0;
      var preview = last.audio ? "🎙️ رسالة صوتية" : esc(last.text || "");
      return '<div class="row glass" data-dm="' + esc(id) + '">' + avatarHTML(u) + '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + (last.from === S.me.id ? "أنت: " : "") + preview + '</div></div><div style="text-align:left"><div class="small">' + timeStr(last.t) + "</div>" + (un ? '<span class="badge" style="position:static;display:inline-flex;margin-top:4px">' + un + "</span>" : "") + "</div></div>";
    }).join("") : '<div class="empty">لا توجد محادثات بعد.<br>افتح ملف صديق واضغط "رسالة".</div>';
  }

  function renderGiftsAndCollectionsHTML(userObj) {
    var rec = Array.isArray(userObj.receivedGifts) ? userObj.receivedGifts : [];
    var wLog = Array.isArray(userObj.wealthLog) ? userObj.wealthLog : [];
    var cLog = Array.isArray(userObj.charmLog) ? userObj.charmLog : [];
    var totalVal = 0;
    var rarest = null;
    rec.forEach(function (g) {
      var p = Number(g.p || 0);
      totalVal += p;
      if (!rarest || p > Number(rarest.p || 0)) rarest = g;
    });

    var rareHtml = rarest
      ? '<div class="row glass" style="margin-bottom:8px"><div style="font-size:28px">' + esc(rarest.e || "💎") + '</div><div class="info"><div class="name">أغلى هدية مميزة: ' + esc(rarest.n || "هدية") + '</div><div class="meta">القيمة: 🪙 ' + esc(rarest.p || 0) + " • من: " + esc(rarest.fromName || "مستخدم") + "</div></div></div>"
      : '<div class="small" style="margin-bottom:8px">لا توجد هدايا مستقبلة مسجلة بعد.</div>';

    var giftsGrid = rec.length
      ? '<div class="showcase-grid">' + rec.slice(-9).reverse().map(function (g) {
        return '<div class="show-item"><div class="ic">' + esc(g.e || "🎁") + "</div><b>" + esc(g.n || "هدية") + "</b><small>🪙 " + esc(g.p || 0) + (g.charmGain ? " • ✨+" + g.charmGain : "") + "</small></div>";
      }).join("") + "</div>"
      : "";

    var charmHistoryHtml = cLog.length
      ? '<h4 style="margin:12px 0 6px;font-size:12.5px">سجل نقاط الجاذبية الأخيرة (Charm)</h4>' +
        cLog.slice(-6).reverse().map(function (item) {
          return '<div class="task-item"><span>' + esc(item.e || "🎁") + " " + esc(item.n || "هدية") + " من " + esc(item.fromName || "مستخدم") + '</span><span class="charm-badge">+' + Number(item.gain || 0) + "</span></div>";
        }).join("")
      : "";

    var wealthHistoryHtml = wLog.length
      ? '<h4 style="margin:10px 0 6px;font-size:12.5px">سجل نقاط الثروة الأخيرة (Wealth)</h4>' +
        wLog.slice(-6).reverse().map(function (item) {
          return '<div class="task-item"><span>' + esc(item.label || "هدايا / عملات") + '</span><span class="wealth-badge">+' + Number(item.gain || 0) + "</span></div>";
        }).join("")
      : "";

    var achMap = userObj.ach || {};
    var unlockedAchs = ACHIEVEMENTS.filter(function (a) { return !!achMap[a.id]; });
    var achHtml = unlockedAchs.length
      ? '<div class="ach-list" style="margin-top:8px">' + unlockedAchs.map(function (a) { return "<span>" + a.t + "</span>"; }).join("") + "</div>"
      : '<div class="small" style="margin-top:6px">لا توجد إنجازات مفتوحة بعد.</div>';

    var ownedItems = [
      { ic: "🖼️", t: "غلاف 3D", s: userObj.cover ? "مخصص" : "افتراضي" },
      { ic: "⭕", t: "إطار الأفاتار", s: (userObj.vip || 0) > 0 ? "إطار VIP" : "إطار قياسي" },
      { ic: "👑", t: "شارة VIP", s: (userObj.vip || 0) > 0 ? "VIP " + userObj.vip : "غير مفعّلة" }
    ];

    var itemsHtml = '<h4 style="margin:12px 0 6px;font-size:12.5px">المقتنيات والشارات والإنجازات</h4><div class="showcase-grid">' + ownedItems.map(function (it) {
      return '<div class="show-item"><div class="ic">' + it.ic + "</div><b>" + esc(it.t) + "</b><small>" + esc(it.s) + "</small></div>";
    }).join("") + "</div>" + achHtml;

    return '<div class="glass" style="padding:12px;margin-bottom:10px">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
      "<b>🎁 الهدايا المستقبلة (" + Math.max(rec.length, Number(userObj.gifts || 0)) + ")</b>" +
      '<span class="tag vip">القيمة: 🪙 ' + totalVal + "</span></div>" +
      rareHtml + giftsGrid + charmHistoryHtml + wealthHistoryHtml + itemsHtml + "</div>";
  }

  function renderVipSectionHTML(userObj, isMe) {
    var vLv = Number(userObj.vip || 0);
    var expTxt = userObj.vipExp && Number(userObj.vipExp) > Date.now()
      ? "سارية حتى: " + new Date(Number(userObj.vipExp)).toLocaleDateString("ar")
      : (vLv > 0 ? "عضوية VIP مفعّلة" : "غير مشترك في VIP حالياً");

    var cardsHtml = VIP_TIERS.map(function (tier) {
      var active = vLv >= tier.level;
      var btnHtml = isMe
        ? '<button class="btn sm ' + (active ? "ghost" : "gold") + '" data-buyvip="' + tier.level + '" type="button">' + (active ? "تجديد / ترقية" : "تفعيل (" + tier.cost + " 🪙)") + "</button>"
        : '<span class="small">' + (active ? "✔ مفعّل" : "") + "</span>";
      return '<div class="row glass" style="margin-bottom:8px">' +
        '<div style="font-size:24px">👑</div>' +
        '<div class="info"><div class="name">' + esc(tier.title) + " (VIP " + tier.level + ')</div><div class="meta">' + esc(tier.perks.join(" • ")) + "</div></div>" +
        btnHtml + "</div>";
    }).join("");

    return '<div class="vip-card-box">' +
      '<div style="display:flex;justify-content:space-between;align-items:center">' +
      "<b>👑 نظام العضوية المميزة VIP</b>" +
      '<span class="tag vip">' + (vLv > 0 ? "VIP " + vLv : "عضو عادي") + "</span></div>" +
      '<div class="small" style="margin:6px 0 10px">' + esc(expTxt) + "</div>" +
      cardsHtml + "</div>";
  }

  function renderProfile() {
    ensureDailyTasks();
    var m = S.me, lv = level(), into = (m.xp || 0) % CONFIG.xpPerLevel;
    var hasVip = (m.vip || 0) > 0;
    var isVerified = !!(m.verified || hasVip || lv >= 5);
    var wMeta = getWealthRankMeta(m.wealth || 0);
    var cMeta = getCharmRankMeta(m.charm || 0);
    var spId = displayUserId(m);

    var covEl = $("pf-cover");
    if (covEl) {
      if (m.cover) {
        covEl.style.backgroundImage = 'url("' + String(m.cover).replace(/"/g, '\\"') + '")';
      } else {
        covEl.style.backgroundImage = "linear-gradient(135deg, #7c3aed, #db2777, #0891b2)";
      }
    }

    var frameEl = $("pf-photo-trigger");
    if (frameEl) frameEl.classList.toggle("vip-frame", hasVip);

    setAvatarEl($("pf-avatar"), m);
    $("pf-name").innerHTML = esc(m.name) +
      " " + levelBadgeHTML(lv) +
      (isVerified ? ' <span class="tag verified">✔ موثق</span>' : "") +
      (hasVip ? ' <span class="tag vip">👑 VIP ' + m.vip + "</span>" : "");
    $("pf-id").textContent = "ID: " + spId;
    $("pf-badges").innerHTML = '<span class="tag">🟢 متصل الآن</span>' +
      wealthBadgeHTML(m.wealth || 0) +
      charmBadgeHTML(m.charm || 0) +
      ((m.invites || 0) > 0 ? '<span class="tag">الدعوات: ' + m.invites + "</span>" : "");
    $("pf-level").textContent = lv;
    $("pf-xp").textContent = lv >= CONFIG.maxLevel ? "الحد الأقصى (Lv.100)" : (into + " / " + CONFIG.xpPerLevel + " XP");
    $("pf-bar").style.width = (lv >= CONFIG.maxLevel ? 100 : (into / CONFIG.xpPerLevel * 100)) + "%";

    $("pf-wealth-title").textContent = wMeta.rank.icon + " الثروة: " + wMeta.rank.name;
    $("pf-wealth-next").textContent = wMeta.progText;
    $("pf-wealth-bar").style.width = wMeta.pct + "%";

    $("pf-charm-title").textContent = cMeta.rank.icon + " الجاذبية: " + cMeta.rank.name;
    $("pf-charm-next").textContent = cMeta.progText;
    $("pf-charm-bar").style.width = cMeta.pct + "%";

    $("pf-followers").textContent = m.followers || 0;
    $("pf-following").textContent = S.follows.length || 0;
    $("pf-friends").textContent = S.friends.length || 0;
    $("pf-wealth-val").textContent = m.wealth || 0;
    $("pf-charm-val").textContent = m.charm || 0;
    $("pf-time-cnt").textContent = Math.max(0, Math.floor((m.roomSeconds || 0) / 60)) + " د";
    $("pf-coins").textContent = m.coins || 0;
    $("pf-gifts").textContent = m.gifts || 0;
    $("pf-xp-total").textContent = m.xp || 0;

    $("pf-bio").textContent = m.bio;
    $("pf-meta").textContent = (m.country || "🇪🇬 مصر") + " • انضم في " + new Date(m.joined || now()).toLocaleDateString("ar");
    $("pf-ach").innerHTML = ACHIEVEMENTS.map(function (a) { return '<span class="' + (m.ach[a.id] ? "" : "off") + '">' + a.t + "</span>"; }).join("");

    var canDaily = !m.daily || (Date.now() - Number(m.daily) >= 24 * 60 * 60 * 1000);
    var dailyBtn = $("pf-daily");
    if (dailyBtn) {
      dailyBtn.disabled = !canDaily;
      dailyBtn.style.opacity = canDaily ? "1" : "0.55";
      dailyBtn.textContent = canDaily ? "🎁 استلم 100 عملة اليوم" : "✅ تم استلام مكافأة اليوم";
    }

    var tasksList = [
      { key: "msg", label: "💬 أرسل رسالة في غرفة" },
      { key: "friend", label: "👥 أضف صديقاً أو أرسل طلباً" },
      { key: "mic", label: "🎤 اصعد إلى المايك" },
      { key: "room", label: "🚪 ادخل غرفة صوتية" }
    ];
    $("pf-tasks").innerHTML = tasksList.map(function (tk) {
      var done = !!(m.tasks && m.tasks[tk.key]);
      return '<div class="task-item"><span>' + tk.label + '</span><span>' + (done ? "✅ مكتملة (+25 🪙)" : "⏳ 25 🪙") + "</span></div>";
    }).join("");

    document.querySelectorAll("#pf-subtabs .tab").forEach(function (tb) {
      tb.classList.toggle("active", tb.getAttribute("data-pftab") === UI.pftab);
    });
    $("pf-section-overview").classList.toggle("hidden", UI.pftab !== "overview");
    $("pf-section-gifts").classList.toggle("hidden", UI.pftab !== "gifts");
    $("pf-section-vip").classList.toggle("hidden", UI.pftab !== "vip");

    if (UI.pftab === "gifts") {
      $("pf-section-gifts").innerHTML = renderGiftsAndCollectionsHTML(getUser(S.me.id));
    } else if (UI.pftab === "vip") {
      $("pf-section-vip").innerHTML = renderVipSectionHTML(getUser(S.me.id), true);
    }
  }

  function renderCurrentPage() {
    if (UI.page === "home") renderHome();
    else if (UI.page === "rooms") renderRooms();
    else if (UI.page === "friends") renderFriends();
    else if (UI.page === "messages") renderMessages();
    else if (UI.page === "profile") renderProfile();
  }

  function renderAll() {
    renderTop();
    renderCurrentPage();
  }

  /* ========= 12. النوافذ السفلية ========= */
  function openSheet(html) {
    var content = String(html || "").trim();
    if (!content) {
      closeSheet();
      return;
    }
    var sh = $("sheet");
    var sc = $("scrim");
    sh.onclick = null;
    sh.innerHTML = '<div class="sheet-handle"></div>' + content;
    sh.scrollTop = 0;
    sc.classList.add("open");
    sh.classList.add("open");
  }

  function closeSheet() {
    cleanup("seat_profile");
    UI.activeSeatProfileUid = null;
    UI.activeSeatProfileIdx = -1;
    var sh = $("sheet");
    var sc = $("scrim");
    if (sc) sc.classList.remove("open");
    if (sh) {
      sh.classList.remove("open");
      sh.onclick = null;
    }
  }

  function actionList(title, items) {
    var html = "<h3>" + esc(title) + '</h3><div class="actlist">';
    items.forEach(function (it, i) {
      html += '<button class="' + (it.danger ? "danger" : "") + '" data-act="' + i + '" type="button">' + esc(it.label) + "</button>";
    });
    html += '<button data-act="cancel" type="button">إلغاء</button></div>';
    openSheet(html);
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-act]");
      if (!b) return;
      var a = b.getAttribute("data-act");
      closeSheet();
      if (a !== "cancel" && items[Number(a)] && typeof items[Number(a)].fn === "function") {
        items[Number(a)].fn();
      }
    };
  }

  function confirmBox(text, yes) {
    openSheet("<h3>تأكيد</h3><p style='margin-bottom:14px;line-height:1.7'>" + esc(text) + '</p><div style="display:flex;gap:10px"><button class="btn" id="cf-yes" style="flex:1" type="button">تأكيد</button><button class="btn ghost" id="cf-no" style="flex:1" type="button">إلغاء</button></div>');
    $("cf-yes").onclick = function () { closeSheet(); if (typeof yes === "function") yes(); };
    $("cf-no").onclick = closeSheet;
  }

  /* ========= 13. الإشعارات ========= */
  function openNotifs() {
    var html = "<h3>🔔 الإشعارات</h3>";
    if (!S.notifs.length) html += '<div class="empty">لا توجد إشعارات</div>';
    S.notifs.forEach(function (n) {
      html += '<div class="row glass" style="margin-bottom:8px"><div style="font-size:24px">' + n.icon + '</div><div class="info"><div class="name" style="white-space:normal;font-weight:' + (n.read ? "normal" : "bold") + '">' + esc(n.text) + '</div><div class="meta">' + timeStr(n.t) + '</div></div><button class="btn sm ghost" data-delnotif="' + esc(n.id) + '" type="button">🗑</button></div>';
    });
    if (S.notifs.length) html += '<button class="btn red block" id="clear-notifs" type="button">مسح الكل</button>';
    openSheet(html);
    S.notifs.forEach(function (n) { n.read = true; });
    if (cloud.on && cloud.db) {
      S.notifs.forEach(function (n) {
        if (n.id && n.id.indexOf("u") !== 0) {
          cloud.db.ref("notifications/" + S.me.id + "/" + n.id + "/read").set(true).catch(function () { /* */ });
        }
      });
    }
    saveLocal(); renderTop();
    $("sheet").onclick = function (e) {
      var d = e.target.closest("[data-delnotif]");
      if (d) {
        var nid = d.getAttribute("data-delnotif");
        if (cloud.on && cloud.db && nid.indexOf("u") !== 0) {
          cloud.db.ref("notifications/" + S.me.id + "/" + nid).remove().catch(function () { /* */ });
        }
        S.notifs = S.notifs.filter(function (n) { return n.id !== nid; });
        saveLocal(); openNotifs(); return;
      }
      if (e.target.id === "clear-notifs") {
        if (cloud.on && cloud.db) cloud.db.ref("notifications/" + S.me.id).remove().catch(function () { /* */ });
        S.notifs = []; saveLocal(); openNotifs();
      }
    };
  }

  /* ========= 14. إنشاء ودخول ومغادرة الغرف ========= */
  function openCreateRoom() {
    var cats = Object.keys(CATEGORIES).map(function (k) { return '<option value="' + k + '">' + CATEGORIES[k] + "</option>"; }).join("");
    openSheet("<h3>🎙️ إنشاء غرفة 3D جديدة</h3>" +
      '<label>اسم الغرفة</label><input id="cr-name" maxlength="30" placeholder="مثال: سهرة الليل" />' +
      '<label>وصف الغرفة</label><input id="cr-desc" maxlength="80" placeholder="وصف قصير" />' +
      '<label>صورة الغرفة (اختياري)</label><input id="cr-rphoto" type="file" accept="image/*" />' +
      '<label>التصنيف</label><select id="cr-cat">' + cats + "</select>" +
      '<label>عدد المقاعد الدائرية</label><select id="cr-seats"><option value="4">4 مقاعد</option><option value="6">6 مقاعد</option><option value="9" selected>9 مقاعد</option><option value="12">12 مقعد</option></select>' +
      '<label>خلفية الغرفة من المعرض (اختياري)</label><input id="cr-bgfile" type="file" accept="image/*" />' +
      '<label>نوع الغرفة</label><select id="cr-priv"><option value="0">عامة</option><option value="1">خاصة (لا تظهر في القائمة)</option></select>' +
      '<button class="btn block" id="cr-ok" type="button">إنشاء الغرفة</button>');
    var selectedBgDataUrl = "";
    var selectedRoomPhotoUrl = "";

    $("cr-rphoto").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        selectedRoomPhotoUrl = await readImageFileAsDataUrl(f, 260, 0.72);
        toast("تم اختيار صورة الغرفة ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل الصورة");
      }
    };

    $("cr-bgfile").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        selectedBgDataUrl = await readImageFileAsDataUrl(f, 540, 0.58);
        toast("تم اختيار خلفية الغرفة ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل الخلفية");
      }
    };

    $("cr-ok").onclick = function () {
      var name = $("cr-name").value.trim();
      if (!name) { toast("اكتب اسم الغرفة أولاً"); return; }
      var n = Number($("cr-seats").value);
      var roomId = "r" + Math.random().toString(36).slice(2, 7);
      var initTheme = selectedBgDataUrl
        ? { id: "custom", name: "خلفية مخصصة", bgImage: selectedBgDataUrl, accent: "#ec4899" }
        : ROOM_THEMES[0];
      var room = {
        id: roomId, name: clean(name), desc: clean($("cr-desc").value.trim()), cat: $("cr-cat").value,
        owner: S.me.id, mods: [], seats: makeSeats(n, []), listeners: [], bans: [],
        priv: $("cr-priv").value === "1", locked: false, pinned: "", created: now(), msgs: [],
        color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length),
        roomPhoto: selectedRoomPhotoUrl,
        theme: initTheme, recvTop: {}
      };
      S.rooms.unshift(room);
      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + roomId).set({
          name: room.name, desc: room.desc, cat: room.cat, owner: room.owner,
          seatCount: n, priv: room.priv, locked: false,
          pinned: "", created: serverTs(), color: room.color, icon: room.icon,
          roomPhoto: room.roomPhoto,
          theme: initTheme
        }).catch(function () { /* */ });
      }
      S.me.ach.host = true;
      addXP(20);
      save(); closeSheet(); renderAll();
      toast("تم إنشاء الغرفة ✅");
      enterRoom(roomId, true);
    };
  }

  function applyRoomTheme(theme) {
    var rv = $("room-view");
    if (!rv) return;
    var t = theme || ROOM_THEMES[0];
    UI.theme = t;
    if (t.bgImage) {
      rv.style.backgroundImage = 'url("' + String(t.bgImage).replace(/"/g, '\\"') + '")';
      rv.style.backgroundSize = "cover";
      rv.style.backgroundPosition = "center";
      rv.style.backgroundRepeat = "no-repeat";
    } else {
      rv.style.backgroundImage = "none";
      rv.style.background = t.bg || ROOM_THEMES[0].bg;
    }
    document.documentElement.style.setProperty("--acc2", t.accent || "#ec4899");
  }

  function renderQuizBox() {
    var box = $("quiz-box");
    if (!box) return;
    var q = UI.quiz;
    if (!q || !q.active) {
      box.classList.add("hidden");
      box.innerHTML = "";
      return;
    }
    box.classList.remove("hidden");
    var myAns = q.answers && q.answers[S.me.id];
    var optsHtml = (q.opts || []).map(function (opt, idx) {
      var mark = myAns === idx ? " ✔" : "";
      return '<button class="btn sm ghost" data-quizans="' + idx + '" type="button">' + esc(opt) + mark + "</button>";
    }).join("");
    box.innerHTML = '<div><b>🧠 سؤال الغرفة:</b> ' + esc(q.q) + '</div><div class="quiz-opts">' + optsHtml + "</div>";
  }

  function enterRoom(id, skipPass, opts) {
    opts = opts || {};
    closeSheet();
    var room = getRoom(id);
    if (!room) { toast("الغرفة غير موجودة"); return; }
    if (room.bans.indexOf(S.me.id) >= 0) { toast("أنت محظور من هذه الغرفة 🚫"); return; }
    if (room.locked && room.owner !== S.me.id && !inRoom(room, S.me.id)) { toast("الغرفة مقفلة من المالك 🔒"); return; }

    if (UI.floatingRoomId && UI.floatingRoomId !== id) {
      var prevFloatRoom = getRoom(UI.floatingRoomId);
      if (prevFloatRoom) {
        var psi = seatIndexOf(prevFloatRoom, S.me.id);
        if (psi >= 0) { prevFloatRoom.seats[psi].uid = null; prevFloatRoom.seats[psi].muted = false; }
        prevFloatRoom.listeners = prevFloatRoom.listeners.filter(function (x) { return x !== S.me.id; });
        if (cloud.on && cloud.db) {
          var pUps = {};
          if (psi >= 0) pUps["rooms/" + prevFloatRoom.id + "/seats/" + psi + "/uid"] = null;
          pUps["rooms/" + prevFloatRoom.id + "/listeners/" + S.me.id] = null;
          cloud.db.ref().update(pUps).catch(function () { /* */ });
        }
      }
      UI.floatingRoomId = null;
      renderFloatingOrb();
    }

    if (UI.roomId && UI.roomId !== id) {
      leaveRoom(true, !!opts.keepVoiceAlive);
    }

    cleanup("room");
    musicState.roomXpEarned = 0;
    musicState.data = null;
    musicState.queue = [];
    UI.quiz = null;
    UI.roomSpeakerMuted = false;
    applyRoomSpeakerMuteState();
    applyRoomTheme(room.theme || ROOM_THEMES[0]);
    renderMusicMini();
    renderQuizBox();

    var wrap = $("entry-banner-wrap");
    if (wrap) wrap.innerHTML = "";

    if (!inRoom(room, S.me.id)) {
      if (room.listeners.indexOf(S.me.id) < 0) room.listeners.push(S.me.id);
      if (cloud.on && cloud.db) {
        var lRef = cloud.db.ref("rooms/" + id + "/listeners/" + S.me.id);
        try { lRef.onDisconnect().remove(); } catch (e0) { /* */ }
        lRef.set(true).catch(function () { /* */ });
      }
      pushRoomMsg(room, {
        sys: true,
        joinUser: { uid: S.me.id, name: S.me.name, photo: S.me.photo || "" },
        text: S.me.name + " دخل الغرفة 👋"
      });
      showEntryBanner(S.me);
      S.me.visits++;
      S.me.roomsJoined = (S.me.roomsJoined || 0) + 1;
      S.me.ach.first = true;
      addXP(5);
      completeTask("room", 25);
    }

    UI.roomId = id;
    UI.micMuted = false;
    save();
    $("room-view").classList.add("open");
    renderRoom();
    renderAll();

    trackTimer("room", setInterval(function () {
      if (!UI.roomId) return;
      S.me.roomSeconds = (S.me.roomSeconds || 0) + 60;
      if (musicState.roomXpEarned < 10) {
        musicState.roomXpEarned += 2;
        addXP(2);
      }
      save();
      renderTop();
      if (UI.page === "profile") renderProfile();
    }, 60 * 1000), "interval");

    if (cloud.on && cloud.db) {
      var msgsRef = cloud.db.ref("roomMessages/" + id).limitToLast(100);
      trackListener("room", msgsRef, "value", function (msnap) {
        var mv = msnap.val() || {};
        var arr = Object.keys(mv).map(function (k) {
          return Object.assign({ key: k }, mv[k]);
        });
        cloud.roomMsgs[id] = arr;
        var r = getRoom(id);
        if (r) r.msgs = arr;
        renderRoomChat();

        var last = arr[arr.length - 1];
        if (last && last.giftAnim && !cloud.seenFly[last.key] && (now() - (last.t || 0) < 8000)) {
          cloud.seenFly[last.key] = true;
          if (last.from !== S.me.id) {
            showFlyGiftToSeat(last.giftAnim.e, last.giftAnim.fromName, last.giftAnim.toUid, last.giftAnim.toName);
          }
        }
        if (last && last.joinUser && !cloud.seenJoin[last.key] && (now() - (last.t || 0) < 8000)) {
          cloud.seenJoin[last.key] = true;
          if (last.joinUser.uid !== S.me.id) {
            showEntryBanner(last.joinUser);
          }
        }
      });

      trackListener("room", cloud.db.ref("rooms/" + id + "/music"), "value", function (musSnap) {
        var m = musSnap.val() || null;
        if (m && m.url) {
          musicState.data = m;
          renderMusicMini();
          syncRoomMusicForEveryone(m);
        } else if (musicState.data && (!m || !m.url)) {
          musicState.data = null;
          renderMusicMini();
          stopMusicBroadcast();
        }
      });

      trackListener("room", cloud.db.ref("rooms/" + id + "/reactions").limitToLast(20), "child_added", function (rSnap) {
        var rv = rSnap.val();
        if (!rv || cloud.seenReact[rSnap.key]) return;
        cloud.seenReact[rSnap.key] = true;
        var ts = typeof rv.t === "number" ? rv.t : now();
        if (now() - ts <= 8000) {
          showFlyGiftToSeat(rv.emoji || "👏", rv.fromName || "مستخدم", rv.targetUid || "room", rv.targetName || "الغرفة");
        }
      });

      trackListener("room", cloud.db.ref("rooms/" + id + "/theme"), "value", function (thSnap) {
        var thVal = thSnap.val();
        if (thVal) {
          var rCur = getRoom(id);
          if (rCur) rCur.theme = thVal;
          applyRoomTheme(thVal);
        }
      });

      trackListener("room", cloud.db.ref("rooms/" + id + "/quiz/current"), "value", function (qzSnap) {
        var qVal = qzSnap.val();
        UI.quiz = (qVal && qVal.active) ? qVal : null;
        renderQuizBox();
      });
    }

    var initialRole = seatIndexOf(room, S.me.id) >= 0 ? "publisher" : "subscriber";
    joinVoiceChannel(id, initialRole);
  }

  function leaveRoom(silent, keepVoiceAlive) {
    closeSheet();
    cleanup("room");
    clearSeatDisconnectBinding();
    var rid = UI.roomId;
    var room = getRoom(rid);

    if (room) {
      var si = seatIndexOf(room, S.me.id);
      if (si >= 0) {
        room.seats[si].uid = null;
        room.seats[si].muted = false;
      }
      room.listeners = room.listeners.filter(function (x) { return x !== S.me.id; });
      if (cloud.on && cloud.db) {
        var ups = {};
        if (si >= 0) {
          ups["rooms/" + rid + "/seats/" + si + "/uid"] = null;
          ups["rooms/" + rid + "/seats/" + si + "/muted"] = false;
        }
        ups["rooms/" + rid + "/listeners/" + S.me.id] = null;
        if (musicState.data && musicState.data.djUid === S.me.id) {
          ups["rooms/" + rid + "/music/djUid"] = null;
          ups["rooms/" + rid + "/music/paused"] = true;
        }
        cloud.db.ref().update(ups).catch(function () { /* */ });
      }
      pushRoomMsg(room, { sys: true, text: S.me.name + " غادر الغرفة" });
    }

    UI.roomId = null;
    if (!keepVoiceAlive) {
      UI.floatingRoomId = null;
      renderFloatingOrb();
      musicState.data = null;
      musicState.queue = [];
    }
    applyRoomTheme(ROOM_THEMES[0]);
    saveLocal();
    $("room-view").classList.remove("open");

    if (!keepVoiceAlive) {
      leaveVoiceChannel();
    }
    if (!silent) renderAll();
  }

  /* ========= 15. رسم الغرفة والمقاعد الدائرية 3D والدردشة ========= */
  function renderRoomPresenceStrip(room) {
    var ids = getRoomParticipantIds(room);
    var cntEl = $("room-online-count");
    var stripEl = $("room-avatars-strip");
    if (cntEl) cntEl.textContent = String(ids.length);
    if (!stripEl) return;

    var maxShow = 3;
    var shown = ids.slice(0, maxShow);
    var extra = ids.length - shown.length;

    var html = shown.map(function (uidItem) {
      var u = getUser(uidItem);
      var inner = u.photo
        ? '<img src="' + esc(u.photo) + '" alt="' + esc(u.name || "") + '" />'
        : esc(initials(u.name));
      return '<span class="room-mini-av" title="' + esc(u.name) + '">' + inner + "</span>";
    }).join("");

    if (extra > 0) {
      html += '<span class="room-mini-more">+' + extra + "</span>";
    }
    stripEl.innerHTML = html;
  }

  function renderRoom() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var mySeat = seatIndexOf(room, S.me.id);

    $("room-title").textContent = room.name;
    $("room-right-id").textContent = "ID: " + displayUserId(S.me);

    var thumbInner = $("room-top-thumb-inner");
    if (thumbInner) {
      if (room.roomPhoto) {
        thumbInner.innerHTML = '<img src="' + esc(room.roomPhoto) + '" alt="' + esc(room.name || "room") + '" />';
      } else {
        thumbInner.textContent = COVER_ICONS[(room.icon || 0) % COVER_ICONS.length];
      }
    }

    renderRoomPresenceStrip(room);

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
        var uNum = u.num || hashNum(s.uid);
        var isMuted = s.muted || (s.uid === S.me.id && UI.micMuted);
        var isSpeaking = !isMuted && !!voice.speakingNums[uNum];
        cls += " occ" + (u.vip > 0 || s.vip ? " vip" : "") + (isSpeaking ? " speak" : "");
        inner = avatarInnerHTML(u);
        name = esc(u.name);
        sub = s.uid === room.owner ? "👑 المالك" : (room.mods.indexOf(s.uid) >= 0 ? "🛡️ مشرف" : (u.me ? "أنت" : "Lv." + (u.level || 1)));
      } else if (s.locked) {
        cls += " locked"; inner = "🔒"; name = "مقفل"; sub = "مقعد " + (i + 1);
      } else {
        inner = s.vip ? "👑" : "🎙️"; name = "مقعد " + (i + 1); sub = s.vip ? "VIP" : "فارغ";
      }

      var isSeatMuted = s.uid && (s.muted || (s.uid === S.me.id && UI.micMuted));
      return '<div class="' + cls + '" data-seat="' + i + '">' +
        '<div class="seat-orb" data-seat-avatar="' + i + '">' +
          '<span class="seat-num-badge">' + (i + 1) + "</span>" +
          '<div class="seatav">' + inner + "</div>" +
          (isSeatMuted ? '<span class="mutedmark">🔇</span>' : "") +
        "</div>" +
        '<div class="seat-meta-pill">' +
          '<div class="seatname">' + name + "</div>" +
          '<div class="seatsub">' + sub + "</div>" +
        "</div>" +
      "</div>";
    }).join("");

    var mic = $("mic-btn");
    if (mic) {
      var onSeat = mySeat >= 0;
      var adminMuted = onSeat && room.seats[mySeat].muted;
      var effectiveMuted = UI.micMuted || adminMuted;
      mic.classList.remove("mic-on", "mic-off", "mic-idle");
      if (!onSeat) {
        mic.classList.add("mic-idle");
        mic.textContent = "🎙️";
        mic.title = "اضغط للصعود على المايك";
      } else if (effectiveMuted) {
        mic.classList.add("mic-off");
        mic.textContent = "🔇";
        mic.title = "فتح المايك";
      } else {
        mic.classList.add("mic-on");
        mic.textContent = "🎤";
        mic.title = "كتم المايك";
      }
    }

    applyRoomSpeakerMuteState();
    renderMusicMini();
    renderQuizBox();
    renderRoomChat();
  }

  function renderRoomChat() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var box = $("room-chat");
    var stick = box.scrollTop + box.clientHeight >= box.scrollHeight - 48;
    box.innerHTML = (room.msgs || []).map(function (m, i) {
      if (m.sys) return '<div class="msg sys">' + esc(m.text) + "</div>";
      var u = getUser(m.from), me = m.from === S.me.id;
      var body = "";
      if (m.sticker) body = '<div style="font-size:38px;line-height:1.1">' + esc(m.sticker) + '</div><div class="small">' + esc(m.text || "") + "</div>";
      else if (m.img) body = '<img src="' + esc(m.img) + '" alt="صورة" style="max-width:190px;max-height:170px;border-radius:10px;display:block" />';
      else body = esc(m.text);

      return '<div class="msg ' + (me ? "me" : "") + '"' + (me ? ' data-delmsg="' + esc(m.key || String(i)) + '"' : "") + '><div class="who">' + userNameHTML(u) + "</div>" + body + '<div class="tm">' + timeStr(m.t) + (me ? " • اضغط للحذف" : "") + "</div></div>";
    }).join("");
    if (stick) box.scrollTop = box.scrollHeight;
  }

  function sendRoomMsg(text, extra) {
    var room = getRoom(UI.roomId);
    text = String(text || "").trim();
    if (!room || (!text && (!extra || (!extra.img && !extra.sticker)))) return;
    var msg = Object.assign({ from: S.me.id, text: clean(text) }, extra || {});
    pushRoomMsg(room, msg);
    S.me.msgCount = (S.me.msgCount || 0) + 1;
    if (S.me.msgCount >= 5) S.me.ach.chatter = true;
    addXP(2);
    completeTask("msg", 25);
    save(); renderTop();
  }

  /* ========= 16. إدارة المقاعد والمايك + نافذة البروفايل الخفيفة داخل الغرفة ========= */
  function findFirstFreeSeatIndex(room) {
    if (!room || !Array.isArray(room.seats)) return -1;
    for (var i = 0; i < room.seats.length; i++) {
      if (!room.seats[i].uid && !room.seats[i].locked) return i;
    }
    return -1;
  }

  function stepOffSeat(room, seatIdx) {
    if (!room || !room.seats[seatIdx]) return;
    UI.micMuted = false;
    clearSeatDisconnectBinding();
    stopLocalMic();
    room.seats[seatIdx].uid = null;
    room.seats[seatIdx].muted = false;
    if (room.listeners.indexOf(S.me.id) < 0) room.listeners.push(S.me.id);
    if (cloud.on && cloud.db) {
      var ups = {};
      ups["rooms/" + room.id + "/seats/" + seatIdx + "/uid"] = null;
      ups["rooms/" + room.id + "/seats/" + seatIdx + "/muted"] = false;
      ups["rooms/" + room.id + "/listeners/" + S.me.id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
    }
    saveLocal();
    renderRoom();
    toast("تم النزول من المايك ⬇️");
  }

  function openSeatUserProfile(seatIdx) {
    var room = getRoom(UI.roomId);
    if (!room || !room.seats[seatIdx]) return;
    var s = room.seats[seatIdx];
    var targetUid = s.uid;
    if (!targetUid) return;

    cleanup("seat_profile");
    UI.activeSeatProfileUid = targetUid;
    UI.activeSeatProfileIdx = seatIdx;

    function buildAndRender(userData) {
      var curRoom = getRoom(UI.roomId);
      if (!curRoom || !curRoom.seats[seatIdx] || curRoom.seats[seatIdx].uid !== targetUid) {
        closeSheet();
        return;
      }
      var curSeat = curRoom.seats[seatIdx];
      var u = Object.assign({}, getUser(targetUid), userData || {});
      var spId = displayUserId(u);
      var isSelf = targetUid === S.me.id;
      var myRole = role(curRoom, S.me.id);
      var canManage = myRole === "owner" || myRole === "mod";
      var isTargetOwner = targetUid === curRoom.owner;
      var isTargetMod = curRoom.mods.indexOf(targetUid) >= 0;

      var isF = S.friends.indexOf(targetUid) >= 0;
      var isFol = S.follows.indexOf(targetUid) >= 0;
      var hasVip = (u.vip || 0) > 0;
      var lv = computeLevelFromXp(u.xp || 0);
      var intoXp = (u.xp || 0) % CONFIG.xpPerLevel;
      var xpPct = lv >= CONFIG.maxLevel ? 100 : (intoXp / CONFIG.xpPerLevel) * 100;
      var wMeta = getWealthRankMeta(u.wealth || 0);
      var cMeta = getCharmRankMeta(u.charm || 0);

      var uNum = u.num || hashNum(targetUid);
      var isSeatMuted = !!(curSeat.muted || (isSelf && UI.micMuted));
      var isSpeaking = !isSeatMuted && !!voice.speakingNums[uNum];

      var showCeleb = !isSelf && (hasVip || lv >= 20) && !UI.celebratedProfiles[targetUid];
      if (showCeleb) UI.celebratedProfiles[targetUid] = true;

      var actionsHtml = "";
      if (isSelf) {
        actionsHtml =
          '<div class="social-grid">' +
            '<button class="btn sm" data-sp="fullme" type="button">👤 الملف الشخصي الكامل</button>' +
            '<button class="btn sm ghost" data-sp="leave_seat" type="button">⬇️ النزول من المقعد</button>' +
          "</div>";
      } else {
        actionsHtml =
          '<div class="social-grid">' +
            '<button class="btn sm ' + (isFol ? "ghost" : "") + '" data-sp="follow" type="button">' + (isFol ? "✔ متابَع" : "➕ متابعة") + "</button>" +
            '<button class="btn sm" data-sp="dm" type="button">💬 رسالة</button>' +
            (isF
              ? '<button class="btn sm ghost" data-sp="unfriend" type="button">💔 صديق</button>'
              : (S.sentReq.indexOf(targetUid) >= 0
                ? '<button class="btn sm ghost" data-sp="cancelreq" type="button">⏳ مرسل</button>'
                : '<button class="btn sm" data-sp="add" type="button">👥 إضافة صديق</button>')) +
            '<button class="btn sm ghost" data-sp="fullprofile" type="button">🪪 الملف الكامل</button>' +
          "</div>";

        if (canManage && !isTargetOwner && !(myRole === "mod" && isTargetMod)) {
          actionsHtml +=
            '<div style="display:flex;gap:6px;margin-top:8px">' +
              '<button class="btn sm ghost" style="flex:1" data-sp="admin_mute" type="button">' + (curSeat.muted ? "🔊 فك الكتم" : "🔇 كتم") + "</button>" +
              '<button class="btn sm ghost" style="flex:1" data-sp="admin_down" type="button">⬇️ إنزال</button>' +
              '<button class="btn sm red" style="flex:1" data-sp="admin_kick" type="button">🚫 طرد</button>' +
            "</div>";
        }
      }

      var html =
        '<div class="room-mini-profile">' +
          (showCeleb ? '<div style="text-align:center"><span class="celeb-banner">✨ عضو مميز: ' + esc(u.name) + " ✨</span></div>" : "") +
          '<div class="rmp-header">' +
            '<div class="frame ' + (hasVip ? "vip-frame" : "") + '" style="flex-shrink:0">' + avatarHTML(u, "md") + "</div>" +
            '<div class="rmp-info">' +
              '<div class="rmp-name">' +
                '<span>' + esc(u.name) + "</span>" +
                levelBadgeHTML(lv) +
                (hasVip ? '<span class="tag vip">VIP ' + u.vip + "</span>" : "") +
              "</div>" +
              '<div class="rmp-sub">' +
                '<span>' + esc(u.country || "🌍") + "</span>" +
                '<span>•</span>' +
                '<span>ID: <b>' + esc(spId) + "</b></span>" +
                copyBtnHTML(spId, "📋") +
              "</div>" +
              '<div class="seat-status-pills">' +
                '<span class="seat-pill">🪑 مقعد #' + (seatIdx + 1) + "</span>" +
                '<span id="sp-live-speak-pill" class="seat-pill ' + (isSeatMuted ? "muted" : (isSpeaking ? "live" : "")) + '">' +
                  (isSeatMuted ? "🔇 مكتوم" : (isSpeaking ? "🎙️ يتحدث" : "🎤 هادئ")) +
                "</span>" +
              "</div>" +
            "</div>" +
          "</div>" +

          '<div class="rmp-metrics">' +
            '<div class="rmp-metric"><b>Lv.' + lv + "</b><span>المستوى (" + (u.xp || 0) + " XP)</span></div>" +
            '<div class="rmp-metric"><b>' + wMeta.value + "</b><span>" + wMeta.rank.icon + " " + esc(wMeta.rank.name) + "</span></div>" +
            '<div class="rmp-metric"><b>' + cMeta.value + "</b><span>" + cMeta.rank.icon + " " + esc(cMeta.rank.name) + "</span></div>" +
          "</div>" +

          '<div class="rmp-prog-row">' +
            '<div style="display:flex;justify-content:space-between"><span>تقدم المستوى التالي</span><span>' + (lv >= CONFIG.maxLevel ? "100%" : (intoXp + "/" + CONFIG.xpPerLevel + " XP")) + "</span></div>" +
            '<div class="bar"><i style="width:' + xpPct + '%"></i></div>' +
          "</div>" +

          actionsHtml +
        "</div>";

      openSheet(html);

      $("sheet").onclick = function (e) {
        var cpBtn = e.target.closest("[data-copyval]");
        if (cpBtn) {
          e.stopPropagation();
          copyText(cpBtn.getAttribute("data-copyval"), "تم نسخ User ID (" + spId + ") 📋");
          return;
        }
        var btn = e.target.closest("[data-sp]");
        if (!btn) return;
        var act = btn.getAttribute("data-sp");

        if (act === "fullme") {
          closeSheet();
          leaveRoom(false);
          go("profile");
        } else if (act === "leave_seat") {
          closeSheet();
          stepOffSeat(curRoom, seatIdx);
        } else if (act === "follow") {
          if (isFol) {
            S.follows = S.follows.filter(function (x) { return x !== targetUid; });
            if (cloud.on && cloud.db) {
              cloud.db.ref("social/" + S.me.id + "/follows/" + targetUid).remove().catch(function () { /* */ });
              cloud.db.ref("users/" + targetUid + "/followers").transaction(function (c) { return Math.max(0, (c || 0) - 1); }).catch(function () { /* */ });
            }
            toast("تم إلغاء المتابعة");
          } else {
            S.follows.push(targetUid);
            if (cloud.on && cloud.db) {
              cloud.db.ref("social/" + S.me.id + "/follows/" + targetUid).set(true).catch(function () { /* */ });
              cloud.db.ref("users/" + targetUid + "/followers").transaction(function (c) { return (c || 0) + 1; }).catch(function () { /* */ });
              addNotif("➕", S.me.name + " بدأ بمتابعتك.", targetUid);
            }
            toast("تمت المتابعة ✅");
          }
          saveLocal();
          renderTop();
          buildAndRender(u);
        } else if (act === "add") {
          sendFriendReq(targetUid);
          buildAndRender(u);
        } else if (act === "cancelreq") {
          S.sentReq = S.sentReq.filter(function (x) { return x !== targetUid; });
          if (cloud.on && cloud.db) {
            var upsReq = {};
            upsReq["social/" + S.me.id + "/sentReq/" + targetUid] = null;
            upsReq["social/" + targetUid + "/requests/" + S.me.id] = null;
            cloud.db.ref().update(upsReq).catch(function () { /* */ });
          }
          saveLocal();
          buildAndRender(u);
        } else if (act === "unfriend") {
          S.friends = S.friends.filter(function (x) { return x !== targetUid; });
          if (cloud.on && cloud.db) {
            var upsUnf = {};
            upsUnf["social/" + S.me.id + "/friends/" + targetUid] = null;
            upsUnf["social/" + targetUid + "/friends/" + S.me.id] = null;
            cloud.db.ref().update(upsUnf).catch(function () { /* */ });
          }
          saveLocal();
          toast("تم حذف الصديق");
          buildAndRender(u);
        } else if (act === "dm") {
          closeSheet();
          openDM(targetUid);
        } else if (act === "fullprofile") {
          closeSheet();
          openProfile(targetUid);
        } else if (act === "admin_mute") {
          curRoom.seats[seatIdx].muted = !curRoom.seats[seatIdx].muted;
          if (cloud.on && cloud.db) {
            cloud.db.ref("rooms/" + curRoom.id + "/seats/" + seatIdx + "/muted").set(curRoom.seats[seatIdx].muted).catch(function () { /* */ });
          }
          saveLocal();
          renderRoom();
          toast(curRoom.seats[seatIdx].muted ? "تم كتم " + u.name + " 🔇" : "تم إلغاء الكتم 🔊");
          buildAndRender(u);
        } else if (act === "admin_down") {
          curRoom.seats[seatIdx].uid = null;
          curRoom.seats[seatIdx].muted = false;
          if (curRoom.listeners.indexOf(targetUid) < 0) curRoom.listeners.push(targetUid);
          if (cloud.on && cloud.db) {
            var upsDown = {};
            upsDown["rooms/" + curRoom.id + "/seats/" + seatIdx + "/uid"] = null;
            upsDown["rooms/" + curRoom.id + "/seats/" + seatIdx + "/muted"] = false;
            upsDown["rooms/" + curRoom.id + "/listeners/" + targetUid] = true;
            cloud.db.ref().update(upsDown).catch(function () { /* */ });
          }
          saveLocal();
          renderRoom();
          toast("تم إنزال " + u.name + " من المقعد ⬇️");
          closeSheet();
        } else if (act === "admin_kick") {
          curRoom.seats[seatIdx].uid = null;
          curRoom.seats[seatIdx].muted = false;
          curRoom.listeners = curRoom.listeners.filter(function (x) { return x !== targetUid; });
          if (curRoom.bans.indexOf(targetUid) < 0) curRoom.bans.push(targetUid);
          if (cloud.on && cloud.db) {
            var upsKick = {};
            upsKick["rooms/" + curRoom.id + "/seats/" + seatIdx + "/uid"] = null;
            upsKick["rooms/" + curRoom.id + "/seats/" + seatIdx + "/muted"] = false;
            upsKick["rooms/" + curRoom.id + "/listeners/" + targetUid] = null;
            upsKick["rooms/" + curRoom.id + "/bans/" + targetUid] = true;
            cloud.db.ref().update(upsKick).catch(function () { /* */ });
          }
          pushRoomMsg(curRoom, { sys: true, text: "تم طرد " + u.name + " من الغرفة" });
          saveLocal();
          renderRoom();
          toast("تم طرد " + u.name + " 🚫");
          closeSheet();
        }
      };
    }

    buildAndRender(getUser(targetUid));

    if (cloud.on && cloud.db && targetUid !== S.me.id) {
      var liveRef = cloud.db.ref("users/" + targetUid);
      trackListener("seat_profile", liveRef, "value", function (snap) {
        var val = snap.val();
        if (val && UI.activeSeatProfileUid === targetUid) {
          buildAndRender(Object.assign({ id: targetUid }, val));
        }
      });
    }
  }

  function handleMicButtonClick() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var mySeat = seatIndexOf(room, S.me.id);

    if (mySeat < 0) {
      var freeIdx = findFirstFreeSeatIndex(room);
      if (freeIdx < 0) {
        toast("لا يوجد مقعد فارغ حالياً");
        return;
      }
      var prevSeat = seatIndexOf(room, S.me.id);
      if (prevSeat >= 0) {
        room.seats[prevSeat].uid = null;
        room.seats[prevSeat].muted = false;
      }
      room.seats[freeIdx].uid = S.me.id;
      room.seats[freeIdx].muted = false;
      room.listeners = room.listeners.filter(function (x) { return x !== S.me.id; });
      UI.micMuted = false;

      if (cloud.on && cloud.db) {
        var ups = {};
        if (prevSeat >= 0) {
          ups["rooms/" + room.id + "/seats/" + prevSeat + "/uid"] = null;
          ups["rooms/" + room.id + "/seats/" + prevSeat + "/muted"] = false;
        }
        ups["rooms/" + room.id + "/seats/" + freeIdx + "/uid"] = S.me.id;
        ups["rooms/" + room.id + "/seats/" + freeIdx + "/muted"] = false;
        ups["rooms/" + room.id + "/listeners/" + S.me.id] = null;
        cloud.db.ref().update(ups).catch(function () { /* */ });
        bindSeatDisconnect(room.id, freeIdx);
      }

      addXP(3);
      completeTask("mic", 25);
      save();
      renderRoom();
      joinVoiceChannel(room.id, "publisher");
      toast("صعدت على المقعد #" + (freeIdx + 1) + " — المايك مفتوح 🎤");
      return;
    }

    if (room.seats[mySeat].muted) {
      toast("أنت مكتوم من إدارة الغرفة 🔇");
      return;
    }
    UI.micMuted = !UI.micMuted;
    renderRoom();
    syncMicHardwareState();
    toast(UI.micMuted ? "تم كتم المايك 🔇" : "تم فتح المايك 🎤");
  }

  function clickSeat(i) {
    var room = getRoom(UI.roomId);
    if (!room || !room.seats[i]) return;
    var s = room.seats[i], myRole = role(room, S.me.id), canManage = myRole === "owner" || myRole === "mod";

    if (s.uid) {
      openSeatUserProfile(i);
      return;
    }

    var items = [];
    if (!s.locked && (!s.vip || (S.me.vip || 0) > 0 || canManage)) {
      items.push({
        label: "🎤 الصعود على المقعد #" + (i + 1),
        fn: function () {
          var prevSeat = seatIndexOf(room, S.me.id);
          if (prevSeat >= 0) {
            room.seats[prevSeat].uid = null;
            room.seats[prevSeat].muted = false;
          }
          room.seats[i].uid = S.me.id;
          room.seats[i].muted = false;
          room.listeners = room.listeners.filter(function (x) { return x !== S.me.id; });
          UI.micMuted = false;

          if (cloud.on && cloud.db) {
            var ups = {};
            if (prevSeat >= 0) {
              ups["rooms/" + room.id + "/seats/" + prevSeat + "/uid"] = null;
              ups["rooms/" + room.id + "/seats/" + prevSeat + "/muted"] = false;
            }
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = S.me.id;
            ups["rooms/" + room.id + "/seats/" + i + "/muted"] = false;
            ups["rooms/" + room.id + "/listeners/" + S.me.id] = null;
            cloud.db.ref().update(ups).catch(function () { /* */ });
            bindSeatDisconnect(room.id, i);
          }

          addXP(3);
          completeTask("mic", 25);
          save();
          renderRoom();
          joinVoiceChannel(room.id, "publisher");
          toast("أنت الآن على المقعد #" + (i + 1) + " 🎤");
        }
      });
    } else if (s.locked) {
      toast("هذا المقعد مقفل 🔒");
    } else {
      toast("هذا المقعد مخصص لأعضاء VIP 👑");
    }

    if (canManage) {
      items.push({
        label: s.locked ? "🔓 فتح قفل المقعد" : "🔒 قفل المقعد",
        fn: function () {
          s.locked = !s.locked;
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + i + "/locked").set(s.locked).catch(function () { /* */ });
          saveLocal(); renderRoom();
        }
      });
    }
    if (!items.length) { toast("المقعد غير متاح حالياً"); return; }
    actionList("المقعد #" + (i + 1), items);
  }

  /* ========= 17. المتواجدون داخل الغرفة ========= */
  function openRoomParticipantsSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var ids = getRoomParticipantIds(room);
    var myRole = role(room, S.me.id);
    var canManage = myRole === "owner" || myRole === "mod";

    var html = "<h3>🎧 المتواجدون في الغرفة (" + ids.length + ")</h3>";
    if (!ids.length) {
      html += '<div class="empty">لا يوجد أعضاء متواجدون حالياً</div>';
    } else {
      ids.forEach(function (uidItem) {
        var u = getUser(uidItem);
        var spId = displayUserId(u);
        var sIdx = seatIndexOf(room, uidItem);
        var locTxt = sIdx >= 0 ? "🪑 مقعد #" + (sIdx + 1) : "👂 مستمع";
        var isSelf = uidItem === S.me.id;
        var isTargetOwner = uidItem === room.owner;
        var isTargetMod = room.mods.indexOf(uidItem) >= 0;

        var btns = '<button class="btn sm ghost" data-partprofile="' + esc(uidItem) + '" type="button">ملف</button>';
        if (!isSelf) {
          btns += '<button class="btn sm" data-partdm="' + esc(uidItem) + '" type="button">💬</button>';
          if (canManage && !isTargetOwner && !(myRole === "mod" && isTargetMod)) {
            btns += '<button class="btn sm red" data-partkick="' + esc(uidItem) + '" type="button">طرد</button>';
          }
        }
        html += '<div class="row glass" style="margin-bottom:8px">' +
          avatarHTML(u, "sm") +
          '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + locTxt + " • ID: " + esc(spId) + "</div></div>" +
          copyBtnHTML(spId, "📋") + btns + "</div>";
      });
    }
    openSheet(html);

    $("sheet").onclick = function (e) {
      var cpBtn = e.target.closest("[data-copyval]");
      if (cpBtn) {
        e.stopPropagation();
        copyText(cpBtn.getAttribute("data-copyval"), "تم نسخ User ID 📋");
        return;
      }
      var pBtn = e.target.closest("[data-partprofile]");
      if (pBtn) { closeSheet(); openProfile(pBtn.getAttribute("data-partprofile")); return; }
      var dBtn = e.target.closest("[data-partdm]");
      if (dBtn) { closeSheet(); openDM(dBtn.getAttribute("data-partdm")); return; }
      var kBtn = e.target.closest("[data-partkick]");
      if (kBtn) {
        var targetId = kBtn.getAttribute("data-partkick");
        var targetU = getUser(targetId);
        var si = seatIndexOf(room, targetId);
        if (si >= 0) { room.seats[si].uid = null; room.seats[si].muted = false; }
        room.listeners = room.listeners.filter(function (x) { return x !== targetId; });
        if (room.bans.indexOf(targetId) < 0) room.bans.push(targetId);
        if (cloud.on && cloud.db) {
          var ups = {};
          if (si >= 0) {
            ups["rooms/" + room.id + "/seats/" + si + "/uid"] = null;
            ups["rooms/" + room.id + "/seats/" + si + "/muted"] = false;
          }
          ups["rooms/" + room.id + "/listeners/" + targetId] = null;
          ups["rooms/" + room.id + "/bans/" + targetId] = true;
          cloud.db.ref().update(ups).catch(function () { /* */ });
        }
        pushRoomMsg(room, { sys: true, text: "تم طرد " + targetU.name + " من الغرفة" });
        saveLocal();
        renderRoom();
        toast("تم طرد " + targetU.name + " 🚫");
        openRoomParticipantsSheet();
      }
    };
  }

  /* ========= 18. المزايا التفاعلية للغرفة ========= */
  function openRoomThemeSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var cards = ROOM_THEMES.map(function (th, idx) {
      return '<button class="btn sm ghost" data-thidx="' + idx + '" style="flex:1" type="button">' + esc(th.name) + "</button>";
    }).join("");
    openSheet("<h3>🎨 خلفية الغرفة 3D</h3>" +
      '<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:10px">' + cards + "</div>" +
      '<label>أو اختر صورة خلفية من جهازك</label><input id="th-file" type="file" accept="image/*" />');

    $("sheet").querySelectorAll("[data-thidx]").forEach(function (b) {
      b.onclick = function () {
        var chosen = ROOM_THEMES[Number(b.getAttribute("data-thidx"))] || ROOM_THEMES[0];
        room.theme = chosen;
        applyRoomTheme(chosen);
        if (cloud.on && cloud.db) {
          cloud.db.ref("rooms/" + room.id + "/theme").set(chosen).catch(function () { /* */ });
        }
        saveLocal();
        closeSheet();
        toast("تم تغيير خلفية الغرفة ✅");
      };
    });

    $("th-file").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        var b64 = await readImageFileAsDataUrl(f, 540, 0.58);
        var customTheme = { id: "custom", name: "خلفية مخصصة", bgImage: b64, accent: "#ec4899" };
        room.theme = customTheme;
        applyRoomTheme(customTheme);
        if (cloud.on && cloud.db) {
          cloud.db.ref("rooms/" + room.id + "/theme").set(customTheme).catch(function () { /* */ });
        }
        saveLocal();
        closeSheet();
        toast("تم تطبيق صورة الخلفية ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل الصورة");
      }
    };
  }

  function openRoomGamesSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    openSheet("<h3>🎲 ألعاب الغرفة</h3><div class='actlist'>" +
      '<button id="g-dice" type="button">🎲 رمي النرد (1 - 6)</button>' +
      '<button id="g-tod" type="button">🎭 صراحة أو تحدٍ</button>' +
      '<button id="g-quiz" type="button">🧠 إطلاق سؤال ثقافي سريع</button>' +
      '<button data-act="cancel" type="button">إلغاء</button></div>');

    $("g-dice").onclick = function () {
      var val = Math.floor(Math.random() * 6) + 1;
      closeSheet();
      sendRoomMsg("🎲 رمى النرد وحصل على الرقم: " + val);
    };
    $("g-tod").onclick = function () {
      var pick = TRUTH_OR_DARE[Math.floor(Math.random() * TRUTH_OR_DARE.length)];
      closeSheet();
      sendRoomMsg("🎭 " + pick);
    };
    $("g-quiz").onclick = function () {
      var qItem = QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];
      var qObj = { active: true, q: qItem.q, opts: qItem.opts, ans: qItem.ans, answers: {} };
      UI.quiz = qObj;
      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + room.id + "/quiz/current").set(qObj).catch(function () { /* */ });
      }
      closeSheet();
      renderQuizBox();
      toast("تم إطلاق سؤال في الغرفة 🧠");
    };
    var cancelBtn = $("sheet").querySelector('[data-act="cancel"]');
    if (cancelBtn) cancelBtn.onclick = closeSheet;
  }

  function openRoomStickersSheet() {
    var html = "<h3>🎭 الملصقات والتفاعلات</h3><div class='giftgrid'>" +
      STICKERS.map(function (st) {
        return '<div class="gift" data-st="' + st.id + '"><div class="e">' + st.e + "</div><small>" + esc(st.n) + "</small></div>";
      }).join("") + "</div>";
    openSheet(html);
    $("sheet").querySelectorAll("[data-st]").forEach(function (el) {
      el.onclick = function () {
        var st = STICKERS.filter(function (x) { return x.id === el.getAttribute("data-st"); })[0];
        closeSheet();
        if (!st) return;
        sendRoomMsg(st.n, { sticker: st.e });
        showFlyGiftToSeat(st.e, S.me.name, "room", "الغرفة");
        if (cloud.on && cloud.db && UI.roomId) {
          cloud.db.ref("rooms/" + UI.roomId + "/reactions").push({
            emoji: st.e, fromName: S.me.name, targetUid: "room", targetName: "الغرفة", t: serverTs()
          }).catch(function () { /* */ });
        }
      };
    });
  }

  /* ========= 19. قائمة وخيارات الغرفة ========= */
  function openRoomMenu() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var r = role(room, S.me.id);
    var items = [
      { label: "⭕ تصغير الغرفة لدائرة متحركة", fn: minimizeRoomToFloatingOrb },
      { label: "🎧 المتواجدون في الغرفة (" + count(room) + ")", fn: openRoomParticipantsSheet },
      { label: "🎵 الموسيقى", fn: openMusicSheet },
      { label: "🎨 خلفية الغرفة", fn: openRoomThemeSheet },
      { label: "🎲 ألعاب الغرفة", fn: openRoomGamesSheet }
    ];
    if (seatIndexOf(room, S.me.id) >= 0) {
      items.push({
        label: "⬇️ النزول من المقعد",
        fn: function () {
          var si = seatIndexOf(room, S.me.id);
          if (si >= 0) stepOffSeat(room, si);
        }
      });
    }

    if (r === "owner" || r === "mod") {
      items.push({
        label: room.locked ? "🔓 فتح قفل الغرفة" : "🔒 قفل الغرفة",
        fn: function () {
          room.locked = !room.locked;
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/locked").set(room.locked).catch(function () { /* */ });
          saveLocal();
          toast(room.locked ? "تم قفل الغرفة 🔒" : "تم فتح الغرفة 🔓");
        }
      });
      items.push({
        label: "📌 تثبيت إعلان",
        fn: function () {
          openSheet("<h3>📌 تثبيت إعلان</h3><input id='pn-t' maxlength='120' value='" + esc(room.pinned) + "' placeholder='اكتب نص الإعلان...' /><button class='btn block' id='pn-ok' type='button'>حفظ</button>");
          $("pn-ok").onclick = function () {
            room.pinned = clean($("pn-t").value.trim());
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/pinned").set(room.pinned).catch(function () { /* */ });
            saveLocal(); closeSheet(); renderRoom(); toast("تم حفظ الإعلان");
          };
        }
      });
    }

    if (r === "owner") {
      items.push({
        label: "✏️ تعديل الغرفة",
        fn: function () {
          var cats = Object.keys(CATEGORIES).map(function (k) { return '<option value="' + k + '"' + (room.cat === k ? " selected" : "") + ">" + CATEGORIES[k] + "</option>"; }).join("");
          openSheet("<h3>✏️ تعديل الغرفة</h3><label>الاسم</label><input id='er-n' maxlength='30' value='" + esc(room.name) + "' /><label>الوصف</label><input id='er-d' maxlength='80' value='" + esc(room.desc) + "' /><label>صورة الغرفة</label><input id='er-photo' type='file' accept='image/*' /><label>التصنيف</label><select id='er-c'>" + cats + "</select><button class='btn block' id='er-ok' type='button'>حفظ التعديلات</button>");
          var newPhoto = room.roomPhoto || "";
          $("er-photo").onchange = async function () {
            var f = this.files && this.files[0];
            if (!f) return;
            try {
              newPhoto = await readImageFileAsDataUrl(f, 260, 0.72);
              toast("تم اختيار الصورة الجديدة ✅");
            } catch (err) {
              toast(err.message || "تعذر تحميل الصورة");
            }
          };
          $("er-ok").onclick = function () {
            var n = $("er-n").value.trim(); if (!n) return;
            room.name = clean(n); room.desc = clean($("er-d").value.trim()); room.cat = $("er-c").value; room.roomPhoto = newPhoto;
            if (cloud.on && cloud.db) {
              cloud.db.ref("rooms/" + room.id).update({ name: room.name, desc: room.desc, cat: room.cat, roomPhoto: room.roomPhoto }).catch(function () { /* */ });
            }
            saveLocal(); closeSheet(); renderRoom(); renderAll(); toast("تم التحديث ✅");
          };
        }
      });
      items.push({
        label: "🗑️ حذف الغرفة", danger: true,
        fn: function () {
          confirmBox("هل أنت متأكد من حذف الغرفة نهائياً؟", function () {
            var rid = room.id;
            leaveRoom(true);
            S.rooms = S.rooms.filter(function (x) { return x.id !== rid; });
            if (cloud.on && cloud.db) {
              cloud.db.ref("rooms/" + rid).remove().catch(function () { /* */ });
              cloud.db.ref("roomMessages/" + rid).remove().catch(function () { /* */ });
            }
            saveLocal(); renderAll(); toast("تم حذف الغرفة");
          });
        }
      });
    }

    items.push({ label: "🚪 مغادرة الغرفة", danger: true, fn: function () { leaveRoom(false); } });
    actionList("خيارات الغرفة", items);
  }

  /* ========= 20. إرسال الهدايا وتحديث الثروة والجاذبية والمستوى ========= */
  function openGiftSheet(preselectUid) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    UI.giftTarget = preselectUid || UI.giftTarget || "room";

    var seatedIds = [];
    (room.seats || []).forEach(function (s) {
      if (s && s.uid && s.uid !== S.me.id && seatedIds.indexOf(s.uid) < 0) {
        seatedIds.push(s.uid);
      }
    });

    var targetsHtml = '<button type="button" class="gt-chip ' + (UI.giftTarget === "room" ? "sel" : "") + '" data-gtarget="room">' +
      '<span class="gt-chip-av">🎙️</span><span>الغرفة كاملة</span></button>';

    seatedIds.forEach(function (uidItem) {
      var u = getUser(uidItem);
      var sel = UI.giftTarget === uidItem;
      var avInner = u.photo ? '<img src="' + esc(u.photo) + '" alt="" />' : esc(initials(u.name));
      targetsHtml += '<button type="button" class="gt-chip ' + (sel ? "sel" : "") + '" data-gtarget="' + esc(uidItem) + '">' +
        '<span class="gt-chip-av">' + avInner + "</span><span>" + esc(u.name) + "</span></button>";
    });

    openSheet("<h3>🎁 إرسال هدية</h3>" +
      '<div style="font-size:12px;color:var(--muted)">اختر المستهدف:</div>' +
      '<div class="gift-targets-bar" id="gt-bar">' + targetsHtml + "</div>" +
      '<div class="giftgrid">' +
      GIFTS.map(function (g) {
        var rule = getGiftEconomyRule(g);
        return '<div class="gift ' + (g.id === UI.giftSel ? "sel" : "") + '" data-gid="' + g.id + '">' +
          '<div class="e">' + g.e + "</div><small>" + g.n + '</small><div class="p">🪙 ' + g.p + "</div>" +
          '<div class="small" style="font-size:9.5px">✨+' + rule.charmGain + " • XP+" + rule.xpGain + "</div></div>";
      }).join("") +
      '</div><div style="display:flex;justify-content:space-between;font-size:12.5px;margin:6px 0"><span>رصيدك: <b>🪙 ' + S.me.coins + '</b></span><span>الثروة: <b>' + (S.me.wealth || 0) + '</b> • المستوى: <b>' + level() + '</b></span></div>' +
      '<button class="btn block" id="send-gift-ok" type="button">إرسال الهدية</button>');

    $("sheet").querySelectorAll("[data-gtarget]").forEach(function (tb) {
      tb.onclick = function () {
        UI.giftTarget = tb.getAttribute("data-gtarget");
        $("sheet").querySelectorAll("[data-gtarget]").forEach(function (x) {
          x.classList.toggle("sel", x.getAttribute("data-gtarget") === UI.giftTarget);
        });
      };
    });

    $("sheet").querySelectorAll("[data-gid]").forEach(function (el) {
      el.onclick = function () {
        UI.giftSel = el.getAttribute("data-gid");
        $("sheet").querySelectorAll("[data-gid]").forEach(function (x) { x.classList.toggle("sel", x.getAttribute("data-gid") === UI.giftSel); });
      };
    });

    $("send-gift-ok").onclick = function () {
      if (UI.giftSending) return;
      var g = GIFTS.filter(function (x) { return x.id === UI.giftSel; })[0] || GIFTS[0];
      if (S.me.coins < g.p) { toast("رصيدك لا يكفي — اشحن عملات من حسابك"); return; }

      var targetUid = UI.giftTarget || "room";
      var targetLabel = "الجميع في الغرفة";
      var recipientIds = [];

      if (targetUid !== "room") {
        var tu = getUser(targetUid);
        targetLabel = tu.name;
        recipientIds.push(targetUid);
      } else {
        seatedIds.forEach(function (idItem) { recipientIds.push(idItem); });
      }

      var rule = getGiftEconomyRule(g);
      var senderName = S.me.name;
      var senderId = S.me.id;
      var giftEventId = "g_" + now() + "_" + Math.random().toString(36).slice(2, 7);

      UI.giftSending = true;
      closeSheet();

      S.me.coins -= g.p;
      S.me.wealth = Number(S.me.wealth || 0) + rule.wealthGain;
      S.me.sent = (S.me.sent || 0) + 1;
      S.me.ach.giver = true;

      if (!Array.isArray(S.me.wealthLog)) S.me.wealthLog = [];
      S.me.wealthLog.push({ label: g.e + " " + g.n + " إلى " + targetLabel, gain: rule.wealthGain, t: now() });
      if (S.me.wealthLog.length > 30) S.me.wealthLog.shift();

      S.txs.unshift({ id: uid(), type: "gift", title: "هدية " + g.n + " إلى " + targetLabel, amount: -g.p, t: now() });
      S.giftsLog.unshift({ id: giftEventId, from: senderName, fromId: senderId, to: targetLabel, toId: targetUid, gift: g.n, emoji: g.e, price: g.p, charmGain: rule.charmGain, roomId: room.id, roomName: room.name, t: now() });
      addXP(rule.xpGain);

      showFlyGiftToSeat(g.e, senderName, targetUid, targetLabel);

      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + room.id + "/recvTop/" + senderId).transaction(function (c) { return (c || 0) + g.p; }).catch(function () { /* */ });
      }

      recipientIds.forEach(function (recId) {
        if (recId === senderId) return;
        addNotif("🎁", senderName + " أرسل لك هدية " + g.e + " " + g.n + " (+" + rule.charmGain + " جاذبية)", recId);
        if (cloud.on && cloud.db) {
          var recUserRef = cloud.db.ref("users/" + recId);
          recUserRef.child("charm").transaction(function (c) { return (Number(c) || 0) + rule.charmGain; }).catch(function () { /* */ });
          recUserRef.child("gifts").transaction(function (c) { return (Number(c) || 0) + 1; }).catch(function () { /* */ });
          recUserRef.child("receivedGifts").transaction(function (arr) {
            var list = Array.isArray(arr) ? arr : [];
            list.push({ id: giftEventId, e: g.e, n: g.n, p: g.p, charmGain: rule.charmGain, fromName: senderName, fromId: senderId, t: Date.now() });
            if (list.length > 30) list = list.slice(-30);
            return list;
          }).catch(function () { /* */ });
          recUserRef.child("charmLog").transaction(function (arr) {
            var list = Array.isArray(arr) ? arr : [];
            list.push({ e: g.e, n: g.n, gain: rule.charmGain, fromName: senderName, fromId: senderId, t: Date.now() });
            if (list.length > 25) list = list.slice(-25);
            return list;
          }).catch(function () { /* */ });
        }
      });

      save();
      renderTop();
      if (UI.page === "profile") renderProfile();

      pushRoomMsg(room, {
        from: senderId,
        text: "أرسل " + g.e + " " + g.n + " إلى " + targetLabel + " (✨+" + rule.charmGain + " جاذبية)",
        giftAnim: { e: g.e, fromName: senderName, toUid: targetUid, toName: targetLabel }
      });

      toast("تم إرسال " + g.e + " إلى " + targetLabel + " (+" + rule.wealthGain + " ثروة • +" + rule.xpGain + " XP)");
      setTimeout(function () { UI.giftSending = false; }, 350);
    };
  }

  /* ========= 21. الملفات الشخصية والاجتماعيات والرسائل الخاصة ========= */
  function sendFriendReq(targetId) {
    if (!targetId || targetId === S.me.id) return;
    if (S.friends.indexOf(targetId) >= 0) { toast("بالفعل صديق"); return; }
    if (S.sentReq.indexOf(targetId) >= 0) { toast("تم إرسال الطلب مسبقاً"); return; }
    S.sentReq.push(targetId);
    completeTask("friend", 25);
    if (cloud.on && cloud.db) {
      var ups = {};
      ups["social/" + S.me.id + "/sentReq/" + targetId] = true;
      ups["social/" + targetId + "/requests/" + S.me.id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
      addNotif("👥", S.me.name + " أرسل لك طلب صداقة.", targetId);
    } else {
      if (S.requests.indexOf(targetId) < 0) S.requests.push(targetId);
    }
    save(); renderTop(); renderFriends();
    toast("تم إرسال طلب الصداقة ✅");
  }

  function openProfile(id) {
    if (id === S.me.id) { go("profile"); return; }
    var u = getUser(id), isF = S.friends.indexOf(id) >= 0, isFol = S.follows.indexOf(id) >= 0, isBlk = S.blocked.indexOf(id) >= 0;
    var hasVip = (u.vip || 0) > 0;
    var lv = computeLevelFromXp(u.xp || 0);
    var spId = displayUserId(u);

    openSheet('<div style="display:flex;gap:12px;align-items:center">' +
      '<div class="' + (hasVip ? "frame vip-frame" : "") + '">' + avatarHTML(u, "lg") + "</div>" +
      '<div style="flex:1;min-width:0"><div class="name">' + userNameHTML(u) + '</div>' +
      '<div style="display:flex;align-items:center;gap:5px;flex-wrap:wrap;margin-top:3px"><span class="small">ID: ' + esc(spId) + "</span>" + copyBtnHTML(spId, "📋") + "</div>" +
      '<div class="small" style="margin-top:3px">' + (u.online ? "🟢 متصل الآن" : "⚫ غير متصل") + " • " + esc(u.country || "🌍") + "</div>" +
      '<div style="display:flex;gap:5px;flex-wrap:wrap;margin-top:5px">' + wealthBadgeHTML(u.wealth || 0) + charmBadgeHTML(u.charm || 0) + "</div></div></div>" +
      '<p style="margin:10px 0;font-size:13px;line-height:1.6">' + esc(u.bio || "لا توجد نبذة") + "</p>" +
      '<div class="pf-stats"><div class="stat"><b>' + (u.followers || 0) + '</b><span>المتابعون</span></div><div class="stat"><b>' + (u.following || 0) + '</b><span>أتابعهم</span></div><div class="stat"><b>' + (u.friendsCount || 0) + '</b><span>الأصدقاء</span></div>' +
      '<div class="stat"><b>' + (u.wealth || 0) + '</b><span>الثروة</span></div><div class="stat"><b>' + (u.charm || 0) + '</b><span>الجاذبية</span></div><div class="stat"><b>' + Math.max(0, Math.floor((u.roomSeconds || 0) / 60)) + ' د</b><span>وقت الغرف</span></div></div>' +
      '<div style="margin-top:8px">' + renderGiftsAndCollectionsHTML(u) + "</div>" +
      '<div style="margin-top:8px">' + renderVipSectionHTML(u, false) + "</div>" +
      '<div class="social-grid"><button class="btn ' + (isFol ? "ghost" : "") + '" id="pf-fol" type="button">' + (isFol ? "✔ متابَع" : "+ متابعة") + '</button><button class="btn" id="pf-msg" type="button">💬 رسالة</button>' +
      (isF ? '<button class="btn ghost" id="pf-fr" type="button">💔 إزالة صديق</button>' : (S.sentReq.indexOf(id) >= 0 ? '<button class="btn ghost" disabled type="button">⏳ طلب مرسل</button>' : '<button class="btn" id="pf-fr" type="button">👥 إضافة صديق</button>')) +
      '<button class="btn ghost" id="pf-blk" type="button">' + (isBlk ? "فك الحظر" : "🚫 حظر") + "</button></div>");

    $("sheet").onclick = function (e) {
      var cpBtn = e.target.closest("[data-copyval]");
      if (cpBtn) {
        e.stopPropagation();
        copyText(cpBtn.getAttribute("data-copyval"), "تم نسخ User ID (" + spId + ") 📋");
      }
    };

    $("pf-fol").onclick = function () {
      if (isFol) {
        S.follows = S.follows.filter(function (x) { return x !== id; });
        if (cloud.on && cloud.db) {
          cloud.db.ref("social/" + S.me.id + "/follows/" + id).remove().catch(function () { /* */ });
          cloud.db.ref("users/" + id + "/followers").transaction(function (c) { return Math.max(0, (c || 0) - 1); }).catch(function () { /* */ });
        }
        toast("تم إلغاء المتابعة");
      } else {
        S.follows.push(id);
        if (cloud.on && cloud.db) {
          cloud.db.ref("social/" + S.me.id + "/follows/" + id).set(true).catch(function () { /* */ });
          cloud.db.ref("users/" + id + "/followers").transaction(function (c) { return (c || 0) + 1; }).catch(function () { /* */ });
          addNotif("➕", S.me.name + " بدأ بمتابعتك.", id);
        }
        toast("تمت المتابعة ✅");
      }
      saveLocal(); renderTop(); openProfile(id);
    };
    $("pf-msg").onclick = function () { closeSheet(); openDM(id); };
    if ($("pf-fr")) $("pf-fr").onclick = function () {
      if (isF) {
        S.friends = S.friends.filter(function (x) { return x !== id; });
        if (cloud.on && cloud.db) {
          var upsUnf = {};
          upsUnf["social/" + S.me.id + "/friends/" + id] = null;
          upsUnf["social/" + id + "/friends/" + S.me.id] = null;
          cloud.db.ref().update(upsUnf).catch(function () { /* */ });
        }
        toast("تمت الإزالة");
      } else {
        sendFriendReq(id);
      }
      saveLocal(); renderFriends(); openProfile(id);
    };
    $("pf-blk").onclick = function () {
      if (isBlk) {
        S.blocked = S.blocked.filter(function (x) { return x !== id; });
        if (cloud.on && cloud.db) cloud.db.ref("social/" + S.me.id + "/blocked/" + id).remove().catch(function () { /* */ });
        toast("تم فك الحظر");
      } else {
        S.blocked.push(id);
        S.friends = S.friends.filter(function (x) { return x !== id; });
        if (cloud.on && cloud.db) {
          var upsBlk = {};
          upsBlk["social/" + S.me.id + "/blocked/" + id] = true;
          upsBlk["social/" + S.me.id + "/friends/" + id] = null;
          upsBlk["social/" + id + "/friends/" + S.me.id] = null;
          cloud.db.ref().update(upsBlk).catch(function () { /* */ });
        }
        toast("تم الحظر 🚫");
      }
      saveLocal(); renderFriends(); renderMessages(); openProfile(id);
    };
  }

  function openEditProfile() {
    var countries = ["🇪🇬 مصر", "🇸🇦 السعودية", "🇦🇪 الإمارات", "🇰🇼 الكويت", "🇶🇦 قطر", "🇧🇭 البحرين", "🇴🇲 عمان", "🇯🇴 الأردن", "🇲🇦 المغرب", "🇹🇳 تونس", "🇩🇿 الجزائر", "🇱🇧 لبنان", "🇮🇶 العراق", "🌍 أخرى"];
    var cOpts = countries.map(function (c) { return '<option value="' + esc(c) + '"' + (S.me.country === c ? " selected" : "") + ">" + esc(c) + "</option>"; }).join("");
    var spId = displayUserId(S.me);

    openSheet("<h3>✏️ تعديل الملف الشخصي</h3>" +
      '<div class="small" style="text-align:center;margin-bottom:6px">رقم حسابك الخاص (ID): <b>' + esc(spId) + "</b> " + copyBtnHTML(spId, "📋 نسخ") + "</div>" +
      "<label>الاسم</label><input id='ed-n' maxlength='24' value='" + esc(S.me.name) + "' />" +
      "<label>البلد / المدينة</label><select id='ed-c'>" + cOpts + "</select>" +
      "<label>النبذة التعريفية</label><textarea id='ed-b' rows='3' maxlength='140'>" + esc(S.me.bio) + "</textarea>" +
      '<button class="btn block" id="ed-ok" type="button">حفظ</button>');

    $("sheet").onclick = function (e) {
      var cpBtn = e.target.closest("[data-copyval]");
      if (cpBtn) {
        e.stopPropagation();
        copyText(cpBtn.getAttribute("data-copyval"), "تم نسخ User ID (" + spId + ") 📋");
      }
    };

    $("ed-ok").onclick = function () {
      var n = $("ed-n").value.trim(); if (!n) { toast("الاسم مطلوب"); return; }
      S.me.name = clean(n);
      S.me.country = $("ed-c").value;
      S.me.bio = clean($("ed-b").value.trim());
      save(); closeSheet(); renderAll(); toast("تم حفظ الملف الشخصي ✅");
    };
  }

  function buyVipTier(tierLevel) {
    var tier = VIP_TIERS.filter(function (t) { return t.level === Number(tierLevel); })[0];
    if (!tier) return;
    if (S.me.coins < tier.cost) {
      toast("رصيدك لا يكفي لتفعيل " + tier.title);
      return;
    }
    S.me.coins -= tier.cost;
    S.me.vip = Math.max(Number(S.me.vip || 0), tier.level);
    S.me.vipExp = Math.max(Number(S.me.vipExp || 0), Date.now()) + tier.days * 86400000;
    S.me.verified = true;
    S.txs.unshift({ id: uid(), type: "vip", title: "اشتراك " + tier.title, amount: -tier.cost, t: now() });
    addXP(40);
    save();
    renderAll();
    toast("🎉 تم تفعيل " + tier.title + " بنجاح!");
  }

  function openLeaderboard() {
    var allUsers = [getUser(S.me.id)].concat(S.users || []);
    var uniqueMap = {};
    allUsers.forEach(function (u) {
      if (u && u.id && !uniqueMap[u.id]) uniqueMap[u.id] = u;
    });
    var list = Object.keys(uniqueMap).map(function (k) { return uniqueMap[k]; });

    if (UI.leaderTab === "wealth") {
      list.sort(function (a, b) { return (Number(b.wealth || 0) - Number(a.wealth || 0)) || (computeLevelFromXp(b.xp || 0) - computeLevelFromXp(a.xp || 0)); });
    } else if (UI.leaderTab === "charm") {
      list.sort(function (a, b) { return (Number(b.charm || 0) - Number(a.charm || 0)) || (computeLevelFromXp(b.xp || 0) - computeLevelFromXp(a.xp || 0)); });
    } else {
      list.sort(function (a, b) {
        var lvDiff = computeLevelFromXp(b.xp || 0) - computeLevelFromXp(a.xp || 0);
        if (lvDiff !== 0) return lvDiff;
        return (Number(b.xp || 0) - Number(a.xp || 0));
      });
    }

    var top100 = list.slice(0, 100);
    var tabsHtml = '<div class="tabs" style="margin-bottom:8px">' +
      '<button class="tab ' + (UI.leaderTab === "wealth" ? "active" : "") + '" data-ltab="wealth" type="button">🪙 الثروة</button>' +
      '<button class="tab ' + (UI.leaderTab === "charm" ? "active" : "") + '" data-ltab="charm" type="button">✨ الجاذبية</button>' +
      '<button class="tab ' + (UI.leaderTab === "level" ? "active" : "") + '" data-ltab="level" type="button">⭐ المستوى (1-100)</button>' +
      "</div>";

    var rowsHtml = top100.map(function (u, idx) {
      var lv = computeLevelFromXp(u.xp || 0);
      var spId = displayUserId(u);
      var metricVal = UI.leaderTab === "wealth"
        ? "🪙 " + Number(u.wealth || 0)
        : (UI.leaderTab === "charm" ? "✨ " + Number(u.charm || 0) : "⭐ Lv." + lv + " (" + Number(u.xp || 0) + " XP)");

      return '<div class="row glass" data-lprofile="' + esc(u.id) + '" style="margin-bottom:7px">' +
        '<div style="font-weight:800;width:28px;text-align:center">#' + (idx + 1) + "</div>" +
        avatarHTML(u, "sm") +
        '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">ID: ' + esc(spId) + " • " + levelBadgeHTML(lv) + '</div></div>' +
        '<span class="tag vip">' + esc(metricVal) + "</span></div>";
    }).join("");

    openSheet("<h3>🏆 لوحة المتصدرين (أفضل 100)</h3>" + tabsHtml + (rowsHtml || '<div class="empty">لا توجد بيانات متصدرين بعد</div>'));

    $("sheet").querySelectorAll("[data-ltab]").forEach(function (tb) {
      tb.onclick = function () {
        UI.leaderTab = tb.getAttribute("data-ltab");
        openLeaderboard();
      };
    });

    $("sheet").querySelectorAll("[data-lprofile]").forEach(function (row) {
      row.onclick = function () {
        var pid = row.getAttribute("data-lprofile");
        closeSheet();
        openProfile(pid);
      };
    });
  }

  function openDM(id) {
    if (!id || id === S.me.id) return;
    if (S.blocked.indexOf(id) >= 0) { toast("هذا المستخدم محظور"); return; }
    UI.dmId = id; S.unread[id] = 0; saveLocal(); renderTop();
    var u = getUser(id);
    setAvatarEl($("chat-avatar"), u);
    $("chat-title").innerHTML = userNameHTML(u);
    $("chat-sub").textContent = (u.online ? "🟢 متصل الآن" : "⚫ غير متصل") + " • ID: " + displayUserId(u);
    $("chat-view").classList.add("open");
    renderDM();
  }

  function renderDM() {
    var id = UI.dmId; if (!id) return;
    var msgs = S.dms[id] || [], box = $("chat-msgs");
    box.innerHTML = msgs.length ? msgs.map(function (m, i) {
      var me = m.from === S.me.id;
      var inner = m.audio
        ? '<audio controls src="' + esc(m.audio) + '" style="max-width:210px;height:34px"></audio>'
        : esc(m.text);
      return '<div class="msg ' + (me ? "me" : "") + '"' + (me ? ' data-deldm="' + esc(m.key || String(i)) + '"' : "") + ">" + inner + '<div class="tm">' + timeStr(m.t) + "</div></div>";
    }).join("") : '<div class="empty">ابدأ المحادثة مع ' + esc(getUser(id).name) + " 👋</div>";
    box.scrollTop = box.scrollHeight;
  }

  function sendDM(text, extra) {
    var id = UI.dmId;
    text = String(text || "").trim();
    if (!id || (!text && (!extra || !extra.audio))) return;
    if (S.blocked.indexOf(id) >= 0) { toast("هذا المستخدم محظور"); return; }
    if (!S.dms[id]) S.dms[id] = [];
    var payload = Object.assign({ from: S.me.id, text: clean(text) }, extra || {});
    var localEntry = Object.assign({ key: uid() }, payload, { t: now() });
    S.dms[id].push(localEntry);
    saveLocal();
    renderDM();
    renderMessages();

    if (cloud.on && cloud.db) {
      var tid = dmThreadId(S.me.id, id);
      cloud.db.ref("dms/" + tid).push(Object.assign({}, payload, { t: serverTs() })).catch(function () { /* */ });
      var dmUps = {};
      dmUps["userDms/" + S.me.id + "/" + id] = true;
      dmUps["userDms/" + id + "/" + S.me.id] = true;
      cloud.db.ref().update(dmUps).catch(function () { /* */ });
      addNotif("💬", "رسالة جديدة من " + S.me.name, id);
    }
  }

  var dmRecorder = null;
  var dmChunks = [];
  function toggleDmVoiceRecord() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || typeof MediaRecorder === "undefined") {
      toast("المتصفح لا يدعم تسجيل الرسائل الصوتية");
      return;
    }
    if (dmRecorder && dmRecorder.state === "recording") {
      dmRecorder.stop();
      return;
    }
    navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
      dmChunks = [];
      dmRecorder = new MediaRecorder(stream);
      dmRecorder.ondataavailable = function (ev) { if (ev.data && ev.data.size > 0) dmChunks.push(ev.data); };
      dmRecorder.onstop = function () {
        stream.getTracks().forEach(function (tr) { tr.stop(); });
        var blob = new Blob(dmChunks, { type: "audio/webm" });
        var reader = new FileReader();
        reader.onload = function () {
          sendDM("رسالة صوتية", { audio: String(reader.result || "") });
        };
        reader.readAsDataURL(blob);
        var vb = $("chat-voice");
        if (vb) vb.classList.remove("mic-on");
      };
      dmRecorder.start();
      var vb = $("chat-voice");
      if (vb) vb.classList.add("mic-on");
      toast("جاري التسجيل... اضغط مرة أخرى للإرسال 🎙️");
    }).catch(function () {
      toast("تعذر الوصول للميكروفون");
    });
  }

  function openSettings() {
    openSheet("<h3>⚙️ الإعدادات</h3>" +
      '<div class="switchrow"><span>الوضع النهاري / الليلي</span><input type="checkbox" id="st-theme" ' + (S.settings.lightTheme ? "checked" : "") + " /></div>" +
      '<div class="switchrow"><span>الإشعارات</span><input type="checkbox" id="st-n" ' + (S.settings.notif ? "checked" : "") + " /></div>" +
      '<div class="switchrow"><span>الأصوات</span><input type="checkbox" id="st-s" ' + (S.settings.sound ? "checked" : "") + " /></div>" +
      '<div class="actlist" style="margin-top:12px">' +
      '<button id="st-tx" type="button">💳 سجل المعاملات والهدايا</button>' +
      '<button id="st-blk" type="button">🚫 قائمة المحظورين (' + S.blocked.length + ")</button>" +
      '<button id="st-help" type="button">❓ المساعدة والأسئلة الشائعة</button>' +
      '<button class="danger" id="st-rst" type="button">🔄 إعادة ضبط البيانات</button></div>');

    $("st-theme").onchange = function () {
      S.settings.lightTheme = this.checked;
      applyThemeMode();
      saveLocal();
      renderTop();
    };
    $("st-n").onchange = function () {
      S.settings.notif = this.checked;
      if (this.checked) requestBrowserNotifPermission();
      saveLocal();
    };
    $("st-s").onchange = function () { S.settings.sound = this.checked; saveLocal(); };
    $("st-tx").onclick = function () {
      var h = "<h3>💳 سجل المعاملات</h3>";
      h += !S.txs.length ? '<div class="empty">لا توجد معاملات</div>' : S.txs.map(function (t) { return '<div class="row glass" style="margin-bottom:8px"><div class="info"><div class="name">' + esc(t.title) + '</div><div class="meta">' + timeStr(t.t) + '</div></div><b style="color:' + (t.amount >= 0 ? "var(--ok)" : "#fca5a5") + '">' + (t.amount >= 0 ? "+" : "") + t.amount + "</b></div>"; }).join("");
      h += "<h3>🎁 سجل الهدايا</h3>" + (!S.giftsLog.length ? '<div class="empty">لا توجد هدايا</div>' : S.giftsLog.map(function (g) { return '<div class="row glass" style="margin-bottom:8px"><div style="font-size:24px">' + g.emoji + '</div><div class="info"><div class="name">' + esc(g.from) + " ➔ " + esc(g.to) + '</div><div class="meta">' + esc(g.gift) + " • " + esc(g.roomName || "") + " • " + timeStr(g.t) + '</div></div><b>🪙 ' + g.price + "</b></div>"; }).join(""));
      openSheet(h);
    };
    $("st-blk").onclick = function () {
      var h = "<h3>🚫 المحظورون</h3>";
      h += !S.blocked.length ? '<div class="empty">القائمة فارغة</div>' : S.blocked.map(function (id) { var u = getUser(id); return '<div class="row glass" style="margin-bottom:8px">' + avatarHTML(u, "sm") + '<div class="info"><div class="name">' + esc(u.name) + '</div></div><button class="btn sm ghost" data-unblk="' + esc(id) + '" type="button">فك الحظر</button></div>'; }).join("");
      openSheet(h);
      $("sheet").onclick = function (e) {
        var b = e.target.closest("[data-unblk]"); if (!b) return;
        var uidBlk = b.getAttribute("data-unblk");
        S.blocked = S.blocked.filter(function (x) { return x !== uidBlk; });
        if (cloud.on && cloud.db) cloud.db.ref("social/" + S.me.id + "/blocked/" + uidBlk).remove().catch(function () { /* */ });
        saveLocal(); $("st-blk").click();
      };
    };
    $("st-help").onclick = function () {
      openSheet("<h3>❓ المساعدة</h3><p style='font-size:13px;line-height:1.8'>• اضغط على أي مقعد فارغ للصعود على المايك، وعلى أي عضو جالس لفتح نافذة ملفه المصغرة.<br>• استخدم دائرة الغرفة العائمة لتصغير الغرفة وسحبها أو الانتقال لغرفة أخرى مع بقاء الصوت.<br>• يتم إسناد رقم ID خاص لكل مستخدم تلقائياً بترتيب متسلسل (0001000 فما فوق).</p>");
    };
    $("st-rst").onclick = function () {
      confirmBox("سيتم حذف جميع بياناتك المحلية وإعادة التعيين. هل أنت متأكد؟", function () {
        var keepUid = getOrCreateFixedUid();
        localStorage.removeItem(CONFIG.storageKey);
        S = freshState();
        S.me.id = keepUid;
        S.me.num = hashNum(keepUid);
        save();
        applyThemeMode();
        closeSheet();
        renderAll();
        toast("تمت إعادة الضبط");
      });
    };
  }

  /* ========= 22. ربط الأحداث والتهيئة ========= */
  function bindEvents() {
    document.body.addEventListener("click", function (e) {
      var cpBtn = e.target.closest("[data-copyval]");
      if (cpBtn) {
        e.stopPropagation();
        copyText(cpBtn.getAttribute("data-copyval"), "تم نسخ الرقم 📋");
      }
    });

    document.querySelectorAll(".navbtn").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-page")); }; });

    var themeBtn = $("theme-toggle-btn");
    if (themeBtn) {
      themeBtn.onclick = function () {
        S.settings.lightTheme = !S.settings.lightTheme;
        applyThemeMode();
        saveLocal();
        renderTop();
        toast(S.settings.lightTheme ? "تم تفعيل الوضع النهاري ☀️" : "تم تفعيل الوضع الليلي 🌙");
      };
    }

    $("avatar-top").onclick = function () { go("profile"); };
    $("notif-btn").onclick = openNotifs;
    $("banner-create").onclick = openCreateRoom;
    $("fab-create").onclick = openCreateRoom;
    $("refresh-rooms").onclick = function () { renderHome(); toast("تم تحديث الغرف"); };
    $("search-input").oninput = function () { UI.query = this.value; renderHome(); };

    document.querySelectorAll("#home-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.filter = t.getAttribute("data-filter"); renderHome(); };
    });
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.rfilter = t.getAttribute("data-rfilter"); renderRooms(); };
    });
    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) {
      t.onclick = function () { UI.ftab = t.getAttribute("data-ftab"); renderFriends(); };
    });
    $("find-input").oninput = function () { UI.findQ = this.value; renderFriends(); };

    document.querySelectorAll("#pf-subtabs .tab").forEach(function (t) {
      t.onclick = function () {
        UI.pftab = t.getAttribute("data-pftab");
        renderProfile();
      };
    });

    $("page-profile").addEventListener("click", function (e) {
      var buyBtn = e.target.closest("[data-buyvip]");
      if (buyBtn) {
        buyVipTier(Number(buyBtn.getAttribute("data-buyvip")));
      }
    });

    function onListClick(e) {
      var cpBtn = e.target.closest("[data-copyval]");
      if (cpBtn) {
        e.stopPropagation();
        copyText(cpBtn.getAttribute("data-copyval"), "تم نسخ User ID 📋");
        return;
      }
      var en = e.target.closest("[data-enter]"); if (en) { enterRoom(en.getAttribute("data-enter")); return; }
      var pr = e.target.closest("[data-profile]"); if (pr) { openProfile(pr.getAttribute("data-profile")); return; }
      var dm = e.target.closest("[data-dm]"); if (dm) { openDM(dm.getAttribute("data-dm")); return; }
      var af = e.target.closest("[data-addfriend]"); if (af) { sendFriendReq(af.getAttribute("data-addfriend")); return; }
      var ac = e.target.closest("[data-accept]"); if (ac) {
        var fid = ac.getAttribute("data-accept");
        S.requests = S.requests.filter(function (x) { return x !== fid; });
        if (S.friends.indexOf(fid) < 0) S.friends.push(fid);
        completeTask("friend", 25);
        if (cloud.on && cloud.db) {
          var upsAcc = {};
          upsAcc["social/" + S.me.id + "/requests/" + fid] = null;
          upsAcc["social/" + S.me.id + "/friends/" + fid] = true;
          upsAcc["social/" + fid + "/friends/" + S.me.id] = true;
          upsAcc["social/" + fid + "/sentReq/" + S.me.id] = null;
          cloud.db.ref().update(upsAcc).catch(function () { /* */ });
        }
        save(); renderFriends(); renderTop(); toast("تمت الإضافة للأصدقاء 🎉"); return;
      }
      var rj = e.target.closest("[data-reject]"); if (rj) {
        var fid2 = rj.getAttribute("data-reject");
        S.requests = S.requests.filter(function (x) { return x !== fid2; });
        if (cloud.on && cloud.db) {
          var upsRej = {};
          upsRej["social/" + S.me.id + "/requests/" + fid2] = null;
          upsRej["social/" + fid2 + "/sentReq/" + S.me.id] = null;
          cloud.db.ref().update(upsRej).catch(function () { /* */ });
        }
        saveLocal(); renderFriends(); renderTop(); return;
      }
      var cr = e.target.closest("[data-cancelreq]"); if (cr) {
        var fid3 = cr.getAttribute("data-cancelreq");
        S.sentReq = S.sentReq.filter(function (x) { return x !== fid3; });
        if (cloud.on && cloud.db) {
          var upsCan = {};
          upsCan["social/" + S.me.id + "/sentReq/" + fid3] = null;
          upsCan["social/" + fid3 + "/requests/" + S.me.id] = null;
          cloud.db.ref().update(upsCan).catch(function () { /* */ });
        }
        saveLocal(); renderFriends();
      }
    }
    $("home-rooms").onclick = onListClick;
    $("search-users").onclick = onListClick;
    $("rooms-list").onclick = onListClick;
    $("friends-list").onclick = onListClick;
    $("dm-list").onclick = onListClick;

    $("pf-edit").onclick = openEditProfile;
    $("pf-vip-btn").onclick = function () { UI.pftab = "vip"; renderProfile(); };
    $("pf-share-btn").onclick = function () {
      var spId = displayUserId(S.me);
      var shareUrl = location.origin + location.pathname + "?ref=" + encodeURIComponent(S.me.id);
      if (navigator.share) {
        navigator.share({ title: "REAL VOICE", text: "انضم إليّ في REAL VOICE (ID: " + spId + ")", url: shareUrl }).catch(function () { /* */ });
      }
      copyText(shareUrl + " | ID: " + spId, "تم نسخ رابط الدعوة ورقم ID (" + spId + ") 📋");
      S.me.invites = (S.me.invites || 0) + 1;
      addXP(10);
      save();
      renderProfile();
    };
    $("pf-settings").onclick = openSettings;

    $("pf-photo-trigger").onclick = function () {
      var inp = $("pf-photo-input");
      if (inp) inp.click();
    };
    $("pf-photo-input").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        var dataUrl = await readImageFileAsDataUrl(f, 240, 0.72);
        S.me.photo = dataUrl;
        save();
        renderAll();
        if (UI.roomId) renderRoom();
        renderFloatingOrb();
        toast("تم تحديث صورة حسابك ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل الصورة");
      }
    };

    $("pf-cover-btn").onclick = function () {
      var cinp = $("pf-cover-input");
      if (cinp) cinp.click();
    };
    $("pf-cover-input").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        var covUrl = await readImageFileAsDataUrl(f, 520, 0.62);
        S.me.cover = covUrl;
        save();
        renderProfile();
        toast("تم تحديث صورة الغلاف ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل الغلاف");
      }
    };

    $("pf-daily").onclick = function () {
      var lastDaily = Number(S.me.daily || 0);
      if (lastDaily && (Date.now() - lastDaily < 24 * 60 * 60 * 1000)) {
        toast("لقد استلمت مكافأة اليوم بالفعل — عد بعد 24 ساعة");
        return;
      }
      S.me.daily = Date.now();
      S.me.coins += 100;
      S.me.wealth = Number(S.me.wealth || 0) + 25;
      S.txs.unshift({ id: uid(), type: "daily", title: "مكافأة الدخول اليومية", amount: 100, t: now() });
      addXP(15);
      save(); renderAll(); toast("تم استلام 100 عملة و +25 ثروة 🎉");
    };
    $("pf-topup").onclick = function () {
      S.me.coins += 500;
      S.me.wealth = Number(S.me.wealth || 0) + 100;
      S.txs.unshift({ id: uid(), type: "topup", title: "شحن رصيد (تجريبي)", amount: 500, t: now() });
      addXP(10);
      save(); renderAll(); toast("تم شحن 500 عملة و +100 ثروة ✅");
    };
    $("pf-leader").onclick = openLeaderboard;

    /* أحداث الغرفة الصوتية */
    $("room-back").onclick = function () { leaveRoom(false); };
    $("room-menu").onclick = openRoomMenu;
    $("room-music").onclick = openMusicSheet;
    $("room-presence-btn").onclick = openRoomParticipantsSheet;

    $("room-top-thumb").onclick = function () {
      var room = getRoom(UI.roomId);
      if (!room) return;
      var inp = $("room-photo-input");
      if (inp) inp.click();
    };
    $("room-photo-input").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var room = getRoom(UI.roomId);
      if (!room) return;
      try {
        var rPhoto = await readImageFileAsDataUrl(f, 260, 0.72);
        room.roomPhoto = rPhoto;
        if (cloud.on && cloud.db) {
          cloud.db.ref("rooms/" + room.id + "/roomPhoto").set(rPhoto).catch(function () { /* */ });
        }
        saveLocal();
        renderRoom();
        renderFloatingOrb();
        renderAll();
        toast("تم تغيير صورة الغرفة ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل صورة الغرفة");
      }
    };

    $("room-speaker-btn").onclick = function () {
      UI.roomSpeakerMuted = !UI.roomSpeakerMuted;
      applyRoomSpeakerMuteState();
      toast(UI.roomSpeakerMuted ? "تم كتم صوت الغرفة 🔇" : "تم تشغيل صوت الغرفة 🔊");
    };

    $("audio-unlock-btn").onclick = function () {
      resumeAllRemoteAudioTracks();
      if (musicState.roomAudio && musicState.data && !musicState.data.paused) {
        musicState.roomAudio.play().catch(function () { /* */ });
      }
      showAudioUnlockBar(false);
    };

    $("mmini-toggle").onclick = function () {
      var room = getRoom(UI.roomId);
      if (room) togglePlayPauseMusic(room);
    };
    $("mmini-skip").onclick = function () {
      var room = getRoom(UI.roomId);
      if (room) skipMusicTrack(room);
    };
    $("mmini-open").onclick = openMusicSheet;

    $("quiz-box").addEventListener("click", function (e) {
      var optBtn = e.target.closest("[data-quizans]");
      if (!optBtn || !UI.quiz) return;
      var idx = Number(optBtn.getAttribute("data-quizans"));
      UI.quiz.answers = UI.quiz.answers || {};
      UI.quiz.answers[S.me.id] = idx;
      if (cloud.on && cloud.db && UI.roomId) {
        cloud.db.ref("rooms/" + UI.roomId + "/quiz/current/answers/" + S.me.id).set(idx).catch(function () { /* */ });
      }
      renderQuizBox();
      if (idx === UI.quiz.ans) {
        S.me.coins += 15;
        addXP(8);
        save();
        renderTop();
        toast("إجابة صحيحة! +15 عملة و +8 XP 🧠");
      } else {
        toast("إجابة غير صحيحة — حاول في السؤال القادم");
      }
    });

    $("room-seats").onclick = function (e) {
      var s = e.target.closest("[data-seat]");
      if (s) clickSeat(Number(s.getAttribute("data-seat")));
    };

    $("mic-btn").onclick = handleMicButtonClick;
    $("room-send").onclick = function () { var i = $("room-input"); sendRoomMsg(i.value); i.value = ""; };
    $("room-input").onkeydown = function (e) { if (e.key === "Enter") { sendRoomMsg(this.value); this.value = ""; } };
    $("room-sticker").onclick = openRoomStickersSheet;
    $("room-photo").onclick = function () {
      var inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "image/*";
      inp.onchange = async function () {
        var f = this.files && this.files[0];
        if (!f) return;
        try {
          var imgUrl = await readImageFileAsDataUrl(f, 360, 0.65);
          sendRoomMsg("", { img: imgUrl });
        } catch (err) {
          toast(err.message || "تعذر إرسال الصورة");
        }
      };
      inp.click();
    };
    $("room-gift").onclick = function () { openGiftSheet("room"); };
    $("room-chat").onclick = function (e) {
      var m = e.target.closest("[data-delmsg]"); if (!m) return;
      var mkey = m.getAttribute("data-delmsg");
      var room = getRoom(UI.roomId); if (!room) return;
      confirmBox("حذف هذه الرسالة؟", function () {
        if (cloud.on && cloud.db && mkey && mkey.indexOf("u") !== 0) {
          cloud.db.ref("roomMessages/" + room.id + "/" + mkey).remove().catch(function () { /* */ });
        }
        room.msgs = (room.msgs || []).filter(function (item, idx) {
          return item.key ? item.key !== mkey : String(idx) !== mkey;
        });
        saveLocal(); renderRoomChat();
      });
    };

    /* أحداث المحادثة الخاصة */
    $("chat-back").onclick = function () { $("chat-view").classList.remove("open"); UI.dmId = null; renderMessages(); };
    $("chat-send").onclick = function () { var i = $("chat-input"); sendDM(i.value); i.value = ""; };
    $("chat-input").onkeydown = function (e) { if (e.key === "Enter") { sendDM(this.value); this.value = ""; } };
    $("chat-voice").onclick = toggleDmVoiceRecord;
    $("chat-emoji").onclick = function () {
      openSheet("<h3>😀 اختر تعبيراً</h3><div style='display:grid;grid-template-columns:repeat(6,1fr);gap:8px;font-size:26px;text-align:center'>" +
        EMOJIS.map(function (em) { return "<button data-em='" + em + "' style='padding:8px' type='button'>" + em + "</button>"; }).join("") + "</div>");
      $("sheet").onclick = function (e) {
        var b = e.target.closest("[data-em]"); if (!b) return;
        $("chat-input").value += b.getAttribute("data-em");
        closeSheet(); $("chat-input").focus();
      };
    };
    $("chat-menu").onclick = function () {
      var id = UI.dmId; if (!id) return;
      actionList("خيارات المحادثة", [
        { label: "👤 عرض الملف الشخصي", fn: function () { openProfile(id); } },
        {
          label: "🗑️ مسح المحادثة", danger: true,
          fn: function () {
            confirmBox("مسح سجل هذه المحادثة؟", function () {
              S.dms[id] = [];
              if (cloud.on && cloud.db) {
                cloud.db.ref("dms/" + dmThreadId(S.me.id, id)).remove().catch(function () { /* */ });
              }
              saveLocal(); renderDM(); renderMessages(); toast("تم المسح");
            });
          }
        }
      ]);
    };
    $("chat-msgs").onclick = function (e) {
      var m = e.target.closest("[data-deldm]"); if (!m) return;
      var mkey = m.getAttribute("data-deldm");
      confirmBox("حذف الرسالة؟", function () {
        if (cloud.on && cloud.db && mkey && mkey.indexOf("u") !== 0) {
          cloud.db.ref("dms/" + dmThreadId(S.me.id, UI.dmId) + "/" + mkey).remove().catch(function () { /* */ });
        }
        S.dms[UI.dmId] = (S.dms[UI.dmId] || []).filter(function (item, idx) {
          return item.key ? item.key !== mkey : String(idx) !== mkey;
        });
        saveLocal(); renderDM(); renderMessages();
      });
    };

    $("scrim").onclick = closeSheet;

    attachFloatingOrbDragAndClick();

    global.addEventListener("beforeunload", function () {
      saveLocal();
      if (cloud.on && cloud.db && S && S.me) {
        try {
          cloud.db.ref("users/" + S.me.id + "/online").set(false);
          if (UI.roomId) {
            var r = getRoom(UI.roomId);
            if (r) {
              var si = seatIndexOf(r, S.me.id);
              if (si >= 0) cloud.db.ref("rooms/" + UI.roomId + "/seats/" + si + "/uid").set(null);
              cloud.db.ref("rooms/" + UI.roomId + "/listeners/" + S.me.id).remove();
            }
          }
        } catch (e) { /* */ }
      }
      leaveVoiceChannel();
    });
  }

  async function init() {
    loadLocal();
    initCloud();
    bindEvents();
    renderAll();
    renderFloatingOrb();
    await startCloudSync();
    renderAll();
  }

  init();
})(window);
