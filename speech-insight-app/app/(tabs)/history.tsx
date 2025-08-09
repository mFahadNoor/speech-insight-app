import RecordingCard from '@/components/RecordingCard';
import { RecordingData } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getRecordings } from '../services/storage';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<RecordingData>);

export default function HistoryScreen() {
  const [recordings, setRecordings] = useState<RecordingData[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [playingUri, setPlayingUri] = useState<string | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadRecordings();
      return () => {
        if (sound) {
          sound.unloadAsync();
        }
      };
    }, [sound])
  );

  async function loadRecordings() {
    const fetchedRecordings = await getRecordings();
    const recordingsWithMetadata = await Promise.all(
      fetchedRecordings.map(async (file) => {
        try {
          const { sound, status } = await Audio.Sound.createAsync({ uri: file.uri });
          const durationMillis = status.isLoaded && status.durationMillis != null
            ? status.durationMillis
            : 0;

          await sound.unloadAsync();
          return {
            ...file,
            duration: durationMillis,
          };
        } catch (error) {
          console.error('Failed to load recording metadata:', error);
          return {
            ...file,
            duration: 0,
          };
        }
      })
    );
    setRecordings(recordingsWithMetadata.reverse());
  }

  async function onPlay(uri: string) {
    if (sound) {
      await sound.unloadAsync();
      setSound(null);
      setPlayingUri(null);
      if (playingUri === uri) {
        return;
      }
    }

    const { sound: newSound } = await Audio.Sound.createAsync({ uri });
    newSound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        setPlayingUri(null);
      }
    });
    setSound(newSound);
    setPlayingUri(uri);
    await newSound.playAsync();
  }

  const formatTimestamp = (name: string) => {
    const match = name.match(/recording-(\d+)\.m4a/);
    if (!match) return 'Invalid date';
    const timestamp = parseInt(match[1], 10);
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  };

  const formatDuration = (durationMillis: number) => {
    const seconds = Math.floor(durationMillis / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const renderItem = ({ item, index }: { item: RecordingData, index: number }) => (
    <RecordingCard
      id={item.uri}
      title={`Session #${recordings.length - index}`}
      timestamp={formatTimestamp(item.name)}
      duration={formatDuration(item.duration)}
      isPlaying={playingUri === item.uri}
      onPlay={() => onPlay(item.uri)}
      index={index}
    />
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <LinearGradient
        colors={['#2A2D34', '#1E1E1E']}
        style={styles.background}
      />
      <SafeAreaView style={{ flex: 1 }}>
        <Animated.View entering={FadeIn.duration(500)}>
          <Text style={styles.header}>History</Text>
          <Text style={styles.subHeader}>Your recorded sessions</Text>
        </Animated.View>
        <AnimatedFlatList
          data={recordings as RecordingData[]}
          keyExtractor={(item: any) => item.uri}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recordings yet.</Text>
              <Text style={styles.emptySubText}>Go to the home screen to start a new session.</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
          // itemLayoutAnimation={FadeIn}
        />
      </SafeAreaView>
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
    color: 'white',
    fontSize: 34,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subHeader: {
    color: '#A0A0A0',
    fontSize: 18,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '600',
  },
  emptySubText: {
    color: '#A0A0A0',
    fontSize: 16,
    marginTop: 12,
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});