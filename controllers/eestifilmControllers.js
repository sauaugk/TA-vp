const mysql = require('mysql2/promise')

//@desc home page for Estonian Film section
//@route GET/eestifilm
//@access public

const eestifilm = (req, res) => {
	res.render('eestifilm');
};

//app.get ('/eestifilm'), (req,res)=> {

//@desc home page for people involved in Estonan Film industry
//@route GET/eestifilm/inimesed
//@access public

//app.get('/eestifilm/inimesed', async (req,res)=>{
const inimesed = async (req, res) => {
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
};

//@desc home page for adding people involved in Estonian Film industry
//@route GET/eestifilm/inimesed_add
//@access public
	
//app.get('/eestifilm/inimesed_add', (req,res)=>{
const inimesedAdd = (req, res) => {
	res.render('eestifilminimesed_add', {notice: 'ootan sisestust', firstName: null, lastName: null, born: null, deceased: null});
};

//@desc home page for adding people involved in Estonian Film industry
//@route POST /eestifilm/inimesed_add
//@access public

//app.post('/eestifilm/inimesed_add', async (req,res)=>{
const inimesedAddPost = async (req, res) => {
	console.log(req.body);
	//kontrollime andmete olemasolu
	const now = new Date();
	const bornDate = new Date(req.body.bornInput);
	if(!req.body.firstNameInput || !req.body.lastNameInput || !req.body.bornInput || isNaN(bornDate.getTime()) || bornDate > now){
		console.log('Andmed pole korrektsed');	
		return res.render('eestifilminimesed_add', {notice: 'andmed on puudulikud', firstName: req.body.firstNameInput, lastName: req.body.lastNameInput, born: req.body.bornInput, deceased: req.body.deceasedInput});	
	}
	let conn;
	try {
		conn = await mysql.createConnection({
			host: process.env.DB_HOST,
			user: process.env.DB_USER,
			password: process.env.DB_PASS,
			database: 'if26_sauaugk',
		});	
		let sqlReq = 'INSERT INTO person (first_name, last_name, born, deceased) VALUES (?,?,?,?)';
		let deceasedDate = null;
		if(req.body.deceasedInput !=''){
			const deceasedObj = new Date(req.body.deceasedInput);
			if(isNaN(deceasedObj.getTime()) || deceasedObj > now || deceasedObj < bornDate){
				return res.render('eestifilminimesed_add', {notice: 'surmakuupأ¤ev on vigane', firstName: req.body.firstNameInput, lastName: req.body.lastNameInput, born: req.body.bornInput, deceased: req.body.deceasedInput});
			}
			deceasedDate = req.body.deceasedInput;
		}
		await conn.execute(sqlReq, [
			req.body.firstNameInput,
			req.body.lastNameInput,
			req.body.bornInput,
			deceasedDate
		]);
		res.render('eestifilminimesed_add', {notice: 'andmed salvestati', firstName: null, lastName: null, born: null, deceased: null});
	}
	catch (err){
		console.log('viga andmebaasiga suhtlemisel' + err);
		res.render('eestifilminimesed_add', {notice: 'andmebaasi suhtlus nurjus', firstName: req.body.firstNameInput, lastName: req.body.lastNameInput, born: req.body.bornInput, deceased: req.body.deceasedInput});
	}
	finally {
		if(conn){
			await conn.end();
		}
	}
};

//@desc page for adding movies
//@route GET /eestifilm/filmid_add
//@access public
const filmidAdd = (req, res) => {
	res.render('eestifilmid_add', {
		notice: 'Ootan sisestust!',
		errors: {},
		title: null, year: null, duration: null, description: null
	});
};

//@desc adding movies
//@route POST /eestifilm/filmid_add
//@access public
const filmidAddPost = async (req, res) => {
	const errors = {};
	const title = (req.body.titleInput || '').trim();
	const description = req.body.descriptionInput || '';
	const year = Number(req.body.yearInput);
	const duration = Number(req.body.durationInput);

	if (!title) errors.title = 'Pealkiri puudub.';
	else if (title.length > 100) errors.title = 'Pealkiri võib olla kuni 100 märki.';

	if (!Number.isInteger(year) || year < 1888 || year > new Date().getFullYear()) {
		errors.year = 'Aasta peab olema vahemikus 1888 kuni käesolev aasta.';
	}
	if (!Number.isInteger(duration) || duration < 1 || duration > 1000) {
		errors.duration = 'Kestus peab olema täisarv minutites (1–1000).';
	}
	if (description.length > 1000) errors.description = 'Kirjeldus võib olla kuni 1000 märki.';

	if (Object.keys(errors).length > 0) {
		return res.render('eestifilmid_add', {
			notice: 'Andmed ei ole korrektsed!',
			errors: errors,
			title: req.body.titleInput,
			year: req.body.yearInput,
			duration: req.body.durationInput,
			description: req.body.descriptionInput
		});
	}

	let conn;
	try {
		conn = await getConnection();
		await conn.execute(
			'INSERT INTO movie (title, release_year, duration_minutes, description) VALUES (?,?,?,?)',
			[title, year, duration, description || null]
		);
		res.render('eestifilmid_add', {
			notice: 'Film salvestati!',
			errors: {},
			title: null, year: null, duration: null, description: null
		});
	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmid_add', {
			notice: 'Tekkis viga! Andmeid ei salvestatud!',
			errors: {},
			title: req.body.titleInput,
			year: req.body.yearInput,
			duration: req.body.durationInput,
			description: req.body.descriptionInput
		});
	} finally {
		if (conn) await conn.end();
	}
};

//@desc Lehekülg ametite lisamiseks
//@route GET /eestifilm/ametid_add
//@access public
const ametidAdd = (req, res) => {
	res.render('eestifilmametid_add', {
		notice: 'Ootan sisestust!',
		errors: {},
		positionName: null, description: null
	});
};

//@desc Ametite lisamine
//@route POST /eestifilm/ametid_add
//@access public
const ametidAddPost = async (req, res) => {
	const errors = {};
	const positionName = (req.body.positionNameInput || '').trim();
	const description = req.body.descriptionInput || '';

	if (!positionName) errors.positionName = 'Ameti nimetus puudub.';
	else if (positionName.length > 50) errors.positionName = 'Ameti nimetus võib olla kuni 50 märki.';

	if (description.length > 1000) errors.description = 'Kirjeldus võib olla kuni 1000 märki.';

	if (Object.keys(errors).length > 0) {
		return res.render('eestifilmametid_add', {
			notice: 'Andmed ei ole korrektsed!',
			errors: errors,
			positionName: req.body.positionNameInput,
			description: req.body.descriptionInput
		});
	}

	let conn;
	try {
		conn = await getConnection();
		await conn.execute(
			'INSERT INTO `position` (title, description) VALUES (?,?)',
			[positionName, description || null]
		);
		res.render('eestifilmametid_add', {
			notice: 'Amet salvestati!',
			errors: {},
			positionName: null, description: null
		});
	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmametid_add', {
			notice: 'Tekkis viga! Andmeid ei salvestatud!',
			errors: {},
			positionName: req.body.positionNameInput,
			description: req.body.descriptionInput
		});
	} finally {
		if (conn) await conn.end();
	}
};

	module.exports = {
		eestifilm,
		inimesed,
		inimesedAdd,
		inimesedAddPost,
		filmidAdd,
		filmidAddPost,
		ametidAdd,
		ametidAddPost
	}