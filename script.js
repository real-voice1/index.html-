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

// عناصر الثلاث نقاط والغرفة
const roomOptionsBtn = document.getElementById('room-options-btn');
const roomOptionsDropdown = document.getElementById('room-options-dropdown');
const optMinimize = document.getElementById('opt-minimize');
const optLeave = document.getElementById('opt-leave');

const toggleMicBtn = document.getElementById('toggle-mic-btn');
const requestSeatBtn = document.getElementById('request-seat-btn');

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

let isLoginMode = false;
let currentUser = null;
let currentRoomId = null;
let roomSeats = Array(8).fill(null);
let userData = null;
let tempSelectedAvatar = null;

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

// معالجة نتيجة Google Redirect
getRedirectResult(auth)
    .then(async (result) => {
        if (result && result.user) {
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
        }
    }).catch((error) => {
        console.error("Google Redirect Error:", error);
    });

// تفعيل قائمة الثلاث نقاط داخل الغرفة
if (roomOptionsBtn && roomOptionsDropdown) {
    roomOptionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        roomOptionsDropdown.classList.toggle('hidden');
    });
    document.addEventListener('click', () => {
        roomOptionsDropdown.classList.add('hidden');
    });
}

// تصغير الغرفة
if (optMinimize) {
    optMinimize.addEventListener('click', () => {
        roomViewScreen.classList.add('hidden');
        mainAppContainer.classList.remove('hidden');
        bottomNav.classList.remove('hidden');
        roomOptionsDropdown.classList.add('hidden');
    });
}

// تفعيل زر كتم / فتح المايك
if (toggleMicBtn) {
    toggleMicBtn.addEventListener('click', async () => {
        if (!localAudioTrack) {
            return alert("⚠️ يجب أن تجلس على كرسي أولاً لتفعيل المايك!");
        }
        isMicMuted = !isMicMuted;
        await localAudioTrack.setMuted(isMicMuted);
        if (isMicMuted) {
            toggleMicBtn.innerHTML = `<i class="fa-solid fa-microphone-slash text-red-400"></i> فتح المايك`;
            toggleMicBtn.className = "bg-red-600/30 text-red-200 px-4 py-2.5 rounded-xl text-xs border border-red-500/40 cursor-pointer flex items-center gap-1.5";
        } else {
            toggleMicBtn.innerHTML = `<i class="fa-solid fa-microphone text-green-400"></i> كتم المايك`;
            toggleMicBtn.className = "bg-purple-600/30 text-purple-200 px-4 py-2.5 rounded-xl text-xs border border-purple-500/40 cursor-pointer flex items-center gap-1.5";
        }
    });
}

// الجلوس على كرسي وربط الصوت بـ Agora
if (requestSeatBtn) {
    requestSeatBtn.addEventListener('click', async () => {
        if (!currentUser || !currentRoomId) return alert("⚠️ ادخل غرفة أولاً!");
        let emptyIndex = roomSeats.findIndex((seat, idx) => idx > 0 && seat === null);
        if (emptyIndex === -1 && roomSeats[0] === null) emptyIndex = 0;
        if (emptyIndex === -1) return alert("❌ جميع الكراسي محجوزة!");

        roomSeats[emptyIndex] = {
            uid: currentUser.uid,
            nickname: userData ? userData.nickname : "مستخدم",
            avatar: userData ? userData.avatar : "https://via.placeholder.com/150",
            userId: userData ? userData.userId : "110789"
        };
        
        const seatDiv = document.getElementById(`seat-${emptyIndex}`);
        const nameSpan = document.getElementById(`seat-name-${emptyIndex}`);
        if (seatDiv && nameSpan) {
            seatDiv.className = "w-14 h-14 rounded-full bg-slate-900 border-2 border-green-500 flex items-center justify-center relative overflow-hidden shadow-md";
            seatDiv.innerHTML = `<img src="${roomSeats[emptyIndex].avatar}" class="w-full h-full object-cover">`;
            nameSpan.textContent = roomSeats[emptyIndex].nickname;
            nameSpan.className = "text-[10px] text-green-300 mt-1.5 truncate w-16 font-bold";
        }

        try {
            if (!localAudioTrack && agoraClient) {
                localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                await agoraClient.publish([localAudioTrack]);
                alert("🎤 تم فتح المايك وبث صوتك بنجاح في الغرفة!");
            }
        } catch (e) { alert("⚠️ سماح للمتصفح بالوصول للمايك مطلوب."); }
    });
}

// أزرار الإعدادات
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
        if (modalLanguage) modalLanguage.classList.add('hidden');
    });
    langEnBtn.addEventListener('click', () => {
        if (currentLangLabel) currentLangLabel.textContent = "English 🇺🇸";
        if (modalLanguage) modalLanguage.classList.add('hidden');
    });
}

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
            const credential = EmailAuthProvider.credential(user.email, pass);
            await reauthenticateWithCredential(user, credential);
            await deleteDoc(doc(db, "users", user.uid));
            await deleteUser(user);
            alert("🗑️ تم حذف الحساب نهائياً بنجاح.");
            if (modalDeleteAccount) modalDeleteAccount.classList.add('hidden');
        } catch (error) {
            alert("❌ فشل حذف الحساب: تأكد من صحة كلمة المرور أو أن الحساب مسجل بـ Google.");
        }
    });
}

if (settingsLogoutSwitch) {
    settingsLogoutSwitch.addEventListener('click', async () => {
        if (confirm("هل تريد تسجيل الخروج والانتقال لإضافة حساب Gmail آخر؟")) {
            try {
                await signOut(auth);
                if (roomViewScreen) roomViewScreen.classList.add('hidden');
                if (mainAppContainer) mainAppContainer.classList.add('hidden');
                if (bottomNav) bottomNav.classList.add('hidden');
                if (welcomeScreen) welcomeScreen.classList.add('hidden');
                if (authScreen) authScreen.classList.remove('hidden');
            } catch (error) {
                console.error("Logout error:", error);
            }
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
        if (toggleAuthModeBtn) {
            toggleAuthModeBtn.textContent = isLoginMode ? "ليس لديك حساب؟ انشئ حساب جديد" : "لديك حساب بالفعل؟ سجل دخولك من هنا";
        }
    });
}

if (googleLoginBtn) {
    googleLoginBtn.addEventListener('click', async () => {
        const provider = new GoogleAuthProvider();
        try {
            await signInWithRedirect(auth, provider);
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
            userData.nickname = newNick;
            userData.avatar = avatarBase64;

            alert("✅ تم تحديث الملف الشخصي بنجاح!");
            if (editProfileModal) editProfileModal.classList.add('hidden');
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
    createRoomBtn.addEventListener('click', () => {
        if (createRoomModal) createRoomModal.classList.remove('hidden');
    });
}
if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => {
        if (createRoomModal) createRoomModal.classList.add('hidden');
    });
}
if (confirmCreateRoom) {
    confirmCreateRoom.addEventListener('click', async () => {
        const roomName = roomNameInput ? roomNameInput.value.trim() : "";
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
            if (createRoomModal) createRoomModal.classList.add('hidden');
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
    if (welcomeScreen) welcomeScreen.classList.add('hidden');
    if (authScreen) authScreen.classList.add('hidden');
    if (mainAppContainer) mainAppContainer.classList.add('hidden');
    if (bottomNav) bottomNav.classList.add('hidden');
    if (roomViewScreen) roomViewScreen.classList.remove('hidden');

    const titleEl = document.getElementById('current-room-title');
    const headerAvatarEl = document.getElementById('room-header-avatar');
    const ownerTagEl = document.getElementById('room-owner-tag');

    if (titleEl) titleEl.textContent = roomData.name;
    if (headerAvatarEl) headerAvatarEl.src = roomData.image || 'https://via.placeholder.com/150';
    if (ownerTagEl) ownerTagEl.textContent = `👑 المالك: ${roomData.host || 'غير معروف'}`;

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
    if (roomViewScreen) roomViewScreen.classList.add('hidden');
    if (mainAppContainer) mainAppContainer.classList.remove('hidden');
    if (bottomNav) bottomNav.classList.remove('hidden');
}

if (optLeave) optLeave.addEventListener('click', leaveRoom);

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
        if (bottomNav) bottomNav.classList.add('hidden');
    }
});
