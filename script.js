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

// إعدادات Agora الصوتية (معرف تجريبي جاهز للاختبار الحي)
const AGORA_APP_ID = "9449195b0b3e400494432244036cb569"; 
let agoraClient = null;
let localAudioTrack = null;

const welcomeScreen = document.getElementById('welcome-screen');
const authScreen = document.getElementById('auth-screen');
const roomsScreen = document.getElementById('rooms-screen');
const roomViewScreen = document.getElementById('room-view-screen');

const startBtn = document.getElementById('start-btn');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
const userDisplayEmail = document.getElementById('user-display-email');
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

const openRoomSettingsBtn = document.getElementById('open-room-settings-btn');
const roomSettingsModal = document.getElementById('room-settings-modal');
const closeSettingsModal = document.getElementById('close-settings-modal');
const saveSettingsBtn = document.getElementById('save-settings-btn');
const settingsRoomName = document.getElementById('settings-room-name');
const roomImgFile = document.getElementById('room-img-file');
const roomImgIcon = document.getElementById('room-img-icon');

const userProfileModal = document.getElementById('user-profile-modal');
const closeProfileModal = document.getElementById('close-profile-modal');
const modalUsername = document.getElementById('modal-username');

let isLoginMode = false;
let currentUser = null;
let currentRoomId = null;
let roomSeats = Array(8).fill(null);

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
        authSubmitBtn.textContent = isLoginMode ? "دخول" : "تسجيل الحساب";
        toggleAuthModeBtn.textContent = isLoginMode ? "ليس لديك حساب؟ سجل حساب جديد" : "لديك حساب بالفعل؟ سجل دخولك من هنا";
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
                alert("✅ تم تسجيل الدخول بنجاح!");
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("🚀 تم إنشاء الحساب بنجاح!");
            }
        } catch (error) {
            alert("❌ خطأ: " + error.message);
        }
    });
}

if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => createRoomModal.classList.remove('hidden'));
}

if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => {
        createRoomModal.classList.add('hidden');
        roomNameInput.value = '';
    });
}

if (confirmCreateRoom) {
    confirmCreateRoom.addEventListener('click', async () => {
        const roomName = roomNameInput.value.trim();
        if (!roomName) return alert("⚠️ برجاء كتابة اسم الغرفة أولاً!");

        try {
            await addDoc(collection(db, "rooms"), {
                name: roomName,
                host: currentUser ? currentUser.email : "مستخدم مجهول",
                createdAt: serverTimestamp()
            });
            roomNameInput.value = '';
            createRoomModal.classList.add('hidden');
            alert("🎉 تم إنشاء الغرفة بنجاح ونشرها في القاعة!");
        } catch (error) {
            alert("❌ خطأ: " + error.message);
        }
    });
}

// الشات النصي
if (chatForm) {
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = chatInput.value.trim();
        if (!text || !currentUser) return;

        const senderName = currentUser.email.split('@')[0];
        const msgDiv = document.createElement('div');
        msgDiv.className = "text-[11px] leading-relaxed";
        msgDiv.innerHTML = `<span class="text-purple-300 font-bold">${escapeHtml(senderName)}:</span> <span class="text-white">${escapeHtml(text)}</span>`;
        chatMessagesList.appendChild(msgDiv);
        chatMessagesList.scrollTop = chatMessagesList.scrollHeight;
        chatInput.value = '';
    });
}

// الإعدادات
if (openRoomSettingsBtn) {
    openRoomSettingsBtn.addEventListener('click', () => {
        if (settingsRoomName && currentRoomTitle) {
            settingsRoomName.value = currentRoomTitle.textContent;
        }
        roomSettingsModal.classList.remove('hidden');
    });
}

if (closeSettingsModal) {
    closeSettingsModal.addEventListener('click', () => roomSettingsModal.classList.add('hidden'));
}

if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
        const newName = settingsRoomName.value.trim();
        if (newName && currentRoomTitle) {
            currentRoomTitle.textContent = newName;
        }
        alert("✅ تم حفظ إعدادات الغرفة بنجاح!");
        roomSettingsModal.classList.add('hidden');
    });
}

if (roomImgFile) {
    roomImgFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                roomImgIcon.outerHTML = `<img src="${event.target.result}" class="w-full h-full object-cover rounded-2xl" id="room-img-icon">`;
            }
            reader.readAsDataURL(file);
        }
    });
}

function loadRooms() {
    if (!roomsList) return;
    onSnapshot(collection(db, "rooms"), (snapshot) => {
        roomsList.innerHTML = "";
        if (snapshot.empty) {
            roomsList.innerHTML = `<p class="text-center text-slate-500 text-xs py-4">لا توجد غرف متاحة حالياً. أنشئ غرفة الآن! ✨</p>`;
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
                    <p class="text-[10px] text-slate-400 mt-0.5">المضيف: ${escapeHtml(roomData.host)}</p>
                </div>
                <button class="join-room-btn bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white px-3 py-1.5 rounded-xl text-xs transition border border-purple-500/40 cursor-pointer">
                    دخول الغرفة
                </button>
            `;
            roomCard.querySelector('.join-room-btn').addEventListener('click', () => enterRoom(roomId, roomData.name));
            roomsList.appendChild(roomCard);
        });
    });
}

// الدخول للغرفة وتفعيل الاتصال الصوتي الحي
async function enterRoom(roomId, roomName) {
    currentRoomId = roomId;
    roomsScreen.classList.add('hidden');
    roomViewScreen.classList.remove('hidden');
    currentRoomTitle.textContent = roomName;
    resetSeatsUI();
    if (chatMessagesList) {
        chatMessagesList.innerHTML = `<div class="text-slate-400 text-[10px]">مرحباً بك في الغرفة! استمتع بالصوت الحي ✨</div>`;
    }

    // تهيئة والانضمام لغرفة الصوت عبر Agora
    try {
        agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
        await agoraClient.join(AGORA_APP_ID, roomId, null, null);
        console.log("🎙️ تم الاتصال بالقناة الصوتية للغرفة بنجاح!");

        // الاستماع للمستخدمين الآخرين عند التحدث
        agoraClient.on("user-published", async (user, mediaType) => {
            await agoraClient.subscribe(user, mediaType);
            if (mediaType === "audio") {
                user.audioTrack.play();
                console.🔊("تم تشغيل صوت مستخدم آخر في الغرفة");
            }
        });
    } catch (error) {
        console.error("خطأ في الاتصال الصوتي:", error);
    }
}

// مغادرة الغرفة وقطع الصوت
async function leaveRoom() {
    if (localAudioTrack) {
        localAudioTrack.close();
        localAudioTrack = null;
    }
    if (agoraClient) {
        await agoraClient.leave();
        agoraClient = null;
    }
    currentRoomId = null;
    roomViewScreen.classList.add('hidden');
    roomsScreen.classList.remove('hidden');
}

if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener('click', leaveRoom);
}

// الجلوس على المايك وتشغيل صوت الميكروفون الحقيقي للمستخدم
if (requestSeatBtn) {
    requestSeatBtn.addEventListener('click', async () => {
        if (!currentUser || !currentRoomId) return alert("⚠️ سجل الدخول وادخل غرفة أولاً!");
        let emptyIndex = roomSeats.findIndex((seat, idx) => idx > 0 && seat === null);
        if (emptyIndex === -1 && roomSeats[0] === null) emptyIndex = 0;
        if (emptyIndex === -1) return alert("❌ عذراً، جميع الكراسي محجوزة!");

        const shortName = currentUser.email.split('@')[0];
        roomSeats[emptyIndex] = shortName;
        updateSeatUI(emptyIndex, shortName, true);

        // فتح الميكروفون وبث الصوت حياً للموجودين
        try {
            if (!localAudioTrack && agoraClient) {
                localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
                await agoraClient.publish([localAudioTrack]);
                alert(`🪑 جلست على المقعد ${emptyIndex + 1} وتم فتح المايك الصوتي الحي!`);
            }
        } catch (e) {
            alert("⚠️ يرجى السماح للمتصفح بالوصول إلى الميكروفون.");
        }
    });
}

function updateSeatUI(index, userName, isOccupied) {
    const seatDiv = document.getElementById(`seat-${index}`);
    const nameSpan = document.getElementById(`seat-name-${index}`);
    if (!seatDiv || !nameSpan) return;

    const newSeatDiv = seatDiv.cloneNode(true);
    seatDiv.parentNode.replaceChild(newSeatDiv, seatDiv);
    const updatedSeatDiv = document.getElementById(`seat-${index}`);

    if (isOccupied) {
        updatedSeatDiv.className = "w-12 h-12 rounded-full glass border-2 border-green-500 flex items-center justify-center relative cursor-pointer shadow-lg shadow-green-500/20 hover:scale-105 transition";
        updatedSeatDiv.innerHTML = `<i class="fa-solid fa-user text-green-300 text-base seat-icon"></i>`;
        if (index === 0) updatedSeatDiv.innerHTML += `<i class="fa-solid fa-crown text-amber-400 text-[10px] absolute -top-1 -right-1"></i>`;
        nameSpan.textContent = userName;
        nameSpan.className = "text-[9px] text-green-300 mt-1 truncate w-14 font-bold";

        updatedSeatDiv.addEventListener('click', () => {
            modalUsername.textContent = userName;
            userProfileModal.classList.remove('hidden');
        });
    } else {
        updatedSeatDiv.className = "w-12 h-12 rounded-full glass border border-purple-500/30 flex items-center justify-center relative cursor-pointer hover:scale-105 transition";
        updatedSeatDiv.innerHTML = `<i class="fa-solid fa-microphone-slash text-slate-500 text-xs seat-icon"></i>`;
        if (index === 0) updatedSeatDiv.innerHTML += `<i class="fa-solid fa-crown text-amber-400 text-[10px] absolute -top-1 -right-1"></i>`;
        nameSpan.textContent = index === 0 ? "المضيف" : "فاضي";
        nameSpan.className = "text-[9px] text-slate-500 mt-1 truncate w-14";
    }
}

if (closeProfileModal) {
    closeProfileModal.addEventListener('click', () => userProfileModal.classList.add('hidden'));
}

function resetSeatsUI() {
    roomSeats = Array(8).fill(null);
    for (let i = 0; i < 8; i++) updateSeatUI(i, null, false);
}

// زر كتم / فتح الميكروفون الشخصي
let isMicMuted = false;
if (toggleMicBtn) {
    toggleMicBtn.addEventListener('click', async () => {
        isMicMuted = !isMicMuted;
        if (localAudioTrack) {
            await localAudioTrack.setMuted(isMicMuted);
        }
        toggleMicBtn.innerHTML = isMicMuted ? `<i class="fa-solid fa-microphone-slash"></i> المايك مكتوم` : `<i class="fa-solid fa-microphone"></i> المايك مفتوح`;
        toggleMicBtn.className = isMicMuted ? "bg-red-600/30 text-red-200 px-3 py-1.5 rounded-xl text-xs transition border border-red-500/40 cursor-pointer flex items-center gap-1" : "bg-green-600/30 text-green-200 px-3 py-1.5 rounded-xl text-xs transition border border-green-500/40 cursor-pointer flex items-center gap-1";
    });
}

function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        welcomeScreen.classList.add('hidden');
        authScreen.classList.add('hidden');
        roomViewScreen.classList.add('hidden');
        roomsScreen.classList.remove('hidden');
        userDisplayEmail.textContent = `حسابك: ${user.email}`;
        loadRooms();
    } else {
        welcomeScreen.classList.remove('hidden');
        authScreen.classList.add('hidden');
        roomsScreen.classList.add('hidden');
        roomViewScreen.classList.add('hidden');
    }
});
