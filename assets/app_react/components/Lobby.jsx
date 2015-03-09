/** @jsx React.DOM */
var MembershipStore = require('./../user/membershipStore');

module.exports = React.createClass({

	render: function () {
		var rooms = this.rooms();
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
						{rooms}
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

	rooms: function () {
		return MembershipStore.memberships.map(function (roomMember) {
			var room = roomMember.room;
			return (
				<tr >
					<td>
						<a href="#/rooms/{room.id}">{room.name}</a>
					</td>
					<td>{room.topic}</td>
					<td>x / x</td>
				</tr>
			)
		});
	}
});