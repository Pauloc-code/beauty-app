import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Função para validar se todas as variáveis de ambiente estão configuradas
const validateFirebaseConfig = () => {
  const requiredVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN', 
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_STORAGE_BUCKET',
    'VITE_FIREBASE_MESSAGING_SENDER_ID',
    'VITE_FIREBASE_APP_ID'
  ];

  const missing = requiredVars.filter(varName => !import.meta.env[varName]);
  
  if (missing.length > 0) {
    console.error('❌ Firebase Configuration Error: Missing environment variables:', missing);
    console.log('📝 Required environment variables:');
    requiredVars.forEach(varName => {
      const value = import.meta.env[varName];
      console.log(`${varName}: ${value ? '✅ Set' : '❌ Missing'}`);
    });
    
    // Em desenvolvimento, podemos mostrar um erro mais amigável
    if (import.meta.env.DEV) {
      throw new Error(`Missing Firebase environment variables: ${missing.join(', ')}`);
    }
  }
};

// Configuração do Firebase
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ""
};

// Validar configuração antes de inicializar
validateFirebaseConfig();

let app;
let db;

try {
  // Initialize Firebase
  app = initializeApp(firebaseConfig);
  
  // Initialize Cloud Firestore and get a reference to the service
  db = getFirestore(app);
  
  console.log('✅ Firebase initialized successfully');
} catch (error) {
  console.error('❌ Firebase initialization failed:', error);
  
  // Em produção, podemos querer fazer fallback ou mostrar erro amigável
  if (import.meta.env.PROD) {
    throw new Error('Failed to initialize Firebase. Please check your configuration.');
  } else {
    throw error;
  }
}

export { db };