/**
 * @format
 */

import {AppRegistry} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import App from './App';
import {name as appName} from './app.json';
import { playbackService } from './trackPlayerServices';

TrackPlayer.registerPlaybackService(()=> playbackService);
AppRegistry.registerComponent(appName, () => App);
