const User = require('../models/user');

// Register
module.exports.renderRegister = (req, res) => {
    res.render('users/register');
};

module.exports.register = async (req, res, next) => {
    try {
        const {email, username, password} = req.body;
        const user = new User({email, username});
        const registerUser = await User.register(user, password);
        // 회원가입을 성공하면 로그인 상태 유지
        req.login(registerUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome to Yelp Camp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
};

// Login
module.exports.renderLogin = (req, res) => {
    res.render('users/login');
};

module.exports.login = (req, res) => {
    req.flash('success', '환영합니다!');
    // 사용자가 최초로 요청을 보낸 페이지 URL
    const redirectUrl = req.session.returnTo || '/campgrounds';
    // 이 세션을 계속 사용하지 않으므로 페이지를 redirect한 후나 변수를 생성한 후에는 세션을 삭제한다.
    delete req.session.returnTo;
    res.redirect(redirectUrl);
};

// Logout
module.exports.logout = (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
    });
    req.flash('success', '로그아웃 되었습니다.');
    res.redirect('/campgrounds');
};
