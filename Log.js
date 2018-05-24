
const LOG_CHANNEL_ID = "448433048820908042";

function SendUpdate(guild, msg,user,role,title) {
  var channel = guild.channels.get(LOG_CHANNEL_ID);
  if (role == undefined) {
    role = guild.me.roles.first(1)[0];
  }
  var embed = {
    author: {
      name: user.username,
      icon_url: user.avatarURL
    },
    title: title || "",
    color: role.color,
    description: msg,
    fields: []
  }
  channel.send({embed:embed});
}

module.exports = {
  SendUpdate: SendUpdate
};
