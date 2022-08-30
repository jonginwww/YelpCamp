const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const {campgroundSchema, reviewSchema} = require('./schemas');
const methodOverride = require('method-override'); // PUT, DELETE를 사용하기 위한 method-override
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

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

const validateCampground = (req, res, next) => {
    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        // 메세지가 두 개 이상이면 쉼표로 합친다.
        const msg = error.details.map(el => el.message).join(',');
        // 오류가 있으면 작동된다.
        throw new ExpressError(msg, 400);
    } else {
        // 유효성 검사를 하고 오류가 없으면 next를 호출한다.
        next();
    }
};

const validateReview = (req, res, next) => {
    const {error} = reviewSchema.validate(req.body);
    if (error) {
        // 메세지가 두 개 이상이면 쉼표로 합친다.
        const msg = error.details.map(el => el.message).join(',');
        // 오류가 있으면 작동된다.
        throw new ExpressError(msg, 400);
    } else {
        // 유효성 검사를 하고 오류가 없으면 next를 호출한다.
        next();
    }
};

app.get('/', (req, res) => {
    res.render('home');
});

// index
app.get(
    '/campgrounds',
    catchAsync(async (req, res) => {
        // 모든 캠핑장을 불러옴.
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', {campgrounds});
    })
);

// creatr
app.get(
    '/campgrounds/new',
    catchAsync(async (req, res) => {
        res.render('campgrounds/new');
    })
);

app.post(
    '/campgrounds',
    validateCampground,
    catchAsync(async (req, res, next) => {
        // 새로운 모델 생성
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

//show
app.get(
    '/campgrounds/:id',
    catchAsync(async (req, res) => {
        // cmapground model에 reviews 채워넣기
        const campground = await Campground.findById(req.params.id).populate('reviews');
        res.render('campgrounds/show', {campground});
    })
);

// Update
app.get(
    '/campgrounds/:id/edit',
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', {campground});
    })
);

app.put(
    '/campgrounds/:id',
    validateCampground,
    catchAsync(async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// Delete
app.delete(
    '/campgrounds/:id',
    catchAsync(async (req, res) => {
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect('/campgrounds');
    })
);

// Review Create
app.post(
    '/campgrounds/:id/reviews',
    validateReview,
    catchAsync(async (req, res) => {
        // 리뷰를 추가하기 전 해당 campground 찾기
        const campground = await Campground.findById(req.params.id);
        // 새 리뷰를 인스턴스화 시키기
        const review = new Review(req.body.review);
        // 리뷰 배열에 넣기
        campground.reviews.push(review);
        // 저장하기
        await review.save();
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// Review Delete
app.delete(
    '/campgrounds/:id/reviews/:reviewId',
    catchAsync(async (req, res) => {
        const {id, reviewId} = req.params;
        // 참조 삭제
        await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        // 리뷰 삭제
        await Review.findByIdAndDelete(reviewId);
        res.redirect(`/campgrounds/${id}`);
    })
);

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
