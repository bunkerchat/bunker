/** @jsx React.DOM */

module.exports = React.createClass({

	render: function () {
		return (
			<nav className="navbar navbar-default navbar-fixed-top navbar-background" role="navigation" ng-controller="HeaderController as header">
				<div className="container-fluid">
					<div className="navbar-header">
						<a className="navbar-brand" ui-sref="lobby" href="#/">Bunker</a>
					</div>
					<ul className="nav navbar-nav hidden-xs">
						<li >
							<a title="Just because I have an opinion doesn't mean I care" href="#/rooms/54490412e7dde30200eb8b41">Classic</a>
							<span className="badge ng-hide" ng-show="membership.room.$unreadMessages > 0"></span>
						</li>
						<li className="">
							<a title="are you guys using a requirements randomization engine with bonus obfuscation to gather your requirements?" href="#/rooms/545b9e7fb1d3970200c0e4a2">BestBuy</a>
							<span className="badge ng-hide" ng-show="membership.room.$unreadMessages > 0">0</span>
						</li>
						<li ui-sref-active="active" ng-repeat="membership in header.memberships" className="active">
							<a ui-sref="room({roomId: membership.room.id})" title="message refresh fixed :successkid:" href="#/rooms/5432ebadc75d67020069f18c">First Room</a>
							<span className="badge ng-hide" ng-show="membership.room.$unreadMessages > 0">0</span>
						</li>
						<li ui-sref-active="active" ng-repeat="membership in header.memberships" className="">
							<a ui-sref="room({roomId: membership.room.id})" title="the place to sperg about video games :awthanks:" href="#/rooms/54905996b39886cf2fb76612">The Vidja</a>
							<span className="badge ng-hide" ng-show="membership.room.$unreadMessages > 0">0</span>
						</li>
						<li ui-sref-active="active" ng-repeat="membership in header.memberships">
							<a ui-sref="room({roomId: membership.room.id})" title="" href="#/rooms/54b5867c9db480f346317812">SecondaryMarkets</a>
							<span className="badge ng-hide" ng-show="membership.room.$unreadMessages > 0"></span>
						</li>
					</ul>
				</div>
			</nav>
			//<div>
			//	<h1 className="metal">{this.props.band.name}</h1>
			//	<img src={this.props.band.img} style={{ maxHeight: "350px" }} />
			//</div>
		);
	}
});