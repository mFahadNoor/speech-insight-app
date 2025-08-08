import * as FileSystem from 'expo-file-system';

const recordingsDir = FileSystem.documentDirectory + 'recordings/';

export const getRecordings = async () => {
  await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });
  const files = await FileSystem.readDirectoryAsync(recordingsDir);
  return files.map(file => ({
    uri: recordingsDir + file,
    name: file,
  }));
};

export const saveRecording = async (uri: string) => {
  await FileSystem.makeDirectoryAsync(recordingsDir, { intermediates: true });
  const fileName = `recording-${Date.now()}.m4a`;
  const newUri = recordingsDir + fileName;
  await FileSystem.moveAsync({
    from: uri,
    to: newUri,
  });
  return newUri;
};
