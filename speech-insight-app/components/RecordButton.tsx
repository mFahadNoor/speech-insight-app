import React from 'react';
import { StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

const RecordButton = ({ onPress, isRecording }: { onPress: () => void, isRecording: boolean }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.9);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.pressable}
      >
        <LinearGradient
          colors={['rgba(255,255,255,0.2)', 'rgba(255,255,255,0)']}
          style={styles.gradientBorder}
        >
          <BlurView intensity={30} tint="light" style={styles.blurView}>
            <Animated.View style={[styles.button, isRecording ? styles.recordingButton : {}]} />
          </BlurView>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 200,
    height: 200,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 20,
  },
  pressable: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
  },
  gradientBorder: {
    borderRadius: 100,
    padding: 3,
    width: '100%',
    height: '100%',
  },
  blurView: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  button: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'red',
    transition: 'border-radius 0.3s ease',
  },
  recordingButton: {
    borderRadius: 20,
  },
});

export default RecordButton;