var RoomStore = require('./../stores/roomStore');
var Message = require('./Message.jsx');

var tolerance = 31;

var Messages = React.createClass({
	mixins: [
		Reflux.listenTo(RoomStore, 'onStoreUpdate')
	],

	initialize() {
		//var el = this._el = $(this.getDOMNode()).find('ol');
		//this.el.bind('scroll', function () {
		//	// We're at the top
		//	if (el.scrollTop == 0) {
		//		var originalHeight = el.scrollHeight;
		//		el.scrollTop = el.scrollHeight - originalHeight;
		//	}
		//});
	},

	componentDidMount() {
		var el = $(this.getDOMNode()).find('ol');
		el.scrollTop(1000);
	},

	componentDidUpdate() {
		var el = $(this.getDOMNode()).find('ol');
		el.scrollTop(1000);
	},

	onStoreUpdate(rooms) {
		//var el = $(this.getDOMNode()).find('ol');
		var el = $(this.getDOMNode()).find('ol');

		el.scrollTop(1000);

		// We're at the bottom
		//if (el.scrollTop + el.clientHeight + tolerance >= el.scrollHeight) {
		//	el.scrollTop = el.scrollHeight;
		//}
	},

	render() {
		return (
			<div className="container-fluid">
				<div className="row">
					<div className="col-md-10 col-xs-12 no-gutter">
						<div>
							<ol className="list-unstyled message-list">
								{this.getMessages()}
							</ol>
						</div>
					</div>
				</div>
			</div>
		);
	},

	getMessages() {
		return _(this.props.room.$messages).map(message => {
			return (
				<Message key={message.id} message={message}/>
			)
		});
	}
});

module.exports = Messages;