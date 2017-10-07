import React from 'react'
import {FlatList, KeyboardAvoidingView, StyleSheet, View, TextInput, Button} from 'react-native'
import {connect} from 'react-redux'
import BunkerMessage from './BunkerMessage'
import MessageToolbar from './MessageToolbar'
import {loadMessages} from './messageThunks'
import _ from 'lodash'

class RoomScreen extends React.PureComponent {

	static navigationOptions = ({ navigation }) => ({
		title: navigation.state.params.roomName,
	});

	// https://facebook.github.io/react-native/docs/flatlist.html
	_keyExtractor = message => message._id;

	_renderItem = ({item, index, separators}) => {
		const prevMessage = this.props.messages[index + 1];
		let isFirstInRun = true;

		// TODO: place this in reducer maybe?
		if (prevMessage && prevMessage.author && prevMessage.author.toLowerCase() === item.author.toLowerCase()) {
			isFirstInRun = false;
		}

		return <BunkerMessage
				message={item}
				isFirstInRun={isFirstInRun}
				currentUserId={this.props.currentUser._id}
				user={this.props.users && this.props.users[item.author]} />
	};

	// TODO: once flatlist has better support for inversion, change this to load messages when user scrolls to top.
	componentWillMount() {
		this.props.loadMessages(this.props.room._id, this.props.messages ? this.props.messages.length : 0);
	}

	render() {
		const {messages, room} = this.props
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
					// onEndReached={() => console.log('end reached')} // currently doesn't work for flatlist
					// ItemSeparatorComponent = {this._itemSeperator}
				/>
			</View>
			<MessageToolbar roomId={room._id} />
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
		currentUser: state.user.currentBunkerUser,
		users: state.user.users,
		messages: room.$messages
	}
}

export default connect(mapStateToProps, {loadMessages})(RoomScreen)
