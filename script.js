// استيراد مكتبات Firebase الأساسية من الـ CDN الحديثة
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

// مفاتيح مشروعك الحقيقية من فايربيس
const firebaseConfig = {
  apiKey: "AIzaSyDyx4MBxvRM0L5FrrjVOfVePlKRSxGpMg4",
  authDomain: "real-voice-aec71.firebaseapp.com",
  projectId: "real-voice-aec71",
  storageBucket: "real-voice-aec71.firebasestorage.app",
  messagingSenderId: "1051527775983",
  appId: "1:1051527775983:web:ae3794c162184fd56b7d1a"
};

// تشغيل Firebase وتصدير الخدمات للتطبيق
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

console.log("✅ تم ربط تطبيق REAL VOICE بقاعدة البيانات بنجاح!");

// عناصر واجهة المستخدم (UI Elements)
const welcomeScreen = document.getElementById('welcome-screen');
const authScreen = document.getElementById('auth-screen');
const roomsScreen = document.getElementById('rooms-screen');
const roomViewScreen = document.getElementById('room-view-screen'); // شاشة الغرفة الداخلية

const startBtn = document.getElementById('start-btn');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
const userDisplayEmail = document.getElementById('user-display-email');
const createRoomBtn = document.getElementById('create-room-btn');

// عناصر نافذة إنشاء الغرفة
const createRoomModal = document.getElementById('create-room-modal');
const cancelRoomBtn = document.getElementById('cancel-room-btn');
const confirmCreateRoom = document.getElementById('confirm-create-room');
const roomNameInput = document.getElementById('room-name-input');
const roomsList = document.getElementById('rooms-list');

// عناصر داخل الغرفة
const leaveRoomBtn = document.getElementById('leave-room-btn');
const currentRoomTitle = document.getElementById('current-room-title');
const toggleMicBtn = document.getElementById('toggle-mic-btn');

let isLoginMode = false;
let currentUser = null;

// الانتقال من شاشة الترحيب إلى شاشة التسجيل
if (startBtn) {
    startBtn.addEventListener('click', () => {
        welcomeScreen.classList.add('hidden');
        authScreen.classList.remove('hidden');
    });
}

// التبديل بين وضع "إنشاء حساب" ووضع "تسجيل الدخول"
if (toggleAuthModeBtn) {
    toggleAuthModeBtn.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (isLoginMode) {
            authTitle.textContent = "تسجيل الدخول";
            authSubmitBtn.textContent = "دخول";
            toggleAuthModeBtn.textContent = "ليس لديك حساب؟ سجل حساب جديد";
        } else {
            authTitle.textContent = "إنشاء حساب جديد";
            authSubmitBtn.textContent = "تسجيل الحساب";
            toggleAuthModeBtn.textContent = "لديك حساب بالفعل؟ سجل دخولك من هنا";
        }
    });
}

// تنفيذ عملية التسجيل أو الدخول عبر Firebase Auth
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

// إظهار نافذة إنشاء الغرفة
if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
        if (createRoomModal) {
            createRoomModal.classList.remove('hidden');
        }
    });
}

// إخفاء نافذة إنشاء الغرفة عند الإلغاء
if (cancelRoomBtn) {
    cancelRoomBtn.addEventListener('click', () => {
        if (createRoomModal) {
            createRoomModal.classList.add('hidden');
            roomNameInput.value = '';
        }
    });
}

// حفظ الغرفة الجديدة في قاعدة بيانات Firestore
if (confirmCreateRoom) {
    confirmCreateRoom.addEventListener('click', async () => {
        const roomName = roomNameInput.value.trim();
        if (!roomName) {
            alert("⚠️ برجاء كتابة اسم الغرفة أولاً!");
            return;
        }

        try {
            await addDoc(collection(db, "rooms"), {
                name: roomName,
                host: currentUser ? currentUser.email : "مستخدم مجهول",
                createdAt: serverTimestamp()
            });

            roomNameInput.value = '';
            if (createRoomModal) {
                createRoomModal.classList.add('hidden');
            }
            alert("🎉 تم إنشاء الغرفة بنجاح ونشرها في القاعة!");
        } catch (error) {
            alert("❌ خطأ أثناء إنشاء الغرفة: " + error.message);
        }
    });
}

// جلب وعرض الغرف من Firestore مباشرة بدون شروط معقدة لتجنب مشاكل الفهرسة
function loadRooms() {
    if (!roomsList) return;
    
    const q = collection(db, "rooms");
    
    onSnapshot(q, (snapshot) => {
        roomsList.innerHTML = ""; // تفريغ القائمة القديمة
        
        if (snapshot.empty) {
            roomsList.innerHTML = `<p class="text-center text-slate-500 text-xs py-4">لا توجد غرف متاحة حالياً. أنشئ غرفة الآن! ✨</p>`;
            return;
        }

        snapshot.forEach((docSnap) => {
            const roomData = docSnap.data();
            const roomCard = document.createElement('div');
            roomCard.className = "glass p-4 rounded-2xl flex justify-between items-center border border-purple-500/20";
            
            roomCard.innerHTML = `
                <div>
                    <h3 class="text-sm font-bold text-purple-200">${escapeHtml(roomData.name || "غرفة بدون اسم")} 🎤</h3>
                    <p class="text-[10px] text-slate-400 mt-0.5">المضيف: ${escapeHtml(roomData.host || "مجهول")}</p>
                </div>
                <button class="join-room-btn bg-purple-600/30 hover:bg-purple-600 text-purple-200 hover:text-white px-3 py-1.5 rounded-xl text-xs transition border border-purple-500/40 cursor-pointer">
                    دخول الغرفة
                </button>
            `;

            // حدث الضغط على زر "دخول الغرفة" للانتقال لشاشة الكراسي
            const joinBtn = roomCard.querySelector('.join-room-btn');
            joinBtn.addEventListener('click', () => {
                enterRoom(roomData.name || "غرفة صوتية");
            });

            roomsList.appendChild(roomCard);
        });
    });
}

// دالة الانتقال إلى غرفة الدردشة الداخلية
function enterRoom(roomName) {
    if (roomsScreen) roomsScreen.classList.add('hidden');
    if (roomViewScreen) roomViewScreen.classList.remove('hidden');
    if (currentRoomTitle) currentRoomTitle.textContent = roomName;
    console.log("🚪 تم الدخول إلى الغرفة:", roomName);
}

// زر مغادرة الغرفة والعودة لقاعة الغرف
if (leaveRoomBtn) {
    leaveRoomBtn.addEventListener('click', () => {
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
        if (roomsScreen) roomsScreen.classList.remove('hidden');
    });
}

// زر فتح/قفل المايك الشخصي داخل الغرفة
let isMicMuted = true;
if (toggleMicBtn) {
    toggleMicBtn.addEventListener('click', () => {
        isMicMuted = !isMicMuted;
        if (isMicMuted) {
            toggleMicBtn.innerHTML = `<i class="fa-solid fa-microphone-slash"></i> كتم المايك`;
            toggleMicBtn.className = "bg-red-600/30 hover:bg-red-600 text-red-200 hover:text-white px-4 py-2 rounded-xl text-xs transition border border-red-500/40 cursor-pointer flex items-center gap-1.5";
        } else {
            toggleMicBtn.innerHTML = `<i class="fa-solid fa-microphone"></i> المايك مفتوح`;
            toggleMicBtn.className = "bg-green-600/30 hover:bg-green-600 text-green-200 hover:text-white px-4 py-2 rounded-xl text-xs transition border border-green-500/40 cursor-pointer flex items-center gap-1.5";
        }
    });
}

// دالة أمان لمنع حقن النصوص
function escapeHtml(text) {
    if (!text) return '';
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

// مراقبة حالة المستخدم والتنقل بين الشاشات
onAuthStateChanged(auth, (user) => {
    currentUser = user;
    if (user) {
        console.log("👤 المستخدم مسجل حالياً:", user.email);
        if (welcomeScreen) welcomeScreen.classList.add('hidden');
        if (authScreen) authScreen.classList.add('hidden');
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
        if (roomsScreen) roomsScreen.classList.remove('hidden');
        if (userDisplayEmail) {
            userDisplayEmail.textContent = `حسابك: ${user.email}`;
        }
        loadRooms(); // استدعاء جلب الغرف
    } else {
        console.log("👤 لا يوجد مستخدم مسجل حالياً.");
        if (welcomeScreen) welcomeScreen.classList.remove('hidden');
        if (authScreen) authScreen.classList.add('hidden');
        if (roomsScreen) roomsScreen.classList.add('hidden');
        if (roomViewScreen) roomViewScreen.classList.add('hidden');
    }
});
