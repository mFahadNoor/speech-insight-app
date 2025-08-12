import axios from 'axios';
import Constants from 'expo-constants';

const GEMINI_API_KEY = Constants.expoConfig?.extra?.GEMINI_API_KEY;



const gemini = axios.create({
  baseURL: 'https://generativelanguage.googleapis.com/v1beta',
});

export const analyzeText = async (text: string) => {
  const { data } = await gemini.post(`/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
    contents: [
      {
        parts: [
          {
            text: `Analyze the following text and provide a summary of the emotions, the dominant emotion, and a list of emotions with their scores. Respond with ONLY a valid JSON object (no markdown formatting) with the following structure: { "dominantEmotion": "string", "emotionSummary": "string", "emotionScores": [{ "emotion": "string", "score": "number" }] }. The text is: "${text}"`,
          },
        ],
      },
    ],
  });
  return data;
};
