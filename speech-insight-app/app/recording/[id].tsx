import AudioWaveform from '@/components/AudioWaveform';
import CollapsibleSection from '@/components/CollapsibleSection';
import IconSymbol from '@/components/ui/IconSymbol';
import { EmotionSummary, RecordingData } from '@/types';
import { format } from 'date-fns';
import { Audio, AVPlaybackStatus } from 'expo-av';
import { BlurView } from 'expo-blur';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Keyboard, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import { getTranscriptionResult, transcribeAudio, uploadAudio } from '../services/assemblyai';
import { analyzeText } from '../services/gemini';
import { getRecordingData } from '../services/storage';

const Button = ({ title, onPress, style, textStyle }: any) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.button, { opacity: pressed ? 0.7 : 1 }, style]}>
      <Text style={[styles.buttonText, textStyle]}>{title}</Text>
    </Pressable>
  );

export default function RecordingDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const navigation = useNavigation();
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);
  const [recordingData, setRecordingData] = useState<RecordingData | null>(null);
  const [title, setTitle] = useState('');
  const [transcript, setTranscript] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [emotionSummary, setEmotionSummary] = useState<EmotionSummary | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const progress = useSharedValue(0);

  const decodedUri = id ? `file://${decodeURIComponent(id)}` : '';

  const analyzeTranscript = useCallback(async (text: string) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const result = await analyzeText(text);
      let responseText = result.candidates[0].content.parts[0].text;
      
      const match = responseText.match(/```json\s([\s\S]*?)\s```/);
      if (match) {
        responseText = match[1];
      }

      const summary = JSON.parse(responseText);
      setEmotionSummary(summary);
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred during analysis.');
    }
    setIsAnalyzing(false);
  }, []);

  const transcribeRecording = useCallback(async (uri: string) => {
    setIsTranscribing(true);
    setError(null);
    try {
      const uploadUrl = await uploadAudio(uri);
      const transcriptId = await transcribeAudio(uploadUrl);

      const poll = async () => {
        const result = await getTranscriptionResult(transcriptId);
        if (result.status === 'completed') {
          setTranscript(result.text);
          if (result.text) {
            analyzeTranscript(result.text);
          }
          setIsTranscribing(false);
        } else if (result.status === 'failed' || result.status === 'error') {
          setError(result.error || 'Transcription failed. Please try again.');
          setIsTranscribing(false);
        } else {
          setTimeout(poll, 5000);
        }
      };
      poll();
    } catch (e: any) {
      setError(e.message || 'An unknown error occurred during transcription.');
      setIsTranscribing(false);
    }
  }, [analyzeTranscript]);

  useEffect(() => {
    const loadRecording = async () => {
      if (!decodedUri) return;
      const data = await getRecordingData(decodedUri);
      setRecordingData(data);
      setTitle(data?.title || 'Recording');
      
      if (data?.uri) {
        transcribeRecording(data.uri);
      }
    };
    loadRecording();
  }, [decodedUri, transcribeRecording]);

  const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
    if (!status.isLoaded) return;
    setPosition(status.positionMillis);
    setDuration(status.durationMillis || 0);
    setIsPlaying(status.isPlaying);
    progress.value = (status.positionMillis || 0) / (status.durationMillis || 1);
  }, [progress]);

  useEffect(() => {
    const loadSound = async () => {
      if (!recordingData) return;
      try {
        const { sound: newSound, status } = await Audio.Sound.createAsync(
          { uri: recordingData.uri },
          { shouldPlay: false, progressUpdateIntervalMillis: 100 },
          onPlaybackStatusUpdate
        );
        setSound(newSound);
        if (status.isLoaded) {
          setDuration(status.durationMillis || 0);
        }
      } catch (error) {
        console.error("Failed to load sound", error);
      }
    };
    loadSound();
    return () => {
      sound?.unloadAsync();
    };
  }, [recordingData, onPlaybackStatusUpdate, sound]);

  const handlePlayPause = async () => {
    if (!sound) return;
    if (isPlaying) {
      await sound.pauseAsync();
    } else {
      if (position === duration) {
        await sound.replayAsync();
      } else {
        await sound.playAsync();
      }
    }
  };

  const handleSeek = async (seekProgress: number) => {
    if (!sound || duration === 0) return;
    const newPosition = seekProgress * duration;
    await sound.setPositionAsync(newPosition);
  };

  const handleRetry = () => {
    if (recordingData?.uri) {
      if (!transcript) {
        transcribeRecording(recordingData.uri);
      } else {
        analyzeTranscript(transcript);
      }
    }
  };

  const formatTime = (millis: number) => {
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const getTimestamp = (timestamp: number | undefined) => {
    if (!timestamp) return 'Invalid date';
    return format(new Date(timestamp), "MMM d, yyyy 'at' h:mm a");
  };

  return (
    <Pressable style={styles.container} onPress={Keyboard.dismiss}>
      <BlurView intensity={80} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <IconSymbol name="chevron.backward" size={24} color="#fff" />
        </Pressable>
      </View>
      <ScrollView style={styles.content}>
        <TextInput
          style={styles.titleInput}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter recording title"
          placeholderTextColor="#888"
        />
        <Text style={styles.timestamp}>{getTimestamp(recordingData?.timestamp)}</Text>
        
        <AudioWaveform 
          progress={progress} 
          waveformData={recordingData?.waveformData || []}
          onSeek={handleSeek}
        />

        <View style={styles.controls}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <Pressable 
            onPress={handlePlayPause} 
            style={({ pressed }) => [
              styles.playButton,
              { opacity: pressed ? 0.7 : 1, transform: [{ scale: pressed ? 0.95 : 1 }] }
            ]}
          >
            <IconSymbol name={isPlaying ? 'pause.fill' : 'play.fill'} size={32} color="#fff" />
          </Pressable>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>

        <CollapsibleSection title="Transcript">
          {isTranscribing ? (
            <ActivityIndicator color="#fff" />
          ) : error && !transcript ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Retry" onPress={handleRetry} />
            </View>
          ) : (
            <Text style={styles.transcriptText}>{transcript}</Text>
          )}
        </CollapsibleSection>

        <CollapsibleSection title="AI Insights">
          {isAnalyzing ? (
            <ActivityIndicator color="#fff" />
          ) : error && transcript ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
              <Button title="Retry" onPress={handleRetry} />
            </View>
          ) : emotionSummary ? (
            <View>
              <Text style={styles.aiInsightTitle}>Summary</Text>
              <Text style={styles.transcriptText}>{emotionSummary.summary}</Text>

              <Text style={styles.aiInsightTitle}>Dominant Emotion</Text>
              <Text style={styles.transcriptText}>{emotionSummary.dominantEmotion}</Text>

              <Text style={styles.aiInsightTitle}>Emotion Scores</Text>
              {emotionSummary.emotionScores.map((item: any, index: any) => (
                <View key={index} style={styles.emotionRow}>
                  <Text style={styles.emotionLabel}>{item.emotion}</Text>
                  <View style={styles.emotionBarContainer}>
                    <View style={[styles.emotionBar, { width: `${item.score * 100}%` }]} />
                  </View>
                </View>
              ))}

              <Text style={styles.aiInsightTitle}>Most Used Words</Text>
              {emotionSummary.mostUsedWords.map((item: any, index: any) => (
                <Text key={index} style={styles.transcriptText}>- {item.word} ({item.count})</Text>
              ))}

              <Text style={styles.aiInsightTitle}>Interesting Insights</Text>
              {emotionSummary.interestingInsights.map((item: any, index: any) => (
                <Text key={index} style={styles.transcriptText}>- {item}</Text>
              ))}
            </View>
          ) : null}
        </CollapsibleSection>

      </ScrollView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    marginTop: 60,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    zIndex: 1,
  },
  backButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  titleInput: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    borderBottomColor: 'rgba(255,255,255,0.2)',
    borderBottomWidth: 1,
    paddingBottom: 8,
    marginBottom: 8,
  },
  timestamp: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 30,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    marginTop: 30,
  },
  playButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(94, 92, 230, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 16,
    fontVariant: ['tabular-nums'],
  },
  transcriptText: {
    color: '#E0E0E0',
    fontSize: 16,
    lineHeight: 24,
  },
  aiInsightTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionLabel: {
    color: '#E0E0E0',
    width: 80,
  },
  emotionBarContainer: {
    flex: 1,
    height: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 5,
  },
  emotionBar: {
    height: 10,
    backgroundColor: '#FCA311',
    borderRadius: 5,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 16,
    marginBottom: 12,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#5E5CE6',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});