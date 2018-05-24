const GUILD_IDS = ["337887798889545728","441158487939088385"]
const LOG_CHANNEL_ID = ["448433048820908042","449192291173793793"];

function SendUpdate(msg,user,role,title, footer) {
  var guilds = GUILD_IDS.map(id=>user.client.guilds.get(id));
  gulds.forEach(guild=>{
    var channels = LOG_CHANNEL_ID.map(id => guild.channels.get(id));
    //console.log(channels);
    channels.forEach(channel => {
      if (channel == undefined) {
        return;
      }
      if (role == undefined) {
        role = guild.me.roles.first(1)[0];
      }
      var embed = {
        author: {
          name: user.username,
          icon_url: user.avatarURL
        },
        title: title,
        footer: {text:footer,icon_url:undefined},
        color: role.color,
        description: msg,
        fields: []
      }
      channel.send({embed:embed});
    });
  })
}

module.exports = {
  SendUpdate: SendUpdate
};
