var userService = module.exports;

var User = require('./../models/User');
var UserSettings = require('./../models/UserSettings');
var RoomMember = require('./../models/RoomMember');
var Room = require('./../models/Room');

userService.pendingTasks = {};
userService.connectionUpdateWaitSeconds = 15;

userService.findOrCreateBunkerUser = function (profile) {
	var email = profile.emails[0].value;
	var user;

	return User.findOne({email: email})
		.then(function (dbUser) {
			if (dbUser) return dbUser;

			return Promise.join(
				createNewUser(),
				Room.findOne({name: 'First'})
			)
				.spread(function (dbUser, dbRoom) {
					user = dbUser;

					return Promise.join(
						User.count({}),
						RoomMember.create({room: dbRoom, user: user})
					);
				})
				.spread(function (userCount, roomMember) {
					if (userCount > 1) return;

					// if starting bunker for the first time, make the first logged in user admin of first room
					roomMember.role = 'administrator';
					return roomMember.save();
				})
				.then(function () {
					return user;
				});
		});

	function createNewUser() {
		var user = new User({
			//token: accessToken,
			// when no display name, get everything before @ in email
			nick: (profile.displayName || email.replace(/@.*/, "")).substr(0, 20),
			email: email
		});

		user.settings = new UserSettings({user: user});

		return user.settings.save()
			.then(function () {
				return user.save();
			});
	}
};

userService.disconnectSocket = function (socket) {
	return User.findOne({sockets: {$elemMatch: {socketId: socket.id}}})
		.then(user=> userService.disconnectUser(user, socket.id));
};

userService.disconnectUser = function (user, socketId) {
	if (!user) return;
	if (socketId) {
		_.remove(user.sockets, {socketId: socketId});
	}

	user.connected = user.sockets.length > 0;
	user.lastConnected = new Date();
	user.typingIn = null;

	user.save().then(() => {
		if (user.connected) return;

		var io = require('../config/socketio').io;
		io.to('user_' + user._id).emit('user', {
			_id: user._id,
			verb: 'updated',
			data: {connected: user.connected}
		});
	});
};

