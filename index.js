const webserverlog = require('webserver-log');

const discordteken = process.env.DISCORD_TOKEN
 || require('./discordbot.js').token;

const config = require('./config/token.js');

discordbot.login(discordtoken);
