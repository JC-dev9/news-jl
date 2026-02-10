import { Auth } from './auth.js';
import { News } from './news.js';
import { Comments } from './comments.js';
import { Utils } from './utils.js';
import { Theme } from './theme.js';

// Estado Global
let allContents = [];
let currentSlug = null;

// Inicialização
window.addEventListener('DOMContentLoaded', async () => {
    Theme.init();
    await initAuthUI();
    await loadNews();

    // Listeners de eventos globais
    document.getElementById('searchBtn').addEventListener('click', filterContent);
    document.getElementById('searchInput').addEventListener('keyup', (e) => {
        if (e.key === 'Enter') filterContent();
    });

    const backBtn = document.getElementById('backBtn');
    if (backBtn) {
        backBtn.addEventListener('click', closeDetails);
    } else {
        // Fallback: try to find it by class if ID is missing or dynamic
        const dynamicBackBtn = document.querySelector('.back-btn');
        if (dynamicBackBtn) dynamicBackBtn.addEventListener('click', closeDetails);
    }

    const postCommentBtn = document.getElementById('postCommentBtn');
    if (postCommentBtn) {
        console.log('Attaching click listener to postCommentBtn');
        postCommentBtn.addEventListener('click', handlePostComment);
    } else {
        console.error('postCommentBtn not found!');
    }

    window.loadFullArticle = loadFullArticle; // Expõe para onclick do card
    window.showReplyBox = showReplyBox;
    window.postReply = postReply;
    window.logout = handleLogout;
});

// UI & Lógica

async function initAuthUI() {
    const user = await Auth.getCurrentUser();
    updateHeaderUI(user);

    Auth.onAuthStateChange((event, session) => {
        updateHeaderUI(session?.user);
    });
}

function updateHeaderUI(user) {
    const userSection = document.getElementById('userSection');
    const commentFormArea = document.getElementById('commentFormArea');
    const loginWarning = document.getElementById('loginWarning');

    if (user) {
        userSection.innerHTML = `
            <div class="user-display">
                <i class="ph ph-user"></i>
                <span>${user.email}</span>
                <button id="logoutBtn" onclick="logout()" class="btn btn-outline" style="font-size:0.8rem">Sair</button>
            </div>
        `;
        if (commentFormArea) commentFormArea.classList.remove('hidden');
        if (loginWarning) loginWarning.classList.add('hidden');
    } else {
        userSection.innerHTML = `
            <a href="login.html" class="btn btn-secondary">Entrar</a>
            <a href="register.html" class="btn btn-outline">Registrar</a>
        `;
        if (commentFormArea) commentFormArea.classList.add('hidden');
        if (loginWarning) loginWarning.classList.remove('hidden');
    }
}

async function handleLogout() {
    await Auth.signOut();
    window.location.reload();
}

async function loadNews() {
    const resultsArea = document.getElementById('resultsArea');
    resultsArea.innerHTML = '<p class="loading">Carregando conteúdos...</p>';
    try {
        allContents = await News.fetchNews();
        renderList(allContents);
    } catch (error) {
        resultsArea.innerHTML = '<p>Erro ao carregar notícias.</p>';
    }
}

function filterContent() {
    const query = document.getElementById('searchInput').value;
    const filtered = News.filter(allContents, query);
    renderList(filtered);
}

function renderList(items) {
    const resultsArea = document.getElementById('resultsArea');
    resultsArea.innerHTML = '';

    if (items.length === 0) {
        resultsArea.innerHTML = '<p>Nenhum conteúdo encontrado.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
            <span class="tag-badge">TabNews</span>
            <h3>${item.title}</h3>
            <div class="meta">
                <span><i class="ph ph-user"></i> ${item.owner_username}</span>
                <span><i class="ph ph-calendar"></i> ${Utils.formatDate(item.published_at)}</span>
                <span><i class="ph ph-coins"></i> ${item.tabcoins || 0}</span>
                <span><i class="ph ph-chat-circle"></i> ${item.children_deep_count || 0}</span>
            </div>
        `;
        card.onclick = () => loadFullArticle(item.owner_username, item.slug);
        resultsArea.appendChild(card);
    });
}

async function loadFullArticle(username, slug) {
    currentSlug = slug;
    const resultsArea = document.getElementById('resultsArea');
    const detailsArea = document.getElementById('detailsArea');
    const contentArea = document.getElementById('articleContent');
    const commentsList = document.getElementById('commentsList');

    resultsArea.classList.add('hidden');
    detailsArea.classList.remove('hidden');
    contentArea.innerHTML = '<p>Carregando conteúdo...</p>';
    commentsList.innerHTML = '<p>Carregando comentários...</p>';

    try {
        const article = await News.fetchArticle(username, slug);
        const htmlContent = marked.parse(article.body || '*Sem conteúdo de texto.*');

        contentArea.innerHTML = `
            <h1>${article.title}</h1>
            <div class="meta" style="margin-bottom: 20px; padding-bottom:10px; border-bottom:1px solid #eee">
                Publicado por <strong>${article.owner_username}</strong>
            </div>
            <div class="markdown-body">${htmlContent}</div>
            <br>
            <a href="https://www.tabnews.com.br/${username}/${slug}" target="_blank" style="color:#2563eb; font-size:0.9rem">
                Ver no TabNews oficial ↗
            </a>
        `;

        await loadComments(slug);

    } catch (error) {
        contentArea.innerHTML = '<p>Erro ao carregar detalhes.</p>';
    }
}

function closeDetails() {
    document.getElementById('detailsArea').classList.add('hidden');
    document.getElementById('resultsArea').classList.remove('hidden');
    currentSlug = null;
    window.scrollTo(0, 0); // Reset scroll
}

// UI de Comentários

async function loadComments(slug) {
    const commentsList = document.getElementById('commentsList');
    try {
        const tree = await Comments.fetchComments(slug);
        commentsList.innerHTML = '';
        if (tree.length === 0) {
            commentsList.innerHTML = '<p style="color:#666">Seja o primeiro a comentar!</p>';
        } else {
            renderCommentsRecursive(tree, commentsList);
        }
    } catch (error) {
        commentsList.innerHTML = '<p>Erro ao carregar comentários.</p>';
    }
}

function renderCommentsRecursive(comments, container) {
    comments.forEach(c => {
        const div = document.createElement('div');
        div.className = 'comment-item';
        const author = c.user_email ? c.user_email.split('@')[0] : `Usuário ...${c.user_id.slice(-4)}`;
        div.innerHTML = `
            <div class="comment-header">
                <strong>${author}</strong>
                <span>${Utils.formatDate(c.created_at)}</span>
            </div>
            <div class="comment-body">${Utils.escapeHtml(c.content)}</div>
            <button onclick="showReplyBox('${c.id}')" class="reply-btn">Responder</button>
            <div id="reply-box-${c.id}" class="hidden reply-input-area"></div>
        `;

        if (c.children && c.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'replies-container';
            renderCommentsRecursive(c.children, childrenContainer);
            div.appendChild(childrenContainer);
        }
        container.appendChild(div);
    });
}

async function handlePostComment() {
    console.log('handlePostComment called');
    const input = document.getElementById('commentInput');
    const content = input.value.trim();
    console.log('Content:', content);
    if (!content) {
        console.log('Content is empty');
        return;
    }

    try {
        await Comments.postComment(currentSlug, content);
        input.value = '';
        await loadComments(currentSlug);
    } catch (error) {
        console.error('Error posting comment:', error);
        alert('Erro ao comentar. Verifique se está logado.');
    }
}

// Exposto para window para onclicks inline no HTML gerado
function showReplyBox(commentId) {
    const box = document.getElementById(`reply-box-${commentId}`);
    if (box.innerHTML === '') {
        box.innerHTML = `
            <textarea id="reply-input-${commentId}" 
                style="width:100%; height:60px; margin-bottom:5px; padding:5px;" 
                placeholder="Sua resposta..."></textarea>
            <button onclick="postReply('${commentId}')" class="primary-btn" style="font-size:0.8rem">Enviar</button>
            <button onclick="this.parentElement.innerHTML=''" class="back-btn" style="font-size:0.8rem; margin:0">Cancelar</button>
        `;
        box.classList.remove('hidden');
    } else {
        box.innerHTML = '';
    }
}

// Exposto para window para onclicks inline no HTML gerado
window.showReplyBox = showReplyBox;
window.postReply = postReply;
window.logout = handleLogout; // Expondo logout explicitamente

async function postReply(parentId) {
    const input = document.getElementById(`reply-input-${parentId}`);
    const content = input.value.trim();
    if (!content) return;

    try {
        await Comments.postComment(currentSlug, content, parentId);
        await loadComments(currentSlug);
    } catch (error) {
        alert('Erro ao responder.');
    }
}
