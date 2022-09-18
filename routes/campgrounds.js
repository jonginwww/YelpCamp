const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
// 컨트롤러(객체)
const campgrounds = require('../controllers/campgrounds');
// 미들웨어
const {isLoggedIn, validateCampground, isAuthor} = require('../middleware');

// 시드 모델
const Campground = require('../models/campground');
const {render} = require('ejs');

// Index
router.get('/', catchAsync(campgrounds.index));

// Creatr
router.get('/new', isLoggedIn, campgrounds.renderNewForm);
router.post('/', isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

//Show
router.get('/:id', catchAsync(campgrounds.showCampground));

// Update
router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));
router.put('/:id', isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground));

// Delete
router.delete('/:id', isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
