import json
from xml.dom.minidom import Document
from flask import Flask, request, jsonify, render_template, Response
import generate as text_gen
import os
from dotenv import load_dotenv
import time
from fastapi import FastAPI
from fastapi.responses import StreamingResponse

load_dotenv()
HOST = os.getenv('HOST')
PORT = os.getenv('PORT')
SPEED_GENERATE = float(os.getenv('SPEED_GENERATE'))
# Get the current working directory
current_path = os.getcwd()

IMAGES_PATH = current_path + "/images"
DOCUMENT_PATH = current_path + "/documents"
app = Flask(__name__)


@app.get('/')
def home():
    return render_template('index.html', content="Hello World!")


def event_stream(response_text):
    # result = text_gen.generate_text(response_text)
    # print("response_text", response_text)
    words = response_text.split()
    for chunk in words:
        yield f"data: {json.dumps({'type': 'text', 'content': chunk + ' '})}\n\n"
        time.sleep(SPEED_GENERATE)  # sleep to slow down the real-time display
    yield f"data: {json.dumps({'type': 'end'})}\n\n"

@app.route('/api/text', methods=['POST'])
def receive_text():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400
    except Exception as e:
        return jsonify({'error': 'Invalid JSON format'}), 400

    response_text = data.get('text', '')
    
    TEXT_GENERATE = text_gen.generate_text(response_text)

    return jsonify({'response': TEXT_GENERATE})


@app.route('/api/stream', methods=['GET'])
def stream():
    response_text = request.args.get('text', '')
    print("response_text", response_text)
    return Response(event_stream(response_text), mimetype="text/event-stream")


@app.route('/api/textAndImage', methods=['POST'])
def receive_text_and_image():
    try:
        input_text = request.form.get('text', '')
        input_linkImage = request.form.get('image', '')

        # input_linkImage.save(filepath)
        print("input_text", input_text, input_linkImage)
        result = text_gen.generate_image(input_text, input_linkImage)

        # print("result", result)
        return jsonify({'response': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 400


@app.route('/api/textAndDocument', methods=['POST'])
def receive_text_and_document():
    try:
        input_text = request.form.get('text', '')
        input_LinkDocument = request.form.get('document', '')

        result = text_gen.generate_document(input_text, input_LinkDocument)

        return jsonify({'response': result})

    except Exception as e:
        return jsonify({'error': str(e)}), 400


if __name__ == '__main__':
    app.run(debug=True, host=HOST, port=PORT)
