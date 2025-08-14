import { BlurView } from 'expo-blur';
import { Link } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface RecordingCardProps {
  id: string;
  title: string;
  timestamp: string;
  duration: string;
  index: number;
}

const RecordingCard = ({ id, title, timestamp, duration, index }: RecordingCardProps) => {
  const scale = useSharedValue(1);
  const progress = useSharedValue(0);

  React.useEffect(() => {
    progress.value = withTiming(1, { duration: 500 + index * 100 });
  }, [progress, index]);

  const animatedStyle = useAnimatedStyle(() => {
    const scaleValue = interpolate(progress.value, [0, 1], [0.8, 1]);
    const opacityValue = interpolate(progress.value, [0, 1], [0, 1]);
    return {
      transform: [{ scale: scale.value * scaleValue }],
      opacity: opacityValue,
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.97);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Link href={`/recording/${encodeURIComponent(id.replace("file://", ""))}`} asChild>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <BlurView intensity={50} tint="dark" style={styles.blurView}>
            <View style={styles.cardContent}>
              <View style={styles.textContainer}>
                <Text style={styles.title} numberOfLines={1}>{title}</Text>
                <Text style={styles.subtitle}>{timestamp}</Text>
              </View>
              <Text style={styles.duration}>{duration}</Text>
            </View>
          </BlurView>
        </Animated.View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    marginVertical: 8,
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  blurView: {
    flex: 1,
  },
  cardContent: {
    paddingVertical: 20,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 24,
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: '#E0E0E0',
    fontSize: 13,
    marginTop: 6,
    opacity: 0.8,
  },
  duration: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    opacity: 0.9,
  },
});

export default RecordingCard;