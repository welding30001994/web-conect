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