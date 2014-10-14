
var uuid = require('node-uuid');

module.exports.updateAllWithUser = function(userId, systemMessage) {
    Room.find().populate('members').exec(function (error, rooms) {
        if (error) return false;
        _.each(rooms, function (room) {
            if (_.any(room.members, {id: userId})) {
                Room.publishUpdate(room.id, room);

                // If we were provided a message, send it down to affected rooms
                if(systemMessage) {
                    Room.message(room.id, {
                        id: uuid.v4(),
                        text: systemMessage,
                        room: room.id,
                        createdAt: new Date().toISOString()
                    });
                }
            }
        });
        return true;
    });
};

module.exports.updateAllWithMessageEdit = function(messageId, newMessage) {
    Room.find().populateAll().exec(function (error, rooms) {
        if (error) return false;
        _.each(rooms, function (room) {
            if (_.any(room.messages, {id: messageId})) {
                for(var i = 0; i < room.messages.length; i++){
                    if (room.messages[i].id == messageId){
                        room.messages[i].text = newMessage.text;
                    }
                }
                Room.publishUpdate(room.id, room);
            }
        });
        return true;
    });
};
