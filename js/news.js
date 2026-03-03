import { Utils } from './utils.js';
import { CONFIG } from './config.js';

export const News = {
    // Busca os conteúdos da API do TabNews seguindo a estratégia 'relevant' ou 'new'
    async fetchNews(strategy = 'relevant', perPage = 50) {
        try {
            const response = await fetch(`${CONFIG.TABNEWS_API_BASE}?strategy=${strategy}&per_page=${perPage}`);
            if (!response.ok) throw new Error('Erro na API');
            return await response.json();
        } catch (error) {
            console.error('Error fetching news:', error);
            throw error;
        }
    },

    // Busca um artigo específico pelo username e pelo slug (identificador do post)
    async fetchArticle(username, slug) {
        try {
            const response = await fetch(`${CONFIG.TABNEWS_API_BASE}/${username}/${slug}`);
            if (!response.ok) throw new Error('Erro na API');
            return await response.json();
        } catch (error) {
            console.error('Error fetching article:', error);
            throw error;
        }
    },

    // Filtra localmente os artigos carregados consoante o input de pesquisa
    filter(articles, query) {
        if (!query) return articles;
        const lowerQuery = query.toLowerCase();
        return articles.filter(item =>
            item.title.toLowerCase().includes(lowerQuery) ||
            (item.slug && item.slug.includes(lowerQuery))
        );
    }
};
