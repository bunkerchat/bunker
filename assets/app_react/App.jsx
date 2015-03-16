var RouteHandler = require('react-router').RouteHandler;
var Header = require('./components/Header.jsx');

//var MembershipStore = require('./user/membershipStore');
//var UserStore = require('./user/userStore');
//var RoomStore = require('./room/roomStore');

var App =  React.createClass({
	//mixins: [
		//Reflux.listenTo(MembershipStore, 'onMembershipStoreUpdate'),
		//Reflux.listenTo(UserStore, 'onUserStoreUpdate'),
		//Reflux.listenTo(RoomStore, 'onRoomStoreUpdate')],

	//getInitialState() {
	//	return {
	//		roomMembers: [],
	//		currentUser: {},
	//		rooms: []
	//	};
	//},

	//onMembershipStoreUpdate(roomMembers) {
	//	this.setProps({roomMembers});
	//},
	//
	//onUserStoreUpdate(currentUser) {
	//	this.setProps({currentUser});
	//},
	//
	//onRoomStoreUpdate(rooms) {
	//	this.setProps({rooms});
	//},

	render () {
		return (
			<div>
				<Header />
				<RouteHandler/>
			</div>
		);
	}
});

module.exports = App;