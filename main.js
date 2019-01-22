var fs = require('fs');

let usersOfBot = [];

function includesBlahaj(message) {
	const triggerWordsForImage = ["franz", "blahaj", "blåhaj", "hai", "shark"];
	let includesBlahaj = false;
	triggerWordsForImage.forEach(function(word) {
		let regex = '\\b' + word + '\\b';
		if (message.match(regex)) {
			console.log("message (" + message + ") includes blahaj");
			includesBlahaj = true;
		}
	});
	return includesBlahaj;
}

function addUser(id) {
	fs.readFile("users.json", "utf8", function readFileCallback(err, data){
		if (err) {
			console.log(err);
		} else {
			jsonFile = JSON.parse(data);
			console.log(jsonFile);
			jsonFile.users.push(id);
			usersOfBot = jsonFile.users;
			jsonString = JSON.stringify(jsonFile); //convert it back to json
			fs.writeFile('users.json', jsonString, 'utf8', function(err) {
				if(err) {
					return console.log(err);
				}
				console.log("The file was saved!");
			}); // write it back 
		}
	});
}

function getAllowedUsers() {
	fs.readFile("users.json", "utf8", function readFileCallback(err, data){
		if (err) {
			console.log(err);
		} else {
			jsonFile = JSON.parse(data);
			usersOfBot = jsonFile.users;
		}
	});
}

function isAllowed(userId) {
	let isAllowedUser = false;
	usersOfBot.forEach(function(user) {
		if (user === userId) {
			isAllowedUser = true;
		}
	});
	return isAllowedUser;
}

getAllowedUsers();

// Import the discord.js module
const {
    Client,
    Attachment
} = require('discord.js');

// Create an instance of a Discord client
const client = new Client();

/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
	console.log(usersOfBot);
});

// Create an event listener for messages
client.on('message', message => {
	if (isAllowed(message.author.id)) {
		// If the message is "ping"
		let messageText = (message.content).toLowerCase();
		console.log(messageText);
		let doesIncludeBlahaj = includesBlahaj(messageText);
		console.log(doesIncludeBlahaj);
		if (doesIncludeBlahaj) {
			console.log("Sending blahaj image");
			const attachment = new Attachment('https://i.imgur.com/Pz5VPmV.png');
			message.channel.send(attachment);
		}
		if (messageText.includes("whatever")) {
			const attachment = new Attachment('https://i.imgur.com/Pz5VPmV.png');
			message.channel.send(attachment);
		}
		if (message.author.id == usersOfBot[0]) {
			if (message.content == "!add") {
				addUser(message.author.id);
			}
		}
	}
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('NTM3MzUwMTg4ODUyMDUxOTg4.Dyj-TA.9V_0vQL-O9h6lSCv4apqRfjY0-Q');

