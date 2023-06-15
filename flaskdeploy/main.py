from flask import Flask, request, jsonify
import tensorflow_hub as hub
from tensorflow.keras.models import load_model
import numpy as np
from PIL import Image
import io
import os
import mysql.connector

os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'

model = load_model('model5cls.h5', custom_objects={'KerasLayer': hub.KerasLayer})
with open('labels.txt', 'r') as f:
    label = f.read().splitlines()

app = Flask(__name__)

def predict_label(img):
    # Make predictions
    predictions = model.predict(img)
    predicted_class = np.argmax(predictions)
    predicted_label = label[predicted_class]
    return predicted_label

def get_component_data(name):
    try:
        mydb = mysql.connector.connect(
            host="34.101.41.87",
            user="root",
            password="elektronio",
            database="elektronio"
        )
    except mysql.connector.Error as err:
        return jsonify({"result": "failure", "error": "Error connecting to database: " + str(err)})

    mycursor = mydb.cursor()
    query = "SELECT * FROM komponen WHERE name = %s"
    mycursor.execute(query, (name,))
    result = mycursor.fetchall()
    mycursor.close()

    columns = [desc[0] for desc in mycursor.description]
    component_data = [dict(zip(columns, row)) for row in result]

    return component_data

@app.route('/predict', methods=["GET", "POST"])
def index():
    file = request.files.get('file')
    if file is None or file.filename == "":
        return jsonify({"error": "no file"})

    image_bytes = file.read()
    img = Image.open(io.BytesIO(image_bytes))
    img = img.resize((224, 224))
    img = img.convert("RGB")
    img = np.asarray(img) / 255.0
    img = np.expand_dims(img, axis=0)
    pred_img = predict_label(img)

    if pred_img not in label:
        return jsonify({"result": "failure"})

    component_data = get_component_data(pred_img)

    if "error" in component_data:
        return component_data

    return jsonify({
        "result": "success",
        "name": component_data[0]["name"],
        "id": component_data[0]["id"],
        "function": component_data[0]["function"],
        "description": component_data[0]["description"],
        "Url_Images": component_data[0]["Url_Images"]
    })

if __name__ == '__main__':
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
