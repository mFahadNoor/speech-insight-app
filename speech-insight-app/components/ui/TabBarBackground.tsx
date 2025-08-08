// This is a shim for web and Android where the tab bar is generally opaque.
// export default undefined;

// export default function useBottomTabOverflow() {
//   return 0;
// }

import { BlurView } from 'expo-blur';
import React from 'react';
import { StyleSheet } from 'react-native';

export default function TabBarBackground() {
  return (
    <BlurView
      intensity={50}
      tint="dark"
      style={StyleSheet.absoluteFill}
    />
  );
}
