import {Injectable} from 'angular2/core';

declare var io;
declare var _;

@Injectable()
export class BunkerData {

	private socket:any;
	public rooms:Array<any> = [];

	public init():void {
		this.socket = io();
		this.emitAsync('/init').then((data:any) => {
			_.each(data.rooms, room => {
				this.rooms.push(room);
			});
			console.log('init worked!', data, this.rooms);
		});
	}

	private emitAsync(endpoint:string, data?:any) {
		var socket = this.socket;
		return new Promise((resolve, reject) => {
			socket.emit(endpoint, data, returnData => {
				if (returnData && returnData.serverErrorMessage) {
					console.error(returnData.serverErrorMessage, {
						endpoint: endpoint,
						data: data,
						returnData: returnData
					});
					return reject(returnData);
				}
				resolve(returnData);
			});
		});
	}
}
