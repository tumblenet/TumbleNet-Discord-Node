
const LOG_CHANNEL_ID = ["448433048820908042","449192291173793793"];

function SendUpdate(guild, msg,user,role,title, footer) {
  var channels = LOG_CHANNEL_ID.map(item => guild.channels.get(item));
  channels.forEach(channel=>{
    if (role == undefined) {
      role = guild.me.roles.first(1)[0];
    }
    var embed = {
      author: {
        name: user.username,
        icon_url: user.avatarURL
      },
      title: title,
      footer: footer,
      color: role.color,
      description: msg,
      fields: []
    }
    channel.send({embed:embed});
  });
}

module.exports = {
  SendUpdate: SendUpdate
};
