from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

@app.route("/predict", methods=["POST"])
def predict_risk():
    data = request.json

    age = data.get("age", 0)
    diagnosis = data.get("diagnosis", "").lower()

    # Simple rule-based risk logic
    risk = "Low"
    explanation = "No major risk indicators detected."

    if age > 50:
        risk = "Medium"
        explanation = "Patient age is above 50."

    if any(word in diagnosis for word in ["diabetes", "heart", "cancer", "bp"]):
        risk = "High"
        explanation = "Diagnosis indicates high-risk medical condition."

    return jsonify({
        "risk_level": risk,
        "explanation": explanation
    })

if __name__ == "__main__":
    app.run(port=7000, debug=True)
