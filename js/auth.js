import { CONFIG } from './config.js';

// Inicializa o cliente do Supabase com o URL e a chave anónima do projeto
const supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

export const Auth = {
    client: supabaseClient,

    // Função para registar um novo utilizador
    async signUp(email, password) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
        });
        return { data, error };
    },

    // Função para autenticar um utilizador existente
    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    // Função para encerrar a sessão atual
    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        return { error };
    },

    // Obtém o utilizador se existir uma sessão ativa
    async getCurrentUser() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session?.user || null;
    },

    // Permite "ouvir" as mudanças de estado da autenticação (ex: login efetuado, logout)
    onAuthStateChange(callback) {
        return supabaseClient.auth.onAuthStateChange(callback);
    }
};
