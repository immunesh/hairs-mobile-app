import { Platform } from 'react-native';
import { registerRootComponent } from 'expo';

import App from './App';

registerRootComponent(App);

if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const root = document.getElementById('root');
  if (root) {
    root.style.display = 'flex';
    root.style.flexDirection = 'column';
    root.style.width = '100%';
    root.style.height = '100%';
  }
}
