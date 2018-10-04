const handlers = {
	"init/received": (state, action) => ({ byRoom: _.keyBy(action.data.memberships, "room") }),
	"localRoomMember/updated": (state, action) => {
		const existing = _.find(state.byRoom, { _id: action.roomMember._id });
		return {
			...state,
			byRoom: {
				...state.byRoom,
				[existing.room]: {
					...state.byRoom[existing.room],
					...action.roomMember
				}
			}
		};
	}
};

export default function(state = {}, action) {
	return handlers[action.type] ? handlers[action.type](state, action) : state;
}
