// ================================================================
// 🔐 GERENCIAMENTO DE AUTENTICAÇÃO COM FIREBASE
// ================================================================

let usuarioAtual = null;

/**
 * Inicializar autenticação e redirecionar se não estiver logado
 * Use esta função nas páginas que requerem autenticação
 */
function inicializarAutenticacao() {
    if (!window.auth) {
        console.error('Firebase Auth não inicializado');
        return;
    }

    verificarAutenticacao();
}

/**
 * Verificar estado de autenticação do usuário
 */
function verificarAutenticacao() {
    window.auth.onAuthStateChanged(user => {
        if (user) {
            usuarioAtual = {
                uid: user.uid,
                email: user.email,
                nome: user.displayName || 'Usuário',
                emailVerificado: user.emailVerified
            };
            
            console.log('Usuário autenticado:', usuarioAtual.email);
            
            // Chamar callback se existir
            if (typeof onUsuarioAutenticado === 'function') {
                onUsuarioAutenticado(usuarioAtual);
            }
        } else {
            console.warn('Usuário não autenticado. Redirecionando para login...');
            // Redirecionar para login
            window.location.href = 'login.html';
        }
    });
}

/**
 * Fazer logout do usuário
 */
function fazerLogout() {
    if (confirm('Tem certeza que deseja sair?')) {
        auth.signOut()
            .then(() => {
                console.log('✅ Logout realizado');
                usuarioAtual = null;
                window.location.href = 'login.html';
            })
            .catch(error => {
                console.error('❌ Erro ao fazer logout:', error);
            });
    }
}

/**
 * Obter usuário atualmente autenticado
 */
function obterUsuarioAtual() {
    return usuarioAtual;
}

/**
 * Obter token de autenticação (útil para chamadas de API)
 */
async function obterTokenAutenticacao() {
    if (auth && auth.currentUser) {
        return await auth.currentUser.getIdToken();
    }
    return null;
}

/**
 * Atualizar perfil do usuário
 */
function atualizarPerfilUsuario(dados) {
    if (!auth.currentUser) {
        console.error('❌ Nenhum usuário autenticado');
        return;
    }

    const updates = {};
    
    if (dados.nome) {
        updates.displayName = dados.nome;
    }
    if (dados.fotoPerfil) {
        updates.photoURL = dados.fotoPerfil;
    }

    return auth.currentUser.updateProfile(updates)
        .then(() => {
            if (dados.nome) {
                usuarioAtual.nome = dados.nome;
            }
            console.log('✅ Perfil atualizado');
            return true;
        })
        .catch(error => {
            console.error('❌ Erro ao atualizar perfil:', error);
            return false;
        });
}

/**
 * Mudar senha do usuário
 */
function mudarSenha(senhaAtual, senhaNova) {
    if (!auth.currentUser) {
        console.error('❌ Nenhum usuário autenticado');
        return Promise.reject('Usuário não autenticado');
    }

    // Primeiro, fazer re-autenticação com a senha atual
    const credential = firebase.auth.EmailAuthProvider.credential(
        auth.currentUser.email,
        senhaAtual
    );

    return auth.currentUser.reauthenticateWithCredential(credential)
        .then(() => {
            return auth.currentUser.updatePassword(senhaNova);
        })
        .then(() => {
            console.log('✅ Senha alterada com sucesso');
            return true;
        })
        .catch(error => {
            console.error('❌ Erro ao mudar senha:', error);
            if (error.code === 'auth/wrong-password') {
                throw new Error('Senha atual incorreta');
            }
            throw error;
        });
}

/**
 * Resetar senha por email
 */
function resetarSenhaEmail(email) {
    if (!auth) {
        console.error('❌ Firebase Auth não inicializado');
        return Promise.reject('Firebase não configurado');
    }

    return auth.sendPasswordResetEmail(email)
        .then(() => {
            console.log('✅ Email de resetar senha enviado');
            return true;
        })
        .catch(error => {
            console.error('❌ Erro ao enviar email de reset:', error);
            if (error.code === 'auth/user-not-found') {
                throw new Error('Email não encontrado');
            }
            throw error;
        });
}

/**
 * Adicionar campo rastreamento de usuário em atividade
 * Use ao criar/salvar atividades
 */
function adicionarRastreamentoUsuario(atividade) {
    if (!usuarioAtual) {
        console.warn('⚠️ Usuário não autenticado, não é possível rastrear');
        return atividade;
    }

    return {
        ...atividade,
        usuario_id: usuarioAtual.uid,
        email_usuario: usuarioAtual.email,
        nome_usuario: usuarioAtual.nome,
        data_criacao: new Date().toISOString(),
        data_atualizacao: new Date().toISOString()
    };
}

/**
 * Adicionar widget de usuário no topo da página
 * Use após inicializarAutenticacao()
 */
function criarWidgetUsuario(containerId = 'usuarioWidget') {
    if (!usuarioAtual) {
        console.warn('⚠️ Usuário não autenticado');
        return;
    }

    const container = document.getElementById(containerId);
    if (!container) {
        console.warn('⚠️ Container não encontrado:', containerId);
        return;
    }

    const widget = document.createElement('div');
    widget.innerHTML = `
        <style>
            .usuario-widget {
                position: fixed;
                top: 10px;
                right: 20px;
                background: white;
                border-radius: 8px;
                padding: 8px 12px;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                z-index: 999;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                min-width: 180px;
            }

            .usuario-widget-nome {
                font-weight: 600;
                font-size: 0.9em;
                color: #2c3e50;
                margin: 0 0 1px 0;
                padding: 0;
                line-height: 1.1;
            }

            .usuario-widget-email {
                font-size: 0.75em;
                color: #5b8ec6;
                margin: 0 0 6px 0;
                padding: 0;
                line-height: 1.1;
                word-break: break-word;
            }

            .usuario-widget-divider {
                height: 1px;
                background: #e0e0e0;
                margin: 6px 0;
            }

            .usuario-widget-btn {
                padding: 6px 10px;
                font-size: 0.75em;
                background: #ff6b6b;
                color: white;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                font-weight: 600;
                width: 100%;
                transition: all 0.2s ease;
            }

            .usuario-widget-btn:hover {
                background: #ff5252;
                box-shadow: 0 2px 8px rgba(255, 107, 107, 0.3);
                transform: translateY(-1px);
            }

            .usuario-widget-btn:active {
                transform: translateY(0);
            }

            @media (max-width: 768px) {
                .usuario-widget {
                    top: 8px;
                    right: 15px;
                    min-width: 160px;
                    padding: 7px 10px;
                }

                .usuario-widget-nome {
                    font-size: 0.85em;
                }

                .usuario-widget-email {
                    font-size: 0.7em;
                    margin: 0 0 5px 0;
                }

                .usuario-widget-btn {
                    padding: 5px 8px;
                    font-size: 0.7em;
                }

                .usuario-widget-divider {
                    margin: 5px 0;
                }
            }

            @media (max-width: 480px) {
                .usuario-widget {
                    top: 5px;
                    right: 10px;
                    min-width: 150px;
                    padding: 6px 9px;
                }

                .usuario-widget-nome {
                    font-size: 0.8em;
                }

                .usuario-widget-email {
                    font-size: 0.65em;
                    margin: 0 0 4px 0;
                }

                .usuario-widget-btn {
                    padding: 4px 7px;
                    font-size: 0.65em;
                }

                .usuario-widget-divider {
                    margin: 4px 0;
                }
            }
        </style>
        <div class="usuario-widget">
            <p class="usuario-widget-nome">${usuarioAtual.nome}</p>
            <p class="usuario-widget-email">${usuarioAtual.email}</p>
            <div class="usuario-widget-divider"></div>
            <button onclick="fazerLogout()" class="usuario-widget-btn">Sair</button>
        </div>
    `;
    container.appendChild(widget);
}

/**
 * Verificar permissões específicas de usuário (pode ser expandido)
 */
function temPermissao(permissao) {
    if (!usuarioAtual) return false;
    
    // Aqui você pode adicionar lógica de permissões mais complexa
    // Por enquanto, retorna true para todos os usuários autenticados
    return true;
}

/**
 * Listar todos os usuários (apenas para admin)
 * Requer regras de segurança apropriadas no Firebase
 */
async function listarUsuarios() {
    if (!db || !usuarioAtual) {
        console.error('❌ Firebase DB não inicializado');
        return [];
    }

    try {
        const snapshot = await db.ref('usuarios').once('value');
        const usuarios = [];
        snapshot.forEach(child => {
            usuarios.push({
                id: child.key,
                ...child.val()
            });
        });
        return usuarios;
    } catch (error) {
        console.error('❌ Erro ao listar usuários:', error);
        return [];
    }
}

/**
 * Obter dados do usuário no banco de dados
 */
async function obterDadosUsuario(uid = null) {
    if (!db) {
        console.error('❌ Firebase DB não inicializado');
        return null;
    }

    const userId = uid || usuarioAtual?.uid;
    if (!userId) {
        console.error('❌ UID não fornecido e usuário não autenticado');
        return null;
    }

    try {
        const snapshot = await db.ref(`usuarios/${userId}`).once('value');
        return snapshot.val();
    } catch (error) {
        console.error('❌ Erro ao obter dados do usuário:', error);
        return null;
    }
}

/**
 * Atualizar dados do usuário no banco de dados
 */
async function atualizarDadosUsuario(dados) {
    if (!db || !usuarioAtual) {
        console.error('❌ Firebase DB não inicializado ou usuário não autenticado');
        return false;
    }

    try {
        await db.ref(`usuarios/${usuarioAtual.uid}`).update({
            ...dados,
            data_atualizacao: new Date().toISOString()
        });
        console.log('✅ Dados do usuário atualizados');
        return true;
    } catch (error) {
        console.error('❌ Erro ao atualizar dados do usuário:', error);
        return false;
    }
}
