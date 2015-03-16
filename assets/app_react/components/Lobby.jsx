/** @jsx React.DOM */
var Link = require('react-router').Link;
var RoomStore = require('./../stores/roomStore');

var Room = React.createClass({
	render() {
		var room = this.props.room;
		return (
			<tr>
				<td>
					<Link to="rooms" params={{roomId: room.id}} title={room.topic} >{room.name}</Link>
				</td>
				<td>{room.topic}</td>
				<td>x / x</td>
			</tr>
		)
	}
});

var Lobby = React.createClass({
	mixins: [Reflux.listenTo(RoomStore, 'onStoreUpdate')],

	getInitialState() {
		return RoomStore.getDefaultData();
	},

	onStoreUpdate(rooms) {
		this.setState({rooms});
	},

	render() {
		return (
			<div className="container-fluid" >

				<section className="row">
					<div className="col-md-9">
						<h3>Known rooms</h3>
					</div>
					<div className="col-md-3">
						<form >

							<div className="input-group">
								<input type="text" className="form-control " placeholder="Existing room guid" />

								<span className="input-group-btn">
									<button className="btn btn-success">Join</button>
								</span>
							</div>

						</form>
					</div>
				</section>

				<table className="table">
					<thead>
						<tr>
							<th>Name</th>
							<th>Topic</th>
							<th>
								<i className="fa fa-user"></i>
								Online</th>
						</tr>
					</thead>
					<tbody>
						{this.getRooms()}
					</tbody>
				</table>

				<form className="col-md-3 " >

					<div className="input-group">
						<input type="text" className="form-control " placeholder="New room name" />

						<span className="input-group-btn">
							<button className="btn btn-success">Create</button>
						</span>
					</div>

				</form>

			</div>
		);
	},

	getRooms() {
		return _.map(this.state.rooms, room => {
			return (
				<Room key={room.id} room={room}/>
			);
		});
	}
});

module.exports = Lobby;