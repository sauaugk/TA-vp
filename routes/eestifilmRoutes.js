const express = require('express');
const router = express.Router();

//kontrollerid
const {
	eestifilm,
	inimesed,
	inimesedAdd,
	inimesedAddPost,
	filmidAdd,
	filmidAddPost,
	ametidAdd,
	ametidAddPost
} = require('../controllers/eestifilmControllers');

router.route('/').get(eestifilm);

router.route('/inimesed').get(inimesed);

router.route('/inimesed_add').get(inimesedAdd).post(inimesedAddPost);

router.route('/filmid_add').get(filmidAdd).post(filmidAddPost);

router.route('/ametid_add').get(ametidAdd).post(ametidAddPost);

module.exports = router;