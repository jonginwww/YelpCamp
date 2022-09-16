const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// 시드 모델
const Campground = require('../models/campground');
// 미들웨어
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

// Index
router.get(
    '/',
    catchAsync(async (req, res) => {
        // 모든 캠핑장을 불러옴.
        const campgrounds = await Campground.find({});
        res.render('campgrounds/index', {campgrounds});
    })
);

// Creatr
router.get('/new', isLoggedIn, (req, res) => {
    res.render('campgrounds/new');
});

router.post(
    '/',
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res, next) => {
        // 새로운 모델 생성
        const campground = new Campground(req.body.campground);
        // 사용자 ID 저장하기, req.user에는 자동으로 정보가 들어간다.
        campground.author = req.user._id;
        await campground.save();
        // 생성이 완료되면 flash 메시지를 띄운다.
        req.flash('success', '캠핑장을 생성했습니다!');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

//Show
router.get(
    '/:id',
    catchAsync(async (req, res) => {
        const {id} = req.params;
        // cmapground model에 reviews와 author 채워넣기
        const campground = await Campground.findById(id)
            // 중첩 채워넣기
            .populate({
                // 1차 - 캠핑장에 리뷰를 채워 넣는다.
                path: 'reviews',
                populate: {
                    // 2차 - 각각의 리뷰에 작성자를 채워 넣는다.
                    path: 'author'
                }
            })
            // 캠핑장에 작성자를 채워 넣는다.
            .populate('author');
        if (!campground) {
            req.flash('error', '캠핑장을 찾을 수 없습니다!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/show', {campground});
    })
);

// Update
router.get(
    '/:id/edit',
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findById(id);
        // id와 일치하는 캠핑장이 있는지 확인
        if (!campground) {
            req.flash('error', '캠핑장을 찾을 수 없습니다!');
            return res.redirect('/campgrounds');
        }
        res.render('campgrounds/edit', {campground});
    })
);

router.put(
    '/:id',
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(async (req, res) => {
        const {id} = req.params;
        const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
        req.flash('success', '수정이 완료되었습니다!');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// Delete
router.delete(
    '/:id',
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const {id} = req.params;
        await Campground.findByIdAndDelete(id);
        req.flash('success', '캠핑장이 삭제되었습니다!');
        res.redirect('/campgrounds');
    })
);

module.exports = router;
