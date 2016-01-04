declare var io;
declare var _;
declare var moment;

export class BunkerData {

	private socket;
	public rooms = [];
	public users = [];
	public localUser;

	public init():void {
		this.socket = io();
		this.emitAsync('/init').then((data:any) => {
			console.log('init worked!', data);

			// Setup users
			this.users.length = 0;
			_.assign(this.users, _.indexBy(data.users, '_id'));

			// Setup localUser
			this.localUser = data.user;

			// Setup rooms
			_.each(data.rooms, room => {
				this.decorateMessages(room);
				this.rooms.push(room);
			});
		});
	}

	public mentionsUser(text):boolean {
		var regex = new RegExp(this.localUser.nick + '\\b|@[Aa]ll\\b', 'i');
		return regex.test(text);
	}

	public isFirstInSeries(lastMessage, message) {
		return !lastMessage || !lastMessage.author || !message.author || lastMessage.author._id != message.author._id;
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

	private decorateMessages(room) {

		// Resort messages
		room.$messages = _.sortBy(room.$messages, message => {
			return moment(message.createdAt).unix();
		});

		_.each(room.$messages, (message, index) => {
			if (message.author) {
				message.author = this.users[message.author._id || message.author];
			}

			var previousMessage = index > 0 ? room.$messages[index - 1] : null;
			message.$firstInSeries = this.isFirstInSeries(previousMessage, message);
			message.$mentionsUser = this.mentionsUser(message.text);
			//message.$idAndEdited = message._id + '_' + message.editCount;
		});
	}
}
