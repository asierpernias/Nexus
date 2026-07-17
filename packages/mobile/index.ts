import { registerRootComponent } from 'expo';
import 'react-native-get-random-values';
import {ready} from 'react-native-libsodium';
// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
ready.then(() => {
    const App = require('./App').default;
    registerRootComponent(App);
})