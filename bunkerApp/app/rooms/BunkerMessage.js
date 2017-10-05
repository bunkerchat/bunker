import React from 'react'
import _ from 'lodash'
import {StyleSheet, View, Text, Image} from 'react-native'

const iconSize = 24;

export default class BunkerMessage extends React.PureComponent{

	getGravatarUri = () => {
		if (this.props.user && this.props.user.gravatarMd5) {
			return `https://www.gravatar.com/avatar/${this.props.user.gravatarMd5}?r=pg&s=${iconSize}&d=identicon`;
		}

		return `https://www.gravatar.com/avatar?s=${iconSize}&d=mm`;
	};

	render(){
		const {message, currentUserId, isFirstInRun} = this.props;

		const isCurrentUser = message.author && message.author.toLowerCase() === currentUserId.toLowerCase();

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
					{message.edited && <Text style={sharedStyles.edited}>edited</Text>}
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
	edited: {
		marginLeft: 10,
		fontSize: 10,
		marginRight: 10,
		color: '#888'
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
