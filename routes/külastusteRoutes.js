const express = require('express');
const router = express.Router();

const {
	regVisit,
	regVisitPost,
	lastVisit
} = require('../controllers/külastusteControllers');

router.route('/regvisit').get(regVisit).post(regVisitPost);
router.route('/lastvisit').get(lastVisit);

module.exports = router;