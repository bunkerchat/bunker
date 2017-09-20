import React from 'react'
import {StyleSheet, View, TextInput, Button} from 'react-native'
import {connect} from 'react-redux'
import {sendMessage} from './messageThunks'

class MessageBox extends React.PureComponent {

	constructor(props) {
		super(props);

		this.state = {
			text: null
		};
	}

	// Curious if all this should use redux or no...?
	sendPress = () => {
		// this returns a promise but we don't care about the result for now. Would need to be different if
		// we cared about errors maybe???
		this.props.sendMessage(this.props.roomId, this.state.text);
		this.setState({text: null})
	};

	render() {
		return <View style={style.messageContainer}>
				<TextInput
					style={style.textBox}
					keyboardType={'default'}
					placeholder="Type a message..."
					placeholderTextColor="#BCBCBC"
					onChangeText={(text) => this.setState({text})}
					value={this.state.text}
				/>
				<Button title="Send" onPress={this.sendPress} />
			</View>
	}
}

const style = StyleSheet.create({
	messageContainer: {
		flex: 1,
		flexDirection: 'row',
		borderTopWidth: 1,
		borderTopColor: 'gray',
		backgroundColor: '#E5E5E5'
	},
	textBox: {
		flex: 1,
		borderColor: 'gray',
		borderWidth: 0
	}
});

export default connect(null, {sendMessage})(MessageBox)
