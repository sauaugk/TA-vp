const dateFormattedET = function(){
	let timeNow = new Date();
	const weekdayNamesET = ['pühapäev', 'esmaspäev', 'teisipäev', 'kolmapäev', 'neljapäev', 'reede', 'laupäev'];	
	const monthNamesET = ['jaanuar', 'veebruar', 'märts', 'aprill', 'mai', 'juuni', 'juuli', 'august', 'september', 'oktoober', 'november', 'detsember'];
	return weekdayNamesET[timeNow.getDay()] + ', ' + timeNow.getDate() + '. ' + monthNamesET[timeNow.getMonth()] + ' ' + timeNow.getFullYear();
}

const addLeadZero = function(numValue){
	if(numValue < 10){
		//numValue = '0' + numValue;
		numValue = String(numValue).padStart(2, '0');
	}
	return String(numValue);
}

const timeFormattedET = function(){
	let timeNow = new Date();
	let hourNow = addLeadZero(timeNow.getHours());
	let minuteNow =addLeadZero(timeNow.getMinutes());
	let secondNow = addLeadZero(timeNow.getSeconds());
	let timeFormatted = hourNow+ ':' + minuteNow + ':' + secondNow;
	return timeFormatted;
}

//ekspordin kõik vajaliku
module.exports = {fullDate: dateFormattedET, fullTime: timeFormattedET};