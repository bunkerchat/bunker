import {Component, View, Input} from 'angular2/core';
import {BunkerData} from './BunkerData';

@Component({
	selector: 'room'
})
@View({
	template: `<h1>Hi, I'm a room named {{room.name}}</h1>`
})
export class RoomComponent {
	@Input('room-data') room;

	constructor() {
	}
}
