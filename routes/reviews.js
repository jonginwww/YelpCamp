const express = require('express');
// 매개변수 병합
const router = express.Router({mergeParams: true});
const catchAsync = require('../utils/catchAsync');
const {validateReview, isReviewAuthor, isLoggedIn} = require('../middleware');
const reviews = require('../controllers/reviews');

// 리뷰 생성 라우트
router.post('/', isLoggedIn, validateReview, catchAsync(reviews.createReview));

// 리뷰 삭제 라우트
router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
