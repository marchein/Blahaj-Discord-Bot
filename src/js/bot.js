var fs = require("fs");

let config = {};
let usersOfBot = {};
let blahajImages = {};

function includesBlahaj(message) {
	const triggerWordsForImage = ["franz", "blahaj", "blåhaj", "hai", "shark"];
	let includesBlahaj = false;
	triggerWordsForImage.forEach(function (word) {
		let regex = "\\b" + word + "\\b";
		if (message.match(regex)) {
			console.log("message (" + message + ") includes blahaj");
			includesBlahaj = true;
		}
	});
	return includesBlahaj;
}

function addUser(id) {
	fs.readFile(config.data.USERS_FILE_PATH, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.log(err);
		} else {
			let jsonFile = JSON.parse(data);
			console.log(jsonFile);
			jsonFile.users.push(id);
			usersOfBot = jsonFile.users;
			let jsonString = JSON.stringify(jsonFile); //convert it back to json
			fs.writeFile(config.data.USERS_FILE_PATH, jsonString, "utf8", function (err) {
				if (err) {
					console.log(err);
				}
				console.log("The file was saved!");
			}); // write it back
		}
	});
}

function loadAllowedUsers() {
	fs.readFile(config.data.USERS_FILE_PATH, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.log(err);
		} else {
			usersOfBot = JSON.parse(data).users;
		}
	});
}

function loadBlahajImages() {
	fs.readFile(config.data.IMAGES_PATH, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.log(err);
		} else {
			blahajImages = JSON.parse(data);
		}
	});
}

function getBlahajImages() {
	return blahajImages;
}

function isAllowed(userId) {
	let isAllowedUser = false;
	usersOfBot.forEach(function (user) {
		if (user === userId) {
			isAllowedUser = true;
		}
	});
	return isAllowedUser;
}

function setConfig(cfg) {
	config = cfg;
	loadAllowedUsers();
	loadBlahajImages();
}

module.exports = {
	includesBlahaj,
	addUser,
	isAllowed,
	getBlahajImages,
	setConfig
};
