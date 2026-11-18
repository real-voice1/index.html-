import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider,
    signInWithRedirect,
    getRedirectResult,
    signOut,
    deleteUser,
    EmailAuthProvider,
    reauthenticateWithCredential,
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
    deleteDoc,
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

// عناصر نافذة خيارات المايك (Bottom Sheet)
const seatOptionsModal = document.getElementById('seat-options-modal');
const seatSheetContent = document.getElementById('seat-sheet-content');
const closeSeatModal = document.getElementById('close-seat-modal');
const optSitSeat = document.getElementById('opt-sit-seat');
const optToggleMicSeat = document.getElementById('opt-toggle-mic-seat');

const headerUserId = document.getElementById('header-user-id');
const profileDisplayName = document.getElementById('profile-display-name');
const profileDisplayId = document.getElementById('profile-display-id');
const profileImgPreview = document.getElementById('profile-img-preview');
const userBadgeTag = document.getElementById('user-badge-tag');
const mainProfileImgContainer = document.getElementById('main-profile-img-container');

const mainCharmText = document.getElementById('main-charm-text');
const mainWealthText = document.getElementById('main-wealth-text');

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
let userData = null;
let selectedSeatIndex = null;
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

// معالجة Google Redirect
getRedirectResult(auth).then(async (result) => {
    if (result && result.user) {
        const user = result.user;
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            const randomId = Math.floor(100000 + Math.random() * 900000);
            await setDoc(userRef, {
                uid: user.uid, email: user.email, userId: randomId,
                nickname: user.displayName || user.email.split('@')[0],
                avatar: user.photoURL || "https://via.placeholder.com/150",
                charmLevel: 1, wealthLevel: 1, createdAt: serverTimestamp()
            });
        }
    }
}).catch((error) => console.error("Redirect Error:", error));

// قائمة الثلاث نقاط داخل الغرفة
if (roomOptionsBtn && roomOptionsDropdown) {
    roomOptionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        roomOptionsDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => roomOptionsDropdown.classList.add('hidden'));
}

// تصغير الغرفة (Mini Player)
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

// سحب وتحريك المربع المصغر
let isDragging = false;
let startX, startY, initialX, initialY;

floatingMiniPlayer.addEventListener('pointerdown', (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    initialX = floatingMiniPlayer.offsetLeft;
    initialY = floatingMiniPlayer.offsetTop;
    floatingMiniPlayer.setPointerCapture(e.pointerId);
});

floatingMiniPlayer.addEventListener('pointermove', (e) => {
    if (!isDragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    floatingMiniPlayer.style.left = `${initialX + dx}px`;
    floatingMiniPlayer.style.top = `${initialY + dy}px`;
    floatingMiniPlayer.style.right = 'auto';
});

floatingMiniPlayer.addEventListener('pointerup', (e) => {
    isDragging = false;
    floatingMiniPlayer.releasePointerCapture(e.pointerId);
});

// زرار التحكم الجانبي السريع في فتح/قفل الصوت
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

// رسم الكراسي وعرض قائمة خيارات المقعد عند الضغط عليها
function renderSeats() {
    for (let i = 0; i < 8; i++) {
        const seatBox = document.getElementById(`seat-${i}`);
        const nameSpan = document.getElementById(`seat-name-${i}`);
        if (!seatBox || !nameSpan) continue;

        const newSeatBox = seatBox.cloneNode(true);
        seatBox.parentNode.replaceChild(newSeatBox, seatBox);

        const occupant = roomSeats[i];
        if (occupant) {
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

        // عند الضغط على أي مايك، تظهر نافذة خيارات المقعد المطابقة للصورة
        newSeatBox.addEventListener('click', (e) => {
            e.stopPropagation();
            selectedSeatIndex = i;
            if (occupant && occupant.uid === currentUser.uid) {
                optSitSeat.textContent = "القيام من المقعد 🚶‍♂️";
            } else {
                optSitSeat.textContent = "الجلوس على المقعد 🪑";
            }
            seatOptionsModal.classList.remove('hidden');
            setTimeout(() => seatSheetContent.classList.add('show'), 10);
        });
    }
}

if (closeSeatModal) {
    closeSeatModal.addEventListener('click', () => {
        seatSheetContent.classList.remove('show');
        setTimeout(() => seatOptionsModal.classList.add('hidden'), 300);
    });
}

// تنفيذ خيار الجلوس من القائمة المنبثقة
if (optSitSeat) {
    optSitSeat.addEventListener('click', async () => {
        if (selectedSeatIndex === null || !currentUser) return;

        seatSheetContent.classList.remove('show');
        setTimeout(() => seatOptionsModal.classList.add('hidden'), 300);

        if (roomSeats[selectedSeatIndex] && roomSeats[selectedSeatIndex].uid === currentUser.uid) {
            // القيام من المقعد
            roomSeats[selectedSeatIndex] = null;
            if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
            myCurrentSeatIndex = null;
            renderSeats();
            alert("🚶‍♂️ قمت بالقيام من المقعد.");
            return;
        }

        if (roomSeats[selectedSeatIndex] !== null) {
            alert("❌ عذراً، هذا المقعد محجوز لشخص آخر!");
            return;
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
                alert(`🎤 جلست على المقعد وتم فتح الميكروفون وبث صوتك بنجاح!`);
            }
        } catch (err) {
            alert("⚠️ يرجى السماح للمتصفح بالوصول للمايك.");
        }
    });
}

// تعطيل الميكروفون من القائمة
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
    myCurrentSeatIndex = null;

    if (roomData.bannedUsers && currentUser) {
        const banRecord = roomData.bannedUsers.find(b => b.uid === currentUser.uid);
        if (banRecord && banRecord.expiry > Date.now()) {
            alert("🚫 عذراً، أنت محظور من هذه الغرفة.");
            return;
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

// الإعدادات والتسجيل
if (settingsAccountCenter) {
    settingsAccountCenter.addEventListener('click', () => {
        if (currentUser && userData) {
            if (accCenterEmail) accCenterEmail.textContent = currentUser.email || "تسجيل عبر Google";
            if (accCenterUid) accCenterUid.textContent = userData.userId || "110789";
            if (modalAccountCenter) modalAccountCenter.classList.remove('hidden');
        }
    });
}
if (closeAccountCenter) closeAccountCenter.addEventListener('click', () => modalAccountCenter.classList.add('hidden'));

if (settingsLanguage) settingsLanguage.addEventListener('click', () => modalLanguage.classList.remove('hidden'));
if (closeLanguage) closeLanguage.addEventListener('click', () => modalLanguage.classList.add('hidden'));

if (settingsDeleteAccount) {
    settingsDeleteAccount.addEventListener('click', () => {
        if (deleteConfirmPassword) deleteConfirmPassword.value = '';
        if (modalDeleteAccount) modalDeleteAccount.classList.remove('hidden');
    });
}
if (closeDeleteModal) closeDeleteModal.addEventListener('click', () => modalDeleteAccount.classList.add('hidden'));

if (settingsLogoutSwitch) {
    settingsLogoutSwitch.addEventListener('click', async () => {
        if (confirm("هل تريد تسجيل الخروج والانتقال لإضافة حساب Gmail آخر؟")) {
            try {
                await signOut(auth);
                if (roomViewScreen) roomViewScreen.classList.add('hidden');
                if (floatingMiniPlayer) floatingMiniPlayer.classList.add('hidden');
                if (mainAppContainer) mainAppContainer.classList.add('hidden');
                if (bottomNav) bottomNav.classList.add('hidden');
                if (welcomeScreen) welcomeScreen.classList.add('hidden');
                if (authScreen) authScreen.classList.remove('hidden');
            } catch (error) { console.error("Logout error:", error); }
        }
    });
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (authScreen) authScreen.classList.remove('hidden');
    });
}

if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (authTitle) authTitle.textContent = isLoginMode ? "تسجيل الدخول بالحساب" : "إنشاء حساب جديد";
        if (authSubmitBtn) authSubmitBtn.textContent = isLoginMode ? "دخول" : "تسجيل الحساب";
        if (toggleAuthModeBtn) toggleAuthModeBtn.textContent = isLoginMode ? "ليس لديك حساب؟ انشئ حساب جديد" : "لديك حساب بالفعل؟ سجل دخولك من هنا";
    });
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try { await signInWithRedirect(auth, provider); } catch (error) { alert("❌ خطأ: " + error.message); }
    });
}

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const randomId = Math.floor(100000 + Math.random() * 900000);
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid, email: email, userId: randomId,
                    nickname: email.split('@')[0], avatar: "https://via.placeholder.com/150",
                    charmLevel: 1, wealthLevel: 1, createdAt: serverTimestamp()
                });
                alert("🚀 تم إنشاء الحساب وتوليد الـ ID بنجاح!");
            }
        } catch (error) { alert("❌ خطأ: " + error.message); }
    });
}

if (navRoomsBtn && navProfileBtn) {
    navRoomsBtn.addEventListener('click', () => {
        if (tabRooms) tabRooms.classList.remove('hidden');
        if (tabProfile) tabProfile.classList.add('hidden');
        navRoomsBtn.className = "flex flex-col items-center text-purple-400 cursor-pointer";
        navProfileBtn.className = "flex flex-col items-center text-slate-400 hover:text-purple-300 cursor-pointer";
    });
    navProfileBtn.addEventListener('click', () => {
        if (tabProfile) tabProfile.classList.remove('hidden');
        if (tabRooms) tabRooms.classList.add('hidden');
        navProfileBtn.className = "flex flex-col items-center text-purple-400 cursor-pointer";
        navRoomsBtn.className = "flex flex-col items-center text-slate-400 hover:text-purple-300 cursor-pointer";
    });
}

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        if (userData) {
            if (inputNickname) inputNickname.value = userData.nickname || '';
            if (modalAvatarPreview) modalAvatarPreview.src = userData.avatar || "https://via.placeholder.com/150";
        }
        tempSelectedAvatar = null;
        if (editProfileModal) editProfileModal.classList.remove('hidden');
    });
}
if (closeEditProfile) closeEditProfile.addEventListener('click', () => editProfileModal.classList.add('hidden'));

if (avatarPickerTrigger && inputAvatarFile) {
    avatarPickerTrigger.addEventListener('click', () => inputAvatarFile.click());
    inputAvatarFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressed = await compressImage(file);
            if (compressed) {
                tempSelectedAvatar = compressed;
                if (modalAvatarPreview) modalAvatarPreview.src = compressed;
            }
        }
    });
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        const newNick = inputNickname ? inputNickname.value.trim() : "";
        if (!newNick) return alert("⚠️ برجاء كتابة الاسم المستعار!");
        try {
            let avatarBase64 = tempSelectedAvatar ? tempSelectedAvatar : ((userData && userData.avatar) ? userData.avatar : "https://via.placeholder.com/150");
            let safeUserId = (userData && userData.userId) ? userData.userId : Math.floor(100000 + Math.random() * 900000);
            const userRef = doc(db, "users", currentUser.uid);
            await setDoc(userRef, { uid: currentUser.uid, email: currentUser.email, userId: safeUserId, nickname: newNick, avatar: avatarBase64 }, { merge: true });
            if (profileDisplayName) profileDisplayName.textContent = newNick;
            if (profileImgPreview) profileImgPreview.src = avatarBase64;
            userData.nickname = newNick;
            userData.avatar = avatarBase64;
            alert("✅ تم التحديث!");
            if (editProfileModal) editProfileModal.classList.add('hidden');
        } catch (error) { alert("❌ خطأ: " + error.message); }
    });
}

async function checkUserRoomStatus(uid) {
    if (!createRoomBtn) return;
    const q = query(collection(db, "rooms"), where("hostUid", "==", uid));
    onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) createRoomBtn.classList.add('hidden');
        else createRoomBtn.classList.remove('hidden');
    });
}

if (createRoomBtn) createRoomBtn.addEventListener('click', () => { if (createRoomModal) createRoomModal.classList.remove('hidden'); });
if (cancelRoomBtn) cancelRoomBtn.addEventListener('click', () => { if (createRoomModal) createRoomModal.classList.add('hidden'); });

if (confirmCreateRoom) {
    confirmCreateRoom.addEventListener('click', async () => {
        const roomName = roomNameInput ? roomNameInput.value.trim() : "";
        if (!roomName) return alert("⚠️ برجاء كتابة اسم الغرفة!");
        if (!roomImageFile.files || roomImageFile.files.length === 0) return alert("⚠️ اختر صورة الغرفة!");
        try {
            const roomImgCompressed = await compressImage(roomImageFile.files[0]);
            const docRef = await addDoc(collection(db, "rooms"), {
                name: roomName, banner: "مرحباً بالجميع! ✨", image: roomImgCompressed,
                hostUid: currentUser.uid, host: userData ? userData.nickname : "مضيف",
                admins: [currentUser.uid], bannedUsers: [], createdAt: serverTimestamp()
            });
            if (createRoomModal) createRoomModal.classList.add('hidden');
            const newRoomSnap = await getDoc(docRef);
            enterRoom(docRef.id, { id: docRef.id, ...newRoomSnap.data() });
        } catch (error) { alert("❌ خطأ: " + error.message); }
    });
}

function loadRooms() {
    if (!roomsGrid) return;
    onSnapshot(collection(db, "rooms"), (snapshot) => {
        roomsGrid.innerHTML = "";
        if (snapshot.empty) {
            roomsGrid.innerHTML = `<p class="col-span-2 text-center text-slate-500 text-xs py-8">لا توجد غرف متاحة حالياً ✨</p>`;
            return;
        }
        snapshot.forEach((docSnap) => {
            const roomData = docSnap.data();
            const roomId = docSnap.id;
            if (roomData.bannedUsers && currentUser) {
                const banRecord = roomData.bannedUsers.find(b => b.uid === currentUser.uid);
                if (banRecord && banRecord.expiry > Date.now()) return;
            }

            const roomCard = document.createElement('div');
            roomCard.className = "bg-slate-900/80 p-3 rounded-2xl flex flex-col items-center text-center border border-purple-500/25 cursor-pointer hover:border-purple-400 transition shadow-md";
            roomCard.innerHTML = `
                <img src="${roomData.image || 'https://via.placeholder.com/150'}" class="w-full h-32 rounded-xl object-cover border border-purple-500/30 mb-2">
                <h3 class="text-xs font-bold text-purple-200 truncate w-full">${roomData.name} 🎤</h3>
                <p class="text-[10px] text-slate-400 truncate w-full mt-0.5">المضيف: ${roomData.host || 'مالك'}</p>
            `;
            roomCard.addEventListener('click', () => enterRoom(roomId, { id: roomId, ...roomData }));
            roomsGrid.appendChild(roomCard);
        });
    });
}

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
                if (mainCharmText) mainCharmText.textContent = `Lv. ${userData.charmLevel || 1}`;
                if (mainWealthText) mainWealthText.textContent = `Lv. ${userData.wealthLevel || 1}`;
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
                if (headerUserId) headerUserId.textContent = `ID: ${userData.userId}`;
                if (profileDisplayId) profileDisplayId.textContent = `ID: ${userData.userId}`;
                if (profileDisplayName) profileDisplayName.textContent = userData.nickname;
                if (profileImgPreview) profileImgPreview.src = userData.avatar;
            }
        } catch (e) { console.log(e); }

        checkUserRoomStatus(user.uid);
        loadRooms();
    } else {
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (authScreen) authScreen.classList.remove('hidden');
        if (mainAppContainer) mainAppContainer.classList.add('hidden');
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
        if (floatingMiniPlayer) floatingMiniPlayer.classList.add('hidden');
        if (bottomNav) bottomNav.classList.add('hidden');
    }
});
