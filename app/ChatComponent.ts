import {Component, View} from 'angular2/core';
import {NgClass} from 'angular2/common';
import {CanDeactivate, RouteParams, ROUTER_DIRECTIVES, ComponentInstruction} from 'angular2/router';
import {BunkerData} from './BunkerData';
import {LobbyComponent} from './LobbyComponent';
import {RoomComponent} from './RoomComponent';

@Component({
	selector: 'chat'
})
@View({
	directives: [LobbyComponent, RoomComponent].concat(ROUTER_DIRECTIVES),
	template: `
	<nav class="navbar navbar-default">
		<div class="container-fluid">
			<a class="navbar-brand" [routerLink]="['ChatLobby']">Bunker</a>
		</div>
	</nav>
	<lobby [ngClass]="{hide: !!selectedRoom}"></lobby>
	<room [ngClass]="{hide: selectedRoom != room._id}" [room-data]="room" *ngFor="#room of rooms"></room>
`
})
export class ChatComponent implements CanDeactivate {

	public selectedRoom:string;
	public rooms:Array<any>;

	constructor(private _bunkerData:BunkerData, private _routeParams: RouteParams) {
		this.rooms = _bunkerData.rooms;
		this.selectedRoom = _routeParams.params['id'];
	}

	routerCanDeactivate(next: ComponentInstruction) {
		this.selectedRoom = next.params['id'];
		console.log(this.selectedRoom);
		return false;
	}
}
