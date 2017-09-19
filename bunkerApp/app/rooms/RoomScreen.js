import React from 'react'
import {FlatList, KeyboardAvoidingView, StyleSheet, View, TextInput, Button} from 'react-native'
import {connect} from 'react-redux'
import BunkerMessage from './BunkerMessage'
import MessageBox from './MessageBox'

class RoomScreen extends React.PureComponent {

	static navigationOptions = ({ navigation }) => ({
		title: navigation.state.params.roomName,
	});

	// https://facebook.github.io/react-native/docs/flatlist.html
	_keyExtractor = message => message._id
	_renderItem = ({item, separators}) => <BunkerMessage message={item} {...this.props} />
	_itemSeperator = () => <View style={style.separator} />

	render() {
		const {messages} = this.props
		return <KeyboardAvoidingView
				style={style.roomContainer}
				behavior={'position'}
				contentContainerStyle={{flex: 1}}
				keyboardVerticalOffset={64}>
			{/* hack to offset the navigation bar. See https://github.com/facebook/react-native/issues/13393 */}

			<View style={style.messageList}>
				<FlatList
					inverted
					data={messages}
					keyExtractor={this._keyExtractor}
					renderItem={this._renderItem}
					ItemSeparatorComponent = {this._itemSeperator}
				/>
			</View>
			<MessageBox />
		</KeyboardAvoidingView>
	}
}

const style = StyleSheet.create({
	roomContainer: {
		flex: 1,
		backgroundColor: '#EEE'
	},
	messageList: {
		flex: 15
	},
	separator:{
		marginVertical: 5,
		borderTopColor: 'gray',
		borderTopWidth: StyleSheet.hairlineWidth
	}
})

const mapStateToProps = (state, props) => {
	const {roomId} = props.navigation.state.params

	const room = state.room.rooms[roomId]

	return {
		room,
		messages: room.$messages
	}
}

export default connect(mapStateToProps, {})(RoomScreen)
