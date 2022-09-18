const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// 컨트롤러(객체)
const campgrounds = require('../controllers/campgrounds');
// 미들웨어
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

const {render} = require('ejs');

router
    .route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// id 라우트로 인식 되지 않기 위해 id 라우트 보다 앞에 써줘야 한다.
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

router
    .route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
