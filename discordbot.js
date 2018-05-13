const Discord = require('discord.js');
const client = new Discord.Client();

const DiscordOBJ = require('./discordobj');
const DiscordServer = DiscordOBJ("server");
const DiscordCommand = DiscordOBJ("command");

var discordServers = [];
var discordcommands = [];

function registerServer(server){
  discordServers.push(new DiscordServer(server.id,server.name));
}
function registerCommand(alias,cmdevent){
  discordcommands.push(new DiscordCommand(alias,cmdevent));
}

function getServer(guildID, callback){
  discordServers.forEach(server =>{
    if (guildID===server.id) {
      callback(server);
    }
  });
}

registerCommand("ping",function (message, param) {
  message.channel.send('pong');
});
registerCommand("servers",function (message, param) {
  message.channel.send("**Server List**")
  discordServers.forEach((guild,index,array) => {
    message.channel.send("* " + guild.name);
  });
});

registerCommand("say", function (message, param) {
  message.channel.send(param.join(" "));
});

registerCommand("commands", function (message, param) {
  switch (param.shift()) {
    case "list":
      message.channel.send("**Commands**");
      discordcommands.forEach((command,index,array) => {
        message.channel.send("* " + command.alias[0]);
      });
      break;
    case "add":
      var commandAlias = param.shift();
      message.channel.send("Adding command...");
      switch (param.shift()) {
        case "text":
          var commandTextReplay = param.join(" ");
          registerCommand(commandAlias, function (message, param) {
            message.channel.send(commandTextReplay);
          });
          break;
        default:

      }
      registerCommand()
    break;
    default:
  }
});

registerCommand("invite", function (message,param) {
  message.channel.send("Invite me to your server: https://discordapp.com/api/oauth2/authorize?client_id=445218393163825152&permissions=0&scope=bot")
})

client.on('ready', () => {
  console.log('I am ready!');
  client.guilds.forEach(guild =>{
    guild.me.setNickname("Tumble Network");
    registerServer(guild);
  });
});

client.on('message', message => {
  getServer(message.guild.id,function (server) {
    if (message.content.charAt(0) == server.prefix) {
      message.channel.startTyping();
      var commandWorked = false;

      var callback = function () {
        if (!commandWorked) {
          message.channel.send("Invalid command")
        }
        message.channel.stopTyping();
      }
      var itemsProcessed = 0;
      discordcommands.forEach((command,index,array) => {
        if (commandWorked) {
          return;
        }
        commandWorked = commandWorked || command.execute(message);
        itemsProcessed++;
        if(itemsProcessed === array.length) {
          callback();
        }
      });
    }
  });
});

client.on('guildCreate', guild => {
  guild.me.setNickname("Tumble Network");
  registerServer(guild);
});

module.exports = client;
