// استيراد مكتبات Firebase الأساسية من الـ CDN الحديثة
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

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
const startBtn = document.getElementById('start-btn');
const authForm = document.getElementById('auth-form');
const authTitle = document.getElementById('auth-title');
const authSubmitBtn = document.getElementById('auth-submit-btn');
const toggleAuthModeBtn = document.getElementById('toggle-auth-mode');
const userDisplayEmail = document.getElementById('user-display-email');
const createRoomBtn = document.getElementById('create-room-btn');

let isLoginMode = false; // افتراضياً نبدأ بـ "إنشاء حساب جديد"

// الانتقال من شاشة الترحيب إلى شاشة التسجيل عند الضغط على زر الدخول
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

// تنفيذ عملية التسجيل أو الدخول عبر Firebase Auth عند إرسال النموذج
if (authForm) {
    authForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        try {
            if (isLoginMode) {
                // تسجيل الدخول لحساب موجود
                await signInWithEmailAndPassword(auth, email, password);
                alert("✅ تم تسجيل الدخول بنجاح!");
            } else {
                // إنشاء حساب جديد
                await createUserWithEmailAndPassword(auth, email, password);
                alert("🚀 تم إنشاء الحساب بنجاح!");
            }
        } catch (error) {
            alert("❌ خطأ: " + error.message);
        }
    });
}

// زر إنشاء غرفة جديدة (مبدئياً)
if (createRoomBtn) {
    createRoomBtn.addEventListener('click', () => {
        alert("✨ قريباً جداً: ميزة إنشاء الغرفة الصوتية الخاصة بك والتحكم في المايكات!");
    });
}

// مراقبة حالة المستخدم والتنقل بين الشاشات تلقائياً
onAuthStateChanged(auth, (user) => {
    if (user) {
        console.log("👤 المستخدم مسجل حالياً:", user.email);
        welcomeScreen.classList.add('hidden');
        authScreen.classList.add('hidden');
        roomsScreen.classList.remove('hidden');
        if (userDisplayEmail) {
            userDisplayEmail.textContent = `حسابك: ${user.email}`;
        }
    } else {
        console.log("👤 لا يوجد مستخدم مسجل حالياً.");
    }
});
