import React from 'react'
import {StatusBar, StyleSheet, View, Text} from 'react-native'
import {connect} from 'react-redux'
import AppNavigator from './AppNavigator'

class RootContainer extends React.PureComponent {
	render(){
		return <View style={styles.applicationView}>
			<StatusBar  />
			<AppNavigator />
		</View>
	}
}

const styles = StyleSheet.create({
	applicationView:{
		flex: 1
	}
})

const mapStateToProps = (state, props) => {
	return {}
}

const actions = {}

export default connect(mapStateToProps, actions)(RootContainer)