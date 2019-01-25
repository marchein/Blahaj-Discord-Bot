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

if (config.DEBUG) {
	logger.add(new winston.transports.Console({
		format: winston.format.simple()
	}));
}

function includesBlahaj(message) {
	let includesBlahaj = false;
	config.RANDOM_WORDS.forEach(function (word) {
		let regex = "\\b" + word + "\\b";
		if (message.match(regex)) {
			logger.info("Received message (" + message + ") includes blahaj. Proceed.");
			includesBlahaj = true;
		}
	});
	return includesBlahaj;
}

function addUser(client, message, id) {
	if (client.user.id === id) {
		let error = `User ${client.user.tag} is a bot and cannot be removed from the whitelist.`;
		sendMessage(message, error);
		logger.error(error);
	} else {
		fs.readFile(config.data.USERS_FILE_PATH, "utf8", function readFileCallback(err, data) {
			if (err) {
				logger.error("Error in addUser: " + err);
			} else {
				let jsonFile = JSON.parse(data);
				if (id === -1) {
					errorMessage(message, "No id provided. Aborting.");
				} else if (jsonFile.users.indexOf(id) === -1) {
					jsonFile.users.push(id);
					usersOfBot = jsonFile.users;
					let jsonString = JSON.stringify(jsonFile); //convert it back to json
					fs.writeFile(config.data.USERS_FILE_PATH, jsonString, "utf8", function (err) {
						if (err) {
							logger.error("Error in addUser - writeFile: " + err);
						}
						infoMessage(message, `User ${id} has been been added. The file was saved!`);
					});
				} else {
					let error = `User with ID ${id} already exists in data.`;
					sendMessage(message, error);
					logger.error(error);
				}
			}
		});
	}
}

function removeUser(client, message, id) {
	if (client.user.id === id) {
		let error = `User ${client.user.tag} is a bot and cannot be removed from the whitelist.`;
		sendMessage(message, error);
		logger.error(error);
	} else {
		fs.readFile(config.data.USERS_FILE_PATH, "utf8", function readFileCallback(err, data) {
			if (err) {
				logger.error("Error in removeUser: " + err);
			} else {
				let jsonFile = JSON.parse(data);
				let indexOfUser = jsonFile.users.indexOf(id);
				if (id === -1) {
					logger.error("No id provided. Aborting.");
				} else if (indexOfUser !== -1) {
					jsonFile.users.splice(indexOfUser, 1);
					usersOfBot = jsonFile.users;
					let jsonString = JSON.stringify(jsonFile); //convert it back to json
					fs.writeFile(config.data.USERS_FILE_PATH, jsonString, "utf8", function (err) {
						if (err) {
							logger.error("Error in removeUser - writeFile: " + err);
						}
						infoMessage(message, `User ${id} has been been removed. The file was saved!`);
					});
				} else {
					let error = `User with ID ${id} does not exist in data.`;
					sendMessage(message, error);
					logger.error(error);
				}
			}
		});
	}
}

function loadAllowedUsers() {
	fs.readFile(config.data.USERS_FILE_PATH, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.error(err);
		} else {
			usersOfBot = JSON.parse(data).users;
		}
	});
}

function loadBlahajImages() {
	fs.readFile(config.data.IMAGES_PATH, "utf8", function readFileCallback(err, data) {
		if (err) {
			console.error(err);
		} else {
			blahajImages = JSON.parse(data);
		}
	});
}

function isAllowed(userId) {
	if (userId === config.BOT_OWNER) {
		return true;
	} else {
		let isAllowedUser = false;
		usersOfBot.forEach(function (user) {
			if (user === userId) {
				isAllowedUser = true;
			}
		});
		return isAllowedUser;
	}
}

function handleRandomImage(message) {
	logger.info(`Got message by authorized user ${message.author.tag} (ID: ${message.author.id})!`);
	sendImage(message, getRandomBlahajImage());
	logger.info("Sending random blahaj image!");
}

function handleOwnerFeatures(client, message) {
	if (message.content.includes("!add")) {
		addUser(client, message, getIdOfMentionedUser(message));
	} else if (message.content.includes("!remove")) {
		removeUser(client, message, getIdOfMentionedUser(message));
	} else if (message.content.includes("!say")) {
		let slug = message.content.split("!say").pop();
		sendMessage(message, slug);
	} else if (message.content.includes("!status")) {
		let status = message.content.split("!status").pop();
		client.user.setActivity(status, {
			type: "PLAYING"
		});
	}
}

function getIdOfMentionedUser(message) {
	let mentionedUsers = message.mentions.users;
	let value = mentionedUsers.values().next();
	if (value.value !== undefined) {
		return value.value.id;
	}
	return -1;
}

function handleKeyWordImage(message, enteredKeyword) {
	let possibleImages = [];
	let keys = Object.keys(blahajImages);

	keys.forEach(function (key) {
		blahajImages[key].keywords.forEach(function (keyword) {
			if (keyword === enteredKeyword) {
				possibleImages.push(blahajImages[key].image);
			}
		});
	});
	sendImage(message, possibleImages[Math.floor(Math.random() * possibleImages.length)]);
}

function sendMessage(message, messageContent) {
	message.channel.send(messageContent);
}

function sendImage(message, image) {
	const attachment = new Attachment(image);
	sendMessage(message, attachment);
}

function handleMessage(client, message) {
	if (isAllowed(message.author.id)) {
		let messageText = (message.content).toLowerCase();
		let doesIncludeBlahaj = includesBlahaj(messageText);
		let doesContainsKeyword = containsKeyword(messageText);

		if ((doesContainsKeyword.boolean && doesIncludeBlahaj) || doesContainsKeyword.boolean) {
			handleKeyWordImage(message, doesContainsKeyword.keyword);
		} else if (doesIncludeBlahaj) {
			handleRandomImage(message);
		} else if (message.author.id === config.BOT_OWNER) {
			handleOwnerFeatures(client, message);
		}
	} else if (message.author.id === client.user.id) {
		logger.info(`Bot ${client.user.tag} wrote message: ${message.content}`);
	} else {
		logger.error(`Got message by unauthorized user ${message.author.tag} (ID: ${message.author.id})!`);
	}
}

function getRandomBlahajImage() {
	let keys = Object.keys(blahajImages);
	return blahajImages[keys[ keys.length * Math.random() << 0]].image;
}

function getAllKeyWords() {
	let keys = Object.keys(blahajImages);
	let keywords = [];
	keys.forEach(function (key) {
		blahajImages[key].keywords.forEach(function (keyword) {
			keywords.push(keyword);
		});
	});
	return Array.from(new Set(keywords));
}

function containsKeyword(message) {
	let foundKeyword;
	let doesContainKeyword = false;
	let allKeyWords = getAllKeyWords();
	allKeyWords.forEach(function (keyword) {
		if (message.indexOf(keyword) !== -1) {
			logger.info("Received message (" + message + ") includes keyword. Proceed.");
			foundKeyword = keyword;
			doesContainKeyword = true;
		}
	});

	return {
		boolean: doesContainKeyword,
		keyword: foundKeyword
	};
}

function errorMessage(message, error) {
	sendMessage(message, error);
	logger.error(error);
}

function infoMessage(message, content) {
	sendMessage(message, content);
	logger.info(content);
}

loadAllowedUsers();
loadBlahajImages();

module.exports = {
	logger,
	handleMessage
};
