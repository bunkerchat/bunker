import { createSelector } from "@reduxjs/toolkit";

export const getRooms = state => state.rooms;
export const getRoomIds = createSelector([getRooms], (rooms = {}) => Object.keys(rooms));
export const getActiveRoomId = state => state.room.activeRoomId;
export const getActiveRoom = state => getRooms(state)[getActiveRoomId(state)];
