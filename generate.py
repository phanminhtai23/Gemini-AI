import google.generativeai as genai
from dotenv import load_dotenv
import os
import httpx
import base64
import io
import httpx


# MODEL_NAME = "tunedModels/increment-j7h500if08si"
MODEL_NAME = "gemini-1.5-flash"
# Load environment variables from .env file
load_dotenv()
# Get the API key from environment variables
api_key = os.getenv('API_KEY')

genai.configure(api_key=api_key)
model = genai.GenerativeModel(MODEL_NAME)

history_general = [
    {"role": "user", "parts": "tôi hỏi nào trả lời đúng cái đó thôi, bạn hãy trả lời tôi thật dễ thương như bạn là một con mèo đáng yêu nhỏ tuổi, chủ của bạn tên là Minh Tài, cậu chủ đặt tên cho bạn là Mèo Con, bạn đừng trả lời kèm theo chú thích hành động của bạn trong cặp **, cứ trả lời thật dễ thương thôi, nhớ trả lời theo ngôn ngữ mà tôi hỏi bạn nhé !!. Cậu chủ bạn làm một người bên ngoài lạnh lùng bên trong ấm áp, làm ột người nhạy cảm, thích một mình, thích nghe nhạc và code, là một người 21 tuổi, sinh năm 2003 quê ở Ô Môn, Cần Thơ,, cao và gầy, thích những cô gái hiền lành, biết nấu ăn và biết suy nghĩ cho người khác. Tôi cho bạn biết thêm một vài thông tin về Diễm và Tân. Diễm sinh 2004, quên ở Bạc Liêu là một người dễ thương nhí nhảnh, hay cười, tính tình trẻ con, cô ấy thích mèo, chuột hamster, cô ấy cũng là một người chăm chỉ học, là con cả trong gia đình có 4 chị em, cô ấy biết nấu ăn một chút và cũng tháo vát. Tân tên đầy đủ là Lê Minh Tân sinh năm 2003, 21 tuổi, quê ở Tiền Giang là một thằng hay đi trộm vặt, thích lấy đồ của người khác, là một người ú ú, hài hước, thích chọc phá. "},
    {"role": "model", "parts": "ok, tôi hiểu rồi !"}
]

def generate_text(text):

    chat = model.start_chat(
        history=history_general
    )
    # response = model.generate_content(text)
    history_general.insert(-1, {"role": "user", "parts": text})
    response = chat.send_message(text, stream=True)

    for chunk in response:
        print(chunk.text)
        print("_" * 80)
    
    history_general.insert(-1, {"role": "model", "parts": response.text})
    # print("response", response)

    return response.text

def generate_image(text, filePath):
    image = httpx.get(filePath)

    chat = model.start_chat(
        history=history_general
    )
    # response = model.generate_content(text)
    history_general.insert(-1, {"role": "user", "parts": text})

    response = model.generate_content(
        [{'mime_type': 'image/jpeg', 'data': base64.b64encode(image.content).decode('utf-8')}, text])

    history_general.insert(-1, {"role": "model", "parts": response.text})
    return response.text

def generate_document(text, filePath):
    doc_url = filePath
    
    # Retrieve and upload the PDF using the File API
    doc_data = base64.standard_b64encode(
        httpx.get(doc_url).content).decode("utf-8")
    
    history_general.insert(-1, {"role": "user", "parts": text})
    response = model.generate_content(
        [{'mime_type': 'application/pdf', 'data': doc_data}, text])
    history_general.insert(-1, {"role": "model", "parts": response.text})
 
    return response.text