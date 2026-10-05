const fs = require('fs');
const textRef = 'txt/vanasonad.txt';

function showText(rawText){
	//teeme tekstist listi (järjend, massiiv, array)
	let folkWisdom = rawText.split(';');
	//console.log(folkWisdom);
		console.log('Tänane vanasõna: ' + folkWisdom[Math.round(Math.random() * (folkWisdom.length - 1))]);
	}

function readTextFile(reference){
	let result = 'Kahjuks teksti ei leitud';
	fs.readFile(reference, 'utf8', (err,data)=>{
		if(err){
			console.log('Viga: ' + err);
		} else {
			showText(data);
		}
	});//return result;
}

readTextFile(textRef);

module.exports = {readTextFile};