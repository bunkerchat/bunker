var RoomStore = require('./../stores/roomStore');
var Message = require('./Message.jsx');

var tolerance = 31;

var Messages = React.createClass({
	mixins: [
		Reflux.listenTo(RoomStore, 'onStoreUpdate')
	],

	initialize() {

	},

	componentDidMount() {
		this.scroll();
	},

	componentDidUpdate() {
		this.scroll();
	},

	onStoreUpdate(rooms) {
		this.scroll();
	},

	scroll(){
		var el = this.getDOMNode();
		if (el.scrollTop + el.clientHeight + tolerance >= el.scrollHeight) {
			el.scrollTop = el.scrollHeight;
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