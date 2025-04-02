// Manejo del formulario de registro
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value;
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Guardar información adicional del usuario
            return db.collection('users').doc(userCredential.user.uid).set({
                name: name,
                email: email,
                createdAt: new Date(),
                profilePic: ''
            });
        })
        .then(() => {
            alert('Usuario registrado con éxito!');
            window.location.href = 'home.html';
        })
        .catch((error) => {
            console.error("Error al registrar:", error);
            alert(error.message);
        });
});

// Manejo del formulario de login
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then(() => {
            window.location.href = 'home.html';
        })
        .catch((error) => {
            console.error("Error al iniciar sesión:", error);
            alert(error.message);
        });
});

// Cambiar entre login y registro
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');

signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

// Verificar estado de autenticación
auth.onAuthStateChanged(user => {
    if (user) {
        window.location.href = 'home.html';
    }
});