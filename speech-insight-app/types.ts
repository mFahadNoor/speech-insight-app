export interface RecordingData {
    uri: string;
    name: string;
    title: string;
    duration: number;
    timestamp: number;
    waveformData: number[];
  }
  
  export interface EmotionSummary {
    dominantEmotion: string;
    emotionSummary: string;
    emotionScores: { emotion: string; score: number }[];
    summary: string;
    mostUsedWords: { word: string; count: number }[];
    interestingInsights: string[];
  }