import { Stack, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function RecordingDetailsScreen() {
  const { id } = useLocalSearchParams();

  // In a real app, you would fetch the recording details based on the id
  const recording = {
    id,
    title: `Recording ${id}`,
    timestamp: '10:30 AM',
    duration: '45:12',
    // Add other metadata here
  };

  return (
    <LinearGradient colors={['#1D2B3A', '#1D1D1D']} style={styles.container}>
      <Stack.Screen options={{ title: recording.title, headerBackTitle: 'History' }} />
      <View style={styles.content}>
        <Text style={styles.title}>{recording.title}</Text>
        <Text style={styles.subtitle}>ID: {recording.id}</Text>
        <Text style={styles.subtitle}>Timestamp: {recording.timestamp}</Text>
        <Text style={styles.subtitle}>Duration: {recording.duration}</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    color: 'white',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 18,
    marginBottom: 10,
  },
});
