const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override'); // PUT, DELETE를 사용하기 위한 method-
const session = require('express-session');
const ExpressError = require('./utils/ExpressError');

// 라우트
const campgrounds = require('./routes/campgrounds');
const reviews = require('./routes/reviews');

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

// home
app.get('/', (req, res) => {
    res.render('home');
});

// 캠프장 라우터
app.use('/campgrounds', campgrounds);

// 리뷰 라우터
app.use('/campgrounds/:id/reviews', reviews);

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
