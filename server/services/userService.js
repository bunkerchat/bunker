const userService = module.exports;
const User = require("./../models/User");
const UserSettings = require("./../models/UserSettings");
const RoomMember = require("./../models/RoomMember");
const Room = require("./../models/Room");
const socketio = require("../config/socketio");
const RoomService = require("./RoomService");

const InvalidInputError = require("../errors/InvalidInputError");
const ForbiddenError = require("../errors/ForbiddenError");

userService.pendingTasks = {};
userService.connectionUpdateWaitSeconds = 15;

userService.findOrCreateBunkerUser = function(profile) {
	const email = profile.emails[0].value;
	let user;

	return User.findOne({ email: email }).then(function(dbUser) {
		if (dbUser) return dbUser;

		return Promise.join(createNewUser(), Room.findOne({ name: "First" }))
			.spread(function(dbUser, dbRoom) {
				user = dbUser;

				return Promise.join(User.count({}), RoomMember.create({ room: dbRoom, user: user }));
			})
			.spread(function(userCount, roomMember) {
				if (userCount > 1) return;

				// if starting bunker for the first time, make the first logged in user admin of first room
				roomMember.role = "administrator";
				return roomMember.save();
			})
			.then(function() {
				return user;
			});
	});

	function createNewUser() {
		const user = new User({
			//token: accessToken,
			// when no display name, get everything before @ in email
			nick: (profile.displayName || email.replace(/@.*/, "")).substr(0, 20),
			email: email
		});

		user.settings = new UserSettings({ user: user });

		return user.settings.save().then(function() {
			return user.save();
		});
	}
};

userService.disconnectSocket = function(socket) {
	return User.findOne({ sockets: { $elemMatch: { socketId: socket.id } } }).then(user =>
		userService.disconnectUser(user, socket.id)
	);
};

userService.disconnectUser = function(user, socketIds) {
	if (!_.isArray(socketIds)) {
		socketIds = [socketIds];
	}

	if (!user) return;

	_.each(socketIds, socketId => {
		_.remove(user.sockets, { socketId: socketId });
	});

	const connected = user.sockets.length > 0;

	// This code looks strange because:
	// 1: findByIdAndUpdate was not returning a promise
	// 2: doing a user.save() was not updating the user.sockets collection properly
	// and I didn't know how to fix it :-(
	return Promise.fromCallback(callback => {
		User.findByIdAndUpdate(
			user._id,
			{
				sockets: user.sockets,
				connected: connected,
				lastConnected: new Date(),
				typingIn: null
			},
			callback
		);
	}).then(() => {
		if (connected) return;

		const io = require("../config/socketio").io;
		io.to("user_" + user._id).emit("user", {
			_id: user._id,
			verb: "updated",
			data: { connected: connected }
		});
	});
};

userService.setUserNick = (roomMember, text) => {
	const nickMatches = text.match(/^\/nick\s+([\w\s\-\.]{0,19})/i);
	if (!nickMatches || !nickMatches[1]) throw new InvalidInputError("Invalid nick");

	const user = roomMember.user;
	const newNick = nickMatches[1];
	if (user.nick === newNick) throw new InvalidInputError("Nick is already set");

	return Promise.join(
		User.findByIdAndUpdate(user._id, { nick: newNick }, { new: true }),
		RoomMember.find({ user: user._id })
	).spread(function(updatedUser, memberships) {
		socketio.io.to("user_" + updatedUser._id).emit("user", {
			_id: updatedUser._id,
			verb: "updated",
			data: { nick: updatedUser.nick }
		});
		RoomService.messageRooms(_.map(memberships, "room"), user.nick + " changed their handle to " + updatedUser.nick);
	});
};

userService.setInfo = (roomMember, text) => {
	const infoMatch = text.match(/\/setinfo\s+(.+)/i);
	const info = infoMatch[1].substring(0, 50);
	const user = roomMember.user;

	return Promise.join(
		User.findByIdAndUpdate(user._id, { description: info }, { new: true }),
		RoomMember.find({ user: user._id })
	).spread(function(updatedUser, memberships) {
		socketio.io.to("user_" + updatedUser._id).emit("user", {
			_id: updatedUser._id,
			verb: "updated",
			data: { description: updatedUser.description }
		});
		RoomService.messageRooms(_.map(memberships, "room"), updatedUser.nick + " updated their whois info");
	});
};

userService.whois = (roomMember, text) => {
	const nickMatches = text.match(/^\/whois\s+([\w\s\-\.]{0,19})/i);
	const userNick = nickMatches[1];
	const roomId = roomMember.room;

	return RoomService.getRoomMemberByNickAndRoom(userNick, roomId).then(function(whoisUser) {
		if (!whoisUser) throw new InvalidInputError("Could not find user " + userNick);
		const userEmail = whoisUser.user.email;
		const userDescription = whoisUser.user.description;
		let message = "Whois " + whoisUser.user.nick + ": " + userEmail + " -- ";

		if (!userDescription) {
			message += "User has not set their info";
		} else {
			message += userDescription;
		}

		if (userEmail === "peter.brejcha@gmail.com") {
			message += " :petesux:";
		} else if (userEmail === "jprodahl@gmail.com") {
			message += " :joshsux:";
		} else if (userEmail === "polaris878@gmail.com") {
			message += " :drewsux:";
		} else if (userEmail === "alexandergmann@gmail.com") {
			message += " :glensux:";
		}

		RoomService.messageRoom(roomId, message);
	});
};

userService.changeUserRole = (roomMember, text) => {
	if (roomMember.role !== "administrator") throw new ForbiddenError("Must be an administrator to change to promote");

	var newRole;
	const user = roomMember.user;
	const roomId = roomMember.room;

	const match = /^\/(promote|demote)\s+([\w\s\-\.]{0,19})/i.exec(text);
	const action = match[1];
	const userNick = match[2];

	if (user.nick === userNick) throw new InvalidInputError("You cannot promote or demote yourself");

	return RoomService.getRoomMemberByNickAndRoom(userNick, roomId)
		.then(function(roomMemberToPromote) {
			if (!roomMemberToPromote) throw new InvalidInputError("Could not find user " + userNick);

			if (action === "promote") {
				newRole = roomMemberToPromote.role === "member" ? "moderator" : "administrator";
			} else {
				// demote
				newRole = roomMemberToPromote.role === "administrator" ? "moderator" : "member";
			}

			return RoomMember.findByIdAndUpdate(roomMemberToPromote._id, { role: newRole }, { new: true });
		})
		.then(function(promotedMember) {
			socketio.io.to("roommember_" + promotedMember._id).emit("roommember", {
				_id: promotedMember._id,
				verb: "updated",
				data: { role: newRole }
			});

			const message = roomMember.user.nick + " has changed " + userNick + " to " + newRole;
			RoomService.messageRoom(roomId, message);
		});
};
