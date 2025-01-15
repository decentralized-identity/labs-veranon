// import 'react-native-get-random-values';
import { Buffer } from 'buffer';

const crypto = require('crypto-browserify');
global.Buffer = Buffer;
// global.crypto = crypto;

export default crypto;
