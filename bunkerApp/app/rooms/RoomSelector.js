import React from 'react'
import {FlatList, StyleSheet, View, Text, TouchableHighlight} from 'react-native'
import {connect} from 'react-redux'
import {NavigationActions} from 'react-navigation'

class RoomItem extends React.PureComponent {

	_onPress() {
		this.props.onPressItem(this.props.id, this.props.name);
	}

	render() {
		return <TouchableHighlight onPress={this._onPress.bind(this)}><Text>{this.props.name}</Text></TouchableHighlight>
	}
}

class RoomSelector extends React.PureComponent {

	static navigationOptions = ({ navigation }) => ({
		title: 'Rooms',
	})

	_onPressItem(id, roomName) {
		this.props.navigation.dispatch(NavigationActions.navigate({
			routeName: 'Room',
			params: {
				roomId: id,
				roomName
			}
		}));
	}

	_keyExtractor = room => room._id
	_renderItem = ({item, separators}) => <RoomItem name={item.name} onPressItem={this._onPressItem.bind(this)} id={item._id} />
	_itemSeperator = () => <View style={style.separator} />

	render() {
		const {rooms} = this.props
		// Flat list might not be the best for this view.
		return <View style={style.roomsContainer}>
			{rooms && <FlatList
				data={rooms}
				keyExtractor={this._keyExtractor}
				renderItem={this._renderItem}
				ItemSeparatorComponent = {this._itemSeperator}
			/>}
			{!rooms && <Text>Loading!</Text>}
		</View>
	}
}

const style = StyleSheet.create({
	roomsContainer: {},
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
