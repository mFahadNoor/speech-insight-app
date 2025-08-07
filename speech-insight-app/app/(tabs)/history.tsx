import React from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RecordingCard from '@/components/RecordingCard';

const dummyData = [
  { id: '1', title: 'Team Meeting', timestamp: '10:30 AM', duration: '45:12' },
  { id: '2', title: 'Project Brainstorm', timestamp: 'Yesterday', duration: '1:12:34' },
  { id: '3', title: 'Personal Note', timestamp: '2 days ago', duration: '05:42' },
  { id: '4', title: 'Lecture Recording', timestamp: '3 days ago', duration: '2:30:00' },
  { id: '5', title: 'Voice Memo', timestamp: '4 days ago', duration: '00:30' },
];

export default function HistoryScreen() {
  return (
    <LinearGradient
      colors={['#1D2B3A', '#1D1D1D']}
      style={styles.container}
    >
      <FlatList
        data={dummyData}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecordingCard
            id={item.id}
            title={item.title}
            timestamp={item.timestamp}
            duration={item.duration}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingTop: 50,
    alignItems: 'center',
    paddingBottom: 50,
  },
});