
import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  StyleSheet,
  View,
  Button,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
  Text,
  Image,
  ScrollView
} from 'react-native';
import TrackPlayer, { Event, useTrackPlayerEvents, State, usePlaybackState } from 'react-native-track-player';
import Icon from 'react-native-vector-icons/FontAwesome';
import { check, PERMISSIONS, request, RESULTS, requestMultiple } from 'react-native-permissions';
import { setupPlayer, addTracks } from './trackPlayerServices';

function Playlist() {
  const [queue, setQueue] = useState([]);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [result, setResult] = useState([]);

  async function loadPlaylist() {
    const queue = await TrackPlayer.getQueue();
    setQueue(queue);
  }

  useEffect(() => {
    loadPlaylist();
  }, []);

  useTrackPlayerEvents([Event.PlaybackTrackChanged], async (event) => {
    if (event.state == State.nextTrack) {
      let index = await TrackPlayer.getCurrentTrack();
      setCurrentTrack(index);
    }
  });

  function PlaylistItem({ index, title, isCurrent }) {
    function handleItemPress() {
      TrackPlayer.skip(index);
    }

    return (
      <TouchableOpacity onPress={handleItemPress}>
        <Text
          style={{
            ...styles.playlistItem,
            ...{ backgroundColor: isCurrent ? '#666' : 'transparent' }
          }}>
          {title}
        </Text>
      </TouchableOpacity>
    )

  }

  return (
    <View>
      <View style={styles.playlist}>
        <FlatList
          data={queue}
          renderItem={({ item, index }) => <PlaylistItem
            index={index}
            title={item.title}
            isCurrent={currentTrack == index} />
          }
        />
      </View>
      <Controls />
    </View>
  );

}

function Controls({ onShuffle }) {
  const playerState = usePlaybackState();

  async function handlePlayerPress() {
    if (await TrackPlayer.getState() == State.Playing) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }} >
      <Icon.Button
        name="arrow-left"
        size={28}
        backgroundColor="transparent"
        onPress={() => TrackPlayer.skipToPrevious()}
      />
      <Icon.Button 
        name={playerState == State.Playing ? 'pause' : 'play'}
        size={28}
        backgroundColor="transparent"
        onPress={handlePlayerPress}
      />
      <Icon.Button 
        name="arrow-right"
        size={28}
        backgroundColor="transparent"
        onPress={() => TrackPlayer.skipToNext()}
      />
    </View>
  )

}

function App() {
  const [playerReady, setPlayerReady] = useState(false);
  useEffect(() => {
    async function setup() {
      let isSetup = await setupPlayer();

      const queue = await TrackPlayer.getQueue();
      if (isSetup && queue.length <= 0) {
        await addTracks();
      }

      setPlayerReady(isSetup);
    }

    setup();

  }, []);

  if (!playerReady) {
    return (
      <SafeAreaView style={styles.container}>

        <ActivityIndicator size="large" color="#bbb" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Playlist />
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  playlist: {
    marginTop: 40,
    marginBottom: 40
  },
  playlistItem: {
    fontSize: 20,
    paddingTop: 4,
    paddingBottom: 4,
    paddingLeft: 8,
    paddingRight: 8,
    borderRadius: 4,
    color: '#fff'
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#112'
  },
});

export default App;
