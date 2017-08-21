import React from 'react'
import {StatusBar, StyleSheet, View, Text} from 'react-native'
import {connect} from 'react-redux'

class RootContainer extends React.PureComponent {
	render(){
		return <View style={styles.applicationView}>
			<StatusBar  />
			<Text> Hi </Text>
		</View>
	}
}

const styles = StyleSheet.create({
	applicationView:{
		marginTop: 20,
		flex: 1
	}
})

const mapStateToProps = (state, props) => {
	return {}
}

const actions = {}

export default connect(mapStateToProps, actions)(RootContainer)
