import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { Link } from 'expo-router';
import IconSymbol from '@/components/ui/IconSymbol';

const RecordingCard = ({ id, title, timestamp, duration, isPlaying, onPlay }: { id: string, title: string, timestamp: string, duration: string, isPlaying: boolean, onPlay: () => void }) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const handlePressIn = () => {
    scale.value = withSpring(0.98);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Link href={`/recording/${id}`} asChild>
      <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.cardContent}>
            <View style={styles.textContainer}>
              <Text style={styles.title} numberOfLines={1}>{title}</Text>
              <Text style={styles.subtitle}>{timestamp}</Text>
            </View>
            <View style={styles.controlsContainer}>
              <Text style={styles.duration}>{duration}</Text>
              <Pressable onPress={onPlay} style={styles.playButton}>
                <IconSymbol name={isPlaying ? 'pause.fill' : 'play.fill'} color="white" size={24} />
              </Pressable>
            </View>
          </View>
        </Animated.View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginVertical: 8,
    backgroundColor: '#2A2D34',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  textContainer: {
    flex: 1,
    marginRight: 16,
  },
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  subtitle: {
    color: '#A0A0A0',
    fontSize: 14,
    marginTop: 4,
  },
  controlsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
    marginRight: 16,
  },
  playButton: {
    padding: 12,
    backgroundColor: '#4A4E69',
    borderRadius: 30,
  },
});

export default RecordingCard;
