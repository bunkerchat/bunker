import React from 'react'
import {StyleSheet, View, TextInput, Button} from 'react-native'
import {connect} from 'react-redux'
import BunkerMessage from './BunkerMessage'

class MessageBox extends React.PureComponent {

	sendPress = () => {
		console.log('sent')
	};

	render() {
		return <View style={style.messageContainer}>
				<TextInput
					style={style.textBox}
					keyboardType={'default'}
					placeholder="Type a message..."
					placeholderTextColor="#BCBCBC"
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

export default MessageBox
