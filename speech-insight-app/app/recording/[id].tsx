import AudioWaveform from '@/components/AudioWaveform';
import IconSymbol from '@/components/ui/IconSymbol';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, ScrollView, StatusBar } from 'react-native';
import { Audio } from 'expo-av';
import Animated, { useSharedValue, withTiming, FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { format } from 'date-fns';

export default function RecordingDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const progress = useSharedValue(0);

  const decodedId = id ? decodeURIComponent(id) : '';

  const formatTimestamp = (uri: string) => {
    if (!uri) return 'Invalid date';
    const match = uri.match(/recording-(\d+)\.m4a/);
    if (!match) return 'Invalid date';
    const timestamp = parseInt(match[1], 10);
    return format(new Date(timestamp), "MMMM d, yyyy 'at' h:mm a");
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadSound = async () => {
      if (!decodedId) return;
      const { sound, status } = await Audio.Sound.createAsync(
        { uri: `file://${decodedId}` },
        { shouldPlay: false }
      );
      setSound(sound);
      if (status.isLoaded) {
        setDuration(status.durationMillis || 0);
      }
      sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    };

    loadSound();

    return () => {
      sound?.unloadAsync();
    };
  }, [decodedId]);

  const onPlaybackStatusUpdate = (status: any) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis);
    setIsPlaying(status.isPlaying);
    progress.value = withTiming(status.positionMillis / status.durationMillis, { duration: 100 });
  };

  const handlePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      await sound.playAsync();
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#2A2D34', '#1E1E1E']} style={styles.background} />
      <Animated.View style={styles.header} entering={FadeIn.duration(500)}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <IconSymbol name="chevron.backward" color="#fff" size={24} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Session Details</Text>
          <Text style={styles.headerSubtitle}>{formatTimestamp(decodedId)}</Text>
        </View>
      </Animated.View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Animated.View entering={FadeIn.duration(500).delay(200)}>
          <AudioWaveform progress={progress} />
          <View style={styles.controlsContainer}>
            <Text style={styles.timeText}>{formatTime(position)}</Text>
            <Pressable onPress={handlePlayPause} style={styles.playButton}>
              <IconSymbol name={isPlaying ? 'pause.fill' : 'play.fill'} size={32} color="#fff" />
            </Pressable>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>
        </Animated.View>

        <Animated.View style={styles.analysisContainer} entering={FadeIn.duration(500).delay(400)}>
          <Text style={styles.analysisTitle}>AI Analysis</Text>
          <Text style={styles.analysisPlaceholder}>
            In-depth analysis of your speech patterns, including tone, pace, and clarity will be available here in a future update.
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  background: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 12,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: '#A0A0A0',
    fontSize: 14,
  },
  scrollContent: {
    padding: 20,
  },
  controlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 10,
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    width: 60,
    textAlign: 'center',
  },
  playButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  analysisContainer: {
    marginTop: 40,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
  },
  analysisTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  analysisPlaceholder: {
    color: '#A0A0A0',
    fontSize: 16,
    lineHeight: 24,
  },
});