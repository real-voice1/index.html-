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
const roomsList = document.getElementById('rooms-list');

const leaveRoomBtn = document.getElementById('leave-room-btn');
const currentRoomTitle = document.getElementById('current-room-title');
const toggleMicBtn = document.getElementById('toggle-mic-btn');
const requestSeatBtn = document.getElementById('request-seat-btn');

const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessagesList = document.getElementById('chat-messages-list');

const headerUserId = document.getElementById('header-user-id');
const profileDisplayName = document.getElementById('profile-display-name');
const profileDisplayId = document.getElementById('profile-display-id');
const editProfileBtn = document.getElementById('edit-profile-btn');
const editProfileModal = document.getElementById('edit-profile-modal');
const closeEditProfile = document.getElementById('close-edit-profile');
const saveProfileBtn = document.getElementById('save-profile-btn');
const inputNickname = document.getElementById('input-nickname');
const inputGender = document.getElementById('input-gender');
const inputCountry = document.getElementById('input-country');
const inputBio = document.getElementById('input-bio');

let isLoginMode = false;
let currentUser = null;
let currentRoomId = null;
let roomSeats = Array(8).fill(null);
let userData = null;

// الانتقال من شاشة الترحيب لصفحة الدخول
if (startBtn) {
    startBtn.addEventListener('click', () => {
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (authScreen) authScreen.classList.remove('hidden');
    });
}

// التبديل بين وضع تسجيل الدخول أو إنشاء حساب جديد
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

// معالجة نموذج التسجيل أو الدخول بالبريد الإلكتروني وكلمة المرور
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
                    gender: "ذكر",
                    country: "Egypt 🇪🇬",
                    bio: "أهلاً بك في ملفي الشخصي",
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

// التنقل السفلي بين التبويبات (الغرف / الملف الشخصي)
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

// تعديل الملف الشخصي
if (editProfileBtn) {
    editProfileBtn.addEventListener('click', () => {
        if (userData) {
            if (inputNickname) inputNickname.value = userData.nickname || '';
            if (inputGender) inputGender.value = userData.gender || 'ذكر';
            if (inputCountry) inputCountry.value = userData.country || 'Egypt 🇪🇬';
            if (inputBio) inputBio.value = userData.bio || '';
        }
        if (editProfileModal) editProfileModal.classList.remove('hidden');
    });
}

if (closeEditProfile) {
    closeEditProfile.addEventListener('click', () => {
        if (editProfileModal) editProfileModal.classList.add('hidden');
    });
}

if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        try {
            const userRef = doc(db, "users", currentUser.uid);
            await updateDoc(userRef, {
                nickname: inputNickname.value.trim(),
                gender: inputGender.value,
                country: inputCountry.value.trim(),
                bio: inputBio.value.trim()
            });
            if (profileDisplayName) profileDisplayName.textContent = inputNickname.value.trim();
            alert("✅ تم تحديث الملف الشخصي بنجاح!");
            if (editProfileModal) editProfileModal.classList.add('hidden');
        } catch (error) {
            alert("❌ خطأ أثناء الحفظ: " + error.message);
        }
    });
}

// إنشاء غرفة (مع التحقق من أن المستخدم لديه غرفة واحدة فقط)
if (createRoomBtn) {
    createRoomBtn.addEventListener('click', async () => {
        if (!currentUser) return;
        const q = query(collection(db, "rooms"), where("hostUid", "==", currentUser.uid));
        const querySnapshot = await new Promise((resolve) => {
            onSnapshot(q, (snap) => resolve(snap), { once: true });
        });

        if (!querySnapshot.empty) {
            return alert("⚠️ عذراً، مسموح لك بإنشاء غرفة واحدة فقط وقد قمت بإنشائها مسبقاً!");
        }
        if (createRoomModal) createRoomModal.classList.remove('hidden');
    });
}

if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => {
        if (createRoomModal) createRoomModal.classList.add('hidden');
        if (roomNameInput) roomNameInput.value = '';
    });
}

if (confirmCreateRoom) {
    confirmCreateRoom.addEventListener('click', async () => {
        if (!roomNameInput) return;
        const roomName = roomNameInput.value.trim();
        if (!roomName) return alert("⚠️ برجاء كتابة اسم الغرفة أولاً!");

        try {
            await addDoc(collection(db, "rooms"), {
                name: roomName,
                hostUid: currentUser.uid,
                host: userData ? userData.nickname : currentUser.email,
                createdAt: serverTimestamp()
            });
            roomNameInput.value = '';
            if (createRoomModal) createRoomModal.classList.add('hidden');
            alert("🎉 تم إنشاء غرفتك بنجاح!");
        } catch (error) {
            alert("❌ خطأ: " + error.message);
        }
    });
}

// جلب واستعراض الغرف
function loadRooms() {
    if (!roomsList) return;
    onSnapshot(collection(db, "rooms"), (snapshot) => {
        roomsList.innerHTML = "";
        if (snapshot.empty) {
            roomsList.innerHTML = `<p class="text-center text-slate-500 text-xs py-4">لا توجد غرف متاحة حالياً. أنشئ غرفتك الآن! ✨</p>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const roomData = docSnap.data();
            const roomId = docSnap.id;
            const roomCard = document.createElement('div');
            roomCard.className = "glass p-4 rounded-2xl flex justify-between items-center border border-purple-500/25";
            roomCard.innerHTML = `
                <div>
                    <h3 class="text-sm font-bold text-purple-200">${escapeHtml(roomData.name)} 🎤</h3>
                    <p class="text-[10px] text-slate-400 mt-0.5">المالك: ${escapeHtml(roomData.host)}</p>
                </div>
                <button class="join-room-btn bg-purple-600/30 hover:bg-purple-600 text-purple-200 text-xs px-3 py-1.5 rounded-xl transition border border-purple-500/40 cursor-pointer">
                    دخول الغرفة
                </button>
            `;
            roomCard.querySelector('.join-room-btn').addEventListener('click', () => enterRoom(roomId, roomData.name));
            roomsList.appendChild(roomCard);
        });
    });
}

// دخول الغرفة والصوت الحي
async function enterRoom(roomId, roomName) {
    currentRoomId = roomId;
    if (mainAppContainer) mainAppContainer.classList.add('hidden');
    if (bottomNav) bottomNav.classList.add('hidden');
    if (roomViewScreen) roomViewScreen.classList.remove('hidden');
    if (currentRoomTitle) currentRoomTitle.textContent = roomName;
    resetSeatsUI();

    try {
        agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await agoraClient.join(AGORA_APP_ID, roomId, null, null);
        agoraClient.on("user-published", async (user, mediaType) => {
            await agoraClient.subscribe(user, mediaType);
            if (mediaType === "audio") user.audioTrack.play();
        });
    } catch (error) {
        console.error("خطأ الصوت الحي:", error);
    }
}

async function leaveRoom() {
    if (localAudioTrack) { localAudioTrack.close(); localAudioTrack = null; }
    if (agoraClient) { await agoraClient.leave(); agoraClient = null; }
    currentRoomId = null;
    if (roomViewScreen) roomViewScreen.classList.add('hidden');
    if (mainAppContainer) mainAppContainer.classList.remove('hidden');
    if (bottomNav) bottomNav.classList.remove('hidden');
}

if (leaveRoomBtn) leaveRoomBtn.addEventListener('click', leaveRoom);

if (requestSeatBtn) {
    requestSeatBtn.addEventListener('click', async () => {
        if (!currentUser || !currentRoomId) return alert("⚠️ ادخل غرفة أولاً!");
        let emptyIndex = roomSeats.findIndex((seat, idx) => idx > 0 && seat === null);
        if (emptyIndex === -1 && roomSeats[0] === null) emptyIndex = 0;
        if (emptyIndex === -1) return alert("❌ عذراً، الكراسي محجوزة!");

        const shortName = userData ? userData.nickname : "مستخدم";
        roomSeats[emptyIndex] = shortName;
        updateSeatUI(emptyIndex, shortName, true);

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

function updateSeatUI(index, name, isOccupied) {
    const seatDiv = document.getElementById(`seat-${index}`);
    const nameSpan = document.getElementById(`seat-name-${index}`);
    if (!seatDiv || !nameSpan) return;
    if (isOccupied) {
        seatDiv.className = "w-12 h-12 rounded-full glass border-2 border-green-500 flex items-center justify-center relative";
        seatDiv.innerHTML = `<i class="fa-solid fa-user text-green-300 text-base"></i>`;
        nameSpan.textContent = name;
        nameSpan.className = "text-[9px] text-green-300 mt-1 truncate w-14 font-bold";
    }
}

function resetSeatsUI() {
    roomSeats = Array(8).fill(null);
    for (let i = 0; i < 8; i++) {
        const seatDiv = document.getElementById(`seat-${i}`);
        const nameSpan = document.getElementById(`seat-name-${i}`);
        if(seatDiv && nameSpan) {
            seatDiv.className = "w-12 h-12 rounded-full glass border border-purple-500/30 flex items-center justify-center relative";
            seatDiv.innerHTML = `<i class="fa-solid fa-microphone-slash text-slate-500 text-xs"></i>`;
            nameSpan.textContent = i === 0 ? "المضيف" : "فاضي";
            nameSpan.className = "text-[9px] text-slate-500 mt-1 truncate w-14";
        }
    }
}

let isMicMuted = false;
if (toggleMicBtn) {
    toggleMicBtn.addEventListener('click', async () => {
        isMicMuted = !isMicMuted;
        if (localAudioTrack) await localAudioTrack.setMuted(isMicMuted);
        toggleMicBtn.innerHTML = isMicMuted ? `<i class="fa-solid fa-microphone-slash"></i> مكتوم` : `<i class="fa-solid fa-microphone"></i> مفتوح`;
    });
}

if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text || !userData) return;
        const msgDiv = document.createElement('div');
        msgDiv.className = "text-[11px] leading-relaxed";
        msgDiv.innerHTML = `<span class="text-purple-300 font-bold">${escapeHtml(userData.nickname)}:</span> <span class="text-white">${escapeHtml(text)}</span>`;
        if (chatMessagesList) {
            chatMessagesList.appendChild(msgDiv);
            chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
        }
        chatInput.value = '';
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// مراقبة حالة تسجيل الدخول في Firebase
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
                if (profileDisplayName) profileDisplayName.textContent = userData.nickname;
            }
        } catch (e) {
            console.log("Error loading user profile", e);
        }
        loadRooms();
    } else {
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        if (authScreen) authScreen.classList.add('hidden');
        if (mainAppContainer) authScreen.classList.add('hidden'); // safe guard
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
        if (bottomNav) bottomNav.classList.add('hidden');
    }
});
