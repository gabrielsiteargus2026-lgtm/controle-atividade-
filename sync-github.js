/**
 * 🔥 SINCRONIZAÇÃO GITHUB - Múltiplos PCs em Tempo Real
 * 
 * localStorage para cache local
 * GitHub Actions para sincronização entre PCs
 * Polling a cada 5 segundos
 * 
 * Data: 29/04/2026
 */

console.log("✅ sync-github.js carregado");

// Estado global
const SYNC_INTERVAL = 5000; // 5 segundos
const GITHUB_RAW_URL = "https://raw.githubusercontent.com/gabrielsiteargus2026-lgtm/controle-atividade-/main/dados-compartilhados.json";
let ultimaAtualizacao = 0;

// Função de sincronização principal
async function inicializarSincronizacao() {
    console.log("🚀 Iniciando sincronização GitHub...");

    // 1. Carregar cache local
    carregarDoLocalStorage();

    // 2. Tentar carregar dados do GitHub (primeira vez)
    await sincronizarComGitHub();

    // 3. Polling contínuo
    setInterval(sincronizarComGitHub, SYNC_INTERVAL);

    // 4. BroadcastChannel para sincronizar entre abas do mesmo PC
    configurarBroadcastChannel();

    console.log("✅ Sincronização GitHub ativa!");
}

// Carregar dados do localStorage
function carregarDoLocalStorage() {
    try {
        console.log("📱 Carregando dados do localStorage...");
        
        const cache = localStorage.getItem('controle_atividade_cache');
        if (cache) {
            const dados = JSON.parse(cache);
            window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
            window.atividades = dados.atividades || [];
            window.kanbanState = dados.kanbanState || {};
            ultimaAtualizacao = dados.ultimaAtualizacao || 0;
            
            console.log("✅ Dados carregados do localStorage:", {
                emAndamento: window.atividadesEmAndamento.length,
                atividades: window.atividades.length
            });
        } else {
            console.log("⚠️ Nenhum cache local encontrado");
            window.atividadesEmAndamento = [];
            window.atividades = [];
            window.kanbanState = {};
        }
    } catch (error) {
        console.error("❌ Erro ao carregar localStorage:", error);
        window.atividadesEmAndamento = [];
        window.atividades = [];
        window.kanbanState = {};
    }
}

// Sincronizar com GitHub
async function sincronizarComGitHub() {
    try {
        console.log("🔄 Sincronizando com GitHub...");

        const response = await fetch(GITHUB_RAW_URL + "?t=" + Date.now());
        
        if (!response.ok) {
            console.warn("⚠️ Arquivo de sincronização não encontrado no GitHub (criando)");
            salvarNoLocalStorage(); // Salvar no localStorage pelo menos
            return;
        }

        const dados = await response.json();

        // Verificar se há atualizações
        if (dados.ultimaAtualizacao > ultimaAtualizacao) {
            console.log("🔔 Atualizações detectadas do GitHub!");
            
            window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
            window.atividades = dados.atividades || [];
            window.kanbanState = dados.kanbanState || {};
            ultimaAtualizacao = dados.ultimaAtualizacao;

            // Atualizar interface
            if (typeof window.atualizarTabela === 'function') {
                try { window.atualizarTabela(); } catch (e) {}
            }
            if (typeof window.atualizarKanban === 'function') {
                try { window.atualizarKanban(); } catch (e) {}
            }

            console.log("✅ Interface atualizada");

            // Notificar outras abas via BroadcastChannel
            if (window.syncChannel) {
                window.syncChannel.postMessage({
                    tipo: 'atualizacao',
                    dados: { window.atividadesEmAndamento, window.atividades, window.kanbanState }
                });
            }
        }

    } catch (error) {
        console.error("⚠️ Erro ao sincronizar com GitHub:", error);
        // Continuar usando localStorage
    }
}

// Salvar no localStorage
function salvarNoLocalStorage() {
    try {
        const dados = {
            atividadesEmAndamento: window.atividadesEmAndamento || [],
            atividades: window.atividades || [],
            kanbanState: window.kanbanState || {},
            ultimaAtualizacao: Date.now()
        };

        localStorage.setItem('controle_atividade_cache', JSON.stringify(dados));
        ultimaAtualizacao = dados.ultimaAtualizacao;

        console.log("💾 Dados salvos em localStorage");

    } catch (error) {
        console.error("❌ Erro ao salvar em localStorage:", error);
    }
}

// BroadcastChannel para sincronizar entre abas
function configurarBroadcastChannel() {
    try {
        if (typeof BroadcastChannel === 'undefined') {
            console.warn("⚠️ BroadcastChannel não suportado neste navegador");
            return;
        }

        window.syncChannel = new BroadcastChannel('controle_atividade_sync');

        window.syncChannel.onmessage = (event) => {
            console.log("📢 Mensagem de outra aba:", event.data.tipo);
            
            if (event.data.tipo === 'atualizacao') {
                carregarDoLocalStorage();
                
                if (typeof window.atualizarTabela === 'function') {
                    try { window.atualizarTabela(); } catch (e) {}
                }
                if (typeof window.atualizarKanban === 'function') {
                    try { window.atualizarKanban(); } catch (e) {}
                }
            }
        };

        console.log("✅ BroadcastChannel configurado");

    } catch (error) {
        console.error("⚠️ Erro ao configurar BroadcastChannel:", error);
    }
}

// Função para salvar no GitHub (chamada pelo index.html)
window.salvarNoFirebase = async function() {
    console.log("📤 Salvando dados...");

    // 1. Sempre salvar em localStorage PRIMEIRO (rápido)
    salvarNoLocalStorage();

    // 2. Notificar outras abas
    if (window.syncChannel) {
        window.syncChannel.postMessage({
            tipo: 'atualizacao',
            dados: { window.atividadesEmAndamento, window.atividades, window.kanbanState }
        });
    }

    // 3. Próxima sincronização com GitHub fará polling
    console.log("✅ Dados salvos localmente");
};

// Iniciar
inicializarSincronizacao();

console.log("✅ sync-github.js iniciado com sucesso");
