import React from 'react'
import _ from 'lodash'
import {FlatList, StatusBar, StyleSheet, View, Text, Button, Image} from 'react-native'

const iconSize = 24;

export default class BunkerMessage extends React.PureComponent{

	getGravatarUri = () => {
		if (this.props.user) {
			return `https://www.gravatar.com/avatar/${this.props.user.gravatarMd5}?r=pg&s=${iconSize}&d=identicon`;
		}

		return `https://www.gravatar.com/avatar?s=${iconSize}&d=mm`;
	};

	render(){
		const {message, currentUserId, isFirstInRun} = this.props
		return <View>
			{isFirstInRun && <Image style={style.icon} source={{uri: this.getGravatarUri()}} />}
			<Text>{message.text}</Text>
		</View>
	}
}

const style = StyleSheet.create({
	icon: {
		flex: 1,
		width: iconSize,
		height: iconSize
	}
});
