const mysql = require('mysql2/promise');

function getConnection() {
	return mysql.createConnection({
		host: process.env.DB_HOST,
		user: process.env.DB_USER,
		password: process.env.DB_PASS,
		database: process.env.DB_NAME
	});
}
const T_RELATION = 'person_in_movie'; // seostetabel
const T_PROFESSION = 'profession'; // ametite tabel (veerg profession_id viitab sellele)

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
			'INSERT INTO ' + T_PROFESSION + ' (title, description) VALUES (?,?)',
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

// rippmenüüde andmed
async function getOptions(conn) {
	const [persons] = await conn.execute('SELECT id, first_name, last_name FROM person ORDER BY last_name, first_name');
	const [movies] = await conn.execute('SELECT id, title FROM movie ORDER BY title');
	const [professions] = await conn.execute('SELECT id, title FROM ' + T_PROFESSION + ' ORDER BY title');
	return { persons, movies, professions };
}

const emptySelected = { person: null, movie: null, profession: null, character: '' };

//@desc Lehekülg seosetele (inimene - film - amet)
//@route GET /eestifilm/seosed_add
//@access public
const seosedAdd = async (req, res) => {
	let conn;
	try {
		conn = await getConnection();
		const options = await getOptions(conn);
		res.render('eestifilmseosed_add', {
			notice: 'Ootan sisestust!',
			...options,
			selected: emptySelected
		});
	} catch (err) {
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmseosed_add', {
			notice: 'Andmeid ei õnnestunud lugeda!',
			persons: [], movies: [], professions: [],
			selected: emptySelected
		});
	} finally {
		if (conn) await conn.end();
	}
};

//@desc seoste lisamine
//@route POST /eestifilm/seosed_add
//@access public
const seosedAddPost = async (req, res) => {
	const personId = Number(req.body.personInput);
	const movieId = Number(req.body.movieInput);
	const professionId = Number(req.body.professionInput);
	const character = (req.body.characterInput || '').trim();
	const selected = {
		person: req.body.personInput,
		movie: req.body.movieInput,
		profession: req.body.professionInput,
		character: req.body.characterInput || ''
	};

	let conn;
	try {
		conn = await getConnection();
		const options = await getOptions(conn);
		let notice = '';

		if (!Number.isInteger(personId) || personId < 1 ||
			!Number.isInteger(movieId) || movieId < 1 ||
			!Number.isInteger(professionId) || professionId < 1) {
			notice = 'Vali isik, film ja amet!';
		} else if (character.length > 100) {
			notice = 'Tegelase nimi võib olla kuni 100 märki.';
		} else {
			// kas täpselt sama seos on juba olemas? (<=> töötab ka NULL-iga)
			const [existing] = await conn.execute(
				'SELECT id FROM ' + T_RELATION +
				' WHERE person_id = ? AND movie_id = ? AND profession_id = ? AND character_name <=> ?',
				[personId, movieId, professionId, character || null]
			);
			if (existing.length > 0) {
				notice = 'Selline seos on juba olemas!';
			} else {
				await conn.execute(
					'INSERT INTO ' + T_RELATION +
					' (person_id, movie_id, profession_id, character_name) VALUES (?,?,?,?)',
					[personId, movieId, professionId, character || null]
				);
				return res.render('eestifilmseosed_add', {
					notice: 'Seos salvestati!',
					...options,
					selected: emptySelected
				});
			}
		}
		res.render('eestifilmseosed_add', { notice, ...options, selected });
	} catch (err) {
		console.log('Viga andmebaasiga suhtlemisel: ' + err);
		res.render('eestifilmseosed_add', {
			notice: 'Tekkis viga! Andmeid ei salvestatud!',
			persons: [], movies: [], professions: [],
			selected: selected
		});
	} finally {
		if (conn) await conn.end();
	}
};

//@desc seoste nimekiri
//@route GET /eestifilm/seosed
//@access public
const seosed = async (req, res) => {
	let conn;
	try {
		conn = await getConnection();
		const sqlReq =
			'SELECT person.first_name, person.last_name, ' +
			'movie.title AS movie_title, ' +
			'prof.title AS profession_title, ' +
			'rel.character_name ' +
			'FROM ' + T_RELATION + ' AS rel ' +
			'JOIN person ON rel.person_id = person.id ' +
			'JOIN movie ON rel.movie_id = movie.id ' +
			'JOIN ' + T_PROFESSION + ' AS prof ON rel.profession_id = prof.id ' +
			'ORDER BY movie.title, person.last_name';
		const [sqlRes] = await conn.execute(sqlReq);
		res.render('eestifilmseosed', { relationList: sqlRes });
	} catch (err) {
		console.log('Viga andmebaasist lugemisel: ' + err);
		res.render('eestifilmseosed', { relationList: [] });
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
		ametidAddPost,
		seosedAdd,
		seosedAddPost,
		seosed
	}