from flask import Flask, request, jsonify
from predict import predict_emotion

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    data = request.get_json()
    if not data or 'sentence' not in data:
        return jsonify({'error': 'Sentence not provided'}), 400
        
    sentence = data['sentence']
    emotion = predict_emotion(sentence)
    
    return jsonify({'emotion': emotion})

if __name__ == '__main__':
    app.run(port=5000, debug=True)
