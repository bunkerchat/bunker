
import React from 'react'
import {StyleSheet} from 'react-native'
import {DrawerItems} from 'react-navigation'
import {View} from 'react-native'

class BunkerDrawerList extends React.PureComponent {
	render() {
		return <View style={styles.container}>
			<DrawerItems {...this.props} />
		</View>
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
	},
});

export default BunkerDrawerList;

// export default (props) => (<View style={styles.container}>
// 	<DrawerItems {...props} />
// </View>);
