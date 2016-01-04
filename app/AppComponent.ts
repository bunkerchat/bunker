import {Component, View, OnInit} from 'angular2/core';
import {Router, Route, RouteConfig, ROUTER_DIRECTIVES} from 'angular2/router';
import {BunkerData} from './BunkerData';
import {ChatComponent} from './ChatComponent';

@Component({
	selector: 'bunker',
	viewProviders: [BunkerData]
})
@View({
	directives: ROUTER_DIRECTIVES,
	template: `
	<router-outlet></router-outlet>
`
})
@RouteConfig([
	{path: '/rooms', component: ChatComponent, name: 'ChatLobby', useAsDefault: true},
	{path: '/rooms/:id', component: ChatComponent, name: 'ChatRoom'},
])
export class AppComponent implements OnInit {

	constructor(private bunkerData:BunkerData) {
	}

	ngOnInit() {
		this.bunkerData.init();
	}
}
