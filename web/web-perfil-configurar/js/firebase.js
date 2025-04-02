// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyD3MI1klgBSHs1h6QT4VPNoScCfCwMV_Ck",
  authDomain: "usuario-b0384.firebaseapp.com",
  databaseURL: "https://usuario-b0384-default-rtdb.firebaseio.com",
  projectId: "usuario-b0384",
  storageBucket: "usuario-b0384.firebasestorage.app",
  messagingSenderId: "196266170863",
  appId: "1:196266170863:web:4ea57f489df94aba94fe1a"
};
// Inicializar Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();