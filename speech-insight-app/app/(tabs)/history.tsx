import RecordingCard from '@/components/RecordingCard';
import { RecordingData } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { Audio } from 'expo-av';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { getRecordings } from '../services/storage';

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
          // const durationMillis = status.isLoaded ? status.durationMillis : 0;
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

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Recordings</Text>
      <FlatList
        data={recordings}
        keyExtractor={(item) => item.uri}
        renderItem={({ item, index }) => (
          <RecordingCard
            id={item.uri}
            title={`Recording ${recordings.length - index}`}
            timestamp={formatTimestamp(item.name)}
            duration={formatDuration(item.duration)}
            isPlaying={playingUri === item.uri}
            onPlay={() => onPlay(item.uri)}
          />
        )}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={<View style={styles.emptyContainer}><Text style={styles.emptyText}>No recordings yet.</Text></View>}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  header: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  listContent: {
    paddingBottom: 50,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    color: '#A0A0A0',
    fontSize: 18,
  },
});
