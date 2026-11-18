import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider,
    signInWithPopup,
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
    query, 
    where, 
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
const roomsGrid = document.getElementById('rooms-grid'); 

const roomOptionsBtn = document.getElementById('room-options-btn');
const roomOptionsDropdown = document.getElementById('room-options-dropdown');
const optMinimize = document.getElementById('opt-minimize');
const optLeave = document.getElementById('opt-leave');

const floatingMiniPlayer = document.getElementById('floating-mini-player');
const miniPlayerTrigger = document.getElementById('mini-player-trigger');
const miniPlayerImg = document.getElementById('mini-player-img');
const miniPlayerTitle = document.getElementById('mini-player-title');
const miniPlayerClose = document.getElementById('mini-player-close');

const onlineCountNum = document.getElementById('online-count-num');
const floatingMicToggleBtn = document.getElementById('floating-mic-toggle-btn');
const floatingMicIcon = document.getElementById('floating-mic-icon');

// نافذة خيارات المقعد والمايك
const seatOptionsModal = document.getElementById('seat-options-modal');
const seatSheetContent = document.getElementById('seat-sheet-content');
const closeSeatModal = document.getElementById('close-seat-modal');
const optSitSeat = document.getElementById('opt-sit-seat');
const optToggleMicSeat = document.getElementById('opt-toggle-mic-seat');
const optLockSeat = document.getElementById('opt-lock-seat');

// بروفايل المستخدم وصلاحيات المالك
const roomUserProfileModal = document.getElementById('room-user-profile-modal');
const profileSheetContent = document.getElementById('profile-sheet-content');
const closeUserProfile = document.getElementById('close-user-profile');
const modalProfileAvatar = document.getElementById('modal-profile-avatar');
const modalProfileName = document.getElementById('modal-profile-name');
const modalProfileId = document.getElementById('modal-profile-id');
const modalProfileBadge = document.getElementById('modal-profile-badge');
const modalUserRoleTag = document.getElementById('modal-user-role-tag');

const adminActionsContainer = document.getElementById('admin-actions-container');
const actionKickMic = document.getElementById('action-kick-mic');
const actionBan24h = document.getElementById('action-ban-24h');
const actionBanYear = document.getElementById('action-ban-year');

const headerUserId = document.getElementById('header-user-id');
const profileDisplayName = document.getElementById('profile-display-name');
const profileDisplayId = document.getElementById('profile-display-id');
const profileImgPreview = document.getElementById('profile-img-preview');
const userBadgeTag = document.getElementById('user-badge-tag');

const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const closeEditProfile = document.getElementById('close-edit-profile');
const saveProfileBtn = document.getElementById('save-profile-btn');
const inputNickname = document.getElementById('input-nickname');
const inputAvatarFile = document.getElementById('input-avatar-file'); 
const avatarPickerTrigger = document.getElementById('avatar-picker-trigger');
const modalAvatarPreview = document.getElementById('modal-avatar-preview');

const changeRoomImgTrigger = document.getElementById('change-room-img-trigger');
const roomNewImageFile = document.getElementById('room-new-image-file');

let isLoginMode = false;
let currentUser = null;
let currentRoomId = null;
let currentRoomDocData = null;
let roomSeats = Array(8).fill(null);
let seatLockedStatus = Array(8).fill(false);
let userData = null;
let selectedSeatIndex = null;
let selectedTargetUser = null;
let tempSelectedAvatar = null;
let myCurrentSeatIndex = null;

function getUserBadgeMonthly() {
    const badges = ["🌟 نجم الشهر", "💎 ملك التفاعل", "👑 أسطورة السهرة", "🔥 ملك الألعاب"];
    const now = new Date().getTime();
    return badges[Math.floor(now / (30 * 24 * 60 * 60 * 1000)) % badges.length];
}

function compressImage(file) {
    return new Promise((resolve) => {
        if (!file) { resolve(null); return; }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width, height = img.height;
                const MAX = 250;
                if (width > height && width > MAX) { height *= MAX / width; width = MAX; }
                else if (height > MAX) { width *= MAX / height; height = MAX; }
                canvas.width = width; canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.6));
            };
            img.onerror = () => resolve(null);
        };
        reader.onerror = () => resolve(null);
    });
}

// التنقل بين التبويبات (غرفة / خاصتي)
if (navRoomsBtn && navProfileBtn) {
    navRoomsBtn.addEventListener('click', () => {
        tabRooms.classList.remove('hidden');
        tabProfile.classList.add('hidden');
        navRoomsBtn.className = "flex flex-col items-center text-purple-400 cursor-pointer";
        navProfileBtn.className = "flex flex-col items-center text-slate-400 hover:text-purple-300 cursor-pointer";
    });

    navProfileBtn.addEventListener('click', () => {
        tabRooms.classList.add('hidden');
        tabProfile.classList.remove('hidden');
        navProfileBtn.className = "flex flex-col items-center text-purple-400 cursor-pointer";
        navRoomsBtn.className = "flex flex-col items-center text-slate-400 hover:text-purple-300 cursor-pointer";
    });
}

// شاشة الترحيب وتسجيل الدخول
if (startBtn) {
    startBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        authScreen.classList.remove('hidden');
    });
}

if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.textContent = "تسجيل الدخول";
            authSubmitBtn.textContent = "دخول";
            toggleAuthModeBtn.textContent = "ليس لديك حساب؟ انشئ حساب جديد";
        } else {
            authTitle.textContent = "إنشاء حساب جديد";
            authSubmitBtn.textContent = "تسجيل";
            toggleAuthModeBtn.textContent = "لديك حساب بالفعل؟ سجل دخولك";
        }
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
        } catch (err) {
            alert("❌ خطأ: " + err.message);
        }
    });
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
        } catch (err) {
            alert("❌ خطأ في تسجيل جوجل: " + err.message);
        }
    });
}

// إنشاء الغرف
if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => createRoomModal.classList.remove('hidden'));
}
if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => createRoomModal.classList.add('hidden'));
}

if (confirmCreateRoom) {
    confirmCreateRoom.addEventListener('click', async () => {
        const roomName = roomNameInput.value.trim();
        if (!roomName) return alert("⚠️ يرجى كتابة اسم الغرفة!");
        let roomImgUrl = "https://via.placeholder.com/150";
        if (roomImageFile.files[0]) {
            roomImgUrl = await compressImage(roomImageFile.files[0]);
        }
        try {
            const roomRef = await addDoc(collection(db, "rooms"), {
                name: roomName,
                image: roomImgUrl,
                host: userData ? userData.nickname : "مالك الغرفة",
                hostUid: currentUser.uid,
                bannedUsers: [],
                createdAt: serverTimestamp()
            });
            createRoomModal.classList.add('hidden');
            roomNameInput.value = "";
            enterRoom(roomRef.id, { name: roomName, image: roomImgUrl, host: userData.nickname, hostUid: currentUser.uid, bannedUsers: [] });
        } catch (err) {
            alert("❌ خطأ في إنشاء الغرفة: " + err.message);
        }
    });
}

// تحميل الغرف المتاحة
function loadRooms() {
    if (!roomsGrid) return;
    onSnapshot(collection(db, "rooms"), (snapshot) => {
        roomsGrid.innerHTML = "";
        if (snapshot.empty) {
            roomsGrid.innerHTML = `<p class="col-span-2 text-center text-slate-500 text-xs py-8">لا توجد غرف متاحة حالياً، أنشئ غرفتك الآن!</p>`;
            return;
        }
        snapshot.forEach((docSnap) => {
            const room = docSnap.data();
            const roomId = docSnap.id;
            const roomCard = document.createElement('div');
            roomCard.className = "bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:border-purple-400 transition shadow-lg";
            roomCard.innerHTML = `
                <img src="${room.image || 'https://via.placeholder.com/150'}" class="w-16 h-16 rounded-xl object-cover mb-2 border border-purple-500/40">
                <h4 class="text-xs font-bold text-purple-200 truncate w-full text-center">${room.name}</h4>
                <p class="text-[10px] text-amber-400 mt-1 truncate">👑 ${room.host || 'مالك الغرفة'}</p>
            `;
            roomCard.addEventListener('click', () => enterRoom(roomId, room));
            roomsGrid.appendChild(roomCard);
        });
    });
}

// القائمة المنسدلة داخل الغرفة
if (roomOptionsBtn && roomOptionsDropdown) {
    roomOptionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        roomOptionsDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => roomOptionsDropdown.classList.add('hidden'));
}

if (optMinimize) {
    optMinimize.addEventListener('click', () => {
        roomViewScreen.classList.add('hidden');
        floatingMiniPlayer.classList.remove('hidden');
        if (miniPlayerImg && currentRoomDocData) miniPlayerImg.src = currentRoomDocData.image || 'https://via.placeholder.com/150';
        if (miniPlayerTitle && currentRoomDocData) miniPlayerTitle.textContent = currentRoomDocData.name || 'الغرفة';
        roomOptionsDropdown.classList.add('hidden');
    });
}

if (miniPlayerTrigger) {
    miniPlayerTrigger.addEventListener('click', () => {
        floatingMiniPlayer.classList.add('hidden');
        roomViewScreen.classList.remove('hidden');
    });
}

if (floatingMicToggleBtn) {
    floatingMicToggleBtn.addEventListener('click', async () => {
        if (!localAudioTrack) return alert("⚠️ يجب أن تجلس على مقعد أولاً لتفعيل المايك!");
        isMicMuted = !isMicMuted;
        await localAudioTrack.setMuted(isMicMuted);
        if (isMicMuted) {
            floatingMicToggleBtn.className = "w-12 h-12 rounded-full bg-red-600 text-white flex items-center justify-center shadow-2xl border-2 border-red-400 cursor-pointer hover:scale-105 transition";
            floatingMicIcon.className = "fa-solid fa-microphone-slash text-base";
        } else {
            floatingMicToggleBtn.className = "w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl border-2 border-purple-400 cursor-pointer hover:scale-105 transition";
            floatingMicIcon.className = "fa-solid fa-microphone text-base";
        }
    });
}

// رسم المقاعد (الكراسي)
function renderSeats() {
    for (let i = 0; i < 8; i++) {
        const seatBox = document.getElementById(`seat-${i}`);
        const nameSpan = document.getElementById(`seat-name-${i}`);
        if (!seatBox || !nameSpan) continue;

        const newSeatBox = seatBox.cloneNode(true);
        seatBox.parentNode.replaceChild(newSeatBox, seatBox);

        const occupant = roomSeats[i];
        const isLocked = seatLockedStatus[i];

        if (isLocked) {
            newSeatBox.className = "w-14 h-14 rounded-full bg-slate-950 border-2 border-red-500/80 flex items-center justify-center relative cursor-pointer shadow-md";
            newSeatBox.innerHTML = `<i class="fa-solid fa-lock text-red-400 text-sm"></i>`;
            nameSpan.textContent = "مقفل 🔒";
            nameSpan.className = "text-[10px] text-red-400 truncate w-16 font-bold";
        } else if (occupant) {
            newSeatBox.className = "w-14 h-14 rounded-full bg-slate-900 border-2 border-green-500 flex items-center justify-center relative overflow-hidden shadow-md cursor-pointer";
            newSeatBox.innerHTML = `<img src="${occupant.avatar}" class="w-full h-full object-cover">`;
            nameSpan.textContent = occupant.nickname;
            nameSpan.className = "text-[10px] text-green-300 truncate w-16 font-bold";
        } else {
            newSeatBox.className = "w-14 h-14 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center relative cursor-pointer hover:border-purple-400 transition";
            newSeatBox.innerHTML = `<i class="fa-solid fa-microphone-slash text-slate-500 text-sm"></i>`;
            nameSpan.textContent = "فاضي";
            nameSpan.className = "text-[10px] text-slate-500 truncate w-16";
        }

        newSeatBox.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedSeatIndex = i;

            if (occupant) {
                openUserProfileModal(occupant, i);
            } else {
                if (isLocked) {
                    optLockSeat.textContent = "فتح المقعد 🔓";
                } else {
                    optLockSeat.textContent = "قفل المقعد 🔒";
                }
                seatOptionsModal.classList.remove('hidden');
                setTimeout(() => seatSheetContent.classList.add('show'), 10);
            }
        });
    }
}

if (closeSeatModal) {
    closeSeatModal.addEventListener('click', () => {
        seatSheetContent.classList.remove('show');
        setTimeout(() => seatOptionsModal.classList.add('hidden'), 300);
    });
}

if (optSitSeat) {
    optSitSeat.addEventListener('click', async () => {
        if (selectedSeatIndex === null || !currentUser) return;

        seatSheetContent.classList.remove('show');
        setTimeout(() => seatOptionsModal.classList.add('hidden'), 300);

        if (seatLockedStatus[selectedSeatIndex]) {
            return alert("❌ عذراً، هذا المقعد مقفل من مدير الغرفة!");
        }

        if (myCurrentSeatIndex !== null) {
            roomSeats[myCurrentSeatIndex] = null;
        }

        myCurrentSeatIndex = selectedSeatIndex;
        roomSeats[selectedSeatIndex] = {
            uid: currentUser.uid,
            nickname: userData ? userData.nickname : "مستخدم",
            avatar: userData ? userData.avatar : "https://via.placeholder.com/150",
            userId: userData ? userData.userId : "110789"
        };
        
        renderSeats();

        try {
            if (!localAudioTrack && agoraClient) {
                localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                await agoraClient.publish([localAudioTrack]);
                isMicMuted = false;
                floatingMicToggleBtn.className = "w-12 h-12 rounded-full bg-purple-600 text-white flex items-center justify-center shadow-2xl border-2 border-purple-400 cursor-pointer hover:scale-105 transition";
                floatingMicIcon.className = "fa-solid fa-microphone text-base";
                alert(`🎤 جلست على المقعد وتم فتح الميكروفون بنجاح!`);
            }
        } catch (err) {
            alert("⚠️ يرجى السماح للمتصفح بالوصول للمايك.");
        }
    });
}

// قفل وفتح المقعد
if (optLockSeat) {
    optLockSeat.addEventListener('click', () => {
        if (selectedSeatIndex === null) return;
        if (!currentRoomDocData || currentRoomDocData.hostUid !== currentUser.uid) {
            return alert("⚠️ ميزة قفل المقاعد مخصصة لمدير/مالك الغرفة فقط!");
        }

        seatLockedStatus[selectedSeatIndex] = !seatLockedStatus[selectedSeatIndex];
        renderSeats();
        seatSheetContent.classList.remove('show');
        setTimeout(() => seatOptionsModal.classList.add('hidden'), 300);
        alert(seatLockedStatus[selectedSeatIndex] ? "🔒 تم قفل المقعد بنجاح!" : "🔓 تم فتح المقعد.");
    });
}

if (optToggleMicSeat) {
    optToggleMicSeat.addEventListener('click', async () => {
        if (localAudioTrack) {
            isMicMuted = !isMicMuted;
            await localAudioTrack.setMuted(isMicMuted);
            alert(isMicMuted ? "🔇 تم تعطيل الميكروفون." : "🎤 تم تفعيل الميكروفون.");
        } else {
            alert("⚠️ أنت لست على مقعد لتشغيل/تعطيل المايك.");
        }
        seatSheetContent.classList.remove('show');
        setTimeout(() => seatOptionsModal.classList.add('hidden'), 300);
    });
}

// عرض بروفايل المستخدم أو بروفايلك الخاص (كمدير الغرفة)
function openUserProfileModal(userObj, seatIdx) {
    selectedTargetUser = { ...userObj, seatIdx };
    modalProfileAvatar.src = userObj.avatar;
    modalProfileName.textContent = userObj.nickname;
    modalProfileId.textContent = `ID: ${userObj.userId}`;
    modalProfileBadge.textContent = getUserBadgeMonthly();

    const isHost = currentRoomDocData && currentRoomDocData.hostUid === currentUser.uid;
    const isSelf = userObj.uid === currentUser.uid;

    if (isHost) {
        modalUserRoleTag.textContent = "👑 مدير الغرفة (المالك)";
    } else {
        modalUserRoleTag.textContent = "عضو";
    }

    if (isHost && !isSelf) {
        adminActionsContainer.classList.remove('hidden');
    } else {
        adminActionsContainer.classList.add('hidden');
    }

    roomUserProfileModal.classList.remove('hidden');
    setTimeout(() => profileSheetContent.classList.add('show'), 10);
}

if (closeUserProfile) {
    closeUserProfile.addEventListener('click', () => {
        profileSheetContent.classList.remove('show');
        setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
    });
}

// مهام الإدارة (الطرد 24 ساعة، طرد سنة، إنزال من المايك)
if (actionKickMic) {
    actionKickMic.addEventListener('click', () => {
        if (!selectedTargetUser) return;
        const idx = selectedTargetUser.seatIdx;
        roomSeats[idx] = null;
        if (selectedTargetUser.uid === currentUser.uid) {
            if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
            myCurrentSeatIndex = null;
        }
        renderSeats();
        profileSheetContent.classList.remove('show');
        setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
        alert(`🔽 تم إنزال المستخدم ${selectedTargetUser.nickname} من المقعد.`);
    });
}

if (actionBan24h) {
    actionBan24h.addEventListener('click', async () => {
        if (!selectedTargetUser || !currentRoomId) return;
        if (confirm(`هل تريد طرد ${selectedTargetUser.nickname} لمدة 24 ساعة؟`)) {
            try {
                const roomRef = doc(db, "rooms", currentRoomId);
                const currentBanned = currentRoomDocData.bannedUsers || [];
                const banExpiry = Date.now() + (24 * 60 * 60 * 1000);
                currentBanned.push({ uid: selectedTargetUser.uid, expiry: banExpiry });
                await updateDoc(roomRef, { bannedUsers: currentBanned });
                alert(`⏳ تم طرد المستخدم بنجاح.`);
                profileSheetContent.classList.remove('show');
                setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
            } catch (e) { alert("❌ خطأ: " + e.message); }
        }
    });
}

if (actionBanYear) {
    actionBanYear.addEventListener('click', async () => {
        if (!selectedTargetUser || !currentRoomId) return;
        if (confirm(`⚠️ هل تريد حظر وطرد ${selectedTargetUser.nickname} لمدة سنة كاملة نهائياً من الغرفة؟`)) {
            try {
                const roomRef = doc(db, "rooms", currentRoomId);
                const currentBanned = currentRoomDocData.bannedUsers || [];
                const banExpiry = Date.now() + (365 * 24 * 60 * 60 * 1000);
                currentBanned.push({ uid: selectedTargetUser.uid, expiry: banExpiry });
                await updateDoc(roomRef, { bannedUsers: currentBanned });
                alert(`🚫 تم حظر المستخدم لمدة سنة.`);
                profileSheetContent.classList.remove('show');
                setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
            } catch (e) { alert("❌ خطأ: " + e.message); }
        }
    });
}

// تغيير صورة الغرفة
if (changeRoomImgTrigger && roomNewImageFile) {
    changeRoomImgTrigger.addEventListener('click', () => {
        if (currentRoomDocData && currentUser && currentRoomDocData.hostUid === currentUser.uid) {
            roomNewImageFile.click();
        } else {
            alert("⚠️ ميزة تغيير صورة الغرفة مخصصة لمالك الغرفة فقط!");
        }
    });

    roomNewImageFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file && currentRoomId) {
            const compressed = await compressImage(file);
            if (compressed) {
                try {
                    await updateDoc(doc(db, "rooms", currentRoomId), { image: compressed });
                    document.getElementById('room-header-avatar').src = compressed;
                    currentRoomDocData.image = compressed;
                    alert("✅ تم تحديث صورة الغرفة بنجاح!");
                } catch (err) { alert("❌ فشل تحديث الصورة: " + err.message); }
            }
        }
    });
}

async function enterRoom(roomId, roomData) {
    currentRoomId = roomId;
    currentRoomDocData = roomData;
    roomSeats = Array(8).fill(null);
    seatLockedStatus = Array(8).fill(false);
    myCurrentSeatIndex = null;

    if (roomData.bannedUsers && currentUser) {
        const banRecord = roomData.bannedUsers.find(b => b.uid === currentUser.uid);
        if (banRecord && banRecord.expiry > Date.now()) {
            return alert("🚫 عذراً، أنت محظور من هذه الغرفة.");
        }
    }

    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (authScreen) authScreen.classList.add('hidden');
    if (mainAppContainer) mainAppContainer.classList.add('hidden');
    if (floatingMiniPlayer) floatingMiniPlayer.classList.add('hidden');
    if (bottomNav) bottomNav.classList.add('hidden');
    if (roomViewScreen) roomViewScreen.classList.remove('hidden');

    const titleEl = document.getElementById('current-room-title');
    const headerAvatarEl = document.getElementById('room-header-avatar');
    const ownerTagEl = document.getElementById('room-owner-tag');

    if (titleEl) titleEl.textContent = roomData.name;
    if (headerAvatarEl) headerAvatarEl.src = roomData.image || 'https://via.placeholder.com/150';
    if (ownerTagEl) ownerTagEl.textContent = `👑 المالك: ${roomData.host || 'غير معروف'}`;

    if (onlineCountNum) onlineCountNum.textContent = "1";
    renderSeats();

    try {
        if (!agoraClient) {
            agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            await agoraClient.join(AGORA_APP_ID, roomId, null, null);
            agoraClient.on("user-published", async (user, mediaType) => {
                await agoraClient.subscribe(user, mediaType);
                if (mediaType === "audio") user.audioTrack.play();
            });
            agoraClient.on("user-joined", () => {
                let current = parseInt(onlineCountNum.textContent) || 1;
                onlineCountNum.textContent = current + 1;
            });
            agoraClient.on("user-left", () => {
                let current = parseInt(onlineCountNum.textContent) || 1;
                if (current > 1) onlineCountNum.textContent = current - 1;
            });
        }
    } catch (e) { console.error("Agora Error:", e); }
}

async function leaveRoom() {
    if (myCurrentSeatIndex !== null) {
        roomSeats[myCurrentSeatIndex] = null;
        myCurrentSeatIndex = null;
    }
    if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
    if (agoraClient) { await agoraClient.leave(); agoraClient = null; }
    currentRoomId = null;
    currentRoomDocData = null;
    if (roomViewScreen) roomViewScreen.classList.add('hidden');
    if (floatingMiniPlayer) floatingMiniPlayer.classList.add('hidden');
    if (mainAppContainer) mainAppContainer.classList.remove('hidden');
    if (bottomNav) bottomNav.classList.remove('hidden');
}

if (optLeave) optLeave.addEventListener('click', leaveRoom);
if (miniPlayerClose) miniPlayerClose.addEventListener('click', leaveRoom);

// مراقبة حالة المصادقة
onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (authScreen) authScreen.classList.add('hidden');
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
        if (mainAppContainer) mainAppContainer.classList.remove('hidden');
        if (bottomNav) bottomNav.classList.remove('hidden');

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                userData = userDocSnap.data();
                if (headerUserId) headerUserId.textContent = `ID: ${userData.userId}`;
                if (profileDisplayId) profileDisplayId.textContent = `ID: ${userData.userId}`;
                if (profileDisplayName) profileDisplayName.textContent = userData.nickname || "مستخدم";
                if (profileImgPreview) profileImgPreview.src = userData.avatar || "https://via.placeholder.com/150";
                if (userBadgeTag) userBadgeTag.textContent = getUserBadgeMonthly();
            } else {
                const randomId = Math.floor(100000 + Math.random() * 900000);
                const newUserData = {
                    uid: user.uid, email: user.email, userId: randomId,
                    nickname: user.displayName || user.email.split('@')[0],
                    avatar: user.photoURL || "https://via.placeholder.com/150",
                    charmLevel: 1, wealthLevel: 1, createdAt: serverTimestamp()
                };
                await setDoc(userDocRef, newUserData);
                userData = newUserData;
            }
        } catch (e) { console.log(e); }

        loadRooms();
    } else {
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        if (authScreen) authScreen.classList.add('hidden');
        if (mainAppContainer) mainAppContainer.classList.add('hidden');
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
        if (floatingMiniPlayer) floatingMiniPlayer.classList.add('hidden');
        if (bottomNav) bottomNav.classList.add('hidden');
    }
});

// فتح بروفايلك الخاص كمدير للغرفة عند الضغط على صورتك في تبويب الملف الشخصي
if (profileImgPreview) {
    profileImgPreview.addEventListener('click', () => {
        if (userData && currentUser) {
            openUserProfileModal({ ...userData, uid: currentUser.uid }, null);
        }
    });
}
