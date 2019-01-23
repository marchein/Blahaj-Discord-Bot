const config = require("./config").config;
const Bot = require("./bot");
const { Client } = require("discord.js");
const client = new Client();

client.on("ready", () => {
	client.user.setActivity("Schwimmen", {type: "PLAYING"});
	Bot.logger.info(`Logged in as ${client.user.tag}!`);
});

client.on("message", message => {
	Bot.handleMessage(client, message);
});

client.login(config.DISCORD_TOKEN);
