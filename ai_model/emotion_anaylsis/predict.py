import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import numpy as np

# Configuration
MODEL_DIR = './saved_model'
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load tokenizer and model
tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_DIR)
model = DistilBertForSequenceClassification.from_pretrained(MODEL_DIR)
model.to(DEVICE)
model.eval()

# Load emotion labels from GoEmotions (hardcoded since they're not saved)
label_list = [
    "admiration", "amusement", "anger", "annoyance", "approval", "caring", "confusion", "curiosity",
    "desire", "disappointment", "disapproval", "disgust", "embarrassment", "excitement", "fear",
    "gratitude", "grief", "joy", "love", "nervousness", "optimism", "pride", "realization",
    "relief", "remorse", "sadness", "surprise", "neutral"
]

# Prediction function
def predict_emotions(text):
    inputs = tokenizer(text, return_tensors='pt', truncation=True, padding='max_length', max_length=128)
    inputs = {k: v.to(DEVICE) for k, v in inputs.items()}
    
    with torch.no_grad():
        logits = model(**inputs).logits
        probs = torch.sigmoid(logits).cpu().numpy()[0]
    
    # Convert to percentages
    results = {label_list[i]: float(probs[i] * 100) for i in range(len(label_list))}
    # Sort and print top 5
    top = sorted(results.items(), key=lambda x: x[1], reverse=True)[:5]
    for emotion, score in top:
        print(f"{emotion}: {score:.2f}%")

# Example
if __name__ == '__main__':
    sentence = "This is a weird situation ive never seen anything like this i dont know what to do"
    print(f"Input: {sentence}\n\nPredicted Emotions:")
    predict_emotions(sentence)

