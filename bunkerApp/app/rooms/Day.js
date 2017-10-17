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
			return <View style={styles.dateContainer}>
				<View style={styles.dateBorder}>
					<Text style={styles.dateText}>{moment(this.props.currentMessage.createdAt).calendar(null, { sameDay: '[Today]', lastDay: '[Yesterday]' })}</Text>
				</View>
			</View>
		}
		return null;
	}
}

const styles = StyleSheet.create({
	dateContainer: {
		alignItems: 'center',
		flexDirection: 'column'
	},
	dateBorder: {
		borderRadius: 10,
		paddingLeft: 16,
		paddingRight: 16,
		paddingTop: 6,
		paddingBottom: 6,
		backgroundColor: '#DFDFDF'
	},
	dateText: {
		fontSize: 10,
		color: '#888',
		lineHeight: 10,
	}
});
