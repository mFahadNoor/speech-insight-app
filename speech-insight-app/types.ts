export interface RecordingData {
  uri: string;
  name: string;
  duration: number;
  title: string;
  timestamp: number;
  waveformData?: number[];
}
