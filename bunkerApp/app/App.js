import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Provider } from 'react-redux'
import configureStore from './ReduxConfigureStore'
import RootContainer from './config/RootContainer'

const store = configureStore()

export default class App extends React.PureComponent {
  render() {
    return (
			<Provider store={store}>
				<RootContainer />
			</Provider>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
