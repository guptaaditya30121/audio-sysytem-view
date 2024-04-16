<template>
  <div>
    <header>
      <img class="logo" src="https://www.100ms.live/assets/logo.svg" />
      <button @click="leaveRoom" class="btn-danger hide">Leave Room</button>
    </header>
    <!-- <form @submit.prevent="joinRoom" id="join" v-if="!isConnectedToRoom">
      <h2>Join Room</h2>
      <div class="input-container">
        <input v-model="userName" type="text" name="username" placeholder="Your name" />
      </div>
      <div class="input-container">
        <input v-model="roomCode" type="text" name="roomCode" placeholder="Room code" />
      </div>
      <button type="submit" class="btn-primary" id="join-btn">Join</button>
    </form> -->
    <button @click="createNewRoom" class="btn-primary" v-if="!isConnectedToRoom">
      Call and Enter
    </button>
    
    <div v-if="isConnectedToRoom" id="conference" class="conference-section">
      <h2>Conference</h2>
      <div id="peers-container">
        <div v-for="peer in peers" :key="peer.id" class="peer-tile">
          <video :src="peer.videoSrc" class="peer-video" autoplay muted playsinline></video>
          <div class="peer-name">{{ peer.name }}</div>
        </div>
      </div>
    </div>

    <div v-if="isConnectedToRoom" id="controls" class="control-bar">
      <button @click="toggleAudio" id="mute-aud" class="btn-control">{{ audioButtonText }}</button>
      <button @click="toggleVideo" id="mute-vid" class="btn-control">{{ videoButtonText }}</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import {
  HMSReactiveStore,
  selectIsConnectedToRoom,
  selectIsLocalAudioEnabled,
  selectPeers,
  selectIsLocalVideoEnabled,
} from '@100mslive/hms-video-store';

export default {
  setup() {
    const hmsManager = new HMSReactiveStore();
    hmsManager.triggerOnSubscribe();
    const hmsStore = hmsManager.getStore();
    const hmsActions = hmsManager.getActions();
    const userName = ref('aditya');
    const roomCode = ref('');
    const audioButtonText = ref('Unmute');
    const videoButtonText = ref('Hide');

    const isConnectedToRoom = ref(hmsStore.getState(selectIsConnectedToRoom));
    const peers = ref(hmsStore.getState(selectPeers));

    const leaveRoom = async () => {
      await hmsActions.leave();
      peers.value = []; // Clear peers
    };


    const createNewRoom = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/createRoom', {
          method: 'POST',
          body: JSON.stringify({
            "userName": "checkfront"
          })
        });

        if (!response.ok) {
          throw new Error('Failed to create a new room');
        }
        const code =  await response.json()
        console.log(code);
        roomCode.value = code.roomCode;
        joinRoom();
      } catch (error) {
        console.error('Error creating room:', error);
      }
    };
    const joinRoom = async () => {
      const authToken = await hmsActions.getAuthTokenByRoomCode({ roomCode: roomCode.value });
      hmsActions.join({
        userName: userName.value,
        authToken,
      });
    };

    const toggleAudio = () => {
      const audioEnabled = !hmsStore.getState(selectIsLocalAudioEnabled);
      hmsActions.setLocalAudioEnabled(audioEnabled);
      audioButtonText.value = audioEnabled ? 'Mute' : 'Unmute';
    };

    const toggleVideo = () => {
      const videoEnabled = !hmsStore.getState(selectIsLocalVideoEnabled);
      hmsActions.setLocalVideoEnabled(videoEnabled);
      videoButtonText.value = videoEnabled ? 'Hide' : 'Unhide';
    };

    const onConnection = (isConnected) => {
      isConnectedToRoom.value = isConnected;
    };

    hmsStore.subscribe(onConnection, selectIsConnectedToRoom);

    // Update peers on change
    hmsStore.subscribe(() => {
      peers.value = hmsStore.getState(selectPeers);
    }, selectPeers);

    
    onMounted(() => {
      
      
        window.addEventListener('beforeunload', leaveRoom);
        const storedUserName = localStorage.getItem('userName');
        const storedRoomCode = localStorage.getItem('roomCode');

        if (storedUserName && storedRoomCode) {
          userName.value = storedUserName;
          roomCode.value = storedRoomCode;
          // joinRoom(); // Automatically rejoin room using stored credentials
        }
      
    });

    return {
      userName,
      roomCode,
      audioButtonText,
      videoButtonText,
      isConnectedToRoom,
      peers,
      leaveRoom,
      createNewRoom,
      joinRoom,
      toggleAudio,
      toggleVideo,
    };
  },
};
</script>

<style>
/* Your existing CSS remains unchanged */
body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    background-color: #263238;
    color: white;
  }
  
  h1,
  h2,
  h3,
  h4,
  h5 {
    font-weight: normal;
  }
  
  header {
    padding: 10px;
    display: flex;
    align-items: end;
    justify-content: space-between;
  }
  
  .btn-danger {
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 6px 14px;
    background-color: #f44336;
    color: white;
    font-family: inherit;
    font-size: 14px;
  }
  
  .hide {
    display: none !important;
  }
  
  form {
    max-width: 450px;
    margin: 30px auto;
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
    border-radius: 8px;
    padding: 20px;
  }
  
  input {
    display: block;
    width: 100%;
    border-radius: 8px;
    border: 2px solid transparent;
    height: 34px;
    padding: 5px;
    background: #37474f;
    color: inherit;
    font-family: inherit;
  }
  
  input::placeholder {
    color: #aaa;
  }
  
  .input-container {
    margin-bottom: 20px;
    display: flex;
    align-items: baseline;
    gap: 5px;
  }
  
  .btn-primary {
    border: 1px solid transparent;
    border-radius: 4px;
    padding: 6px 14px;
    background-color: #1565c0;
    color: white;
    font-family: inherit;
    font-size: 14px;
  }
  
  form h2,
  .conference-section h2 {
    margin-bottom: 20px;
  }
  
  .conference-section {
    padding: 20px 30px;
    max-width: 960px;
    margin: 0 auto;
  }
  
  .conference-section h2 {
    text-align: center;
    font-size: 32px;
    padding-bottom: 10px;
    border-bottom: 1px solid #546e7a;
  }
  
  #peers-container {
    display: grid;
    grid-template-columns: repeat(3, minmax(min-content, 1fr));
    place-items: center;
    grid-gap: 10px;
  }
  
  .peer-video {
    height: 250px;
    width: 250px;
    border-radius: 40%;
    object-fit: cover;
    margin-bottom: 10px;
  }
  
  .local.peer-video {
    transform: scaleX(-1);
  }
  
  .peer-name {
    font-size: 14px;
    text-align: center;
  }
  
  .peer-tile {
    padding: 10px;
  }
  
  .control-bar {
    display: flex;
    position: fixed;
    bottom: 0;
    width: 100%;
    padding: 15px;
    justify-content: center;
    z-index: 10;
  }
  
  .control-bar > *:not(:first-child) {
    margin-left: 8px;
  }
  
  .btn-control {
    font-size: 12px;
    text-transform: uppercase;
    letter-spacing: 1px;
    border: 2px solid #37474f;
    width: 64px;
    height: 64px;
    border-radius: 50%;
    text-align: center;
    background-color: #607d8b;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.4);
    color: white;
  }

  .separator {
    font-size: 12px;
  }
/* ... */
</style>
