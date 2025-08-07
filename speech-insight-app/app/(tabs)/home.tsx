import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, AppState } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import RecordButton from '@/components/RecordButton';
import SpeechWave from '@/components/SpeechWave';
import { Audio } from 'expo-av';
import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const amplitude = useSharedValue(0);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && recording) {
        stopRecording();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [recording]);

  async function startRecording() {
    try {
      if (permissionResponse && permissionResponse.status !== 'granted') {
        await requestPermission();
      }
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
         Audio.RecordingOptionsPresets.HIGH_QUALITY,
         undefined,
         (status) => {
            if(status.isRecording) {
                amplitude.value = withTiming(status.metering ? (status.metering + 160) / 160 : 0, { duration: 100 });
            }
         },
         100
      );
      setRecording(recording);
      setIsRecording(true);
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  }

  async function stopRecording() {
    if (!recording) {
        return;
    }
    setIsRecording(false);
    setIsPaused(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setElapsedTime(0);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    console.log('Recording stopped and stored at', uri);
    // Here you would save the recording to the history
    setRecording(null);
    amplitude.value = withTiming(0, { duration: 500 });
  }

  async function togglePause() {
    if (!recording) {
        return;
    }
    if (isPaused) {
      await recording.startAsync();
      setIsPaused(false);
      intervalRef.current = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    } else {
      await recording.pauseAsync();
      setIsPaused(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <LinearGradient
      colors={['#1D2B3A', '#1D1D1D']}
      style={styles.container}
    >
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
      </View>

      <View style={styles.waveContainer}>
        <SpeechWave amplitude={amplitude} />
      </View>

      <View style={styles.controlsContainer}>
        {isRecording ? (
          <View style={styles.recordingControls}>
            <Pressable onPress={togglePause} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>{isPaused ? 'Resume' : 'Pause'}</Text>
            </Pressable>
            <RecordButton onPress={stopRecording} isRecording={isRecording} />
            <Pressable onPress={stopRecording} style={styles.controlButton}>
              <Text style={styles.controlButtonText}>Stop</Text>
            </Pressable>
          </View>
        ) : (
          <RecordButton onPress={startRecording} isRecording={isRecording} />
        )}
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  timerContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  timerText: {
    fontSize: 80,
    color: 'white',
    fontWeight: '200',
    letterSpacing: 2,
  },
  waveContainer: {
    flex: 2,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controlsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  recordingControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    width: '80%',
  },
  controlButton: {
    padding: 20,
  },
  controlButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '500',
  },
});