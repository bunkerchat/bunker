import React from 'react';
import {
	StyleSheet,
	Text,
	View
} from 'react-native';
import moment from 'moment';


export default class Day extends React.PureComponent {

	render() {
		if (!this.props.currentMessage.isSameDay) {
			return <View>
				<Text>{moment(this.props.currentMessage.createdAt).calendar(null, { sameDay: '[Today]', lastDay: '[Yesterday]' })}</Text>
			</View>
		}
		return null;
	}
}
