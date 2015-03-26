var RoomStore = require('./../stores/roomStore');
var Messages = require('./Messages.jsx');
var InputBox = require('./InputBox.jsx');
var MemberList = require('./Memberlist.jsx');

var Room = React.createClass({
	mixins: [
		ReactRouter.Navigation,
		ReactRouter.State,
		Reflux.listenTo(RoomStore, 'onStoreUpdate')
	],

	room: {},

	getStateFromStore: function () {
		return {
			room: RoomStore.rooms[this.getParams().roomId]
		};
	},

	getInitialState: function () {
		return this.getStateFromStore();
	},

	componentWillReceiveProps: function () {
		this.setState(this.getStateFromStore());
		this._filled = false;
		this.fill();
	},

	onStoreUpdate(rooms) {
		var state = this.getStateFromStore();
		this.setState(state);
		this.fill();
	},

	componentDidMount: function () {
		this.fill();
	},

	componentWillUnmount: function () {
		this._filled = false;
	},

	fill() {
		if(this._filled || !this.state.room || !this.state.room.$messages.length) return;

		var windowEl = $(window);
		var el = $(this.getDOMNode()).find('ol.message-list');
		var marginBottom = 0;

		windowEl.resize(function () {

			marginBottom = $('.message-input').height();

			if (window.innerWidth <= 480) {
				el.css({
					height: 'auto'
				});
			}
			else {
				var fillHeight = Math.ceil(window.innerHeight - el.offset().top - marginBottom - 1);
				el.css({
					height: fillHeight + 'px',
					margin: 0
				});
			}
		});

		windowEl.resize();

		this._filled = true;
	},


	render() {
		var room = this.state.room;
		if (!room) return <div></div>;

		return (
			<div>
				<div className="container-fluid">
					<div className="row">
						<div className="col-md-10 col-xs-12 no-gutter">
							<Messages room={room}/>
						</div>
						<MemberList room={room}/>
					</div>
				</div>
				<InputBox room={room}/>
			</div>
		);
	}
});

module.exports = Room;