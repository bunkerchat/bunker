
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
        // todo: learn underscore
        for(var i = 0; i < rooms.length; i++){
            var room = rooms[i];
            for(var j = 0; j < room.messages.length; j++){
                var message = room.messages[j];
                if (message.id == messageId){
                    rooms[i].messages[j] = newMessage;

                    Room.publishUpdate(room.id, rooms[i]);
                    return true;
                }
            }
        }

        return true;
    });
};
