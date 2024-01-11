import TrackPlayer, {
    AppKilledPlaybackBehavior,
    Capability,
    RepeatMode,
    Event
} from 'react-native-track-player';

import { check, PERMISSIONS, request, RESULTS, requestMultiple } from 'react-native-permissions';
import { getAll, getAlbums, searchSongs, SortSongFields, SortSongOrder } from "react-native-get-music-files";

const hasPermissions = async () => {
    if (Platform.OS === 'android') {
        let hasPermission =
            (await check(PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE)) ===
            RESULTS.GRANTED || (await check(PERMISSIONS.ANDROID.READ_MEDIA_AUDIO)) ===
            RESULTS.GRANTED;

        if (!hasPermission) {
            hasPermission = await requestMultiple([
                PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
                PERMISSIONS.ANDROID.READ_MEDIA_AUDIO,
            ]);
        }

        return hasPermission;
    }

    if (Platform.OS === 'ios') {
        let hasPermission =
            (await check(PERMISSIONS.IOS.MEDIA_LIBRARY)) === RESULTS.GRANTED;
        if (!hasPermission) {
            hasPermission =
                (await request(PERMISSIONS.IOS.MEDIA_LIBRARY)) === RESULTS.GRANTED;
        }

        return hasPermission;
    }

    return false;
};

async function loadSongstoArray() {
    const permissions = await hasPermissions();
    let SongsArray = [];
    if (permissions) {
        try {
            const songResults = await getAll({
                limit: 1000,
                coverQuality: 50,
                minSongDuration: 1000,
                sortOrder: SortSongOrder.DESC,
                sortBy: SortSongFields.TITLE,
            });
            SongsArray = songResults;
        }catch(err) {
            console.log(err);
        }

    }
    return SongsArray;
}

export async function setupPlayer() {
    let isSetup = false;
    try {
        await TrackPlayer.getCurrentTrack();
        isSetup = true;
    } catch {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
            android: {
                appKilledPlaybackBehavior:
                    AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
                Capability.SkipToPrevious,
                Capability.SeekTo,
            ],
            compactCapabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.SkipToNext,
            ],
            progressUpdateEventInterval: 2
        });

        isSetup = true;
    } finally {
        return isSetup;
    }
}

export async function addTracks() {
    let Songs = await loadSongstoArray();
    let finalSongs = [];
    for(let i=0; i<Songs.length; i++){
        console.log(`${i} : ${Songs[i].title}`);
        finalSongs.push(
            {
                id: `${i}`,
                url: Songs[i].url,
                title: Songs[i].title,
                artist: Songs[i].artist,
                duration: Songs[i].duration,
                cover: Songs[i].cover
            }
        )
    }
    //console.log(Object.keys(Songs));
    await TrackPlayer.add(finalSongs);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
}

export async function playbackService() {
    TrackPlayer.addEventListener(Event.RemotePause, () => {
      console.log('Event.RemotePause');
      TrackPlayer.pause();
    });
  
    TrackPlayer.addEventListener(Event.RemotePlay, () => {
      console.log('Event.RemotePlay');
      TrackPlayer.play();
    });
  
    TrackPlayer.addEventListener(Event.RemoteNext, () => {
      console.log('Event.RemoteNext');
      TrackPlayer.skipToNext();
    });
  
    TrackPlayer.addEventListener(Event.RemotePrevious, () => {
      console.log('Event.RemotePrevious');
      TrackPlayer.skipToPrevious();
    });
  }