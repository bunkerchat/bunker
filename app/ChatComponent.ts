import {Component, View, OnInit} from 'angular2/core';
//import {Router, Route, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {BunkerData} from './BunkerData';
import {LobbyComponent} from './LobbyComponent';
import {RoomComponent} from './RoomComponent';

@Component({
	selector: 'chat',
	viewProviders: [BunkerData]
})
@View({
	directives: [LobbyComponent, RoomComponent],
	template: `
	<nav class="navbar navbar-default">
		<div class="container-fluid">
			<a class="navbar-brand" (click)="selectRoom('')">Bunker</a>
		</div>
	</nav>
	<lobby></lobby>
	<room [room-data]="room" *ngFor="#room of rooms"></room>
`
})
export class ChatComponent implements OnInit {

	public rooms:Array<any>;

	constructor(private bunkerData:BunkerData) {
	}

	ngOnInit() {
		this.bunkerData.init();
		this.rooms = this.bunkerData.rooms;
	}

	selectRoom(roomId:string) {
	}
}
