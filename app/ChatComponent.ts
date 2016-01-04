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
	<lobby [ngClass]="{hide: !!selectedRoom}"></lobby>
	<room [ngClass]="{hide: selectedRoom != room._id}" [room-data]="room" *ngFor="#room of rooms"></room>
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
		//return true; // will allow route to change but reloads the component :[
		return false;
	}
}
