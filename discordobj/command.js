function DiscordCommand(alias, cmdevent){
  this.alias = []
  this.alias.push(alias);
  this.cmdevent = cmdevent;
  this.whitelist = false;
  this.users = [];
}

DiscordCommand.prototype.addAlias = function (newalias) {
  this.alias.push(newalias);
};

DiscordCommand.prototype.addUser = function (newuser) {
  this.lockedtousers = true;
  this.users.push(newuser)
};
DiscordCommand.prototype.removeUser = function (id) {
  this.users[id] = null;
  if (this.users == []) {
    this.whitelist = false;
  }
};

DiscordCommand.prototype.execute = function (prefix,message) {
  var usercommand = message.content.split(" ");
  if (this.whitelist || this.users.includes(message.member)) {

  }
  if (this.alias.includes(usercommand[0].substr(prefix.length))) {
    usercommand.shift();

    this.cmdevent(message, usercommand);
    return true;
  }
  return false;
};

module.exports = DiscordCommand;
