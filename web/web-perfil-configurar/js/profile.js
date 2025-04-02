// Cargar información del perfil
auth.onAuthStateChanged(user => {
    if (user) {
        db.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    
                    // Actualizar información del perfil
                    document.getElementById('profileName').textContent = userData.name;
                    document.getElementById('profileEmail').textContent = user.email;
                    document.getElementById('name').value = userData.name || '';
                    document.getElementById('bio').value = userData.bio || '';
                    
                    // Mostrar fecha de registro
                    const joinDate = userData.createdAt.toDate();
                    document.getElementById('joinDate').textContent = joinDate.toLocaleDateString('es-ES', {
                        year: 'numeric', 
                        month: 'long'
                    });
                    
                    // Mostrar foto de perfil si existe
                    if (userData.profilePic) {
                        document.getElementById('largeProfilePic').src = userData.profilePic;
                        document.getElementById('profilePic').src = userData.profilePic;
                    }
                    
                    // Cargar fotos del usuario
                    loadUserPhotos(user.uid);
                }
            })
            .catch(error => {
                console.error("Error al cargar perfil:", error);
            });
    }
});

// Actualizar perfil
document.getElementById('updateProfileForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const bio = document.getElementById('bio').value;
    const user = auth.currentUser;
    
    db.collection('users').doc(user.uid).update({
        name: name,
        bio: bio
    })
    .then(() => {
        alert('Perfil actualizado con éxito!');
        document.getElementById('profileName').textContent = name;
        document.getElementById('userName').textContent = name;
    })
    .catch(error => {
        console.error("Error al actualizar perfil:", error);
        alert('Error al actualizar perfil: ' + error.message);
    });
});

// Subir foto de perfil
document.getElementById('profileUpload').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const user = auth.currentUser;
    const storageRef = storage.ref(`profile_pictures/${user.uid}`);
    const uploadTask = storageRef.put(file);
    
    uploadTask.on('state_changed', 
        (snapshot) => {
            // Progreso de la subida
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Subida: ' + progress + '%');
        },
        (error) => {
            console.error("Error al subir imagen:", error);
            alert('Error al subir imagen: ' + error.message);
        },
        () => {
            // Subida completada
            uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                // Actualizar foto en Firestore
                return db.collection('users').doc(user.uid).update({
                    profilePic: downloadURL
                });
            })
            .then(() => {
                // Actualizar imagen en la página
                const imageURL = URL.createObjectURL(file);
                document.getElementById('largeProfilePic').src = imageURL;
                document.getElementById('profilePic').src = imageURL;
                alert('Foto de perfil actualizada con éxito!');
            })
            .catch(error => {
                console.error("Error al actualizar URL:", error);
            });
        }
    );
});

// Subir fotos al perfil
document.getElementById('photoUpload').addEventListener('change', (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const user = auth.currentUser;
    const uploadPromises = [];
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const storageRef = storage.ref(`user_photos/${user.uid}/${Date.now()}_${file.name}`);
        const uploadTask = storageRef.put(file);
        
        const uploadPromise = new Promise((resolve, reject) => {
            uploadTask.on('state_changed', 
                null,
                (error) => {
                    reject(error);
                },
                () => {
                    uploadTask.snapshot.ref.getDownloadURL().then((downloadURL) => {
                        // Guardar referencia en Firestore
                        db.collection('user_photos').add({
                            userId: user.uid,
                            photoURL: downloadURL,
                            createdAt: new Date()
                        })
                        .then(() => {
                            resolve();
                        })
                        .catch(error => {
                            reject(error);
                        });
                    });
                }
            );
        });
        
        uploadPromises.push(uploadPromise);
    }
    
    Promise.all(uploadPromises)
        .then(() => {
            alert('Fotos subidas con éxito!');
            loadUserPhotos(user.uid);
        })
        .catch(error => {
            console.error("Error al subir fotos:", error);
            alert('Error al subir fotos: ' + error.message);
        });
});

// Cargar fotos del usuario
function loadUserPhotos(userId) {
    const photosGrid = document.getElementById('photosGrid');
    photosGrid.innerHTML = '';
    
    db.collection('user_photos')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            if (querySnapshot.empty) {
                photosGrid.innerHTML = '<p>No hay fotos todavía. Sube tu primera foto!</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const photoData = doc.data();
                const photoItem = document.createElement('div');
                photoItem.className = 'photo-item';
                
                photoItem.innerHTML = `
                    <img src="${photoData.photoURL}" alt="Foto del usuario">
                    <div class="photo-actions">
                        <button class="delete-photo" data-id="${doc.id}"><i class="fas fa-trash"></i></button>
                    </div>
                `;
                
                photosGrid.appendChild(photoItem);
            });
            
            // Agregar event listeners para eliminar fotos
            document.querySelectorAll('.delete-photo').forEach(button => {
                button.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const photoId = button.getAttribute('data-id');
                    deletePhoto(photoId, userId);
                });
            });
        })
        .catch(error => {
            console.error("Error al cargar fotos:", error);
            photosGrid.innerHTML = '<p>Error al cargar las fotos. Intenta de nuevo más tarde.</p>';
        });
}

// Eliminar foto
function deletePhoto(photoId, userId) {
    if (!confirm('¿Estás seguro de que quieres eliminar esta foto?')) return;
    
    db.collection('user_photos').doc(photoId).delete()
        .then(() => {
            alert('Foto eliminada con éxito!');
            loadUserPhotos(userId);
        })
        .catch(error => {
            console.error("Error al eliminar foto:", error);
            alert('Error al eliminar foto: ' + error.message);
        });
}