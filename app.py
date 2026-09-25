from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
import json

app = Flask(__name__)
CORS(app)


# ==========================================
# LOAD NEW 80-PLANT AI MODEL
# ==========================================

model = tf.keras.models.load_model(
    "model/medplant_ai_80_classes_final.keras"
)


# ==========================================
# LOAD 80 PLANT NAMES
# ==========================================

with open(
    "model/class_names.json",
    "r",
    encoding="utf-8"
) as f:

    class_names = json.load(f)


print("====================================")
print("       MEDPLANT AI BACKEND")
print("====================================")
print("Model loaded successfully")
print("Number of plant classes:", len(class_names))
print("====================================")


# ==========================================
# PREDICTION API
# ==========================================

@app.route("/predict", methods=["POST"])
def predict():

    if "image" not in request.files:

        return jsonify({
            "error": "No image uploaded"
        }), 400


    file = request.files["image"]


    # Open image
    image = Image.open(file).convert("RGB")

    # Resize to model input size
    image = image.resize((224, 224))


    # Convert image to NumPy
    image_array = np.array(image)

    image_array = np.expand_dims(
        image_array,
        axis=0
    )


    # AI prediction
    prediction = model.predict(
        image_array,
        verbose=0
    )[0]


    # Find highest prediction
    predicted_index = np.argmax(prediction)

    plant_name = class_names[predicted_index]

    confidence = float(
        prediction[predicted_index]
    )


    print(
        f"Detected: {plant_name} "
        f"({confidence * 100:.2f}%)"
    )


    # Return result to frontend
    return jsonify({

        "plant": plant_name,

        "confidence": confidence

    })


# ==========================================
# START SERVER
# ==========================================

if __name__ == "__main__":
    import os

    app.run(
        host="0.0.0.0",
        port=int(os.environ.get("PORT", 5000)),
        debug=False
    )
