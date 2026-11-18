import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    addDoc, 
    doc, 
    getDoc, 
    setDoc, 
    updateDoc,
    onSnapshot, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDyx4MBxvRM0L5FrrjVOfVePlKRSxGpMg4",
  authDomain: "real-voice-aec71.firebaseapp.com",
  projectId: "real-voice-aec71",
  storageBucket: "real-voice-aec71.firebasestorage.app",
  messagingSenderId: "1051527775983",
  appId: "1:1051527775983:web:ae3794c162184fd56b7d1a"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

const AGORA_APP_ID = "9449195b0b3e400494432244036cb569"; 
let agoraClient = null;
let localAudioTrack = null;
let isMicMuted = false;

let currentUser = null;
let currentRoomId = null;
let currentRoomDocData = null;
let userData = null;
let selectedSeatIndex = null;
let selectedTargetUser = null;
let isLoginMode = false;
let roomUnsubscribe = null;

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcome-screen');
    const authScreen = document.getElementById('auth-screen');
    const mainAppContainer = document.getElementById('main-app-container');
    const roomViewScreen = document.getElementById('room-view-screen');
    const bottomNav = document.getElementById('bottom-nav');

    const tabRooms = document.getElementById('tab-rooms');
    const tabProfile = document.getElementById('tab-profile');
    const navRoomsBtn = document.getElementById('nav-rooms-btn');
    const navProfileBtn = document.getElementById('nav-profile-btn');

    const startBtn = document.getElementById('start-btn');
    const authForm = document.getElementById('auth-form');
    const authTitle = document.getElementById('auth-title');
    const authSubmitBtn = document.getElementById('auth-submit-btn');
    const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
    const googleLoginBtn = document.getElementById('google-login-btn');

    const createRoomBtn = document.getElementById('create-room-btn');
    const createRoomModal = document.getElementById('create-room-modal');
    const cancelRoomBtn = document.getElementById('cancel-room-btn');
    const confirmCreateRoom = document.getElementById('confirm-create-room');
    const roomNameInput = document.getElementById('room-name-input');
    const roomImageFile = document.getElementById('room-image-file'); 

    const roomOptionsBtn = document.getElementById('room-options-btn');
    const roomOptionsDropdown = document.getElementById('room-options-dropdown');
    const optChangeName = document.getElementById('opt-change-name');
    const optChangeImg = document.getElementById('opt-change-img');
    const roomNewImageFile = document.getElementById('room-new-image-file');

    const optLeave = document.getElementById('opt-leave');
    const floatingMicToggleBtn = document.getElementById('floating-mic-toggle-btn');
    const floatingMicIcon = document.getElementById('floating-mic-icon');

    const seatOptionsModal = document.getElementById('seat-options-modal');
    const seatSheetContent = document.getElementById('seat-sheet-content');
    const closeSeatModal = document.getElementById('close-seat-modal');
    const optSitSeat = document.getElementById('opt-sit-seat');
    const optLockSeat = document.getElementById('opt-lock-seat');

    const roomUserProfileModal = document.getElementById('room-user-profile-modal');
    const profileSheetContent = document.getElementById('profile-sheet-content');
    const closeUserProfile = document.getElementById('close-user-profile');
    const actionKickMic = document.getElementById('action-kick-mic');
    const actionBan24h = document.getElementById('action-ban-24h');

    const profileDisplayName = document.getElementById('profile-display-name');
    const profileDisplayId = document.getElementById('profile-display-id');
    const profileImgPreview = document.getElementById('profile-img-preview');
    const settingsLogoutSwitch = document.getElementById('settings-logout-switch');

    const chatForm = document.getElementById('chat-form');
    const chatInput = document.getElementById('chat-input');

    if (startBtn) {
        startBtn.addEventListener('click', () => {
            welcomeScreen.classList.add('hidden');
            authScreen.classList.remove('hidden');
        });
    }

    if (toggleAuthModeBtn) {
        toggleAuthModeBtn.addEventListener('click', () => {
            isLoginMode = !isLoginMode;
            authTitle.textContent = isLoginMode ? "تسجيل الدخول" : "إنشاء حساب جديد";
            authSubmitBtn.textContent = isLoginMode ? "دخول" : "تسجيل";
            toggleAuthModeBtn.textContent = isLoginMode ? "ليس لديك حساب؟ انشئ حساب جديد" : "لديك حساب بالفعل؟ سجل دخولك";
        });
    }

    if (authForm) {
        authForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            try {
                if (isLoginMode) {
                    await signInWithEmailAndPassword(auth, email, password);
                } else {
                    await createUserWithEmailAndPassword(auth, email, password);
                }
            } catch (err) { alert("❌ خطأ: " + err.message); }
        });
    }

    if (googleLoginBtn) {
        googleLoginBtn.addEventListener('click', async () => {
            try {
                const provider = new GoogleAuthProvider();
                await signInWithRedirect(auth, provider);
            } catch (err) { alert("❌ خطأ: " + err.message); }
        });
    }

    if (navRoomsBtn && navProfileBtn) {
        navRoomsBtn.addEventListener('click', () => {
            tabRooms.classList.remove('hidden');
            tabProfile.classList.add('hidden');
        });
        navProfileBtn.addEventListener('click', () => {
            tabRooms.classList.add('hidden');
            tabProfile.classList.remove('hidden');
        });
    }

    if (settingsLogoutSwitch) {
        settingsLogoutSwitch.addEventListener('click', async () => {
            if (confirm("هل تريد تسجيل الخروج؟")) await signOut(auth);
        });
    }

    if (createRoomBtn) createRoomBtn.addEventListener('click', () => createRoomModal.classList.remove('hidden'));
    if (cancelRoomBtn) cancelRoomBtn.addEventListener('click', () => createRoomModal.classList.add('hidden'));

    if (confirmCreateRoom) {
        confirmCreateRoom.addEventListener('click', async () => {
            const roomName = roomNameInput.value.trim();
            if (!roomName) return alert("⚠️ اكتب اسم الغرفة!");
            let roomImgUrl = "https://via.placeholder.com/150";
            if (roomImageFile.files[0]) roomImgUrl = await compressImage(roomImageFile.files[0]);

            try {
                const roomRef = await addDoc(collection(db, "rooms"), {
                    name: roomName,
                    image: roomImgUrl,
                    host: userData ? userData.nickname : "المالك",
                    hostUid: currentUser.uid,
                    bannedUsers: [],
                    activeUsers: [],
                    seats: Array(8).fill(null),
                    seatLocks: Array(8).fill(false),
                    messages: [],
                    createdAt: serverTimestamp()
                });
                createRoomModal.classList.add('hidden');
                roomNameInput.value = "";
                enterRoom(roomRef.id);
            } catch (err) { alert("❌ خطأ: " + err.message); }
        });
    }

    if (roomOptionsBtn && roomOptionsDropdown) {
        roomOptionsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            roomOptionsDropdown.classList.toggle('hidden');
        });
        document.addEventListener('click', () => roomOptionsDropdown.classList.add('hidden'));
    }

    if (optChangeName) {
        optChangeName.addEventListener('click', async () => {
            if (!currentRoomDocData || currentRoomDocData.hostUid !== currentUser.uid) {
                return alert("⚠️ عذراً، تغيير اسم الغرفة مخصص لمالك الغرفة فقط!");
            }
            const newName = prompt("اكتب اسم الغرفة الجديد:", currentRoomDocData.name);
            if (newName && newName.trim() !== "") {
                try {
                    await updateDoc(doc(db, "rooms", currentRoomId), { name: newName.trim() });
                    alert("✅ تم تحديث اسم الغرفة بنجاح!");
                } catch (e) { alert("❌ خطأ: " + e.message); }
            }
        });
    }

    if (optChangeImg && roomNewImageFile) {
        optChangeImg.addEventListener('click', () => {
            if (!currentRoomDocData || currentRoomDocData.hostUid !== currentUser.uid) {
                return alert("⚠️ عذراً، تغيير صورة الغرفة مخصص لمالك الغرفة فقط!");
            }
            roomNewImageFile.click();
        });

        roomNewImageFile.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file && currentRoomId) {
                const compressed = await compressImage(file);
                if (compressed) {
                    try {
                        await updateDoc(doc(db, "rooms", currentRoomId), { image: compressed });
                        alert("✅ تم تحديث صورة الغرفة بنجاح!");
                    } catch (err) { alert("❌ خطأ: " + err.message); }
                }
            }
        });
    }

    if (chatForm) {
        chatForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const text = chatInput.value.trim();
            if (!text || !currentRoomId || !userData) return;

            try {
                const roomRef = doc(db, "rooms", currentRoomId);
                const newMsg = {
                    senderName: userData.nickname,
                    text: text,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                };
                const updatedMessages = [...(currentRoomDocData.messages || []), newMsg];
                await updateDoc(roomRef, { messages: updatedMessages });
                chatInput.value = "";
            } catch (err) { console.error(err); }
        });
    }

    if (closeSeatModal) closeSeatModal.addEventListener('click', () => seatSheetContent.classList.remove('show'));

    if (optSitSeat) {
        optSitSeat.addEventListener('click', async () => {
            if (selectedSeatIndex === null || !currentUser || !currentRoomId) return;
            seatSheetContent.classList.remove('show');
            setTimeout(() => seatOptionsModal.classList.add('hidden'), 300);

            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                const roomRef = doc(db, "rooms", currentRoomId);
                let currentSeats = [...(currentRoomDocData.seats || Array(8).fill(null))];

                currentSeats = currentSeats.map(s => (s && s.uid === currentUser.uid) ? null : s);

                currentSeats[selectedSeatIndex] = {
                    uid: currentUser.uid,
                    nickname: userData.nickname,
                    avatar: userData.avatar,
                    userId: userData.userId
                };

                await updateDoc(roomRef, { seats: currentSeats });

                if (!localAudioTrack && agoraClient) {
                    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                    await agoraClient.publish([localAudioTrack]);
                }
                alert("🎤 جلست على المقعد بنجاح!");
            } catch (err) { alert("⚠️ يرجى السماح للميكروفون."); }
        });
    }

    if (optLockSeat) {
        optLockSeat.addEventListener('click', async () => {
            if (selectedSeatIndex === null || !currentRoomId) return;
            if (currentRoomDocData.hostUid !== currentUser.uid) return alert("⚠️ لمالك الغرفة فقط!");

            let locks = [...(currentRoomDocData.seatLocks || Array(8).fill(false))];
            locks[selectedSeatIndex] = !locks[selectedSeatIndex];

            await updateDoc(doc(db, "rooms", currentRoomId), { seatLocks: locks });
            seatSheetContent.classList.remove('show');
            setTimeout(() => seatOptionsModal.classList.add('hidden'), 300);
        });
    }

    if (actionKickMic) {
        actionKickMic.addEventListener('click', async () => {
            if (!selectedTargetUser || !currentRoomId) return;
            let seats = [...(currentRoomDocData.seats || Array(8).fill(null))];
            seats[selectedTargetUser.seatIdx] = null;
            await updateDoc(doc(db, "rooms", currentRoomId), { seats: seats });
            profileSheetContent.classList.remove('show');
            setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
        });
    }

    if (actionBan24h) {
        actionBan24h.addEventListener('click', async () => {
            if (!selectedTargetUser || !currentRoomId) return;
            let banned = currentRoomDocData.bannedUsers || [];
            banned.push({ uid: selectedTargetUser.uid, expiry: Date.now() + 86400000 });
            let seats = [...(currentRoomDocData.seats || Array(8).fill(null))];
            seats = seats.map(s => (s && s.uid === selectedTargetUser.uid) ? null : s);

            await updateDoc(doc(db, "rooms", currentRoomId), { bannedUsers: banned, seats: seats });
            profileSheetContent.classList.remove('show');
            setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
        });
    }

    if (closeUserProfile) {
        closeUserProfile.addEventListener('click', () => {
            profileSheetContent.classList.remove('show');
            setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
        });
    }

    if (floatingMicToggleBtn) {
        floatingMicToggleBtn.addEventListener('click', async () => {
            if (!localAudioTrack) return alert("⚠️ يجب أن تجلس على مقعد أولاً!");
            isMicMuted = !isMicMuted;
            await localAudioTrack.setMuted(isMicMuted);
            floatingMicToggleBtn.className = isMicMuted 
                ? "w-11 h-11 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl border-2 border-red-400 cursor-pointer"
                : "w-11 h-11 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl border-2 border-purple-400 cursor-pointer";
            floatingMicIcon.className = isMicMuted ? "fa-solid fa-microphone-slash text-sm" : "fa-solid fa-microphone text-sm";
        });
    }

    if (optLeave) optLeave.addEventListener('click', leaveRoom);

    onAuthStateChanged(auth, async (user) => {
        currentUser = user;
        if (user) {
            welcomeScreen.classList.add('hidden');
            authScreen.classList.add('hidden');
            mainAppContainer.classList.remove('hidden');
            bottomNav.classList.remove('hidden');

            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);
            if (userSnap.exists()) {
                userData = userSnap.data();
                profileDisplayId.textContent = `ID: ${userData.userId}`;
                profileDisplayName.textContent = userData.nickname || "مستخدم";
                profileImgPreview.src = userData.avatar || "https://via.placeholder.com/150";
            } else {
                userData = {
                    uid: user.uid, email: user.email, userId: Math.floor(100000 + Math.random() * 900000),
                    nickname: user.displayName || user.email.split('@')[0],
                    avatar: user.photoURL || "https://via.placeholder.com/150"
                };
                await setDoc(userRef, userData);
            }
            loadRooms();
        } else {
            welcomeScreen.classList.remove('hidden');
            mainAppContainer.classList.add('hidden');
            bottomNav.classList.add('hidden');
        }
    });
});

getRedirectResult(auth).then(async (result) => {
    if (result && result.user) {
        const userRef = doc(db, "users", result.user.uid);
        if (!(await getDoc(userRef)).exists()) {
            await setDoc(userRef, {
                uid: result.user.uid, email: result.user.email, userId: Math.floor(100000 + Math.random() * 900000),
                nickname: result.user.displayName || "مستخدم جوجل", avatar: result.user.photoURL || "https://via.placeholder.com/150"
            });
        }
    }
}).catch(e => console.error(e));

function compressImage(file) {
    return new Promise((resolve) => {
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (e) => {
            const img = new Image();
            img.src = e.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 200; canvas.height = 200;
                canvas.getContext('2d').drawImage(img, 0, 0, 200, 200);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
        };
    });
}

function loadRooms() {
    const roomsGrid = document.getElementById('rooms-grid');
    if (!roomsGrid) return;
    onSnapshot(collection(db, "rooms"), (snapshot) => {
        roomsGrid.innerHTML = "";
        if (snapshot.empty) {
            roomsGrid.innerHTML = `<p class="col-span-2 text-center text-slate-500 text-xs py-8">لا توجد غرف متاحة حالياً!</p>`;
            return;
        }
        snapshot.forEach((docSnap) => {
            const room = docSnap.data();
            const activeCount = room.activeUsers ? room.activeUsers.length : 0;
            const card = document.createElement('div');
            card.className = "bg-slate-900 border border-purple-500/30 rounded-2xl p-3 flex flex-col items-center cursor-pointer relative shadow-lg";
            card.innerHTML = `
                <div class="absolute top-2 left-2 bg-purple-950 text-purple-200 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/40"><i class="fa-solid fa-users text-[9px]"></i> ${activeCount}</div>
                <img src="${room.image || 'https://via.placeholder.com/150'}" class="w-16 h-16 rounded-xl object-cover mb-2 border border-purple-500/40">
                <h4 class="text-xs font-bold text-purple-200 truncate w-full text-center">${room.name || 'غرفة'}</h4>
                <p class="text-[10px] text-amber-400 mt-1">👑 ${room.host || 'المالك'}</p>
            `;
            card.addEventListener('click', () => enterRoom(docSnap.id));
            roomsGrid.appendChild(card);
        });
    });
}

async function enterRoom(roomId) {
    currentRoomId = roomId;
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;

    currentRoomDocData = roomSnap.data();

    if (!currentRoomDocData.seats) currentRoomDocData.seats = Array(8).fill(null);
    if (!currentRoomDocData.seatLocks) currentRoomDocData.seatLocks = Array(8).fill(false);
    if (!currentRoomDocData.messages) currentRoomDocData.messages = [];

    if (currentRoomDocData.bannedUsers && currentUser) {
        const ban = currentRoomDocData.bannedUsers.find(b => b.uid === currentUser.uid);
        if (ban && ban.expiry > Date.now()) return alert("🚫 أنت محظور من هذه الغرفة.");
    }

    let activeUsers = currentRoomDocData.activeUsers || [];
    if (!activeUsers.includes(currentUser.uid)) {
        activeUsers.push(currentUser.uid);
        await updateDoc(roomRef, { activeUsers: activeUsers });
    }

    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app-container').classList.add('hidden');
    document.getElementById('room-view-screen').classList.remove('hidden');

    updateRoomHeaderUI();

    if (roomUnsubscribe) roomUnsubscribe();
    roomUnsubscribe = onSnapshot(roomRef, (docUpdate) => {
        if (!docUpdate.exists()) return;
        currentRoomDocData = docUpdate.data();

        if (!currentRoomDocData.seats) currentRoomDocData.seats = Array(8).fill(null);
        if (!currentRoomDocData.seatLocks) currentRoomDocData.seatLocks = Array(8).fill(false);
        if (!currentRoomDocData.messages) currentRoomDocData.messages = [];

        if (currentRoomDocData.bannedUsers && currentRoomDocData.bannedUsers.some(b => b.uid === currentUser.uid && b.expiry > Date.now())) {
            alert("🚫 تم طردك من الغرفة!");
            leaveRoom();
            return;
        }

        updateRoomHeaderUI();
        renderLiveSeats();
        renderLiveChat();
    });

    try {
        if (!agoraClient) {
            agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            await agoraClient.join(AGORA_APP_ID, roomId, null, null);
            agoraClient.on("user-published", async (user, mediaType) => {
                await agoraClient.subscribe(user, mediaType);
                if (mediaType === "audio") user.audioTrack.play();
            });
        }
    } catch (e) { console.error(e); }
}

function updateRoomHeaderUI() {
    if (!currentRoomDocData) return;
    document.getElementById('current-room-title').textContent = currentRoomDocData.name || "غرفة صوتية";
    document.getElementById('room-header-avatar').src = currentRoomDocData.image || "https://via.placeholder.com/150";
    document.getElementById('room-owner-tag').textContent = `👑 المالك: ${currentRoomDocData.host || 'غير معروف'}`;
}

function renderLiveSeats() {
    const seats = currentRoomDocData.seats || Array(8).fill(null);
    const locks = currentRoomDocData.seatLocks || Array(8).fill(false);

    for (let i = 0; i < 8; i++) {
        const seatBox = document.getElementById(`seat-${i}`);
        const nameSpan = document.getElementById(`seat-name-${i}`);
        if (!seatBox) continue;

        const occupant = seats[i];
        const isLocked = locks[i];

        seatBox.innerHTML = "";
        if (isLocked) {
            seatBox.className = "w-12 h-12 rounded-full bg-slate-950 border-2 border-red-500 flex items-center justify-center relative cursor-pointer";
            seatBox.innerHTML = `<i class="fa-solid fa-lock text-red-400 text-xs"></i>`;
            nameSpan.textContent = "مقفل";
            nameSpan.className = "text-[9px] text-red-400 truncate w-16 mt-0.5 font-bold";
        } else if (occupant) {
            seatBox.className = "w-12 h-12 rounded-full bg-slate-900 border-2 border-green-500 flex items-center justify-center relative overflow-hidden cursor-pointer";
            seatBox.innerHTML = `<img src="${occupant.avatar}" class="w-full h-full object-cover">`;
            nameSpan.textContent = occupant.nickname;
            nameSpan.className = "text-[9px] text-green-300 truncate w-16 mt-0.5 font-bold";
        } else {
            seatBox.className = "w-12 h-12 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center relative cursor-pointer";
            seatBox.innerHTML = i === 0 ? `<i class="fa-solid fa-crown text-amber-400 text-[10px]"></i>` : `<i class="fa-solid fa-user text-slate-500 text-xs"></i>`;
            nameSpan.textContent = `مايك ${i+1}`;
            nameSpan.className = "text-[9px] text-slate-500 truncate w-16 mt-0.5";
        }

        seatBox.onclick = () => {
            selectedSeatIndex = i;
            if (occupant) {
                selectedTargetUser = { ...occupant, seatIdx: i };
                document.getElementById('modal-profile-avatar').src = occupant.avatar;
                document.getElementById('modal-profile-name').textContent = occupant.nickname;
                document.getElementById('modal-profile-id').textContent = `ID: ${occupant.userId}`;

                const isHost = currentRoomDocData.hostUid === currentUser.uid;
                if (isHost && occupant.uid !== currentUser.uid) {
                    document.getElementById('admin-actions-container').classList.remove('hidden');
                } else {
                    document.getElementById('admin-actions-container').classList.add('hidden');
                }
                document.getElementById('room-user-profile-modal').classList.remove('hidden');
                setTimeout(() => document.getElementById('profile-sheet-content').classList.add('show'), 10);
            } else {
                const optLockSeat = document.getElementById('opt-lock-seat');
                optLockSeat.textContent = isLocked ? "فتح المقعد 🔓" : "قفل المقعد 🔒";
                if (currentRoomDocData.hostUid !== currentUser.uid) optLockSeat.classList.add('hidden');
                else optLockSeat.classList.remove('hidden');

                document.getElementById('seat-options-modal').classList.remove('hidden');
                setTimeout(() => document.getElementById('seat-sheet-content').classList.add('show'), 10);
            }
        };
    }
}

function renderLiveChat() {
    const chatContainer = document.getElementById('chat-messages-container');
    if (!chatContainer) return;
    const messages = currentRoomDocData.messages || [];
    chatContainer.innerHTML = "";
    if (messages.length === 0) {
        chatContainer.innerHTML = `<p class="text-slate-500 text-[10px] text-center">لا توجد رسائل بعد..</p>`;
        return;
    }
    messages.forEach(m => {
        const msgDiv = document.createElement('div');
        msgDiv.className = "bg-slate-950/60 p-2 rounded-xl border border-purple-500/10";
        msgDiv.innerHTML = `<span class="text-purple-400 font-bold">${m.senderName}:</span> <span class="text-slate-200">${m.text}</span> <span class="text-[9px] text-slate-500 float-left">${m.time}</span>`;
        chatContainer.appendChild(msgDiv);
    });
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function leaveRoom() {
    if (roomUnsubscribe) roomUnsubscribe();
    if (currentRoomId && currentUser) {
        try {
            const roomRef = doc(db, "rooms", currentRoomId);
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
                let data = roomSnap.data();
                let activeUsers = (data.activeUsers || []).filter(id => id !== currentUser.uid);
                let seats = (data.seats || Array(8).fill(null)).map(s => (s && s.uid === currentUser.uid) ? null : s);
                await updateDoc(roomRef, { activeUsers: activeUsers, seats: seats });
            }
        } catch (e) { console.error(e); }
    }

    if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
    if (agoraClient) { await agoraClient.leave(); agoraClient = null; }
    
    currentRoomId = null;
    currentRoomDocData = null;
    
    document.getElementById('room-view-screen').classList.add('hidden');
    document.getElementById('main-app-container').classList.remove('hidden');
}
