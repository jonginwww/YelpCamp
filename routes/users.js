const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const User = require('../models/user');

// 회원가입 라우트
router.get('/register', (req, res) => {
    res.render('users/register');
});

router.post(
    '/register',
    catchAsync(async (req, res) => {
        try {
            const {email, username, password} = req.body;
            const user = new User({email, username});
            const registerUser = await User.register(user, password);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        } catch (e) {
            req.flash('error', e.message);
            res.redirect('register');
        }
    })
);

// 로그인 라우트
router.get('/login', (req, res) => {
    res.render('users/login');
});

router.post('/login', passport.authenticate('local', {failureFlash: '로그인에 실패했습니다.', failureRedirect: '/login'}), (req, res) => {
    req.flash('success', '환영합니다!');
    res.redirect('/campgrounds');
});

// 로그아웃 라우트
router.get('/logout', (req, res) => {
    req.logout(err => {
        if (err) {
            return next(err);
        }
    });
    req.flash('success', '로그아웃 되었습니다.');
    res.redirect('/campgrounds');
});

module.exports = router;
