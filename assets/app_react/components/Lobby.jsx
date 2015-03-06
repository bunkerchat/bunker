/** @jsx React.DOM */

module.exports = React.createClass({

	render: function () {
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
						<tr >
							<td>
								<a ui-sref="room({roomId: room.id})" href="#/rooms/545b9e7fb1d3970200c0e4a2">BestBuy</a>
							</td>
							<td>are you guys using a requirements randomization engine with bonus obfuscation to gather your requirements</td>
							<td>3 / 7</td>
						</tr>
						<tr >
							<td>
								<a ui-sref="room({roomId: room.id})" href="#/rooms/54490412e7dde30200eb8b41">Classic</a>
							</td>
							<td>Just because I have an opinion doesn't mean I care</td>
							<td>5 / 13</td>
						</tr>
						<tr >
							<td>
								<a ui-sref="room({roomId: room.id})" href="#/rooms/5432ebadc75d67020069f18c">First Room</a>
							</td>
							<td>message refresh fixed :successkid:</td>
							<td>8 / 22</td>
						</tr>
						<tr >
							<td>
								<a ui-sref="room({roomId: room.id})" href="#/rooms/54b5867c9db480f346317812">SecondaryMarkets</a>
							</td>
							<td></td>
							<td>3 / 5</td>
						</tr>
						<tr >
							<td>
								<a ui-sref="room({roomId: room.id})" href="#/rooms/54905996b39886cf2fb76612">The Vidja</a>
							</td>
							<td>the place to sperg about video games :awthanks:</td>
							<td>9 / 15</td>
						</tr>
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
	}
});