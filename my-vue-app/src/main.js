import { createApp } from 'vue'
import App from './App.vue'
import { HMSReactiveStore } from '@100mslive/hms-video-store';

const hmsManager = new HMSReactiveStore();
hmsManager.triggerOnSubscribe();

createApp(App).use(hmsManager).mount('#app')