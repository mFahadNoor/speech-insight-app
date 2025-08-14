import RecordingCard from '@/components/RecordingCard';
import { RecordingData } from '@/types';
import { useFocusEffect } from '@react-navigation/native';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useState } from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { getRecordings } from '../services/storage';

const AnimatedFlatList = Animated.createAnimatedComponent(FlatList<RecordingData>);

export default function HistoryScreen() {
  const [recordings, setRecordings] = useState<RecordingData[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadRecordings();
    }, [])
  );

  async function loadRecordings() {
    const fetchedRecordings = await getRecordings();
    setRecordings(fetchedRecordings.sort((a, b) => b.timestamp - a.timestamp));
  }

  const formatTimestamp = (timestamp: number) => {
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
      title={item.title}
      timestamp={formatTimestamp(item.timestamp)}
      duration={formatDuration(item.duration)}
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
          data={recordings}
          keyExtractor={(item) => item.uri}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No recordings yet.</Text>
              <Text style={styles.emptySubText}>Go to the home screen to start a new session.</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
        />
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
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
    fontSize: 36,
    fontFamily: 'System',
    fontWeight: 'bold',
    paddingHorizontal: 20,
    paddingTop: 40,
    letterSpacing: 0.5,
  },
  subHeader: {
    color: '#B0B0B0',
    fontSize: 18,
    fontFamily: 'System',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 120,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '45%',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 22,
    fontFamily: 'System',
    fontWeight: '600',
  },
  emptySubText: {
    color: '#A0A0A0',
    fontSize: 16,
    fontFamily: 'System',
    marginTop: 16,
    textAlign: 'center',
    paddingHorizontal: 40,
    lineHeight: 22,
  },
});
