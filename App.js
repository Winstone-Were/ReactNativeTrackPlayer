
import React, {useEffect, useState} from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Button,
  ActivityIndicator
} from 'react-native';
import TrackPlayer from 'react-native-track-player';
import { setupPlayer, addTracks } from './trackPlayerServices';

function App() {
  const[playerReady, setPlayerReady] = useState(false);
  useEffect(()=>{
    async function setup() {
      let isSetup = await setupPlayer();

      const queue = await TrackPlayer.getQueue();
      if (isSetup && queue.length <= 0) {
        await addTracks();
      }

      setPlayerReady(isSetup);
    }

    setup();

  },[]);

  if(!playerReady) {
    return(
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#bbb" />
      </SafeAreaView>
    );
  }

  return(
    <SafeAreaView style={styles.container}>
      <Button title='Play' color='#777' onPress={()=> TrackPlayer.play()} />
    </SafeAreaView>
  );

}


