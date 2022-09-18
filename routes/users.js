const express = require('express');
const router = express.Router();
const passport = require('passport');
const catchAsync = require('../utils/catchAsync');
const users = require('../controllers/users');

// 회원가입 라우트
router.route('/register').get(users.renderRegister).post(catchAsync(users.register));

// 로그인 라우트
router
    .route('/login')
    .get(users.renderLogin)
    .post(
        passport.authenticate('local', {
            failureFlash: '로그인에 실패했습니다.',
            failureRedirect: '/login',
            keepSessionInfo: true
        }),
        users.login
    );

// 로그아웃 라우트
router.get('/logout', users.logout);

module.exports = router;
