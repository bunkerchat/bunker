import {Component} from 'angular2/core';
import {BunkerData} from './BunkerData';
import {LobbyComponent} from './lobby/LobbyComponent';

@Component({
	selector: 'chat',
	viewProviders: [BunkerData],
	directives: [LobbyComponent],
	template: `

	<nav class="navbar navbar-default">
		<div class="container-fluid">
			<a class="navbar-brand">Bunker</a>
		</div>
	</nav>
	<lobby></lobby>
`,
})
export class ChatComponent {
	constructor(bunkerData:BunkerData) {
		bunkerData.init();
	}
}
