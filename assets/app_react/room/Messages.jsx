var RoomStore = require('./../stores/roomStore');
var Message = require('./Message.jsx');

var tolerance = 31;

var Messages = React.createClass({
	mixins: [
		ReactRouter.Navigation,
		ReactRouter.State,
		Reflux.listenTo(RoomStore, 'onStoreUpdate')
	],

	initialize() {

	},

	componentDidMount() {
		this.scroll();
	},

	//componentWillReceiveProps(){
	//},

	componentDidUpdate() {
		this.scroll();
	},

	onStoreUpdate(rooms) {
		this.scroll();
	},

	scroll(forceScroll){
		var roomId = this.getParams().roomId;

		if(!forceScroll){
			forceScroll = roomId != this._lastScrolledRoomId;
		}

		var el = this.getDOMNode();
		if (forceScroll || (el.scrollTop + el.clientHeight + tolerance >= el.scrollHeight)) {
			setTimeout(() => {
				el.scrollTop = el.scrollHeight;
				this._lastScrolledRoomId = roomId;
			});
		}
	},

	render() {
		return (
			<ol className="list-unstyled message-list">
				{this.getMessages()}
			</ol>
		);
	},

	getMessages() {
		var room = this.props.room;
		return _(room.$messages).map(message => {
			return (
				<Message key={message.id} message={message} room={room}/>
			)
		});
	}
});

module.exports = Messages;