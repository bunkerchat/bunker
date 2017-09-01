import React from 'react'
import {StatusBar, StyleSheet, View, Text, Button} from 'react-native'
import {connect} from 'react-redux'

class ChatWrapper extends React.Component {

	render() {
		const {rooms} = this.props;

		return <View>
				<Text>{JSON.stringify(rooms, null, 2)}</Text>
		</View>
	}
}

const mapStateToProps = (state, props) => {
	console.log('mapping state to props ' + (state.room.rooms ? state.room.rooms.length : 'null'));
	return {
		rooms: state.room.rooms
	}
}

export default connect(mapStateToProps, {})(ChatWrapper)
