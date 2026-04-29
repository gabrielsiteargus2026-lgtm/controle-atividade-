/**
 * 🔥 SINCRONIZAÇÃO FIREBASE - VERSÃO COMPAT (Funciona em TUDO)
 * 
 * Compatível com browsers tradicionais, sem ES6 modules
 * 
 * Data: 29/04/2026
 */

console.log("✅ sync.js carregado");

// Aguardar Firebase SDK estar disponível
function verificarFirebase() {
    if (typeof firebase === 'undefined') {
        console.log("⏳ Aguardando Firebase SDK...");
        setTimeout(verificarFirebase, 100);
        return;
    }

    console.log("✅ Firebase SDK disponível!");
    inicializarFirebase();
}

// Inicializar Firebase
function inicializarFirebase() {
    const config = {
        apiKey: "AIzaSyBoLGZgImxHrg_n8Lq12Ppv80m5HLXQKjs",
        authDomain: "controle-atividade-a6b6d.firebaseapp.com",
        databaseURL: "https://controle-atividade-a6b6d-default-rtdb.firebaseio.com",
        projectId: "controle-atividade-a6b6d",
        storageBucket: "controle-atividade-a6b6d.appspot.com",
        messagingSenderId: "449852839157",
        appId: "1:449852839157:web:da90aec3840427f375e1bc"
    };

    try {
        // Inicializar Firebase (compat)
        if (!firebase.apps.length) {
            firebase.initializeApp(config);
        }
        
        const db = firebase.database();

        console.log("✅ Firebase inicializado com sucesso!");

        // Referência dos dados centralizados
        const dadosRef = db.ref("controle-atividade/dados");

        // Carregar dados ao iniciar
        carregarDados(db, dadosRef);

        // Listener para sincronização em tempo real
        dadosRef.on('value', (snapshot) => {
            const dados = snapshot.val();
            console.log("🔔 Dados sincronizados do Firebase:", dados);

            if (dados) {
                // Atualizar localStorage
                localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento || []));
                localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
                localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState || {}));

                // Atualizar variáveis globais (preservar timers)
                if (window.atividadesEmAndamento) {
                    dados.atividadesEmAndamento = (dados.atividadesEmAndamento || []).map(novaAtiv => {
                        const atualAtiv = window.atividadesEmAndamento.find(a => a.id === novaAtiv.id);
                        return {
                            ...novaAtiv,
                            intervaloTimer: atualAtiv ? atualAtiv.intervaloTimer : null
                        };
                    });
                }

                window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
                window.atividades = dados.atividades || [];
                window.kanbanState = dados.kanbanState || {};

                // Atualizar interface
                if (typeof window.atualizarTabela === 'function') {
                    try { window.atualizarTabela(); } catch (e) { console.error("Erro ao atualizar tabela:", e); }
                }
                if (typeof window.atualizarKanban === 'function') {
                    try { window.atualizarKanban(); } catch (e) { console.error("Erro ao atualizar kanban:", e); }
                }

                console.log("✅ Interface atualizada");
            }
        }, (error) => {
            console.error("❌ Erro no listener:", error);
        });

        // Interceptar a função salvarDados original
        if (typeof window.salvarDados === 'function') {
            const salvarOriginal = window.salvarDados;
            window.salvarDados = function() {
                // Chamar original
                salvarOriginal.call(window);

                // Enviar para Firebase
                setTimeout(() => {
                    const dados = {
                        atividadesEmAndamento: window.atividadesEmAndamento || [],
                        atividades: window.atividades || [],
                        kanbanState: window.kanbanState || {},
                        ultimaAtualizacao: new Date().toISOString(),
                        computador: window.location.hostname || 'desconhecido'
                    };

                    dadosRef.set(dados).then(() => {
                        console.log("✅ Dados salvos no Firebase");
                    }).catch((error) => {
                        console.error("❌ Erro ao salvar no Firebase:", error);
                    });
                }, 100);
            };
            console.log("✅ salvarDados interceptado");
        }

    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
    }
}

// Carregar dados iniciais
function carregarDados(db, dadosRef) {
    dadosRef.once('value', (snapshot) => {
        const dados = snapshot.val();
        if (dados) {
            console.log("✅ Dados carregados do Firebase");
            window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
            window.atividades = dados.atividades || [];
            window.kanbanState = dados.kanbanState || {};

            localStorage.setItem('atividadesEmAndamento', JSON.stringify(window.atividadesEmAndamento));
            localStorage.setItem('atividades', JSON.stringify(window.atividades));
            localStorage.setItem('kanbanState', JSON.stringify(window.kanbanState));
        } else {
            console.log("⚠️ Nenhum dado no Firebase, usando localStorage");
            window.atividadesEmAndamento = JSON.parse(localStorage.getItem('atividadesEmAndamento') || '[]');
            window.atividades = JSON.parse(localStorage.getItem('atividades') || '[]');
            window.kanbanState = JSON.parse(localStorage.getItem('kanbanState') || '{}');
        }
    });
}

// Iniciar verificação
verificarFirebase();

console.log("✅ sync.js iniciado com sucesso");
