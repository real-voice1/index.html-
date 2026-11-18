import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
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
const optSettings = document.getElementById('opt-settings');
const optLeave = document.getElementById('opt-leave');

const minimizedRoomWidget = document.getElementById('minimized-room-widget');
const miniRoomImg = document.getElementById('mini-room-img');
const miniRoomName = document.getElementById('mini-room-name');

const currentRoomTitle = document.getElementById('current-room-title');
const roomHeaderAvatar = document.getElementById('room-header-avatar');
const roomOwnerTag = document.getElementById('room-owner-tag');
const roomBannerText = document.getElementById('room-banner-text');

const editRoomModal = document.getElementById('edit-room-modal');
const cancelEditRoom = document.getElementById('cancel-edit-room');
const confirmEditRoom = document.getElementById('confirm-edit-room');
const editRoomNameInput = document.getElementById('edit-room-name-input');
const editRoomBannerInput = document.getElementById('edit-room-banner-input');
const editRoomImageFile = document.getElementById('edit-room-image-file');
const editRoomImgPreview = document.getElementById('edit-room-img-preview');

const toggleMicBtn = document.getElementById('toggle-mic-btn');
const requestSeatBtn = document.getElementById('request-seat-btn');

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessagesList = document.getElementById('chat-messages-list');

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

// عناصر البروفايل السفلي Bottom Sheet
const roomUserProfileModal = document.getElementById('room-user-profile-modal');
const bottomSheetContent = document.getElementById('bottom-sheet-content');
const closeUserProfile = document.getElementById('close-user-profile');
const modalProfileAvatar = document.getElementById('modal-profile-avatar');
const modalProfileName = document.getElementById('modal-profile-name');
const modalProfileId = document.getElementById('modal-profile-id');
const modalProfileBadge = document.getElementById('modal-profile-badge');
const modalUserRoleTag = document.getElementById('modal-user-role-tag');

// مستويات الجاذبية والثروة
const charmLevelText = document.getElementById('charm-level-text');
const charmLevelBox = document.getElementById('charm-level-box');
const charmLevelIcon = document.getElementById('charm-level-icon');

const wealthLevelText = document.getElementById('wealth-level-text');
const wealthLevelBox = document.getElementById('wealth-level-box');
const wealthLevelIcon = document.getElementById('wealth-level-icon');

const moderatorControls = document.getElementById('moderator-controls');
const modToggleAdmin = document.getElementById('mod-toggle-admin');
const modKickSeat = document.getElementById('mod-kick-seat');
const modBanUser = document.getElementById('mod-ban-user');

let isLoginMode = false;
let currentUser = null;
let currentRoomId = null;
let currentRoomDocData = null;
let currentRoomName = "";
let currentRoomImage = "";
let roomSeats = Array(8).fill(null);
let userData = null;
let myCurrentSeatIndex = null;
let tempSelectedAvatar = null;
let tempRoomEditAvatar = null;
let selectedSeatUserForProfile = null;

function getUserBadgeMonthly() {
    const badges = ["🌟 نجم الشهر", "💎 ملك التفاعل", "👑 أسطورة السهرة", "🔥 ملك الألعاب"];
    const now = new Date().getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const badgeIndex = Math.floor(now / thirtyDaysMs) % badges.length;
    return badges[badgeIndex];
}

// دالة لتوليد شكل المستوى والأيقونة الاحترافية (من 1 إلى 100، وكل 10 مستويات تتغير الأيقونة)
function getLevelStylingAndIcon(level, type = 'charm') {
    let iconClass = "fa-solid fa-heart text-pink-400";
    let boxStyle = "background: rgba(88, 28, 135, 0.4); border-color: rgba(168, 85, 247, 0.4);";
    
    if (type === 'wealth') {
        iconClass = "fa-solid fa-gem text-amber-400";
        boxStyle = "background: rgba(6, 78, 59, 0.4); border-color: rgba(16, 185, 129, 0.4);";
    }

    if (level >= 90) {
        iconClass = type === 'charm' ? "fa-solid fa-fire text-red-500 animate-pulse" : "fa-solid fa-crown text-yellow-300 animate-bounce";
        boxStyle = "background: linear-gradient(135deg, rgba(220, 38, 38, 0.3), rgba(88, 28, 135, 0.6)); border-color: #f59e0b;";
    } else if (level >= 70) {
        iconClass = type === 'charm' ? "fa-solid fa-bolt text-amber-400" : "fa-solid fa-sack-dollar text-emerald-400";
        boxStyle = "background: rgba(180, 83, 9, 0.3); border-color: #f59e0b;";
    } else if (level >= 40) {
        iconClass = type === 'charm' ? "fa-solid fa-star text-purple-400" : "fa-solid fa-coins text-yellow-400";
        boxStyle = "background: rgba(79, 70, 229, 0.3); border-color: #818cf8;";
    }

    return { iconClass, boxStyle };
}

function compressImage(file) {
    return new Promise((resolve) => {
        if (!file) {
            resolve(null);
            return;
        }
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 250;
                const MAX_HEIGHT = 250;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                const dataUrl = canvas.toDataURL('image/jpeg', 0.6);
                resolve(dataUrl);
            };
            img.onerror = () => resolve(null);
        };
        reader.onerror = () => resolve(null);
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
        if (toggleAuthModeBtn) {
            toggleAuthModeBtn.textContent = isLoginMode ? "ليس لديك حساب؟ انشئ حساب جديد" : "لديك حساب بالفعل؟ سجل دخولك من هنا";
        }
    });
}

if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const emailField = document.getElementById('email');
        const passwordField = document.getElementById('password');
        if (!emailField || !passwordField) return;

        const email = emailField.value.trim();
        const password = passwordField.value.trim();

        try {
            if (isLoginMode) {
                await signInWithEmailAndPassword(auth, email, password);
                alert("✅ تم تسجيل الدخول بنجاح!");
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                const randomId = Math.floor(100000 + Math.random() * 900000);
                
                await setDoc(doc(db, "users", user.uid), {
                    uid: user.uid,
                    email: email,
                    userId: randomId,
                    nickname: email.split('@')[0],
                    avatar: "https://via.placeholder.com/150",
                    charmLevel: 2, // مستوى الجاذبية الافتراضي
                    wealthLevel: 10, // مستوى الثروة الافتراضي
                    createdAt: serverTimestamp()
                });
                alert("🚀 تم إنشاء الحساب وتوليد الـ ID بنجاح!");
            }
        } catch (error) {
            console.error("Auth Error:", error);
            alert("❌ خطأ في المصادقة: " + error.message);
        }
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

if (closeEditProfile) {
    closeEditProfile.addEventListener('click', () => {
        if (editProfileModal) editProfileModal.classList.add('hidden');
    });
}

if (avatarPickerTrigger && inputAvatarFile) {
    avatarPickerTrigger.addEventListener('click', () => {
        inputAvatarFile.click();
    });

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
            await setDoc(userRef, {
                uid: currentUser.uid,
                email: currentUser.email,
                userId: safeUserId,
                nickname: newNick,
                avatar: avatarBase64
            }, { merge: true });

            if (profileDisplayName) profileDisplayName.textContent = newNick;
            if (profileImgPreview) profileImgPreview.src = avatarBase64;
            
            if (!userData) userData = {};
            userData.nickname = newNick;
            userData.avatar = avatarBase64;
            userData.userId = safeUserId;

            alert("✅ تم تحديث الملف الشخصي بنجاح!");
            if (editProfileModal) editProfileModal.classList.add('hidden');
        } catch (error) {
            console.error("Profile update error:", error);
            alert("❌ خطأ أثناء الحفظ: " + error.message);
        }
    });
}

async function checkUserRoomStatus(uid) {
    if (!createRoomBtn) return;
    const q = query(collection(db, "rooms"), where("hostUid", "==", uid));
    onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
            createRoomBtn.classList.add('hidden');
        } else {
            createRoomBtn.classList.remove('hidden');
        }
    });
}

if (createRoomBtn) {
    createRoomBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        if (createRoomModal) createRoomModal.classList.remove('hidden');
    });
}

if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => {
        if (createRoomModal) createRoomModal.classList.add('hidden');
        if (roomNameInput) roomNameInput.value = '';
        if (roomImageFile) roomImageFile.value = '';
    });
}

if (confirmCreateRoom) {
    confirmCreateRoom.addEventListener('click', async () => {
        if (!roomNameInput || !roomImageFile) return;
        const roomName = roomNameInput.value.trim();

        if (!roomName) return alert("⚠️ برجاء كتابة اسم الغرفة أولاً!");
        if (!roomImageFile.files || roomImageFile.files.length === 0) {
            return alert("⚠️ برجاء اختيار صورة للغرفة من المعرض أولاً!");
        }

        try {
            const roomImgCompressed = await compressImage(roomImageFile.files[0]);

            const docRef = await addDoc(collection(db, "rooms"), {
                name: roomName,
                banner: "مرحباً بالجميع في الغرفة! استمتعوا بالدردشة الصوتية ✨",
                image: roomImgCompressed,
                hostUid: currentUser.uid,
                host: userData ? userData.nickname : "مضيف الغرفة",
                admins: [currentUser.uid],
                bannedUsers: [],
                createdAt: serverTimestamp()
            });

            roomNameInput.value = '';
            roomImageFile.value = '';
            if (createRoomModal) createRoomModal.classList.add('hidden');
            
            const newRoomSnap = await getDoc(docRef);
            enterRoom(docRef.id, { id: docRef.id, ...newRoomSnap.data() });
        } catch (error) {
            console.error("Room creation error:", error);
            alert("❌ خطأ أثناء إنشاء الغرفة: " + error.message);
        }
    });
}

if (roomOptionsBtn && roomOptionsDropdown) {
    roomOptionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        roomOptionsDropdown.classList.toggle('hidden');
    });

    document.addEventListener('click', () => {
        roomOptionsDropdown.classList.add('hidden');
    });
}

if (optMinimize) {
    optMinimize.addEventListener('click', () => {
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
        if (mainAppContainer) mainAppContainer.classList.remove('hidden');
        if (bottomNav) bottomNav.classList.remove('hidden');

        if (minimizedRoomWidget) {
            if (miniRoomImg) miniRoomImg.src = currentRoomImage;
            if (miniRoomName) miniRoomName.textContent = currentRoomName;
            minimizedRoomWidget.classList.remove('hidden');
        }
    });
}

if (optLeave) {
    optLeave.addEventListener('click', leaveRoom);
}

if (optSettings) {
    optSettings.addEventListener('click', () => {
        if (currentRoomDocData && editRoomNameInput && editRoomBannerInput) {
            editRoomNameInput.value = currentRoomDocData.name || '';
            editRoomBannerInput.value = currentRoomDocData.banner || '';
            if (editRoomImgPreview) editRoomImgPreview.src = currentRoomDocData.image || 'https://via.placeholder.com/150';
        }
        tempRoomEditAvatar = null;
        if (editRoomModal) editRoomModal.classList.remove('hidden');
    });
}

if (editRoomImageFile && editRoomImgPreview) {
    editRoomImageFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressed = await compressImage(file);
            if (compressed) {
                tempRoomEditAvatar = compressed;
                editRoomImgPreview.src = compressed;
            }
        }
    });
}

if (cancelEditRoom) {
    cancelEditRoom.addEventListener('click', () => {
        if (editRoomModal) editRoomModal.classList.add('hidden');
    });
}

if (confirmEditRoom) {
    confirmEditRoom.addEventListener('click', async () => {
        if (!currentRoomId || !currentRoomDocData) return;
        const newName = editRoomNameInput ? editRoomNameInput.value.trim() : "";
        const newBanner = editRoomBannerInput ? editRoomBannerInput.value.trim() : "";
        if (!newName) return alert("⚠️ برجاء كتابة اسم الغرفة!");

        try {
            let newImg = tempRoomEditAvatar ? tempRoomEditAvatar : currentRoomDocData.image;

            const roomRef = doc(db, "rooms", currentRoomId);
            await updateDoc(roomRef, {
                name: newName,
                banner: newBanner,
                image: newImg
            });

            currentRoomDocData.name = newName;
            currentRoomDocData.banner = newBanner;
            currentRoomDocData.image = newImg;
            if (currentRoomTitle) currentRoomTitle.textContent = newName;
            if (roomHeaderAvatar) roomHeaderAvatar.src = newImg;
            if (roomBannerText) roomBannerText.textContent = newBanner || "لا يوجد شعار حالياً";

            alert("✅ تم تحديث إعدادات الغرفة بنجاح!");
            if (editRoomModal) editRoomModal.classList.add('hidden');
        } catch (error) {
            alert("❌ خطأ أثناء التحديث: " + error.message);
        }
    });
}

function loadRooms() {
    if (!roomsGrid) return;
    onSnapshot(collection(db, "rooms"), (snapshot) => {
        roomsGrid.innerHTML = "";
        if (snapshot.empty) {
            roomsGrid.innerHTML = `<p class="col-span-2 text-center text-slate-500 text-xs py-8">لا توجد غرف متاحة حالياً. أنشئ غرفتك الآن! ✨</p>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const roomData = docSnap.data();
            const roomId = docSnap.id;

            if (roomData.bannedUsers && currentUser && roomData.bannedUsers.some(b => b.uid === currentUser.uid)) {
                return;
            }

            const roomCard = document.createElement('div');
            roomCard.className = "bg-slate-900/80 p-3 rounded-2xl flex flex-col items-center text-center border border-purple-500/25 cursor-pointer hover:border-purple-400 transition shadow-md";
            
            roomCard.innerHTML = `
                <img src="${escapeHtml(roomData.image || 'https://via.placeholder.com/150')}" class="w-full h-32 rounded-xl object-cover border border-purple-500/30 mb-2 shadow-sm">
                <h3 class="text-xs font-bold text-purple-200 truncate w-full">${escapeHtml(roomData.name)} 🎤</h3>
                <p class="text-[10px] text-slate-400 truncate w-full mt-0.5">المضيف: ${escapeHtml(roomData.host || 'مالك الغرفة')}</p>
            `;
            
            roomCard.addEventListener('click', () => enterRoom(roomId, { id: roomId, ...roomData }));
            roomsGrid.appendChild(roomCard);
        });
    });
}

async function enterRoom(roomId, roomData) {
    if (roomData.bannedUsers && currentUser) {
        const banRecord = roomData.bannedUsers.find(b => b.uid === currentUser.uid);
        if (banRecord) {
            const now = Date.now();
            const banDuration = 24 * 60 * 60 * 1000;
            if (now - banRecord.time < banDuration) {
                return alert("🚫 عذراً، أنت مطرود من هذه الغرفة ولم تنتهِ فترة العقوبة (24 ساعة)!");
            }
        }
    }

    currentRoomId = roomId;
    currentRoomDocData = roomData;
    currentRoomName = roomData.name;
    currentRoomImage = roomData.image || 'https://via.placeholder.com/150';
    myCurrentSeatIndex = null;

    if (minimizedRoomWidget) minimizedRoomWidget.classList.add('hidden');
    if (mainAppContainer) mainAppContainer.classList.add('hidden');
    if (bottomNav) bottomNav.classList.add('hidden');
    if (roomViewScreen) roomViewScreen.classList.remove('hidden');
    if (currentRoomTitle) currentRoomTitle.textContent = roomData.name;
    if (roomHeaderAvatar) roomHeaderAvatar.src = currentRoomImage;
    if (roomOwnerTag) roomOwnerTag.textContent = `👑 المالك: ${roomData.host || 'غير معروف'}`;
    if (roomBannerText) roomBannerText.textContent = roomData.banner || "مرحباً بالجميع في الغرفة!";

    if (optSettings) {
        if (currentUser && roomData.hostUid === currentUser.uid) {
            optSettings.classList.remove('hidden');
        } else {
            optSettings.classList.add('hidden');
        }
    }

    resetSeatsUI();

    try {
        if (!agoraClient) {
            agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            await agoraClient.join(AGORA_APP_ID, roomId, null, null);
            
            agoraClient.on("user-published", async (user, mediaType) => {
                await agoraClient.subscribe(user, mediaType);
                if (mediaType === "audio") {
                    user.audioTrack.play();
                    triggerSpeakingAnimationByUid(user.uid, true);
                }
            });
            agoraClient.on("user-unpublished", (user, mediaType) => {
                if (mediaType === "audio") {
                    triggerSpeakingAnimationByUid(user.uid, false);
                }
            });
        }
    } catch (error) {
        console.error("خطأ الصوت الحي:", error);
    }
}

function triggerSpeakingAnimationByUid(agoraUid, isSpeaking) {
    roomSeats.forEach((seatUser, idx) => {
        if (seatUser && seatUser.uid === agoraUid) {
            const seatDiv = document.getElementById(`seat-${idx}`);
            if (seatDiv) {
                if (isSpeaking) {
                    seatDiv.classList.add('speaking-animation');
                } else {
                    seatDiv.classList.remove('speaking-animation');
                }
            }
        }
    });
}

let isDragging = false;
let startX, startY, initialX, initialY;

if (minimizedRoomWidget) {
    minimizedRoomWidget.addEventListener('pointerdown', (e) => {
        isDragging = false;
        startX = e.clientX;
        startY = e.clientY;
        const rect = minimizedRoomWidget.getBoundingClientRect();
        initialX = rect.left;
        initialY = rect.top;
        minimizedRoomWidget.setPointerCapture(e.pointerId);
    });

    minimizedRoomWidget.addEventListener('pointermove', (e) => {
        if (!e.buttons) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDragging = true;
            minimizedRoomWidget.style.left = `${initialX + dx}px`;
            minimizedRoomWidget.style.top = `${initialY + dy}px`;
            minimizedRoomWidget.style.right = 'auto';
            minimizedRoomWidget.style.bottom = 'auto';
        }
    });

    minimizedRoomWidget.addEventListener('pointerup', () => {
        if (!isDragging) {
            if (minimizedRoomWidget) minimizedRoomWidget.classList.add('hidden');
            if (mainAppContainer) mainAppContainer.classList.add('hidden');
            if (bottomNav) bottomNav.classList.add('hidden');
            if (roomViewScreen) roomViewScreen.classList.remove('hidden');
        }
    });
}

async function leaveRoom() {
    if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
    if (agoraClient) { await agoraClient.leave(); agoraClient = null; }
    currentRoomId = null;
    currentRoomDocData = null;
    currentRoomName = "";
    currentRoomImage = "";
    myCurrentSeatIndex = null;

    if (roomOptionsDropdown) roomOptionsDropdown.classList.add('hidden');
    if (minimizedRoomWidget) minimizedRoomWidget.classList.add('hidden');
    if (roomViewScreen) roomViewScreen.classList.add('hidden');
    if (mainAppContainer) mainAppContainer.classList.remove('hidden');
    if (bottomNav) bottomNav.classList.remove('hidden');
}

if (requestSeatBtn) {
    requestSeatBtn.addEventListener('click', async () => {
        if (!currentUser || !currentRoomId) return alert("⚠️ ادخل غرفة أولاً!");
        
        if (myCurrentSeatIndex !== null) {
            return alert("⚠️ أنت جالس على مقعد بالفعل ولا يمكنك الجلوس مرة أخرى!");
        }

        let emptyIndex = roomSeats.findIndex((seat, idx) => idx > 0 && seat === null);
        if (emptyIndex === -1 && roomSeats[0] === null) emptyIndex = 0;
        if (emptyIndex === -1) return alert("❌ عذراً، جميع الكراسي محجوزة!");

        myCurrentSeatIndex = emptyIndex;
        roomSeats[emptyIndex] = {
            uid: currentUser.uid,
            nickname: userData ? userData.nickname : "مستخدم",
            avatar: userData ? userData.avatar : "https://via.placeholder.com/150",
            userId: userData ? userData.userId : "110789",
            charmLevel: userData?.charmLevel || 2,
            wealthLevel: userData?.wealthLevel || 10
        };
        updateSeatUI(emptyIndex, roomSeats[emptyIndex], true);

        try {
            if (!localAudioTrack && agoraClient) {
                localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                await agoraClient.publish([localAudioTrack]);
            }
        } catch (e) {
            alert("⚠️ يرجى السماح للمايكروفون بالعمل.");
        }
    });
}

function updateSeatUI(index, userObj, isOccupied) {
    const seatDiv = document.getElementById(`seat-${index}`);
    const nameSpan = document.getElementById(`seat-name-${index}`);
    if (!seatDiv || !nameSpan) return;

    const newSeatDiv = seatDiv.cloneNode(true);
    seatDiv.parentNode.replaceChild(newSeatDiv, seatDiv);

    if (isOccupied && userObj) {
        newSeatDiv.className = "w-14 h-14 rounded-full bg-slate-900 border-2 border-green-500 flex items-center justify-center relative overflow-hidden shadow-md cursor-pointer";
        newSeatDiv.innerHTML = `<img src="${userObj.avatar}" class="w-full h-full object-cover">`;
        nameSpan.textContent = userObj.nickname;
        nameSpan.className = "text-[10px] text-green-300 mt-1.5 truncate w-16 font-bold";

        // الضغط على صورتك أو صورة أي شخص في المايك يفتح بروفايل الأسفل Bottom Sheet
        newSeatDiv.addEventListener('click', () => {
            openUserProfileModal(userObj, index);
        });
    } else {
        newSeatDiv.className = "w-14 h-14 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center relative";
        newSeatDiv.innerHTML = `<i class="fa-solid fa-microphone-slash text-slate-500 text-sm"></i>`;
        nameSpan.textContent = index === 0 ? "المضيف" : "فاضي";
        nameSpan.className = "text-[10px] text-slate-500 mt-1.5 truncate w-16";
    }
}

// دالة فتح البروفايل السفلي (Bottom Sheet) بالشكل المطابق للصورة
function openUserProfileModal(userObj, seatIdx) {
    selectedSeatUserForProfile = { ...userObj, seatIndex: seatIdx };
    if (modalProfileAvatar) modalProfileAvatar.src = userObj.avatar;
    if (modalProfileName) modalProfileName.textContent = userObj.nickname;
    if (modalProfileId) modalProfileId.textContent = `ID: ${userObj.userId}`;
    if (modalProfileBadge) modalProfileBadge.textContent = getUserBadgeMonthly();

    // تحديد اللقب (مالك، مشرف، أو عضو)
    if (currentRoomDocData) {
        if (userObj.uid === currentRoomDocData.hostUid) {
            if (modalUserRoleTag) modalUserRoleTag.textContent = "👑 مالك الغرفة";
        } else if (currentRoomDocData.admins && currentRoomDocData.admins.includes(userObj.uid)) {
            if (modalUserRoleTag) modalUserRoleTag.textContent = "⭐ مشرف";
        } else {
            if (modalUserRoleTag) modalUserRoleTag.textContent = "عضو نشط";
        }
    }

    // تعيين مستويات الجاذبية والثروة والأيقونات المتطورة
    const cLevel = userObj.charmLevel || 2;
    const wLevel = userObj.wealthLevel || 10;

    if (charmLevelText) charmLevelText.textContent = `Lv. ${cLevel}`;
    const charmStyle = getLevelStylingAndIcon(cLevel, 'charm');
    if (charmLevelBox) charmLevelBox.style = charmStyle.boxStyle;
    if (charmLevelIcon) charmLevelIcon.className = charmStyle.iconClass;

    if (wealthLevelText) wealthLevelText.textContent = `Lv. ${wLevel}`;
    const wealthStyle = getLevelStylingAndIcon(wLevel, 'wealth');
    if (wealthLevelBox) wealthLevelBox.style = wealthStyle.boxStyle;
    if (wealthLevelIcon) wealthLevelIcon.className = wealthStyle.iconClass;

    // صلاحيات التحكم للإدارة
    if (currentUser && currentRoomDocData) {
        const isOwner = currentRoomDocData.hostUid === currentUser.uid;
        const isAdmin = currentRoomDocData.admins && currentRoomDocData.admins.includes(currentUser.uid);
        
        if ((isOwner || isAdmin) && userObj.uid !== currentRoomDocData.hostUid && userObj.uid !== currentUser.uid) {
            if (moderatorControls) moderatorControls.classList.remove('hidden');
            const isTargetAdmin = currentRoomDocData.admins && currentRoomDocData.admins.includes(userObj.uid);
            if (modToggleAdmin) {
                modToggleAdmin.textContent = isTargetAdmin ? "⭐ إزالة من المشرفين" : "👑 تعيين مشرف";
                if (!isOwner) modToggleAdmin.classList.add('hidden');
                else modToggleAdmin.classList.remove('hidden');
            }
        } else {
            if (moderatorControls) moderatorControls.classList.add('hidden');
        }
    }

    if (roomUserProfileModal) {
        roomUserProfileModal.classList.remove('hidden');
        setTimeout(() => bottomSheetContent.classList.add('show'), 10);
    }
}

if (closeUserProfile) {
    closeUserProfile.addEventListener('click', () => {
        if (bottomSheetContent) bottomSheetContent.classList.remove('show');
        setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
    });
}

if (modKickSeat) {
    modKickSeat.addEventListener('click', () => {
        if (!selectedSeatUserForProfile) return;
        const idx = selectedSeatUserForProfile.seatIndex;
        roomSeats[idx] = null;
        updateSeatUI(idx, null, false);
        alert("✅ تم إنزال المستخدم من الكرسي بنجاح!");
        if (roomUserProfileModal) roomUserProfileModal.classList.add('hidden');
    });
}

if (modBanUser) {
    modBanUser.addEventListener('click', async () => {
        if (!selectedSeatUserForProfile || !currentRoomId) return;
        if (!confirm("هل أنت متأكد من طرد هذا المستخدم من الغرفة لمدة 24 ساعة؟")) return;

        try {
            const idx = selectedSeatUserForProfile.seatIndex;
            roomSeats[idx] = null;
            updateSeatUI(idx, null, false);

            const roomRef = doc(db, "rooms", currentRoomId);
            const updatedBans = currentRoomDocData.bannedUsers ? [...currentRoomDocData.bannedUsers, { uid: selectedSeatUserForProfile.uid, time: Date.now() }] : [{ uid: selectedSeatUserForProfile.uid, time: Date.now() }];
            
            await updateDoc(roomRef, { bannedUsers: updatedBans });
            currentRoomDocData.bannedUsers = updatedBans;

            alert("🚫 تم طرد المستخدم من الغرفة لمدة 24 ساعة!");
            if (roomUserProfileModal) roomUserProfileModal.classList.add('hidden');
        } catch (e) {
            alert("❌ خطأ أثناء الطرد: " + e.message);
        }
    });
}

if (modToggleAdmin) {
    modToggleAdmin.addEventListener('click', async () => {
        if (!selectedSeatUserForProfile || !currentRoomId) return;
        try {
            const targetUid = selectedSeatUserForProfile.uid;
            let currentAdmins = currentRoomDocData.admins || [currentRoomDocData.hostUid];
            
            if (currentAdmins.includes(targetUid)) {
                currentAdmins = currentAdmins.filter(id => id !== targetUid);
            } else {
                currentAdmins.push(targetUid);
            }

            const roomRef = doc(db, "rooms", currentRoomId);
            await updateDoc(roomRef, { admins: currentAdmins });
            currentRoomDocData.admins = currentAdmins;

            alert("✅ تم تحديث صلاحيات المشرف بنجاح!");
            if (roomUserProfileModal) roomUserProfileModal.classList.add('hidden');
        } catch (e) {
            alert("❌ خطأ: " + e.message);
        }
    });
}

let isMicMuted = false;
if (toggleMicBtn) {
    toggleMicBtn.addEventListener('click', async () => {
        if (!localAudioTrack) {
            return alert("⚠️ يجب أن تكون جالساً على كرسي أولاً!");
        }
        
        isMicMuted = !isMicMuted;
        await localAudioTrack.setMuted(isMicMuted);

        if (isMicMuted) {
            toggleMicBtn.innerHTML = `<i class="fa-solid fa-microphone-slash"></i> المايك مكتوم`;
            toggleMicBtn.className = "bg-red-600 text-white px-4 py-2.5 rounded-xl text-xs cursor-pointer flex items-center gap-1.5";
        } else {
            toggleMicBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> كتم المايك`;
            toggleMicBtn.className = "bg-purple-600/30 text-purple-200 px-4 py-2.5 rounded-xl text-xs border border-purple-500/40 cursor-pointer flex items-center gap-1.5";
        }
    });
}

if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text || !userData) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = "text-xs leading-relaxed";
        msgDiv.innerHTML = `<span class="text-purple-300 font-bold">${escapeHtml(userData.nickname)}:</span> <span class="text-white">${escapeHtml(text)}</span>`;
        if (chatMessagesList) {
            chatMessagesList.appendChild(msgDiv);
            chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
        }
        chatInput.value = '';
    });
}

function resetSeatsUI() {
    roomSeats = Array(8).fill(null);
    myCurrentSeatIndex = null;
    for (let i = 0; i < 8; i++) {
        updateSeatUI(i, null, false);
    }
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
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
            }
        } catch (e) {
            console.log("Error loading user profile", e);
        }

        checkUserRoomStatus(user.uid);
        loadRooms();
    } else {
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        if (authScreen) authScreen.classList.add('hidden');
        if (mainAppContainer) mainAppContainer.classList.add('hidden');
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
        if (bottomNav) bottomNav.classList.add('hidden');
    }
});
