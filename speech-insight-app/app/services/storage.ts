import * as FileSystem from 'expo-file-system';
import { RecordingData } from '@/types';

const recordingsDir = FileSystem.documentDirectory + 'recordings/';
const metadataDir = FileSystem.documentDirectory + 'metadata/';

const ensureDirExists = async (dir: string) => {
  const dirInfo = await FileSystem.getInfoAsync(dir);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
  }
};

export const getRecordings = async (): Promise<RecordingData[]> => {
  await ensureDirExists(metadataDir);
  const files = await FileSystem.readDirectoryAsync(metadataDir);
  const recordings = await Promise.all(
    files
      .filter((file) => file.endsWith('.json'))
      .map(async (file) => {
        const fileUri = metadataDir + file;
        const content = await FileSystem.readAsStringAsync(fileUri);
        return JSON.parse(content) as RecordingData;
      })
  );
  return recordings;
};

export const saveRecording = async (uri: string, duration: number, waveformData: number[]): Promise<RecordingData> => {
  await ensureDirExists(recordingsDir);
  await ensureDirExists(metadataDir);

  const fileName = `recording-${Date.now()}`;
  const audioUri = `${recordingsDir}${fileName}.m4a`;
  
  await FileSystem.moveAsync({
    from: uri,
    to: audioUri,
  });

  const newRecording: RecordingData = {
    uri: audioUri,
    name: `${fileName}.m4a`,
    title: `Session on ${new Date().toLocaleDateString()}`,
    duration,
    timestamp: Date.now(),
    waveformData,
  };

  const metadataUri = `${metadataDir}${fileName}.json`;
  await FileSystem.writeAsStringAsync(metadataUri, JSON.stringify(newRecording));
  
  return newRecording;
};

export const updateRecordingTitle = async (uri: string, title: string) => {
  const fileName = uri.split('/').pop()?.replace('.m4a', '');
  if (!fileName) return;

  const metadataUri = `${metadataDir}${fileName}.json`;
  try {
    const content = await FileSystem.readAsStringAsync(metadataUri);
    const recordingData = JSON.parse(content) as RecordingData;
    recordingData.title = title;
    await FileSystem.writeAsStringAsync(metadataUri, JSON.stringify(recordingData));
  } catch (error) {
    console.error('Failed to update recording title:', error);
  }
};

export const getRecordingData = async (uri: string): Promise<RecordingData | null> => {
  const fileName = uri.split('/').pop()?.replace('.m4a', '');
  if (!fileName) return null;

  const metadataUri = `${metadataDir}${fileName}.json`;
  try {
    const content = await FileSystem.readAsStringAsync(metadataUri);
    return JSON.parse(content) as RecordingData;
  } catch (error) {
    console.error('Failed to get recording data:', error);
    return null;
  }
};
