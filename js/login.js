import { Auth } from './auth.js';

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    form.addEventListener('submit', handleLogin);
});

async function handleLogin(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorMsg = document.getElementById('errorMsg');

    try {
        const { error } = await Auth.signIn(email, password);
        if (error) throw error;
        window.location.href = 'index.html';
    } catch (error) {
        console.error(error);
        if (error.message.includes('Invalid login credentials')) {
            errorMsg.textContent = 'Email ou senha incorretos.';
        } else {
            errorMsg.textContent = 'Erro ao entrar: ' + error.message;
        }
        errorMsg.classList.remove('hidden');
    }
}
