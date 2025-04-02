let currentChatId = null;

// Cargar chats del usuario
auth.onAuthStateChanged(user => {
    if (user) {
        loadUserChats(user.uid);
    }
});

function loadUserChats(userId) {
    const chatList = document.getElementById('chatList');
    chatList.innerHTML = '<div class="loading">Cargando conversaciones...</div>';
    
    // Escuchar cambios en los chats donde el usuario es participante
    db.collection('chats')
        .where('participants', 'array-contains', userId)
        .orderBy('lastMessageAt', 'desc')
        .onSnapshot(snapshot => {
            chatList.innerHTML = '';
            
            if (snapshot.empty) {
                chatList.innerHTML = '<div class="no-chats">No tienes conversaciones todavía</div>';
                return;
            }
            
            snapshot.forEach(doc => {
                const chatData = doc.data();
                const otherUserId = chatData.participants.find(id => id !== userId);
                
                // Obtener información del otro usuario
                db.collection('users').doc(otherUserId).get()
                    .then(userDoc => {
                        const userData = userDoc.data();
                        
                        const chatItem = document.createElement('div');
                        chatItem.className = 'chat-item';
                        chatItem.setAttribute('data-chatid', doc.id);
                        
                        chatItem.innerHTML = `
                            <img src="${userData.profilePic || 'assets/default-profile.jpg'}" alt="${userData.name}">
                            <div class="chat-info">
                                <h4>${userData.name}</h4>
                                <p>${chatData.lastMessage || 'No hay mensajes'}</p>
                            </div>
                            <span class="chat-time">${formatTime(chatData.lastMessageAt?.toDate())}</span>
                        `;
                        
                        chatList.appendChild(chatItem);
                        
                        // Evento para seleccionar chat
                        chatItem.addEventListener('click', () => {
                            selectChat(doc.id, otherUserId, userData.name, userData.profilePic);
                        });
                        
                        // Seleccionar el primer chat por defecto
                        if (!currentChatId && snapshot.docs.indexOf(doc) === 0) {
                            selectChat(doc.id, otherUserId, userData.name, userData.profilePic);
                        }
                    });
            });
        });
}

// Seleccionar un chat
function selectChat(chatId, otherUserId, otherUserName, otherUserPic) {
    currentChatId = chatId;
    
    // Resaltar chat seleccionado
    document.querySelectorAll('.chat-item').forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-chatid') === chatId) {
            item.classList.add('active');
        }
    });
    
    // Cargar mensajes del chat
    loadChatMessages(chatId, otherUserId, otherUserName, otherUserPic);
}

// Cargar mensajes de un chat
function loadChatMessages(chatId, otherUserId, otherUserName, otherUserPic) {
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = '<div class="loading">Cargando mensajes...</div>';
    
    // Escuchar mensajes del chat seleccionado
    db.collection('chats').doc(chatId).collection('messages')
        .orderBy('timestamp', 'asc')
        .onSnapshot(snapshot => {
            chatMessages.innerHTML = '';
            
            if (snapshot.empty) {
                chatMessages.innerHTML = `
                    <div class="empty-chat">
                        <i class="fas fa-comments"></i>
                        <p>No hay mensajes en esta conversación</p>
                    </div>
                `;
                return;
            }
            
            snapshot.forEach(doc => {
                const message = doc.data();
                addMessageToChat(message, otherUserId, otherUserName, otherUserPic);
            });
            
            // Desplazarse al último mensaje
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
}

// Añadir mensaje al chat
function addMessageToChat(message, otherUserId, otherUserName, otherUserPic) {
    const chatMessages = document.getElementById('chatMessages');
    const user = auth.currentUser;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${message.senderId === user.uid ? 'sent' : 'received'}`;
    
    if (message.senderId !== user.uid) {
        messageDiv.innerHTML = `
            <img src="${otherUserPic || 'assets/default-profile.jpg'}" alt="${otherUserName}">
            <div class="message-content">
                <p>${message.text}</p>
                <span class="message-time">${formatTime(message.timestamp.toDate())}</span>
            </div>
        `;
    } else {
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${message.text}</p>
                <span class="message-time">${formatTime(message.timestamp.toDate())}</span>
            </div>
        `;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Enviar mensaje
document.getElementById('sendMessageBtn').addEventListener('click', sendMessage);
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

function sendMessage() {
    const messageInput = document.getElementById('messageInput');
    const messageText = messageInput.value.trim();
    
    if (!messageText || !currentChatId) return;
    
    const user = auth.currentUser;
    const timestamp = new Date();
    
    // Agregar mensaje a la subcolección
    db.collection('chats').doc(currentChatId).collection('messages').add({
        text: messageText,
        senderId: user.uid,
        timestamp: timestamp
    })
    .then(() => {
        // Actualizar último mensaje en el chat
        db.collection('chats').doc(currentChatId).update({
            lastMessage: messageText,
            lastMessageAt: timestamp
        });
        
        messageInput.value = '';
    })
    .catch(error => {
        console.error("Error al enviar mensaje:", error);
    });
}

// Nuevo chat
document.getElementById('newChatBtn').addEventListener('click', () => {
    // En una implementación real, aquí podrías mostrar una lista de usuarios para iniciar un nuevo chat
    alert('Funcionalidad para nuevo chat. Deberías implementar una búsqueda de usuarios aquí.');
});

// Formatear hora
function formatTime(date) {
    if (!date) return '';
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
}

// Añadir estilos para el chat (añadir a style.css)
.chat-section {
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
    height: calc(100vh - 180px);
}

.chat-container {
    display: flex;
    height: 100%;
}

.chat-sidebar {
    width: 300px;
    border-right: 1px solid #eee;
    padding-right: 20px;
    overflow-y: auto;
}

.chat-main {
    flex: 1;
    padding-left: 20px;
    display: flex;
    flex-direction: column;
}

.chat-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #eee;
}

.chat-header h3 {
    font-size: 18px;
    color: var(--dark-color);
}

#newChatBtn {
    background: none;
    border: none;
    color: var(--primary-color);
    font-size: 18px;
    cursor: pointer;
}

.chat-list {
    overflow-y: auto;
    max-height: calc(100% - 50px);
}

.chat-item {
    display: flex;
    align-items: center;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 10px;
    cursor: pointer;
    transition: all 0.3s;
}

.chat-item:hover, .chat-item.active {
    background-color: #f5f5f5;
}

.chat-item img {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
}

.chat-info {
    flex: 1;
}

.chat-info h4 {
    font-size: 14px;
    margin-bottom: 5px;
    color: var(--dark-color);
}

.chat-info p {
    font-size: 12px;
    color: #666;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.chat-time {
    font-size: 10px;
    color: #999;
    align-self: flex-start;
}

.chat-messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background-color: #f9f9f9;
    border-radius: 8px;
    margin-bottom: 20px;
}

.empty-chat {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    color: #999;
}

.empty-chat i {
    font-size: 50px;
    margin-bottom: 20px;
    color: #ddd;
}

.message {
    display: flex;
    margin-bottom: 15px;
    max-width: 70%;
}

.message.sent {
    margin-left: auto;
    justify-content: flex-end;
}

.message.received {
    margin-right: auto;
}

.message img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    object-fit: cover;
    margin-right: 10px;
    align-self: flex-end;
}

.message-content {
    background-color: white;
    padding: 10px 15px;
    border-radius: 18px;
    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.message.sent .message-content {
    background-color: var(--primary-color);
    color: white;
}

.message-time {
    display: block;
    font-size: 10px;
    color: #999;
    margin-top: 5px;
    text-align: right;
}

.message.sent .message-time {
    color: rgba(255,255,255,0.7);
}

.chat-input {
    display: flex;
}

#messageInput {
    flex: 1;
    padding: 12px 15px;
    border: 1px solid #ddd;
    border-radius: 25px;
    outline: none;
}

#sendMessageBtn {
    background-color: var(--primary-color);
    color: white;
    border: none;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    margin-left: 10px;
    cursor: pointer;
    transition: all 0.3s;
}

#sendMessageBtn:hover {
    background-color: var(--secondary-color);
}

.loading, .no-chats {
    text-align: center;
    padding: 20px;
    color: #666;
}