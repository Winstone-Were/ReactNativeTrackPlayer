import TrackPlayer,{
    AppKilledPlaybackBehavior,
    Capability,
    RepeatMode,
    Event 
} from 'react-native-track-player';

export async function setupPlayer() {
    let isSetup = false;
    try {
        await TrackPlayer.getCurrentTrack();
        isSetup = true;
    }  catch {
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
    await TrackPlayer.add([
        {
            id:'1',
            url: require('./assets/Counter.mp3'),
            title: 'Counter',
            artist: 'Stonie',
            duration: 60
        },
        {
            id:'2',
            url: require('./assets/Cyan.mp3'),
            title:'Cyan',
            artist:'Stonie',
            duration: 60
        },
        {
            id:'3',
            url: require('./assets/Was Kalopsia.mp3'),
            title:'Was Kalopsia',
            artist:'Stonie',
            duration:60
        }
    ]);
    await TrackPlayer.setRepeatMode(RepeatMode.Queue);
}

export async function playbackService() {
    
}