/* REAL VOICE — الملف الكامل المتكامل (الواجهة + Firebase Realtime + Agora RTC + مشغل موسيقى مشترك + ميزات إضافية) */
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
    storageKey: "rv_state_v2",
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

  // مقترحات أغاني MP3 مجانية للمشغل المشترك
  var DEFAULT_TRACKS = [
    {
      id: "t1",
      title: "Night Chill Beat",
      artist: "SoundHelix",
      cover: "🎵",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
      id: "t2",
      title: "Acoustic Vibes",
      artist: "SoundHelix",
      cover: "🎸",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
      id: "t3",
      title: "Midnight Lounge",
      artist: "SoundHelix",
      cover: "🌙",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
      id: "t4",
      title: "Energy Pulse",
      artist: "SoundHelix",
      cover: "⚡",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-8.mp3"
    }
  ];

  // 12 ملصق جاهز للشات
  var STICKERS = [
    { id: "s1", e: "🥳", n: "حفلة" },
    { id: "s2", e: "🎤", n: "غناء" },
    { id: "s3", e: "👑", n: "ملكي" },
    { id: "s4", e: "🔥", n: "نار" },
    { id: "s5", e: "💖", n: "حب" },
    { id: "s6", e: "😂", n: "ضحك" },
    { id: "s7", e: "🎮", n: "جيمر" },
    { id: "s8", e: "☕", n: "قهوة" },
    { id: "s9", e: "🌙", n: "سهرة" },
    { id: "s10", e: "👏", n: "تصفيق" },
    { id: "s11", e: "💎", n: "ألماس" },
    { id: "s12", e: "🚀", n: "انطلاق" }
  ];

  var ROOM_THEMES = [
    { id: "default", name: "بنفسجي ليلي", bg: "linear-gradient(175deg, #170e2e, #090612 68%)", frame: "linear-gradient(135deg, #f59e0b, #ec4899)" },
    { id: "ocean", name: "أزرق المحيط", bg: "linear-gradient(175deg, #082f49, #061322 70%)", frame: "linear-gradient(135deg, #22d3ee, #3b82f6)" },
    { id: "rose", name: "وردي نيون", bg: "linear-gradient(175deg, #4a0d2e, #120610 70%)", frame: "linear-gradient(135deg, #f472b6, #a855f7)" },
    { id: "emerald", name: "زمردي VIP", bg: "linear-gradient(175deg, #064e3b, #051410 70%)", frame: "linear-gradient(135deg, #34d399, #eab308)" }
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
    return (global.firebase && firebase.database && firebase.database.ServerValue)
      ? firebase.database.ServerValue.TIMESTAMP
      : Date.now();
  }
  function timeStr(t) {
    var d = new Date(t || Date.now()), h = d.getHours(), m = d.getMinutes();
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
    toastTimer = setTimeout(function () { t.classList.remove("show"); }, 2600);
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
    var h = 5381;
    for (var i = 0; i < str.length; i++) h = ((h << 5) + h + str.charCodeAt(i)) | 0;
    return (Math.abs(h) % 2147483646) + 1;
  }

  function dmThreadId(a, b) {
    return [String(a), String(b)].sort().join("__");
  }

  /* ========= 3. إدارة المستمعين والمؤقتات ========= */
  var registry = {};
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

  /* ========= 4. محرك الصوت الحقيقي (Agora RTC) + المشغل الموسيقي المشترك ========= */
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
    fallbackAudio: null,
    sleepTimerId: null,
    lastTrackKey: "",
    roomXpEarned: 0
  };

  function setupAgoraClient() {
    if (voice.client || !global.AgoraRTC) return;
    voice.client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    voice.client.enableAudioVolumeIndicator();

    voice.client.on("user-published", async function (user, mediaType) {
      try {
        await voice.client.subscribe(user, mediaType);
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
      } catch (e) {
        console.warn("Subscribe error", e);
      }
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
        if (v.level > 8) {
          var key = v.uid === 0 ? voice.uidNum : v.uid;
          active[key] = true;
        }
      });
      voice.speakingNums = active;
      updateSpeakingIndicators();
      applyMusicDucking();
    });
  }

  async function fetchRtcToken(channelName, uidNum, roleName) {
    var url = new URL(TOKEN_URL);
    url.searchParams.set("channelName", channelName);
    url.searchParams.set("uid", String(uidNum));
    url.searchParams.set("role", roleName);

    var res = await fetch(url.toString(), { method: "GET" });
    var data = await res.json();
    if (!res.ok || !data.token || !data.appId) {
      throw new Error(data.error || "فشل جلب التوكن من السيرفر");
    }
    return data;
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

  async function stopMusicBroadcast() {
    if (musicState.bufferTrack) {
      try {
        musicState.bufferTrack.stopProcessAudioBuffer();
      } catch (e) { /* */ }
      try {
        if (voice.client && voice.client.connectionState === "CONNECTED") {
          await voice.client.unpublish([musicState.bufferTrack]);
        }
      } catch (e) { /* */ }
      try {
        musicState.bufferTrack.stop();
        musicState.bufferTrack.close();
      } catch (e) { /* */ }
      musicState.bufferTrack = null;
    }
    if (musicState.fallbackAudio) {
      try {
        musicState.fallbackAudio.pause();
        musicState.fallbackAudio.src = "";
      } catch (e) { /* */ }
      musicState.fallbackAudio = null;
    }
  }

  function applyMusicDucking() {
    var m = musicState.data;
    if (!m) return;
    var baseVol = typeof m.volume === "number" ? m.volume : 0.7;
    var someoneSpeaking = Object.keys(voice.speakingNums || {}).length > 0;
    var targetVol = (m.duck !== false && someoneSpeaking) ? Math.max(0.12, baseVol * 0.25) : baseVol;

    if (musicState.bufferTrack && typeof musicState.bufferTrack.setVolume === "function") {
      try { musicState.bufferTrack.setVolume(Math.round(targetVol * 100)); } catch (e) { /* */ }
    }
    if (musicState.fallbackAudio) {
      try { musicState.fallbackAudio.volume = Math.min(1, Math.max(0, targetVol)); } catch (e) { /* */ }
    }
  }

  function playFallbackAudio(m) {
    try {
      if (!musicState.fallbackAudio) {
        musicState.fallbackAudio = new Audio();
        musicState.fallbackAudio.crossOrigin = "anonymous";
      }
      var audio = musicState.fallbackAudio;
      if (audio.src !== m.url) audio.src = m.url;
      applyMusicDucking();

      if (m.paused) {
        audio.pause();
        return;
      }

      var started = typeof m.startedAt === "number" ? m.startedAt : Date.now();
      var expectedSec = Math.max(0, (Date.now() - started) / 1000);
      if (Math.abs((audio.currentTime || 0) - expectedSec) > 1.5) {
        audio.currentTime = expectedSec;
      }
      audio.play().catch(function () { /* تتطلب تفاعل المستخدم */ });
    } catch (e) {
      console.warn("Fallback audio error:", e);
    }
  }

  async function syncDjMusicBroadcast(m) {
    if (!UI.roomId || !m || !m.url || m.djUid !== S.me.id || m.paused) {
      await stopMusicBroadcast();
      return;
    }

    var needPublish = voice.role !== "publisher";
    if (needPublish) {
      await joinVoiceChannel(UI.roomId, "publisher");
    }

    if (global.AgoraRTC && typeof AgoraRTC.createBufferSourceAudioTrack === "function" && voice.client && voice.client.connectionState === "CONNECTED") {
      try {
        await stopMusicBroadcast();
        var track = await AgoraRTC.createBufferSourceAudioTrack({ source: m.url });
        musicState.bufferTrack = track;
        applyMusicDucking();
        await voice.client.publish([track]);
        track.startProcessAudioBuffer();
        return;
      } catch (err) {
        console.warn("BufferSource track failed, using fallback <audio>:", err);
        toast("تعذر بث الموسيقى عبر Agora، تم التفعيل المحلي");
      }
    }
    playFallbackAudio(m);
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
    $("music-mini-title").textContent = statusIcon + " " + (m.title || "أغنية") + " — " + (m.artist || "غير معروف");
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
      artist: clean(trackObj.artist || "REAL VOICE"),
      cover: trackObj.cover || "🎵",
      startedAt: serverTs(),
      paused: false,
      pausedAt: 0,
      volume: (musicState.data && typeof musicState.data.volume === "number") ? musicState.data.volume : 0.7,
      duck: musicState.data ? musicState.data.duck !== false : true,
      skipVotes: {}
    };
    if (cloud.on && cloud.db) {
      await cloud.db.ref("rooms/" + room.id + "/music").set(payload);
    } else {
      musicState.data = Object.assign({}, payload, { startedAt: Date.now() });
      renderMusicMini();
      await syncDjMusicBroadcast(musicState.data);
    }
    pushRoomMsg(room, { sys: true, text: "🎵 بدأ تشغيل: " + payload.title + " — " + payload.artist, t: now() });
  }

  async function togglePlayPauseMusic(room) {
    if (!room || !musicState.data || !canControlMusic(room)) { toast("للمالك أو المشرف فقط"); return; }
    var nextPaused = !musicState.data.paused;
    var upd = {
      paused: nextPaused,
      pausedAt: nextPaused ? Date.now() : 0,
      startedAt: nextPaused ? musicState.data.startedAt : serverTs()
    };
    if (cloud.on && cloud.db) {
      await cloud.db.ref("rooms/" + room.id + "/music").update(upd);
    } else {
      musicState.data = Object.assign({}, musicState.data, upd, { startedAt: Date.now() });
      renderMusicMini();
      await syncDjMusicBroadcast(musicState.data);
    }
  }

  async function skipMusicTrack(room, force) {
    if (!room || !musicState.data) return;
    if (!force && !canControlMusic(room)) {
      // تصويت تخطي (≥ 50% من الموجودين في الغرفة)
      var votes = Object.assign({}, musicState.data.skipVotes || {});
      votes[S.me.id] = true;
      var needed = Math.max(1, Math.ceil(count(room) * 0.5));
      var currentVotes = Object.keys(votes).length;
      if (currentVotes < needed) {
        if (cloud.on && cloud.db) await cloud.db.ref("rooms/" + room.id + "/music/skipVotes").set(votes);
        toast("تم تسجيل صوتك للتخطي (" + currentVotes + "/" + needed + ")");
        return;
      }
    }

    var nextTrack = musicState.queue && musicState.queue.length ? musicState.queue[0] : null;
    if (nextTrack) {
      if (cloud.on && cloud.db && nextTrack._key) {
        await cloud.db.ref("rooms/" + room.id + "/queue/" + nextTrack._key).remove();
      } else {
        musicState.queue.shift();
      }
      await startTrackNow(room, nextTrack);
    } else {
      if (cloud.on && cloud.db) {
        await cloud.db.ref("rooms/" + room.id + "/music").set({
          djUid: musicState.data.djUid || null,
          trackId: null, url: "", title: "", artist: "", cover: "🎵",
          startedAt: serverTs(), paused: true, pausedAt: 0,
          volume: musicState.data.volume || 0.7, duck: musicState.data.duck !== false, skipVotes: {}
        });
      } else {
        musicState.data = null;
        await stopMusicBroadcast();
        renderMusicMini();
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
      t: serverTs()
    };
    if (!item.url) { toast("أدخل رابط MP3 صحيح"); return; }

    if (cloud.on && cloud.db) {
      await cloud.db.ref("rooms/" + room.id + "/queue").push(item);
    } else {
      musicState.queue.push(Object.assign({}, item, { _key: uid(), t: Date.now() }));
    }
    toast("تمت إضافة الأغنية للطابور 🎶");

    // إذا لم يكن هناك أغنية نشطة وكان المستخدم يملك صلاحية التحكم، ابدأها فوراً
    if ((!musicState.data || !musicState.data.url) && canControlMusic(room)) {
      var first = musicState.queue[0] || item;
      if (cloud.on && cloud.db) {
        var snap = await cloud.db.ref("rooms/" + room.id + "/queue").limitToFirst(1).once("value");
        snap.forEach(function (ch) { ch.ref.remove(); });
      } else {
        musicState.queue.shift();
      }
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
      return '<button class="btn sm ghost" data-sug="' + t.id + '" type="button" style="margin:2px">' + t.cover + ' ' + esc(t.title) + '</button>';
    }).join("");

    var qHtml = musicState.queue.length
      ? musicState.queue.map(function (q, idx) {
          return '<div class="row glass" style="margin-bottom:6px;padding:8px">' +
            '<div style="font-size:18px">' + (q.cover || "🎵") + '</div>' +
            '<div class="info"><div class="name">' + esc(q.title) + '</div><div class="meta">' + esc(q.artist) + '</div></div>' +
            '<button class="btn sm ghost" data-delq="' + (q._key || idx) + '" type="button">🗑</button></div>';
        }).join("")
      : '<div class="small" style="padding:8px 0">الطابور فارغ حالياً</div>';

    var html = '<h3>🎵 مشغل الموسيقى المشترك</h3>' +
      '<div class="small" style="margin-bottom:8px">الـ DJ الحالي: <b>' + esc(djUser) + '</b> ' + (isDj ? '(أنت)' : '') + '</div>' +
      '<label>رابط أغنية MP3 مباشر</label>' +
      '<input id="ms-url" type="url" placeholder="https://example.com/song.mp3" />' +
      '<div style="display:flex;gap:6px;margin-top:6px">' +
      '<input id="ms-title" type="text" maxlength="40" placeholder="اسم الأغنية" />' +
      '<input id="ms-artist" type="text" maxlength="40" placeholder="المغني" /></div>' +
      '<button class="btn block" id="ms-add" type="button">➕ أضف للطابور</button>' +
      '<div style="margin-top:8px"><div class="small" style="margin-bottom:4px">اقتراحات سريعة:</div><div>' + sugHtml + '</div></div>' +
      '<h4 style="margin:12px 0 6px;font-size:13px">قائمة الطابور (' + musicState.queue.length + ')</h4>' +
      '<div id="ms-queue-box">' + qHtml + '</div>' +
      '<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap">' +
      (isStaff ? '<button class="btn sm" id="ms-dj" type="button">' + (isDj ? '🎧 أنت DJ الآن' : '🎛️ أنا DJ') + '</button>' : '') +
      (isStaff ? '<button class="btn sm ghost" id="ms-toggle" type="button">⏯ تشغيل/إيقاف</button>' : '') +
      '<button class="btn sm ghost" id="ms-skip" type="button">⏭ تخطي / تصويت</button>' +
      (isStaff ? '<button class="btn sm ghost" id="ms-clear" type="button">مسح الطابور</button>' : '') +
      '</div>' +
      '<div class="switchrow"><span>خفض الموسيقى تلقائياً عند الكلام (Ducking)</span><input id="ms-duck" type="checkbox" ' + duckChecked + ' style="width:auto" /></div>' +
      '<label>مؤقت النوم</label>' +
      '<div style="display:flex;gap:6px">' +
      '<button class="btn sm ghost" data-sleep="15" type="button">15 د</button>' +
      '<button class="btn sm ghost" data-sleep="30" type="button">30 د</button>' +
      '<button class="btn sm ghost" data-sleep="60" type="button">60 د</button>' +
      '<button class="btn sm ghost" data-sleep="0" type="button">إلغاء</button></div>';

    openSheet(html);
    $("sheet").onclick = null;

    $("ms-add").onclick = async function () {
      var u = $("ms-url").value.trim();
      var ti = $("ms-title").value.trim() || "أغنية MP3";
      var ar = $("ms-artist").value.trim() || "مباشر";
      if (!u) { toast("أدخل رابط الأغنية أولاً"); return; }
      await addTrackToQueue(room, { url: u, title: ti, artist: ar, cover: "🎵" });
      openMusicSheet();
    };

    $("sheet").querySelectorAll("[data-sug]").forEach(function (btn) {
      btn.onclick = async function () {
        var found = DEFAULT_TRACKS.filter(function (x) { return x.id === btn.getAttribute("data-sug"); })[0];
        if (found) {
          await addTrackToQueue(room, found);
          openMusicSheet();
        }
      };
    });

    $("sheet").querySelectorAll("[data-delq]").forEach(function (btn) {
      btn.onclick = async function () {
        var key = btn.getAttribute("data-delq");
        if (cloud.on && cloud.db) {
          await cloud.db.ref("rooms/" + room.id + "/queue/" + key).remove();
        } else {
          musicState.queue = musicState.queue.filter(function (x) { return String(x._key) !== String(key); });
        }
        openMusicSheet();
      };
    });

    if ($("ms-dj")) {
      $("ms-dj").onclick = async function () {
        if (!isStaff) { toast("للمالك أو المشرف فقط"); return; }
        if (cloud.on && cloud.db) {
          await cloud.db.ref("rooms/" + room.id + "/music").update({ djUid: S.me.id, startedAt: serverTs(), paused: false });
        } else {
          musicState.data = Object.assign({}, musicState.data || {}, { djUid: S.me.id, startedAt: Date.now(), paused: false });
        }
        toast("أنت الآن الـ DJ في الغرفة 🎛️");
        await syncDjMusicBroadcast(musicState.data);
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
      $("ms-clear").onclick = async function () {
        if (cloud.on && cloud.db) await cloud.db.ref("rooms/" + room.id + "/queue").remove();
        musicState.queue = [];
        toast("تم مسح الطابور");
        openMusicSheet();
      };
    }

    $("ms-duck").onchange = async function () {
      var val = !!$("ms-duck").checked;
      if (cloud.on && cloud.db && musicState.data) {
        await cloud.db.ref("rooms/" + room.id + "/music/duck").set(val);
      } else if (musicState.data) {
        musicState.data.duck = val;
      }
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
      toast("مكتبة الصوت غير محمّلة");
      return false;
    }
    if (voice.joining || voice.leaving) return false;

    setupAgoraClient();
    voice.joining = true;

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
        return true;
      }

      if (voice.client.connectionState !== "DISCONNECTED") {
        await leaveVoiceChannel();
      }

      var tokenData = await fetchRtcToken(channelName, targetUid, desiredRole);
      await voice.client.join(tokenData.appId, channelName, tokenData.token, tokenData.uid ?? targetUid);

      voice.channel = channelName;
      voice.role = desiredRole;

      if (desiredRole === "publisher") {
        await publishLocalMic();
      }
      return true;
    } catch (err) {
      console.error("Agora join error:", err);
      toast("تعذر الاتصال بالصوت: " + (err && err.message ? err.message : "خطأ شبكة"));
      return false;
    } finally {
      voice.joining = false;
    }
  }

  async function publishLocalMic() {
    if (!voice.client || voice.client.connectionState !== "CONNECTED") return false;
    try {
      if (!voice.localTrack) {
        voice.localTrack = await AgoraRTC.createMicrophoneAudioTrack();
      }
      var room = getRoom(UI.roomId);
      var mySeatIdx = room ? seatIndexOf(room, S.me.id) : -1;
      var adminMuted = mySeatIdx >= 0 && room.seats[mySeatIdx].muted;
      var effectiveMuted = UI.micMuted || adminMuted;

      await voice.localTrack.setEnabled(!effectiveMuted);
      await voice.client.publish([voice.localTrack]);
      return true;
    } catch (err) {
      console.error("Mic publish error:", err);
      toast("لم يتم السماح بالوصول إلى الميكروفون 🎤");
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
    } catch (e) {
      console.warn("Leave voice error", e);
    } finally {
      voice.channel = null;
      voice.role = null;
      voice.speakingNums = {};
      voice.leaving = false;
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

  /* ========= 5. الحالة والبيانات (السحابية + المحلية) ========= */
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
      console.error("Firebase init failed", e);
      cloud.on = false;
    }
    return cloud.on;
  }

  function demoUsers() {
    return [
      { id: "RV-1001", num: 1001, name: "ليلى", online: true, bio: "أحب الموسيقى 🎵", vip: 2, level: 7 },
      { id: "RV-1002", num: 1002, name: "أحمد", online: true, bio: "لاعب محترف 🎮", vip: 0, level: 4 },
      { id: "RV-1003", num: 1003, name: "سارة", online: false, bio: "هنا للدردشة ☕", vip: 1, level: 5 },
      { id: "RV-1004", num: 1004, name: "خالد", online: true, bio: "صاحب غرف VIP 👑", vip: 4, level: 12 },
      { id: "RV-1005", num: 1005, name: "مريم", online: false, bio: "مرحباً بالجميع", vip: 0, level: 2 },
      { id: "RV-1006", num: 1006, name: "يوسف", online: true, bio: "تحدي الأسئلة 🧠", vip: 3, level: 9 }
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
      { id: "r1", name: "سهرة الأصدقاء", desc: "دردشة مفتوحة للجميع", cat: "friends", owner: "RV-1001", mods: [], seats: makeSeats(9, ["RV-1001"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 7200000, msgs: [], color: 0, icon: 0, recvTop: {} },
      { id: "r2", name: "تحدي الأسئلة", desc: "مسابقات وجوائز", cat: "games", owner: "RV-1006", mods: [], seats: makeSeats(6, ["RV-1006"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "مسابقة اليوم الساعة 9 مساءً", created: t - 3600000, msgs: [], color: 1, icon: 1, recvTop: {} },
      { id: "r3", name: "قصر الملوك", desc: "غرفة VIP حصرية", cat: "vip", owner: "RV-1004", mods: [], seats: makeSeats(12, ["RV-1004"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 86400000, msgs: [], color: 3, icon: 3, recvTop: {} },
      { id: "r4", name: "ليالي الطرب", desc: "أغاني وموسيقى", cat: "music", owner: "RV-1003", mods: [], seats: makeSeats(4, ["RV-1003"]), listeners: [], bans: [], pass: "", priv: false, locked: false, pinned: "", created: t - 600000, msgs: [], color: 2, icon: 2, recvTop: {} }
    ];
  }

  function freshState() {
    var randNum = Math.floor(10000 + Math.random() * 89999);
    return {
      me: {
        id: "RV-" + randNum, num: randNum, name: "مستخدم جديد",
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
    try {
      var raw = localStorage.getItem(CONFIG.storageKey);
      if (raw) {
        S = JSON.parse(raw);
        if (S && S.me && S.rooms) {
          if (!S.me.num) S.me.num = hashNum(S.me.id);
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
    if (!cloud.on || !cloud.fbUser) return;
    cloud.db.ref("users/" + S.me.id).update({
      id: S.me.id, num: S.me.num, name: S.me.name, bio: S.me.bio,
      coins: S.me.coins, xp: S.me.xp, vip: S.me.vip,
      followers: S.me.followers, visits: S.me.visits, country: S.me.country,
      gifts: S.me.gifts, sent: S.me.sent, msgCount: S.me.msgCount, ach: S.me.ach,
      daily: S.me.daily || 0, tasks: S.me.tasks || {}, invites: S.me.invites || 0,
      level: level()
    }).catch(function () { /* */ });
  }

  function save() {
    saveLocal();
    saveMeCloud();
  }

  function normalizeRoom(id, r) {
    r = r || {};
    var n = Number(r.seatCount) || 9, seats = [];
    for (var i = 0; i < n; i++) {
      var s = (r.seats && r.seats[i]) || {};
      seats.push({
        uid: s.uid || null,
        locked: !!s.locked,
        muted: !!s.muted,
        vip: s.vip != null ? !!s.vip : i === 0
      });
    }
    return {
      id: id, name: r.name || "غرفة", desc: r.desc || "", cat: r.cat || "chat",
      owner: r.owner || "", mods: Object.keys(r.mods || {}),
      seats: seats, listeners: Object.keys(r.listeners || {}),
      bans: Object.keys(r.bans || {}), pass: r.pass || "",
      priv: !!r.priv, locked: !!r.locked, pinned: r.pinned || "",
      created: r.created || 0, color: r.color || 0, icon: r.icon || 0,
      recvTop: r.recvTop || {}, seatCount: n, msgs: cloud.roomMsgs[id] || []
    };
  }

  function requestBrowserNotifPermission() {
    if ("Notification" in global && Notification.permission === "default") {
      Notification.requestPermission().catch(function () { /* */ });
    }
  }

  function triggerBrowserNotif(title, body) {
    if (!S || !S.settings || !S.settings.notif) return;
    if ("Notification" in global && Notification.permission === "granted") {
      try {
        new Notification(title, { body: body });
      } catch (e) { /* */ }
    }
  }

  function startCloudSync() {
    if (!cloud.on) return Promise.resolve();
    return new Promise(function (resolve) {
      var resolved = false;
      function finish() { if (!resolved) { resolved = true; resolve(); } }

      cloud.auth.onAuthStateChanged(function (fbUser) {
        if (!fbUser) return;
        cloud.fbUser = fbUser;
        var myId = fbUser.uid;
        var myNum = hashNum(myId);
        var uRef = cloud.db.ref("users/" + myId);

        uRef.once("value").then(function (snap) {
          var p = snap.val();
          if (p && p.num) {
            S.me = Object.assign(S.me, p, { id: myId, num: p.num });
          } else {
            S.me.id = myId;
            S.me.num = myNum;
            S.me.joined = now();
            uRef.set(Object.assign({}, S.me, { online: true, level: level() }));
          }
          ensureDailyTasks();

          // تتبع الدعوة عبر ?ref={uid}
          var params = new URLSearchParams(location.search);
          var refUid = params.get("ref");
          if (refUid && refUid !== S.me.id && !S.me._invitedBy) {
            S.me._invitedBy = refUid;
            cloud.db.ref("users/" + refUid + "/invites").transaction(function (c) { return (c || 0) + 1; });
          }

          trackListener("app", cloud.db.ref(".info/connected"), "value", function (cs) {
            if (cs.val() !== true) return;
            uRef.child("online").onDisconnect().set(false);
            uRef.child("lastSeen").onDisconnect().set(firebase.database.ServerValue.TIMESTAMP);
            uRef.update({ online: true });
          });

          trackListener("app", cloud.db.ref("users"), "value", function (usnap) {
            var val = usnap.val() || {};
            cloud.usersMap = val;
            var list = [];
            Object.keys(val).forEach(function (k) {
              if (k !== S.me.id) list.push(Object.assign({ id: k }, val[k]));
            });
            S.users = list;
            renderAll();
            if (UI.roomId) renderRoom();
          });

          trackListener("app", cloud.db.ref("rooms"), "value", function (rsnap) {
            var val = rsnap.val() || {};
            var list = [];
            Object.keys(val).forEach(function (rid) {
              list.push(normalizeRoom(rid, val[rid]));
            });
            S.rooms = list;

            if (UI.roomId) {
              var cur = getRoom(UI.roomId);
              if (!cur) {
                toast("تم إغلاق الغرفة من المالك");
                leaveRoom(false);
              } else if (cur.bans.indexOf(S.me.id) >= 0) {
                toast("تم حظرك من هذه الغرفة 🚫");
                leaveRoom(false);
              } else {
                syncMicHardwareState();
                renderRoom();
              }
            }
            renderAll();
          });

          trackListener("app", cloud.db.ref("social/" + S.me.id), "value", function (ssnap) {
            var sv = ssnap.val() || {};
            S.friends = Object.keys(sv.friends || {});
            S.requests = Object.keys(sv.requests || {});
            S.sentReq = Object.keys(sv.sentReq || {});
            S.follows = Object.keys(sv.follows || {});
            S.blocked = Object.keys(sv.blocked || {});
            renderAll();
          });

          trackListener("app", cloud.db.ref("notifications/" + S.me.id).limitToLast(50), "value", function (nsnap) {
            var nv = nsnap.val() || {};
            var arr = Object.keys(nv).map(function (k) {
              return Object.assign({ id: k }, nv[k]);
            }).sort(function (a, b) { return b.t - a.t; });
            S.notifs = arr;
            renderTop();
          });

          saveLocal();
          finish();
        }).catch(function () { finish(); });
      });

      cloud.auth.signInAnonymously().catch(function (err) {
        console.warn("Anonymous auth failed, using local mode:", err);
        cloud.on = false;
        finish();
      });
    });
  }

  /* ========= 6. دوال البيانات المساعدة ========= */
  function getUser(id) {
    if (id === S.me.id) {
      return {
        id: S.me.id, num: S.me.num, name: S.me.name, online: true,
        bio: S.me.bio, vip: S.me.vip, level: level(), me: true
      };
    }
    if (cloud.usersMap[id]) {
      return Object.assign({ id: id, online: false, bio: "", vip: 0, level: 1 }, cloud.usersMap[id]);
    }
    for (var i = 0; i < S.users.length; i++) {
      if (S.users[i].id === id) return S.users[i];
    }
    return { id: id, num: hashNum(id), name: "مستخدم", online: false, bio: "", vip: 0, level: 1 };
  }

  function getRoom(id) {
    for (var i = 0; i < S.rooms.length; i++) if (S.rooms[i].id === id) return S.rooms[i];
    return null;
  }

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

  function addNotif(icon, text, targetUserId) {
    var uidTarget = targetUserId || S.me.id;
    var item = { id: uid(), icon: icon, text: text, t: now(), read: false };
    requestBrowserNotifPermission();
    triggerBrowserNotif("REAL VOICE " + icon, text);

    if (cloud.on && cloud.db) {
      cloud.db.ref("notifications/" + uidTarget).push({ icon: icon, text: text, t: serverTs(), read: false });
      return;
    }
    if (uidTarget === S.me.id) {
      S.notifs.unshift(item);
      if (S.notifs.length > 60) S.notifs.length = 60;
    }
  }

  function pushRoomMsg(room, msgObj) {
    var payload = Object.assign({}, msgObj, { t: serverTs() });
    if (cloud.on && cloud.db) {
      cloud.db.ref("roomMessages/" + room.id).push(payload);
    } else {
      room.msgs.push(Object.assign({}, msgObj, { t: now() }));
      if (room.msgs.length > 150) room.msgs.shift();
      renderRoomChat();
    }
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
    renderAll();
  }

  function renderTop() {
    $("coins-top").textContent = S.me.coins;
    $("level-top").textContent = level();
    $("avatar-top").textContent = initials(S.me.name);
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
      var us = S.users.filter(function (u) { return (u.name || "").toLowerCase().indexOf(q) >= 0 || (u.id || "").toLowerCase().indexOf(q) >= 0; });
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
      var res = S.users.filter(function (u) { return !q || (u.name || "").toLowerCase().indexOf(q) >= 0 || (u.id || "").toLowerCase().indexOf(q) >= 0; });
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
    var ids = Object.keys(S.dms).filter(function (id) { return S.dms[id] && S.dms[id].length && S.blocked.indexOf(id) < 0; });
    ids.sort(function (a, b) { return S.dms[b][S.dms[b].length - 1].t - S.dms[a][S.dms[a].length - 1].t; });
    $("dm-list").innerHTML = ids.length ? ids.map(function (id) {
      var u = getUser(id), last = S.dms[id][S.dms[id].length - 1], un = S.unread[id] || 0;
      var preview = last.audio ? "🎙️ رسالة صوتية" : esc(last.text || "");
      return '<div class="row glass" data-dm="' + id + '">' + avatarHTML(u) + '<div class="info"><div class="name">' + userNameHTML(u) + '</div><div class="meta">' + (last.from === S.me.id ? "أنت: " : "") + preview + '</div></div><div style="text-align:left"><div class="small">' + timeStr(last.t) + "</div>" + (un ? '<span class="badge" style="position:static;display:inline-flex;margin-top:4px">' + un + "</span>" : "") + "</div></div>";
    }).join("") : '<div class="empty">لا توجد محادثات بعد.<br>افتح ملف صديق واضغط "رسالة".</div>';
  }

  function renderProfile() {
    ensureDailyTasks();
    var m = S.me, lv = level(), into = m.xp % CONFIG.xpPerLevel;
    $("pf-avatar").textContent = initials(m.name);
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
    $("pf-meta").textContent = m.country + " • انضم في " + new Date(m.joined).toLocaleDateString("ar");
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

  function renderAll() {
    renderTop();
    if (UI.page === "home") renderHome();
    else if (UI.page === "rooms") renderRooms();
    else if (UI.page === "friends") renderFriends();
    else if (UI.page === "messages") renderMessages();
    else if (UI.page === "profile") renderProfile();
  }

  /* ========= 8. النوافذ السفلية ========= */
  function openSheet(html) { $("sheet").innerHTML = html; $("scrim").classList.add("open"); }
  function closeSheet() { $("scrim").classList.remove("open"); }

  function actionList(title, items) {
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

  /* ========= 9. الإشعارات ========= */
  function openNotifs() {
    var html = "<h3>🔔 الإشعارات</h3>";
    if (!S.notifs.length) html += '<div class="empty">لا توجد إشعارات</div>';
    S.notifs.forEach(function (n) {
      html += '<div class="row glass" style="margin-bottom:8px"><div style="font-size:24px">' + n.icon + '</div><div class="info"><div class="name" style="white-space:normal;font-weight:' + (n.read ? "normal" : "bold") + '">' + esc(n.text) + '</div><div class="meta">' + timeStr(n.t) + '</div></div><button class="btn sm ghost" data-delnotif="' + n.id + '" type="button">🗑</button></div>';
    });
    if (S.notifs.length) html += '<button class="btn red block" id="clear-notifs" type="button">مسح الكل</button>';
    openSheet(html);
    S.notifs.forEach(function (n) { n.read = true; });
    if (cloud.on && cloud.db) {
      S.notifs.forEach(function (n) { cloud.db.ref("notifications/" + S.me.id + "/" + n.id + "/read").set(true); });
    }
    saveLocal(); renderTop();
    $("sheet").onclick = function (e) {
      var d = e.target.closest("[data-delnotif]");
      if (d) {
        var nid = d.getAttribute("data-delnotif");
        if (cloud.on && cloud.db) cloud.db.ref("notifications/" + S.me.id + "/" + nid).remove();
        S.notifs = S.notifs.filter(function (n) { return n.id !== nid; });
        saveLocal(); openNotifs(); return;
      }
      if (e.target.id === "clear-notifs") {
        if (cloud.on && cloud.db) cloud.db.ref("notifications/" + S.me.id).remove();
        S.notifs = []; saveLocal(); openNotifs();
      }
    };
  }

  /* ========= 10. إنشاء ودخول ومغادرة الغرف ========= */
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
      var roomId = "r" + Math.random().toString(36).slice(2, 7);
      var room = {
        id: roomId, name: clean(name), desc: clean($("cr-desc").value.trim()), cat: $("cr-cat").value,
        owner: S.me.id, mods: [], seats: makeSeats(n, []), listeners: [], bans: [], pass: $("cr-pass").value.trim(),
        priv: $("cr-priv").value === "1", locked: false, pinned: "", created: now(), msgs: [],
        color: Math.floor(Math.random() * COVERS.length), icon: Math.floor(Math.random() * COVER_ICONS.length), recvTop: {}
      };
      if (cloud.on && cloud.db) {
        cloud.db.ref("rooms/" + roomId).set({
          name: room.name, desc: room.desc, cat: room.cat, owner: room.owner,
          seatCount: n, pass: room.pass, priv: room.priv, locked: false,
          pinned: "", created: serverTs(), color: room.color, icon: room.icon
        });
      } else {
        S.rooms.unshift(room);
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
    rv.style.background = t.bg || ROOM_THEMES[0].bg;
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

  async function enterRoom(id, skipPass) {
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
      await leaveRoom(true);
    }

    cleanup("room");
    musicState.roomXpEarned = 0;
    musicState.data = null;
    musicState.queue = [];
    UI.micQueue = {};
    UI.quiz = null;
    applyRoomTheme(ROOM_THEMES[0]);
    renderMusicMini();
    renderQuizBox();

    if (!inRoom(room, S.me.id)) {
      if (cloud.on && cloud.db) {
        var lRef = cloud.db.ref("rooms/" + id + "/listeners/" + S.me.id);
        lRef.onDisconnect().remove();
        lRef.set(true);
      } else {
        room.listeners.push(S.me.id);
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

    // XP تلقائي للتواجد: كل 60 ثانية +2 XP (بحد أقصى 10 XP/ساعة)
    trackTimer("room", setInterval(function () {
      if (!UI.roomId || musicState.roomXpEarned >= 10) return;
      musicState.roomXpEarned += 2;
      addXP(2);
      save();
      renderTop();
    }, 60 * 1000), "interval");

    if (cloud.on && cloud.db) {
      // رسائل الغرفة + الهدايا
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

      // مزامنة المشغل الموسيقي المشترك
      trackListener("room", cloud.db.ref("rooms/" + id + "/music"), "value", async function (musSnap) {
        var prevDj = musicState.data && musicState.data.djUid;
        var m = musSnap.val() || null;
        musicState.data = m;
        renderMusicMini();

        if (prevDj && (!m || !m.djUid) && UI.roomId === id) {
          pushRoomMsg(room, { sys: true, text: "DJ غادر، اختر DJ جديد" });
        }
        await syncDjMusicBroadcast(m);
      });

      // مزامنة طابور الأغاني
      trackListener("room", cloud.db.ref("rooms/" + id + "/queue"), "value", function (qSnap) {
        var qv = qSnap.val() || {};
        musicState.queue = Object.keys(qv).map(function (k) {
          return Object.assign({ _key: k }, qv[k]);
        });
      });

      // طابور رفع اليد للمايك
      trackListener("room", cloud.db.ref("rooms/" + id + "/micQueue"), "value", function (mqSnap) {
        UI.micQueue = mqSnap.val() || {};
      });

      // التفاعلات الحية (آخر 8 ثوانٍ فقط)
      trackListener("room", cloud.db.ref("rooms/" + id + "/reactions").limitToLast(20), "child_added", function (rSnap) {
        var rv = rSnap.val();
        if (!rv || cloud.seenReact[rSnap.key]) return;
        cloud.seenReact[rSnap.key] = true;
        var ts = typeof rv.t === "number" ? rv.t : now();
        if (now() - ts <= 8000) {
          showFlyGift(rv.emoji || "👏", rv.fromName || "مستخدم", rv.targetName || "الغرفة");
        }
      });

      // تخصيص الغرفة
      trackListener("room", cloud.db.ref("rooms/" + id + "/theme"), "value", function (thSnap) {
        applyRoomTheme(thSnap.val());
      });

      // لعبة الأسئلة
      trackListener("room", cloud.db.ref("rooms/" + id + "/quiz/current"), "value", function (qzSnap) {
        UI.quiz = qzSnap.val() || null;
        renderQuizBox();
      });
    }

    var initialRole = seatIndexOf(room, S.me.id) >= 0 ? "publisher" : "subscriber";
    await joinVoiceChannel(id, initialRole);
  }

  async function leaveRoom(silent) {
    cleanup("room");
    var rid = UI.roomId;
    var room = getRoom(rid);

    if (room) {
      var si = seatIndexOf(room, S.me.id);
      if (cloud.on && cloud.db) {
        var ups = {};
        if (si >= 0) ups["rooms/" + rid + "/seats/" + si + "/uid"] = null;
        ups["rooms/" + rid + "/listeners/" + S.me.id] = null;
        ups["rooms/" + rid + "/micQueue/" + S.me.id] = null;
        if (musicState.data && musicState.data.djUid === S.me.id) {
          ups["rooms/" + rid + "/music/djUid"] = null;
          ups["rooms/" + rid + "/music/paused"] = true;
        }
        cloud.db.ref().update(ups);
      } else {
        if (si >= 0) room.seats[si].uid = null;
        room.listeners = room.listeners.filter(function (x) { return x !== S.me.id; });
      }
      pushRoomMsg(room, { sys: true, text: S.me.name + " غادر الغرفة" });
    }

    UI.roomId = null;
    musicState.data = null;
    applyRoomTheme(ROOM_THEMES[0]);
    saveLocal();
    $("room-view").classList.remove("open");

    await leaveVoiceChannel();
    if (!silent) renderAll();
  }

  /* ========= 11. رسم الغرفة والمقاعد والدردشة ========= */
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
        var uNum = u.num || hashNum(s.uid);
        var isMuted = s.muted || (s.uid === S.me.id && UI.micMuted);
        var isSpeaking = !isMuted && !!voice.speakingNums[uNum];
        cls += " occ" + (u.vip > 0 || s.vip ? " vip" : "") + (isSpeaking ? " speak" : "");
        inner = esc(initials(u.name)) + (isMuted ? '<span class="mutedmark">🔇</span>' : "");
        name = esc(u.name);
        sub = s.uid === room.owner ? "👑 المالك" : (room.mods.indexOf(s.uid) >= 0 ? "🛡️ مشرف" : (u.me ? "أنت" : "متحدث"));
      } else if (s.locked) {
        cls += " locked"; inner = "🔒"; name = "مقفل"; sub = "مقعد " + (i + 1);
      } else {
        inner = s.vip ? "👑" : "+"; name = "مقعد " + (i + 1); sub = s.vip ? "VIP" : "فارغ";
      }
      return '<div class="seat ' + cls.replace("seat ", "") + '" data-seat="' + i + '"><div class="seatav">' + inner + '</div><div class="seatname">' + name + '</div><div class="seatsub">' + sub + "</div></div>";
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
    var stick = box.scrollTop + box.clientHeight >= box.scrollHeight - 40;
    box.innerHTML = room.msgs.map(function (m, i) {
      if (m.sys) return '<div class="msg sys">' + esc(m.text) + "</div>";
      var u = getUser(m.from), me = m.from === S.me.id;
      var body = "";
      if (m.sticker) body = '<div style="font-size:38px;line-height:1.1">' + esc(m.sticker) + '</div><div class="small">' + esc(m.text || "") + "</div>";
      else if (m.img) body = '<img src="' + esc(m.img) + '" alt="صورة" style="max-width:190px;max-height:170px;border-radius:10px;display:block" />';
      else body = esc(m.text);

      return '<div class="msg ' + (me ? "me " : "") + (m.color ? "col-" + m.color : "") + '"' + (me ? ' data-delmsg="' + i + '"' : "") + '><div class="who">' + userNameHTML(u) + "</div>" + body + '<div class="tm">' + timeStr(m.t) + (me ? " • اضغط للحذف" : "") + "</div></div>";
    }).join("");
    if (stick) box.scrollTop = box.scrollHeight;
  }

  function sendRoomMsg(text, extra) {
    var room = getRoom(UI.roomId);
    text = String(text || "").trim();
    if (!room || (!text && (!extra || (!extra.img && !extra.sticker)))) return;
    var msg = Object.assign({ from: S.me.id, text: clean(text), color: UI.msgColor }, extra || {});
    pushRoomMsg(room, msg);
    S.me.msgCount++;
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
      });
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
        var allowBtn = isStaff ? '<button class="btn sm" data-allowmic="' + ent.uid + '" type="button">اسمح له بالصعود</button>' : "";
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
      $("hq-raise").onclick = async function () {
        if (alreadyRaised) {
          if (cloud.on && cloud.db) await cloud.db.ref("rooms/" + room.id + "/micQueue/" + S.me.id).remove();
          delete UI.micQueue[S.me.id];
          toast("تم إنزال اليد");
        } else {
          if (cloud.on && cloud.db) {
            await cloud.db.ref("rooms/" + room.id + "/micQueue/" + S.me.id).set({ uid: S.me.id, name: S.me.name, t: serverTs() });
          } else {
            UI.micQueue[S.me.id] = { uid: S.me.id, name: S.me.name, t: now() };
          }
          room.mods.concat(room.owner).forEach(function (staffId) {
            if (staffId && staffId !== S.me.id) addNotif("✋", S.me.name + " يطلب المايك في " + room.name, staffId);
          });
          toast("تم رفع يدك ✋");
        }
        closeSheet();
      };
    }

    $("sheet").querySelectorAll("[data-allowmic]").forEach(function (btn) {
      btn.onclick = async function () {
        var targetUid = btn.getAttribute("data-allowmic");
        var freeIdx = -1;
        for (var i = 0; i < room.seats.length; i++) {
          if (!room.seats[i].uid && !room.seats[i].locked) { freeIdx = i; break; }
        }
        if (freeIdx < 0) { toast("لا يوجد مقعد فارغ حالياً"); return; }
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["rooms/" + room.id + "/seats/" + freeIdx + "/uid"] = targetUid;
          ups["rooms/" + room.id + "/listeners/" + targetUid] = null;
          ups["rooms/" + room.id + "/micQueue/" + targetUid] = null;
          await cloud.db.ref().update(ups);
        }
        toast("تم السماح لـ " + getUser(targetUid).name + " بالصعود 🎤");
        closeSheet();
      };
    });
  }

  function onSeatTap(i) {
    var room = getRoom(UI.roomId);
    if (!room) return;
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
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + i + "/locked").set(!s.locked);
            else { s.locked = !s.locked; saveLocal(); renderRoom(); }
          }
        });
      }
      if (myRole === "owner") {
        items.push({
          label: s.vip ? "إلغاء VIP للمقعد" : "👑 جعل المقعد VIP",
          fn: function () {
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + i + "/vip").set(!s.vip);
            else { s.vip = !s.vip; saveLocal(); renderRoom(); }
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
        fn: async function () {
          UI.micMuted = false;
          await stopLocalMic();
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = null;
            ups["rooms/" + room.id + "/listeners/" + S.me.id] = true;
            cloud.db.ref().update(ups);
          } else {
            s.uid = null;
            room.listeners.push(S.me.id);
            saveLocal(); renderRoom();
          }
        }
      });
    } else if (canManage && s.uid !== room.owner && !(myRole === "mod" && room.mods.indexOf(s.uid) >= 0)) {
      items.push({
        label: s.muted ? "🔊 إلغاء كتم المستخدم" : "🔇 كتم المستخدم",
        fn: function () {
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + i + "/muted").set(!s.muted);
          else { s.muted = !s.muted; saveLocal(); renderRoom(); }
          toast(s.muted ? "تم إلغاء الكتم" : "تم كتم " + u.name);
        }
      });
      items.push({
        label: "⬇️ إنزال من المقعد",
        fn: function () {
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = null;
            ups["rooms/" + room.id + "/listeners/" + u.id] = true;
            cloud.db.ref().update(ups);
          } else {
            s.uid = null; room.listeners.push(u.id); saveLocal(); renderRoom();
          }
          toast("تم إنزال " + u.name);
        }
      });
      items.push({
        label: s.locked ? "🔓 فتح المقعد" : "🔒 قفل المقعد بعد الإنزال",
        fn: function () {
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = null;
            ups["rooms/" + room.id + "/seats/" + i + "/locked"] = true;
            ups["rooms/" + room.id + "/listeners/" + u.id] = true;
            cloud.db.ref().update(ups);
          } else {
            s.uid = null; s.locked = true; room.listeners.push(u.id); saveLocal(); renderRoom();
          }
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
          if (cloud.on && cloud.db) {
            var ups = {};
            ups["rooms/" + room.id + "/seats/" + mySeat + "/uid"] = otherUid;
            ups["rooms/" + room.id + "/seats/" + i + "/uid"] = S.me.id;
            cloud.db.ref().update(ups);
          } else {
            room.seats[mySeat].uid = otherUid; s.uid = S.me.id; saveLocal(); renderRoom();
          }
        }
      });
    }
    actionList(u.name, items);
  }

  async function takeSeat(room, i) {
    var cur = seatIndexOf(room, S.me.id);
    if (cloud.on && cloud.db) {
      var ref = cloud.db.ref("rooms/" + room.id + "/seats/" + i);
      var res = await ref.transaction(function (c) {
        if (c && c.uid && c.uid !== S.me.id) return;
        if (c && c.locked) return;
        return Object.assign({}, c || {}, { uid: S.me.id, muted: false });
      });
      if (!res.committed) {
        toast("المقعد مشغول الآن");
        return;
      }
      var ups = {};
      ups["rooms/" + room.id + "/listeners/" + S.me.id] = null;
      ups["rooms/" + room.id + "/micQueue/" + S.me.id] = null;
      if (cur >= 0 && cur !== i) ups["rooms/" + room.id + "/seats/" + cur + "/uid"] = null;
      await cloud.db.ref().update(ups);
    } else {
      if (cur >= 0) room.seats[cur].uid = null;
      room.listeners = room.listeners.filter(function (x) { return x !== S.me.id; });
      room.seats[i].uid = S.me.id;
      room.seats[i].muted = false;
    }

    UI.micMuted = false;
    pushRoomMsg(room, { sys: true, text: S.me.name + " صعد إلى المايك 🎤" });
    addXP(3);
    completeTask("mic", 25);
    save(); renderRoom(); renderTop();

    if (voice.client && voice.client.connectionState === "CONNECTED") {
      await publishLocalMic();
    } else {
      await joinVoiceChannel(room.id, "publisher");
    }
  }

  function toggleMod(room, id) {
    var isMod = room.mods.indexOf(id) >= 0;
    if (cloud.on && cloud.db) {
      cloud.db.ref("rooms/" + room.id + "/mods/" + id).set(isMod ? null : true);
    } else {
      if (isMod) room.mods.splice(room.mods.indexOf(id), 1);
      else room.mods.push(id);
      saveLocal(); renderRoom();
    }
    toast(isMod ? "تمت إزالة الإشراف" : "تمت ترقية مشرف 👑");
  }

  function kickUser(room, id, ban) {
    var si = seatIndexOf(room, id);
    if (cloud.on && cloud.db) {
      var ups = {};
      if (si >= 0) ups["rooms/" + room.id + "/seats/" + si + "/uid"] = null;
      ups["rooms/" + room.id + "/listeners/" + id] = null;
      if (ban) ups["rooms/" + room.id + "/bans/" + id] = true;
      cloud.db.ref().update(ups);
    } else {
      if (si >= 0) room.seats[si].uid = null;
      room.listeners = room.listeners.filter(function (x) { return x !== id; });
      if (ban && room.bans.indexOf(id) < 0) room.bans.push(id);
      saveLocal(); renderRoom();
    }
    pushRoomMsg(room, { sys: true, text: getUser(id).name + (ban ? " تم حظره من الغرفة" : " تم طرده من الغرفة") });
  }

  /* ========= 13. قائمة الغرفة والهدايا والألعاب والتخصيص والحظر ========= */
  function openBannedList(room) {
    var list = room.bans || [];
    var html = "<h3>🚫 قائمة المحظورين</h3>";
    if (!list.length) html += '<div class="empty">لا يوجد محظورون في هذه الغرفة</div>';
    list.forEach(function (bid) {
      var u = getUser(bid);
      html += '<div class="row glass">' + avatarHTML(u, "sm") +
        '<div class="info"><div class="name">' + esc(u.name) + '</div><div class="meta">' + esc(bid) + '</div></div>' +
        '<button class="btn sm" data-unbanroom="' + bid + '" type="button">فك الحظر</button></div>';
    });
    openSheet(html);
    $("sheet").onclick = function (e) {
      var b = e.target.closest("[data-unbanroom]");
      if (!b) return;
      var target = b.getAttribute("data-unbanroom");
      if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/bans/" + target).remove();
      room.bans = room.bans.filter(function (x) { return x !== target; });
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
    $("sheet").onclick = async function (e) {
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
        var quizPayload = { active: true, q: qObj.q, opts: qObj.opts, ans: qObj.ans, answers: {}, t: serverTs() };
        if (cloud.on && cloud.db) await cloud.db.ref("rooms/" + room.id + "/quiz/current").set(quizPayload);
        else { UI.quiz = quizPayload; renderQuizBox(); }
        pushRoomMsg(room, { sys: true, text: "🧠 بدأ تحدي الأسئلة: " + qObj.q });
      } else if (g === "quizstop") {
        if (cloud.on && cloud.db) await cloud.db.ref("rooms/" + room.id + "/quiz/current").set({ active: false });
        else { UI.quiz = null; renderQuizBox(); }
      }
    };
  }

  function openThemeSheet(room) {
    var html = "<h3>🎨 تخصيص الغرفة</h3>";
    ROOM_THEMES.forEach(function (th) {
      html += '<div class="row glass" style="margin-bottom:6px">' +
        '<div style="width:36px;height:36px;border-radius:10px;background:' + th.bg + ';border:1px solid var(--border)"></div>' +
        '<div class="info"><div class="name">' + esc(th.name) + '</div></div>' +
        '<button class="btn sm" data-th="' + th.id + '" type="button">تطبيق</button></div>';
    });
    html += '<label>أو رابط صورة خلفية مخصص (URL)</label><input id="th-url" type="url" placeholder="https://..." /><button class="btn block" id="th-custom" type="button">تطبيق الخلفية</button>';
    openSheet(html);
    $("sheet").onclick = null;
    $("sheet").querySelectorAll("[data-th]").forEach(function (btn) {
      btn.onclick = async function () {
        var found = ROOM_THEMES.filter(function (x) { return x.id === btn.getAttribute("data-th"); })[0] || ROOM_THEMES[0];
        if (cloud.on && cloud.db) await cloud.db.ref("rooms/" + room.id + "/theme").set(found);
        applyRoomTheme(found);
        closeSheet();
        toast("تم تطبيق الثيم 🎨");
      };
    });
    $("th-custom").onclick = async function () {
      var u = $("th-url").value.trim();
      if (!u) { toast("أدخل رابط صورة"); return; }
      var custom = { id: "custom", name: "مخصص", bg: "url('" + u + "') center/cover no-repeat" };
      if (cloud.on && cloud.db) await cloud.db.ref("rooms/" + room.id + "/theme").set(custom);
      applyRoomTheme(custom);
      closeSheet();
      toast("تم تحديث خلفية الغرفة");
    };
  }

  function openRoomMenu() {
    var room = getRoom(UI.roomId);
    if (!room) return;
    var r = role(room, S.me.id), items = [];
    items.push({ label: "👥 عرض الموجودين (" + count(room) + ")", fn: function () { showMembers(room); } });
    items.push({ label: "🎮 ألعاب الغرفة (عجلة / صراحة / أسئلة)", fn: function () { openGamesSheet(room); } });
    items.push({ label: "🎨 تخصيص الغرفة", fn: function () { openThemeSheet(room); } });
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
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/pinned").set(val);
            else { room.pinned = val; saveLocal(); renderRoom(); }
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
              if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + idx + "/muted").set(true);
            }
          });
          renderRoom();
          toast("تم كتم الجميع 🔇");
        }
      });
      items.push({
        label: "🔊 فك الكتم عن الكل",
        fn: function () {
          room.seats.forEach(function (s, idx) {
            s.muted = false;
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/seats/" + idx + "/muted").set(false);
          });
          renderRoom();
          toast("تم فك الكتم عن الجميع 🔊");
        }
      });
      items.push({
        label: "✏️ تغيير اسم الغرفة",
        fn: function () {
          promptRoom("اسم الغرفة", "الاسم الجديد", room.name, function (v) {
            if (!v) return;
            var val = clean(v);
            if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/name").set(val);
            else { room.name = val; saveLocal(); renderRoom(); }
          });
        }
      });
      items.push({
        label: "🖼️ تغيير صورة الغرفة",
        fn: function () {
          var nc = (room.color + 1) % COVERS.length, ni = (room.icon + 1) % COVER_ICONS.length;
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id).update({ color: nc, icon: ni });
          else { room.color = nc; room.icon = ni; saveLocal(); }
          toast("تم تغيير صورة الغرفة");
        }
      });
      items.push({
        label: room.locked ? "🔓 فتح الغرفة" : "🔒 قفل الغرفة",
        fn: function () {
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/locked").set(!room.locked);
          else { room.locked = !room.locked; saveLocal(); }
          toast(room.locked ? "تم فتح الغرفة" : "تم قفل الغرفة");
        }
      });
      items.push({
        label: "🗑️ حذف الغرفة",
        danger: true,
        fn: function () {
          confirmBox("هل تريد حذف الغرفة نهائياً؟", async function () {
            if (cloud.on && cloud.db) {
              await cloud.db.ref("rooms/" + room.id).remove();
              await cloud.db.ref("roomMessages/" + room.id).remove();
            } else {
              S.rooms = S.rooms.filter(function (x) { return x.id !== room.id; });
            }
            UI.roomId = null;
            $("room-view").classList.remove("open");
            await leaveVoiceChannel();
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
    pushRoomMsg(room, {
      sys: true,
      from: S.me.id,
      text: "🎁 " + S.me.name + " أرسل " + gift.e + " " + gift.n + " إلى " + tname,
      giftAnim: { e: gift.e, fromName: S.me.name, toName: tname }
    });

    if (cloud.on && cloud.db) {
      cloud.db.ref("rooms/" + room.id + "/recvTop/" + target).transaction(function (c) { return (c || 0) + gift.p; });
      if (target !== "room") {
        cloud.db.ref("users/" + target + "/gifts").transaction(function (c) { return (c || 0) + 1; });
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

  /* ========= 14. الملف الشخصي والأصدقاء والرسائل الخاصة + الرسائل الصوتية ========= */
  function openProfile(id) {
    if (id === S.me.id) { closeSheet(); if (!UI.roomId) go("profile"); return; }
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
      if (a === "follow") {
        if (cloud.on && cloud.db) {
          cloud.db.ref("social/" + S.me.id + "/follows/" + id).set(isFol ? null : true);
        } else {
          if (isFol) S.follows = S.follows.filter(function (x) { return x !== id; });
          else S.follows.push(id);
        }
        toast(isFol ? "تم إلغاء المتابعة" : "تمت المتابعة ✅");
        saveLocal(); openProfile(id);
      } else if (a === "add") { sendFriendReq(id); openProfile(id); }
      else if (a === "cancelreq") {
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/sentReq/" + id] = null;
          ups["social/" + id + "/requests/" + S.me.id] = null;
          cloud.db.ref().update(ups);
        } else {
          S.sentReq = S.sentReq.filter(function (x) { return x !== id; });
        }
        saveLocal(); openProfile(id);
      } else if (a === "unfriend") {
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/friends/" + id] = null;
          ups["social/" + id + "/friends/" + S.me.id] = null;
          cloud.db.ref().update(ups);
        } else {
          S.friends = S.friends.filter(function (x) { return x !== id; });
        }
        saveLocal(); toast("تم حذف الصديق"); openProfile(id); renderAll();
      } else if (a === "dm") { closeSheet(); openDM(id); }
      else if (a === "block") { toggleBlock(id); openProfile(id); }
      else if (a === "report") { closeSheet(); toast("تم إرسال البلاغ، شكراً لك"); addNotif("⚠️", "تم استلام بلاغك ضد " + u.name); saveLocal(); }
    };
  }

  function toggleBlock(id) {
    var k = S.blocked.indexOf(id);
    if (cloud.on && cloud.db) {
      var ups = {};
      ups["social/" + S.me.id + "/blocked/" + id] = k >= 0 ? null : true;
      if (k < 0) ups["social/" + S.me.id + "/friends/" + id] = null;
      cloud.db.ref().update(ups);
    } else {
      if (k >= 0) S.blocked.splice(k, 1);
      else { S.blocked.push(id); S.friends = S.friends.filter(function (x) { return x !== id; }); }
    }
    toast(k >= 0 ? "تم إلغاء الحظر" : "تم حظر المستخدم 🚫");
    saveLocal(); renderAll();
  }

  function sendFriendReq(id) {
    if (S.sentReq.indexOf(id) >= 0 || S.friends.indexOf(id) >= 0) return;
    if (cloud.on && cloud.db) {
      var ups = {};
      ups["social/" + S.me.id + "/sentReq/" + id] = true;
      ups["social/" + id + "/requests/" + S.me.id] = true;
      cloud.db.ref().update(ups);
      addNotif("👥", S.me.name + " أرسل لك طلب صداقة.", id);
    } else {
      S.sentReq.push(id);
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
    $("chat-avatar").textContent = initials(u.name);
    $("chat-view").classList.add("open");

    if (cloud.on && cloud.db) {
      var tid = dmThreadId(S.me.id, id);
      trackListener("dm", cloud.db.ref("dms/" + tid).limitToLast(100), "value", function (snap) {
        var v = snap.val() || {};
        S.dms[id] = Object.keys(v).map(function (k) { return Object.assign({ key: k }, v[k]); });
        renderDM();
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
      return '<div class="msg ' + (me ? "me" : "") + '"' + (me ? ' data-deldm="' + i + '"' : "") + ">" + content + '<div class="tm">' + timeStr(m.t) + (me ? " • اضغط للحذف" : "") + "</div></div>";
    }).join("") : '<div class="empty">ابدأ المحادثة بإرسال رسالة 👋</div>';
    box.scrollTop = box.scrollHeight;
  }

  function sendDM(extra) {
    var inp = $("chat-input"), text = inp.value.trim();
    if (!UI.dmId || (!text && (!extra || !extra.audio))) return;
    var msgObj = Object.assign({ from: S.me.id, text: clean(text), t: serverTs() }, extra || {});
    if (!extra || !extra.audio) inp.value = "";

    if (cloud.on && cloud.db) {
      var tid = dmThreadId(S.me.id, UI.dmId);
      cloud.db.ref("dms/" + tid).push(msgObj);
    } else {
      if (!S.dms[UI.dmId]) S.dms[UI.dmId] = [];
      S.dms[UI.dmId].push(Object.assign({}, msgObj, { t: now() }));
      saveLocal(); renderDM();
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
          if (cloud.on && cloud.db) cloud.db.ref("dms/" + dmThreadId(S.me.id, id)).remove();
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
      '<label>الاسم</label><input id="ep-name" maxlength="20" value="' + esc(S.me.name) + '" />' +
      '<label>النبذة</label><textarea id="ep-bio" rows="3" maxlength="120">' + esc(S.me.bio) + "</textarea>" +
      '<label>الدولة</label><input id="ep-country" maxlength="20" value="' + esc(S.me.country) + '" />' +
      '<button class="btn block" id="ep-ok" type="button">حفظ</button>');
    $("sheet").onclick = null;
    $("ep-ok").onclick = function () {
      var n = $("ep-name").value.trim();
      if (!n) { toast("الاسم لا يمكن أن يكون فارغاً"); return; }
      S.me.name = clean(n);
      S.me.bio = clean($("ep-bio").value.trim());
      S.me.country = clean($("ep-country").value.trim()) || S.me.country;
      save(); closeSheet(); renderAll(); toast("تم حفظ الملف الشخصي ✅");
    };
  }

  function openSettings() {
    openSheet("<h3>⚙️ الإعدادات</h3>" +
      '<div class="switchrow"><span>إشعارات التطبيق</span><button class="btn sm ' + (S.settings.notif ? "" : "ghost") + '" data-set="notif" type="button">' + (S.settings.notif ? "مفعّل" : "متوقف") + "</button></div>" +
      '<div class="switchrow"><span>المؤثرات الصوتية</span><button class="btn sm ' + (S.settings.sound ? "" : "ghost") + '" data-set="sound" type="button">' + (S.settings.sound ? "مفعّل" : "متوقف") + "</button></div>" +
      '<div class="switchrow"><span>المستخدمون المحظورون</span><button class="btn sm ghost" data-set="blocked" type="button">' + S.blocked.length + " ◀</button></div>" +
      '<div class="switchrow"><span>حالة الاتصال</span><span class="small">' + (cloud.on ? "🟢 سحابي حي + Agora" : "🟡 محلي + Agora") + "</span></div>" +
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
      return '<div class="row glass">' + avatarHTML(getUser(id), "sm") + '<div class="info"><div class="name">' + esc(getUser(id).name) + '</div></div><button class="btn sm" data-unblock="' + id + '" type="button">إلغاء الحظر</button></div>';
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
    openSheet('<h3>📷 إرسال صورة في الشات</h3><label>رابط الصورة المباشر</label><input id="ph-url" type="url" placeholder="https://example.com/image.png" /><div id="ph-prev" style="margin-top:8px;text-align:center"></div><button class="btn block" id="ph-send" type="button">إرسال الصورة</button>');
    $("sheet").onclick = null;
    $("ph-url").addEventListener("input", function () {
      var u = this.value.trim();
      $("ph-prev").innerHTML = u ? '<img src="' + esc(u) + '" style="max-width:160px;max-height:130px;border-radius:10px" />' : "";
    });
    $("ph-send").onclick = function () {
      var u = $("ph-url").value.trim();
      if (!u) { toast("أدخل رابط الصورة"); return; }
      closeSheet();
      sendRoomMsg("📷 صورة", { img: u });
    };
  }

  /* ========= 16. ربط الأحداث ========= */
  function bind() {
    document.addEventListener("click", function (e) {
      var t = e.target, el;
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
          if (cloud.on && cloud.db) cloud.db.ref("rooms/" + room.id + "/quiz/current/answers/" + S.me.id).set(ansIdx);
          if (ansIdx === UI.quiz.ans) {
            S.me.coins += 30;
            addXP(10);
            save(); renderTop();
            toast("إجابة صحيحة! +30 عملة 🎉");
          } else {
            toast("إجابة غير صحيحة، حاول في السؤال التالي");
          }
        }
        return;
      }
      if ((el = t.closest("[data-accept]"))) {
        var a = el.getAttribute("data-accept");
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/requests/" + a] = null;
          ups["social/" + S.me.id + "/friends/" + a] = true;
          ups["social/" + a + "/sentReq/" + S.me.id] = null;
          ups["social/" + a + "/friends/" + S.me.id] = true;
          cloud.db.ref().update(ups);
          addNotif("✅", S.me.name + " قبل طلب الصداقة.", a);
        } else {
          S.requests = S.requests.filter(function (x) { return x !== a; });
          if (S.friends.indexOf(a) < 0) S.friends.push(a);
        }
        S.me.ach.social = true; addXP(10); toast("تمت إضافة " + getUser(a).name + " ✅"); save(); renderAll(); return;
      }
      if ((el = t.closest("[data-reject]"))) {
        var rj = el.getAttribute("data-reject");
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/requests/" + rj] = null;
          ups["social/" + rj + "/sentReq/" + S.me.id] = null;
          cloud.db.ref().update(ups);
        } else {
          S.requests = S.requests.filter(function (x) { return x !== rj; });
        }
        saveLocal(); renderAll(); return;
      }
      if ((el = t.closest("[data-cancelreq]"))) {
        var cr = el.getAttribute("data-cancelreq");
        if (cloud.on && cloud.db) {
          var ups = {};
          ups["social/" + S.me.id + "/sentReq/" + cr] = null;
          ups["social/" + cr + "/requests/" + S.me.id] = null;
          cloud.db.ref().update(ups);
        } else {
          S.sentReq = S.sentReq.filter(function (x) { return x !== cr; });
        }
        saveLocal(); renderAll(); return;
      }
      if ((el = t.closest("[data-addfriend]"))) { sendFriendReq(el.getAttribute("data-addfriend")); return; }
      if ((el = t.closest("[data-delmsg]"))) {
        var room = getRoom(UI.roomId), i = Number(el.getAttribute("data-delmsg"));
        if (room && room.msgs[i] && room.msgs[i].from === S.me.id) {
          if (cloud.on && cloud.db && room.msgs[i].key) {
            cloud.db.ref("roomMessages/" + room.id + "/" + room.msgs[i].key).remove();
          } else {
            room.msgs.splice(i, 1); saveLocal(); renderRoomChat();
          }
          toast("تم حذف الرسالة");
        }
        return;
      }
      if ((el = t.closest("[data-deldm]"))) {
        var list = S.dms[UI.dmId], j = Number(el.getAttribute("data-deldm"));
        if (list && list[j]) {
          if (cloud.on && cloud.db && list[j].key) {
            cloud.db.ref("dms/" + dmThreadId(S.me.id, UI.dmId) + "/" + list[j].key).remove();
          } else {
            list.splice(j, 1); saveLocal(); renderDM();
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
    $("room-music").onclick = openMusicSheet;
    $("room-hand").onclick = openHandQueueSheet;
    $("room-sticker").onclick = openStickersSheet;
    $("room-photo").onclick = openPhotoSheet;
    $("mmini-toggle").onclick = function () { togglePlayPauseMusic(getRoom(UI.roomId)); };
    $("mmini-skip").onclick = function () { skipMusicTrack(getRoom(UI.roomId), false); };
    $("mmini-open").onclick = openMusicSheet;

    $("room-menu").onclick = openRoomMenu;
    $("room-share").onclick = copyRoomLink;
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
      enterRoom(m[1]);
    }
  }

  try {
    init();
  } catch (err) {
    console.error(err);
    document.body.insertAdjacentHTML("afterbegin", '<div style="padding:20px;color:#fca5a5">حدث خطأ في تشغيل التطبيق. جرّب مسح بيانات الموقع وإعادة التحميل.</div>');
  }
})(window);
