import React from 'react';
import { View, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

const SpeechWave = ({ amplitude }: { amplitude: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(amplitude.value, [0, 0.5], [1, 2]);
    const opacity = interpolate(amplitude.value, [0, 0.5], [0.5, 1]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.wave, animatedStyle]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  wave: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 0, 0, 0.5)',
  },
});

export default SpeechWave;