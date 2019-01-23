const fs = require("fs");
const winston = require("winston");
const { Attachment } = require("discord.js");
const config = require("./config").config;

let usersOfBot = {};
let blahajImages = {};

if (!fs.existsSync(config.LOG_FOLDER)) {
	fs.mkdirSync(config.LOG_FOLDER);
}

const logger = winston.createLogger({
	level: "info",
	format: winston.format.json(),
	transports: [
		new winston.transports.File({ filename: config.LOG_FOLDER + "error.log", level: "error" }),
		new winston.transports.File({ filename: config.LOG_FOLDER + "combined.log" })
	]
});

if (process.env.NODE_ENV !== "production") {
	logger.add(new winston.transports.Console({
		format: winston.format.simple()
	}));
}

function includesBlahaj(message) {
	const triggerWordsForImage = ["franz", "blahaj", "blåhaj", "hai", "shark"];
	let includesBlahaj = false;
	triggerWordsForImage.forEach(function (word) {
		let regex = "\\b" + word + "\\b";
		if (message.match(regex)) {
			logger.info("Received message (" + message + ") includes blahaj. Proceed.");
			includesBlahaj = true;
		}
	});
	return includesBlahaj;
}

function addUser(id) {
	fs.readFile(config.data.USERS_FILE_PATH, "utf8", function readFileCallback(err, data) {
		if (err) {
			logger.error("Error in addUser: " + err);
		} else {
			let jsonFile = JSON.parse(data);
			console.log(jsonFile);
			jsonFile.users.push(id);
			usersOfBot = jsonFile.users;
			let jsonString = JSON.stringify(jsonFile); //convert it back to json
			fs.writeFile(config.data.USERS_FILE_PATH, jsonString, "utf8", function (err) {
				if (err) {
					logger.error("Error in addUser - writeFile: " + err);
				}
				logger.info("User " + id + "has been added. The file was saved!");
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

function isAllowed(userId) {
	let isAllowedUser = false;
	usersOfBot.forEach(function (user) {
		if (user === userId) {
			isAllowedUser = true;
		}
	});
	return isAllowedUser;
}

function handleMessage(client, message) {
	if (isAllowed(message.author.id)) {
		let messageText = (message.content).toLowerCase();
		let doesIncludeBlahaj = includesBlahaj(messageText);
		if (doesIncludeBlahaj) {
			logger.info(`Got message by authorized user ${message.author.tag} (ID: ${message.author.id})!`);
			const attachment = new Attachment(getRandomBlahajImage());
			message.channel.send(attachment);
			logger.info("Sending random blahaj image!");
		}
		if (messageText.includes("whatever")) {
			const attachment = new Attachment(blahajImages.whatever);
			message.channel.send(attachment);
		}
		if (message.author.id === config.BOT_OWNER) {
			if (message.content === "!add") {
				addUser(message.author.id);
			}
		}
	} else if (message.author.id === client.user.id) {
		logger.info(`Bot ${client.user.tag} wrote message: ${message.content}`);
	} else {
		logger.error(`Got message by unauthorized user ${message.author.tag} (ID: ${message.author.id})!`);
	}
}

function getRandomBlahajImage() {
	var keys = Object.keys(blahajImages);
	return blahajImages[keys[ keys.length * Math.random() << 0]];
}

loadAllowedUsers();
loadBlahajImages();

module.exports = {
	logger,
	handleMessage
};
