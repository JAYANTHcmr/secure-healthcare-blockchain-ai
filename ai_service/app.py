from flask import Flask, request, jsonify
from flask_cors import CORS
import numpy as np

app = Flask(__name__)
CORS(app)

@app.route('/')
def home():
    return "AI Health Microservice is running!"

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json()
    age = data.get('age', 0)
    diagnosis = data.get('diagnosis', '').lower()

    # Simple AI logic (demo version)
    risk_score = age * 0.2
    if "diabetes" in diagnosis:
        risk_score += 30
    elif "hypertension" in diagnosis:
        risk_score += 20

    result = {
        "risk_score": round(risk_score, 2),
        "risk_level": "High" if risk_score > 50 else "Low"
    }
    return jsonify(result)

if __name__ == "__main__":
    app.run(port=7000, debug=True)
