/* REAL VOICE — نسخة 3D احترافية + فتح بروفايل المستخدم من مقاعد الغرفة الصوتية */
(function (global) {
  "use strict";

  /* ========= 1. الإعدادات المركزية ========= */
  var FIREBASE_CONFIG = {
    apiKey: "AIzaSyDyx4MBxvRM0L5FrrjVOfVePlKRSxGpMg4",
    authDomain: "real-voice-aec71.firebaseapp.com",
    databaseURL: "https://real-voice-aec71-default-rtdb.firebaseio.com",
    projectId: "real-voice-aec71",
    appId: "1:1051527775983:web:ae3794c162184fd56b7d1a"
  };

  var TOKEN_URL = "https://indexhtml-production-8a2533cd.up.railway.app/rtc-token";

  var CONFIG = {
    storageKey: "rv_state_v4",
    fixedUidKey: "rv_fixed_uid_v1",
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

  /* ========= 2. أدوات مساعدة ========= */
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

  /* ========= 3. إدارة المستمعين والمؤقتات ========= */
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

  /* ========= 4. محرك الصوت (Agora RTC) + كتم صوت الغرفة + المشغل المبسط ========= */
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
      if (!UI.roomId || !m || !m.url) {
        await stopMusicBroadcast();
        return;
      }

      var isDj = m.djUid === S.me.id;
      var publishedViaAgora = false;

      if (isDj && !m.paused && m.url.indexOf("blob:") !== 0) {
        if (voice.role !== "publisher") {
          await joinVoiceChannel(UI.roomId, "publisher");
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

  function canControlMusic(room) {
    if (!room) return false;
    var r = role(room, S.me.id);
    return r === "owner" || r === "mod";
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
      var room = getRoom(UI.roomId);
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
    var room = getRoom(UI.roomId);
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

  /* ========= 5. الحالة والبيانات ========= */
  var cloud = { on: false, db: null, auth: null, fbUser: null, usersMap: {}, roomsMap: {}, roomMsgs: {}, seenFly: {}, seenReact: {}, seenJoin: {} };
  var S = null;
  var UI = {
    page: "home", filter: "all", rfilter: "mine", ftab: "friends", pftab: "overview",
    query: "", findQ: "",
    roomId: null, dmId: null, msgColor: "", micMuted: false, roomSpeakerMuted: false,
    giftSel: "heart", giftTarget: "room",
    micQueue: {}, theme: null, quiz: null,
    celebratedProfiles: {},
    activeSeatProfileUid: null,
    activeSeatProfileIdx: -1
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
      { id: "RV-1001", num: 1001, name: "ليلى", photo: "", cover: "", online: true, bio: "أحب الموسيقى 🎵", vip: 2, vipExp: Date.now() + 20 * 86400000, verified: true, country: "🇪🇬 مصر", roomsJoined: 14, roomSeconds: 4200, level: 7, xp: 640, followers: 120, following: 45, friendsCount: 18, gifts: 32 },
      { id: "RV-1002", num: 1002, name: "أحمد", photo: "", cover: "", online: true, bio: "لاعب محترف 🎮", vip: 0, verified: false, country: "🇸🇦 السعودية", roomsJoined: 8, roomSeconds: 1900, level: 4, xp: 320, followers: 40, following: 22, friendsCount: 9, gifts: 11 },
      { id: "RV-1003", num: 1003, name: "سارة", photo: "", cover: "", online: false, bio: "هنا للدردشة ☕", vip: 1, vipExp: Date.now() + 12 * 86400000, verified: true, country: "🇦🇪 الإمارات", roomsJoined: 11, roomSeconds: 3100, level: 5, xp: 450, followers: 85, following: 30, friendsCount: 14, gifts: 21 },
      { id: "RV-1004", num: 1004, name: "خالد", photo: "", cover: "", online: true, bio: "صاحب غرف VIP 👑", vip: 3, vipExp: Date.now() + 28 * 86400000, verified: true, country: "🇰🇼 الكويت", roomsJoined: 25, roomSeconds: 9500, level: 12, xp: 1150, followers: 340, following: 60, friendsCount: 42, gifts: 95 },
      { id: "RV-1005", num: 1005, name: "مريم", photo: "", cover: "", online: false, bio: "مرحباً بالجميع", vip: 0, verified: false, country: "🇯🇴 الأردن", roomsJoined: 4, roomSeconds: 900, level: 2, xp: 130, followers: 15, following: 12, friendsCount: 5, gifts: 4 },
      { id: "RV-1006", num: 1006, name: "يوسف", photo: "", cover: "", online: true, bio: "تحدي الأسئلة 🧠", vip: 2, vipExp: Date.now() + 18 * 86400000, verified: true, country: "🇲🇦 المغرب", roomsJoined: 19, roomSeconds: 6100, level: 9, xp: 820, followers: 190, following: 51, friendsCount: 27, gifts: 48 }
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
      { id: "r1", name: "سهرة الأصدقاء", desc: "دردشة مفتوحة للجميع", cat: "friends", owner: "RV-1001", mods: [], seats: makeSeats(9, ["RV-1001"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 7200000, msgs: [], color: 0, icon: 0, recvTop: {}, theme: ROOM_THEMES[0] },
      { id: "r2", name: "تحدي الأسئلة", desc: "مسابقات وجوائز", cat: "games", owner: "RV-1006", mods: [], seats: makeSeats(6, ["RV-1006"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "مسابقة اليوم الساعة 9 مساءً", created: t - 3600000, msgs: [], color: 1, icon: 1, recvTop: {}, theme: ROOM_THEMES[1] },
      { id: "r3", name: "قصر الملوك", desc: "غرفة VIP حصرية", cat: "vip", owner: "RV-1004", mods: [], seats: makeSeats(12, ["RV-1004"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 86400000, msgs: [], color: 3, icon: 3, recvTop: {}, theme: ROOM_THEMES[3] },
      { id: "r4", name: "ليالي الطرب", desc: "أغاني وموسيقى", cat: "music", owner: "RV-1003", mods: [], seats: makeSeats(4, ["RV-1003"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 600000, msgs: [], color: 2, icon: 2, recvTop: {}, theme: ROOM_THEMES[2] }
    ];
  }

  function freshState() {
    var fixedId = getOrCreateFixedUid();
    var num = hashNum(fixedId);
    return {
      me: {
        id: fixedId, num: num, name: "مستخدم جديد", photo: "", cover: "",
        bio: "مرحباً! أنا جديد في REAL VOICE 👋", coins: CONFIG.startCoins, xp: 0, vip: 0, vipExp: 0,
        verified: false, followers: 0, following: 0, friendsCount: 0, visits: 0, joined: now(),
        country: "🇪🇬 مصر", gifts: 0, sent: 0, msgCount: 0,
        roomsJoined: 0, roomSeconds: 0, receivedGifts: [],
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
          if (S.me.photo == null) S.me.photo = "";
          if (S.me.cover == null) S.me.cover = "";
          if (S.me.roomsJoined == null) S.me.roomsJoined = S.me.visits || 0;
          if (S.me.roomSeconds == null) S.me.roomSeconds = 0;
          if (!Array.isArray(S.me.receivedGifts)) S.me.receivedGifts = [];
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

  function saveMeCloud() {
    if (!cloud.on || !cloud.db || !S || !S.me) return;
    cloud.db.ref("users/" + S.me.id).update({
      id: S.me.id, num: S.me.num, name: S.me.name,
      photo: S.me.photo || "", cover: S.me.cover || "",
      bio: S.me.bio, coins: S.me.coins, xp: S.me.xp,
      vip: S.me.vip || 0, vipExp: S.me.vipExp || 0, verified: !!S.me.verified,
      followers: S.me.followers || 0, following: S.follows.length || 0,
      friendsCount: S.friends.length || 0,
      visits: S.me.visits || 0, roomsJoined: S.me.roomsJoined || 0,
      roomSeconds: S.me.roomSeconds || 0,
      receivedGifts: (S.me.receivedGifts || []).slice(-30),
      country: S.me.country, gifts: S.me.gifts || 0, sent: S.me.sent || 0,
      msgCount: S.me.msgCount || 0, ach: S.me.ach || {},
      daily: S.me.daily || 0, tasks: S.me.tasks || {}, invites: S.me.invites || 0,
      level: level(), online: true
    }).catch(function () { /* */ });
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
      bans: bansArr, pass: r.pass || "",
      priv: !!r.priv, locked: !!r.locked, pinned: r.pinned || "",
      created: typeof r.created === "number" ? r.created : now(),
      color: r.color || 0, icon: r.icon || 0,
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
      var safetyTimer = setTimeout(finish, 2500);

      var myId = getOrCreateFixedUid();
      var myNum = hashNum(myId);
      S.me.id = myId;
      S.me.num = myNum;

      var uRef = cloud.db.ref("users/" + myId);
      uRef.once("value").then(function (snap) {
        var p = snap.val();
        if (p && p.id) {
          S.me = Object.assign({}, S.me, p, { id: myId, num: p.num || myNum });
        } else {
          uRef.set(Object.assign({}, S.me, { online: true, level: level() })).catch(function () { /* */ });
        }
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
          uRef.update({ online: true }).catch(function () { /* */ });
        });

        trackListener("app", cloud.db.ref("users"), "value", function (usnap) {
          var val = usnap.val() || {};
          cloud.usersMap = val;
          var list = [];
          Object.keys(val).forEach(function (k) {
            if (k !== S.me.id) list.push(Object.assign({ id: k }, val[k]));
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

  /* ========= 6. دوال البيانات المساعدة ========= */
  function getUser(id) {
    if (!id) return { id: "", num: 0, name: "مستخدم", photo: "", cover: "", online: false, bio: "", vip: 0, vipExp: 0, verified: false, level: 1, followers: 0, following: 0, friendsCount: 0, visits: 0, roomsJoined: 0, roomSeconds: 0, gifts: 0, xp: 0, ach: {}, receivedGifts: [] };
    if (id === S.me.id) {
      return {
        id: S.me.id, num: S.me.num, name: S.me.name,
        photo: S.me.photo || "", cover: S.me.cover || "",
        online: true, bio: S.me.bio, vip: S.me.vip || 0, vipExp: S.me.vipExp || 0,
        verified: !!S.me.verified || (S.me.vip || 0) >= 2 || level() >= 5,
        level: level(), followers: S.me.followers || 0, following: S.follows.length || 0,
        friendsCount: S.friends.length || 0,
        visits: S.me.visits || 0, roomsJoined: S.me.roomsJoined || 0,
        roomSeconds: S.me.roomSeconds || 0, gifts: S.me.gifts || 0,
        xp: S.me.xp || 0, country: S.me.country || "🇪🇬 مصر",
        ach: S.me.ach || {},
        receivedGifts: S.me.receivedGifts || [], me: true
      };
    }
    if (cloud.usersMap[id]) {
      var cu = cloud.usersMap[id];
      var cLv = cu.level || (Math.floor((cu.xp || 0) / CONFIG.xpPerLevel) + 1);
      return Object.assign({
        id: id, photo: "", cover: "", online: false, bio: "",
        vip: 0, vipExp: 0, verified: false, level: cLv,
        followers: 0, following: 0, friendsCount: 0, visits: 0, roomsJoined: 0,
        roomSeconds: 0, gifts: 0, xp: 0, country: "🌍 غير محدد",
        ach: {}, receivedGifts: []
      }, cu);
    }
    for (var i = 0; i < S.users.length; i++) {
      if (S.users[i].id === id) return Object.assign({ friendsCount: 0, ach: {}, receivedGifts: [] }, S.users[i]);
    }
    return { id: id, num: hashNum(id), name: "مستخدم", photo: "", cover: "", online: false, bio: "", vip: 0, vipExp: 0, verified: false, level: 1, followers: 0, following: 0, friendsCount: 0, visits: 0, roomsJoined: 0, roomSeconds: 0, gifts: 0, xp: 0, ach: {}, receivedGifts: [] };
  }

  function getRoom(id) {
    if (!id || !S || !Array.isArray(S.rooms)) return null;
    for (var i = 0; i < S.rooms.length; i++) if (S.rooms[i].id === id) return S.rooms[i];
    return null;
  }

  function level() { return Math.floor((S.me.xp || 0) / CONFIG.xpPerLevel) + 1; }

  function addXP(n) {
    var before = level();
    S.me.xp = (S.me.xp || 0) + n;
    var after = level();
    if (after > before) {
      S.me.coins += after * 20;
      addNotif("⭐", "ارتفع مستواك إلى " + after + "! مكافأتك " + after * 20 + " عملة.");
      toast("🎉 مستوى جديد: " + after);
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

  function userNameHTML(u) {
    var v = (u && u.vip > 0) ? '<span class="tag vip">VIP' + u.vip + "</span>" : "";
    var ver = (u && (u.verified || (u.vip || 0) >= 2 || (u.level || 1) >= 5)) ? '<span class="tag verified">✔ موثق</span>' : "";
    return esc(u.name) + ver + v;
  }

  function updateAppBadge(unreadCount) {
    if (navigator && typeof navigator.setAppBadge === "function") {
      if (unreadCount > 0) navigator.setAppBadge(unreadCount).catch(function () { /* */ });
      else navigator.clearAppBadge().catch(function () { /* */ });
    }
  }

  /* ========= 7. شريط دخول الأعضاء الاحترافي (3 ثوانٍ) ========= */
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

  /* ========= 8. حركة طيران الهدية مباشرة نحو المقعد المستهدف ========= */
  function showFlyGiftToSeat(emoji, senderName, targetUid, targetName) {
    var room = getRoom(UI.roomId);
    var appEl = $("app");
    if (!appEl) return;

    var startX = window.innerWidth / 2;
    var startY = window.innerHeight - 90;
    var endX = window.innerWidth / 2;
    var endY = window.innerHeight * 0.28;
    var targetSeatIdx = -1;

    if (room && targetUid && targetUid !== "room") {
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

  /* ========= 9. التنقل ورسم الصفحات ========= */
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
    var lock = r.pass ? "🔒 " : (r.priv ? "🕵️ " : "");
    return '<div class="row glass">' +
      '<div class="roomcover" style="background:' + COVERS[r.color % COVERS.length] + '">' + COVER_ICONS[r.icon % COVER_ICONS.length] + "</div>" +
      '<div class="info"><div class="name">' + lock + esc(r.name) + '<span class="tag">' + esc(CATEGORIES[r.cat] || "عام") + "</span></div>" +
      '<div class="meta">👤 ' + esc(owner.name) + " • 🎧 " + count(r) + " • 🪑 " + r.seats.filter(function (s) { return s.uid; }).length + "/" + r.seats.length + "</div>" +
      '<div class="meta">' + esc(r.desc || "") + "</div></div>" +
      '<button class="btn sm" data-enter="' + esc(r.id) + '" type="button">دخول</button></div>';
  }

  function filterRooms() {
    var list = S.rooms.filter(function (r) { return !r.priv || r.owner === S.me.id || inRoom(r, S.me.id); });
    var q = UI.query.trim().toLowerCase();
    if (q) list = list.filter(function (r) { return r.name.toLowerCase().indexOf(q) >= 0 || r.id.toLowerCase().indexOf(q) >= 0 || (r.desc || "").toLowerCase().indexOf(q) >= 0; });
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
    $("home-rooms").innerHTML = list.length ? list.map(roomCard).join("") : '<div class="empty">لا توجد غرف مطابقة 🔎</div>';
    var box = $("search-users");
    var q = UI.query.trim().toLowerCase();
    if (q) {
      var us = S.users.filter(function (u) { return (u.name || "").toLowerCase().indexOf(q) >= 0 || (u.id || "").toLowerCase().indexOf(q) >= 0; });
      box.classList.toggle("hidden", us.length === 0);
      box.innerHTML = us.length ? '<h2 class="title">المستخدمون</h2>' + us.map(function (u) {
        return '<div class="row glass" data-profile="' + esc(u.id) + '">' + avatarHTML(u) + '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + esc(u.id) + "</div></div></div>";
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
    return '<div class="row glass"><div data-profile="' + esc(u.id) + '" style="position:relative">' + avatarHTML(u) + '<span class="dot ' + (u.online ? "on" : "") + '"></span></div>' +
      '<div class="info" data-profile="' + esc(u.id) + '"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + (u.online ? "متصل" : "غير متصل") + where + "</div></div>" + actions + "</div>";
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
      var res = S.users.filter(function (u) { return !q || (u.name || "").toLowerCase().indexOf(q) >= 0 || (u.id || "").toLowerCase().indexOf(q) >= 0; });
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
        return '<div class="show-item"><div class="ic">' + esc(g.e || "🎁") + "</div><b>" + esc(g.n || "هدية") + "</b><small>🪙 " + esc(g.p || 0) + "</small></div>";
      }).join("") + "</div>"
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
      rareHtml + giftsGrid + itemsHtml + "</div>";
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
      (isVerified ? ' <span class="tag verified">✔ موثق</span>' : "") +
      (hasVip ? ' <span class="tag vip">👑 VIP ' + m.vip + "</span>" : "");
    $("pf-id").textContent = "ID: " + m.id;
    $("pf-badges").innerHTML = '<span class="tag">🟢 متصل الآن</span><span class="tag">المستوى ' + lv + "</span>" +
      ((m.invites || 0) > 0 ? '<span class="tag">الدعوات: ' + m.invites + "</span>" : "");
    $("pf-level").textContent = lv;
    $("pf-xp").textContent = into + " / " + CONFIG.xpPerLevel + " XP";
    $("pf-bar").style.width = (into / CONFIG.xpPerLevel * 100) + "%";

    $("pf-followers").textContent = m.followers || 0;
    $("pf-following").textContent = S.follows.length || 0;
    $("pf-friends").textContent = S.friends.length || 0;
    $("pf-visits").textContent = m.visits || 0;
    $("pf-rooms-cnt").textContent = m.roomsJoined || 0;
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

  /* ========= 10. النوافذ السفلية ========= */
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

  /* ========= 11. الإشعارات ========= */
  function openNotifs() {
    var html = "<h3>🔔 الإشعارات</h3>";
    if (!S.notifs.length) html += '<div class="empty">لا توجد إشعارات</div>';
    S.notifs.forEach(function (n) {
      html += '<div class="row glass" style="margin-bottom:8px"><div style="font-size:24px">' + n.icon + '</div><div class="info"><div class="name" style="white:normal;font-weight:' + (n.read ? "normal" : "bold") + '">' + esc(n.text) + '</div><div class="meta">' + timeStr(n.t) + '</div></div><button class="btn sm ghost" data-delnotif="' + esc(n.id) + '" type="button">🗑</button></div>';
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

  /* ========= 12. إنشاء ودخول ومغادرة الغرف ========= */
  function openCreateRoom() {
    var cats = Object.keys(CATEGORIES).map(function (k) { return '<option value="' + k + '">' + CATEGORIES[k] + "</option>"; }).join("");
    openSheet("<h3>🎙️ إنشاء غرفة 3D جديدة</h3>" +
      '<label>اسم الغرفة</label><input id="cr-name" maxlength="30" placeholder="مثال: سهرة الليل" />' +
      '<label>وصف الغرفة</label><input id="cr-desc" maxlength="80" placeholder="وصف قصير" />' +
      '<label>التصنيف</label><select id="cr-cat">' + cats + "</select>" +
      '<label>عدد المقاعد الدائرية</label><select id="cr-seats"><option value="4">4 مقاعد</option><option value="6">6 مقاعد</option><option value="9" selected>9 مقاعد</option><option value="12">12 مقعد</option></select>' +
      '<label>خلفية الغرفة من المعرض (اختياري)</label><input id="cr-bgfile" type="file" accept="image/*" />' +
      '<label>كلمة المرور (اختياري)</label><input id="cr-pass" maxlength="20" placeholder="اتركها فارغة للغرفة المفتوحة" />' +
      '<label>نوع الغرفة</label><select id="cr-priv"><option value="0">عامة</option><option value="1">خاصة (لا تظهر في القائمة)</option></select>' +
      '<button class="btn block" id="cr-ok" type="button">إنشاء الغرفة</button>');
    var selectedBgDataUrl = "";
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
        owner: S.me.id, mods: [], seats: makeSeats(n, []), listeners: [], bans: [], pass: $("cr-pass").value.trim(),
        priv: $("cr-priv").value === "1", locked: false, pinned: "", created: now(), msgs: [],
        color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length),
        theme: initTheme, recvTop: {}
      };
      S.rooms.unshift(room);
      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + roomId).set({
          name: room.name, desc: room.desc, cat: room.cat, owner: room.owner,
          seatCount: n, pass: room.pass, priv: room.priv, locked: false,
          pinned: "", created: serverTs(), color: room.color, icon: room.icon,
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

  function enterRoom(id, skipPass) {
    closeSheet();
    var room = getRoom(id);
    if (!room) { toast("الغرفة غير موجودة"); return; }
    if (room.bans.indexOf(S.me.id) >= 0) { toast("أنت محظور من هذه الغرفة 🚫"); return; }
    if (room.locked && room.owner !== S.me.id && !inRoom(room, S.me.id)) { toast("الغرفة مقفلة من المالك 🔒"); return; }
    if (room.pass && !skipPass && room.owner !== S.me.id && !inRoom(room, S.me.id)) {
      openSheet('<h3>🔒 الغرفة محمية</h3><label>أدخل كلمة المرور</label><input id="pw-in" type="password" /><button class="btn block" id="pw-ok" type="button">دخول</button>');
      $("pw-ok").onclick = function () {
        if ($("pw-in").value === room.pass) { closeSheet(); enterRoom(id, true); }
        else toast("كلمة المرور خاطئة");
      };
      return;
    }

    if (UI.roomId && UI.roomId !== id) {
      leaveRoom(true);
    }

    cleanup("room");
    musicState.roomXpEarned = 0;
    musicState.data = null;
    musicState.queue = [];
    UI.micQueue = {};
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
        var qRef = cloud.db.ref("rooms/" + id + "/micQueue/" + S.me.id);
        try { lRef.onDisconnect().remove(); } catch (e0) { /* */ }
        try { qRef.onDisconnect().remove(); } catch (e1) { /* */ }
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

      trackListener("room", cloud.db.ref("rooms/" + id + "/micQueue"), "value", function (mqSnap) {
        UI.micQueue = mqSnap.val() || {};
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

  function leaveRoom(silent) {
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
        ups["rooms/" + rid + "/micQueue/" + S.me.id] = null;
        if (musicState.data && musicState.data.djUid === S.me.id) {
          ups["rooms/" + rid + "/music/djUid"] = null;
          ups["rooms/" + rid + "/music/paused"] = true;
        }
        cloud.db.ref().update(ups).catch(function () { /* */ });
      }
      pushRoomMsg(room, { sys: true, text: S.me.name + " غادر الغرفة" });
    }

    UI.roomId = null;
    musicState.data = null;
    musicState.queue = [];
    applyRoomTheme(ROOM_THEMES[0]);
    saveLocal();
    $("room-view").classList.remove("open");

    leaveVoiceChannel();
    if (!silent) renderAll();
  }

  /* ========= 13. رسم الغرفة والمقاعد الدائرية 3D والدردشة ========= */
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

    $("room-title").textContent = (room.pass ? "🔒 " : "") + room.name;
    $("room-sub-meta").textContent = "ID: " + room.id;
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
        sub = s.uid === room.owner ? "👑 المالك" : (room.mods.indexOf(s.uid) >= 0 ? "🛡️ مشرف" : (u.me ? "أنت" : "متحدث"));
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

      return '<div class="msg ' + (me ? "me " : "") + (m.color ? "col-" + m.color : "") + '"' + (me ? ' data-delmsg="' + esc(m.key || String(i)) + '"' : "") + '><div class="who">' + userNameHTML(u) + "</div>" + body + '<div class="tm">' + timeStr(m.t) + (me ? " • اضغط للحذف" : "") + "</div></div>";
    }).join("");
    if (stick) box.scrollTop = box.scrollHeight;
  }

  function sendRoomMsg(text, extra) {
    var room = getRoom(UI.roomId);
    text = String(text || "").trim();
    if (!room || (!text && (!extra || (!extra.img && !extra.sticker)))) return;
    var msg = Object.assign({ from: S.me.id, text: clean(text), color: UI.msgColor }, extra || {});
    pushRoomMsg(room, msg);
    S.me.msgCount = (S.me.msgCount || 0) + 1;
    if (S.me.msgCount >= 5) S.me.ach.chatter = true;
    addXP(2);
    completeTask("msg", 25);
    save(); renderTop();
  }

  /* ========= 14. إدارة المقاعد والمايك + نافذة البروفايل الاحترافية من المقعد ========= */
  function sendLiveReaction(emoji, targetUid, targetName) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    showFlyGiftToSeat(emoji, S.me.name, targetUid || "room", targetName || room.name);
    if (cloud.on && cloud.db) {
      cloud.db.ref("rooms/" + room.id + "/reactions").push({
        emoji: emoji,
        fromUid: S.me.id,
        fromName: S.me.name,
        targetUid: targetUid || "room",
        targetName: targetName || room.name,
        t: serverTs()
      }).catch(function () { /* */ });
    }
  }

  function openSpeakerReactions(u) {
    var list = ["👏", "❤️", "🔥", "😂"];
    var html = "<h3>تفاعل مع " + esc(u.name) + '</h3><div style="display:flex;gap:10px;justify-content:center;padding:8px 0">';
    list.forEach(function (em) {
      html += '<button class="btn ghost" data-react="' + em + '" style="font-size:24px;padding:8px 14px" type="button">' + em + "</button>";
    });
    html += "</div>";
    openSheet(html);
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-react]");
      if (!b) return;
      closeSheet();
      sendLiveReaction(b.getAttribute("data-react"), u.id, u.name);
    };
  }

  function openHandQueueSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var isStaff = canControlMusic(room);
    var mySeat = seatIndexOf(room, S.me.id);
    var alreadyRaised = !!(UI.micQueue && UI.micQueue[S.me.id]);
    var entries = Object.keys(UI.micQueue || {}).map(function (k) {
      return { uid: k, item: UI.micQueue[k] };
    });

    var html = "<h3>✋ طابور طلب المايك</h3>";
    if (mySeat < 0) {
      html += '<button class="btn block" id="hq-raise" type="button">' + (alreadyRaised ? "✋ إلغاء رفع اليد" : "✋ ارفع يدك لطلب المايك") + "</button>";
    }

    if (entries.length) {
      html += '<div style="margin-top:12px">';
      entries.forEach(function (ent) {
        var u = getUser(ent.uid);
        var allowBtn = isStaff ? '<button class="btn sm" data-allowmic="' + esc(ent.uid) + '" type="button">اسمح له بالصعود</button>' : "";
        html += '<div class="row glass" style="margin-bottom:6px">' + avatarHTML(u, "sm") +
          '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">بانتظار المايك</div></div>' + allowBtn + "</div>";
      });
      html += "</div>";
    } else {
      html += '<div class="empty">لا يوجد أحد في طابور المايك</div>';
    }

    openSheet(html);

    if ($("hq-raise")) {
      $("hq-raise").onclick = function () {
        if (alreadyRaised) {
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/micQueue/" + S.me.id).remove().catch(function () { /* */ });
          delete UI.micQueue[S.me.id];
          toast("تم إنزال اليد");
        } else {
          if (cloud.on && cloud.db) {
            cloud.db.ref("rooms/" + room.id + "/micQueue/" + S.me.id).set({ uid: S.me.id, name: S.me.name, t: serverTs() }).catch(function () { /* */ });
          }
          UI.micQueue[S.me.id] = { uid: S.me.id, name: S.me.name, t: now() };
          room.mods.concat(room.owner).forEach(function (staffId) {
            if (staffId && staffId !== S.me.id) addNotif("✋", S.me.name + " يطلب المايك في " + room.name, staffId);
          });
          toast("تم رفع يدك ✋");
        }
        closeSheet();
      };
    }

    $("sheet").querySelectorAll("[data-allowmic]").forEach(function (btn) {
      btn.onclick = function () {
        var targetUid = btn.getAttribute("data-allowmic");
        var freeIdx = -1;
        for (var i = 0; i < room.seats.length; i++) {
          if (!room.seats[i].uid && !room.seats[i].locked) { freeIdx = i; break; }
        }
        if (freeIdx < 0) { toast("لا يوجد مقعد فارغ حالياً"); return; }
        room.seats[freeIdx].uid = targetUid;
        room.seats[freeIdx].muted = false;
        room.listeners = room.listeners.filter(function (x) { return x !== targetUid; });
        delete UI.micQueue[targetUid];
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["rooms/" + room.id + "/seats/" + freeIdx + "/uid"] = targetUid;
          ups["rooms/" + room.id + "/seats/" + freeIdx + "/muted"] = false;
          ups["rooms/" + room.id + "/listeners/" + targetUid] = null;
          ups["rooms/" + room.id + "/micQueue/" + targetUid] = null;
          cloud.db.ref().update(ups).catch(function () { /* */ });
        }
        renderRoom();
        toast("تم السماح لـ " + getUser(targetUid).name + " بالصعود 🎤");
        closeSheet();
      };
    });
  }

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

  /* فتح نافذة الملف الشخصي الاحترافية من مقاعد الغرفة الصوتية */
  function openSeatUserProfile(seatIdx) {
    var room = getRoom(UI.roomId);
    if (!room || !room.seats[seatIdx]) return;
    var s = room.seats[seatIdx];
    var targetUid = s.uid;
    if (!targetUid) return;

    cleanup("seat_profile");
    UI.activeSeatProfileUid = targetUid;
    UI.activeSeatProfileIdx = seatIdx;

    function buildAndRender(userData, socialData) {
      var curRoom = getRoom(UI.roomId);
      if (!curRoom || !curRoom.seats[seatIdx] || curRoom.seats[seatIdx].uid !== targetUid) {
        closeSheet();
        return;
      }
      var curSeat = curRoom.seats[seatIdx];
      var u = Object.assign({}, getUser(targetUid), userData || {});
      var isSelf = targetUid === S.me.id;
      var myRole = role(curRoom, S.me.id);
      var mySeat = seatIndexOf(curRoom, S.me.id);
      var canManage = myRole === "owner" || myRole === "mod";
      var isTargetOwner = targetUid === curRoom.owner;
      var isTargetMod = curRoom.mods.indexOf(targetUid) >= 0;

      var isF = S.friends.indexOf(targetUid) >= 0;
      var isFol = S.follows.indexOf(targetUid) >= 0;
      var blocked = S.blocked.indexOf(targetUid) >= 0;

      var hasVip = (u.vip || 0) > 0;
      var lv = u.level || (Math.floor((u.xp || 0) / CONFIG.xpPerLevel) + 1);
      var intoXp = (u.xp || 0) % CONFIG.xpPerLevel;
      var isVerified = !!(u.verified || hasVip || lv >= 5);

      var uNum = u.num || hashNum(targetUid);
      var isSeatMuted = !!(curSeat.muted || (isSelf && UI.micMuted));
      var isSpeaking = !isSeatMuted && !!voice.speakingNums[uNum];

      var seatRoleText = isTargetOwner ? "👑 مالك الغرفة" : (isTargetMod ? "🛡️ مشرف الغرفة" : "🎤 متحدث");
      var friendsCnt = socialData && socialData.friends
        ? Object.keys(socialData.friends).length
        : (isSelf ? S.friends.length : (u.friendsCount || 0));
      var followingCnt = socialData && socialData.follows
        ? Object.keys(socialData.follows).length
        : (isSelf ? S.follows.length : (u.following || 0));

      var showCeleb = !isSelf && (hasVip || lv >= 8) && !UI.celebratedProfiles[targetUid];
      if (showCeleb) UI.celebratedProfiles[targetUid] = true;

      var coverStyle = u.cover
        ? 'background-image:url("' + esc(u.cover) + '")'
        : "background:linear-gradient(135deg,#7c3aed,#db2777,#0891b2)";

      var blockedNotice = blocked
        ? '<div class="pinned" style="margin:0 0 10px;background:rgba(239,68,68,0.22);border-color:rgba(239,68,68,0.5)">🚫 هذا المستخدم في قائمة الحظر لديك</div>'
        : "";

      var freeSeatIdx = findFirstFreeSeatIndex(curRoom);
      var moveSeatBtnHtml = "";
      if (isSelf && freeSeatIdx >= 0) {
        moveSeatBtnHtml = '<button class="btn sm ghost" data-sp="moveseat" type="button">🔄 الانتقال لمقعد آخر (#' + (freeSeatIdx + 1) + ")</button>";
      } else if (!isSelf && canManage && mySeat >= 0 && mySeat !== seatIdx) {
        moveSeatBtnHtml = '<button class="btn sm ghost" data-sp="swap" type="button">🔄 تبديل المقعد معي</button>';
      }

      var seatCardHtml =
        '<div class="seat-status-card">' +
          '<div style="display:flex;justify-content:space-between;align-items:center;gap:6px">' +
            '<b style="font-size:12.5px">🎙️ معلومات المقعد الصوتي</b>' +
            moveSeatBtnHtml +
          "</div>" +
          '<div class="seat-status-pills">' +
            '<span class="seat-pill">🪑 مقعد #' + (seatIdx + 1) + "</span>" +
            '<span class="seat-pill">' + seatRoleText + "</span>" +
            '<span class="seat-pill ' + (isSeatMuted ? "muted" : "live") + '">' + (isSeatMuted ? "🔇 المايك مكتوم" : "🎤 المايك مفتوح") + "</span>" +
            '<span id="sp-live-speak-pill" class="seat-pill ' + (isSeatMuted ? "muted" : (isSpeaking ? "live" : "")) + '">' +
              (isSeatMuted ? "🔇 مكتوم" : (isSpeaking ? "🎙️ يتحدث الآن" : "🎤 صامت")) +
            "</span>" +
          "</div>" +
        "</div>";

      var actionBtnsHtml = "";
      if (isSelf) {
        actionBtnsHtml =
          '<div class="social-grid">' +
            '<button class="btn" data-sp="editme" type="button">✏️ تعديل ملفي الشخصي</button>' +
            '<button class="btn ghost" data-sp="fullme" type="button">👤 عرض حسابي بالكامل</button>' +
            '<button class="btn ghost" data-sp="share" type="button">📤 مشاركة حسابي</button>' +
            '<button class="btn red" data-sp="leave_seat" type="button">⬇️ النزول من المقعد</button>' +
          "</div>";
      } else {
        actionBtnsHtml =
          '<div class="social-grid">' +
            '<button class="btn ' + (isFol ? "ghost" : "") + '" data-sp="follow" type="button">' + (isFol ? "✔ متابَع (إلغاء)" : "➕ متابعة") + "</button>" +
            (isF
              ? '<button class="btn ghost" data-sp="unfriend" type="button">💔 إزالة صديق</button>'
              : (S.sentReq.indexOf(targetUid) >= 0
                ? '<button class="btn ghost" data-sp="cancelreq" type="button">⏳ إلغاء الطلب</button>'
                : '<button class="btn" data-sp="add" type="button">👥 إضافة صديق</button>')) +
            '<button class="btn" data-sp="dm" type="button">💬 رسالة خاصة</button>' +
            '<button class="btn gold" data-sp="gift" type="button">🎁 إرسال هدية</button>' +
            '<button class="btn ghost" data-sp="invite" type="button">🎙️ دعوة للغرفة</button>' +
            '<button class="btn ghost" data-sp="fullprofile" type="button">🪪 الملف بالكامل</button>' +
            '<button class="btn ghost" data-sp="share" type="button">📤 مشاركة الحساب</button>' +
            '<button class="btn ghost" data-sp="react" type="button">👏 تفاعل سريع</button>' +
          "</div>";

        if (canManage && !isTargetOwner && !(myRole === "mod" && isTargetMod)) {
          actionBtnsHtml +=
            '<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border)">' +
              '<div class="small" style="margin-bottom:6px;font-weight:800">🛡️ صلاحيات إدارة الغرفة:</div>' +
              '<div class="social-grid">' +
                '<button class="btn sm ghost" data-sp="admin_mute" type="button">' + (curSeat.muted ? "🔊 إلغاء كتمه" : "🔇 كتم المايك") + "</button>" +
                '<button class="btn sm ghost" data-sp="admin_down" type="button">⬇️ إنزال من المقعد</button>' +
                (myRole === "owner"
                  ? '<button class="btn sm ghost" data-sp="admin_mod" type="button">' + (isTargetMod ? "إزالة الإشراف" : "👑 ترقية مشرف") + "</button>"
                  : "") +
                '<button class="btn sm red" data-sp="admin_kick" type="button">🚫 طرد من الغرفة</button>' +
              "</div>" +
            "</div>";
        }

        actionBtnsHtml +=
          '<div class="actlist" style="margin-top:10px">' +
            '<button data-sp="block" class="danger" type="button">' + (blocked ? "🔓 إلغاء حظر المستخدم" : "🚫 حظر المستخدم") + "</button>" +
            '<button data-sp="report" class="danger" type="button">⚠️ الإبلاغ عن المستخدم</button>' +
          "</div>";
      }

      var html =
        (showCeleb ? '<div style="text-align:center"><span class="celeb-banner">✨ عضو مميز: ' + esc(u.name) + " ✨</span></div>" : "") +
        blockedNotice +
        seatCardHtml +
        '<div class="glass pf-hero-card" style="margin-bottom:10px">' +
          '<div class="pf-cover" style="' + coverStyle + ';height:92px"></div>' +
          '<div class="pf-body">' +
            '<div class="frame ' + (hasVip ? "vip-frame" : "") + '" style="display:inline-block">' + avatarHTML(u, "lg") + "</div>" +
            '<h3 style="margin:8px 0 2px;font-size:17px;font-weight:900">' + esc(u.name) +
              (isVerified ? ' <span class="tag verified">✔ موثق</span>' : "") +
              (hasVip ? ' <span class="tag vip">👑 VIP ' + u.vip + "</span>" : "") +
            "</h3>" +
            '<div class="pf-id-chip" data-copyid="' + esc(u.id) + '">ID: ' + esc(u.id) + " • 📋 نسخ</div>" +
            '<div class="small" style="margin-top:6px">' +
              (u.online ? "🟢 متصل الآن" : "⚪ غير متصل") +
              " • " + esc(u.country || "🌍 غير محدد") +
              " • المستوى " + lv +
            "</div>" +
            '<p class="small" style="margin:8px 0;line-height:1.6">' + esc(u.bio || "لا توجد نبذة شخصية") + "</p>" +
            '<div style="margin:8px 0;text-align:right">' +
              '<div style="display:flex;justify-content:space-between;font-size:11px">' +
                "<span>المستوى <b>" + lv + "</b></span>" +
                "<span>" + (u.xp || 0) + " XP (" + intoXp + "/" + CONFIG.xpPerLevel + ")</span>" +
              "</div>" +
              '<div class="bar"><i style="width:' + (intoXp / CONFIG.xpPerLevel * 100) + '%"></i></div>' +
            "</div>" +
            '<div class="pf-stats">' +
              '<div class="stat"><b>' + (u.followers || 0) + "</b><span>المتابعون</span></div>" +
              '<div class="stat"><b>' + followingCnt + "</b><span>المتابَعون</span></div>" +
              '<div class="stat"><b>' + friendsCnt + "</b><span>الأصدقاء</span></div>" +
              '<div class="stat"><b>' + (u.gifts || 0) + "</b><span>الهدايا</span></div>" +
              '<div class="stat"><b>Lv.' + lv + "</b><span>المستوى</span></div>" +
              '<div class="stat"><b>' + (u.xp || 0) + "</b><span>نقاط الخبرة</span></div>" +
            "</div>" +
          "</div>" +
        "</div>" +
        actionBtnsHtml +
        '<div style="margin-top:10px">' + renderGiftsAndCollectionsHTML(u) + "</div>";

      openSheet(html);

      $("sheet").onclick = function (e) {
        if (e.target.closest("[data-copyid]")) {
          copyText(targetUid, "تم نسخ ID المستخدم 📋");
          return;
        }
        var btn = e.target.closest("[data-sp]");
        if (!btn) return;
        var act = btn.getAttribute("data-sp");

        if (act === "editme") {
          closeSheet();
          openEditProfile();
        } else if (act === "fullme") {
          closeSheet();
          leaveRoom(false);
          go("profile");
        } else if (act === "leave_seat") {
          closeSheet();
          stepOffSeat(curRoom, seatIdx);
        } else if (act === "moveseat") {
          var nextFree = findFirstFreeSeatIndex(curRoom);
          if (nextFree < 0) { toast("لا يوجد مقعد آخر فارغ حالياً"); return; }
          closeSheet();
          takeSeat(curRoom, nextFree);
        } else if (act === "swap") {
          if (mySeat < 0) return;
          var otherUid = curRoom.seats[seatIdx].uid;
          curRoom.seats[mySeat].uid = otherUid;
          curRoom.seats[seatIdx].uid = S.me.id;
          bindSeatDisconnect(curRoom.id, seatIdx);
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + curRoom.id + "/seats/" + mySeat + "/uid"] = otherUid;
            ups["rooms/" + curRoom.id + "/seats/" + seatIdx + "/uid"] = S.me.id;
            cloud.db.ref().update(ups).catch(function () { /* */ });
          }
          saveLocal();
          renderRoom();
          closeSheet();
          toast("تم تبديل المقعد 🔄");
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
          buildAndRender(u, socialData);
        } else if (act === "add") {
          sendFriendReq(targetUid);
          buildAndRender(u, socialData);
        } else if (act === "cancelreq") {
          S.sentReq = S.sentReq.filter(function (x) { return x !== targetUid; });
          if (cloud.on && cloud.db) {
            var upsReq = {};
            upsReq["social/" + S.me.id + "/sentReq/" + targetUid] = null;
            upsReq["social/" + targetUid + "/requests/" + S.me.id] = null;
            cloud.db.ref().update(upsReq).catch(function () { /* */ });
          }
          saveLocal();
          buildAndRender(u, socialData);
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
          buildAndRender(u, socialData);
        } else if (act === "dm") {
          closeSheet();
          openDM(targetUid);
        } else if (act === "gift") {
          closeSheet();
          openGifts(targetUid);
        } else if (act === "invite") {
          addNotif("🎙️", S.me.name + " يدعوك للانضمام إلى غرفة: " + curRoom.name, targetUid);
          toast("تم إرسال دعوة الغرفة إلى " + u.name + " ✅");
        } else if (act === "fullprofile") {
          closeSheet();
          openProfile(targetUid);
        } else if (act === "share") {
          var shareUrl = location.href.split("#")[0] + "?user=" + encodeURIComponent(targetUid);
          if (navigator.share) {
            navigator.share({ title: u.name + " — REAL VOICE", url: shareUrl }).catch(function () { copyText(shareUrl, "تم نسخ رابط الحساب 📋"); });
          } else {
            copyText(shareUrl, "تم نسخ رابط الحساب 📋");
          }
        } else if (act === "react") {
          closeSheet();
          openSpeakerReactions(u);
        } else if (act === "admin_mute") {
          curRoom.seats[seatIdx].muted = !curRoom.seats[seatIdx].muted;
          if (cloud.on && cloud.db) {
            cloud.db.ref("rooms/" + curRoom.id + "/seats/" + seatIdx + "/muted").set(curRoom.seats[seatIdx].muted).catch(function () { /* */ });
          }
          saveLocal();
          renderRoom();
          toast(curRoom.seats[seatIdx].muted ? "تم كتم " + u.name + " 🔇" : "تم إلغاء الكتم 🔊");
          buildAndRender(u, socialData);
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
          closeSheet();
          toast("تم إنزال " + u.name + " من المقعد");
        } else if (act === "admin_mod") {
          toggleMod(curRoom, targetUid);
          buildAndRender(u, socialData);
        } else if (act === "admin_kick") {
          closeSheet();
          kickUser(curRoom, targetUid, false);
        } else if (act === "block") {
          if (blocked) {
            S.blocked = S.blocked.filter(function (x) { return x !== targetUid; });
            if (cloud.on && cloud.db) cloud.db.ref("social/" + S.me.id + "/blocked/" + targetUid).remove().catch(function () { /* */ });
            toast("تم إلغاء الحظر");
          } else {
            S.blocked.push(targetUid);
            S.friends = S.friends.filter(function (x) { return x !== targetUid; });
            if (cloud.on && cloud.db) {
              var upsBlk = {};
              upsBlk["social/" + S.me.id + "/blocked/" + targetUid] = true;
              upsBlk["social/" + S.me.id + "/friends/" + targetUid] = null;
              upsBlk["social/" + targetUid + "/friends/" + S.me.id] = null;
              cloud.db.ref().update(upsBlk).catch(function () { /* */ });
            }
            toast("تم حظر المستخدم 🚫");
          }
          saveLocal();
          buildAndRender(u, socialData);
        } else if (act === "report") {
          closeSheet();
          toast("تم إرسال البلاغ للمراجعة ⚠️");
        }
      };
    }

    if (cloud.on && cloud.db && targetUid !== S.me.id) {
      openSheet(
        '<div class="pf-loader-wrap">' +
          '<div class="pf-spinner"></div>' +
          '<div style="font-weight:800;font-size:13px">جاري تحميل بيانات الملف الشخصي...</div>' +
          '<div class="small" style="margin-top:4px">ID: ' + esc(targetUid) + "</div>" +
        "</div>"
      );

      var latestUser = null;
      var latestSocial = null;
      var fallbackDone = false;

      var fallbackTid = trackTimer("seat_profile", setTimeout(function () {
        if (!fallbackDone) {
          fallbackDone = true;
          buildAndRender(latestUser || getUser(targetUid), latestSocial || {});
        }
      }, 1500), "timeout");

      trackListener("seat_profile", cloud.db.ref("users/" + targetUid), "value", function (usnap) {
        if (UI.activeSeatProfileUid !== targetUid) return;
        fallbackDone = true;
        clearTimeout(fallbackTid);
        var val = usnap.val();
        if (val) {
          cloud.usersMap[targetUid] = Object.assign({ id: targetUid }, val);
          latestUser = cloud.usersMap[targetUid];
        } else {
          latestUser = getUser(targetUid);
        }
        buildAndRender(latestUser, latestSocial || {});
      });

      trackListener("seat_profile", cloud.db.ref("social/" + targetUid), "value", function (ssnap) {
        if (UI.activeSeatProfileUid !== targetUid) return;
        latestSocial = ssnap.val() || {};
        if (fallbackDone) {
          buildAndRender(latestUser || getUser(targetUid), latestSocial);
        }
      });
    } else {
      buildAndRender(getUser(targetUid), {});
    }
  }

  function onSeatTap(i, avatarClicked) {
    resumeAllRemoteAudioTracks();
    var room = getRoom(UI.roomId);
    if (!room || !room.seats[i]) return;
    var s = room.seats[i], myRole = role(room, S.me.id), mySeat = seatIndexOf(room, S.me.id);
    var canManage = myRole === "owner" || myRole === "mod";
    var items = [];

    if (!s.uid) {
      if (s.locked && !canManage) { toast("هذا المقعد مقفل 🔒"); return; }
      if (!s.locked) {
        items.push({
          label: mySeat >= 0 ? "🪑 انتقل إلى هذا المقعد" : "🪑 اصعد إلى المايك",
          fn: function () { takeSeat(room, i); }
        });
      }
      if (canManage) {
        items.push({
          label: s.locked ? "🔓 فتح المقعد" : "🔒 قفل المقعد",
          fn: function () {
            s.locked = !s.locked;
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + i + "/locked").set(s.locked).catch(function () { /* */ });
            saveLocal(); renderRoom();
          }
        });
      }
      if (myRole === "owner") {
        items.push({
          label: s.vip ? "إلغاء VIP للمقعد" : "👑 جعل المقعد VIP",
          fn: function () {
            s.vip = !s.vip;
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + i + "/vip").set(s.vip).catch(function () { /* */ });
            saveLocal(); renderRoom();
          }
        });
      }
      if (!items.length) return;
      actionList("مقعد " + (i + 1), items);
      return;
    }

    if (avatarClicked) {
      openSeatUserProfile(i);
      return;
    }

    var u = getUser(s.uid);
    items.push({ label: "👤 عرض بطاقة الملف الشخصي", fn: function () { openSeatUserProfile(i); } });
    items.push({ label: "👏 تفاعل سريع (👏❤️🔥😂)", fn: function () { openSpeakerReactions(u); } });
    if (s.uid !== S.me.id) items.push({ label: "🎁 إرسال هدية على المقعد", fn: function () { openGifts(s.uid); } });

    if (s.uid === S.me.id) {
      items.push({
        label: "⬇️ مغادرة المقعد",
        fn: function () { stepOffSeat(room, i); }
      });
    } else if (canManage && s.uid !== room.owner && !(myRole === "mod" && room.mods.indexOf(s.uid) >= 0)) {
      items.push({
        label: s.muted ? "🔊 إلغاء كتم المستخدم" : "🔇 كتم المستخدم",
        fn: function () {
          s.muted = !s.muted;
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + i + "/muted").set(s.muted).catch(function () { /* */ });
          saveLocal(); renderRoom();
          toast(s.muted ? "تم كتم " + u.name : "تم إلغاء الكتم");
        }
      });
      items.push({
        label: "⬇️ إنزال من المقعد",
        fn: function () {
          var kickedUid = s.uid;
          room.seats[i].uid = null;
          room.seats[i].muted = false;
          if (room.listeners.indexOf(kickedUid) < 0) room.listeners.push(kickedUid);
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = null;
            ups["rooms/" + room.id + "/seats/" + i + "/muted"] = false;
            ups["rooms/" + room.id + "/listeners/" + kickedUid] = true;
            cloud.db.ref().update(ups).catch(function () { /* */ });
          }
          saveLocal(); renderRoom();
          toast("تم إنزال " + u.name);
        }
      });
      items.push({
        label: s.locked ? "🔓 فتح المقعد" : "🔒 قفل المقعد بعد الإنزال",
        fn: function () {
          var kickedUid = s.uid;
          room.seats[i].uid = null;
          room.seats[i].locked = true;
          if (room.listeners.indexOf(kickedUid) < 0) room.listeners.push(kickedUid);
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = null;
            ups["rooms/" + room.id + "/seats/" + i + "/locked"] = true;
            ups["rooms/" + room.id + "/listeners/" + kickedUid] = true;
            cloud.db.ref().update(ups).catch(function () { /* */ });
          }
          saveLocal(); renderRoom();
        }
      });
      if (myRole === "owner") {
        items.push({
          label: room.mods.indexOf(u.id) >= 0 ? "إزالة الإشراف" : "👑 ترقية مشرف",
          fn: function () { toggleMod(room, u.id); }
        });
      }
      items.push({ label: "🚫 طرد من الغرفة", danger: true, fn: function () { kickUser(room, u.id, false); } });
      items.push({ label: "⛔ حظر من الغرفة", danger: true, fn: function () { kickUser(room, u.id, true); } });
    }

    if (canManage && mySeat >= 0 && mySeat !== i && s.uid !== S.me.id) {
      items.push({
        label: "🔄 تبديل المكان معي",
        fn: function () {
          var otherUid = s.uid;
          room.seats[mySeat].uid = otherUid;
          s.uid = S.me.id;
          bindSeatDisconnect(room.id, i);
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + room.id + "/seats/" + mySeat + "/uid"] = otherUid;
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = S.me.id;
            cloud.db.ref().update(ups).catch(function () { /* */ });
          }
          saveLocal(); renderRoom();
        }
      });
    }
    actionList(u.name, items);
  }

  function takeSeat(room, i) {
    var cur = seatIndexOf(room, S.me.id);
    if (cur >= 0) room.seats[cur].uid = null;
    room.listeners = room.listeners.filter(function (x) { return x !== S.me.id; });
    room.seats[i].uid = S.me.id;
    room.seats[i].muted = false;
    delete UI.micQueue[S.me.id];

    bindSeatDisconnect(room.id, i);

    if (cloud.on && cloud.db) {
      var ups = {};
      ups["rooms/" + room.id + "/seats/" + i + "/uid"] = S.me.id;
      ups["rooms/" + room.id + "/seats/" + i + "/muted"] = false;
      ups["rooms/" + room.id + "/listeners/" + S.me.id] = null;
      ups["rooms/" + room.id + "/micQueue/" + S.me.id] = null;
      if (cur >= 0 && cur !== i) ups["rooms/" + room.id + "/seats/" + cur + "/uid"] = null;
      cloud.db.ref().update(ups).catch(function () { /* */ });
    }

    UI.micMuted = false;
    pushRoomMsg(room, { sys: true, text: S.me.name + " صعد إلى المايك 🎤" });
    addXP(3);
    completeTask("mic", 25);
    save(); renderRoom(); renderTop();

    if (voice.client && voice.client.connectionState === "CONNECTED") {
      publishLocalMic();
    } else {
      joinVoiceChannel(room.id, "publisher");
    }
  }

  function toggleMod(room, id) {
    var isMod = room.mods.indexOf(id) >= 0;
    if (isMod) room.mods.splice(room.mods.indexOf(id), 1);
    else room.mods.push(id);
    if (cloud.on && cloud.db) {
      cloud.db.ref("rooms/" + room.id + "/mods/" + id).set(isMod ? null : true).catch(function () { /* */ });
    }
    saveLocal(); renderRoom();
    toast(isMod ? "تمت إزالة الإشراف" : "تمت ترقية مشرف 👑");
  }

  function kickUser(room, id, ban) {
    var si = seatIndexOf(room, id);
    if (si >= 0) room.seats[si].uid = null;
    room.listeners = room.listeners.filter(function (x) { return x !== id; });
    if (ban && room.bans.indexOf(id) < 0) room.bans.push(id);
    if (cloud.on && cloud.db) {
      var ups = {};
      if (si >= 0) ups["rooms/" + room.id + "/seats/" + si + "/uid"] = null;
      ups["rooms/" + room.id + "/listeners/" + id] = null;
      if (ban) ups["rooms/" + room.id + "/bans/" + id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
    }
    saveLocal(); renderRoom();
    pushRoomMsg(room, { sys: true, text: getUser(id).name + (ban ? " تم حظره من الغرفة" : " تم طرده من الغرفة") });
  }

  /* ========= 15. قائمة الغرفة والهدايا الموجهة للمقعد ========= */
  function openBannedList(room) {
    var list = room.bans || [];
    var html = "<h3>🚫 قائمة المحظورين</h3>";
    if (!list.length) html += '<div class="empty">لا يوجد محظورون في هذه الغرفة</div>';
    list.forEach(function (bid) {
      var u = getUser(bid);
      html += '<div class="row glass">' + avatarHTML(u, "sm") +
        '<div class="info"><div class="name">' + esc(u.name) + '</div><div class="meta">' + esc(bid) + '</div></div>' +
        '<button class="btn sm" data-unbanroom="' + esc(bid) + '" type="button">فك الحظر</button></div>';
    });
    openSheet(html);
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-unbanroom]");
      if (!b) return;
      var target = b.getAttribute("data-unbanroom");
      if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/bans/" + target).remove().catch(function () { /* */ });
      room.bans = room.bans.filter(function (x) { return x !== target; });
      saveLocal();
      toast("تم فك الحظر");
      openBannedList(room);
    };
  }

  function openGamesSheet(room) {
    var html = "<h3>🎮 ألعاب الغرفة</h3><div class='actlist'>" +
      '<button data-g="wheel" type="button">🎡 عجلة الحظ (مكافأة 50 - 200 عملة)</button>' +
      '<button data-g="tod" type="button">🎭 صراحة أم تحدٍ</button>' +
      '<button data-g="quiz" type="button">🧠 تحدي الأسئلة الجماعي</button>' +
      '<button data-g="quizstop" class="danger" type="button">⏹️ إيقاف سؤال الأسئلة</button>' +
      "</div>";
    openSheet(html);
    $("sheet").onclick = function (e) {
      var btn = e.target.closest("[data-g]");
      if (!btn) return;
      var g = btn.getAttribute("data-g");
      closeSheet();
      if (g === "wheel") {
        var prizes = [50, 75, 100, 150, 200];
        var win = prizes[Math.floor(Math.random() * prizes.length)];
        S.me.coins += win;
        addXP(5);
        save(); renderTop();
        pushRoomMsg(room, { sys: true, text: "🎡 " + S.me.name + " أدار عجلة الحظ وفاز بـ " + win + " عملة! 🪙" });
        toast("مبروك! فزت بـ " + win + " عملة 🎉");
      } else if (g === "tod") {
        var promptTxt = TRUTH_OR_DARE[Math.floor(Math.random() * TRUTH_OR_DARE.length)];
        pushRoomMsg(room, { sys: true, text: "🎭 " + promptTxt });
      } else if (g === "quiz") {
        var item = QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];
        var qObj = { id: uid(), active: true, q: item.q, opts: item.opts, ans: item.ans, answers: {} };
        UI.quiz = qObj;
        renderQuizBox();
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/quiz/current").set(qObj).catch(function () { /* */ });
        pushRoomMsg(room, { sys: true, text: "🧠 بدأ تحدي الأسئلة: " + item.q });
      } else if (g === "quizstop") {
        UI.quiz = null;
        renderQuizBox();
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/quiz/current").remove().catch(function () { /* */ });
      }
    };
  }

  function openRoomThemesSheet(room) {
    var html = "<h3>🎨 ثيم وخلفية الغرفة</h3>" +
      '<div class="glass" style="padding:11px;margin-bottom:10px">' +
      '<div style="font-weight:800;font-size:13px;margin-bottom:6px">🖼️ رفع صورة خلفية من المعرض</div>' +
      '<input id="rt-bgfile" type="file" accept="image/*" />' +
      "</div>" +
      "<div class='actlist'>" +
      ROOM_THEMES.map(function (t, i) {
        return '<button data-rtheme="' + i + '" type="button">🎨 ' + esc(t.name) + "</button>";
      }).join("") +
      "</div>";
    openSheet(html);
    $("rt-bgfile").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        var dataUrl = await readImageFileAsDataUrl(f, 540, 0.58);
        var customTheme = { id: "custom", name: "خلفية مخصصة", bgImage: dataUrl, accent: "#ec4899" };
        room.theme = customTheme;
        applyRoomTheme(customTheme);
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/theme").set(customTheme).catch(function () { /* */ });
        saveLocal();
        closeSheet();
        toast("تم تغيير خلفية الغرفة ✅");
      } catch (err) {
        toast(err.message || "تعذر تغيير الخلفية");
      }
    };
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-rtheme]");
      if (!b) return;
      var t = ROOM_THEMES[Number(b.getAttribute("data-rtheme"))];
      if (!t) return;
      room.theme = t;
      applyRoomTheme(t);
      if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/theme").set(t).catch(function () { /* */ });
      saveLocal();
      closeSheet();
      toast("تم تطبيق ثيم: " + t.name);
    };
  }

  function openRoomMenu() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var r = role(room, S.me.id), items = [];
    items.push({ label: "👥 قائمة المتصلين (" + count(room) + ")", fn: function () { openParticipants(room); } });
    items.push({ label: "🎮 ألعاب الغرفة (عجلة الحظ / أسئلة)", fn: function () { openGamesSheet(room); } });
    items.push({ label: "🔗 مشاركة رابط الغرفة", fn: function () { copyText(location.href.split("#")[0] + "?room=" + room.id, "تم نسخ رابط الغرفة 📋"); } });

    if (r === "owner" || r === "mod") {
      items.push({ label: "🎨 تغيير ثيم وخلفية الغرفة", fn: function () { openRoomThemesSheet(room); } });
      items.push({ label: "🚫 قائمة المحظورين (" + (room.bans || []).length + ")", fn: function () { openBannedList(room); } });
      items.push({
        label: "📌 رسالة مثبتة",
        fn: function () {
          openSheet('<h3>رسالة مثبتة</h3><input id="pin-in" maxlength="70" value="' + esc(room.pinned) + '" /><button class="btn block" id="pin-ok" type="button">حفظ</button>');
          $("pin-ok").onclick = function () {
            room.pinned = clean($("pin-in").value.trim());
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/pinned").set(room.pinned).catch(function () { /* */ });
            saveLocal(); closeSheet(); renderRoom();
          };
        }
      });
      items.push({
        label: "🔇 كتم جميع المقاعد",
        fn: function () {
          var ups = {};
          room.seats.forEach(function (s, idx) {
            if (s.uid && s.uid !== S.me.id) {
              s.muted = true;
              ups["rooms/" + room.id + "/seats/" + idx + "/muted"] = true;
            }
          });
          if (cloud.on && cloud.db && Object.keys(ups).length) cloud.db.ref().update(ups).catch(function () { /* */ });
          saveLocal(); renderRoom(); toast("تم كتم الجميع");
        }
      });
      items.push({
        label: "🧹 مسح الدردشة",
        fn: function () {
          room.msgs = [];
          cloud.roomMsgs[room.id] = [];
          if (cloud.on && cloud.db) cloud.db.ref("roomMessages/" + room.id).remove().catch(function () { /* */ });
          saveLocal(); renderRoomChat();
        }
      });
    }

    if (r === "owner") {
      items.push({
        label: room.locked ? "🔓 فتح الغرفة" : "🔒 قفل الغرفة",
        fn: function () {
          room.locked = !room.locked;
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/locked").set(room.locked).catch(function () { /* */ });
          saveLocal(); toast(room.locked ? "تم قفل الغرفة" : "تم فتح الغرفة");
        }
      });
      items.push({
        label: "✏️ تعديل الغرفة",
        fn: function () {
          openSheet('<h3>تعديل الغرفة</h3><label>الاسم</label><input id="er-n" value="' + esc(room.name) + '"><label>الوصف</label><input id="er-d" value="' + esc(room.desc) + '"><label>كلمة المرور</label><input id="er-p" value="' + esc(room.pass) + '"><button class="btn block" id="er-ok" type="button">حفظ</button>');
          $("er-ok").onclick = function () {
            var n = $("er-n").value.trim();
            if (n) room.name = clean(n);
            room.desc = clean($("er-d").value.trim());
            room.pass = $("er-p").value.trim();
            if (cloud.on && cloud.db) {
              cloud.db.ref("rooms/" + room.id).update({ name: room.name, desc: room.desc, pass: room.pass }).catch(function () { /* */ });
            }
            saveLocal(); closeSheet(); renderRoom();
          };
        }
      });
      items.push({
        label: "🗑️ إغلاق الغرفة نهائياً",
        danger: true,
        fn: function () {
          confirmBox("سيتم إغلاق الغرفة نهائياً وطرد جميع الأعضاء.", function () {
            var rid = room.id;
            S.rooms = S.rooms.filter(function (x) { return x.id !== rid; });
            if (cloud.on && cloud.db) {
              cloud.db.ref("rooms/" + rid).remove().catch(function () { /* */ });
              cloud.db.ref("roomMessages/" + rid).remove().catch(function () { /* */ });
            }
            saveLocal(); leaveRoom(false);
          });
        }
      });
    } else {
      items.push({
        label: "⚠️ الإبلاغ عن الغرفة",
        danger: true,
        fn: function () { toast("تم إرسال البلاغ للمراجعة ⚠️"); }
      });
    }
    actionList(room.name, items);
  }

  function openParticipants(room) {
    var ids = getRoomParticipantIds(room);
    var html = "<h3>👥 المتصلون في الغرفة (" + ids.length + ")</h3>";
    if (!ids.length) html += '<div class="empty">لا يوجد متصلون حالياً</div>';
    ids.forEach(function (id) {
      var u = getUser(id), r = role(room, id);
      var seatIdx = seatIndexOf(room, id);
      var tag = r === "owner" ? '<span class="tag vip">👑 مالك</span>' : (r === "mod" ? '<span class="tag">🛡️ مشرف</span>' : "");
      var posTxt = seatIdx >= 0 ? "على المايك (مقعد " + (seatIdx + 1) + ")" : "مستمع";
      html += '<div class="row glass" data-profile="' + esc(id) + '">' + avatarHTML(u, "sm") + '<div class="info"><div class="name">' + userNameHTML(u) + tag + '</div><div class="meta">' + posTxt + "</div></div></div>";
    });
    openSheet(html);
  }

  function openGifts(preselectUid) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    if (preselectUid) UI.giftTarget = preselectUid;

    var seatedUsers = [];
    room.seats.forEach(function (s, idx) {
      if (s && s.uid) {
        seatedUsers.push({ uid: s.uid, seatNum: idx + 1, user: getUser(s.uid) });
      }
    });

    if (UI.giftTarget !== "room" && !seatedUsers.some(function (x) { return x.uid === UI.giftTarget; })) {
      UI.giftTarget = seatedUsers.length ? seatedUsers[0].uid : "room";
    }

    var targetsHtml = '<div class="gift-targets-bar">' +
      '<div class="gt-chip ' + (UI.giftTarget === "room" ? "sel" : "") + '" data-gt="room">' +
        '<div class="gt-chip-av">🏠</div>' +
        "<span>الغرفة</span>" +
      "</div>" +
      seatedUsers.map(function (item) {
        var u = item.user;
        var avInner = u.photo ? '<img src="' + esc(u.photo) + '" alt="" />' : esc(initials(u.name));
        return '<div class="gt-chip ' + (UI.giftTarget === item.uid ? "sel" : "") + '" data-gt="' + esc(item.uid) + '">' +
          '<div class="gt-chip-av">' + avInner + "</div>" +
          "<span>" + esc(u.name) + "</span>" +
        "</div>";
      }).join("") +
    "</div>";

    var html = "<h3>🎁 صندوق الهدايا — اختر المستلم</h3>" +
      targetsHtml +
      '<div class="giftgrid">' +
      GIFTS.map(function (g) {
        return '<div class="gift ' + (UI.giftSel === g.id ? "sel" : "") + '" data-g="' + g.id + '"><div class="e">' + g.e + "</div><small>" + g.n + '</small><div class="p">🪙 ' + g.p + "</div></div>";
      }).join("") +
      '</div><button class="btn block" id="send-gift" type="button">إرسال الهدية الآن (رصيدك: ' + S.me.coins + " 🪙)</button>";

    openSheet(html);

    $("sheet").onclick = function (e) {
      var gt = e.target.closest("[data-gt]");
      if (gt) {
        UI.giftTarget = gt.getAttribute("data-gt");
        $("sheet").querySelectorAll("[data-gt]").forEach(function (x) {
          x.classList.toggle("sel", x.getAttribute("data-gt") === UI.giftTarget);
        });
        return;
      }

      var g = e.target.closest("[data-g]");
      if (g) {
        UI.giftSel = g.getAttribute("data-g");
        $("sheet").querySelectorAll("[data-g]").forEach(function (x) {
          x.classList.toggle("sel", x.getAttribute("data-g") === UI.giftSel);
        });
        return;
      }

      if (e.target.id === "send-gift") {
        var gift = null;
        for (var i = 0; i < GIFTS.length; i++) if (GIFTS[i].id === UI.giftSel) gift = GIFTS[i];
        if (!gift) return;
        if (S.me.coins < gift.p) { toast("رصيدك لا يكفي 🪙"); return; }

        S.me.coins -= gift.p;
        S.me.sent = (S.me.sent || 0) + 1;
        S.me.ach.giver = true;

        var targetName = room.name;
        var targetUid = UI.giftTarget;

        if (targetUid && targetUid !== "room") {
          var tUser = getUser(targetUid);
          targetName = tUser.name;
          if (targetUid === S.me.id) {
            S.me.gifts = (S.me.gifts || 0) + 1;
            S.me.receivedGifts.push({ id: gift.id, e: gift.e, n: gift.n, p: gift.p, fromUid: S.me.id, fromName: S.me.name, t: now() });
          } else if (cloud.on && cloud.db) {
            cloud.db.ref("users/" + targetUid + "/gifts").transaction(function (c) { return (c || 0) + 1; }).catch(function () { /* */ });
            cloud.db.ref("users/" + targetUid + "/receivedGifts").transaction(function (arr) {
              var list = Array.isArray(arr) ? arr : [];
              list.push({ id: gift.id, e: gift.e, n: gift.n, p: gift.p, fromUid: S.me.id, fromName: S.me.name, t: Date.now() });
              return list.slice(-30);
            }).catch(function () { /* */ });
            addNotif(gift.e, S.me.name + " أرسل لك هدية " + gift.n + "!", targetUid);
          }
        }

        addXP(Math.max(5, Math.floor(gift.p / 10)));
        closeSheet();

        showFlyGiftToSeat(gift.e, S.me.name, targetUid, targetName);

        pushRoomMsg(room, {
          from: S.me.id,
          giftAnim: { e: gift.e, fromName: S.me.name, toUid: targetUid, toName: targetName },
          text: gift.e + " أرسل " + gift.n + " إلى " + targetName + "!"
        });
        save(); renderTop();
      }
    };
  }

  /* ========= 16. الملف الشخصي الكامل والأصدقاء والرسائل ========= */
  function openProfile(id) {
    if (!id) return;
    if (id === S.me.id) {
      closeSheet();
      if (UI.roomId) leaveRoom(false);
      go("profile");
      return;
    }
    var u = getUser(id);
    var isF = S.friends.indexOf(id) >= 0;
    var isFol = S.follows.indexOf(id) >= 0;
    var blocked = S.blocked.indexOf(id) >= 0;
    var room = null;
    for (var i = 0; i < S.rooms.length; i++) if (inRoom(S.rooms[i], id)) { room = S.rooms[i]; break; }

    var showCeleb = (u.vip > 0 || (u.level || 1) >= 8) && !UI.celebratedProfiles[id];
    if (showCeleb) UI.celebratedProfiles[id] = true;

    var coverStyle = u.cover
      ? 'background-image:url("' + esc(u.cover) + '")'
      : "background:linear-gradient(135deg,#7c3aed,#db2777,#0891b2)";

    var html =
      (showCeleb ? '<div style="text-align:center"><span class="celeb-banner">✨ عضو مميز: ' + esc(u.name) + " ✨</span></div>" : "") +
      '<div class="glass pf-hero-card" style="margin-bottom:10px">' +
      '<div class="pf-cover" style="' + coverStyle + '"></div>' +
      '<div class="pf-body">' +
      '<div class="frame ' + ((u.vip || 0) > 0 ? "vip-frame" : "") + '" style="display:inline-block">' + avatarHTML(u, "lg") + "</div>" +
      '<h3 style="margin:8px 0 2px">' + userNameHTML(u) + "</h3>" +
      '<div class="pf-id-chip" data-copyid="' + esc(u.id) + '">ID: ' + esc(u.id) + " • 📋 نسخ</div>" +
      '<div class="small" style="margin-top:6px">' + (u.online ? "🟢 متصل" : "⚪ غير متصل") + " • المستوى " + (u.level || 1) + " • " + esc(u.country || "") + "</div>" +
      '<p class="small" style="margin:8px 0">' + esc(u.bio || "") + "</p>" +
      '<div class="pf-stats">' +
      '<div class="stat"><b>' + (u.followers || 0) + '</b><span>المتابعون</span></div>' +
      '<div class="stat"><b>' + (u.following || 0) + '</b><span>أتابع</span></div>' +
      '<div class="stat"><b>' + (u.friendsCount || 0) + '</b><span>الأصدقاء</span></div>' +
      '<div class="stat"><b>' + (u.gifts || 0) + '</b><span>الهدايا</span></div>' +
      '<div class="stat"><b>' + (u.roomsJoined || u.visits || 0) + '</b><span>الغرف</span></div>' +
      '<div class="stat"><b>' + Math.max(0, Math.floor((u.roomSeconds || 0) / 60)) + ' د</b><span>الوقت</span></div>' +
      "</div>" +
      '<div style="display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:12px">' +
      (isF ? '<button class="btn sm ghost" data-p="unfriend" type="button">💔 إلغاء الصداقة</button>' : (S.sentReq.indexOf(id) >= 0 ? '<button class="btn sm ghost" data-p="cancelreq" type="button">تم إرسال الطلب</button>' : '<button class="btn sm" data-p="add" type="button">+ صديق</button>')) +
      '<button class="btn sm ' + (isFol ? "ghost" : "") + '" data-p="follow" type="button">' + (isFol ? "✔ متابَع" : "+ متابعة") + "</button>" +
      '<button class="btn sm" data-p="dm" type="button">💬 رسالة</button>' +
      (room ? '<button class="btn sm" data-p="join" type="button">🚪 انضم لغرفته</button>' : "") +
      "</div></div></div>" +
      renderGiftsAndCollectionsHTML(u) +
      renderVipSectionHTML(u, false) +
      '<div class="actlist" style="margin-top:10px">' +
      '<button data-p="share" type="button">📤 مشاركة رابط الحساب</button>' +
      '<button data-p="block" class="danger" type="button">' + (blocked ? "🔓 إلغاء الحظر" : "🚫 حظر المستخدم") + "</button>" +
      '<button data-p="report" class="danger" type="button">⚠️ الإبلاغ</button>' +
      "</div>";

    openSheet(html);

    $("sheet").onclick = function (e) {
      if (e.target.closest("[data-copyid]")) {
        copyText(id, "تم نسخ ID المستخدم 📋");
        return;
      }
      var b = e.target.closest("[data-p]");
      if (!b) return;
      var p = b.getAttribute("data-p");
      if (p === "add") { sendFriendReq(id); openProfile(id); }
      else if (p === "cancelreq") {
        S.sentReq = S.sentReq.filter(function (x) { return x !== id; });
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/sentReq/" + id] = null;
          ups["social/" + id + "/requests/" + S.me.id] = null;
          cloud.db.ref().update(ups).catch(function () { /* */ });
        }
        saveLocal(); openProfile(id);
      } else if (p === "unfriend") {
        S.friends = S.friends.filter(function (x) { return x !== id; });
        if (cloud.on && cloud.db) {
          var ups2 = {};
          ups2["social/" + S.me.id + "/friends/" + id] = null;
          ups2["social/" + id + "/friends/" + S.me.id] = null;
          cloud.db.ref().update(ups2).catch(function () { /* */ });
        }
        saveLocal(); renderFriends(); openProfile(id);
      } else if (p === "follow") {
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
          toast("تمت المتابعة");
        }
        saveLocal(); openProfile(id);
      } else if (p === "dm") { closeSheet(); openDM(id); }
      else if (p === "join" && room) { closeSheet(); enterRoom(room.id); }
      else if (p === "share") {
        var shareUrl = location.href.split("#")[0] + "?user=" + encodeURIComponent(id);
        copyText(shareUrl, "تم نسخ رابط الحساب 📋");
      } else if (p === "block") {
        if (blocked) {
          S.blocked = S.blocked.filter(function (x) { return x !== id; });
          if (cloud.on && cloud.db) cloud.db.ref("social/" + S.me.id + "/blocked/" + id).remove().catch(function () { /* */ });
          toast("تم إلغاء الحظر");
        } else {
          S.blocked.push(id);
          S.friends = S.friends.filter(function (x) { return x !== id; });
          if (cloud.on && cloud.db) {
            var ups3 = {};
            ups3["social/" + S.me.id + "/blocked/" + id] = true;
            ups3["social/" + S.me.id + "/friends/" + id] = null;
            ups3["social/" + id + "/friends/" + S.me.id] = null;
            cloud.db.ref().update(ups3).catch(function () { /* */ });
          }
          toast("تم حظر المستخدم");
        }
        saveLocal(); closeSheet(); renderAll();
      } else if (p === "report") { closeSheet(); toast("تم إرسال البلاغ للمراجعة ⚠️"); }
    };
  }

  function sendFriendReq(id) {
    if (S.friends.indexOf(id) >= 0 || S.sentReq.indexOf(id) >= 0) return;
    S.sentReq.push(id);
    if (cloud.on && cloud.db) {
      var ups = {};
      ups["social/" + S.me.id + "/sentReq/" + id] = true;
      ups["social/" + id + "/requests/" + S.me.id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
      addNotif("👥", S.me.name + " أرسل لك طلب صداقة!", id);
    }
    completeTask("friend", 25);
    saveLocal();
    toast("تم إرسال طلب الصداقة");
  }

  function acceptReq(id) {
    S.requests = S.requests.filter(function (x) { return x !== id; });
    if (S.friends.indexOf(id) < 0) S.friends.push(id);
    if (cloud.on && cloud.db) {
      var ups = {};
      ups["social/" + S.me.id + "/requests/" + id] = null;
      ups["social/" + S.me.id + "/friends/" + id] = true;
      ups["social/" + id + "/sentReq/" + S.me.id] = null;
      ups["social/" + id + "/friends/" + S.me.id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
      addNotif("🤝", S.me.name + " قبل طلب صداقتك!", id);
    }
    S.me.ach.social = true;
    addXP(10);
    save(); renderAll();
    toast("أصبحتما أصدقاء الآن 🤝");
  }

  /* ========= 17. الرسائل الخاصة ========= */
  function openDM(id) {
    if (S.blocked.indexOf(id) >= 0) { toast("هذا المستخدم محظور"); return; }
    cleanup("dm");
    UI.dmId = id;
    var u = getUser(id);
    setAvatarEl($("chat-avatar"), u);
    $("chat-title").textContent = u.name;
    $("chat-sub").textContent = u.online ? "🟢 متصل الآن" : "غير متصل";
    S.unread[id] = 0;
    saveLocal(); renderTop();
    $("chat-view").classList.add("open");
    renderDM();

    if (cloud.on && cloud.db) {
      var tid = dmThreadId(S.me.id, id);
      trackListener("dm", cloud.db.ref("dms/" + tid).limitToLast(100), "value", function (snap) {
        var v = snap.val() || {};
        S.dms[id] = Object.keys(v).map(function (k) { return Object.assign({ key: k }, v[k]); });
        S.unread[id] = 0;
        saveLocal();
        renderDM();
      });
    }
  }

  function renderDM() {
    var box = $("chat-msgs"), list = S.dms[UI.dmId] || [];
    box.innerHTML = list.length ? list.map(function (m) {
      var content = m.audio
        ? '<audio controls src="' + esc(m.audio) + '" style="max-width:190px;height:32px"></audio>'
        : esc(m.text);
      return '<div class="msg ' + (m.from === S.me.id ? "me" : "") + '">' + content + '<div class="tm">' + timeStr(m.t) + "</div></div>";
    }).join("") : '<div class="empty">ابدأ المحادثة الآن 👋</div>';
    box.scrollTop = box.scrollHeight;
  }

  function sendDM(text, extra) {
    text = String(text || "").trim();
    var id = UI.dmId;
    if (!id || (!text && (!extra || !extra.audio))) return;
    if (!S.dms[id]) S.dms[id] = [];
    var cleanTxt = clean(text);
    S.dms[id].push(Object.assign({ from: S.me.id, text: cleanTxt, t: now() }, extra || {}));
    if (S.dms[id].length > 100) S.dms[id].shift();

    if (cloud.on && cloud.db) {
      var tid = dmThreadId(S.me.id, id);
      cloud.db.ref("dms/" + tid).push(Object.assign({ from: S.me.id, text: cleanTxt, t: serverTs() }, extra || {})).catch(function () { /* */ });
      var uUps = {};
      uUps["userDms/" + S.me.id + "/" + id] = serverTs();
      uUps["userDms/" + id + "/" + S.me.id] = serverTs();
      cloud.db.ref().update(uUps).catch(function () { /* */ });
      addNotif("💬", "رسالة خاصة من " + S.me.name, id);
    }

    addXP(2);
    saveLocal(); renderDM(); renderMessages();
  }

  /* ========= 18. تعديل الملف الشخصي والـ VIP والإعدادات والترتيب ========= */
  function openVipModal() {
    openSheet("<h3>👑 ترقية العضوية VIP</h3>" + renderVipSectionHTML(getUser(S.me.id), true));
  }

  function openEditProfile() {
    openSheet('<h3>✏️ تعديل الملف الشخصي</h3>' +
      '<label>الاسم</label><input id="ep-n" maxlength="24" value="' + esc(S.me.name) + '">' +
      '<label>الصورة الشخصية من المعرض</label><input id="ep-photo-file" type="file" accept="image/*" />' +
      '<label>غلاف الملف الشخصي من المعرض</label><input id="ep-cover-file" type="file" accept="image/*" />' +
      '<label>النبذة</label><textarea id="ep-b" rows="2" maxlength="120">' + esc(S.me.bio) + "</textarea>" +
      '<label>الدولة</label><input id="ep-c" maxlength="20" value="' + esc(S.me.country) + '">' +
      '<button class="btn block" id="ep-ok" type="button">حفظ التعديلات</button>');

    $("ep-photo-file").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        S.me.photo = await readImageFileAsDataUrl(f, 320, 0.72);
        save(); renderAll();
        if (UI.roomId) renderRoom();
        toast("تم تحديث الصورة الشخصية ✅");
      } catch (err) { toast(err.message || "تعذر تحميل الصورة"); }
    };

    $("ep-cover-file").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        S.me.cover = await readImageFileAsDataUrl(f, 540, 0.68);
        save(); renderAll();
        toast("تم تحديث غلاف الحساب ✅");
      } catch (err) { toast(err.message || "تعذر تحميل الغلاف"); }
    };

    $("ep-ok").onclick = function () {
      var n = $("ep-n").value.trim();
      if (n) S.me.name = clean(n);
      S.me.bio = clean($("ep-b").value.trim());
      S.me.country = clean($("ep-c").value.trim()) || "🇪🇬 مصر";
      save(); closeSheet(); renderAll();
      if (UI.roomId) renderRoom();
      toast("تم تحديث الملف الشخصي ✅");
    };
  }

  function openSettings() {
    openSheet('<h3>⚙️ الإعدادات</h3>' +
      '<div class="switchrow"><span>الوضع النهاري (Light Mode)</span><input type="checkbox" id="st-theme" style="width:auto" ' + (S.settings.lightTheme ? "checked" : "") + "></div>" +
      '<div class="switchrow"><span>الإشعارات</span><input type="checkbox" id="st-n" style="width:auto" ' + (S.settings.notif ? "checked" : "") + "></div>" +
      '<div class="switchrow"><span>الأصوات</span><input type="checkbox" id="st-s" style="width:auto" ' + (S.settings.sound ? "checked" : "") + "></div>" +
      '<button class="btn ghost block" id="st-blk" type="button">المحظورون (' + S.blocked.length + ")</button>" +
      '<button class="btn red block" id="st-reset" type="button">إعادة ضبط البيانات</button>');
    $("st-theme").onchange = function () { S.settings.lightTheme = this.checked; applyThemeMode(); saveLocal(); renderTop(); };
    $("st-n").onchange = function () { S.settings.notif = this.checked; if (this.checked) requestBrowserNotifPermission(); saveLocal(); };
    $("st-s").onchange = function () { S.settings.sound = this.checked; saveLocal(); };
    $("st-blk").onclick = function () {
      var html = "<h3>🚫 المحظورون</h3>";
      if (!S.blocked.length) html += '<div class="empty">لا يوجد محظورون</div>';
      S.blocked.forEach(function (id) {
        html += '<div class="row glass"><div class="info"><div class="name">' + esc(getUser(id).name) + '</div></div><button class="btn sm" data-unblk="' + esc(id) + '" type="button">إلغاء الحظر</button></div>';
      });
      openSheet(html);
      $("sheet").onclick = function (e) {
        var b = e.target.closest("[data-unblk]");
        if (!b) return;
        var tid = b.getAttribute("data-unblk");
        S.blocked = S.blocked.filter(function (x) { return x !== tid; });
        if (cloud.on && cloud.db) cloud.db.ref("social/" + S.me.id + "/blocked/" + tid).remove().catch(function () { /* */ });
        saveLocal(); $("st-blk").click();
      };
    };
    $("st-reset").onclick = function () {
      confirmBox("سيتم حذف جميع بياناتك المحلية والبدء من جديد.", function () {
        if (UI.roomId) leaveRoom(true);
        localStorage.removeItem(CONFIG.storageKey);
        loadLocal(); renderAll();
        toast("تمت إعادة الضبط");
      });
    };
  }

  function openLeaderboard() {
    var all = S.users.concat([getUser(S.me.id)]).sort(function (a, b) { return (b.gifts || 0) - (a.gifts || 0); }).slice(0, 10);
    var html = "<h3>🏆 قائمة المتصدرين</h3>";
    all.forEach(function (u, i) {
      var medal = i === 0 ? "🥇" : (i === 1 ? "🥈" : (i === 2 ? "🥉" : "#" + (i + 1)));
      html += '<div class="row glass"><div style="width:26px;font-weight:bold">' + medal + "</div>" + avatarHTML(u, "sm") + '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">المستوى ' + (u.level || 1) + '</div></div><div class="pill">🎁 ' + (u.gifts || 0) + "</div></div>";
    });
    openSheet(html);
  }

  function openStickersSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var html = "<h3>🎭 اختر ملصقاً</h3><div class='giftgrid'>" +
      STICKERS.map(function (st) {
        return '<div class="gift" data-stk="' + st.id + '"><div class="e">' + st.e + "</div><small>" + esc(st.n) + "</small></div>";
      }).join("") + "</div>";
    openSheet(html);
    $("sheet").onclick = function (e) {
      var card = e.target.closest("[data-stk]");
      if (!card) return;
      var found = STICKERS.filter(function (x) { return x.id === card.getAttribute("data-stk"); })[0];
      if (!found) return;
      closeSheet();
      sendRoomMsg(found.n, { sticker: found.e });
    };
  }

  /* ========= 19. ربط جميع الأحداث ========= */
  function bindEvents() {
    document.querySelectorAll(".navbtn").forEach(function (b) { b.onclick = function () { go(b.getAttribute("data-page")); }; });
    $("avatar-top").onclick = function () { go("profile"); };
    $("notif-btn").onclick = openNotifs;
    $("theme-toggle-btn").onclick = function () {
      S.settings.lightTheme = !S.settings.lightTheme;
      applyThemeMode();
      saveLocal();
      renderTop();
    };
    $("scrim").onclick = closeSheet;

    $("audio-unlock-bar").onclick = function () {
      resumeAllRemoteAudioTracks();
      if (musicState.roomAudio && musicState.data && !musicState.data.paused) {
        musicState.roomAudio.play().catch(function () { /* */ });
      }
      toast("تم تفعيل الصوت 🔊");
    };

    $("search-input").oninput = function () { UI.query = this.value; renderHome(); };
    $("banner-create").onclick = openCreateRoom;
    $("fab-create").onclick = openCreateRoom;
    $("refresh-rooms").onclick = function () { renderAll(); toast("تم التحديث"); };
    document.querySelectorAll("#home-tabs .tab").forEach(function (t) { t.onclick = function () { UI.filter = t.getAttribute("data-filter"); renderHome(); }; });
    document.querySelectorAll("#rooms-tabs .tab").forEach(function (t) { t.onclick = function () { UI.rfilter = t.getAttribute("data-rfilter"); renderRooms(); }; });

    document.querySelectorAll("#friends-tabs .tab").forEach(function (t) { t.onclick = function () { UI.ftab = t.getAttribute("data-ftab"); renderFriends(); }; });
    $("find-input").oninput = function () { UI.findQ = this.value; renderFriends(); };

    document.querySelectorAll("#pf-subtabs .tab").forEach(function (t) {
      t.onclick = function () {
        UI.pftab = t.getAttribute("data-pftab");
        renderProfile();
      };
    });

    $("pf-copy-id").onclick = function () { copyText(S.me.id, "تم نسخ ID الخاص بك 📋"); };
    $("pf-vip-btn").onclick = openVipModal;
    $("pf-share-btn").onclick = function () {
      var inviteUrl = location.href.split("#")[0] + "?ref=" + encodeURIComponent(S.me.id);
      if (navigator.share) {
        navigator.share({ title: "REAL VOICE — " + S.me.name, url: inviteUrl }).catch(function () { copyText(inviteUrl, "تم نسخ رابط حسابك 📋"); });
      } else {
        copyText(inviteUrl, "تم نسخ رابط حسابك 📋");
      }
    };

    $("pf-photo-trigger").onclick = function () {
      var inp = $("pf-photo-input");
      if (inp) inp.click();
    };
    $("pf-photo-input").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        S.me.photo = await readImageFileAsDataUrl(f, 320, 0.72);
        save(); renderAll();
        if (UI.roomId) renderRoom();
        toast("تم تغيير صورتك الشخصية من المعرض ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل الصورة");
      } finally {
        this.value = "";
      }
    };

    $("pf-cover").onclick = function () {
      var inp = $("pf-cover-input");
      if (inp) inp.click();
    };
    $("pf-cover-input").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        S.me.cover = await readImageFileAsDataUrl(f, 540, 0.68);
        save(); renderAll();
        toast("تم تغيير غلاف الملف الشخصي ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل الغلاف");
      } finally {
        this.value = "";
      }
    };

    $("pf-edit").onclick = openEditProfile;
    $("pf-settings").onclick = openSettings;
    $("pf-leader").onclick = openLeaderboard;
    $("pf-topup").onclick = function () { S.me.coins += 500; save(); renderAll(); toast("+500 عملة 🪙"); };
    $("pf-daily").onclick = function () {
      if (S.me.daily && (Date.now() - Number(S.me.daily) < 24 * 60 * 60 * 1000)) {
        toast("استلمت مكافأة اليوم بالفعل ✅");
        return;
      }
      S.me.daily = Date.now();
      S.me.coins += 100;
      addXP(15);
      save(); renderAll();
      toast("استلمت 100 عملة! 🎁");
    };

    $("room-back").onclick = function () { leaveRoom(false); };
    $("room-presence-btn").onclick = function () {
      var room = getRoom(UI.roomId);
      if (room) openParticipants(room);
    };
    $("room-hand").onclick = openHandQueueSheet;
    $("room-music").onclick = openMusicSheet;
    $("room-menu").onclick = openRoomMenu;

    $("mmini-toggle").onclick = function () {
      var room = getRoom(UI.roomId);
      if (room) togglePlayPauseMusic(room);
    };
    $("mmini-skip").onclick = function () {
      var room = getRoom(UI.roomId);
      if (room) skipMusicTrack(room);
    };
    $("mmini-open").onclick = openMusicSheet;

    $("room-speaker-btn").onclick = function () {
      UI.roomSpeakerMuted = !UI.roomSpeakerMuted;
      applyRoomSpeakerMuteState();
      toast(UI.roomSpeakerMuted ? "تم كتم صوت الغرفة 🔇" : "تم تشغيل صوت الغرفة 🔊");
    };

    $("room-seats").onclick = function (e) {
      var s = e.target.closest("[data-seat]");
      if (!s) return;
      var avatarClicked = !!e.target.closest("[data-seat-avatar]");
      onSeatTap(Number(s.getAttribute("data-seat")), avatarClicked);
    };
    $("mic-btn").onclick = function () {
      resumeAllRemoteAudioTracks();
      var room = getRoom(UI.roomId);
      if (!room) return;
      var i = seatIndexOf(room, S.me.id);
      if (i < 0) {
        var freeIdx = findFirstFreeSeatIndex(room);
        if (freeIdx < 0) { toast("جميع المقاعد ممتلئة حالياً"); return; }
        takeSeat(room, freeIdx);
        return;
      }
      if (room.seats[i].muted) { toast("تم كتمك من مشرف الغرفة"); return; }
      UI.micMuted = !UI.micMuted;
      saveLocal(); renderRoom();
      syncMicHardwareState();
    };
    $("room-gift").onclick = function () { openGifts(); };
    $("room-sticker").onclick = openStickersSheet;
    $("room-photo").onclick = function () {
      var inp = document.createElement("input");
      inp.type = "file";
      inp.accept = "image/*";
      inp.onchange = async function () {
        var f = inp.files && inp.files[0];
        if (!f) return;
        try {
          var dataUrl = await readImageFileAsDataUrl(f, 360, 0.7);
          sendRoomMsg("", { img: dataUrl });
        } catch (err) { toast(err.message || "تعذر إرسال الصورة"); }
      };
      inp.click();
    };
    $("room-send").onclick = function () { var i = $("room-input"); sendRoomMsg(i.value); i.value = ""; };
    $("room-input").onkeydown = function (e) { if (e.key === "Enter") $("room-send").click(); };
    $("room-colors").onclick = function (e) {
      var b = e.target.closest("[data-color]");
      if (!b) return;
      UI.msgColor = b.getAttribute("data-color");
      $("room-colors").querySelectorAll("button").forEach(function (x) { x.classList.toggle("sel", x === b); });
    };
    $("room-emojis").innerHTML = EMOJIS.map(function (em) { return '<button type="button">' + em + "</button>"; }).join("");
    $("room-emojis").onclick = function (e) {
      if (e.target.tagName === "BUTTON") {
        $("room-input").value += e.target.textContent;
        $("room-input").focus();
      }
    };
    $("room-chat").onclick = function (e) {
      var m = e.target.closest("[data-delmsg]");
      if (!m) return;
      var room = getRoom(UI.roomId);
      if (!room) return;
      var key = m.getAttribute("data-delmsg");
      confirmBox("حذف هذه الرسالة؟", function () {
        if (cloud.on && cloud.db && key.indexOf("u") !== 0) {
          cloud.db.ref("roomMessages/" + room.id + "/" + key).remove().catch(function () { /* */ });
        }
        room.msgs = room.msgs.filter(function (msgItem, idx) { return (msgItem.key || String(idx)) !== key; });
        saveLocal(); renderRoomChat();
      });
    };

    $("quiz-box").onclick = function (e) {
      var b = e.target.closest("[data-quizans]");
      if (!b || !UI.quiz) return;
      var room = getRoom(UI.roomId);
      if (!room) return;
      var ansIdx = Number(b.getAttribute("data-quizans"));
      if (!UI.quiz.answers) UI.quiz.answers = {};
      UI.quiz.answers[S.me.id] = ansIdx;
      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + room.id + "/quiz/current/answers/" + S.me.id).set(ansIdx).catch(function () { /* */ });
      }
      renderQuizBox();
      if (ansIdx === UI.quiz.ans) {
        S.me.coins += 20;
        addXP(5);
        save(); renderTop();
        toast("إجابة صحيحة! +20 عملة 🎉");
      } else {
        toast("تم تسجيل إجابتك، حظاً أوفر!");
      }
    };

    $("chat-back").onclick = function () {
      cleanup("dm");
      UI.dmId = null;
      $("chat-view").classList.remove("open");
      renderMessages();
      renderTop();
    };
    $("chat-send").onclick = function () { var i = $("chat-input"); sendDM(i.value); i.value = ""; };
    $("chat-input").onkeydown = function (e) { if (e.key === "Enter") $("chat-send").click(); };
    $("chat-emoji").onclick = function () { $("chat-input").value += EMOJIS[Math.floor(Math.random() * EMOJIS.length)]; };
    $("chat-voice").onclick = function () {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast("التسجيل الصوتي غير مدعوم في هذا المتصفح");
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
        var chunks = [];
        var rec = new MediaRecorder(stream);
        rec.ondataavailable = function (ev) { if (ev.data && ev.data.size) chunks.push(ev.data); };
        rec.onstop = function () {
          stream.getTracks().forEach(function (t) { t.stop(); });
          var blob = new Blob(chunks, { type: "audio/webm" });
          var fr = new FileReader();
          fr.onload = function () { sendDM("🎙️ رسالة صوتية", { audio: String(fr.result || "") }); };
          fr.readAsDataURL(blob);
        };
        rec.start();
        toast("🎙️ جاري التسجيل لمدة 4 ثوانٍ...");
        setTimeout(function () { if (rec.state === "recording") rec.stop(); }, 4000);
      }).catch(function () { toast("اسمح بالوصول للميكروفون لإرسال رسالة صوتية"); });
    };
    $("chat-menu").onclick = function () {
      var id = UI.dmId;
      if (!id) return;
      actionList(getUser(id).name, [
        { label: "👤 عرض الملف الشخصي", fn: function () { openProfile(id); } },
        { label: "🧹 مسح المحادثة", fn: function () { S.dms[id] = []; saveLocal(); renderDM(); renderMessages(); } },
        {
          label: "🚫 حظر المستخدم",
          danger: true,
          fn: function () {
            S.blocked.push(id);
            if (cloud.on && cloud.db) cloud.db.ref("social/" + S.me.id + "/blocked/" + id).set(true).catch(function () { /* */ });
            saveLocal(); $("chat-back").click(); renderAll();
          }
        }
      ]);
    };

    document.body.addEventListener("click", function (e) {
      if (e.target.closest("#sheet") && e.target.closest("[data-buyvip]")) {
        var tierLv = Number(e.target.closest("[data-buyvip]").getAttribute("data-buyvip"));
        var tier = VIP_TIERS.filter(function (t) { return t.level === tierLv; })[0];
        if (!tier) return;
        if (S.me.coins < tier.cost) { toast("رصيدك لا يكفي لتفعيل " + tier.title + " 🪙"); return; }
        S.me.coins -= tier.cost;
        S.me.vip = Math.max(S.me.vip || 0, tier.level);
        var baseExp = (S.me.vipExp && Number(S.me.vipExp) > Date.now()) ? Number(S.me.vipExp) : Date.now();
        S.me.vipExp = baseExp + (tier.days * 24 * 60 * 60 * 1000);
        if (tier.level >= 2) S.me.verified = true;
        addXP(30);
        save(); renderAll();
        openVipModal();
        toast("👑 تم تفعيل " + tier.title + " بنجاح!");
        return;
      }

      var enter = e.target.closest("[data-enter]");
      if (enter) { enterRoom(enter.getAttribute("data-enter")); return; }
      var prof = e.target.closest("[data-profile]");
      if (prof) { openProfile(prof.getAttribute("data-profile")); return; }
      var dm = e.target.closest("[data-dm]");
      if (dm) { openDM(dm.getAttribute("data-dm")); return; }
      var acc = e.target.closest("[data-accept]");
      if (acc) { acceptReq(acc.getAttribute("data-accept")); return; }
      var rej = e.target.closest("[data-reject]");
      if (rej) {
        var rjId = rej.getAttribute("data-reject");
        S.requests = S.requests.filter(function (x) { return x !== rjId; });
        if (cloud.on && cloud.db) cloud.db.ref("social/" + S.me.id + "/requests/" + rjId).remove().catch(function () { /* */ });
        saveLocal(); renderAll(); return;
      }
      var can = e.target.closest("[data-cancelreq]");
      if (can) {
        var cnId = can.getAttribute("data-cancelreq");
        S.sentReq = S.sentReq.filter(function (x) { return x !== cnId; });
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/sentReq/" + cnId] = null;
          ups["social/" + cnId + "/requests/" + S.me.id] = null;
          cloud.db.ref().update(ups).catch(function () { /* */ });
        }
        saveLocal(); renderFriends(); return;
      }
      var add = e.target.closest("[data-addfriend]");
      if (add) { sendFriendReq(add.getAttribute("data-addfriend")); renderFriends(); return; }
    });
  }

  /* ========= 20. التشغيل ========= */
  async function boot() {
    loadLocal();
    initCloud();
    bindEvents();
    renderAll();

    await startCloudSync();
    renderAll();

    var params = new URLSearchParams(location.search);
    var roomParam = params.get("room");
    var userParam = params.get("user");
    if (roomParam && getRoom(roomParam)) enterRoom(roomParam);
    else if (userParam) openProfile(userParam);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window);
