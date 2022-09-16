module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // 사용자를 redirect할 URL
        req.session.returnTo = req.originalUrl;
        req.flash('error', '로그인이 필요한 작업입니다.');
        return res.redirect('/login');
    }
    next();
};
