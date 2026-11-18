async function enterRoom(roomId) {
    currentRoomId = roomId;
    const roomRef = doc(db, "rooms", roomId);
    const roomSnap = await getDoc(roomRef);
    if (!roomSnap.exists()) return;

    currentRoomDocData = roomSnap.data();

    // تأكيد وجود الحقول الأساسية لتجنب أي شاشة سوداء أو أخطاء
    if (!currentRoomDocData.seats) currentRoomDocData.seats = Array(8).fill(null);
    if (!currentRoomDocData.seatLocks) currentRoomDocData.seatLocks = Array(8).fill(false);
    if (!currentRoomDocData.messages) currentRoomDocData.messages = [];

    if (currentRoomDocData.bannedUsers && currentUser) {
        const ban = currentRoomDocData.bannedUsers.find(b => b.uid === currentUser.uid);
        if (ban && ban.expiry > Date.now()) return alert("🚫 أنت محظور من هذه الغرفة.");
    }

    let activeUsers = currentRoomDocData.activeUsers || [];
    if (!activeUsers.includes(currentUser.uid)) {
        activeUsers.push(currentUser.uid);
        await updateDoc(roomRef, { activeUsers: activeUsers });
    }

    document.getElementById('welcome-screen').classList.add('hidden');
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('main-app-container').classList.add('hidden');
    document.getElementById('room-view-screen').classList.remove('hidden');

    document.getElementById('current-room-title').textContent = currentRoomDocData.name || "غرفة صوتية";
    document.getElementById('room-header-avatar').src = currentRoomDocData.image || "https://via.placeholder.com/150";
    document.getElementById('room-owner-tag').textContent = `👑 المالك: ${currentRoomDocData.host || 'غير معروف'}`;

    if (roomUnsubscribe) roomUnsubscribe();
    roomUnsubscribe = onSnapshot(roomRef, (docUpdate) => {
        if (!docUpdate.exists()) return;
        currentRoomDocData = docUpdate.data();

        if (!currentRoomDocData.seats) currentRoomDocData.seats = Array(8).fill(null);
        if (!currentRoomDocData.seatLocks) currentRoomDocData.seatLocks = Array(8).fill(false);
        if (!currentRoomDocData.messages) currentRoomDocData.messages = [];

        if (currentRoomDocData.bannedUsers && currentRoomDocData.bannedUsers.some(b => b.uid === currentUser.uid && b.expiry > Date.now())) {
            alert("🚫 تم طردك من الغرفة!");
            leaveRoom();
            return;
        }

        renderLiveSeats();
        renderLiveChat();
    });

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
