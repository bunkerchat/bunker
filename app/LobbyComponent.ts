import {Component, View} from 'angular2/core';
import {BunkerData} from './BunkerData';

@Component({
	selector: 'lobby'
})
@View({
	template: `
	<ol class="list-unstyled">
		<li (click)="selectRoom(room._id)" *ngFor="#room of rooms">
			<h3>
				{{room.name}}
				<small>{{room.topic}}</small>
			</h3>
		</li>
	</ol>
`
})
export class LobbyComponent {

	constructor(private bunkerData:BunkerData) {
	}

	public selectRoom(roomId:string) {
	}
}

