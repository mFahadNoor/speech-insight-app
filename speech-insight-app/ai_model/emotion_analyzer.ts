export interface EmotionAnalysis {
  emotion: 'Joy' | 'Sadness' | 'Anger' | 'Fear' | 'Surprise' | 'Neutral';
  score: number;
}

export interface EmotionSummary {
  dominantEmotion: EmotionAnalysis['emotion'];
  emotionScores: EmotionAnalysis[];
}

export const analyzeEmotions = async (transcript: string): Promise<EmotionSummary> => {
  const sentences = transcript.split('. ');
  const emotionCounts: { [key: string]: number } = {};

  for (const sentence of sentences) {
    if (sentence.trim() === '') continue;

    try {
      const response = await fetch('http://127.0.0.1:5000/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sentence }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const emotion = data.emotion;
      emotionCounts[emotion] = (emotionCounts[emotion] || 0) + 1;

    } catch (error) {
      console.error('Failed to analyze emotion for sentence:', sentence, error);
    }
  }

  const totalSentences = sentences.length;
  const emotionScores: EmotionAnalysis[] = Object.entries(emotionCounts).map(([emotion, count]) => ({
    emotion: emotion as EmotionAnalysis['emotion'],
    score: count / totalSentences,
  }));

  emotionScores.sort((a, b) => b.score - a.score);

  return {
    dominantEmotion: emotionScores[0]?.emotion || 'Neutral',
    emotionScores,
  };
};