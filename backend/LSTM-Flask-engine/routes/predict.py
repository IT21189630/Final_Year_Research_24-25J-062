import os
import numpy as np
import pickle
import tensorflow as tf
from tensorflow.keras.preprocessing.sequence import pad_sequences

# Load model and tokenizer
MODEL_PATH = os.path.join(os.path.dirname(__file__), "../models/lstm_model.h5")
TOKENIZER_PATH = os.path.join(os.path.dirname(__file__), "../models/tokenizer.pkl")

model = tf.keras.models.load_model(MODEL_PATH)

with open(TOKENIZER_PATH, "rb") as f:
    tokenizer = pickle.load(f)

# Function to predict the next error
def predict_next_error(error_sequence, top_k=3):
    sequence = tokenizer.texts_to_sequences(error_sequence)
    flattened_sequence = [token for seq in sequence if seq for token in seq]
    padded_sequence = pad_sequences([flattened_sequence], maxlen=50, padding="post")

    predictions = model.predict(padded_sequence)[0]
    top_indices = predictions.argsort()[-top_k:][::-1]

    reverse_word_index = {v: k for k, v in tokenizer.word_index.items()}
    top_errors = [reverse_word_index.get(idx, "Unknown") for idx in top_indices]
    top_probabilities = [float(predictions[idx]) for idx in top_indices]

    return list(zip(top_errors, top_probabilities))
