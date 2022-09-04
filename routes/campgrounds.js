const express = require('express');
const router = express.Router();
const {campgroundSchema} = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');

// 유효성 검사
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

// index
router.get(
    '/',
    catchAsync(async (req, res) => {
        // 모든 캠핑장을 불러옴.
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', {campgrounds});
    })
);

// creatr
router.get(
    '/new',
    catchAsync(async (req, res) => {
        res.render('campgrounds/new');
    })
);

router.post(
    '/',
    validateCampground,
    catchAsync(async (req, res, next) => {
        // 새로운 모델 생성
        const campground = new Campground(req.body.campground);
        await campground.save();
        // 생성이 완료되면 flash 메시지를 띄운다.
        req.flash('success', '캠핑장을 생성했습니다!');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

//show
router.get(
    '/:id',
    catchAsync(async (req, res) => {
        // cmapground model에 reviews 채워넣기
        const campground = await Campground.findById(req.params.id).populate('reviews');
        res.render('campgrounds/show', {campground});
    })
);

// Update
router.get(
    '/:id/edit',
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        res.render('campgrounds/edit', {campground});
    })
);

router.put(
    '/:id',
    validateCampground,
    catchAsync(async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// Delete
router.delete(
    '/:id',
    catchAsync(async (req, res) => {
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        res.redirect('/campgrounds');
    })
);

module.exports = router;
