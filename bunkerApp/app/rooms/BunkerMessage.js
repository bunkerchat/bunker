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
		const {message, currentUserId, isFirstInRun} = this.props;

		const isCurrentUser = message.author && message.author.toLowerCase() === currentUserId.toLowerCase();

		return <View style={style.container}>
				{isFirstInRun && <Image style={style.icon} source={{uri: this.getGravatarUri()}} />}
				<View style={style.messageWrapper}>
					<Text style={style.text}>{message.text}</Text>
				</View>
			</View>
	}
}

const style = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'flex-start'
	},
	text: {
		fontSize: 14,
		lineHeight: 16,
		marginTop: 4,
		marginBottom: 4,
		marginLeft: 10,
		marginRight: 10
	},
	messageWrapper: {
		marginRight: 20,
		marginLeft: 30,
		marginBottom: 6,
		borderRadius: 8,
		minHeight: 20,
		backgroundColor: '#CCCCCC',
		justifyContent: 'center'
	},
	icon: {
		width: iconSize,
		height: iconSize
	}
});
