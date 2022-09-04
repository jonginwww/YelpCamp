const express = require('express');
// 매개변수 병합
const router = express.Router({mergeParams: true});
const {reviewSchema} = require('../schemas');
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Campground = require('../models/campground');
const Review = require('../models/review');

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

// Review Create
router.post(
    '/',
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
        req.flash('success', '리뷰가 작성되었습니다!');
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// Review Delete
router.delete(
    '/:reviewId',
    catchAsync(async (req, res) => {
        const {id, reviewId} = req.params;
        // 참조 삭제
        await Campground.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
        // 리뷰 삭제
        await Review.findByIdAndDelete(reviewId);
        req.flash('success', '리뷰가 삭제되었습니다!');
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
