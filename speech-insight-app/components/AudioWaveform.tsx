
import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface AudioWaveformProps {
  progress: Animated.SharedValue<number>;
}

const DUMMY_WAVEFORM_DATA = Array.from({ length: 50 }, () => Math.random());

const AudioWaveform: React.FC<AudioWaveformProps> = ({ progress }) => {
  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`,
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.waveformContainer}>
        {DUMMY_WAVEFORM_DATA.map((val, index) => (
          <View key={index} style={[styles.waveBar, { height: `${val * 100}%` }]} />
        ))}
      </View>
      <Animated.View style={[styles.progressOverlay, progressStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  waveformContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  waveBar: {
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    borderRadius: 2,
  },
  progressOverlay: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(252, 211, 77, 0.5)',
    zIndex: 2,
  },
});

export default AudioWaveform;
