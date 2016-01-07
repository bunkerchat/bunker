import {Component, View} from 'angular2/core';
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
			<a class="navbar-brand" [routerLink]="['ChatRoom', {id: null}]">Bunker</a>
			<ul class="nav navbar-nav hidden-xs">
				<li ui-sref-active="active" *ngFor="#room of rooms">
					<a [routerLink]="['ChatRoom', {id: room._id}]" title="room.title">
						{{room.name}}
					</a>
				</li>
			 </ul>
		</div>
	</nav>
	<lobby [hidden]="!!selectedRoom"></lobby>
	<room [hidden]="selectedRoom != room._id" [room-data]="room" *ngFor="#room of rooms"></room>
`
})
export class ChatComponent implements CanDeactivate {

	public selectedRoom:string;
	public rooms:Array<any>;

	constructor(private _bunkerData:BunkerData, private _routeParams:RouteParams) {
		this.rooms = _bunkerData.rooms;
		this.selectedRoom = _routeParams.params['id'];
	}

	routerCanDeactivate(next:ComponentInstruction) {
		this.selectedRoom = next.params['id'];
		console.log(this.selectedRoom);

		// Is this a hack? Possibly...
		// Lobby and all rooms are loaded and shown/hidden as the user navigates but the ChatComponent always stays loaded
		// This function prevents it from being navigated away from while still allowing us to use Angular's router
		// There might be better ways to accomplish this

		if(this.selectedRoom) {
			var state = {name: 'lobby', url: '/2/rooms'};
		}
		else {
			var state = {name: 'chat.room', url: '/2/rooms/' + this.selectedRoom}
		}
		window.history.pushState(state, state.name, state.url);
		return false;
	}
}
