import { Auth } from './auth.js';

window.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('registerForm');
    form.addEventListener('submit', handleRegister);
});

async function handleRegister(e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const errorMsg = document.getElementById('errorMsg');

    if (password !== confirmPassword) {
        errorMsg.textContent = 'Senhas não conferem.';
        errorMsg.classList.remove('hidden');
        return;
    }

    try {
        const { error } = await Auth.signUp(email, password);
        if (error) throw error;
        alert('Cadastro realizado com sucesso! Faça login.');
        window.location.href = 'login.html';
    } catch (error) {
        console.error(error);
        if (error.message.includes('rate limit')) {
            errorMsg.textContent = 'Muitas tentativas. Tente novamente em alguns minutos.';
        } else if (error.message.includes('already registered')) {
            errorMsg.textContent = 'Este email já está cadastrado.';
        } else {
            errorMsg.textContent = 'Erro ao cadastrar: ' + error.message;
        }
        errorMsg.classList.remove('hidden');
    }
}
