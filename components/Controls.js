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
  
    let playing;
    async function handlePlayerPress() {
      if (await TrackPlayer.getState() == State.Playing) {
        TrackPlayer.pause();
      } else {
        TrackPlayer.play();
      }
      const info = await TrackPlayer.getTrack(await TrackPlayer.getCurrentTrack());
      console.log(playerState);
      if(playerState.state == "playing"){
        playing = false;
      }else{
        playing = true;
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
        {
          playerState.state == "paused" ?
          <Icon.Button
              name="play"
              size={28}
            backgroundColor="transparent"
            onPress={handlePlayerPress}
          />
  
          :
          <Icon.Button
              name="pause"
              size={28}
              backgroundColor="transparent"
              onPress={handlePlayerPress}
          />
        }
  
        <Icon.Button
          name="arrow-right"
          size={28}
          backgroundColor="transparent"
          onPress={() => TrackPlayer.skipToNext()}
        />
        <Icon.Button 
          name="random"
          size={28}
          backgroundColor="transparent"
          onPress={onShuffle}
        />
      </View>
    )
  
  }