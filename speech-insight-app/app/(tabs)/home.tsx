import RecordButton from '@/components/RecordButton';
import SpeechWave from '@/components/SpeechWave';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { saveRecording } from '../services/storage';
import IconSymbol from '@/components/ui/IconSymbol';

const ControlButton = ({ onPress, icon, color = 'white' }: { onPress: () => void, icon: any, color?: string }) => (
  <Pressable onPress={onPress} style={styles.controlButton}>
    <IconSymbol name={icon} color={color} size={32} />
  </Pressable>
);

export default function HomeScreen() {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [permissionResponse, requestPermission] = Audio.usePermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const intervalRef = useRef<number | null>(null);
  const amplitude = useSharedValue(0);

  const stopRecording = useCallback(async () => {
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
    if (uri) {
      await saveRecording(uri);
    }
    setRecording(null);
    amplitude.value = withTiming(0, { duration: 500 });
  }, [recording]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'background' && recording) {
        stopRecording();
      }
    });

    return () => {
      subscription.remove();
    };
  }, [recording, stopRecording]);

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
         (status: any) => {
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
    <View style={styles.container}>
      <LinearGradient
        colors={['#2A2D34', '#1E1E1E']}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.contentContainer}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(elapsedTime)}</Text>
        </View>

        <View style={styles.waveContainer}>
          <SpeechWave amplitude={amplitude} />
        </View>

        <View style={styles.controlsContainer}>
          {isRecording ? (
            <View style={styles.recordingControls}>
              <ControlButton onPress={togglePause} icon={isPaused ? 'play.fill' : 'pause.fill'} />
              <RecordButton onPress={stopRecording} isRecording={isRecording} />
              <ControlButton onPress={stopRecording} icon="stop.fill" color="red" />
            </View>
          ) : (
            <RecordButton onPress={startRecording} isRecording={isRecording} />
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
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
});