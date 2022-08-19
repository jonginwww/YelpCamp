const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override'); // PUT, DELETE를 사용하기 위한 method-override
const Campground = require('./models/campground');

mongoose.connect('mongodb://localhost:27017/yelp-camp');

//  오류를 확인하고 오류 없이 제대로 열렸다면 연결됐다는 문구를 출력하는 로직
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '/views'));

// express로 body 파싱
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.get('/', (req, res) => {
    res.render('home');
});

// index
app.get('/campgrounds', async (req, res) => {
    // 모든 캠핑장을 불러옴.
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds});
});

// creatr
app.get('/campgrounds/new', async (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
    // 새로운 모델 생성
    const campground = new Campground(req.body.campground);
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
});

//show
app.get('/campgrounds/:id', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/show', {campground});
});

// Update
app.get('/campgrounds/:id/edit', async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    res.render('campgrounds/edit', {campground});
});

app.put('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    res.redirect(`/campgrounds/${campground._id}`);
});

// Delete
app.delete('/campgrounds/:id', async (req, res) => {
    const {id} = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect('/campgrounds');
});

app.listen(3000, () => {
    console.log('Serving on port 3000!');
});
