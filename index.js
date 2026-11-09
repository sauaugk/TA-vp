const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks, promises osaga async programmeerimise jaoks
const mysql = require('mysql2/promise');
//moodul .env faili lugemiseks
require('dotenv').config();
//andmebaasi ühenduse seaded
const dbConf = {
	host: process.env.DB_HOST,
	user: process.env.DB_USER,
	password: process.env.DB_PASS,
	database: process.env.DB_NAME
};
const dateTimeET = require ('./src/dateTimeET');
const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();
//määrame veebilehtedele mallide renderdamise mootori
app.use(express.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));

//marsruudid
app.get("/", async (req, res) => {
	//res.send ('Express.js läks käima ja serveerib meile veebi. ')
	const dateNow =  dateTimeET.fullDate();
	const timeNow = dateTimeET.fullTime();
	let conn;
	let photo = null;
	try {
		conn = await mysql.createConnection(dbConf);
		const sql = "SELECT filename, alttext FROM galleryphotos WHERE id=(SELECT MAX(id) FROM galleryphotos WHERE privacy=? AND deleted IS NULL)";
		const [rows] = await conn.execute(sql, [3]);
		if (rows.length > 0) {
			photo = rows[0];
			if (!photo.alttext) photo.alttext = "Uusim avalik foto";
		}
	} catch (err) {
		console.log(err);
	} finally {
		if (conn) await conn.end();
	}
	res.render("index", { dateNow, timeNow, photo });
});

app.get('/vanasona', async (req, res)=>{
	try {
		const data = await fs.readFile(textRef, "utf8");
		let folkWisdom = data.split(";");
		res.render('vanasona', {wisdom: folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]});
	}
	catch (err) {
		res.render('vanasona', {wisdom: 'Ei leidnud ühtegi vanasõna.'});
	}
});

app.get('/miks-tlu', (req, res)=>{
	res.render('miks-tlu');
});

//sisseloginud kasutajate avaleht
app.get('/home', (req, res)=>{
	res.render('home');
});

//väljalogimine
app.get('/logout', (req, res)=>{
	res.redirect('/');
});


//Eesti filmi marsuudid
const eestifilmRouter = require('./routes/eestifilmRoutes');
app.use('/eestifilm', eestifilmRouter);

//Külastuste marsuudid
const külastusteRouter = require('./routes/külastusteRoutes');
app.use('/', külastusteRouter);

//Galerii fotode üleslaadimise marsruudid
const galleryPhotoUploadRouter = require('./routes/galleryPhotoUploadRoutes');
app.use('/galleryPhotoUpload', galleryPhotoUploadRouter);

//Galerii marsruudid
const galleryRouter = require('./routes/galleryRoutes');
app.use('/galerii', galleryRouter);

//Kasutajakonto loomise marsruut
const signupRouter = require('./routes/signupRoutes');
app.use('/signup', signupRouter);

//Kasutajakonto sisselogimise marsruut
const signinRouter = require('./routes/signinRoutes');
app.use('/signin', signinRouter);

app.listen(5105);