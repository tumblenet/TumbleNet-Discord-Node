const Discord = require('discord.js');
const client = new Discord.Client();

const DiscordOBJ = require('./discordobj');
const DiscordCommand = DiscordOBJ("command");

const MAINTENANCE = false;
const OWNER_ID = "336869008148135948";
const COMMAND_PREFIX = "!";
const ALLOWED_GUILDS = ["337887798889545728","446981442443149312","379672971112873984"];
const INTERVIEW_CATEGORY = "437378162658115585";
const INTERVIEW_ROLE = "447921996672794645";

var discordCommands = [];

function registerCommand(alias,cmdevent){
  discordCommands.push(new DiscordCommand(alias,cmdevent));
}

function getServer(guildID, callback){
  client.guilds.forEach(server =>{
    if (guildID===server.id) {
      callback(server);
    }
  });
}

function GetCommandList(id=0) {
  if (id == discordCommands.length) {
    return "\n";
  } else {
    return "\n " + COMMAND_PREFIX + discordCommands[id].alias[0] + GetCommandList(id+1);
  }
}

function GetInterviewInfo(message) {
  var data = message.channel.topic.split(" | ")[1].split(":");
  console.log(data);
  var userid = data[0];
  var user = message.guild.members.get(userid);
  data.shift();
  var roles = data.map(roleid=>message.guild.roles.get(roleid));
  return {
    user:user,
    roles:roles
  };
}

registerCommand("ping",function (message, param) {
  message.channel.send('pong');
});

registerCommand("say", function (message, param) {
  console.log(message);
  var files = message.attachments.map(x=>x.url);
  message.delete();
  var messageOptions = {
    tts:message.tts,
    nonce:message.nounce,
    embed:message.embeds,
    files:files,
    split:true
  }
  message.channel.send(param.join(" "),messageOptions);
});

registerCommand("help", function (message, param) {
  message.channel.send("**Commands**\n```" + GetCommandList() + "```");
});

registerCommand("interview", (message, param) => {
  if (message.member.roles.map(x=>x.id).includes(INTERVIEW_ROLE)) {
    message.reply("Only interviewers can run this command");
    return;
  }
  var user = message.mentions.users.first(1)[0];
  var roles = message.mentions.roles;
  message.reply("This would open and interview for " + user.tag + ", appying for " + roles.map(x=>x.name).join(", "));
  message.guild.createChannel(user.tag,"text").then(channel=>{
    user.send("Thanks for your application to TumbleCraft or Tumble Network. We were impressed by your background and would like to invite you to interview in this channel (" + channel.toString() + ") to tell you a little more about the (" + roles.map(x=>x.name).join(", ") + ") position and get to know you better.");
    channel.setParent(INTERVIEW_CATEGORY);
    channel.setTopic("Applying for " + roles.map(x=>x.name).join(", ") + " | " + user.id + ":" + roles.map(x=>x.id).join(":"));
  }).catch(console.error);
});

registerCommand("accept", (message, param) => {
  if (message.member.roles.map(x=>x.id).includes(INTERVIEW_ROLE)) {
    message.reply("Only interviewers can run this command");
    return;
  }
  if (message.channel.parent.id != INTERVIEW_CATEGORY) {
    message.reply("This is not an interview");
    return;
  }
  var interview = GetInterviewInfo(message);
  if (interview == undefined) {
    message.reply("This is not an interview");
    return;
  }
  var roleAcceped = message.mentions.roles.first(1)[0];
  if (interview.member.length > 1 && roleAcceped == undefined) {
    message.reply("In this case you need to specify the role between: " + roles.map(x=>x.name).join(", "));
    return;
  }
  if (roleAcceped != undefined && interview.roles.includes(roleAcceped) ) {
    var index = interview.roles.indexOf(roleAcceped);
    if (index > -1) {
      interview.roles.splice(index, 1);
    }
    channel.setTopic("Applying for " + interview.roles.map(x=>x.name).join(", ") + " | " + interview.user.id + ":" + interview.roles.map(x=>x.id).join(":"));
  } else {
    roleAcceped = interview.roles[0];
    message.channel.delete();
  }
  interview.user.send("Your application for " + roleAcceped.name + " has been accepted. Welcome to the team. https://discord.gg/EJ4TjaK")
  interview.user.addRole(roleAcceped.id);

});

registerCommand("deny", (message, param) => {
  if (message.user.roles.map(x=>x.id).includes(INTERVIEW_ROLE)) {
    message.reply("Only interviewers can run this command");
    return;
  }
  if (message.channel.parent.id != INTERVIEW_CATEGORY) {
    message.reply("This is not an interview");
    return;
  }
  var interview = GetInterviewInfo(message);
  if (interview == undefined) {
    message.reply("This is not an interview");
    return;
  }
  var roleDenyed = message.mentions.roles.first(1)[0];
  if (interview.roles.length > 1 && roleDenyed == undefined) {
    message.reply("In this case you need to specify the role between: " + roles.map(x=>x.name).join(", "));
    return;
  }
  if (roleDenyed != undefined && !interview.roles.includes(roleDenyed)) {
    message.reply("This person did not apply for this role.")
    return;
  }
  if (roleDenyed != undefined) {
    var index = interview.roles.indexOf(roleDenyed);
    if (index > -1) {
      interview.roles.splice(index, 1);
    }
    channel.setTopic("Applying for " + interview.roles.map(x=>x.name).join(", ") + " | " + interview.user.id + ":" + interview.roles.map(x=>x.id).join(":"));
  } else {
    roleDenyed = interview.roles[0];
    message.channel.delete();
  }
  interview.user.send("We are sorry but your application for " + roleDenyed.name + " has been denied. Thank you for your interest.")
});

client.on('ready', () => {
  console.log('I am ready!');
  client.guilds.forEach(guild =>{
    if (ALLOWED_GUILDS.includes(guild.id)) {
      return;
    }
    guild.leave();
  });
});

client.on('message', message => {
  if (message.channel.constructor.name != "TextChannel") {
    return;
  }
  if (message.member == message.guild.me) {
    return;
  }
  if (message.content.charAt(0) == COMMAND_PREFIX) {
    if (MAINTENANCE) {
      message.reply("Sorry, I am under maintenance at the moment. Please ask <@336869008148135948> for more details.");
      return;
    }
    var commandWorked = false;

    var callback = function (command) {
      if (!commandWorked) {
        message.channel.send("Invalid command: `" + command + "`")
      }
    }
    function commandExecuter(command,message) {
      var output = false;
      try {
        output = command.execute(message);
      } catch (e) {
        //output = false;
      console.log(e);
      } finally {

      }
      return output;
    }

    var itemsProcessed = 0;
    discordCommands.forEach((command,index,array) => {
      if (commandWorked) {
        return;
      }
      commandWorked = commandWorked || commandExecuter(command,message);
      itemsProcessed++;
      if(itemsProcessed === array.length) {
        callback(message.content);
      }
    });
  }
});

client.on('guildCreate', guild => {
  if (ALLOWED_GUILDS.includes(guild.id)) {
    return;
  }
  guild.leave();
});

module.exports = client;
