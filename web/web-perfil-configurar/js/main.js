// Cargar información del usuario
auth.onAuthStateChanged(user => {
    if (!user) {
        window.location.href = 'index.html';
    } else {
        // Obtener información del usuario desde Firestore
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    document.getElementById('userName').textContent = userData.name;
                    
                    // Mostrar foto de perfil si existe
                    if (userData.profilePic) {
                        document.getElementById('profilePic').src = userData.profilePic;
                    }
                }
            })
            .catch(error => {
                console.error("Error al obtener datos del usuario:", error);
            });
    }
});

// Cerrar sesión
document.getElementById('logoutBtn').addEventListener('click', () => {
    auth.signOut()
        .then(() => {
            window.location.href = 'index.html';
        })
        .catch(error => {
            console.error("Error al cerrar sesión:", error);
        });
});