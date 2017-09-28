import React from 'react'
import _ from 'lodash'
import {FlatList, StatusBar, StyleSheet, View, Text, Button, Image} from 'react-native'

const iconSize = 24;

export default class BunkerMessage extends React.PureComponent{

	getAuthorId(message) {
		return message && message.author && (_.isObject(message.author) ? message.author._id : message.author);
	}

	getGravatarUri = () => {
		if (this.props.user) {
			return `https://www.gravatar.com/avatar/${this.props.user.gravatarMd5}?r=pg&s=${iconSize}&d=identicon`;
		}

		return `https://www.gravatar.com/avatar?s=${iconSize}&d=mm`;
	};

	render(){
		const {message, currentUserId, isFirstInRun} = this.props;

		const messageAuthorId = this.getAuthorId(message);
		const isCurrentUser = messageAuthorId && messageAuthorId.toLowerCase() === currentUserId.toLowerCase();

		let messageWrapperStyles = styles.left.messageWrapper;

		if (isCurrentUser) {
			messageWrapperStyles = styles.right.messageWrapper;
		}
		else if (isFirstInRun) {
			messageWrapperStyles = [styles.left.messageWrapper, {marginLeft: 6}];
		}

		return <View style={(isCurrentUser ? styles.right.container : styles.left.container)}>
				{isFirstInRun && !isCurrentUser && <Image style={sharedStyles.icon} source={{uri: this.getGravatarUri()}} />}
				<View style={messageWrapperStyles}>
					<Text style={sharedStyles.text}>{message.text}</Text>
				</View>
			</View>
	}
}

const sharedStyles = StyleSheet.create({
	text: {
		fontSize: 14,
		lineHeight: 16,
		marginTop: 4,
		marginBottom: 4,
		marginLeft: 10,
		marginRight: 10,
		color: '#333333'
	},
	icon: {
		width: iconSize,
		height: iconSize,
		borderRadius: 4
	}
});

const sharedContainerStyles = {
	flex: 1,
	flexDirection: 'row',
	alignItems: 'flex-start',
};

const messageWrapperStyles = {
	marginBottom: 6,
	borderRadius: 8,
	minHeight: 24,
	justifyContent: 'center'
};

const styles = {
	left: StyleSheet.create({
		container: {
			justifyContent: 'flex-start',
			...sharedContainerStyles
		},
		messageWrapper: {
			marginRight: 20,
			marginLeft: 30,
			backgroundColor: 'white',
			...messageWrapperStyles
		}
	}),
	right: StyleSheet.create({
		container: {
			justifyContent: 'flex-end',
			...sharedContainerStyles
		},
		messageWrapper: {
			marginLeft: 30,
			backgroundColor: '#d9edf7',
			...messageWrapperStyles
		}
	})
};
