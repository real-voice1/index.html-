// تحميل الغرف المتاحة مع عرض عدد المتواجدين تلقائياً من قاعدة البيانات
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
            
            // حساب عدد المتواجدين تلقائياً من القائمة المخزنة، أو صفر لو مش موجودة
            const activeCount = room.activeUsers ? room.activeUsers.length : 0;

            const roomCard = document.createElement('div');
            roomCard.className = "bg-slate-900/90 border border-purple-500/30 rounded-2xl p-3 flex flex-col items-center cursor-pointer hover:border-purple-400 transition shadow-lg relative";
            roomCard.innerHTML = `
                <div class="absolute top-3 left-3 bg-purple-950/80 text-purple-200 text-[10px] px-2 py-0.5 rounded-full border border-purple-500/40 flex items-center gap-1">
                    <i class="fa-solid fa-users text-[9px]"></i> <span>${activeCount}</span>
                </div>
                <img src="${room.image || 'https://via.placeholder.com/150'}" class="w-16 h-16 rounded-xl object-cover mb-2 border border-purple-500/40">
                <h4 class="text-xs font-bold text-purple-200 truncate w-full text-center">${room.name}</h4>
                <p class="text-[10px] text-amber-400 mt-1 truncate">👑 ${room.host || 'مالك الغرفة'}</p>
            `;
            roomCard.addEventListener('click', () => enterRoom(roomId, room));
            roomsGrid.appendChild(roomCard);
        });
    });
}

// الدخول للغرفة وتحديث قائمة المتواجدين في Firestore تلقائياً
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

    // تحديث قائمة المتواجدين في قاعدة البيانات (إضافة المستخدم الحالي)
    try {
        const roomRef = doc(db, "rooms", roomId);
        const roomSnap = await getDoc(roomRef);
        if (roomSnap.exists()) {
            let activeUsers = roomSnap.data().activeUsers || [];
            if (!activeUsers.includes(currentUser.uid)) {
                activeUsers.push(currentUser.uid);
                await updateDoc(roomRef, { activeUsers: activeUsers });
            }
        }
    } catch (e) {
        console.error("Error updating active users:", e);
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

    renderSeats();

    try {
        if (!agoraClient) {
            agoraClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
            await agoraClient.join(AGORA_APP_ID, roomId, null, null);
            agoraClient.on("user-published", async (user, mediaType) => {
                await agoraClient.subscribe(user, mediaType);
                if (mediaType === "audio") user.audioTrack.play();
            });
        }
    } catch (e) { console.error("Agora Error:", e); }
}

// الخروج من الغرفة وحذف المستخدم من قائمة المتواجدين فوراً
async function leaveRoom() {
    if (currentRoomId && currentUser) {
        try {
            const roomRef = doc(db, "rooms", currentRoomId);
            const roomSnap = await getDoc(roomRef);
            if (roomSnap.exists()) {
                let activeUsers = roomSnap.data().activeUsers || [];
                activeUsers = activeUsers.filter(id => id !== currentUser.uid);
                await updateDoc(roomRef, { activeUsers: activeUsers });
            }
        } catch (e) {
            console.error("Error removing active user:", e);
        }
    }

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
