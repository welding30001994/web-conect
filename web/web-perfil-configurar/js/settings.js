// Cambiar entre pestañas
document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remover clase active de todos los botones y contenidos
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        // Agregar clase active al botón clickeado
        button.classList.add('active');
        
        // Mostrar el contenido correspondiente
        const tabId = button.getAttribute('data-tab');
        document.getElementById(`${tabId}-settings`).classList.add('active');
    });
});

// Cargar configuración del usuario
auth.onAuthStateChanged(user => {
    if (user) {
        // Cargar configuración del chat
        db.collection('user_settings').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const settings = doc.data();
                    
                    // Configuración del chat
                    if (settings.chat) {
                        document.getElementById('notifications').checked = settings.chat.notifications !== false;
                        document.getElementById('sound').checked = settings.chat.sound !== false;
                        document.getElementById('theme').value = settings.chat.theme || 'light';
                    }
                    
                    // Configuración de privacidad
                    if (settings.privacy) {
                        document.getElementById('profileVisibility').value = settings.privacy.profileVisibility || 'public';
                        document.getElementById('photoVisibility').value = settings.privacy.photoVisibility || 'public';
                        document.getElementById('searchable').checked = settings.privacy.searchable !== false;
                    }
                    
                    // Configuración de cuenta
                    document.getElementById('email').value = user.email;
                }
            })
            .catch(error => {
                console.error("Error al cargar configuración:", error);
            });
    }
});

// Guardar configuración del chat
document.getElementById('chatSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    const chatSettings = {
        notifications: document.getElementById('notifications').checked,
        sound: document.getElementById('sound').checked,
        theme: document.getElementById('theme').value
    };
    
    db.collection('user_settings').doc(user.uid).set({
        chat: chatSettings
    }, { merge: true })
    .then(() => {
        alert('Configuración del chat guardada con éxito!');
    })
    .catch(error => {
        console.error("Error al guardar configuración:", error);
        alert('Error al guardar configuración: ' + error.message);
    });
});

// Guardar configuración de privacidad
document.getElementById('privacySettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    
    const privacySettings = {
        profileVisibility: document.getElementById('profileVisibility').value,
        photoVisibility: document.getElementById('photoVisibility').value,
        searchable: document.getElementById('searchable').checked
    };
    
    db.collection('user_settings').doc(user.uid).set({
        privacy: privacySettings
    }, { merge: true })
    .then(() => {
        alert('Configuración de privacidad guardada con éxito!');
    })
    .catch(error => {
        console.error("Error al guardar configuración:", error);
        alert('Error al guardar configuración: ' + error.message);
    });
});

// Cambiar contraseña
document.getElementById('accountSettingsForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (newPassword && newPassword !== confirmPassword) {
        alert('Las contraseñas no coinciden!');
        return;
    }
    
    const user = auth.currentUser;
    
    if (newPassword) {
        user.updatePassword(newPassword)
            .then(() => {
                alert('Contraseña actualizada con éxito!');
                document.getElementById('newPassword').value = '';
                document.getElementById('confirmPassword').value = '';
            })
            .catch(error => {
                console.error("Error al actualizar contraseña:", error);
                alert('Error al actualizar contraseña: ' + error.message);
            });
    }
});

// Eliminar cuenta
document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (!confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción no se puede deshacer.')) return;
    
    const user = auth.currentUser;
    
    user.delete()
        .then(() => {
            // Eliminar datos del usuario de Firestore
            return db.collection('users').doc(user.uid).delete();
        })
        .then(() => {
            alert('Cuenta eliminada con éxito. Serás redirigido a la página de inicio.');
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error("Error al eliminar cuenta:", error);
            alert('Error al eliminar cuenta: ' + error.message);
        });
});

// Añadir estilos para configuración (añadir a style.css)
.settings-section {
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.settings-tabs {
    display: flex;
    border-bottom: 1px solid #eee;
    margin-bottom: 20px;
}

.tab-btn {
    padding: 10px 20px;
    background: none;
    border: none;
    border-bottom: 3px solid transparent;
    cursor: pointer;
    font-weight: 500;
    color: #666;
    transition: all 0.3s;
}

.tab-btn.active {
    color: var(--primary-color);
    border-bottom-color: var(--primary-color);
}

.tab-content {
    display: none;
}

.tab-content.active {
    display: block;
}

.settings-content h2 {
    margin-bottom: 20px;
    color: var(--dark-color);
}

.settings-content .form-group {
    margin-bottom: 20px;
}

.settings-content label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: var(--dark-color);
}

.settings-content input[type="checkbox"] + label {
    display: inline;
    margin-left: 8px;
    font-weight: normal;
}

.settings-content select, 
.settings-content input[type="password"],
.settings-content input[type="email"] {
    width: 100%;
    padding: 10px 15px;
    border: 1px solid #ddd;
    border-radius: 5px;
    max-width: 400px;
}

.danger-zone {
    margin-top: 40px;
    padding-top: 20px;
    border-top: 1px solid #eee;
}

.danger-zone h3 {
    color: var(--danger-color);
    margin-bottom: 5px;
}

.danger-zone p {
    color: #666;
    margin-bottom: 15px;
    font-size: 14px;
}

.danger-btn {
    background-color: var(--danger-color);
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 5px;
    cursor: pointer;
    transition: all 0.3s;
}

.danger-btn:hover {
    background-color: #c9302c;
}