import { AppRegistry } from 'react-native';
import App from './app/App';

// in production, console.* causes the app to slow down. We can't use these
// anyways, so set them all to noop here
if (!__DEV__) {
	console = {} // eslint-disable-line no-native-reassign no-global-assign
	console.debug = () => {}
	console.log = () => {}
	console.error = () => {}
	console.warn = () => {}
}

AppRegistry.registerComponent('bunkerApp', () => App);
