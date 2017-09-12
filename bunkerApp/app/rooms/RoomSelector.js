import React from 'react'
import {StyleSheet, View, Text, TouchableHighlight} from 'react-native'
import {connect} from 'react-redux'
import {NavigationActions} from 'react-navigation'

class RoomItem extends React.PureComponent {

	_onPress = () => {
		this.props.onPressItem(this.props.id, this.props.name);
	};

	render() {
		return <TouchableHighlight onPress={this._onPress} style={style.roomItem}><Text>{this.props.name}</Text></TouchableHighlight>
	}
}

class RoomSelector extends React.PureComponent {

	static navigationOptions = ({ navigation }) => ({
		title: 'Rooms',
	})

	_onPressItem = (id, roomName) => {
		this.props.navigation.dispatch(NavigationActions.navigate({
			routeName: 'Room',
			params: {
				roomId: id,
				roomName
			}
		}));
	};

	render() {
		const {rooms} = this.props

		if (rooms && rooms.length) {
			return <View style={style.roomsContainer}>
				{rooms.map(x => <RoomItem key={x._id} name={x.name} onPressItem={this._onPressItem} id={x._id} />)}
			</View>
		}

		return <View style={style.roomsContainer} />;
	}
}

const style = StyleSheet.create({
	roomsContainer: {
		flex: 1,
		flexDirection: 'column'
	},
	roomItem: {
		justifyContent: 'center',
		height: 46,
		paddingLeft: 10,
	},
	separator:{
		marginVertical: 5,
		borderTopColor: 'gray',
		borderTopWidth: StyleSheet.hairlineWidth
	}
})

const mapStateToProps = (state, props) => {
	return { rooms: (state.room && state.room.rooms ? Object.values(state.room.rooms) : []) }
}

const actions = {}

export default connect(mapStateToProps, actions)(RoomSelector)
