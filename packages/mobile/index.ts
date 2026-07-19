import { registerRootComponent } from 'expo';
import 'react-native-get-random-values';
import { ready } from 'react-native-libsodium';

ready.then(() => {
    const App = require('./App').default;
    registerRootComponent(App);
}).catch((e) => {
    console.error('Error libsodium:', e);
});