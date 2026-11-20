(function () {
  const config = window.REAL_VOICE_CONFIG || {};
  const TOTAL_SEATS = 8;

  const els = {
    status: document.getElementById("rv-status"),
    authCard: document.getElementById("auth-card"),
    roomCard: document.getElementById("room-card"),
    usernameInput: document.getElementById("username-input"),
    channelInput: document.getElementById("channel-input"),
    joinBtn: document.getElementById("join-btn"),
    leaveBtn: document.getElementById("leave-btn"),
    micBtn: document.getElementById("mic-btn"),
    activeChannelName: document.getElementById("active-channel-name"),
    seatsGrid: document.getElementById("seats-grid")
  };

  const state = {
    username: "",
    channel: "",
    isJoined: false,
    isMicMuted: false,
    uid: Math.floor(100000 + Math.random() * 900000),
    rtcClient: null,
    localAudioTrack: null,
    remoteUsers: {}
  };

  function setStatus(text, mode) {
    if (!els.status) return;
    els.status.textContent = text;
    els.status.className = "rv-status";
    if (mode === "live") {
      els.status.classList.add("rv-status-live");
    } else if (mode === "connecting") {
      els.status.classList.add("rv-status-connecting");
    } else {
      els.status.classList.add("rv-status-idle");
    }
  }

  function getInitials(name) {
    const clean = (name || "").trim();
    return clean ? clean.slice(0, 2) : "RV";
  }

  function renderSeats() {
    if (!els.seatsGrid) return;
    els.seatsGrid.innerHTML = "";

    const occupied = [];
    if (state.isJoined) {
      occupied.push({
        name: state.username,
        tag: state.isMicMuted ? "مكتوم" : "أنت",
        isSelf: true,
        isSpeaking: !state.isMicMuted
      });
    }

    Object.values(state.remoteUsers).forEach((remote) => {
      occupied.push({
        name: `مستخدم ${remote.uid}`,
        tag: "متصل",
        isSelf: false,
        isSpeaking: Boolean(remote.hasAudio)
      });
    });

    for (let i = 0; i < TOTAL_SEATS; i++) {
      const seat = document.createElement("div");
      seat.className = "rv-seat";

      const occupant = occupied[i];
      if (occupant) {
        seat.classList.add("is-occupied");
        if (occupant.isSpeaking) {
          seat.classList.add("is-speaking");
        }
        seat.innerHTML = `
          <div class="rv-avatar">${getInitials(occupant.name)}</div>
          <div class="rv-seat-name">${occupant.name}</div>
          <div class="rv-seat-tag">${occupant.tag}</div>
        `;
      } else {
        seat.innerHTML = `
          <div class="rv-avatar">+</div>
          <div class="rv-seat-name">مقعد ${i + 1}</div>
          <div class="rv-seat-tag">فارغ</div>
        `;
      }

      els.seatsGrid.appendChild(seat);
    }
  }

  async function fetchAgoraToken(channelName, uid) {
    const baseUrl = (config.tokenServerUrl || "").trim().replace(/\/+$/, "");
    if (!baseUrl) {
      throw new Error("يرجى إضافة رابط سيرفر التوكن (tokenServerUrl) في index.html أولاً.");
    }

    const endpoint = `${baseUrl}/api/agora/token?channel=${encodeURIComponent(channelName)}&uid=${encodeURIComponent(uid)}`;
    const res = await fetch(endpoint);
    if (!res.ok) {
      throw new Error("تعذر الحصول على رمز الصوت (Token) من السيرفر.");
    }

    const data = await res.json();
    if (!data || !data.token) {
      throw new Error("استجابة سيرفر التوكن غير مكتملة.");
    }
    return data.token;
  }

  async function joinRoom() {
    const username = (els.usernameInput.value || "").trim() || "مستخدم";
    const channel = (els.channelInput.value || "").trim() || "real-voice-lobby";

    if (!config.agoraAppId) {
      alert("معرف Agora App ID غير مضبوط في index.html.");
      return;
    }

    if (!window.AgoraRTC) {
      alert("لم يتم تحميل مكتبة Agora RTC. تحقق من اتصال الإنترنت.");
      return;
    }

    els.joinBtn.disabled = true;
    setStatus("جاري الاتصال...", "connecting");

    try {
      const token = await fetchAgoraToken(channel, state.uid);

      const client = window.AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
      state.rtcClient = client;

      client.on("user-published", async (user, mediaType) => {
        await client.subscribe(user, mediaType);
        if (mediaType === "audio" && user.audioTrack) {
          user.audioTrack.play();
        }
        state.remoteUsers[user.uid] = {
          uid: user.uid,
          hasAudio: Boolean(user.hasAudio)
        };
        renderSeats();
      });

      client.on("user-unpublished", (user, mediaType) => {
        if (mediaType === "audio" && state.remoteUsers[user.uid]) {
          state.remoteUsers[user.uid].hasAudio = false;
        }
        renderSeats();
      });

      client.on("user-left", (user) => {
        delete state.remoteUsers[user.uid];
        renderSeats();
      });

      await client.join(config.agoraAppId, channel, token, state.uid);

      const micTrack = await window.AgoraRTC.createMicrophoneAudioTrack();
      state.localAudioTrack = micTrack;
      await client.publish([micTrack]);

      state.username = username;
      state.channel = channel;
      state.isJoined = true;
      state.isMicMuted = false;

      els.activeChannelName.textContent = channel;
      els.authCard.classList.add("rv-hidden");
      els.roomCard.classList.remove("rv-hidden");
      els.micBtn.textContent = "كتم المايك";
      els.micBtn.classList.remove("is-muted");
      setStatus("متصل بالصوت", "live");
      renderSeats();
    } catch (err) {
      console.error(err);
      alert(err && err.message ? err.message : "حدث خطأ أثناء الانضمام للغرفة الصوتية.");
      await leaveRoom(true);
    } finally {
      els.joinBtn.disabled = false;
    }
  }

  async function toggleMic() {
    if (!state.localAudioTrack) return;
    state.isMicMuted = !state.isMicMuted;
    await state.localAudioTrack.setMuted(state.isMicMuted);

    if (state.isMicMuted) {
      els.micBtn.textContent = "فتح المايك";
      els.micBtn.classList.add("is-muted");
    } else {
      els.micBtn.textContent = "كتم المايك";
      els.micBtn.classList.remove("is-muted");
    }
    renderSeats();
  }

  async function leaveRoom(silentFail = false) {
    try {
      if (state.localAudioTrack) {
        state.localAudioTrack.stop();
        state.localAudioTrack.close();
        state.localAudioTrack = null;
      }
      if (state.rtcClient) {
        await state.rtcClient.leave();
        state.rtcClient.removeAllListeners();
        state.rtcClient = null;
      }
    } catch (err) {
      if (!silentFail) {
        console.error(err);
      }
    }

    state.remoteUsers = {};
    state.isJoined = false;
    state.isMicMuted = false;

    els.roomCard.classList.add("rv-hidden");
    els.authCard.classList.remove("rv-hidden");
    setStatus("غير متصل", "idle");
    renderSeats();
  }

  els.joinBtn.addEventListener("click", joinRoom);
  els.micBtn.addEventListener("click", toggleMic);
  els.leaveBtn.addEventListener("click", () => leaveRoom(false));

  renderSeats();
})();
