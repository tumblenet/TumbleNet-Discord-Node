const webserverlog = require('webserver-log');

const discordbot = require('./discordbot.js');

const config = require('./config/token.js');

discordbot.login(process.env.DISCORD_TOKEN || config.token);
