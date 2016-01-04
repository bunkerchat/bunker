import {Component, View} from 'angular2/core';
import {ROUTER_DIRECTIVES} from 'angular2/router';
import {BunkerData} from './BunkerData';

@Component({
	selector: 'lobby'
})
@View({
	directives: ROUTER_DIRECTIVES,
	template: `
	<ol class="list-unstyled">
		<li [routerLink]="['ChatRoom', {id: room._id}]" *ngFor="#room of rooms">
			<h3>
				{{room.name}}
				<small>{{room.topic}}</small>
			</h3>
		</li>
	</ol>
`
})
export class LobbyComponent {

	public rooms;

	constructor(private _bunkerData:BunkerData) {
		this.rooms = _bunkerData.rooms;
	}
}

