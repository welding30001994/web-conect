// Función para registrar un nuevo usuario
function signUp(email, password) {
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Usuario registrado con éxito
            alert("Usuario registrado correctamente");
            window.location.href = "home.html";
        })
        .catch((error) => {
            // Manejo de errores
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error al registrar: ${errorMessage}`);
        });
}

// Función para iniciar sesión
function signIn(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Inicio de sesión exitoso
            window.location.href = "home.html";
        })
        .catch((error) => {
            // Manejo de errores
            const errorCode = error.code;
            const errorMessage = error.message;
            alert(`Error al iniciar sesión: ${errorMessage}`);
        });
}

// Función para cerrar sesión
function signOut() {
    auth.signOut().then(() => {
        // Cierre de sesión exitoso
        window.location.href = "index.html";
    }).catch((error) => {
        alert(`Error al cerrar sesión: ${error.message}`);
    });
}

// Verificar estado de autenticación
function checkAuth() {
    auth.onAuthStateChanged((user) => {
        if (!user && !window.location.pathname.includes("index.html") && !window.location.pathname.includes("signup.html")) {
            // Usuario no autenticado intentando acceder a páginas protegidas
            window.location.href = "index.html";
        }
    });
}




// DOM Elements
const signUpButton = document.getElementById('signUp');
const signInButton = document.getElementById('signIn');
const container = document.getElementById('container');
const registerForm = document.getElementById('registerForm');
const loginForm = document.getElementById('loginForm');
const forgotPassword = document.getElementById('forgotPassword');
const messageDiv = document.getElementById('message');

// Event Listeners
signUpButton.addEventListener('click', () => {
    container.classList.add("right-panel-active");
});

signInButton.addEventListener('click', () => {
    container.classList.remove("right-panel-active");
});

// Register User
registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const name = document.getElementById('registerName').value;
    
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            
            // Update user profile with name
            user.updateProfile({
                displayName: name
            }).then(() => {
                showMessage('Registro exitoso!', 'success');
                container.classList.remove("right-panel-active");
                registerForm.reset();
            }).catch((error) => {
                showMessage(error.message, 'error');
            });
        })
        .catch((error) => {
            showMessage(error.message, 'error');
        });
});

// Login User
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            // Signed in
            const user = userCredential.user;
            showMessage(`Bienvenido ${user.displayName || 'usuario'}!`, 'success');
            loginForm.reset();
            // Redirect or do something after login
        })
        .catch((error) => {
            showMessage(error.message, 'error');
        });
});

// Password Reset
forgotPassword.addEventListener('click', (e) => {
    e.preventDefault();
    const email = prompt("Por favor ingresa tu correo electrónico para restablecer la contraseña:");
    
    if (email) {
        auth.sendPasswordResetEmail(email)
            .then(() => {
                showMessage('Correo de restablecimiento enviado. Revisa tu bandeja de entrada.', 'success');
            })
            .catch((error) => {
                showMessage(error.message, 'error');
            });
    }
});

// Auth State Listener
auth.onAuthStateChanged(user => {
    if (user) {
        // User is signed in
        console.log("Usuario conectado:", user);
        // You can redirect or update UI here
    } else {
        // User is signed out
        console.log("Usuario desconectado");
    }
});

// Show message function
function showMessage(message, type) {
    messageDiv.textContent = message;
    messageDiv.className = 'message ' + type;
    
    setTimeout(() => {
        messageDiv.style.display = 'none';
    }, 5000);
    messageDiv.style.display = 'block';
}