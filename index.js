const express = require('express');
const fs = require('fs').promises;
//moodul URL-i lahtiharutamiseks, et saaks POST osad ka kätte
const bodyparser = require('body-parser');
//moodul andmebaasiga suhtlemiseks, promises osaga async programmeerimise jaoks
const mysql = require('mysql2/promise');
//moodul .env faili lugemiseks
require('dotenv').config();
const dateTimeET = require ('./src/dateTimeET');
const textRef = 'public/txt/vanasonad.txt';
const regTextRef = 'public/txt/visits.txt';

//käivitan express.js funktsiooni ja annan nimeks "app"
const app = express();
//määrame veebilehtedele mallide renderdamise mootori
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
//määran ühe päris kataloogi virtuaalses serveris kättesaadavaks
app.use(express.static('public'));

//marsruudid
app.get("/", (req,res)=>{
	//res.send ('Express.js läks käima ja serveerib meile veebi. ')
	const dateNow =  dateTimeET.fullDate();
	const timeNow = dateTimeET.fullTime();
	res.render('index', {dateNow: dateNow, timeNow: timeNow});
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

app.get('/regvisit', (req, res)=>{
	res.render('regvisit');
});

app.post('/regvisit', async (req, res)=>{
	try{
		await fs.open(regTextRef, 'a');
		await fs.appendFile(regTextRef, req.body.nameInput + ';');
		res.render('regvisit');
	}
	catch (err){
		console.log(err);
		res.render('regvisit');
	}
});

app.get('/eestifilm', (req,res)=>{
	res.render('eestifilm')
});

app.get('/eestifilm/inimesed', async (req,res)=>{
	//console.log('Andmebaasiserver on: ' + process.env.DB_HOST);
	let conn;
	try {
		conn = await mysql.createConnection({ 
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		const sqlReq = 'SELECT * FROM person ORDER by last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		console.log(sqlRes);
		res.render('eestifilminimesed', {personList: sqlRes});
	}
	catch (err){
		console.log ('Viga andmebaasist lugemisel: ' +err);
		res.render('eestifilminimesed', {personList: []});
	}
	finally {
		if(conn){
			await conn.end();
			console.log('Andmebaasi ühendus suletud.');
		}
	}
});

app.get('/eestifilm/inimesed_add', (req,res)=>{
	res.render('eestifilminimesed_add', {notice: 'Ootan sisestust!'});
});

app.post('/eestifilm/inimesed_add', async (req,res)=>{
	console.log(req.body);
	//kontrollime andmete olemasolu
	if(!req.body.firstNameInput || !req.body.lastNameInput || req.body.bornInput >= new Date()){
		console.log('Andmed pole korrektsed');
		res.render('eestifilminimesed_add', {notice: 'Andmed on puudulikud!'});
	}
	let conn;
	try {
		conn = await mysql.createConnection({ 
			host: process.env.DB_HOST, 
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: process.env.DB_NAME,
		});
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		let deceasedDate= null;
		if (req.body.deceasedInput != ''){
			deceasedDate= req.body.deceasedInput;
		}
		await conn.execute(sqlReq, [
			req.body.firstNameInput, 
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('eestifilminimesed_add', {notice: 'Andmed salvestati! Ootan uut sisestust!'});
	}	
		catch (err) {
			console.log('Viga andmebaasiga suhtlemisel: ' + err);
			res.render('eestifilminimesed_add', {notice: 'Tekkis Viga! Andmeid ei salvestatud!'});
		}
	finally {
		if(conn){
			await conn.end();
		}
	}
});

app.listen(5105);