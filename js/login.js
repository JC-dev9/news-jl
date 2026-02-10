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
        errorMsg.textContent = 'Erro: ' + error.message;
        errorMsg.classList.remove('hidden');
    }
}
