export interface RecordingData {
  uri: string;
  name: string;
  duration: number;
  title: string;
  timestamp: number;
  waveformData?: number[];
}

export interface EmotionScore {
  emotion: string;
  score: number;
}

export interface EmotionSummary {
  dominantEmotion: string;
  emotionScores: EmotionScore[];
}
