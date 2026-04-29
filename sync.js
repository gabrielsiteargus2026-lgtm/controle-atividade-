/**
 * 🔥 SINCRONIZAÇÃO FIREBASE - VERSÃO SIMPLIFICADA (Funciona em TUDO)
 * 
 * Problema: Múltiplos erros e fragmentação
 * Solução: Um único arquivo, sem dependências externas, sincronização garantida
 * 
 * Data: 29/04/2026
 */

(async function() {
    console.log("🔥 [SYNC-SIMPLE] Iniciando sincronização simplificada...");

    // Importações Firebase inline
    const firebaseScript = document.createElement('script');
    firebaseScript.type = 'module';
    firebaseScript.textContent = `
        import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
        import { 
            getDatabase, 
            ref, 
            get,
            set,
            onValue
        } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

        const firebaseConfig = {
          apiKey: "AIzaSyBoLGZgImxHrg_n8Lq12Ppv80m5HLXQKjs",
          authDomain: "controle-atividade-a6b6d.firebaseapp.com",
          databaseURL: "https://controle-atividade-a6b6d-default-rtdb.firebaseio.com",
          projectId: "controle-atividade-a6b6d",
          storageBucket: "controle-atividade-a6b6d.appspot.com",
          messagingSenderId: "449852839157",
          appId: "1:449852839157:web:da90aec3840427f375e1bc"
        };

        const app = initializeApp(firebaseConfig);
        const db = getDatabase(app);
        const dadosRef = ref(db, "controle-atividade/dados");

        // Estado global de sincronização
        window.FIREBASE_SYNC = {
            conectado: false,
            sincronizando: false,
            ultimoDados: null
        };

        console.log("✅ [FIREBASE] SDK carregado");

        /**
         * 📥 Carregar dados do Firebase
         */
        window.carregarDoFirebase = async function() {
            try {
                const snapshot = await get(dadosRef);
                const dados = snapshot.val();
                
                if (dados) {
                    console.log("✅ [FIREBASE] Dados carregados:", {
                        emAndamento: dados.atividadesEmAndamento?.length || 0,
                        concluidas: dados.atividades?.length || 0
                    });

                    // Atualizar localStorage
                    localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento || []));
                    localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
                    localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState || {}));

                    // Atualizar estado global
                    window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
                    window.atividades = dados.atividades || [];
                    window.kanbanState = dados.kanbanState || {};

                    window.FIREBASE_SYNC.ultimoDados = dados;
                    window.FIREBASE_SYNC.conectado = true;

                    return dados;
                } else {
                    console.log("⚠️ [FIREBASE] Nenhum dado no Firebase");
                    window.FIREBASE_SYNC.conectado = true;
                    return null;
                }
            } catch (error) {
                console.error("❌ [FIREBASE] Erro ao carregar:", error.message);
                window.FIREBASE_SYNC.conectado = false;
                return null;
            }
        };

        /**
         * 📤 Salvar dados no Firebase
         */
        window.salvarNoFirebase = async function(emAndamento, concluidas, kanban) {
            if (window.FIREBASE_SYNC.sincronizando) return;

            window.FIREBASE_SYNC.sincronizando = true;

            try {
                const novosDados = {
                    atividadesEmAndamento: emAndamento || [],
                    atividades: concluidas || [],
                    kanbanState: kanban || {},
                    ultimaAtualizacao: new Date().toISOString(),
                    computador: window.location.hostname || 'desconhecido'
                };

                await set(dadosRef, novosDados);

                console.log("✅ [FIREBASE] Dados salvos");
                window.FIREBASE_SYNC.ultimoDados = novosDados;

                return true;
            } catch (error) {
                console.error("❌ [FIREBASE] Erro ao salvar:", error.message);
                return false;
            } finally {
                window.FIREBASE_SYNC.sincronizando = false;
            }
        };

        /**
         * 🔄 Listener em tempo real
         */
        window.iniciarListenerFirebase = function() {
            console.log("👂 [FIREBASE] Iniciando listener...");

            onValue(dadosRef, (snapshot) => {
                const dados = snapshot.val();

                if (!dados) {
                    console.log("⚠️ [FIREBASE] Dados vazios no listener");
                    return;
                }

                console.log("🔔 [FIREBASE] Dados alterados:", {
                    emAndamento: dados.atividadesEmAndamento?.length || 0,
                    concluidas: dados.atividades?.length || 0
                });

                // Atualizar estado
                window.atividadesEmAndamento = (dados.atividadesEmAndamento || []).map(a => ({
                    ...a,
                    intervaloTimer: window.atividadesEmAndamento?.find(x => x.id === a.id)?.intervaloTimer || null
                }));
                window.atividades = dados.atividades || [];
                window.kanbanState = dados.kanbanState || {};

                // Atualizar localStorage
                localStorage.setItem('atividadesEmAndamento', JSON.stringify(window.atividadesEmAndamento));
                localStorage.setItem('atividades', JSON.stringify(window.atividades));
                localStorage.setItem('kanbanState', JSON.stringify(window.kanbanState));

                window.FIREBASE_SYNC.conectado = true;

                // Atualizar UI se existir
                if (typeof window.atualizarTabela === 'function') {
                    try { window.atualizarTabela(); } catch (e) {}
                }
                if (typeof window.atualizarKanban === 'function') {
                    try { window.atualizarKanban(); } catch (e) {}
                }

                // Reiniciar timers
                window.atividadesEmAndamento.forEach(atividade => {
                    if (!atividade.intervaloTimer && atividade.tempoInicio) {
                        if (typeof window.iniciarCronometro === 'function') {
                            try { window.iniciarCronometro(atividade.id); } catch (e) {}
                        }
                    }
                });

            }, (error) => {
                console.error("❌ [FIREBASE] Erro no listener:", error.message);
                window.FIREBASE_SYNC.conectado = false;
            });

            console.log("✅ [FIREBASE] Listener ativo");
        };

        /**
         * 🎯 Interceptar salvarDados
         */
        window.interceptarSalvarDados = function() {
            const original = window.salvarDados;
            
            window.salvarDados = function() {
                if (original) original.call(window);
                
                setTimeout(() => {
                    window.salvarNoFirebase(
                        window.atividadesEmAndamento || [],
                        window.atividades || [],
                        window.kanbanState || {}
                    );
                }, 100);
            };

            console.log("✅ [FIREBASE] salvarDados interceptado");
        };

        /**
         * 🚀 Inicializar
         */
        window.inicializarSincronizacaoFirebase = async function() {
            console.log("🚀 [FIREBASE] Inicializando...");

            // 1. Carregar dados
            const dados = await window.carregarDoFirebase();

            // 2. Se não houver dados, usar localStorage
            if (!dados) {
                console.log("💾 [FIREBASE] Usando localStorage");
                window.atividadesEmAndamento = JSON.parse(localStorage.getItem('atividadesEmAndamento') || '[]');
                window.atividades = JSON.parse(localStorage.getItem('atividades') || '[]');
                window.kanbanState = JSON.parse(localStorage.getItem('kanbanState') || '{}');

                // Enviar para Firebase
                setTimeout(() => {
                    window.salvarNoFirebase(
                        window.atividadesEmAndamento,
                        window.atividades,
                        window.kanbanState
                    );
                }, 1000);
            }

            // 3. Iniciar listener
            setTimeout(() => window.iniciarListenerFirebase(), 500);

            // 4. Interceptar salvarDados
            setTimeout(() => window.interceptarSalvarDados(), 2000);

            console.log("✅ [FIREBASE] Sistema de sincronização pronto!");
        };

        // Auto-inicializar
        setTimeout(() => {
            window.inicializarSincronizacaoFirebase();
        }, 500);
    `;
    
    document.head.appendChild(firebaseScript);
})();

console.log("✅ [SYNC-SIMPLE] Arquivo carregado e ativo");
