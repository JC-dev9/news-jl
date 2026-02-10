import { Auth } from './auth.js';
import { Utils } from './utils.js';

export const Comments = {
    async fetchComments(slug) {
        const { data: comments, error } = await Auth.client
            .from('comments')
            .select('*')
            .eq('article_slug', slug)
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching comments:', error);
            throw error;
        }
        return this.buildTree(comments);
    },

    buildTree(flatComments) {
        if (!flatComments) return [];
        const map = {};
        const roots = [];

        flatComments.forEach(c => {
            c.children = [];
            map[c.id] = c;
        });

        flatComments.forEach(c => {
            if (c.parent_id && map[c.parent_id]) {
                map[c.parent_id].children.push(c);
            } else {
                roots.push(c);
            }
        });

        return roots;
    },

    async postComment(slug, content, parentId = null) {
        const user = await Auth.getCurrentUser();
        if (!user) throw new Error('User not logged in');

        const { data, error } = await Auth.client.from('comments').insert({
            content: content,
            user_id: user.id,
            user_email: user.email,
            article_slug: slug,
            parent_id: parentId
        });

        if (error) throw error;
        return data;
    }
};
