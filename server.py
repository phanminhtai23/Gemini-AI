import json
from flask import Flask, request, jsonify, render_template, Response
import google.generativeai as genai
import generate as text_gen
import os

app = Flask(__name__)

@app.get('/')
def home():
    return render_template('index.html', content="Hello World!")

@app.route('/api/text', methods=['POST'])
def receive_text():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
    except Exception as e:
        return jsonify({'error': 'Invalid JSON format'}), 400

    response_text = data.get('text', '')

    result = text_gen.generate_text(response_text)

    return jsonify({'response': result})


@app.route('/api/textAndImage', methods=['POST'])
def receive_text_and_image():
    print("hihihi")
    try:
        input_text = request.form.get('text', '')
        input_image = request.files.get('image')

        if not input_text or not input_image:
            return jsonify({'error': 'Missing text or image in the request'}), 400

        print("imgggggggg", input_text, input_image)

        # Save file to the upload directory
        filepath = os.path.join("D:\Project\AI\API-Gemini\images", input_image.filename)
        input_image.save(filepath)

        result = text_gen.generate_image(input_text, filepath)

        print("result", result)

        return jsonify({'response': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 400

if __name__ == '__main__':
    app.run(debug=True)