const {campgroundSchema, reviewSchema} = require('./schemas');
const ExpressError = require('./utils/ExpressError');
const Campground = require('./models/campground');
const Review = require('./models/review');

// 권한 여부를 확인하는 미들웨어
module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // 사용자를 redirect할 URL
        req.session.returnTo = req.originalUrl;
        req.flash('error', '로그인이 필요한 작업입니다.');
        return res.redirect('/login');
    }
    next();
};

// 유효성 검사를 하는 미들웨어
module.exports.validateCampground = (req, res, next) => {
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

// 사용자와 캠핑장 작성자 일치 여부를 확인 미들웨어
module.exports.isAuthor = async (req, res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if (!campground.author.equals(req.user._id)) {
        req.flash('error', '해당 작업을 수행할 권한이 없습니다.');
        return res.redirect(`/campgrounds/${campground._id}`);
    }
    next();
};

// 리뷰 유효성을 검사하는 미들웨어
module.exports.validateReview = (req, res, next) => {
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

// 사용자와 리뷰 작성자 일치 여부를 확인 미들웨어
module.exports.isReviewAuthor = async (req, res, next) => {
    // redirect할 때 id 쓰고 리뷰 권한을 확인할 때 reviewId를 씀.
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if (!review.author.equals(req.user._id)) {
        req.flash('error', '해당 작업을 수행할 권한이 없습니다.');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};
