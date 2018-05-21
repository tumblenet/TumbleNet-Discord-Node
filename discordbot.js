const Discord = require('discord.js');
const client = new Discord.Client();

const DiscordOBJ = require('./discordobj');
const DiscordCommand = DiscordOBJ("command");

const MAINTENANCE = false;
var ME_ID = undefined;
const OWNER_ID = "336869008148135948";
const COMMAND_PREFIX = "!";
const ALLOWED_GUILDS = ["337887798889545728","446981442443149312","379672971112873984"];
const GUILD = {
  TUMBLE_NETWORK:0,
  TUMBLES_BOTS:1,
  DISCORD_TESTING:2
}
const INTERVIEW_CATEGORY = ["437378162658115585","447858657732853760","447842208591118336"];
const INTERVIEWER_ROLE = ["447045670126485505","","448161562923106305"];
const INTERVIEWEE_ROLE = ["447050858866278402","","448187974312525838"];
const STAFF_ROLES = [[
  "447054701662568479",//@TumbleNetwork Team
  "447048339179962373",//Builder
  "447048289326727177",//World Painter
  "447048623671214080",//StoryWiter
  "447048965179965450",//3dMolder
  "447049362674024458",//Developer
  "447044657877090304",//Admin
  "447044714110255114",//Mod
  "447047765667872768",//Helper
  "447054255606726686",//Journalist
  "447048353063370763",//SupportTeam
  "447045670126485505",//Interviewer
],[],[],[]];
const STAFF_ROLE = ["447046714512375819","",""]

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
  var guildType = ALLOWED_GUILDS.indexOf(message.guild.id);
  console.log("iNTERVIEW rOLE: " + INTERVIEWER_ROLE[guildType]);

  if (INTERVIEWER_ROLE[guildType] != "" && !message.member.roles.map(x=>x.id).includes(INTERVIEWER_ROLE[guildType])) {
    message.reply("Only interviewers can run this command");
    return;
  }
  var user = message.mentions.users.first(1)[0];
  if (user == undefined) {
    message.reply("You need to specify a user.");
    return
  }
  var roles = message.mentions.roles;
  if (roles.array().length < 1) {
    message.reply("You need to specify at least 1 role.");
    return;
  }
  message.reply("This would open and interview for " + user.tag + ", appying for " + roles.map(x=>x.name).join(", "));
  var category = message.guild.channels.get(INTERVIEW_CATEGORY[guildType]);

  message.guild.createChannel(user.tag,"text",category.permissionOverwrites.array()).then(channel=>{
    user.send("Thanks for your application to TumbleCraft or Tumble Network. We were impressed by your background and would like to invite you to interview in this channel (" + channel.toString() + ") to tell you a little more about the (**" + roles.map(x=>x.name).join("**, **") + "**) position and get to know you better.");
    message.guild.members.get(user.id).addRole(INTERVIEWEE_ROLE[guildType]);
    channel.setParent(INTERVIEW_CATEGORY[guildType]);
    channel.setTopic("Applying for " + roles.map(x=>x.name).join(", ") + " | " + user.id + ":" + roles.map(x=>x.id).join(":"));
    channel.overwritePermissions(user, {
      VIEW_CHANNEL: true
    });
  }).catch(console.error);
});

registerCommand("accept", (message, param) => {
  var guildType = ALLOWED_GUILDS.indexOf(message.guild.id);
  if (INTERVIEWER_ROLE[guildType] != "" && !message.member.roles.map(x=>x.id).includes(INTERVIEWER_ROLE[guildType])) {
    message.reply("Only interviewers can run this command");
    return;
  }
  if (message.channel.parent.id != INTERVIEW_CATEGORY[guildType]) {
    message.reply("This is not an interview");
    return;
  }
  var interview = GetInterviewInfo(message);
  if (interview == undefined) {
    message.reply("This is not an interview");
    return;
  }
  var roleAcceped = message.mentions.roles.first(1)[0];
  if (interview.roles.length > 1 && roleAcceped == undefined) {
    message.reply("In this case you need to specify the role between: " + interview.roles.map(x=>x.name).join(", "));
    return;
  }
  if (roleAcceped != undefined && interview.roles.includes(roleAcceped) ) {
    var index = interview.roles.indexOf(roleAcceped);
    if (index > -1) {
      interview.roles.splice(index, 1);
    }
    message.channel.setTopic("Applying for " + interview.roles.map(x=>x.name).join(", ") + " | " + interview.user.id + ":" + interview.roles.map(x=>x.id).join(":"));
  } else {
    roleAcceped = interview.roles[0];
    message.channel.delete();
  }
  interview.user.send("Your application for " + roleAcceped.name + " has been accepted. Welcome to the team. https://discord.gg/EJ4TjaK");
  message.member.send("You have accepted " + interview.user.displayName + " as a " + roleAcceped.name);
  interview.user.addRole(roleAcceped.id);
  interview.user.removeRole(INTERVIEWEE_ROLE[guildType]);
  if (STAFF_ROLES[guildType].includes(roleAcceped)) {
    interview.user.addRole(STAFF_ROLE[guildType]);
  }
});

registerCommand("deny", (message, param) => {
  var guildType = ALLOWED_GUILDS.indexOf(message.guild.id);
  if (INTERVIEWER_ROLE[guildType] != "" && !message.member.roles.map(x=>x.id).includes(INTERVIEWER_ROLE[guildType])) {
    message.reply("Only interviewers can run this command");
    return;
  }
  if (message.channel.parent.id != INTERVIEW_CATEGORY[guildType]) {
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
    message.reply("In this case you need to specify the role between: " + interview.roles.map(x=>x.name).join(", "));
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
    message.channel.setTopic("Applying for " + interview.roles.map(x=>x.name).join(", ") + " | " + interview.user.id + ":" + interview.roles.map(x=>x.id).join(":"));
  } else {
    roleDenyed = interview.roles[0];
    message.channel.delete();
  }
  interview.user.removeRole(INTERVIEWEE_ROLE[guildType]);
  interview.user.send("We are sorry, your application for **" + roleDenyed.name + "** has unfortunately been denied. Thank you for your interest, and enjoy the server.");
  message.member.send("You have denied " + interview.user.toString() + " as a **" + roleDenyed.name + "**");
});

client.on('ready', () => {
  console.log('I am ready!');
  ME_ID = client.user.id;
  client.guilds.forEach(guild =>{
    if (ALLOWED_GUILDS.includes(guild.id)) {
      return;
    }
    guild.leave();
  });
});

client.on('message', message => {
  if (message.author.id == ME_ID) {
    return;
  }
  if (message.channel.constructor.name != "TextChannel") {
    var replies = [
      "I cannot help you with that because I am a bot. Please ask a more \"*human*\" staff member for assistance",
      "I dont even know what your saying. Well, I do, you said: (" + message.content + ") but I dont know what to do with that information, because I wasnt given what to do depending on if a user DMs me.",
      "What are you doing?! I AM A **BOT**!!",
      "All I'm told to do is say one of these random pharases",
      "I only have #REPLIES_NUM# phases i could say here, stop trying to run <@" + OWNER_ID + "> dry of random replies.",
      "*Message from owner (<@" + OWNER_ID + ">):* Stop making my bot say all of these phases, Im not coming up with anymore."
    ]
    replies = replies.map(x=>x.replace("#REPLIES_NUM#", replies.length));

    message.reply(replies[Math.floor(Math.random() * replies.length)])
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
      var output = true;
      try {
        output = command.execute(message);
      } catch (e) {
        //output = false;
        message.reply("There was an error running that command.",{
          embed:{
            description:"" + e
          }
        })
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
