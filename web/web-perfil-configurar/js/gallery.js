// Cargar galería de fotos
auth.onAuthStateChanged(user => {
    if (user) {
        loadGalleryPhotos();
    }
});

function loadGalleryPhotos() {
    const galleryGrid = document.getElementById('galleryGrid');
    galleryGrid.innerHTML = '<div class="loader"><i class="fas fa-spinner fa-spin"></i> Cargando fotos...</div>';
    
    db.collection('user_photos')
        .orderBy('createdAt', 'desc')
        .get()
        .then((querySnapshot) => {
            galleryGrid.innerHTML = '';
            
            if (querySnapshot.empty) {
                galleryGrid.innerHTML = '<p>No hay fotos en la galería todavía.</p>';
                return;
            }
            
            querySnapshot.forEach((doc) => {
                const photoData = doc.data();
                
                // Obtener información del usuario que subió la foto
                db.collection('users').doc(photoData.userId).get()
                    .then(userDoc => {
                        const userData = userDoc.data();
                        
                        const photoItem = document.createElement('div');
                        photoItem.className = 'gallery-item';
                        
                        photoItem.innerHTML = `
                            <img src="${photoData.photoURL}" alt="Foto de ${userData.name}">
                            <div class="gallery-item-info">
                                <img src="${userData.profilePic || 'assets/default-profile.jpg'}" alt="${userData.name}">
                                <span>${userData.name}</span>
                                <button class="like-btn"><i class="far fa-heart"></i></button>
                            </div>
                        `;
                        
                        galleryGrid.appendChild(photoItem);
                        
                        // Evento para abrir imagen en modal
                        const img = photoItem.querySelector('img:first-child');
                        img.addEventListener('click', () => {
                            openModal(photoData.photoURL, userData.name);
                        });
                        
                        // Evento para like
                        const likeBtn = photoItem.querySelector('.like-btn');
                        likeBtn.addEventListener('click', (e) => {
                            e.stopPropagation();
                            likeBtn.innerHTML = '<i class="fas fa-heart"></i>';
                            likeBtn.style.color = 'red';
                        });
                    });
            });
        })
        .catch(error => {
            console.error("Error al cargar galería:", error);
            galleryGrid.innerHTML = '<p>Error al cargar la galería. Intenta de nuevo más tarde.</p>';
        });
}

// Modal para imagen ampliada
function openModal(imageSrc, caption) {
    const modal = document.getElementById('imageModal');
    const modalImg = document.getElementById('modalImage');
    const captionText = document.getElementById('modalCaption');
    
    modal.style.display = "block";
    modalImg.src = imageSrc;
    captionText.innerHTML = caption;
    
    // Cerrar modal al hacer clic en la X
    document.querySelector('.close-modal').onclick = function() {
        modal.style.display = "none";
    }
    
    // Cerrar modal al hacer clic fuera de la imagen
    window.onclick = function(event) {
        if (event.target == modal) {
            modal.style.display = "none";
        }
    }
}

// Añadir estilos para la galería (añadir a style.css)
.gallery-section {
    background-color: white;
    border-radius: 10px;
    padding: 20px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.gallery-filters {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
}

.filter-btn {
    background-color: #f5f5f5;
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    transition: all 0.3s;
}

.filter-btn.active {
    background-color: var(--primary-color);
    color: white;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
}

.gallery-item {
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
}

.gallery-item:hover {
    transform: scale(1.02);
}

.gallery-item img {
    width: 100%;
    height: 250px;
    object-fit: cover;
    cursor: pointer;
}

.gallery-item-info {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: white;
}

.gallery-item-info img {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    margin-right: 10px;
}

.gallery-item-info span {
    flex: 1;
    font-size: 14px;
    color: var(--dark-color);
}

.like-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 16px;
    color: #666;
}

.loader {
    text-align: center;
    padding: 20px;
    grid-column: 1 / -1;
    color: #666;
}

.loader i {
    margin-right: 10px;
}

/* Modal */
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.9);
    overflow: auto;
}

.modal-content {
    display: block;
    margin: 60px auto;
    max-width: 80%;
    max-height: 80%;
}

.modal-caption {
    color: white;
    text-align: center;
    padding: 10px;
    font-size: 18px;
}

.close-modal {
    position: absolute;
    top: 20px;
    right: 30px;
    color: white;
    font-size: 40px;
    font-weight: bold;
    cursor: pointer;
}

.close-modal:hover {
    color: var(--primary-color);
}