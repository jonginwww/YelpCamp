const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// 컨트롤러(객체)
const campgrounds = require('../controllers/campgrounds');
// 미들웨어
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

const {render} = require('ejs');

// 인덱스 라우트
router.get('/', catchAsync(campgrounds.index));

// 캠핑장 생성 라우트
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// 캠핑장 보기 라우트
router.get('/:id', catchAsync(campgrounds.showCampground));

// 캠핑장 수정 라우트
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// 캠핑장 삭제 라우트
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
