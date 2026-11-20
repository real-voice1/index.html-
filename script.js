/* REAL VOICE — نسخة 3D احترافية + صوت جماعي متزامن + خلفيات مخصصة للغرف */
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

  var DEFAULT_TRACKS = [
    { id: "t1", title: "Night Chill Beat", artist: "SoundHelix", cover: "🎵", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
    { id: "t2", title: "Acoustic Vibes", artist: "SoundHelix", cover: "🎸", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" },
    { id: "t3", title: "Midnight Lounge", artist: "SoundHelix", cover: "🌙", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3" },
    { id: "t4", title: "Energy Pulse", artist: "SoundHelix", cover: "⚡", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3" }
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
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2400);
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
    quality = quality || 0.78;
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

  /* ========= 4. محرك الصوت (Agora RTC) + المشغل الموسيقي ========= */
  var voice = {
    client: null,
    localTrack: null,
    channel: null,
    role: null,
    uidNum: 0,
    joining: false,
    leaving: false,
    speakingNums: {}
  };

  var musicState = {
    data: null,
    queue: [],
    bufferTrack: null,
    roomAudio: null,
    sleepTimerId: null,
    roomXpEarned: 0,
    syncing: false
  };

  function setVoiceStatusUI(connected, label) {
    var dot = $("voice-status-dot");
    var txt = $("voice-status-text");
    if (dot) dot.classList.toggle("live", !!connected);
    if (txt) txt.textContent = label || (connected ? "الصوت المباشر متصل • تسمع الجميع" : "جاري ربط الصوت...");
  }

  async function subscribeAndPlayRemoteUser(user, mediaType) {
    if (!voice.client || !user) return;
    try {
      await voice.client.subscribe(user, mediaType);
      if (mediaType === "audio" && user.audioTrack) {
        user.audioTrack.setVolume(100);
        user.audioTrack.play();
      }
    } catch (e) {
      /* قد يحتاج تفاعل أولي من المستخدم على المتصفح */
    }
  }

  function resumeAllRemoteAudioTracks() {
    if (!voice.client || !Array.isArray(voice.client.remoteUsers)) return;
    voice.client.remoteUsers.forEach(function (u) {
      if (u && u.hasAudio) {
        if (u.audioTrack) {
          try {
            u.audioTrack.setVolume(100);
            u.audioTrack.play();
          } catch (e) { /* */ }
        } else {
          subscribeAndPlayRemoteUser(u, "audio");
        }
      }
    });
  }

  function setupAgoraClient() {
    if (voice.client || !global.AgoraRTC) return;
    try {
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
    } catch (e) { /* تجاهل */ }
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
    var targetVol = (m.duck !== false && someoneSpeaking) ? Math.max(0.14, baseVol * 0.25) : baseVol;

    if (musicState.bufferTrack && typeof musicState.bufferTrack.setVolume === "function") {
      try { musicState.bufferTrack.setVolume(Math.round(targetVol * 100)); } catch (e) { /* */ }
    }
    if (musicState.roomAudio) {
      try { musicState.roomAudio.volume = Math.min(1, Math.max(0, targetVol)); } catch (e) { /* */ }
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
      } catch (eAudio) { /* تجاهل */ }
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
    $("music-mini-title").textContent = statusIcon + " " + (m.title || "أغنية") + " — " + (m.artist || "مشتركة");
  }

  function canControlMusic(room) {
    if (!room) return false;
    var r = role(room, S.me.id);
    return r === "owner" || r === "mod";
  }

  async function startTrackNow(room, trackObj) {
    if (!room || !canControlMusic(room)) { toast("للمالك أو المشرف فقط"); return; }
    var payload = {
      djUid: S.me.id,
      trackId: trackObj.id || uid(),
      url: trackObj.url,
      title: clean(trackObj.title || "أغنية"),
      artist: clean(trackObj.artist || S.me.name),
      cover: trackObj.cover || "🎵",
      startedAt: Date.now(),
      paused: false,
      pausedAt: 0,
      volume: (musicState.data && typeof musicState.data.volume === "number") ? musicState.data.volume : 0.7,
      duck: musicState.data ? musicState.data.duck !== false : true,
      skipVotes: {}
    };
    musicState.data = Object.assign({}, payload);
    renderMusicMini();
    await syncRoomMusicForEveryone(musicState.data);
    if (cloud.on && cloud.db && payload.url.indexOf("blob:") !== 0) {
      cloud.db.ref("rooms/" + room.id + "/music").set(Object.assign({}, payload, { startedAt: serverTs() })).catch(function () { /* */ });
    }
    pushRoomMsg(room, { sys: true, text: "🎵 بدأ تشغيل: " + payload.title + " — " + payload.artist });
  }

  async function togglePlayPauseMusic(room) {
    if (!room || !musicState.data || !musicState.data.url || !canControlMusic(room)) {
      toast("لا توجد أغنية نشطة أو الصلاحية للمالك/المشرف");
      return;
    }
    var nextPaused = !musicState.data.paused;
    var upd = {
      paused: nextPaused,
      pausedAt: nextPaused ? Date.now() : 0,
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

  async function skipMusicTrack(room, force) {
    if (!room || !musicState.data || !musicState.data.url) {
      toast("لا توجد أغنية قيد التشغيل");
      return;
    }
    if (!force && !canControlMusic(room)) {
      var votes = Object.assign({}, musicState.data.skipVotes || {});
      votes[S.me.id] = true;
      var needed = Math.max(1, Math.ceil(count(room) * 0.5));
      var currentVotes = Object.keys(votes).length;
      if (currentVotes < needed) {
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/music/skipVotes").set(votes).catch(function () { /* */ });
        toast("تم تسجيل صوتك للتخطي (" + currentVotes + "/" + needed + ")");
        return;
      }
    }

    var nextTrack = musicState.queue && musicState.queue.length ? musicState.queue[0] : null;
    if (nextTrack) {
      if (cloud.on && cloud.db && nextTrack._key && String(nextTrack._key).indexOf("u") !== 0) {
        cloud.db.ref("rooms/" + room.id + "/queue/" + nextTrack._key).remove().catch(function () { /* */ });
      }
      musicState.queue = musicState.queue.filter(function (q) { return q !== nextTrack; });
      await startTrackNow(room, nextTrack);
    } else {
      musicState.data = null;
      await stopMusicBroadcast();
      renderMusicMini();
      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + room.id + "/music").set({
          djUid: null, trackId: null, url: "", title: "", artist: "", cover: "🎵",
          startedAt: serverTs(), paused: true, pausedAt: 0, volume: 0.7, duck: true, skipVotes: {}
        }).catch(function () { /* */ });
      }
      toast("انتهى طابور الأغاني");
    }
  }

  async function addTrackToQueue(room, trackObj) {
    if (!room) return;
    var item = {
      id: trackObj.id || uid(),
      url: trackObj.url.trim(),
      title: clean(trackObj.title || "أغنية مخصصة"),
      artist: clean(trackObj.artist || S.me.name),
      cover: trackObj.cover || "🎵",
      addedBy: S.me.id,
      t: Date.now()
    };
    if (!item.url) { toast("أدخل رابط أغنية صحيح"); return; }

    var localKey = uid();
    musicState.queue.push(Object.assign({}, item, { _key: localKey }));
    if (cloud.on && cloud.db && item.url.indexOf("data:") !== 0 && item.url.indexOf("blob:") !== 0) {
      cloud.db.ref("rooms/" + room.id + "/queue").push(Object.assign({}, item, { t: serverTs() })).catch(function () { /* */ });
    }
    toast("تمت إضافة الأغنية للطابور 🎶");

    if ((!musicState.data || !musicState.data.url) && canControlMusic(room)) {
      var first = musicState.queue.shift() || item;
      await startTrackNow(room, first);
    }
  }

  function openMusicSheet() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var isStaff = canControlMusic(room);
    var m = musicState.data || {};
    var isDj = m.djUid === S.me.id;
    var djUser = m.djUid ? getUser(m.djUid).name : "لا يوجد";
    var duckChecked = m.duck !== false ? "checked" : "";

    var sugHtml = DEFAULT_TRACKS.map(function (t) {
      return '<button class="btn sm ghost" data-sug="' + t.id + '" type="button" style="margin:2px">' + t.cover + " " + esc(t.title) + "</button>";
    }).join("");

    var qHtml = musicState.queue.length
      ? musicState.queue.map(function (q, idx) {
          return '<div class="row glass" style="margin-bottom:6px;padding:8px">' +
            '<div style="font-size:18px">' + (q.cover || "🎵") + "</div>" +
            '<div class="info"><div class="name">' + esc(q.title) + '</div><div class="meta">' + esc(q.artist) + "</div></div>" +
            '<button class="btn sm ghost" data-delq="' + esc(q._key || String(idx)) + '" type="button">🗑</button></div>';
        }).join("")
      : '<div class="small" style="padding:8px 0">الطابور فارغ حالياً</div>';

    var html = "<h3>🎵 مشغل الموسيقى المشترك</h3>" +
      '<div class="small" style="margin-bottom:8px">الـ DJ الحالي: <b>' + esc(djUser) + "</b> " + (isDj ? "(أنت)" : "") + "</div>" +
      "<label>اختر أغنية من جهازك / المعرض</label>" +
      '<input id="ms-file" type="file" accept="audio/*" />' +
      "<label>أو رابط أغنية MP3 مباشر</label>" +
      '<input id="ms-url" type="url" placeholder="https://example.com/song.mp3" />' +
      '<div style="display:flex;gap:6px;margin-top:6px">' +
      '<input id="ms-title" type="text" maxlength="40" placeholder="اسم الأغنية" />' +
      '<input id="ms-artist" type="text" maxlength="40" placeholder="المغني" /></div>' +
      '<button class="btn block" id="ms-add" type="button">➕ تشغيل / أضف للطابور</button>' +
      '<div style="margin-top:8px"><div class="small" style="margin-bottom:4px">أغاني جاهزة:</div><div>' + sugHtml + "</div></div>" +
      '<h4 style="margin:12px 0 6px;font-size:13px">قائمة الطابور (' + musicState.queue.length + ")</h4>" +
      '<div id="ms-queue-box">' + qHtml + "</div>" +
      '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' +
      (isStaff ? '<button class="btn sm" id="ms-dj" type="button">' + (isDj ? "🎧 أنت DJ الآن" : "🎛️ أنا DJ") + "</button>" : "") +
      (isStaff ? '<button class="btn sm ghost" id="ms-toggle" type="button">⏯ تشغيل/إيقاف</button>' : "") +
      '<button class="btn sm ghost" id="ms-skip" type="button">⏭ تخطي / تصويت</button>' +
      (isStaff ? '<button class="btn sm ghost" id="ms-clear" type="button">مسح الطابور</button>' : "") +
      "</div>" +
      '<div class="switchrow"><span>خفض الموسيقى تلقائياً عند الكلام (Ducking)</span><input id="ms-duck" type="checkbox" ' + duckChecked + ' style="width:auto" /></div>' +
      "<label>مؤقت النوم</label>" +
      '<div style="display:flex;gap:6px">' +
      '<button class="btn sm ghost" data-sleep="15" type="button">15 د</button>' +
      '<button class="btn sm ghost" data-sleep="30" type="button">30 د</button>' +
      '<button class="btn sm ghost" data-sleep="60" type="button">60 د</button>' +
      '<button class="btn sm ghost" data-sleep="0" type="button">إلغاء</button></div>';

    openSheet(html);
    $("sheet").onclick = null;

    $("ms-file").onchange = function () {
      var f = this.files && this.files[0];
      if (!f) return;
      var blobUrl = URL.createObjectURL(f);
      var cleanTitle = f.name.replace(/\.[^/.]+$/, "");
      if (!$("ms-title").value) $("ms-title").value = cleanTitle;
      $("ms-url").value = blobUrl;
      toast("تم تحميل الأغنية من جهازك 🎵");
    };

    $("ms-add").onclick = async function () {
      var u = $("ms-url").value.trim();
      var ti = $("ms-title").value.trim() || "أغنية";
      var ar = $("ms-artist").value.trim() || S.me.name;
      if (!u) { toast("اختر أغنية من جهازك أو أدخل رابط MP3"); return; }
      if (isStaff && (!musicState.data || !musicState.data.url)) {
        await startTrackNow(room, { url: u, title: ti, artist: ar, cover: "🎵" });
      } else {
        await addTrackToQueue(room, { url: u, title: ti, artist: ar, cover: "🎵" });
      }
      openMusicSheet();
    };

    $("sheet").querySelectorAll("[data-sug]").forEach(function (btn) {
      btn.onclick = async function () {
        var found = DEFAULT_TRACKS.filter(function (x) { return x.id === btn.getAttribute("data-sug"); })[0];
        if (found) {
          if (isStaff) await startTrackNow(room, found);
          else await addTrackToQueue(room, found);
          openMusicSheet();
        }
      };
    });

    $("sheet").querySelectorAll("[data-delq]").forEach(function (btn) {
      btn.onclick = function () {
        var key = btn.getAttribute("data-delq");
        if (cloud.on && cloud.db && String(key).indexOf("u") !== 0 && !/^\d+$/.test(String(key))) {
          cloud.db.ref("rooms/" + room.id + "/queue/" + key).remove().catch(function () { /* */ });
        }
        musicState.queue = musicState.queue.filter(function (x, idx) {
          return String(x._key || idx) !== String(key);
        });
        openMusicSheet();
      };
    });

    if ($("ms-dj")) {
      $("ms-dj").onclick = async function () {
        if (!isStaff) { toast("للمالك أو المشرف فقط"); return; }
        var curMusic = musicState.data && musicState.data.url ? musicState.data : DEFAULT_TRACKS[0];
        var payload = Object.assign({}, curMusic, {
          djUid: S.me.id,
          startedAt: Date.now(),
          paused: false
        });
        musicState.data = payload;
        renderMusicMini();
        await syncRoomMusicForEveryone(musicState.data);
        if (cloud.on && cloud.db && payload.url.indexOf("blob:") !== 0) {
          cloud.db.ref("rooms/" + room.id + "/music").set(Object.assign({}, payload, { startedAt: serverTs() })).catch(function () { /* */ });
        }
        toast("أنت الآن الـ DJ في الغرفة 🎛️");
        openMusicSheet();
      };
    }

    if ($("ms-toggle")) {
      $("ms-toggle").onclick = async function () {
        await togglePlayPauseMusic(room);
        openMusicSheet();
      };
    }

    $("ms-skip").onclick = async function () {
      await skipMusicTrack(room, false);
      openMusicSheet();
    };

    if ($("ms-clear")) {
      $("ms-clear").onclick = function () {
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/queue").remove().catch(function () { /* */ });
        musicState.queue = [];
        toast("تم مسح الطابور");
        openMusicSheet();
      };
    }

    $("ms-duck").onchange = function () {
      var val = !!$("ms-duck").checked;
      if (cloud.on && cloud.db && musicState.data && musicState.data.url && musicState.data.url.indexOf("blob:") !== 0) {
        cloud.db.ref("rooms/" + room.id + "/music/duck").set(val).catch(function () { /* */ });
      }
      if (musicState.data) musicState.data.duck = val;
      applyMusicDucking();
    };

    $("sheet").querySelectorAll("[data-sleep]").forEach(function (btn) {
      btn.onclick = function () {
        var mins = Number(btn.getAttribute("data-sleep"));
        if (musicState.sleepTimerId) {
          clearTimeout(musicState.sleepTimerId);
          musicState.sleepTimerId = null;
        }
        if (!mins) {
          toast("تم إلغاء مؤقت النوم");
          return;
        }
        musicState.sleepTimerId = trackTimer("room", setTimeout(async function () {
          if (musicState.data && canControlMusic(room)) {
            await togglePlayPauseMusic(room);
          }
          await stopMusicBroadcast();
          toast("انتهى مؤقت النوم 🌙");
        }, mins * 60 * 1000), "timeout");
        toast("تم ضبط مؤقت النوم على " + mins + " دقيقة");
      };
    });
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

      /* الانضمام كـ publisher يتيح للجميع سماع بعضهم والتحدث فوراً عند الصعود للمقعد */
      var tokenRole = "publisher";
      var tokenData = await fetchRtcToken(channelName, targetUid, tokenRole);
      var joinUid = (tokenData.uid !== undefined && tokenData.uid !== null) ? tokenData.uid : targetUid;
      await voice.client.join(tokenData.appId, channelName, tokenData.token, joinUid);

      voice.channel = channelName;
      voice.role = desiredRole;

      /* الاشتراك التلقائي الفوري في صوت المتواجدين مسبقاً في الغرفة */
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
    });
  }

  /* ========= 5. الحالة والبيانات ========= */
  var cloud = { on: false, db: null, auth: null, fbUser: null, usersMap: {}, roomsMap: {}, roomMsgs: {}, seenFly: {}, seenReact: {} };
  var S = null;
  var UI = {
    page: "home", filter: "all", rfilter: "mine", ftab: "friends", query: "", findQ: "",
    roomId: null, dmId: null, msgColor: "", micMuted: false, giftSel: "heart", giftTarget: "room",
    micQueue: {}, theme: null, quiz: null
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
      { id: "RV-1001", num: 1001, name: "ليلى", photo: "", online: true, bio: "أحب الموسيقى 🎵", vip: 2, level: 7 },
      { id: "RV-1002", num: 1002, name: "أحمد", photo: "", online: true, bio: "لاعب محترف 🎮", vip: 0, level: 4 },
      { id: "RV-1003", num: 1003, name: "سارة", photo: "", online: false, bio: "هنا للدردشة ☕", vip: 1, level: 5 },
      { id: "RV-1004", num: 1004, name: "خالد", photo: "", online: true, bio: "صاحب غرف VIP 👑", vip: 4, level: 12 },
      { id: "RV-1005", num: 1005, name: "مريم", photo: "", online: false, bio: "مرحباً بالجميع", vip: 0, level: 2 },
      { id: "RV-1006", num: 1006, name: "يوسف", photo: "", online: true, bio: "تحدي الأسئلة 🧠", vip: 3, level: 9 }
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
        id: fixedId, num: num, name: "مستخدم جديد", photo: "",
        bio: "مرحباً! أنا جديد في REAL VOICE 👋", coins: CONFIG.startCoins, xp: 0, vip: 0,
        followers: 0, following: 0, visits: 0, joined: now(), country: "🌍 غير محدد",
        gifts: 0, sent: 0, msgCount: 0, ach: {},
        daily: 0, invites: 0,
        tasks: { dayKey: new Date().toDateString(), msg: false, friend: false, mic: false, room: false }
      },
      users: demoUsers(),
      rooms: demoRooms(),
      friends: [], requests: [], sentReq: [], blocked: [], follows: [],
      dms: {}, unread: {}, notifs: [], txs: [], giftsLog: [],
      settings: { notif: true, sound: true }
    };
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
          if (!S.settings) S.settings = { notif: true, sound: true };
          ensureDailyTasks();
          return;
        }
      }
    } catch (e) { /* تجاهل */ }
    S = freshState();
    addNotif("🎉", "أهلاً بك في REAL VOICE! حصلت على " + CONFIG.startCoins + " عملة هدية.");
    saveLocal();
  }

  function saveLocal() {
    try { localStorage.setItem(CONFIG.storageKey, JSON.stringify(S)); } catch (e) { /* تجاهل */ }
  }

  function saveMeCloud() {
    if (!cloud.on || !cloud.db || !S || !S.me) return;
    cloud.db.ref("users/" + S.me.id).update({
      id: S.me.id, num: S.me.num, name: S.me.name, photo: S.me.photo || "", bio: S.me.bio,
      coins: S.me.coins, xp: S.me.xp, vip: S.me.vip,
      followers: S.me.followers, visits: S.me.visits, country: S.me.country,
      gifts: S.me.gifts, sent: S.me.sent, msgCount: S.me.msgCount, ach: S.me.ach,
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
    if (!id) return { id: "", num: 0, name: "مستخدم", photo: "", online: false, bio: "", vip: 0, level: 1 };
    if (id === S.me.id) {
      return {
        id: S.me.id, num: S.me.num, name: S.me.name, photo: S.me.photo || "", online: true,
        bio: S.me.bio, vip: S.me.vip, level: level(), me: true
      };
    }
    if (cloud.usersMap[id]) {
      return Object.assign({ id: id, photo: "", online: false, bio: "", vip: 0, level: 1 }, cloud.usersMap[id]);
    }
    for (var i = 0; i < S.users.length; i++) {
      if (S.users[i].id === id) return S.users[i];
    }
    return { id: id, num: hashNum(id), name: "مستخدم", photo: "", online: false, bio: "", vip: 0, level: 1 };
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
    var v = u.vip > 0 ? '<span class="tag vip">VIP' + u.vip + "</span>" : "";
    return esc(u.name) + v;
  }

  function updateAppBadge(unreadCount) {
    if (navigator && typeof navigator.setAppBadge === "function") {
      if (unreadCount > 0) navigator.setAppBadge(unreadCount).catch(function () { /* */ });
      else navigator.clearAppBadge().catch(function () { /* */ });
    }
  }

  /* ========= 7. التنقل ورسم الصفحات ========= */
  function go(page) {
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

  function renderProfile() {
    ensureDailyTasks();
    var m = S.me, lv = level(), into = (m.xp || 0) % CONFIG.xpPerLevel;
    setAvatarEl($("pf-avatar"), m);
    $("pf-name").textContent = m.name;
    $("pf-id").textContent = "ID: " + m.id + " • الدعوات: " + (m.invites || 0);
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
    $("pf-meta").textContent = m.country + " • انضم في " + new Date(m.joined || now()).toLocaleDateString("ar");
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

  /* ========= 8. النوافذ السفلية ========= */
  function openSheet(html) {
    $("sheet").innerHTML = html;
    $("sheet").scrollTop = 0;
    $("scrim").classList.add("open");
  }
  function closeSheet() {
    $("scrim").classList.remove("open");
    $("sheet").onclick = null;
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
    $("sheet").onclick = null;
    $("cf-yes").onclick = function () { closeSheet(); if (typeof yes === "function") yes(); };
    $("cf-no").onclick = closeSheet;
  }

  /* ========= 9. الإشعارات ========= */
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

  /* ========= 10. إنشاء ودخول ومغادرة الغرف ========= */
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
    $("sheet").onclick = null;
    var selectedBgDataUrl = "";
    $("cr-bgfile").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        selectedBgDataUrl = await readImageFileAsDataUrl(f, 720, 0.72);
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

  function showFlyGift(emoji, senderName, targetName) {
    var fly = document.createElement("div");
    fly.className = "fly";
    fly.innerHTML = emoji + "<small>" + esc(senderName) + " ➜ " + esc(targetName) + "</small>";
    $("app").appendChild(fly);
    setTimeout(function () { if (fly.parentNode) fly.parentNode.removeChild(fly); }, 2500);
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

    if (UI.roomId && UI.roomId !== id) {
      leaveRoom(true);
    }

    cleanup("room");
    musicState.roomXpEarned = 0;
    musicState.data = null;
    musicState.queue = [];
    UI.micQueue = {};
    UI.quiz = null;
    applyRoomTheme(room.theme || ROOM_THEMES[0]);
    renderMusicMini();
    renderQuizBox();

    if (!inRoom(room, S.me.id)) {
      if (room.listeners.indexOf(S.me.id) < 0) room.listeners.push(S.me.id);
      if (cloud.on && cloud.db) {
        var lRef = cloud.db.ref("rooms/" + id + "/listeners/" + S.me.id);
        var qRef = cloud.db.ref("rooms/" + id + "/micQueue/" + S.me.id);
        try { lRef.onDisconnect().remove(); } catch (e0) { /* */ }
        try { qRef.onDisconnect().remove(); } catch (e1) { /* */ }
        lRef.set(true).catch(function () { /* */ });
      }
      pushRoomMsg(room, { sys: true, text: S.me.name + " دخل الغرفة 👋" });
      S.me.visits++;
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
      if (!UI.roomId || musicState.roomXpEarned >= 10) return;
      musicState.roomXpEarned += 2;
      addXP(2);
      save();
      renderTop();
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
            showFlyGift(last.giftAnim.e, last.giftAnim.fromName, last.giftAnim.toName);
          }
        }
      });

      trackListener("room", cloud.db.ref("rooms/" + id + "/music"), "value", function (musSnap) {
        var prevDj = musicState.data && musicState.data.djUid;
        var m = musSnap.val() || null;
        if (m && m.url) {
          musicState.data = m;
          renderMusicMini();
          if (prevDj && !m.djUid && UI.roomId === id) {
            pushRoomMsg(room, { sys: true, text: "DJ غادر، اختر DJ جديد" });
          }
          syncRoomMusicForEveryone(m);
        } else if (musicState.data && (!m || !m.url)) {
          musicState.data = null;
          renderMusicMini();
          stopMusicBroadcast();
        }
      });

      trackListener("room", cloud.db.ref("rooms/" + id + "/queue"), "value", function (qSnap) {
        var qv = qSnap.val() || {};
        musicState.queue = Object.keys(qv).map(function (k) {
          return Object.assign({ _key: k }, qv[k]);
        });
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
          showFlyGift(rv.emoji || "👏", rv.fromName || "مستخدم", rv.targetName || "الغرفة");
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
    cleanup("room");
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

  /* ========= 11. رسم الغرفة والمقاعد الدائرية 3D والدردشة ========= */
  function renderRoomPresenceStrip(room) {
    var ids = getRoomParticipantIds(room);
    var cntEl = $("room-online-count");
    var stripEl = $("room-avatars-strip");
    if (cntEl) cntEl.textContent = String(ids.length);
    if (!stripEl) return;

    var maxShow = 4;
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
    var rRole = role(room, S.me.id);
    var canBg = rRole === "owner" || rRole === "mod";

    $("room-title").textContent = (room.pass ? "🔒 " : "") + room.name;
    $("room-sub-meta").textContent = "ID: " + room.id + " • " + (CATEGORIES[room.cat] || "");
    if ($("room-bg-quick")) {
      $("room-bg-quick").classList.toggle("hidden", !canBg);
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
        sub = s.uid === room.owner ? "👑 المالك" : (room.mods.indexOf(s.uid) >= 0 ? "🛡️ مشرف" : (u.me ? "أنت" : "متحدث"));
      } else if (s.locked) {
        cls += " locked"; inner = "🔒"; name = "مقفل"; sub = "مقعد " + (i + 1);
      } else {
        inner = s.vip ? "👑" : "🎙️"; name = "مقعد " + (i + 1); sub = s.vip ? "VIP" : "فارغ";
      }

      var isSeatMuted = s.uid && (s.muted || (s.uid === S.me.id && UI.micMuted));
      return '<div class="' + cls + '" data-seat="' + i + '">' +
        '<div class="seat-orb">' +
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
    var onSeat = mySeat >= 0;
    var adminMuted = onSeat && room.seats[mySeat].muted;
    var effectiveMuted = UI.micMuted || adminMuted;
    mic.classList.toggle("hidden", !onSeat);
    mic.classList.toggle("off", effectiveMuted);
    mic.classList.toggle("on", !effectiveMuted);
    mic.textContent = effectiveMuted ? "🔇" : "🎤";

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

  /* ========= 12. إدارة المقاعد والمايك ورفع اليد والتفاعلات ========= */
  function sendLiveReaction(emoji, targetName) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    showFlyGift(emoji, S.me.name, targetName || room.name);
    if (cloud.on && cloud.db) {
      cloud.db.ref("rooms/" + room.id + "/reactions").push({
        emoji: emoji,
        fromUid: S.me.id,
        fromName: S.me.name,
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
      sendLiveReaction(b.getAttribute("data-react"), u.name);
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
    $("sheet").onclick = null;

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

  function onSeatTap(i) {
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

    var u = getUser(s.uid);
    items.push({ label: "👤 عرض الملف الشخصي", fn: function () { openProfile(s.uid); } });
    items.push({ label: "👏 تفاعل سريع (👏❤️🔥😂)", fn: function () { openSpeakerReactions(u); } });
    if (s.uid !== S.me.id) items.push({ label: "🎁 إرسال هدية", fn: function () { openGifts(s.uid); } });

    if (s.uid === S.me.id) {
      items.push({
        label: "⬇️ مغادرة المقعد",
        fn: function () {
          UI.micMuted = false;
          stopLocalMic();
          room.seats[i].uid = null;
          room.seats[i].muted = false;
          if (room.listeners.indexOf(S.me.id) < 0) room.listeners.push(S.me.id);
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = null;
            ups["rooms/" + room.id + "/seats/" + i + "/muted"] = false;
            ups["rooms/" + room.id + "/listeners/" + S.me.id] = true;
            cloud.db.ref().update(ups).catch(function () { /* */ });
          }
          saveLocal();
          renderRoom();
          toast("تم النزول من المايك ⬇️");
        }
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

  /* ========= 13. قائمة الغرفة والهدايا والألعاب وتخصيص الخلفية ========= */
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
        save(); renderTop();
        pushRoomMsg(room, { sys: true, text: "🎡 عجلة الحظ: " + S.me.name + " ربح " + win + " عملة!" });
        toast("🎡 ربحت " + win + " عملة!");
      } else if (g === "tod") {
        var pick = TRUTH_OR_DARE[Math.floor(Math.random() * TRUTH_OR_DARE.length)];
        pushRoomMsg(room, { sys: true, text: "🎭 " + pick });
      } else if (g === "quiz") {
        var qObj = QUIZ_BANK[Math.floor(Math.random() * QUIZ_BANK.length)];
        var quizPayload = { active: true, q: qObj.q, opts: qObj.opts, ans: qObj.ans, answers: {}, t: now() };
        UI.quiz = quizPayload;
        renderQuizBox();
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/quiz/current").set(Object.assign({}, quizPayload, { t: serverTs() })).catch(function () { /* */ });
        pushRoomMsg(room, { sys: true, text: "🧠 بدأ تحدي الأسئلة: " + qObj.q });
      } else if (g === "quizstop") {
        UI.quiz = null;
        renderQuizBox();
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/quiz/current").set({ active: false }).catch(function () { /* */ });
      }
    };
  }

  function openThemeSheet(room) {
    var r = role(room, S.me.id);
    if (r !== "owner" && r !== "mod") {
      toast("تغيير خلفية الغرفة متاح لصاحب الغرفة أو المشرفين فقط");
      return;
    }
    var html = "<h3>🖼️ خلفية ومظهر الغرفة</h3>" +
      '<div class="small" style="margin-bottom:8px">يتم تطبيق الخلفية مع طبقة تظليل تلقائية لإبراز المقاعد الدائرية والشات بوضوح.</div>' +
      "<label>📷 اختر صورة خلفية من المعرض / الجهاز</label>" +
      '<input id="th-file" type="file" accept="image/*" />' +
      '<div id="th-preview" style="margin-top:8px;text-align:center"></div>' +
      '<button class="btn block" id="th-save-file" type="button">✅ تثبيت الصورة المختارة للغرفة</button>' +
      '<label style="margin-top:12px">أو رابط صورة خلفية مباشر (URL)</label>' +
      '<input id="th-url" type="url" placeholder="https://example.com/bg.jpg" />' +
      '<button class="btn ghost block" id="th-custom" type="button">تطبيق رابط الخلفية</button>' +
      '<h4 style="margin:14px 0 6px;font-size:13px">ثيمات 3D جاهزة:</h4>';

    ROOM_THEMES.forEach(function (th) {
      html += '<div class="row glass" style="margin-bottom:6px">' +
        '<div style="width:36px;height:36px;border-radius:50%;background:' + th.bg + ';border:1px solid var(--border)"></div>' +
        '<div class="info"><div class="name">' + esc(th.name) + '</div></div>' +
        '<button class="btn sm" data-th="' + th.id + '" type="button">تطبيق</button></div>';
    });

    openSheet(html);
    $("sheet").onclick = null;
    var pickedGalleryBg = "";

    $("th-file").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        pickedGalleryBg = await readImageFileAsDataUrl(f, 720, 0.72);
        $("th-preview").innerHTML = '<img src="' + esc(pickedGalleryBg) + '" style="max-width:100%;max-height:140px;border-radius:14px;border:1px solid var(--border)" />';
        toast("الصورة جاهزة — اضغط تثبيت الصورة ✅");
      } catch (err) {
        toast(err.message || "تعذر قراءة الصورة");
      }
    };

    $("th-save-file").onclick = function () {
      if (!pickedGalleryBg) {
        toast("اختر صورة من المعرض أولاً 📷");
        return;
      }
      var customObj = { id: "gallery", name: "خلفية مخصصة", bgImage: pickedGalleryBg, accent: "#ec4899" };
      room.theme = customObj;
      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + room.id + "/theme").set(customObj).catch(function () { /* */ });
      }
      applyRoomTheme(customObj);
      saveLocal();
      closeSheet();
      pushRoomMsg(room, { sys: true, text: "🖼️ قام " + S.me.name + " بتحديث خلفية الغرفة" });
      toast("تم تحديث خلفية الغرفة للجميع ✅");
    };

    $("sheet").querySelectorAll("[data-th]").forEach(function (btn) {
      btn.onclick = function () {
        var found = ROOM_THEMES.filter(function (x) { return x.id === btn.getAttribute("data-th"); })[0] || ROOM_THEMES[0];
        room.theme = found;
        if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/theme").set(found).catch(function () { /* */ });
        applyRoomTheme(found);
        saveLocal();
        closeSheet();
        toast("تم تطبيق الثيم 🎨");
      };
    });

    $("th-custom").onclick = function () {
      var u = $("th-url").value.trim();
      if (!u) { toast("أدخل رابط صورة"); return; }
      var custom = { id: "custom", name: "مخصص", bgImage: u, accent: "#ec4899" };
      room.theme = custom;
      if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/theme").set(custom).catch(function () { /* */ });
      applyRoomTheme(custom);
      saveLocal();
      closeSheet();
      toast("تم تحديث خلفية الغرفة ✅");
    };
  }

  function openRoomMenu() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var r = role(room, S.me.id), items = [];
    items.push({ label: "👥 عرض الموجودين (" + count(room) + ")", fn: function () { showMembers(room); } });
    if (r === "owner" || r === "mod") {
      items.push({ label: "🖼️ تغيير خلفية الغرفة (من المعرض)", fn: function () { openThemeSheet(room); } });
    }
    items.push({ label: "🎮 ألعاب الغرفة (عجلة / صراحة / أسئلة)", fn: function () { openGamesSheet(room); } });
    items.push({ label: "🔗 نسخ رابط الغرفة", fn: copyRoomLink });
    items.push({ label: "💬 مشاركة عبر واتساب", fn: function () { window.open("https://wa.me/?text=" + encodeURIComponent("انضم إلى غرفتي في REAL VOICE: " + room.name + " — " + roomLink(room)), "_blank"); } });
    items.push({ label: "📨 دعوة صديق", fn: function () { inviteFriend(room); } });

    if (r === "owner" || r === "mod") {
      items.push({ label: "🚫 قائمة المحظورين (" + (room.bans ? room.bans.length : 0) + ")", fn: function () { openBannedList(room); } });
      items.push({
        label: "📌 تثبيت رسالة",
        fn: function () {
          promptRoom("تثبيت رسالة", "اكتب الرسالة المثبتة", room.pinned, function (v) {
            var val = clean(v);
            room.pinned = val;
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/pinned").set(val).catch(function () { /* */ });
            saveLocal(); renderRoom();
          });
        }
      });
    }
    if (r === "owner") {
      items.push({
        label: "🔇 كتم الكل على المقاعد",
        fn: function () {
          room.seats.forEach(function (s, idx) {
            if (s.uid && s.uid !== S.me.id) {
              s.muted = true;
              if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + idx + "/muted").set(true).catch(function () { /* */ });
            }
          });
          saveLocal(); renderRoom();
          toast("تم كتم الجميع 🔇");
        }
      });
      items.push({
        label: "🔊 فك الكتم عن الكل",
        fn: function () {
          room.seats.forEach(function (s, idx) {
            s.muted = false;
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + idx + "/muted").set(false).catch(function () { /* */ });
          });
          saveLocal(); renderRoom();
          toast("تم فك الكتم عن الجميع 🔊");
        }
      });
      items.push({
        label: "✏️ تغيير اسم الغرفة",
        fn: function () {
          promptRoom("اسم الغرفة", "الاسم الجديد", room.name, function (v) {
            if (!v) return;
            var val = clean(v);
            room.name = val;
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/name").set(val).catch(function () { /* */ });
            saveLocal(); renderRoom();
          });
        }
      });
      items.push({
        label: "🎨 تغيير أيقونة الغرفة",
        fn: function () {
          var nc = (room.color + 1) % COVERS.length, ni = (room.icon + 1) % COVER_ICONS.length;
          room.color = nc; room.icon = ni;
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id).update({ color: nc, icon: ni }).catch(function () { /* */ });
          saveLocal(); renderAll();
          toast("تم تغيير أيقونة الغرفة");
        }
      });
      items.push({
        label: room.locked ? "🔓 فتح الغرفة" : "🔒 قفل الغرفة",
        fn: function () {
          room.locked = !room.locked;
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/locked").set(room.locked).catch(function () { /* */ });
          saveLocal();
          toast(room.locked ? "تم فتح الغرفة" : "تم قفل الغرفة");
        }
      });
      items.push({
        label: "🗑️ حذف الغرفة",
        danger: true,
        fn: function () {
          confirmBox("هل تريد حذف الغرفة نهائياً؟", function () {
            S.rooms = S.rooms.filter(function (x) { return x.id !== room.id; });
            if (cloud.on && cloud.db) {
              cloud.db.ref("rooms/" + room.id).remove().catch(function () { /* */ });
              cloud.db.ref("roomMessages/" + room.id).remove().catch(function () { /* */ });
            }
            UI.roomId = null;
            $("room-view").classList.remove("open");
            leaveVoiceChannel();
            saveLocal(); renderAll();
            toast("تم حذف الغرفة");
          });
        }
      });
    }
    items.push({ label: "🚪 مغادرة الغرفة", danger: true, fn: function () { leaveRoom(false); } });
    actionList(room.name, items);
  }

  function promptRoom(title, label, val, cb) {
    openSheet("<h3>" + esc(title) + "</h3><label>" + esc(label) + '</label><input id="pr-in" maxlength="100" value="' + esc(val) + '" /><button class="btn block" id="pr-ok" type="button">حفظ</button>');
    $("sheet").onclick = null;
    $("pr-ok").onclick = function () { var v = $("pr-in").value.trim(); closeSheet(); cb(v); };
  }

  function roomLink(room) {
    return location.href.split("#")[0].split("?")[0] + "?ref=" + encodeURIComponent(S.me.id) + "#room=" + room.id;
  }

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
      return '<div class="row glass" data-profile="' + esc(id) + '">' + avatarHTML(u) + '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + tag + "</div></div></div>";
    }
    var sp = room.seats.filter(function (s) { return s.uid; });
    html += '<div class="small" style="margin:6px 0">🎤 المتحدثون (' + sp.length + ")</div>" + (sp.map(function (s) { return row(s.uid, "متحدث"); }).join("") || '<div class="small">لا أحد</div>');
    html += '<div class="small" style="margin:10px 0 6px">🎧 المستمعون (' + room.listeners.length + ")</div>" + (room.listeners.map(function (id) { return row(id, "مستمع"); }).join("") || '<div class="small">لا أحد</div>');
    openSheet(html);
    $("sheet").onclick = function (e) {
      var p = e.target.closest("[data-profile]");
      if (p) { closeSheet(); openProfile(p.getAttribute("data-profile")); }
    };
  }

  function inviteFriend(room) {
    if (!S.friends.length) { toast("أضف أصدقاء أولاً"); return; }
    actionList("اختر صديقاً للدعوة", S.friends.map(function (id) {
      return {
        label: "📨 " + getUser(id).name,
        fn: function () {
          toast("تم إرسال الدعوة إلى " + getUser(id).name);
          addNotif("📨", S.me.name + " يدعوك للانضمام إلى غرفة: " + room.name, id);
        }
      };
    }));
  }

  function openGifts(targetId) {
    var room = getRoom(UI.roomId);
    if (!room) return;
    UI.giftTarget = targetId || "room";
    var opts = '<option value="room">🏠 كل الغرفة</option>';
    room.seats.forEach(function (s) { if (s.uid && s.uid !== S.me.id) opts += '<option value="' + esc(s.uid) + '">🎤 ' + esc(getUser(s.uid).name) + "</option>"; });
    room.listeners.forEach(function (id) { if (id !== S.me.id) opts += '<option value="' + esc(id) + '">🎧 ' + esc(getUser(id).name) + "</option>"; });
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
      if (!gift) return;
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
    pushRoomMsg(room, {
      sys: true,
      from: S.me.id,
      text: "🎁 " + S.me.name + " أرسل " + gift.e + " " + gift.n + " إلى " + tname,
      giftAnim: { e: gift.e, fromName: S.me.name, toName: tname }
    });

    if (cloud.on && cloud.db) {
      cloud.db.ref("rooms/" + room.id + "/recvTop/" + target).transaction(function (c) { return (c || 0) + gift.p; }).catch(function () { /* */ });
      if (target !== "room") {
        cloud.db.ref("users/" + target + "/gifts").transaction(function (c) { return (c || 0) + 1; }).catch(function () { /* */ });
        addNotif("🎁", S.me.name + " أرسل لك " + gift.e + " " + gift.n, target);
      }
    } else {
      room.recvTop[target] = (room.recvTop[target] || 0) + gift.p;
    }

    addXP(Math.max(5, Math.round(gift.p / 10)));
    save(); renderRoom(); renderTop();
    showFlyGift(gift.e, S.me.name, tname);
    toast("تم إرسال الهدية ✅");
  }

  /* ========= 14. الملف الشخصي والأصدقاء والرسائل الخاصة ========= */
  function openProfile(id) {
    if (id === S.me.id) { closeSheet(); if (!UI.roomId) go("profile"); return; }
    var u = getUser(id);
    var isF = S.friends.indexOf(id) >= 0, isFol = S.follows.indexOf(id) >= 0, blocked = S.blocked.indexOf(id) >= 0;
    var html = '<div style="text-align:center">' + '<div class="frame" style="display:inline-block">' + avatarHTML(u, "lg") + "</div>" +
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
      if (a === "follow") {
        if (isFol) S.follows = S.follows.filter(function (x) { return x !== id; });
        else S.follows.push(id);
        if (cloud.on && cloud.db) cloud.db.ref("social/" + S.me.id + "/follows/" + id).set(isFol ? null : true).catch(function () { /* */ });
        toast(isFol ? "تم إلغاء المتابعة" : "تمت المتابعة ✅");
        saveLocal(); openProfile(id);
      } else if (a === "add") { sendFriendReq(id); openProfile(id); }
      else if (a === "cancelreq") {
        S.sentReq = S.sentReq.filter(function (x) { return x !== id; });
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/sentReq/" + id] = null;
          ups["social/" + id + "/requests/" + S.me.id] = null;
          cloud.db.ref().update(ups).catch(function () { /* */ });
        }
        saveLocal(); openProfile(id);
      } else if (a === "unfriend") {
        S.friends = S.friends.filter(function (x) { return x !== id; });
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/friends/" + id] = null;
          ups["social/" + id + "/friends/" + S.me.id] = null;
          cloud.db.ref().update(ups).catch(function () { /* */ });
        }
        saveLocal(); toast("تم حذف الصديق"); openProfile(id); renderAll();
      } else if (a === "dm") { closeSheet(); openDM(id); }
      else if (a === "block") { toggleBlock(id); openProfile(id); }
      else if (a === "report") { closeSheet(); toast("تم إرسال البلاغ، شكراً لك"); addNotif("⚠️", "تم استلام بلاغك ضد " + u.name); saveLocal(); }
    };
  }

  function toggleBlock(id) {
    var k = S.blocked.indexOf(id);
    if (k >= 0) S.blocked.splice(k, 1);
    else { S.blocked.push(id); S.friends = S.friends.filter(function (x) { return x !== id; }); }
    if (cloud.on && cloud.db) {
      var ups = {};
      ups["social/" + S.me.id + "/blocked/" + id] = k >= 0 ? null : true;
      if (k < 0) ups["social/" + S.me.id + "/friends/" + id] = null;
      cloud.db.ref().update(ups).catch(function () { /* */ });
    }
    toast(k >= 0 ? "تم إلغاء الحظر" : "تم حظر المستخدم 🚫");
    saveLocal(); renderAll();
  }

  function sendFriendReq(id) {
    if (S.sentReq.indexOf(id) >= 0 || S.friends.indexOf(id) >= 0) return;
    S.sentReq.push(id);
    if (cloud.on && cloud.db) {
      var ups = {};
      ups["social/" + S.me.id + "/sentReq/" + id] = true;
      ups["social/" + id + "/requests/" + S.me.id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
      addNotif("👥", S.me.name + " أرسل لك طلب صداقة.", id);
    }
    completeTask("friend", 25);
    toast("تم إرسال طلب الصداقة ✅");
    saveLocal(); renderAll();
  }

  function openDM(id) {
    if (S.blocked.indexOf(id) >= 0) { toast("هذا المستخدم محظور"); return; }
    cleanup("dm");
    UI.dmId = id;
    S.unread[id] = 0;
    if (!S.dms[id]) S.dms[id] = [];
    saveLocal();

    var u = getUser(id);
    $("chat-title").textContent = u.name;
    $("chat-sub").textContent = u.online ? "متصل الآن" : "غير متصل";
    setAvatarEl($("chat-avatar"), u);
    $("chat-view").classList.add("open");

    if (cloud.on && cloud.db) {
      var tid = dmThreadId(S.me.id, id);
      trackListener("dm", cloud.db.ref("dms/" + tid).limitToLast(100), "value", function (snap) {
        var v = snap.val() || {};
        S.dms[id] = Object.keys(v).map(function (k) { return Object.assign({ key: k }, v[k]); });
        S.unread[id] = 0;
        saveLocal();
        renderDM();
        renderTop();
      });
    } else {
      renderDM();
    }
    renderTop();
  }

  function renderDM() {
    var list = S.dms[UI.dmId] || [];
    var box = $("chat-msgs");
    box.innerHTML = list.length ? list.map(function (m, i) {
      var me = m.from === S.me.id;
      var content = m.audio
        ? '<audio controls src="' + esc(m.audio) + '" style="max-width:210px;height:32px"></audio>'
        : esc(m.text || "");
      return '<div class="msg ' + (me ? "me" : "") + '"' + (me ? ' data-deldm="' + esc(m.key || String(i)) + '"' : "") + ">" + content + '<div class="tm">' + timeStr(m.t) + (me ? " • اضغط للحذف" : "") + "</div></div>";
    }).join("") : '<div class="empty">ابدأ المحادثة بإرسال رسالة 👋</div>';
    box.scrollTop = box.scrollHeight;
  }

  function sendDM(extra) {
    var inp = $("chat-input"), text = inp.value.trim();
    if (!UI.dmId || (!text && (!extra || !extra.audio))) return;
    if (!extra || !extra.audio) inp.value = "";

    var localObj = Object.assign({ key: uid(), from: S.me.id, text: clean(text), t: now() }, extra || {});
    if (!S.dms[UI.dmId]) S.dms[UI.dmId] = [];
    S.dms[UI.dmId].push(localObj);
    saveLocal();
    renderDM();

    if (cloud.on && cloud.db) {
      var tid = dmThreadId(S.me.id, UI.dmId);
      var ups = {};
      ups["userDms/" + S.me.id + "/" + UI.dmId] = true;
      ups["userDms/" + UI.dmId + "/" + S.me.id] = true;
      cloud.db.ref().update(ups).catch(function () { /* */ });
      cloud.db.ref("dms/" + tid).push(Object.assign({}, localObj, { t: serverTs() })).catch(function () { /* */ });
    }
  }

  var voiceRec = { recorder: null, chunks: [], timer: null, active: false };
  async function toggleVoiceNoteDM() {
    if (!UI.dmId) return;
    if (voiceRec.active && voiceRec.recorder) {
      voiceRec.recorder.stop();
      return;
    }
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia || !global.MediaRecorder) {
      toast("التسجيل الصوتي غير مدعوم على هذا المتصفح");
      return;
    }
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var rec = new MediaRecorder(stream);
      voiceRec.recorder = rec;
      voiceRec.chunks = [];
      voiceRec.active = true;
      toast("جاري التسجيل (حد أقصى 30 ثانية)... اضغط 🎙️ للإرسال");

      rec.ondataavailable = function (ev) {
        if (ev.data && ev.data.size > 0) voiceRec.chunks.push(ev.data);
      };
      rec.onstop = function () {
        clearTimeout(voiceRec.timer);
        voiceRec.active = false;
        stream.getTracks().forEach(function (tr) { tr.stop(); });
        var blob = new Blob(voiceRec.chunks, { type: rec.mimeType || "audio/webm" });
        if (blob.size > 200 * 1024) {
          toast("حجم التسجيل تجاوز 200KB، جرّب تسجيل أقصر");
          return;
        }
        var reader = new FileReader();
        reader.onloadend = function () {
          sendDM({ audio: reader.result });
          toast("تم إرسال الرسالة الصوتية 🎙️");
        };
        reader.readAsDataURL(blob);
      };

      rec.start();
      voiceRec.timer = setTimeout(function () {
        if (voiceRec.active && rec.state !== "inactive") rec.stop();
      }, 30000);
    } catch (e) {
      voiceRec.active = false;
      toast("تعذر الوصول للميكروفون");
    }
  }

  function openDMMenu() {
    var id = UI.dmId;
    actionList(getUser(id).name, [
      { label: "👤 عرض الملف الشخصي", fn: function () { openProfile(id); } },
      {
        label: "🗑️ حذف المحادثة",
        danger: true,
        fn: function () {
          if (cloud.on && cloud.db) cloud.db.ref("dms/" + dmThreadId(S.me.id, id)).remove().catch(function () { /* */ });
          S.dms[id] = []; saveLocal(); renderDM(); renderAll();
          toast("تم حذف المحادثة");
        }
      },
      { label: "🚫 حظر المستخدم", danger: true, fn: function () { toggleBlock(id); $("chat-view").classList.remove("open"); UI.dmId = null; } }
    ]);
  }

  /* ========= 15. الإعدادات والترتيب وتعديل الملف ========= */
  function openEditProfile() {
    openSheet("<h3>✏️ تعديل الملف الشخصي</h3>" +
      '<label>تغيير الصورة من المعرض</label><input id="ep-photo" type="file" accept="image/*" />' +
      (S.me.photo ? '<button class="btn sm ghost" id="ep-rmphoto" type="button" style="margin-top:6px">🗑 إزالة الصورة</button>' : "") +
      '<label>الاسم</label><input id="ep-name" maxlength="20" value="' + esc(S.me.name) + '" />' +
      '<label>النبذة</label><textarea id="ep-bio" rows="3" maxlength="120">' + esc(S.me.bio) + "</textarea>" +
      '<label>الدولة</label><input id="ep-country" maxlength="20" value="' + esc(S.me.country) + '" />' +
      '<button class="btn block" id="ep-ok" type="button">حفظ</button>');
    $("sheet").onclick = null;
    var tempPhoto = S.me.photo || "";
    $("ep-photo").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        tempPhoto = await readImageFileAsDataUrl(f, 320, 0.78);
        toast("تم اختيار الصورة ✅ اضغط حفظ لتثبيتها");
      } catch (err) {
        toast(err.message || "تعذر تحميل الصورة");
      }
    };
    if ($("ep-rmphoto")) {
      $("ep-rmphoto").onclick = function () {
        tempPhoto = "";
        toast("ستتم إزالة الصورة عند الحفظ");
      };
    }
    $("ep-ok").onclick = function () {
      var n = $("ep-name").value.trim();
      if (!n) { toast("الاسم لا يمكن أن يكون فارغاً"); return; }
      S.me.name = clean(n);
      S.me.photo = tempPhoto;
      S.me.bio = clean($("ep-bio").value.trim());
      S.me.country = clean($("ep-country").value.trim()) || S.me.country;
      save(); closeSheet(); renderAll();
      if (UI.roomId) renderRoom();
      toast("تم حفظ الملف الشخصي ✅");
    };
  }

  function openSettings() {
    openSheet("<h3>⚙️ الإعدادات</h3>" +
      '<div class="switchrow"><span>إشعارات التطبيق</span><button class="btn sm ' + (S.settings.notif ? "" : "ghost") + '" data-set="notif" type="button">' + (S.settings.notif ? "مفعّل" : "متوقف") + "</button></div>" +
      '<div class="switchrow"><span>المؤثرات الصوتية</span><button class="btn sm ' + (S.settings.sound ? "" : "ghost") + '" data-set="sound" type="button">' + (S.settings.sound ? "مفعّل" : "متوقف") + "</button></div>" +
      '<div class="switchrow"><span>المستخدمون المحظورون</span><button class="btn sm ghost" data-set="blocked" type="button">' + S.blocked.length + " ◀</button></div>" +
      '<div class="switchrow"><span>حالة الاتصال</span><span class="small">' + (cloud.on ? "🟢 سحابي حي" : "🟡 محلي") + "</span></div>" +
      '<button class="btn ghost block" data-set="reset" type="button">🔄 إعادة تعيين بيانات التطبيق</button>');
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-set]");
      if (!b) return;
      var k = b.getAttribute("data-set");
      if (k === "notif" || k === "sound") { S.settings[k] = !S.settings[k]; saveLocal(); openSettings(); }
      else if (k === "blocked") openBlocked();
      else if (k === "reset") {
        confirmBox("سيتم حذف البيانات المحلية وإعادة تحميل التطبيق. متابعة؟", function () {
          try { localStorage.removeItem(CONFIG.storageKey); } catch (x) { /* */ }
          location.reload();
        });
      }
    };
  }

  function openBlocked() {
    var html = "<h3>🚫 المحظورون</h3>" + (S.blocked.length ? S.blocked.map(function (id) {
      return '<div class="row glass">' + avatarHTML(getUser(id), "sm") + '<div class="info"><div class="name">' + esc(getUser(id).name) + '</div></div><button class="btn sm" data-unblock="' + esc(id) + '" type="button">إلغاء الحظر</button></div>';
    }).join("") : '<div class="empty">لا يوجد محظورون</div>');
    openSheet(html);
    $("sheet").onclick = function (e) { var b = e.target.closest("[data-unblock]"); if (b) { toggleBlock(b.getAttribute("data-unblock")); openBlocked(); } };
  }

  function openLeaderboard() {
    var all = S.users.map(function (u) {
      var lv = u.level || (Math.floor((u.xp || 0) / CONFIG.xpPerLevel) + 1);
      return { name: u.name, lv: lv, vip: u.vip || 0 };
    });
    all.push({ name: S.me.name + " (أنت)", lv: level(), vip: S.me.vip });
    all.sort(function (a, b) { return b.lv - a.lv; });
    var medals = ["🥇", "🥈", "🥉"];
    var html = "<h3>🏆 لوحة الترتيب (حسب المستوى)</h3>" + all.slice(0, 20).map(function (u, i) {
      return '<div class="row glass"><div style="font-size:22px;width:32px;text-align:center">' + (medals[i] || (i + 1)) + '</div><div class="info"><div class="name">' + esc(u.name) + '</div></div><span class="tag">المستوى ' + u.lv + "</span></div>";
    }).join("");
    openSheet(html);
    $("sheet").onclick = null;
  }

  function openStickersSheet() {
    var grid = STICKERS.map(function (st) {
      return '<button class="gift" data-st="' + st.id + '" type="button"><div class="e">' + st.e + "</div><small>" + esc(st.n) + "</small></button>";
    }).join("");
    openSheet("<h3>🎭 الملصقات</h3><div class='giftgrid'>" + grid + "</div>");
    $("sheet").onclick = function (e) {
      var btn = e.target.closest("[data-st]");
      if (!btn) return;
      var st = STICKERS.filter(function (x) { return x.id === btn.getAttribute("data-st"); })[0];
      closeSheet();
      if (st) sendRoomMsg(st.n, { sticker: st.e });
    };
  }

  function openPhotoSheet() {
    openSheet('<h3>📷 إرسال صورة في الشات</h3><label>اختر صورة من المعرض</label><input id="ph-file" type="file" accept="image/*" /><label>أو رابط الصورة المباشر</label><input id="ph-url" type="url" placeholder="https://example.com/image.png" /><div id="ph-prev" style="margin-top:8px;text-align:center"></div><button class="btn block" id="ph-send" type="button">إرسال الصورة</button>');
    $("sheet").onclick = null;
    $("ph-file").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        var dataUrl = await readImageFileAsDataUrl(f, 480, 0.78);
        $("ph-url").value = dataUrl;
        $("ph-prev").innerHTML = '<img src="' + esc(dataUrl) + '" style="max-width:160px;max-height:130px;border-radius:10px" />';
      } catch (err) {
        toast(err.message || "تعذر تحميل الصورة");
      }
    };
    $("ph-url").addEventListener("input", function () {
      var u = this.value.trim();
      $("ph-prev").innerHTML = u ? '<img src="' + esc(u) + '" style="max-width:160px;max-height:130px;border-radius:10px" />' : "";
    });
    $("ph-send").onclick = function () {
      var u = $("ph-url").value.trim();
      if (!u) { toast("اختر صورة أو أدخل رابطاً"); return; }
      closeSheet();
      sendRoomMsg("📷 صورة", { img: u });
    };
  }

  /* ========= 16. ربط الأحداث ========= */
  function bind() {
    document.addEventListener("click", function (e) {
      var t = e.target, el;
      if (!t || typeof t.closest !== "function") return;
      if (UI.roomId) resumeAllRemoteAudioTracks();
      if (t.closest("#sheet")) return;

      if ((el = t.closest("[data-enter]"))) { closeSheet(); enterRoom(el.getAttribute("data-enter")); return; }
      if ((el = t.closest(".navbtn"))) { go(el.getAttribute("data-page")); return; }
      if ((el = t.closest("#home-tabs .tab"))) { UI.filter = el.getAttribute("data-filter"); renderHome(); return; }
      if ((el = t.closest("#rooms-tabs .tab"))) { UI.rfilter = el.getAttribute("data-rfilter"); renderRooms(); return; }
      if ((el = t.closest("#friends-tabs .tab"))) { UI.ftab = el.getAttribute("data-ftab"); renderFriends(); return; }
      if ((el = t.closest("[data-seat]"))) { onSeatTap(Number(el.getAttribute("data-seat"))); return; }
      if ((el = t.closest("[data-quizans]"))) {
        var ansIdx = Number(el.getAttribute("data-quizans"));
        var room = getRoom(UI.roomId);
        if (room && UI.quiz && UI.quiz.active) {
          if (!UI.quiz.answers) UI.quiz.answers = {};
          UI.quiz.answers[S.me.id] = ansIdx;
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/quiz/current/answers/" + S.me.id).set(ansIdx).catch(function () { /* */ });
          if (ansIdx === UI.quiz.ans) {
            S.me.coins += 30;
            addXP(10);
            save(); renderTop();
            toast("إجابة صحيحة! +30 عملة 🎉");
          } else {
            toast("إجابة غير صحيحة، حاول في السؤال التالي");
          }
          renderQuizBox();
        }
        return;
      }
      if ((el = t.closest("[data-accept]"))) {
        var a = el.getAttribute("data-accept");
        S.requests = S.requests.filter(function (x) { return x !== a; });
        if (S.friends.indexOf(a) < 0) S.friends.push(a);
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/requests/" + a] = null;
          ups["social/" + S.me.id + "/friends/" + a] = true;
          ups["social/" + a + "/sentReq/" + S.me.id] = null;
          ups["social/" + a + "/friends/" + S.me.id] = true;
          cloud.db.ref().update(ups).catch(function () { /* */ });
          addNotif("✅", S.me.name + " قبل طلب الصداقة.", a);
        }
        S.me.ach.social = true; addXP(10); toast("تمت إضافة " + getUser(a).name + " ✅"); save(); renderAll(); return;
      }
      if ((el = t.closest("[data-reject]"))) {
        var rj = el.getAttribute("data-reject");
        S.requests = S.requests.filter(function (x) { return x !== rj; });
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/requests/" + rj] = null;
          ups["social/" + rj + "/sentReq/" + S.me.id] = null;
          cloud.db.ref().update(ups).catch(function () { /* */ });
        }
        saveLocal(); renderAll(); return;
      }
      if ((el = t.closest("[data-cancelreq]"))) {
        var cr = el.getAttribute("data-cancelreq");
        S.sentReq = S.sentReq.filter(function (x) { return x !== cr; });
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/sentReq/" + cr] = null;
          ups["social/" + cr + "/requests/" + S.me.id] = null;
          cloud.db.ref().update(ups).catch(function () { /* */ });
        }
        saveLocal(); renderAll(); return;
      }
      if ((el = t.closest("[data-addfriend]"))) { sendFriendReq(el.getAttribute("data-addfriend")); return; }
      if ((el = t.closest("[data-delmsg]"))) {
        var room = getRoom(UI.roomId), msgKey = el.getAttribute("data-delmsg");
        if (room && Array.isArray(room.msgs)) {
          var idx = -1;
          for (var k = 0; k < room.msgs.length; k++) {
            if ((room.msgs[k].key && String(room.msgs[k].key) === String(msgKey)) || String(k) === String(msgKey)) {
              idx = k;
              break;
            }
          }
          if (idx >= 0 && room.msgs[idx].from === S.me.id) {
            if (cloud.on && cloud.db && room.msgs[idx].key && String(room.msgs[idx].key).indexOf("u") !== 0) {
              cloud.db.ref("roomMessages/" + room.id + "/" + room.msgs[idx].key).remove().catch(function () { /* */ });
            }
            room.msgs.splice(idx, 1);
            saveLocal();
            renderRoomChat();
            toast("تم حذف الرسالة");
          }
        }
        return;
      }
      if ((el = t.closest("[data-deldm]"))) {
        var list = S.dms[UI.dmId], dmKey = el.getAttribute("data-deldm");
        if (Array.isArray(list)) {
          var j = -1;
          for (var mIdx = 0; mIdx < list.length; mIdx++) {
            if ((list[mIdx].key && String(list[mIdx].key) === String(dmKey)) || String(mIdx) === String(dmKey)) {
              j = mIdx;
              break;
            }
          }
          if (j >= 0) {
            if (cloud.on && cloud.db && list[j].key && String(list[j].key).indexOf("u") !== 0) {
              cloud.db.ref("dms/" + dmThreadId(S.me.id, UI.dmId) + "/" + list[j].key).remove().catch(function () { /* */ });
            }
            list.splice(j, 1);
            saveLocal();
            renderDM();
          }
        }
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

    $("pf-photo-trigger").onclick = function () {
      var fin = $("pf-photo-input");
      if (fin) fin.click();
    };
    $("pf-photo-input").onchange = async function () {
      var f = this.files && this.files[0];
      if (!f) return;
      try {
        var dataUrl = await readImageFileAsDataUrl(f, 320, 0.78);
        S.me.photo = dataUrl;
        save();
        renderAll();
        if (UI.roomId) renderRoom();
        toast("تم تحديث صورة الملف الشخصي من المعرض ✅");
      } catch (err) {
        toast(err.message || "تعذر تحميل الصورة");
      }
      this.value = "";
    };

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
    $("pf-daily").onclick = function () {
      var last = Number(S.me.daily || 0);
      if (Date.now() - last < 24 * 60 * 60 * 1000) {
        toast("لقد استلمت مكافأة اليوم بالفعل");
        return;
      }
      S.me.daily = Date.now();
      S.me.coins += 100;
      addXP(10);
      save(); renderAll();
      toast("🎁 تم استلام 100 عملة اليوم!");
    };

    $("room-back").onclick = function () { leaveRoom(false); };
    $("room-presence-btn").onclick = function () {
      var r = getRoom(UI.roomId);
      if (r) showMembers(r);
    };
    if ($("room-bg-quick")) {
      $("room-bg-quick").onclick = function () {
        var r = getRoom(UI.roomId);
        if (r) openThemeSheet(r);
      };
    }
    $("room-music").onclick = openMusicSheet;
    $("room-hand").onclick = openHandQueueSheet;
    $("room-sticker").onclick = openStickersSheet;
    $("room-photo").onclick = openPhotoSheet;
    $("mmini-toggle").onclick = function () { togglePlayPauseMusic(getRoom(UI.roomId)); };
    $("mmini-skip").onclick = function () { skipMusicTrack(getRoom(UI.roomId), false); };
    $("mmini-open").onclick = openMusicSheet;

    $("room-menu").onclick = openRoomMenu;
    $("room-send").onclick = function () { var i = $("room-input"); sendRoomMsg(i.value); i.value = ""; };
    $("room-input").addEventListener("keydown", function (e) { if (e.key === "Enter") { sendRoomMsg(this.value); this.value = ""; } });
    $("room-gift").onclick = function () { openGifts("room"); };
    $("mic-btn").onclick = async function () {
      var room = getRoom(UI.roomId);
      var mySeat = room ? seatIndexOf(room, S.me.id) : -1;
      if (mySeat >= 0 && room.seats[mySeat].muted) {
        toast("أنت مكتوم من قِبل إدارة الغرفة 🔇");
        return;
      }
      UI.micMuted = !UI.micMuted;
      await syncMicHardwareState();
      toast(UI.micMuted ? "تم إغلاق المايك 🔇" : "تم تشغيل المايك 🎤");
      renderRoom();
    };
    $("chat-back").onclick = function () {
      cleanup("dm");
      $("chat-view").classList.remove("open");
      UI.dmId = null;
      renderAll();
    };
    $("chat-send").onclick = function () { sendDM(); };
    $("chat-input").addEventListener("keydown", function (e) { if (e.key === "Enter") sendDM(); });
    $("chat-emoji").onclick = function () { var inp = $("chat-input"); inp.value += EMOJIS[Math.floor(Math.random() * EMOJIS.length)]; inp.focus(); };
    $("chat-voice").onclick = toggleVoiceNoteDM;
    $("chat-menu").onclick = openDMMenu;
    $("room-emojis").innerHTML = EMOJIS.map(function (e) { return '<button type="button">' + e + "</button>"; }).join("");
  }

  /* ========= 17. نقطة الانطلاق ========= */
  async function init() {
    loadLocal();
    initCloud();
    bind();
    renderAll();

    if (cloud.on) {
      await startCloudSync();
      renderAll();
    }

    var m = location.hash.match(/room=([\w-]+)/);
    if (m && getRoom(m[1])) {
      enterRoom(m[1], true);
    }
  }

  try {
    init();
  } catch (err) {
    document.body.insertAdjacentHTML("afterbegin", '<div style="padding:20px;color:#fca5a5">حدث خطأ في تشغيل التطبيق. جرّب مسح بيانات الموقع وإعادة التحميل.</div>');
  }
})(window);
