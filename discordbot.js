const Discord = require('discord.js');
const client = new Discord.Client();

const DiscordOBJ = require('./discordobj');
const DiscordServer = DiscordOBJ("server");
const DiscordCommand = DiscordOBJ("command");

var discordServers = [];
var discordcommands = [];
var quizmaster;

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
});

registerCommand("setPrefix", function (message,param) {
  getServer(message.guild.id,function (server) {
    message.channel.send("setting prefix...");
    server.setPrefix(param.shift().charAt(0));
    message.channel.send("Server prefix changed from " + server.oldprefix + " to " + server.prefix);
  });
});

client.on('ready', () => {
  console.log('I am ready!');
  client.guilds.forEach(guild =>{
    guild.me.setNickname("Tumble Network");
    registerServer(guild);
  });
});

client.on('message', message => {
  if (message.member == message.guild.me) {
    return;
  }
  getServer(message.guild.id,function (server) {
    message.delete();
    if (message.content.charAt(0) == server.oldprefix) {
      message.channel.send("Server prefix changed from " + server.oldprefix + " to " + server.prefix);
    }
    if (message.content.charAt(0) == server.prefix) {
      var commandWorked = false;

      var callback = function (command) {
        if (!commandWorked) {
          message.channel.send("Invalid command: `" + command + "`")
        }
      }
      var itemsProcessed = 0;
      discordcommands.forEach((command,index,array) => {
        if (commandWorked) {
          return;
        }
        commandWorked = commandWorked || command.execute(message);
        itemsProcessed++;
        if(itemsProcessed === array.length) {
          callback(message.content);
        }
      });
    }
  });
  message.addReaction(":yum:");
});

client.on('guildCreate', guild => {
  guild.me.setNickname("Tumble Network");
  registerServer(guild);
});

module.exports = client;
