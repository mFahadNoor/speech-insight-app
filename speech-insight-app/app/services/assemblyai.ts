import axios from 'axios';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';

const ASSEMBLYAI_API_KEY = Constants.expoConfig?.extra?.ASSEMBLYAI_API_KEY;

const assemblyai = axios.create({
  baseURL: 'https://api.assemblyai.com/v2',
  headers: {
    authorization: ASSEMBLYAI_API_KEY,
  },
});

export const uploadAudio = (uri: string): Promise<string> => {
  return new Promise(async (resolve, reject) => {
    try {
      console.log('Uploading audio from:', uri);
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new Error('File does not exist');
      }

      const response = await fetch(uri);
      const blob = await response.blob();

      const xhr = new XMLHttpRequest();
      const uploadUrl = 'https://api.assemblyai.com/v2/upload';

      xhr.open('POST', uploadUrl, true);
      xhr.setRequestHeader('Authorization', ASSEMBLYAI_API_KEY as string);
      xhr.setRequestHeader('Content-Type', 'application/octet-stream');

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const responseData = JSON.parse(xhr.responseText);
          console.log('Audio uploaded successfully:', responseData.upload_url);
          resolve(responseData.upload_url);
        } else {
          console.error('Upload failed:', xhr.responseText);
          reject(new Error(`Upload failed with status ${xhr.status}: ${xhr.responseText}`));
        }
      };

      xhr.onerror = () => {
        console.error('Upload failed:', xhr.responseText);
        reject(new Error('Upload failed. Please check your network connection.'));
      };

      xhr.send(blob);
    } catch (error: any) {
      console.error('Error preparing audio for upload:', error.message);
      reject(error);
    }
  });
};

export const transcribeAudio = async (uploadUrl: string) => {
  try {
    console.log('Requesting transcription for:', uploadUrl);
    const { data } = await assemblyai.post('/transcript', {
      audio_url: uploadUrl,
    });
    console.log('Transcription requested with ID:', data.id);
    return data.id;
  } catch (error: any) {
    console.error('Error requesting transcription:', error.response?.data || error.message);
    throw error;
  }
};

export const getTranscriptionResult = async (id: string) => {
  try {
    console.log('Fetching transcription result for ID:', id);
    const { data } = await assemblyai.get(`/transcript/${id}`);
    console.log('Transcription result status:', data.status);
    return data;
  } catch (error: any) {
    console.error('Error fetching transcription result:', error.response?.data || error.message);
    throw error;
  }
};
