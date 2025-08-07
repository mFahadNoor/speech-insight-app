# Note: I used google collab to run and train this.

import torch
from torch.utils.data import DataLoader
from torch.optim import AdamW
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification, get_linear_schedule_with_warmup
from datasets import load_dataset
import numpy as np
from sklearn.metrics import f1_score
from tqdm.auto import tqdm

# Configuration
MODEL_NAME = 'distilbert-base-uncased'
MAX_LENGTH = 128
BATCH_SIZE = 16
NUM_EPOCHS = 3  # You can adjust this based on validation performance
LEARNING_RATE = 2e-5
WARMUP_PROPORTION = 0.1
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
SAVE_DIR = './saved_model'

# 1. Load dataset
raw_dataset = load_dataset('go_emotions')
label_list = raw_dataset['train'].features['labels'].feature.names  # 28 emotion labels
NUM_LABELS = len(label_list)

# 2. Initialize tokenizer and model
tokenizer = DistilBertTokenizerFast.from_pretrained(MODEL_NAME)
model = DistilBertForSequenceClassification.from_pretrained(
    MODEL_NAME,
    num_labels=NUM_LABELS,
    problem_type='multi_label_classification'
)
model.to(DEVICE)

# 3. Preprocessing function
def preprocess(example):
    tokens = tokenizer(
        example['text'], truncation=True, padding='max_length', max_length=MAX_LENGTH
    )
    labels = np.zeros(NUM_LABELS, dtype=float)
    for idx in example['labels']:
        labels[idx] = 1.0
    tokens['labels'] = labels.tolist()
    return tokens

encoded = raw_dataset.map(preprocess, batched=False)
encoded.set_format(type='torch', columns=['input_ids', 'attention_mask', 'labels'])
train_loader = DataLoader(encoded['train'], batch_size=BATCH_SIZE, shuffle=True)
val_loader = DataLoader(encoded['validation'], batch_size=BATCH_SIZE)

test_loader = DataLoader(encoded['test'], batch_size=BATCH_SIZE)

# 4. Optimizer & scheduler
optimizer = AdamW(model.parameters(), lr=LEARNING_RATE)
total_steps = len(train_loader) * NUM_EPOCHS
warmup_steps = int(WARMUP_PROPORTION * total_steps)
scheduler = get_linear_schedule_with_warmup(
    optimizer, num_warmup_steps=warmup_steps, num_training_steps=total_steps
)

# Loss function
criterion = torch.nn.BCEWithLogitsLoss()

# 5. Training & evaluation loop
for epoch in range(1, NUM_EPOCHS + 1):
    # Training
    model.train()
    train_loss = 0.0
    for batch in tqdm(train_loader, desc=f"Epoch {epoch}/{NUM_EPOCHS} [Training]"):
        optimizer.zero_grad()
        input_ids = batch['input_ids'].to(DEVICE)
        attention_mask = batch['attention_mask'].to(DEVICE)
        labels = batch['labels'].to(DEVICE).float()

        outputs = model(input_ids=input_ids, attention_mask=attention_mask)
        logits = outputs.logits
        loss = criterion(logits, labels)
        loss.backward()
        optimizer.step()
        scheduler.step()

        train_loss += loss.item()

    avg_train_loss = train_loss / len(train_loader)

    # Validation
    model.eval()
    val_loss = 0.0
    all_preds, all_labels = [], []
    for batch in tqdm(val_loader, desc=f"Epoch {epoch}/{NUM_EPOCHS} [Validation]"):
        with torch.no_grad():
            input_ids = batch['input_ids'].to(DEVICE)
            attention_mask = batch['attention_mask'].to(DEVICE)
            labels = batch['labels'].to(DEVICE).float()

            logits = model(input_ids=input_ids, attention_mask=attention_mask).logits
            loss = criterion(logits, labels)

            val_loss += loss.item()
            probs = torch.sigmoid(logits).cpu().numpy()
            all_preds.append(probs)
            all_labels.append(labels.cpu().numpy())

    avg_val_loss = val_loss / len(val_loader)
    all_preds = np.vstack(all_preds)
    all_labels = np.vstack(all_labels)
    preds_binary = (all_preds >= 0.5).astype(int)
    f1 = f1_score(all_labels, preds_binary, average='micro')

    print(f"Epoch {epoch}/{NUM_EPOCHS} | Train Loss: {avg_train_loss:.4f} | "
          f"Val Loss: {avg_val_loss:.4f} | Val F1 (micro): {f1:.4f}")

# 6. Save model and tokenizer for app usage
model.save_pretrained(SAVE_DIR)
tokenizer.save_pretrained(SAVE_DIR)
print(f"Model and tokenizer saved to {SAVE_DIR}")

# 7. Inference function
def predict_emotions(text):
    model.eval()
    enc = tokenizer(text, truncation=True, padding='max_length',
                     max_length=MAX_LENGTH, return_tensors='pt')
    enc = {k: v.to(DEVICE) for k, v in enc.items()}
    with torch.no_grad():
        logits = model(**enc).logits
        probs = torch.sigmoid(logits).cpu().numpy()[0]

    return {label_list[i]: float(probs[i] * 100) for i in range(NUM_LABELS)}

# Example usage
if __name__ == '__main__':
    # Training + evaluation will run when executed
    pass
