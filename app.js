// 개발모드에서만 작동
// 코드를 실행하면 .env 파일을 가져온다.
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override'); // PUT, DELETE를 사용하기 위한 method-
const session = require('express-session');
const flash = require('connect-flash');
const ExpressError = require('./utils/ExpressError');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const mongoSanitize = require('express-mongo-sanitize');

// 라우트
const userRoutes = require('./routes/users');
const campgroundRoutes = require('./routes/campgrounds');
const reviewRoutes = require('./routes/reviews');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

//  오류를 확인하고 오류 없이 제대로 열렸다면 연결됐다는 문구를 출력하는 로직
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// express로 body 파싱
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

// Static Asset
app.use(express.static(path.join(__dirname, 'public')));

app.use(
    mongoSanitize({
        replaceWith: '_'
    })
);

// Session
const sessionConfig = {
    secret: 'thisshouldbeabettersecret!',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // 쿠키 만료 기간
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
};

app.use(session(sessionConfig));

// Flash
app.use(flash());

// passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

// 세션에 정보를 어떻게 저장하고 가져오는지를 결정하는 메서드
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// 플래쉬 로컬 변수 미들웨어
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// 회원가입 라우터
app.use('/', userRoutes);

// 캠프장 라우터
app.use('/campgrounds', campgroundRoutes);

// 리뷰 라우터
app.use('/campgrounds/:id/reviews', reviewRoutes);

// home
app.get('/', (req, res) => {
    res.render('home');
});

// 알 수 없는 URL을 요청하는 경우 작동, Get 요청이든 Post 요청이든 all이 받음.
app.all('*', (req, res, next) => {
    next(new ExpressError('Page not Found', 404));
});

// 제네릭 오류 핸들러
app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) err.message = 'Oh No, Something Went Wrong!';
    res.status(statusCode).render('error', {err});
});

app.listen(3000, () => {
    console.log('Serving on port 3000!');
});
