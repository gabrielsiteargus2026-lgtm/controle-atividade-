/**
 * 🔥 SINCRONIZAÇÃO - VERSÃO FALLBACK ESTÁVEL
 * 
 * localStorage primeiro (funciona mesmo com Tracking Prevention)
 * Firebase em background se conseguir carregar
 * 
 * Data: 29/04/2026
 */

console.log("✅ sync.js carregado");

// Estado global
let db = null;
let dadosRef = null;
let firebaseCarregado = false;
let usandoLocalStorage = false;
let firebaseJaFoiTentado = false;

// FUNÇÃO PRINCIPAL: Verificar Firebase
function inicializarSincronizacao() {
    console.log("🚀 Iniciando sincronização...");
    
    // Sempre carregar do localStorage PRIMEIRO
    carregarDoLocalStorage();
    usandoLocalStorage = true;

    // Tentar carregar Firebase em background (não bloqueia)
    verificarFirebaseEmBackground();
}

// Verificar Firebase periodicamente sem bloquear
function verificarFirebaseEmBackground() {
    if (firebaseJaFoiTentado || firebaseCarregado) return;

    let tentativas = 0;
    
    function tentar() {
        tentativas++;
        
        // Checar se Firebase está disponível
        if (typeof firebase !== 'undefined' && firebase.apps) {
            console.log("✅ Firebase SDK disponível!");
            inicializarFirebase();
            firebaseCarregado = true;
            return;
        }

        if (tentativas >= 5) { // Tentar apenas 5 vezes
            console.log("⚠️ Firebase não disponível. Usando localStorage permanentemente.");
            firebaseJaFoiTentado = true;
            return;
        }

        console.log("⏳ Verificando Firebase em background... (" + tentativas + "s)");
        setTimeout(tentar, 2000); // Verificar a cada 2 segundos
    }

    tentar();
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
        // Inicializar Firebase
        if (firebase.apps.length === 0) {
            firebase.initializeApp(config);
            console.log("🔧 Firebase.initializeApp() chamado");
        }
        
        db = firebase.database();
        dadosRef = db.ref("controle-atividade/dados");

        console.log("✅ Firebase inicializado com sucesso!");
        usandoLocalStorage = false;

        // Carregar dados do Firebase
        carregarDadosInicial();

        // Listener para sincronização em tempo real
        dadosRef.on('value', (snapshot) => {
            const dados = snapshot.val();
            console.log("🔔 Dados do Firebase recebidos");

            if (dados && dados.atividadesEmAndamento) {
                // Atualizar localStorage
                try {
                    localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento || []));
                    localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
                    localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState || {}));
                } catch(e) {
                    console.warn("⚠️ Não conseguiu escrever em localStorage:", e);
                }

                // Atualizar variáveis globais
                if (JSON.stringify(window.atividadesEmAndamento) !== JSON.stringify(dados.atividadesEmAndamento)) {
                    // Preservar timers
                    dados.atividadesEmAndamento = (dados.atividadesEmAndamento || []).map(novaAtiv => {
                        const atualAtiv = (window.atividadesEmAndamento || []).find(a => a.id === novaAtiv.id);
                        return {
                            ...novaAtiv,
                            intervaloTimer: atualAtiv ? atualAtiv.intervaloTimer : null
                        };
                    });

                    window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
                    window.atividades = dados.atividades || [];
                    window.kanbanState = dados.kanbanState || {};

                    // Atualizar interface
                    if (typeof window.atualizarTabela === 'function') {
                        try { window.atualizarTabela(); } catch (e) {}
                    }
                    if (typeof window.atualizarKanban === 'function') {
                        try { window.atualizarKanban(); } catch (e) {}
                    }

                    console.log("✅ Interface atualizada (Firebase)");
                }
            }
        }, (error) => {
            console.error("❌ Erro no listener:", error);
        });

        console.log("✅ Listener ativo!");

    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
    }
}

// Carregar dados do localStorage
function carregarDoLocalStorage() {
    try {
        console.log("📱 Carregando dados do localStorage");
        window.atividadesEmAndamento = JSON.parse(localStorage.getItem('atividadesEmAndamento') || '[]');
        window.atividades = JSON.parse(localStorage.getItem('atividades') || '[]');
        window.kanbanState = JSON.parse(localStorage.getItem('kanbanState') || '{}');
        
        console.log("✅ Dados carregados do localStorage:", {
            emAndamento: window.atividadesEmAndamento.length,
            atividades: window.atividades.length
        });
    } catch(e) {
        console.warn("⚠️ Erro ao ler localStorage:", e);
        window.atividadesEmAndamento = [];
        window.atividades = [];
        window.kanbanState = {};
    }
}

// Carregar dados iniciais do Firebase
function carregarDadosInicial() {
    if (!dadosRef) return;

    dadosRef.once('value', (snapshot) => {
        const dados = snapshot.val();
        if (dados && dados.atividadesEmAndamento) {
            console.log("✅ Dados carregados do Firebase ao iniciar");
            window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
            window.atividades = dados.atividades || [];
            window.kanbanState = dados.kanbanState || {};

            try {
                localStorage.setItem('atividadesEmAndamento', JSON.stringify(window.atividadesEmAndamento));
                localStorage.setItem('atividades', JSON.stringify(window.atividades));
                localStorage.setItem('kanbanState', JSON.stringify(window.kanbanState));
            } catch(e) {
                console.warn("⚠️ Não conseguiu escrever em localStorage:", e);
            }
        }
    });
}

// Função para salvar no Firebase/localStorage (chamada pelo index.html)
window.salvarNoFirebase = async function() {
    const dados = {
        atividadesEmAndamento: window.atividadesEmAndamento || [],
        atividades: window.atividades || [],
        kanbanState: window.kanbanState || {},
        ultimaAtualizacao: new Date().toISOString(),
        computador: window.location.hostname || 'desconhecido'
    };

    // Sempre salvar em localStorage PRIMEIRO
    try {
        localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento));
        localStorage.setItem('atividades', JSON.stringify(dados.atividades));
        localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState));
        console.log("💾 Dados salvos em localStorage");
    } catch(e) {
        console.warn("⚠️ Erro ao salvar em localStorage:", e);
    }

    // Se Firebase está disponível, enviar para lá também
    if (dadosRef && firebaseCarregado) {
        try {
            console.log("📤 Sincronizando com Firebase...");
            await dadosRef.set(dados);
            console.log("✅ Dados sincronizados no Firebase");
        } catch (error) {
            console.error("❌ Erro ao sincronizar no Firebase:", error);
        }
    }
};

// INICIAR TUDO
inicializarSincronizacao();

console.log("✅ sync.js iniciado com sucesso");

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
        // Inicializar Firebase
        if (firebase.apps.length === 0) {
            firebase.initializeApp(config);
            console.log("🔧 Firebase.initializeApp() chamado");
        }
        
        db = firebase.database();
        dadosRef = db.ref("controle-atividade/dados");

        console.log("✅ Firebase inicializado com sucesso!");
        usandoLocalStorage = false;

        // Carregar dados do Firebase
        carregarDadosInicial();

        // Listener para sincronização em tempo real
        dadosRef.on('value', (snapshot) => {
            const dados = snapshot.val();
            console.log("🔔 Dados do Firebase recebidos");

            if (dados && dados.atividadesEmAndamento) {
                // Atualizar localStorage
                localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento || []));
                localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
                localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState || {}));

                // Atualizar variáveis globais
                if (JSON.stringify(window.atividadesEmAndamento) !== JSON.stringify(dados.atividadesEmAndamento)) {
                    // Preservar timers
                    dados.atividadesEmAndamento = (dados.atividadesEmAndamento || []).map(novaAtiv => {
                        const atualAtiv = (window.atividadesEmAndamento || []).find(a => a.id === novaAtiv.id);
                        return {
                            ...novaAtiv,
                            intervaloTimer: atualAtiv ? atualAtiv.intervaloTimer : null
                        };
                    });

                    window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
                    window.atividades = dados.atividades || [];
                    window.kanbanState = dados.kanbanState || {};

                    // Atualizar interface
                    if (typeof window.atualizarTabela === 'function') {
                        try { window.atualizarTabela(); } catch (e) {}
                    }
                    if (typeof window.atualizarKanban === 'function') {
                        try { window.atualizarKanban(); } catch (e) {}
                    }

                    console.log("✅ Interface atualizada (Firebase)");
                }
            }
        }, (error) => {
            console.error("❌ Erro no listener:", error);
        });

        console.log("✅ Listener ativo!");

    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
        usandoLocalStorage = true;
    }
}

// Carregar dados do localStorage
function carregarDoLocalStorage() {
    console.log("📱 Carregando dados do localStorage");
    window.atividadesEmAndamento = JSON.parse(localStorage.getItem('atividadesEmAndamento') || '[]');
    window.atividades = JSON.parse(localStorage.getItem('atividades') || '[]');
    window.kanbanState = JSON.parse(localStorage.getItem('kanbanState') || '{}');
    
    console.log("✅ Dados carregados do localStorage:", {
        emAndamento: window.atividadesEmAndamento.length,
        atividades: window.atividades.length
    });
}

// Carregar dados iniciais do Firebase
function carregarDadosInicial() {
    if (!dadosRef) return;

    dadosRef.once('value', (snapshot) => {
        const dados = snapshot.val();
        if (dados && dados.atividadesEmAndamento) {
            console.log("✅ Dados carregados do Firebase ao iniciar");
            window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
            window.atividades = dados.atividades || [];
            window.kanbanState = dados.kanbanState || {};

            localStorage.setItem('atividadesEmAndamento', JSON.stringify(window.atividadesEmAndamento));
            localStorage.setItem('atividades', JSON.stringify(window.atividades));
            localStorage.setItem('kanbanState', JSON.stringify(window.kanbanState));
        } else {
            carregarDoLocalStorage();
        }
    });
}

// Função para salvar no Firebase/localStorage (chamada pelo index.html)
window.salvarNoFirebase = async function() {
    const dados = {
        atividadesEmAndamento: window.atividadesEmAndamento || [],
        atividades: window.atividades || [],
        kanbanState: window.kanbanState || {},
        ultimaAtualizacao: new Date().toISOString(),
        computador: window.location.hostname || 'desconhecido'
    };

    // Sempre salvar em localStorage
    localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento));
    localStorage.setItem('atividades', JSON.stringify(dados.atividades));
    localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState));

    // Se Firebase está disponível, enviar para lá também
    if (dadosRef && !usandoLocalStorage) {
        try {
            console.log("📤 Salvando no Firebase...");
            await dadosRef.set(dados);
            console.log("✅ Dados salvos no Firebase");
        } catch (error) {
            console.error("❌ Erro ao salvar no Firebase:", error);
            console.warn("⚠️ Dados salvos apenas em localStorage");
        }
    } else if (usandoLocalStorage) {
        console.log("💾 Dados salvos em localStorage (Firebase indisponível)");
    }
};

// Iniciar verificação
console.log("🚀 Iniciando sincronização...");
verificarFirebaseComTimeout();

console.log("✅ sync.js iniciado com sucesso");

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
        if (firebase.apps.length === 0) {
            firebase.initializeApp(config);
            console.log("🔧 Firebase.initializeApp() chamado");
        }
        
        db = firebase.database();
        dadosRef = db.ref("controle-atividade/dados");

        console.log("✅ Firebase inicializado com sucesso!");

        // Carregar dados ao iniciar
        carregarDadosInicial();

        // Listener para sincronização em tempo real
        dadosRef.on('value', (snapshot) => {
            const dados = snapshot.val();
            console.log("🔔 Dados do Firebase recebidos:", dados);

            if (dados && dados.atividadesEmAndamento) {
                // Atualizar localStorage
                localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento || []));
                localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
                localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState || {}));

                // Atualizar variáveis globais (SEM sobrescrever se forem as mesmas)
                if (JSON.stringify(window.atividadesEmAndamento) !== JSON.stringify(dados.atividadesEmAndamento)) {
                    // Preservar timers
                    dados.atividadesEmAndamento = (dados.atividadesEmAndamento || []).map(novaAtiv => {
                        const atualAtiv = (window.atividadesEmAndamento || []).find(a => a.id === novaAtiv.id);
                        return {
                            ...novaAtiv,
                            intervaloTimer: atualAtiv ? atualAtiv.intervaloTimer : null
                        };
                    });

                    window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
                    window.atividades = dados.atividades || [];
                    window.kanbanState = dados.kanbanState || {};

                    // Atualizar interface APENAS se os dados mudarem
                    if (typeof window.atualizarTabela === 'function') {
                        try { window.atualizarTabela(); } catch (e) { console.error("Erro ao atualizar tabela:", e); }
                    }
                    if (typeof window.atualizarKanban === 'function') {
                        try { window.atualizarKanban(); } catch (e) { console.error("Erro ao atualizar kanban:", e); }
                    }

                    console.log("✅ Interface atualizada");
                }
            }
        }, (error) => {
            console.error("❌ Erro no listener:", error);
        });

        console.log("✅ Listener ativo!");

    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
    }
}

// Carregar dados iniciais
function carregarDadosInicial() {
    dadosRef.once('value', (snapshot) => {
        const dados = snapshot.val();
        if (dados && dados.atividadesEmAndamento) {
            console.log("✅ Dados carregados do Firebase ao iniciar");
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

            // Enviar dados do localStorage para Firebase
            if (window.atividadesEmAndamento.length > 0 || window.atividades.length > 0) {
                console.log("📤 Enviando dados do localStorage para Firebase");
                const dados = {
                    atividadesEmAndamento: window.atividadesEmAndamento,
                    atividades: window.atividades,
                    kanbanState: window.kanbanState,
                    ultimaAtualizacao: new Date().toISOString(),
                    computador: window.location.hostname || 'desconhecido'
                };
                dadosRef.set(dados).catch(error => {
                    console.error("❌ Erro ao enviar dados do localStorage:", error);
                });
            }
        }
    });
}

// Função para salvar no Firebase (chamada pelo index.html)
window.salvarNoFirebase = async function() {
    if (!dadosRef) {
        console.warn("⚠️ Firebase não está inicializado, saltando salvar");
        return;
    }

    try {
        const dados = {
            atividadesEmAndamento: window.atividadesEmAndamento || [],
            atividades: window.atividades || [],
            kanbanState: window.kanbanState || {},
            ultimaAtualizacao: new Date().toISOString(),
            computador: window.location.hostname || 'desconhecido'
        };

        console.log("📤 Salvando no Firebase:", {
            emAndamento: dados.atividadesEmAndamento.length,
            atividades: dados.atividades.length
        });

        await dadosRef.set(dados);
        console.log("✅ Dados salvos no Firebase com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao salvar no Firebase:", error);
    }
};

// Iniciar verificação
verificarFirebase();

console.log("✅ sync.js iniciado com sucesso");

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
        
        db = firebase.database();
        dadosRef = db.ref("controle-atividade/dados");

        console.log("✅ Firebase inicializado com sucesso!");

        // Carregar dados ao iniciar
        carregarDadosInicial();

        // Listener para sincronização em tempo real
        dadosRef.on('value', (snapshot) => {
            const dados = snapshot.val();
            console.log("🔔 Dados do Firebase recebidos:", dados);

            if (dados && dados.atividadesEmAndamento) {
                // Atualizar localStorage
                localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento || []));
                localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
                localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState || {}));

                // Atualizar variáveis globais (SEM sobrescrever se forem as mesmas)
                if (JSON.stringify(window.atividadesEmAndamento) !== JSON.stringify(dados.atividadesEmAndamento)) {
                    // Preservar timers
                    dados.atividadesEmAndamento = (dados.atividadesEmAndamento || []).map(novaAtiv => {
                        const atualAtiv = (window.atividadesEmAndamento || []).find(a => a.id === novaAtiv.id);
                        return {
                            ...novaAtiv,
                            intervaloTimer: atualAtiv ? atualAtiv.intervaloTimer : null
                        };
                    });

                    window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
                    window.atividades = dados.atividades || [];
                    window.kanbanState = dados.kanbanState || {};

                    // Atualizar interface APENAS se os dados mudarem
                    if (typeof window.atualizarTabela === 'function') {
                        try { window.atualizarTabela(); } catch (e) { console.error("Erro ao atualizar tabela:", e); }
                    }
                    if (typeof window.atualizarKanban === 'function') {
                        try { window.atualizarKanban(); } catch (e) { console.error("Erro ao atualizar kanban:", e); }
                    }

                    console.log("✅ Interface atualizada");
                }
            }
        }, (error) => {
            console.error("❌ Erro no listener:", error);
        });

        console.log("✅ Listener ativo!");

    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
    }
}

// Carregar dados iniciais
function carregarDadosInicial() {
    dadosRef.once('value', (snapshot) => {
        const dados = snapshot.val();
        if (dados && dados.atividadesEmAndamento) {
            console.log("✅ Dados carregados do Firebase ao iniciar");
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

            // Enviar dados do localStorage para Firebase
            if (window.atividadesEmAndamento.length > 0 || window.atividades.length > 0) {
                console.log("📤 Enviando dados do localStorage para Firebase");
                const dados = {
                    atividadesEmAndamento: window.atividadesEmAndamento,
                    atividades: window.atividades,
                    kanbanState: window.kanbanState,
                    ultimaAtualizacao: new Date().toISOString(),
                    computador: window.location.hostname || 'desconhecido'
                };
                dadosRef.set(dados).catch(error => {
                    console.error("❌ Erro ao enviar dados do localStorage:", error);
                });
            }
        }
    });
}

// Função para salvar no Firebase (chamada pelo index.html)
window.salvarNoFirebase = async function() {
    if (!dadosRef) {
        console.warn("⚠️ Firebase não está inicializado, saltando salvar");
        return;
    }

    try {
        const dados = {
            atividadesEmAndamento: window.atividadesEmAndamento || [],
            atividades: window.atividades || [],
            kanbanState: window.kanbanState || {},
            ultimaAtualizacao: new Date().toISOString(),
            computador: window.location.hostname || 'desconhecido'
        };

        console.log("📤 Salvando no Firebase:", {
            emAndamento: dados.atividadesEmAndamento.length,
            atividades: dados.atividades.length
        });

        await dadosRef.set(dados);
        console.log("✅ Dados salvos no Firebase com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao salvar no Firebase:", error);
    }
};

// Iniciar verificação
verificarFirebase();

console.log("✅ sync.js iniciado com sucesso");

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
        
        db = firebase.database();
        dadosRef = db.ref("controle-atividade/dados");

        console.log("✅ Firebase inicializado com sucesso!");

        // Carregar dados ao iniciar
        carregarDadosInicial();

        // Listener para sincronização em tempo real
        dadosRef.on('value', (snapshot) => {
            const dados = snapshot.val();
            console.log("🔔 Dados do Firebase recebidos:", dados);

            if (dados && dados.atividadesEmAndamento) {
                // Atualizar localStorage
                localStorage.setItem('atividadesEmAndamento', JSON.stringify(dados.atividadesEmAndamento || []));
                localStorage.setItem('atividades', JSON.stringify(dados.atividades || []));
                localStorage.setItem('kanbanState', JSON.stringify(dados.kanbanState || {}));

                // Atualizar variáveis globais (SEM sobrescrever se forem as mesmas)
                if (JSON.stringify(window.atividadesEmAndamento) !== JSON.stringify(dados.atividadesEmAndamento)) {
                    // Preservar timers
                    dados.atividadesEmAndamento = (dados.atividadesEmAndamento || []).map(novaAtiv => {
                        const atualAtiv = (window.atividadesEmAndamento || []).find(a => a.id === novaAtiv.id);
                        return {
                            ...novaAtiv,
                            intervaloTimer: atualAtiv ? atualAtiv.intervaloTimer : null
                        };
                    });

                    window.atividadesEmAndamento = dados.atividadesEmAndamento || [];
                    window.atividades = dados.atividades || [];
                    window.kanbanState = dados.kanbanState || {};

                    // Atualizar interface APENAS se os dados mudarem
                    if (typeof window.atualizarTabela === 'function') {
                        try { window.atualizarTabela(); } catch (e) { console.error("Erro ao atualizar tabela:", e); }
                    }
                    if (typeof window.atualizarKanban === 'function') {
                        try { window.atualizarKanban(); } catch (e) { console.error("Erro ao atualizar kanban:", e); }
                    }

                    console.log("✅ Interface atualizada");
                }
            }
        }, (error) => {
            console.error("❌ Erro no listener:", error);
        });

        console.log("✅ Listener ativo!");

    } catch (error) {
        console.error("❌ Erro ao inicializar Firebase:", error);
    }
}

// Carregar dados iniciais
function carregarDadosInicial() {
    dadosRef.once('value', (snapshot) => {
        const dados = snapshot.val();
        if (dados && dados.atividadesEmAndamento) {
            console.log("✅ Dados carregados do Firebase ao iniciar");
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

            // Enviar dados do localStorage para Firebase
            if (window.atividadesEmAndamento.length > 0 || window.atividades.length > 0) {
                console.log("📤 Enviando dados do localStorage para Firebase");
                const dados = {
                    atividadesEmAndamento: window.atividadesEmAndamento,
                    atividades: window.atividades,
                    kanbanState: window.kanbanState,
                    ultimaAtualizacao: new Date().toISOString(),
                    computador: window.location.hostname || 'desconhecido'
                };
                dadosRef.set(dados).catch(error => {
                    console.error("❌ Erro ao enviar dados do localStorage:", error);
                });
            }
        }
    });
}

// Função para salvar no Firebase (chamada pelo index.html)
window.salvarNoFirebase = async function() {
    if (!dadosRef) {
        console.warn("⚠️ Firebase não está inicializado, saltando salvar");
        return;
    }

    try {
        const dados = {
            atividadesEmAndamento: window.atividadesEmAndamento || [],
            atividades: window.atividades || [],
            kanbanState: window.kanbanState || {},
            ultimaAtualizacao: new Date().toISOString(),
            computador: window.location.hostname || 'desconhecido'
        };

        console.log("📤 Salvando no Firebase:", {
            emAndamento: dados.atividadesEmAndamento.length,
            atividades: dados.atividades.length
        });

        await dadosRef.set(dados);
        console.log("✅ Dados salvos no Firebase com sucesso!");

    } catch (error) {
        console.error("❌ Erro ao salvar no Firebase:", error);
    }
};

// Iniciar verificação
verificarFirebase();

console.log("✅ sync.js iniciado com sucesso");
