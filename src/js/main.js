const config = require("./config").config;

const Bot = require("./bot");
Bot.setConfig(config);

const { Client, Attachment } = require("discord.js");
const client = new Client();

client.on("ready", () => {
	console.log(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
	if (Bot.isAllowed(message.author.id)) {
		let messageText = (message.content).toLowerCase();
		console.log(messageText);
		let doesIncludeBlahaj = Bot.includesBlahaj(messageText);
		console.log(doesIncludeBlahaj);
		if (doesIncludeBlahaj) {
			console.log("Sending blahaj image");
			const attachment = new Attachment(Bot.getBlahajImages().whatever);
			message.channel.send(attachment);
		}
		if (messageText.includes("whatever")) {
			const attachment = new Attachment(Bot.getBlahajImages().whatever);
			message.channel.send(attachment);
		}
		if (message.author.id === config.BOT_OWNER) {
			if (message.content === "!add") {
				Bot.addUser(message.author.id);
			}
		}
	}
});

client.login(config.DISCORD_TOKEN);
