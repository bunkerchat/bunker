import React from 'react'
import {FlatList, StatusBar, StyleSheet, View, Text, Button, ScrollView} from 'react-native'
import {connect} from 'react-redux'
import {DrawerNavigator} from 'react-navigation'
import RoomScreen from './RoomScreen'
import BunkerDrawerList from './BunkerDrawerList'
import {DrawerItems} from 'react-navigation'
import _ from 'lodash'

const RoomDrawer = DrawerNavigator({
	Home: {
		screen: RoomScreen,
		navigationOptions: () => ({
			roomId: '562b083d5a83c8fe061c2238'
		})
	}
}, {
	initialRouteName: 'Home',
	// contentComponent: props => <ScrollView><DrawerItems {...props} /></ScrollView>
	contentComponent: props => (<BunkerDrawerList {...props} />)
});

export default RoomDrawer;

// export default (rooms) => {
// 	const config = {};
//
// 	if (rooms) {
//
// 		Object.keys(rooms).forEach((roomId) => {
//
// 			config[rooms[roomId].name] = {
// 				screen: RoomScreen
// 			}
// 		});
// 	}
//
// 	return DrawerNavigator(config, { contentComponent: props => (<BunkerDrawerList {...props} />) });
// }
