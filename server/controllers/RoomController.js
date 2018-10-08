/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

const ObjectId = require('mongodb').ObjectID;
const Promise = require('bluebird');

const RoomMember = require('../models/RoomMember');
const User = require('../models/User');
const Room = require('../models/Room');
const Message = require('../models/Message');
const PinnedMessage = require('../models/PinnedMessage');

const RoomService = require('../services/RoomService');
const messageService = require('../services/messageService');
const ForbiddenError = require('../errors/ForbiddenError');
const InvalidInputError = require('../errors/InvalidInputError');

// POST /room/:id/message
// Create a new message
module.exports.message = function (req, res) {

	const userId = req.session.userId.toObjectId();
	const roomId = req.body.roomId.toObjectId();
	let currentRoomMember;

	return RoomMember.find({ room: roomId }).populate("user")
		.then(roomMembers => {
			currentRoomMember = _.find(roomMembers, roomMember => roomMember.user._id.toString() === userId.toString());
			if (!currentRoomMember) throw new ForbiddenError('Must be a member of this room');

			// Inform clients that use is not busy and typing has ceased
			const notTypingUpdate = { busy: false, typingIn: null, connected: true };
			req.io.to(`user_${userId}`).emit('user', { _id: userId, verb: 'updated', data: notTypingUpdate });

			return Promise.join(
				User.findByIdAndUpdate(userId, notTypingUpdate),
				messageService.createMessage(currentRoomMember, req.body.text),
				roomMembers
			);
		})
		.spread((userUpdate, message, roomMembers) => {
			if (message && message.author) {
				message.author = message.author._id;
			}

			// Increment unread count for all absent room members
			_(roomMembers)
				.filter(roomMember => {
					const user = roomMember.user;
					return !user.connected || !user.present || !user.activeRoom || user.activeRoom.toString() !== roomId.toString()
				})
				.each(roomMember => {

					// Set unreadStart to now if this is the first message the user has not read
					const unreadStart = roomMember.unreadMessageCount > 0 ? roomMember.unreadStart : Date.now();
					const unreadMessageCount = (roomMember.unreadMessageCount || 0) + 1;
					const mentioned = testTextForNick(message.text, roomMember.user.nick);

					roomMember.unreadStart = unreadStart;
					roomMember.unreadMessageCount = unreadMessageCount;

					// Covering two cases here:
					// If this is the first unread and it's not a mention, set unreadMention to false (reset it basically)
					// If this is not the first unread then leave unreadMention true if it already was or set it to true if mentioned
					roomMember.unreadMention = unreadMessageCount === 1 && !mentioned ? false : roomMember.unreadMention || mentioned;

					return roomMember.save()
						.then(() => {
							req.io.to(`userself_${roomMember.user._id}`).emit('user_roommember', {
								_id: roomMember._id,
								verb: 'updated',
								data: { unreadStart, unreadMessageCount, unreadMention: roomMember.unreadMention }
							});
						})
				});

			res.ok(message)
		})
		.catch(InvalidInputError, function (err) {
			RoomService.messageUserInRoom(currentRoomMember.user._id, currentRoomMember.room, err.message);
			res.badRequest(err);
		})
		.catch(ForbiddenError, res.forbidden)
		.catch(res.serverError);
};

// GET /room/:id
module.exports.findOne = function (req, res) {
	const pk = actionUtil.requirePk(req);
	Promise.join(
		Room.findOne(pk),
		Message.find({ room: pk }).limit(40).populate('author reactions'),
		RoomMember.find({ room: pk }).populate('user')
	)
		.spread(function (room, messages, members) {
			room.$messages = messages;
			room.$members = members;
			return room;
		})
		.then(res.ok)
		.catch(res.serverError);
};

// POST /room
// Create a room
module.exports.create = function (req, res) {
	const userId = req.session.userId;
	const name = req.body.name || 'Untitled';
	let room;

	// Create new instance of model using data from params
	Room.create({ name: name })
		.then(function (_room) {
			room = _room;

			// Make user an administrator
			return RoomMember.create({ room: room._id, user: userId, role: 'administrator' })
		})
		.then(function () {
			res.ok(room.toObject());
		});
};

// GET /room/:id/join
// Join a room
module.exports.join = function (req, res) {
	const roomId = req.body.roomId;
	const userId = req.session.userId;

	Promise.join(
		Room.findById(roomId),
		RoomMember.count({ room: roomId, user: userId })
	)
		.spread(function (room, existingRoomMember) {
			if (!room) {
				return new InvalidInputError('Requested room does not exist');
			}

			if (existingRoomMember > 0) {
				// Already exists!
				return RoomMember.findOne({ room: roomId, user: userId }).populate('user');
			}

			return RoomMember.create({ room: roomId, user: userId })
				.then(function (createdRoomMember) {
					return Promise.join(
						createdRoomMember,
						User.findById(userId).lean(),
						Room.findById(roomId).lean(),
						RoomMember.find({ room: roomId }).populate('user').lean()
					);
				})
				.spread(function (createdRoomMember, user, room, roomMembers) {
					req.io.to('room_' + roomId).emit('room', {
						_id: roomId,
						verb: 'updated',
						data: { $members: roomMembers }
					});

					// Create system message to inform other users of this user joining
					RoomService.messageRoom(roomId, user.nick + ' has joined the room');

					// Add subscriptions for requestor
					req.socket.join('room_' + roomId);
					_.each(roomMembers, function (roomMember) {
						req.socket.join('roommember_' + roomMember._id);
						req.socket.join('user_' + roomMember.user._id);
					});

					// Add subscriptions for existing room members
					_.each(req.io.inRoom('room_' + roomId), function (socket) {
						socket.join('roommember_' + createdRoomMember._id);
						socket.join('user_' + userId);
					});

					return room;
				});
		})
		.then(res.ok)
		.catch(InvalidInputError, function (err) {
			res.badRequest(err);
		})
		.catch(res.serverError);
};

// Current user requesting to leave a room
module.exports.leave = function (req, res) {

	const roomId = req.body.roomId.toObjectId();
	const userId = req.session.userId.toObjectId();

	RoomMember.count({ room: roomId, user: userId })
		.then(function (existingRoomMember) {

			if (existingRoomMember == 0) {
				return 'ok';
			}

			return RoomMember.remove({ room: roomId, user: userId })
				.then(function () {
					return [
						User.findById(userId),
						RoomMember.find({ room: roomId }).populate('user')
					];
				})
				.spread(function (user, roomMembers) {
					req.io.to('room_' + roomId).emit('room', {
						_id: roomId,
						verb: 'updated',
						data: { $members: roomMembers }
					});
					req.socket.leave('room_' + roomId);

					RoomService.messageRoom(roomId, user.nick + ' has left the room');

					// if nothing is returned, the promise on the client doesn't get notified
					return 'ok'
				});
		})
		.then(res.ok)
		.catch(res.serverError);
};

// Get the messages of a room, with optional skip amount
module.exports.messages = function (req, res) {
	const roomId = req.body.roomId.toObjectId();
	const skip = req.body.skip || 0;

	// find finds multiple instances of a model, using the where criteria (in this case the roomId
	// we also want to sort in DESCing (latest) order and limit to 50
	Message.find({ room: roomId }).sort('-createdAt').skip(skip).limit(40).populate('author reactions')
		.then(res.ok)
		.catch(res.serverError);
};

// GET /room/:id/history
// Get historical messages of a room
module.exports.history = function (req, res) {
	const roomId = req.body.roomId.toObjectId();
	const startDate = new Date(req.body.startDate);
	const endDate = new Date(req.body.endDate);

	Message.find({ room: roomId, createdAt: { '$gte': startDate, '$lt': endDate } })
		.sort('createdAt')
		.populate('author reactions')
		.then(res.ok)
		.catch(res.serverError);
};

module.exports.search = function (req, res) {
	const query = req.body.query;
	const roomIds = []
	const userId = req.session.userId.toObjectId();

	RoomMember.find({ user: userId })
		.then(roomMembers => {
			const roomIds = _.map(roomMembers, 'room')

			return Message.find({
				$text: { $search: query },
				room: { $in: roomIds }
			}, {
				score: { $meta: "textScore" }
			})
				.sort({ score: { $meta: 'textScore' } })
				.populate('author reactions')
		})
		.then(res.ok)
		.catch(res.serverError);
};

// GET /room/:id/media
// Get media messages posted in this room
module.exports.media = function (req, res) {
	const roomId = actionUtil.requirePk(req);
	const mediaRegex = /https?:\/\//gi;

	// Native mongo query so we can use a regex
	Message.native(function (err, messageCollection) {
		if (err) res.serverError(err);

		messageCollection.find({
			room: ObjectId(roomId),
			text: { $regex: mediaRegex }
		}).sort({ createdAt: -1 }).toArray(function (err, messages) {
			if (err) res.serverError(err);

			res.ok(_.map(messages, function (message) {
				return _(message)
					.pick(['author', 'text', 'createdAt'])
					.extend({ _id: message._id })
					.value();
			}));
		});
	});
};

// POST /room/:id/pins
module.exports.pinMessage = function (req, res) {

	const roomId = req.body.roomId.toObjectId();
	const messageId = req.body.messageId.toObjectId();
	const userId = req.session.userId.toObjectId();

	// TODO: maybe do these things?
	// get room pins?
	// prune pins?
	// save pinBoard?

	RoomMember.findOne({ room: roomId, user: userId })
		.populate('user')
		.then(function (roomMember) {

			if (!roomMember) {
				throw new ForbiddenError('Must be a member of this room!');
			}

			return [PinnedMessage.create({ message: messageId, room: roomId, user: userId }),
				Message.findOne(messageId).populate('author reactions').populate('room'),
				roomMember.user];
		})
		.spread(function (pinnedMessage, message, user) {

			if (message.room.id !== req.body.roomId) {
				throw new InvalidInputError('Can only pin message to the room it belongs to.');
			}

			if (message.type !== 'standard' && message.type !== 'code' && message.type !== 'quote') {
				throw new InvalidInputError('Can only pin standard, code, and quote messages.');
			}

			pinnedMessage.user = user;
			pinnedMessage.message = message;

			req.io.to('pinnedMessage_' + req.body.roomId).emit('pinboard', {
				_id: req.body.roomId,
				verb: 'messaged',
				data: { pinnedMessage: pinnedMessage, pinned: true }
			});

			res.ok();
		})
		.catch(ForbiddenError, res.serverError)
		.catch(InvalidInputError, res.badRequest)
		.catch(res.serverError);
};

module.exports.unPinMessage = function (req, res) {

	const messageId = req.body.messageId.toObjectId();
	const userId = req.session.userId.toObjectId();
	const roomId = req.body.roomId.toObjectId();

	RoomMember.findOne({ room: roomId, user: userId })
		.then(function (roomMember) {

			if (!roomMember) {
				throw new ForbiddenError('Must be a member of this room!');
			}

			return PinnedMessage.remove({ message: messageId });
		})
		.then(function () {
			const unPinResult = {
				pinnedMessage: { message: { _id: req.body.messageId }, room: req.body.roomId },
				pinned: false
			};

			req.io.to('pinnedMessage_' + req.body.roomId).emit('pinboard', {
				_id: req.body.roomId,
				verb: 'messaged',
				data: unPinResult
			});

			res.ok(unPinResult);
		})
		.catch(res.serverError);
};

const testTextForNick = (text, nick) => {
	const mentionRegex = new RegExp(`${nick}\\b|@[Aa]ll\\b`, "i");
	return mentionRegex.test(text);
};
