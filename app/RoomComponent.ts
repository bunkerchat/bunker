import {Component, View, Input} from 'angular2/core';
import {BunkerData} from './BunkerData';

@Component({
	selector: 'room'
})
@View({
	template: `
	<div class="topic">
		{{room.topic}}
	</div>
	<ol class="message-list">
		<li *ngFor="#message of room.$messages">
			<div class="message-author-image" *ngIf="message.$firstInSeries">
				<div class="message-author hidden-xs" *ngIf="message.author">
					{{message.author.nick}}
				</div>
			</div>
			<div class="message-content">
				<div class="message-author" *ngIf="message.$firstInSeries && message.author">
					{{message.author.nick}}
				</div>
				{{message.text}}
			</div>
		</li>
	</ol>
	`
})
export class RoomComponent {
	@Input('room-data') room;

	constructor() {
	}
}
