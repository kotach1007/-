const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_URL = 'http://localhost:8000/api';

router.get('/login', (req, res) => {
    if (req.session.user) return res.redirect('/posts');
    res.render('auth/login', { error: null });
});

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const { data } = await axios.post(`${API_URL}/accounts/login/`, { username, password });
        req.session.user = data.user;
        req.session.accessToken = data.access;
        req.session.refreshToken = data.refresh;
        res.redirect('/posts');
    } catch (err) {
        const error = err.response?.data?.error || '로그인에 실패했습니다.';
        res.render('auth/login', { error });
    }
});

router.get('/register', (req, res) => {
    if (req.session.user) return res.redirect('/posts');
    res.render('auth/register', { error: null });
});

router.post('/register', async (req, res) => {
    try {
        const { username, email, password, password_confirm } = req.body;
        const { data } = await axios.post(`${API_URL}/accounts/register/`, {
            username, email, password, password_confirm,
        });
        req.session.user = data.user;
        req.session.accessToken = data.access;
        req.session.refreshToken = data.refresh;
        res.redirect('/posts');
    } catch (err) {
        const errors = err.response?.data;
        const error = errors
            ? Object.values(errors).flat().join(', ')
            : '회원가입에 실패했습니다.';
        res.render('auth/register', { error });
    }
});

router.post('/logout', (req, res) => {
    req.session.destroy();
    res.redirect('/auth/login');
});

module.exports = router;
