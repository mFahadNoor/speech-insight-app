import React, { useMemo, useRef } from 'react';
import { View, StyleSheet, Pressable, GestureResponderEvent, LayoutChangeEvent } from 'react-native';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';

interface AudioWaveformProps {
  progress: Animated.SharedValue<number>;
  waveformData: number[];
  onSeek: (progress: number) => void;
}

const WaveBar = React.memo(({ bar, index, totalBars, progress }: { bar: number, index: number, totalBars: number, progress: Animated.SharedValue<number> }) => {
  const animatedStyle = useAnimatedStyle(() => {
    const progressPoint = progress.value * totalBars;
    const isPlayed = progressPoint > index;
    
    return {
      backgroundColor: withTiming(isPlayed ? 'rgba(252, 211, 77, 0.9)' : 'rgba(255, 255, 255, 0.3)', {
        duration: 0,
      }),
    };
  });

  return <Animated.View style={[styles.waveBar, { height: `${bar * 90 + 10}%` }, animatedStyle]} />;
});

WaveBar.displayName = 'WaveBar';

const AudioWaveform: React.FC<AudioWaveformProps> = ({ progress, waveformData, onSeek }) => {
  const containerWidth = useRef(0);
  const numBars = 70;

  const bars = useMemo(() => {
    if (!waveformData || waveformData.length === 0) {
      return Array(numBars).fill(0);
    }

    // 1. Downsample to get a representative set of bars
    const downsampled = [];
    const step = waveformData.length / numBars;
    for (let i = 0; i < numBars; i++) {
      const start = Math.floor(i * step);
      const end = Math.floor((i + 1) * step);
      const bucket = waveformData.slice(start, end);
      const bucketAvg = bucket.reduce((acc, val) => acc + val, 0) / (bucket.length || 1);
      downsampled.push(bucketAvg);
    }

    // 2. Find the true baseline and peak, ignoring the start/end zeros
    const nonZeroValues = downsampled.filter(v => v > 0.01);
    if (nonZeroValues.length === 0) {
      return Array(numBars).fill(0);
    }
    const baseline = Math.min(...nonZeroValues);
    const peak = Math.max(...nonZeroValues);
    const dynamicRange = peak - baseline;

    if (dynamicRange < 0.01) {
      return Array(numBars).fill(0.1); // Render a flat line for recordings with no sound
    }

    // 3. Normalize each bar relative to the recording's own dynamic range
    return downsampled.map(val => {
      if (val < baseline) return 0;
      return (val - baseline) / dynamicRange;
    });
  }, [waveformData]);

  const handlePress = (event: GestureResponderEvent) => {
    if (containerWidth.current === 0) return;
    const { locationX } = event.nativeEvent;
    const seekProgress = locationX / containerWidth.current;
    onSeek(seekProgress);
  };

  const onLayout = (event: LayoutChangeEvent) => {
    containerWidth.current = event.nativeEvent.layout.width;
  };

  return (
    <Pressable onPress={handlePress} onLayout={onLayout} style={styles.container}>
      <View style={styles.waveformContainer}>
        {bars.map((bar, index) => (
          <WaveBar key={index} bar={bar} index={index} totalBars={numBars} progress={progress} />
        ))}
      </View>
    </Pressable>
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
    paddingHorizontal: 2,
  },
  waveBar: {
    width: 3,
    borderRadius: 2,
  },
});

export default AudioWaveform;
