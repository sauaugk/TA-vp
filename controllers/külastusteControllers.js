const fs = require('fs').promises;
const dateTimeET = require('../src/dateTimeET');
const regTextRef = 'public/txt/visits.txt';

//@desc Lehekülg nime registreerimiseks
//@route GET /regvisit
//@access public
const regVisit = (req, res) => {
	res.render('regvisit');
};

//@desc Nime registreerimine (nimi, kuupäev, kellaaeg)
//@route POST /regvisit
//@access public
const regVisitPost = async (req, res) => {
	try {
		const visitDate = dateTimeET.fullDate();
		const visitTime = dateTimeET.fullTime();
		await fs.appendFile(regTextRef, req.body.nameInput + ',' + visitDate + ',' + visitTime + ';');
		res.render('regvisit');
	} catch (err) {
		console.log(err);
		res.render('regvisit');
	}
};

//@desc Lehekülg viimase külastuse näitamiseks
//@route GET /lastvisit
//@access public
const lastVisit = async (req, res) => {
	try {
		const data = await fs.readFile(regTextRef, 'utf8');
		const visits = data.split(';');
		// viimane element on tühi, viimane külastus on eelviimane
		const parts = visits[visits.length - 2].split(',');
		const message = 'Viimati registreeriti külastus ' + parts[1] + ', kell ' + parts[2] + ' kui seda tegi ' + parts[0] + '.';
		res.render('lastvisit', { message: message });
	} catch (err) {
		console.log(err);
		res.render('lastvisit', { message: 'Külastusi pole veel registreeritud.' });
	}
};

module.exports = {
	regVisit,
	regVisitPost,
	lastVisit
};