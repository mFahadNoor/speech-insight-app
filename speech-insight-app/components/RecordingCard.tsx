import React from 'react';
import { StyleSheet, View, Text, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';

const RecordingCard = ({ id, title, timestamp, duration }: { id: string, title: string, timestamp: string, duration: string }) => {
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
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={styles.gradientBorder}
          >
            <BlurView intensity={40} tint="light" style={styles.blurView}>
              <View style={styles.textContainer}>
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.subtitle}>{timestamp}</Text>
              </View>
              <Text style={styles.duration}>{duration}</Text>
            </BlurView>
          </LinearGradient>
        </Animated.View>
      </Pressable>
    </Link>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '90%',
    marginVertical: 10,
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 5,
    },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  pressable: {
    width: '100%',
  },
  gradientBorder: {
    borderRadius: 25,
    padding: 1,
  },
  blurView: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  textContainer: {},
  title: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 4,
  },
  duration: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default RecordingCard;
