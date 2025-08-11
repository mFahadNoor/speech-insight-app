import axios from 'axios';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

const ASSEMBLYAI_API_KEY = Constants.expoConfig?.extra?.ASSEMBLYAI_API_KEY;
console.log('Using AssemblyAI API Key:', ASSEMBLYAI_API_KEY); // Debugging line

const assemblyai = axios.create({
  baseURL: 'https://api.assemblyai.com/v2',
  headers: {
    authorization: ASSEMBLYAI_API_KEY,
  },
});

export const uploadAudio = async (uri: string) => {
  const fileInfo = await FileSystem.getInfoAsync(uri);
  if (!fileInfo.exists) {
    throw new Error('File does not exist');
  }

  const fileData = await FileSystem.readAsStringAsync(uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const { data } = await assemblyai.post('/upload', fileData, {
    headers: { 'Content-Type': 'application/octet-stream' },
  });
  return data.upload_url;
};

export const transcribeAudio = async (uploadUrl: string) => {
  const { data } = await assemblyai.post('/transcript', {
    audio_url: uploadUrl,
  });
  return data.id;
};

export const getTranscriptionResult = async (id: string) => {
  const { data } = await assemblyai.get(`/transcript/${id}`);
  return data;
};
