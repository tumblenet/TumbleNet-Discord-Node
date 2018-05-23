const moment = require('moment-timezone');

var GUILD_ID = "441158487939088385";
var TIMEZONE_ID = "448790400019202079";

var WHAT_TIME_ID = "448853592305303554";

var guild;
var channel;

function timeZoneSort(a,b) {
  var aOffsetText = a.name.replace("UTC","").replace(":",".");
  var bOffsetText = b.name.replace("UTC","").replace(":",".");
  var aOffset = parseFloat(aOffsetText,10);
  var bOffset = parseFloat(bOffsetText,10);
  //var a12Distance = Math.Mod(12-aOffset,12);
  //var b12Distance = Math.Mod(12-bOffset,12)
  //console.log(a.name + "-" + b.name);
  return aOffset - bOffset;
}

function GetTime(zone) {
  return moment().utcOffset(zone.replace("UTC",""));
}
function GetTimeRaw(zone) {
  return moment().utcOffset(zone.replace("UTC","")).format("H.mm")
}
function GetDayNight(zone) {
  var rawTime = GetTimeRaw(zone.name);
  //console.log(rawTime);
  var role;
  if (rawTime < 6 || rawTime > 20) {
    role = guild.roles.find("name","Asleep");;
    zone.members.array().forEach((member) =>{
      member.addRole(role);
    })
    return role;
  }
  role = guild.roles.find("name","Awake");
  zone.members.array().forEach((member) =>{
    member.addRole(role);
  })
  return role;
}

function UpdateTimes(client) {
  guild = client.guilds.get(GUILD_ID);
  channel = guild.channels.get(TIMEZONE_ID);
  guild.channels.get(WHAT_TIME_ID).send(".").then(msg=>{
    msg.channel.bulkDelete(100);
  })
  var message;
  function UpdateTimeZones() {
    var roles = guild.roles.filter(role=>role.name.startsWith("UTC"));


    var timeZoneList = roles.sort(timeZoneSort).map(role => role.name + ": " + GetDayNight(role).toString() + " (" + GetTime(role.name).format("h:mm a") + ")");
    message.edit(timeZoneList.join("\n"));
  }
  channel.send(".").then(msg => {
    msg.channel.bulkDelete(2);
    msg.channel.send("Loading Timezones...").then(msg => {
      message = msg;
      setInterval(() =>{
        UpdateTimeZones()
      },1000);
    });
  });
};

function GetTimeZone(message) {
  var roles = guild.roles.filter(role=>role.name.startsWith("UTC"));
  var userTime = moment();
  userTime.set("hour",message.content.split(":")[0]);
  userTime.set("minuite",message.content.split(":")[1]);

  roles.forEach(role=>{
    var roleTime = GetTime(role.name);
    if (userTime.format("h:mm a") == roleTime.format("h:mm a")||
        message.content == roleTime.format("h:mm a")||
        message.content == roleTime.format("H:mm")) {
      console.log(userTime.format("h:mm a") + " == (" + role.name + ") " + roleTime.format("h:mm a"));
      message.member.addRole(role.id);
      return;
    }
    message.member.removeRole(role.id);
  })
}

module.exports = {
  UpdateTimes:UpdateTimes,
  GetTimeZone:GetTimeZone,
  WHAT_TIME_ID: WHAT_TIME_ID
};
