import React from 'react'
import _ from 'lodash'
import {FlatList, StatusBar, StyleSheet, View, Text, Button} from 'react-native'
import {connect} from 'react-redux'
import BunkerMessage from './BunkerMessage'

class RoomScreen extends React.PureComponent {

	navigationOptions = ({ navigation }) => ({
		title: `Chat with ${navigation.state.params.user}`,
	})

	// https://facebook.github.io/react-native/docs/flatlist.html
	_keyExtractor = message => message._id
	_renderItem = ({item, separators}) => <BunkerMessage message={item} {...this.props} />
	_itemSeperator = () => <View style={style.separator} />

	render() {
		const {messages} = this.props
		return <View style={style.roomContainer}>
			<FlatList
				data={messages}
				keyExtractor={this._keyExtractor}
				renderItem={this._renderItem}
				ItemSeparatorComponent = {this._itemSeperator}
			/>
		</View>
	}
}

const style = StyleSheet.create({
	roomContainer: {},
	separator:{
		marginVertical: 5,
		borderTopColor: 'gray',
		borderTopWidth: StyleSheet.hairlineWidth
	}
})

const mapStateToProps = (state, props) => {
	// when drew wires up navigation, the roomId will come in here
	//const {roomId} = props.navigation.state.params

	// HACK: get the first room id
	const roomId = _.keys(state.room.rooms)[0]
	if(!roomId) return {}

	const room = state.room.rooms[roomId]

	return {
		room,
		messages: room.$messages
	}
}

const actions = {}

export default connect(mapStateToProps, actions)(RoomScreen)
