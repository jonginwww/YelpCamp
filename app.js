const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const methodOverride = require('method-override'); // PUT, DELETE를 사용하기 위한 method-override
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const {title} = require('process');

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
    // if (!req.body.campground) throw new ExpressError('Invaild Campground Data', 400);
    // campgroundSchema는 Mongoose 스키마가 이니다. Mongoose로 저장하기도 전에 데이터 유효성 검사를 한다.
    const campgroundSchema = Joi.object({
        // form에서 입력 정보들은 campground로 그룹화 되어있다.
        campground: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    }).required();

    const {error} = campgroundSchema.validate(req.body);
    if (error) {
        // 메세지가 두 개 이상이면 쉼표로 합친다.
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
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
        const campground = await Campground.findById(req.params.id);
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
