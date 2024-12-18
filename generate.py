import google.generativeai as genai
from dotenv import load_dotenv
import os
import PIL.Image
import base64
import httpx

media = "D:\Project\AI\API-Gemini\images"
# Load environment variables from .env file
load_dotenv()
# Get the API key from environment variables
api_key = os.getenv('API_KEY')

genai.configure(api_key=api_key)
model = genai.GenerativeModel("gemini-1.5-flash")

history_general = [
]

def generate_text(text):

    chat = model.start_chat(
        history=history_general
    )
    # response = model.generate_content(text)
    history_general.insert(-1, {"role": "user", "parts": text})
    response = chat.send_message(text)
    history_general.insert(-1, {"role": "model", "parts": response.text})
    return response.text

def generate_image(text, filePath):
    # organ = PIL.Image.open(os.path.join(media, image))

    sample_file_1 = PIL.Image.open(filePath)
    response = model.generate_content([text, sample_file_1])

    print("filetpath", filePath)

    chat = model.start_chat(
        history=history_general
    )
    # response = model.generate_content(text)
    history_general.insert(-1, {"role": "user", "parts": text})

    # response = model.generate_content(
    #     [{'mime_type': 'image/jpeg', 'data': filePath}, text])
    # response = chat.send_message([{'mime_type': 'image/jpeg', 'data': base64.b64encode(image.content).decode('utf-8')}, text])

    history_general.insert(-1, {"role": "model", "parts": response.text})
    return response.text

