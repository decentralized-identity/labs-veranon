import { Buffer } from 'buffer';
import 'react-native-get-random-values';

// Polyfill crypto global
const crypto = require('crypto-browserify');
(global as any).Buffer = Buffer;
global.crypto = crypto;

export default crypto;
