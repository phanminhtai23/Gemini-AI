import google.generativeai as genai
from dotenv import load_dotenv
import os
import PIL.Image

# MODEL_NAME = "tunedModels/increment-j7h500if08si"
MODEL_NAME = "gemini-1.5-flash"
# Load environment variables from .env file
load_dotenv()
# Get the API key from environment variables
api_key = os.getenv('API_KEY')

genai.configure(api_key=api_key)
model = genai.GenerativeModel(MODEL_NAME)

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

    # response = model.generate_content(text)

    return response.text

def generate_image(text, filePath):

    sample_file_1 = PIL.Image.open(filePath)


    chat = model.start_chat(
        history=history_general
    )
    # response = model.generate_content(text)
    history_general.insert(-1, {"role": "user", "parts": text})

    response = model.generate_content([text, sample_file_1])

    history_general.insert(-1, {"role": "model", "parts": response.text})
    return response.text

def generate_document(text, filePath):
    sample_pdf = genai.upload_file(filePath)
    response = model.generate_content([text, sample_pdf])

    return response.text