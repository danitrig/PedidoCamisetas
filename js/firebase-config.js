/**
 * ============================================================================
 * CONFIGURACIÓN DE FIREBASE (GOOGLE CLOUD - 100% GRATUITO)
 * ============================================================================
 * 
 * Para conectar tu base de datos y almacenamiento en la nube real:
 * 1. Ve a https://console.firebase.google.com/ e inicia sesión con tu cuenta de Google.
 * 2. Pulsa en "Crear un proyecto" (ej: "pedidos-camisetas").
 * 3. En la barra izquierda:
 *    - Activa "Firestore Database" en modo de prueba (o producción).
 *    - Activa "Storage" (para guardar las fotos de las prendas).
 *    - Activa "Authentication" -> "Sign-in method" -> Habilita "Correo electrónico/contraseña".
 *    - Crea tu usuario administrador en Authentication -> "Users" -> "Agregar usuario".
 * 4. Ve a la Configuración del Proyecto (icono de engranaje ⚙️) -> "Tus apps" -> Añadir app Web (</>).
 * 5. Copia los valores que te da Firebase y pégalos aquí abajo:
 */

window.FIREBASE_CONFIG = {
  apiKey: "TU_API_KEY_AQUI",
  authDomain: "tu-proyecto.firebaseapp.com",
  projectId: "tu-proyecto",
  storageBucket: "tu-proyecto.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};

// Comprobación si Firebase está configurado o si está en modo DEMO local
window.isFirebaseConfigured = function() {
  const localSavedConfig = localStorage.getItem('customwear_firebase_config');
  if (localSavedConfig) {
    try {
      const parsed = JSON.parse(localSavedConfig);
      if (parsed.apiKey && parsed.apiKey !== "TU_API_KEY_AQUI") {
        window.FIREBASE_CONFIG = parsed;
        return true;
      }
    } catch (e) {
      console.warn("Configuración guardada inválida:", e);
    }
  }

  return window.FIREBASE_CONFIG.apiKey && 
         window.FIREBASE_CONFIG.apiKey !== "TU_API_KEY_AQUI" && 
         window.FIREBASE_CONFIG.projectId !== "tu-proyecto";
};
