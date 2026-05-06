// ================================================================
// 🔥 CONFIGURAÇÃO DO FIREBASE
// ================================================================
// 1. Acesse https://console.firebase.google.com/
// 2. Crie um projeto (ou use um existente)
// 3. Vá em "Realtime Database" → "Criar banco de dados"
// 4. Escolha modo "Teste" (por enquanto)
// 5. Vá em Configurações do Projeto → "Seus apps" → Web (</>)
// 6. Copie os valores e cole abaixo substituindo os exemplos:
// ================================================================

const FIREBASE_CONFIG = {
    apiKey: "AIzaSyBFEcYo34h_J6DovzVWUeDVRLmqSwEo8HU",
    authDomain: "controle-atividades-60b4e.firebaseapp.com",
    databaseURL: "https://controle-atividades-60b4e-default-rtdb.firebaseio.com",
    projectId: "controle-atividades-60b4e",
    storageBucket: "controle-atividades-60b4e.firebasestorage.app",
    messagingSenderId: "197242752867",
    appId: "1:197242752867:web:43bcbb50b621d149070d56"
};

// ================================================================
// 🔐 AUTENTICAÇÃO
// ================================================================
// Firebase Authentication está ATIVADO nesta configuração
// Todos os usuários devem fazer login antes de acessar a aplicação
// 
// Todas as atividades são rastreadas com:
// - usuario_id (UID do Firebase)
// - email_usuario (email do login)
// - nome_usuario (nome do perfil)
// - data_criacao (timestamp da criação)
// - data_atualizacao (timestamp da última atualização)
