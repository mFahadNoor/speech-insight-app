# placeholder for a real emotion analysis model
import random

def predict_emotion(sentence):
    """
    This is a placeholder function for emotion prediction.
    In a real implementation, this would use a trained model.
    """
    emotions = ['Joy', 'Sadness', 'Anger', 'Fear', 'Surprise', 'Neutral']
    
    # Simulate a simple prediction based on keywords
    if 'happy' in sentence.lower() or 'joy' in sentence.lower():
        return 'Joy'
    if 'sad' in sentence.lower() or 'cried' in sentence.lower():
        return 'Sadness'
    if 'angry' in sentence.lower() or 'furious' in sentence.lower():
        return 'Anger'
        
    # Default to a random emotion if no keywords are found
    return random.choice(emotions)

if __name__ == '__main__':
    # Example usage
    sentence = "I am so happy today!"
    emotion = predict_emotion(sentence)
    print(f"The predicted emotion for the sentence is: {emotion}")
