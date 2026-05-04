const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_URL = 'http://localhost:8000/api';

function requireAuth(req, res, next) {
    if (!req.session.user) return res.redirect('/auth/login');
    next();
}

function authHeaders(req) {
    return { headers: { Authorization: `Bearer ${req.session.accessToken}` } };
}

router.get('/', async (req, res) => {
    try {
        const { data } = await axios.get(`${API_URL}/posts/`);
        res.render('posts/index', { posts: data, error: null });
    } catch {
        res.render('posts/index', { posts: [], error: '게시글을 불러올 수 없습니다.' });
    }
});

router.get('/new', requireAuth, (req, res) => {
    res.render('posts/new', { error: null });
});

router.post('/', requireAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        await axios.post(`${API_URL}/posts/`, { title, content }, authHeaders(req));
        res.redirect('/posts');
    } catch {
        res.render('posts/new', { error: '게시글 작성에 실패했습니다.' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { data } = await axios.get(`${API_URL}/posts/${req.params.id}/`);
        res.render('posts/show', { post: data, error: null });
    } catch {
        res.redirect('/posts');
    }
});

router.get('/:id/edit', requireAuth, async (req, res) => {
    try {
        const { data } = await axios.get(`${API_URL}/posts/${req.params.id}/`);
        if (data.author_name !== req.session.user.username) return res.redirect('/posts');
        res.render('posts/edit', { post: data, error: null });
    } catch {
        res.redirect('/posts');
    }
});

router.post('/:id/edit', requireAuth, async (req, res) => {
    try {
        const { title, content } = req.body;
        await axios.put(`${API_URL}/posts/${req.params.id}/`, { title, content }, authHeaders(req));
        res.redirect(`/posts/${req.params.id}`);
    } catch {
        res.redirect('/posts');
    }
});

router.post('/:id/delete', requireAuth, async (req, res) => {
    try {
        await axios.delete(`${API_URL}/posts/${req.params.id}/`, authHeaders(req));
    } catch { /* 무시 */ }
    res.redirect('/posts');
});

router.post('/:id/comments', requireAuth, async (req, res) => {
    try {
        await axios.post(
            `${API_URL}/posts/${req.params.id}/comments/`,
            { content: req.body.content },
            authHeaders(req)
        );
    } catch { /* 무시 */ }
    res.redirect(`/posts/${req.params.id}`);
});

router.post('/comments/:commentId/delete', requireAuth, async (req, res) => {
    const { postId } = req.query;
    try {
        await axios.delete(`${API_URL}/posts/comments/${req.params.commentId}/`, authHeaders(req));
    } catch { /* 무시 */ }
    res.redirect(`/posts/${postId}`);
});

module.exports = router;
