const API_BASE = 'https://www.tabnews.com.br/api/v1/contents';

// Variável global para guardar as notícias carregadas
let allContents = []; 

// 1. Carregar conteúdo ao iniciar a página
window.onload = async () => {
    const resultsArea = document.getElementById('resultsArea');
    
    try {
        // Buscando as 50 notícias mais relevantes (strategy=relevant)
        // Ou use strategy=new para as mais recentes
        const response = await fetch(`${API_BASE}?strategy=relevant&per_page=50`, {
             method: 'GET',
             headers: {
                 'Content-Type': 'application/json'
                 // Se tivesse chave real, seria aqui: 'Authorization': '...'
             }
        });

        if (!response.ok) throw new Error('Erro na API');

        allContents = await response.json();
        renderList(allContents); // Exibe tudo inicialmente

    } catch (error) {
        console.error(error);
        resultsArea.innerHTML = '<p>Erro ao carregar notícias do TabNews.</p>';
    }
};

// 2. Função de Filtro (Simulando a busca)
function filterContent() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    
    // Filtra o array que já baixamos
    const filtered = allContents.filter(item => 
        item.title.toLowerCase().includes(query) || 
        (item.slug && item.slug.includes(query))
    );

    renderList(filtered);
}

// 3. Renderiza a lista na tela
function renderList(items) {
    const resultsArea = document.getElementById('resultsArea');
    resultsArea.innerHTML = '';

    if (items.length === 0) {
        resultsArea.innerHTML = '<p>Nenhum conteúdo encontrado com esse termo.</p>';
        return;
    }

    items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';
        
        // Tabcoins e comentários
        const tabcoins = item.tabcoins || 0;
        const comments = item.children_deep_count || 0;

        card.innerHTML = `
            <span class="tag-badge">TabNews</span>
            <h3>${item.title}</h3>
            <div class="meta">
                👤 <strong>${item.owner_username}</strong> 
                • 📅 ${new Date(item.published_at).toLocaleDateString()}
                • ⭐ ${tabcoins} TabCoins
                • 💬 ${comments} comentários
            </div>
        `;

        // Passamos user e slug para buscar o detalhe
        card.onclick = () => loadFullArticle(item.owner_username, item.slug);
        
        resultsArea.appendChild(card);
    });
}

// 4. Carrega o Artigo Completo (Markdown - HTML)
async function loadFullArticle(username, slug) {
    const resultsArea = document.getElementById('resultsArea');
    const detailsArea = document.getElementById('detailsArea');
    const contentArea = document.getElementById('articleContent');

    resultsArea.classList.add('hidden');
    detailsArea.classList.remove('hidden');
    contentArea.innerHTML = '<p>Carregando conteúdo...</p>';

    try {
        // Endpoint para pegar o conteúdo completo (body)
        const response = await fetch(`${API_BASE}/${username}/${slug}`);
        const article = await response.json();

        // CONVERTER MARKDOWN PARA HTML USANDO A BIBLIOTECA 'marked'
        const htmlContent = marked.parse(article.body || '*Sem conteúdo de texto.*');

        contentArea.innerHTML = `
            <h1>${article.title}</h1>
            <div class="meta" style="margin-bottom: 20px; padding-bottom:10px; border-bottom:1px solid #eee">
                Publicado por <strong>${article.owner_username}</strong> em ${new Date(article.published_at).toLocaleString()}
            </div>
            
            <div class="markdown-body">
                ${htmlContent}
            </div>
            
            <br><br>
            <a href="https://www.tabnews.com.br/${username}/${slug}" target="_blank" style="color:#2563eb">
                Ver discussão original no TabNews ↗
            </a>
        `;

    } catch (error) {
        contentArea.innerHTML = '<p>Erro ao carregar detalhes.</p>';
    }
}

function closeDetails() {
    document.getElementById('detailsArea').classList.add('hidden');
    document.getElementById('resultsArea').classList.remove('hidden');
}