const Joi = require('joi');
// 서버측 유효성 검사
// campgroundSchema는 Mongoose 스키마가 이니다. Mongoose로 저장하기도 전에 데이터 유효성 검사를 한다.
module.exports.campgroundSchema = Joi.object({
    // form에서 입력 정보들은 campground로 그룹화 되어있다.
    campground: Joi.object({
        title: Joi.string().required(),
        price: Joi.number().required().min(0),
        // image: Joi.string().required(),
        location: Joi.string().required(),
        description: Joi.string().required()
    }).required(),
    deleteImages: Joi.array()
});

// 리뷰 유효성 검사
module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required()
    }).required()
});
