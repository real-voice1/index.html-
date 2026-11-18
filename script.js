import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider,
    signInWithPopup,
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
const optSettings = document.getElementById('opt-settings');
const optLeave = document.getElementById('opt-leave');

const minimizedRoomWidget = document.getElementById('minimized-room-widget');
const miniRoomImg = document.getElementById('mini-room-img');
const miniRoomName = document.getElementById('mini-room-name');

const currentRoomTitle = document.getElementById('current-room-title');
const roomHeaderAvatar = document.getElementById('room-header-avatar');
const roomOwnerTag = document.getElementById('room-owner-tag');
const roomBannerText = document.getElementById('room-banner-text');

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
const mainProfileImgContainer = document.getElementById('main-profile-img-container');

const mainCharmText = document.getElementById('main-charm-text');
const mainCharmBox = document.getElementById('main-charm-box');
const mainCharmIcon = document.getElementById('main-charm-icon');
const mainWealthText = document.getElementById('main-wealth-text');
const mainWealthBox = document.getElementById('main-wealth-box');
const mainWealthIcon = document.getElementById('main-wealth-icon');

const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const closeEditProfile = document.getElementById('close-edit-profile');
const saveProfileBtn = document.getElementById('save-profile-btn');
const inputNickname = document.getElementById('input-nickname');
const inputAvatarFile = document.getElementById('input-avatar-file'); 
const avatarPickerTrigger = document.getElementById('avatar-picker-trigger');
const modalAvatarPreview = document.getElementById('modal-avatar-preview');

// عناصر الإعدادات الجديدة
const settingsAccountCenter = document.getElementById('settings-account-center');
const modalAccountCenter = document.getElementById('modal-account-center');
const closeAccountCenter = document.getElementById('close-account-center');
const accCenterEmail = document.getElementById('acc-center-email');
const accCenterUid = document.getElementById('acc-center-uid');

const settingsLanguage = document.getElementById('settings-language');
const modalLanguage = document.getElementById('modal-language');
const closeLanguage = document.getElementById('close-language');
const langArBtn = document.getElementById('lang-ar-btn');
const langEnBtn = document.getElementById('lang-en-btn');
const currentLangLabel = document.getElementById('current-lang-label');

const settingsDeleteAccount = document.getElementById('settings-delete-account');
const modalDeleteAccount = document.getElementById('modal-delete-account');
const closeDeleteModal = document.getElementById('close-delete-modal');
const deleteConfirmPassword = document.getElementById('delete-confirm-password');
const confirmDeleteBtn = document.getElementById('confirm-delete-btn');

const settingsLogoutSwitch = document.getElementById('settings-logout-switch');

const roomUserProfileModal = document.getElementById('room-user-profile-modal');
const bottomSheetContent = document.getElementById('bottom-sheet-content');
const closeUserProfile = document.getElementById('close-user-profile');
const modalProfileAvatar = document.getElementById('modal-profile-avatar');
const modalProfileName = document.getElementById('modal-profile-name');
const modalProfileId = document.getElementById('modal-profile-id');
const modalProfileBadge = document.getElementById('modal-profile-badge');
const modalUserRoleTag = document.getElementById('modal-user-role-tag');

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

function getUserBadgeMonthly() {
    const badges = ["🌟 نجم الشهر", "💎 ملك التفاعل", "👑 أسطورة السهرة", "🔥 ملك الألعاب"];
    const now = new Date().getTime();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    return badges[Math.floor(now / thirtyDaysMs) % badges.length];
}

function getLevelStylingAndIcon(level, type = 'charm') {
    let iconClass = "fa-solid fa-heart text-pink-400";
    let boxStyle = "background: rgba(88, 28, 135, 0.4); border-color: rgba(168, 85, 247, 0.4);";
    if (type === 'wealth') {
        iconClass = "fa-solid fa-gem text-amber-400";
        boxStyle = "background: rgba(6, 78, 59, 0.4); border-color: rgba(16, 185, 129, 0.4);";
    }
    return { iconClass, boxStyle };
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

// أزرار إعدادات الحساب والتطبيق الجديدة
if (settingsAccountCenter) {
    settingsAccountCenter.addEventListener('click', () => {
        if (currentUser && userData) {
            if (accCenterEmail) accCenterEmail.textContent = currentUser.email || "تسجيل عبر Google";
            if (accCenterUid) accCenterUid.textContent = userData.userId || "110789";
            if (modalAccountCenter) modalAccountCenter.classList.remove('hidden');
        }
    });
}
if (closeAccountCenter) {
    closeAccountCenter.addEventListener('click', () => modalAccountCenter.classList.add('hidden'));
}

if (settingsLanguage) {
    settingsLanguage.addEventListener('click', () => modalLanguage.classList.remove('hidden'));
}
if (closeLanguage) {
    closeLanguage.addEventListener('click', () => modalLanguage.classList.add('hidden'));
}
if (langArBtn && langEnBtn) {
    langArBtn.addEventListener('click', () => {
        if (currentLangLabel) currentLangLabel.textContent = "العربية 🇪🇬";
        alert("✅ تم اختيار اللغة العربية بنجاح!");
        modalLanguage.classList.add('hidden');
    });
    langEnBtn.addEventListener('click', () => {
        if (currentLangLabel) currentLangLabel.textContent = "English 🇺🇸";
        alert("✅ Language switched to English!");
        modalLanguage.classList.add('hidden');
    });
}

// شروط حذف الحساب
if (settingsDeleteAccount) {
    settingsDeleteAccount.addEventListener('click', () => {
        if (deleteConfirmPassword) deleteConfirmPassword.value = '';
        if (modalDeleteAccount) modalDeleteAccount.classList.remove('hidden');
    });
}
if (closeDeleteModal) {
    closeDeleteModal.addEventListener('click', () => modalDeleteAccount.classList.add('hidden'));
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', async () => {
        const pass = deleteConfirmPassword ? deleteConfirmPassword.value.trim() : "";
        if (!pass) return alert("⚠️ برجاء إدخال كلمة المرور لتأكيد شروط الحذف!");

        try {
            const user = auth.currentUser;
            if (!user) return;

            // إعادة توثيق الحساب بالشروط الأمنية
            const credential = EmailAuthProvider.credential(user.email, pass);
            await reauthenticateWithCredential(user, credential);

            // حذف مستند المستخدم من Firestore أولاً
            await deleteDoc(doc(db, "users", user.uid));

            // حذف الحساب نهائياً من Firebase Auth
            await deleteUser(user);

            alert("🗑️ تم حذف الحساب نهائياً بنجاح وفقاً للشروط.");
            if (modalDeleteAccount) modalDeleteAccount.classList.add('hidden');
        } catch (error) {
            console.error("Delete account error:", error);
            alert("❌ فشل حذف الحساب: تأكد من صحة كلمة المرور أو إعادة تسجيل الدخول.");
        }
    });
}

// تسجيل الخروج وإضافة حساب آخر بـ Gmail جديد
if (settingsLogoutSwitch) {
    settingsLogoutSwitch.addEventListener('click', async () => {
        if (confirm("هل تريد تسجيل الخروج والانتقال لإضافة حساب Gmail آخر؟")) {
            try {
                await signOut(auth);
                alert("👋 تم تسجيل الخروج بنجاح. يمكنك الآن تسجيل الدخول بحساب Gmail جديد!");
            } catch (error) {
                console.error("Logout error:", error);
            }
        }
    });
}

if (startBtn) {
    startBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        authScreen.classList.remove('hidden');
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

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            const userRef = doc(db, "users", user.uid);
            const userSnap = await getDoc(userRef);

            if (!userSnap.exists()) {
                const randomId = Math.floor(100000 + Math.random() * 900000);
                await setDoc(userRef, {
                    uid: user.uid,
                    email: user.email,
                    userId: randomId,
                    nickname: user.displayName || user.email.split('@')[0],
                    avatar: user.photoURL || "https://via.placeholder.com/150",
                    charmLevel: 1,
                    wealthLevel: 1,
                    createdAt: serverTimestamp()
                });
            }
            alert("✅ تم تسجيل الدخول بـ Google بنجاح!");
        } catch (error) {
            console.error("Google Auth Error:", error);
            alert("❌ خطأ في المصادقة عبر Google: " + error.message);
        }
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
                    charmLevel: 1,
                    wealthLevel: 1,
                    createdAt: serverTimestamp()
                });
                alert("🚀 تم إنشاء الحساب وتوليد الـ ID بنجاح!");
            }
        } catch (error) {
            alert("❌ خطأ في المصادقة: " + error.message);
        }
    });
}

if (navRoomsBtn && navProfileBtn) {
    navRoomsBtn.addEventListener('click', () => {
        tabRooms.classList.remove('hidden');
        tabProfile.classList.add('hidden');
        navRoomsBtn.className = "flex flex-col items-center text-purple-400 cursor-pointer";
        navProfileBtn.className = "flex flex-col items-center text-slate-400 hover:text-purple-300 cursor-pointer";
    });

    navProfileBtn.addEventListener('click', () => {
        tabProfile.classList.remove('hidden');
        tabRooms.classList.add('hidden');
        navProfileBtn.className = "flex flex-col items-center text-purple-400 cursor-pointer";
        navRoomsBtn.className = "flex flex-col items-center text-slate-400 hover:text-purple-300 cursor-pointer";
    });
}

if (mainProfileImgContainer) {
    mainProfileImgContainer.addEventListener('click', () => {
        if (userData && currentUser) {
            openUserProfileModal({
                uid: currentUser.uid,
                nickname: userData.nickname || "مستخدم",
                avatar: userData.avatar || "https://via.placeholder.com/150",
                userId: userData.userId || "110789",
                charmLevel: userData.charmLevel || 1,
                wealthLevel: userData.wealthLevel || 1
            }, null);
        }
    });
}

if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        if (userData) {
            if (inputNickname) inputNickname.value = userData.nickname || '';
            if (modalAvatarPreview) modalAvatarPreview.src = userData.avatar || "https://via.placeholder.com/150";
        }
        tempSelectedAvatar = null;
        editProfileModal.classList.remove('hidden');
    });
}

if (closeEditProfile) {
    closeEditProfile.addEventListener('click', () => editProfileModal.classList.add('hidden'));
}

if (avatarPickerTrigger && inputAvatarFile) {
    avatarPickerTrigger.addEventListener('click', () => inputAvatarFile.click());
    inputAvatarFile.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (file) {
            const compressed = await compressImage(file);
            if (compressed) {
                tempSelectedAvatar = compressed;
                modalAvatarPreview.src = compressed;
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
            userData.nickname = newNick;
            userData.avatar = avatarBase64;

            alert("✅ تم تحديث الملف الشخصي بنجاح!");
            editProfileModal.classList.add('hidden');
        } catch (error) {
            alert("❌ خطأ أثناء الحفظ: " + error.message);
        }
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

if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => createRoomModal.classList.remove('hidden'));
}
if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => createRoomModal.classList.add('hidden'));
}
if (confirmCreateRoom) {
    confirmCreateRoom.addEventListener('click', async () => {
        const roomName = roomNameInput.value.trim();
        if (!roomName) return alert("⚠️ برجاء كتابة اسم الغرفة!");
        if (!roomImageFile.files || roomImageFile.files.length === 0) return alert("⚠️ اختر صورة الغرفة!");

        try {
            const roomImgCompressed = await compressImage(roomImageFile.files[0]);
            const docRef = await addDoc(collection(db, "rooms"), {
                name: roomName,
                banner: "مرحباً بالجميع في الغرفة! ✨",
                image: roomImgCompressed,
                hostUid: currentUser.uid,
                host: userData ? userData.nickname : "مضيف",
                admins: [currentUser.uid],
                bannedUsers: [],
                createdAt: serverTimestamp()
            });
            createRoomModal.classList.add('hidden');
            const newRoomSnap = await getDoc(docRef);
            enterRoom(docRef.id, { id: docRef.id, ...newRoomSnap.data() });
        } catch (error) {
            alert("❌ خطأ: " + error.message);
        }
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
            if (roomData.bannedUsers && currentUser && roomData.bannedUsers.some(b => b.uid === currentUser.uid)) return;

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

async function enterRoom(roomId, roomData) {
    currentRoomId = roomId;
    currentRoomDocData = roomData;
    currentRoomName = roomData.name;
    currentRoomImage = roomData.image || 'https://via.placeholder.com/150';
    myCurrentSeatIndex = null;

    welcomeScreen.classList.add('hidden');
    authScreen.classList.add('hidden');
    mainAppContainer.classList.add('hidden');
    bottomNav.classList.add('hidden');
    roomViewScreen.classList.remove('hidden');

    currentRoomTitle.textContent = roomData.name;
    roomHeaderAvatar.src = currentRoomImage;
    roomOwnerTag.textContent = `👑 المالك: ${roomData.host || 'غير معروف'}`;
    roomBannerText.textContent = roomData.banner || "مرحباً بالجميع!";

    if (optSettings) {
        if (currentUser && roomData.hostUid === currentUser.uid) optSettings.classList.remove('hidden');
        else optSettings.classList.add('hidden');
    }
    resetSeatsUI();

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

async function leaveRoom() {
    if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
    if (agoraClient) { await agoraClient.leave(); agoraClient = null; }
    currentRoomId = null;
    roomViewScreen.classList.add('hidden');
    mainAppContainer.classList.remove('hidden');
    bottomNav.classList.remove('hidden');
}

if (optLeave) optLeave.addEventListener('click', leaveRoom);

if (requestSeatBtn) {
    requestSeatBtn.addEventListener('click', async () => {
        if (!currentUser || !currentRoomId) return alert("⚠️ ادخل غرفة أولاً!");
        let emptyIndex = roomSeats.findIndex((seat, idx) => idx > 0 && seat === null);
        if (emptyIndex === -1 && roomSeats[0] === null) emptyIndex = 0;
        if (emptyIndex === -1) return alert("❌ جميع الكراسي محجوزة!");

        myCurrentSeatIndex = emptyIndex;
        roomSeats[emptyIndex] = {
            uid: currentUser.uid,
            nickname: userData ? userData.nickname : "مستخدم",
            avatar: userData ? userData.avatar : "https://via.placeholder.com/150",
            userId: userData ? userData.userId : "110789",
            charmLevel: userData?.charmLevel || 1,
            wealthLevel: userData?.wealthLevel || 1
        };
        updateSeatUI(emptyIndex, roomSeats[emptyIndex], true);

        try {
            if (!localAudioTrack && agoraClient) {
                localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                await agoraClient.publish([localAudioTrack]);
            }
        } catch (e) { alert("⚠️ سماح للمايك مطلوب."); }
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
        newSeatDiv.addEventListener('click', () => openUserProfileModal(userObj, index));
    } else {
        newSeatDiv.className = "w-14 h-14 rounded-full bg-slate-900 border border-purple-500/30 flex items-center justify-center relative";
        newSeatDiv.innerHTML = `<i class="fa-solid fa-microphone-slash text-slate-500 text-sm"></i>`;
        nameSpan.textContent = index === 0 ? "المضيف" : "فاضي";
        nameSpan.className = "text-[10px] text-slate-500 mt-1.5 truncate w-16";
    }
}

function openUserProfileModal(userObj, seatIdx) {
    modalProfileAvatar.src = userObj.avatar;
    modalProfileName.textContent = userObj.nickname;
    modalProfileId.textContent = `ID: ${userObj.userId}`;
    modalProfileBadge.textContent = getUserBadgeMonthly();
    roomUserProfileModal.classList.remove('hidden');
    setTimeout(() => bottomSheetContent.classList.add('show'), 10);
}

if (closeUserProfile) {
    closeUserProfile.addEventListener('click', () => {
        bottomSheetContent.classList.remove('show');
        setTimeout(() => roomUserProfileModal.classList.add('hidden'), 300);
    });
}

function resetSeatsUI() {
    roomSeats = Array(8).fill(null);
    myCurrentSeatIndex = null;
    for (let i = 0; i < 8; i++) updateSeatUI(i, null, false);
}

onAuthStateChanged(auth, async (user) => {
    currentUser = user;
    if (user) {
        welcomeScreen.classList.add('hidden');
        authScreen.classList.add('hidden');
        roomViewScreen.classList.add('hidden');
        mainAppContainer.classList.remove('hidden');
        bottomNav.classList.remove('hidden');

        try {
            const userDocRef = doc(db, "users", user.uid);
            const userDocSnap = await getDoc(userDocRef);
            if (userDocSnap.exists()) {
                userData = userDocSnap.data();
                headerUserId.textContent = `ID: ${userData.userId}`;
                profileDisplayId.textContent = `ID: ${userData.userId}`;
                profileDisplayName.textContent = userData.nickname || "مستخدم";
                profileImgPreview.src = userData.avatar || "https://via.placeholder.com/150";
                userBadgeTag.textContent = getUserBadgeMonthly();

                mainCharmText.textContent = `Lv. ${userData.charmLevel || 1}`;
                mainWealthText.textContent = `Lv. ${userData.wealthLevel || 1}`;
            } else {
                const randomId = Math.floor(100000 + Math.random() * 900000);
                const newUserData = {
                    uid: user.uid,
                    email: user.email,
                    userId: randomId,
                    nickname: user.displayName || user.email.split('@')[0],
                    avatar: user.photoURL || "https://via.placeholder.com/150",
                    charmLevel: 1,
                    wealthLevel: 1,
                    createdAt: serverTimestamp()
                };
                await setDoc(userDocRef, newUserData);
                userData = newUserData;
                headerUserId.textContent = `ID: ${userData.userId}`;
                profileDisplayId.textContent = `ID: ${userData.userId}`;
                profileDisplayName.textContent = userData.nickname;
                profileImgPreview.src = userData.avatar;
            }
        } catch (e) { console.log(e); }

        checkUserRoomStatus(user.uid);
        loadRooms();
    } else {
        welcomeScreen.classList.remove('hidden');
        authScreen.classList.add('hidden');
        mainAppContainer.classList.add('hidden');
        roomViewScreen.classList.add('hidden');
        bottomNav.classList.add('hidden');
    }
});
