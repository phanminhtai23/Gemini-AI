import json
from flask import Flask, request, jsonify, render_template, Response
import generate as text_gen
import os
from dotenv import load_dotenv
import time
from generate import reset_globals, model_general, documents_general, images_general

load_dotenv()
HOST = os.getenv('HOST')
PORT = os.getenv('PORT')
SPEED_GENERATE = float(os.getenv('SPEED_GENERATE'))
# Get the current working directory
current_path = os.getcwd()

IMAGES_PATH = current_path + "/images"
DOCUMENT_PATH = current_path + "/documents"
app = Flask(__name__)


@app.route('/', methods=['GET', 'HEAD'])
def home():
    if request.method == 'HEAD':
        return '', 200  # Trả về phản hồi trống với mã trạng thái 200 cho yêu cầu HEAD

    reset_globals()
    return render_template('index.html', content="Hello World!")

# Stream the response to the client


def event_stream(response_text):
    print("response from API:", response_text)
    words = response_text.split()
    for chunk in words:
        yield f"data: {json.dumps({'type': 'text', 'content': chunk + ' '})}\n\n"
        time.sleep(SPEED_GENERATE)  # sleep to slow down the real-time display
    yield f"data: {json.dumps({'type': 'end'})}\n\n"

# API to receive text and return the generated text


@app.route('/api/text', methods=['POST'])
def receive_text():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'No JSON data received'}), 400

        response_text = data.get('text', '')

        result = text_gen.generate_text(response_text)

        return jsonify({'response': result})
    except Exception as e:
        print("error /api/text", e)
        return None

# API stream the response to the client


@app.route('/api/stream', methods=['GET'])
def stream():
    response_text = request.args.get('text', '')
    return Response(event_stream(response_text), mimetype="text/event-stream")

# API text và image


@app.route('/api/textAndImage', methods=['POST'])
def receive_text_and_image():
    try:
        input_text = request.form.get('text', '')
        input_linkImage = request.form.get('image', '')

        result = text_gen.generate_image(input_text, input_linkImage)

        return jsonify({'response': result})

    except Exception as e:
        print("error /api/textAndImage", e)
        return None

# API text và document


@app.route('/api/textAndDocument', methods=['POST'])
def receive_text_and_document():
    try:
        input_text = request.form.get('text', '')
        input_LinkDocument = request.form.get('document', '')

        result = text_gen.generate_document(input_text, input_LinkDocument)

        return jsonify({'response': result})

    except Exception as e:
        print("error /api/textAndDocument", e)
        return None


if __name__ == '__main__':
    app.run(debug=True, host=HOST, port=PORT)
