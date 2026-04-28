/**
 * 🔥 CONFIGURAÇÃO CENTRALIZADA DO FIREBASE
 * 
 * ⚠️ INSTRUÇÕES PARA CONFIGURAR:
 * 
 * 1. Acesse: https://console.firebase.google.com
 * 2. Clique "Criar Projeto" → Digite um nome (ex: "controle-atividade")
 * 3. Após criar, vá em: Configurações do Projeto (⚙️ no canto superior direito)
 * 4. Na aba "Geral", procure por "Sua Aplicação" e clique em </> (web)
 * 5. Copie o objeto firebaseConfig completo
 * 6. Cole os valores abaixo:
 */

// ✅ CREDENCIAIS DO FIREBASE - Controle de Atividades
window.firebaseConfig = {
    apiKey: "AizaSyCaxbRw1GOHLQtxwVlPnLpnQtubDmT80IY",
    authDomain: "controle-atividades-89a1e.firebaseapp.com",
    databaseURL: "https://controle-atividades-89a1e-default-rtdb.firebaseio.com",
    projectId: "controle-atividades-89a1e",
    storageBucket: "controle-atividades-89a1e.firebasestorage.app",
    messagingSenderId: "512337706745",
    appId: "1:512337706745:web:af454495ba0ef5680aac28"
};

/**
 * ✅ COMO SABER SE ESTÁ CORRETO:
 * - Se recarregar a página e NÃO aparecer erro de console = ✅ Funcionando!
 * - Se aparecer "Firebase: No Firebase App 'DEFAULT'" = ❌ Credenciais incorretas
 * 
 * 📍 ALTERNATIVA: Se preferir, abra qualquer página (index.html, etc.)
 * na aba "Configurações" que aparecerá um formulário para adicionar as credenciais
 */

console.log("✅ Firebase Config Carregado (centralize em firebase-config.js)");
