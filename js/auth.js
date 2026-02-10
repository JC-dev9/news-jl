import { CONFIG } from './config.js';

const supabaseClient = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);

export const Auth = {
    client: supabaseClient,

    async signUp(email, password) {
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
        });
        return { data, error };
    },

    async signIn(email, password) {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
            email,
            password,
        });
        return { data, error };
    },

    async signOut() {
        const { error } = await supabaseClient.auth.signOut();
        return { error };
    },

    async getCurrentUser() {
        const { data: { session } } = await supabaseClient.auth.getSession();
        return session?.user || null;
    },

    onAuthStateChange(callback) {
        return supabaseClient.auth.onAuthStateChange(callback);
    }
};
