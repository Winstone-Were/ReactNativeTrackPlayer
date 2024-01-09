
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
import TrackPlayer, { Event, useTrackPlayerEvents, State, usePlaybackState, useProgress } from 'react-native-track-player';
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
    async function handleItemPress() {
      TrackPlayer.skip(index);
      if (await TrackPlayer.getState() == State.Playing) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
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

  let ButtonIconString = false;

  TrackPlayer.getState().then(data => {
    if (data == 'playing') {
      ButtonIconString = true;
    } else if (data == 'paused') {
      ButtonIconString = false;
    }
  })

  async function handlePlayerPress() {
    if (await TrackPlayer.getState() == State.Playing) {
      TrackPlayer.pause();
    } else {
      TrackPlayer.play();
    }
    const info = await TrackPlayer.getTrack(await TrackPlayer.getCurrentTrack());
    console.log(Object.keys(info));
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
        name={ButtonIconString ? 'pause' : 'play'}
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

function TrackProgress() {
  const { position, duration } = useProgress(200);

  function format(seconds) {
    let mins = (parseInt(seconds / 60)).toString().padStart(2, '0');
    let secs = (Math.trunc(seconds) % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  }

  return (
    <View>
      <Text style={styles.trackProgress}>
        {format(position)} / {format(duration)}
      </Text>
    </View>
  );
}

function Header() {
  const [info, setInfo] = useState({});
  useEffect(() => {
    setTrackInfo();
  }, []);
  useTrackPlayerEvents([Event.PlaybackTrackChanged], (event) => {
    if (event.state == State.nextTrack) {
      setTrackInfo();
    }
  });
  async function setTrackInfo() {
    const track = await TrackPlayer.getCurrentTrack();
    const info = await TrackPlayer.getTrack(track);
    setInfo(info);
  }
  return (
    <View>
      <Image src={{uri: require("./assets/audio.jpg")}}/>
      <Text style={styles.songTitle}>{info.title}</Text>
      <Text style={styles.artistName}>{info.artist}</Text>
    </View>
  );
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
      <Header />
      <TrackProgress />
      <Playlist />
    </SafeAreaView>
  );

}

const styles = StyleSheet.create({
  playlist: {
    marginTop: 40,
    marginBottom: 40,
    height: 110,
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
  trackProgress: {
    marginTop: 40,
    textAlign: 'center',
    fontSize: 24,
    color: '#eee'
  },
  songTitle: {
    fontSize: 32,
    marginTop: 50,
    color: '#ccc'
  },
  artistName: {
    fontSize: 24,
    color: '#888'
  },
});

export default App;
