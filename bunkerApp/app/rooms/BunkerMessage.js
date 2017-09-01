import React from 'react'
import _ from 'lodash'
import {FlatList, StatusBar, StyleSheet, View, Text, Button} from 'react-native'

export default class BunkerMessage extends React.PureComponent{
	render(){
		const {message} = this.props
		return <Text>{message.text}</Text>
	}
}
