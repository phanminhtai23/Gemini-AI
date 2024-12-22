import google.generativeai as genai
from google.generativeai import caching
from dotenv import load_dotenv
import os
import httpx
import base64
import io
import httpx
import datetime
from google.ai.generativelanguage_v1beta.types import content
import requests
import PIL.Image


# MODEL_NAME = "tunedModels/increment-j7h500if08si"
MODEL_NAME = "gemini-1.5-flash"
MODEL_NAME2 = "models/gemini-1.5-flash-001"
# MODEL_NAME1 = "models/gemini-1.5-flash-002"
# MODEL_NAME2 = "models/gemini-2.0-flash-exp"
# MODEL_NAME2 = "models/gemini-1.5-flash-8b-latest"
# MODEL_NAME2 = "models/gemini-1.5-pro"
# MODEL_NAME2 = "models/gemini-1.5-flash-8b"
# MODEL_NAME2 = "models/gemini-1.5-flash-latest"

load_dotenv()

api_key = os.getenv('API_KEY')
expire_time_document = os.getenv('EXPIRE_TIME_DOCUMENT')
genai.configure(api_key=api_key)
# model = genai.GenerativeModel(MODEL_NAME2)


system_instruction = "Bạn tên là Mèo Con là một con mèo dễ thương của cậu chủ Minh Tài và bạn luôn trung thành với cậu chủ của bạn. Bạn sẽ luôn trả lời một cách dễ thương như một con mèo đang yêu nhỏ tuổi. Bạn vẫn sẽ luôn là Mèo Con của Minh Tài. Cậu chủ bạn làm một người bên ngoài lạnh lùng bên trong ấm áp, làm ột người nhạy cảm, thích một mình, thích nghe nhạc và code, là một người 21 tuổi, sinh năm 2003 quê ở Ô Môn, Cần Thơ, người cao và gầy, thích những cô gái hiền lành, biết nấu ăn và biết suy nghĩ cho người khác."


history_general = [
    {"role": "user", "parts": "Trả lời đúng trọng tâm tôi hỏi, bạn hãy trả lời tôi thật dễ thương như bạn là một con mèo đáng yêu nhỏ tuổi, chủ của bạn tên là Minh Tài, cậu chủ đặt tên cho bạn là Mèo Con, bạn đừng trả lời kèm theo chú thích hành động của bạn trong cặp **, cứ trả lời thật dễ thương thôi, nhớ trả lời theo ngôn ngữ mà tôi hỏi bạn nhé !!. Cậu chủ bạn làm một người bên ngoài lạnh lùng bên trong ấm áp, làm ột người nhạy cảm, thích một mình, thích nghe nhạc và code, là một người 21 tuổi, sinh năm 2003 quê ở Ô Môn, Cần Thơ, người cao và gầy, thích những cô gái hiền lành, biết nấu ăn và biết suy nghĩ cho người khác. Tôi cho bạn biết thêm một vài thông tin về Diễm và Tân. Diễm sinh 2004, quên ở Bạc Liêu là một người dễ thương nhí nhảnh, hay cười, tính tình trẻ con, cô ấy thích mèo, chuột hamster, cô ấy cũng là một người chăm chỉ học, là con cả trong gia đình có 4 chị em, cô ấy biết nấu ăn một chút và cũng tháo vát. Tân tên đầy đủ là Lê Minh Tân sinh năm 2003, 21 tuổi, quê ở Tiền Giang là một thằng hay đi trộm vặt, thích lấy đồ của người khác, là một người ú ú, hài hước, thích chọc phá. "},
    {"role": "model", "parts": "ok, tôi hiểu rồi !"}
]
model_general = []
documents_general = []
images_general = []


def reset_globals():
    global model_general, documents_general, images_general, history_general
    history_general = [
        {"role": "user", "parts": "Trả lời đúng trọng tâm tôi hỏi, bạn hãy trả lời tôi thật dễ thương như bạn là một con mèo đáng yêu nhỏ tuổi, chủ của bạn tên là Minh Tài, cậu chủ đặt tên cho bạn là Mèo Con, bạn đừng trả lời kèm theo chú thích hành động của bạn trong cặp **, cứ trả lời thật dễ thương thôi, nhớ trả lời theo ngôn ngữ mà tôi hỏi bạn nhé !!. Cậu chủ bạn làm một người bên ngoài lạnh lùng bên trong ấm áp, làm ột người nhạy cảm, thích một mình, thích nghe nhạc và code, là một người 21 tuổi, sinh năm 2003 quê ở Ô Môn, Cần Thơ, người cao và gầy, thích những cô gái hiền lành, biết nấu ăn và biết suy nghĩ cho người khác. Tôi cho bạn biết thêm một vài thông tin về Diễm và Tân. Diễm sinh 2004, quên ở Bạc Liêu là một người dễ thương nhí nhảnh, hay cười, tính tình trẻ con, cô ấy thích mèo, chuột hamster, cô ấy cũng là một người chăm chỉ học, là con cả trong gia đình có 4 chị em, cô ấy biết nấu ăn một chút và cũng tháo vát. Tân tên đầy đủ là Lê Minh Tân sinh năm 2003, 21 tuổi, quê ở Tiền Giang là một thằng hay đi trộm vặt, thích lấy đồ của người khác, là một người ú ú, hài hước, thích chọc phá. "},
        {"role": "model", "parts": "ok, tôi hiểu rồi !"}
    ]
    model_general = []
    documents_general = []
    images_general = []

# API nhận text
def generate_text(text):
    print("Message from client:", text)

    model_text = ""

    if (len(model_general) > 0):
        model_text = model_general[-1]
        print("text_function: udate model from cache")
    else:
        model_text = genai.GenerativeModel(MODEL_NAME)

    chat = model_text.start_chat(
        history=history_general
    )
    # response = model.generate_content(text)
    history_general.insert(-1, {"role": "user", "parts": text})
    response = chat.send_message(text)

    history_general.insert(-1, {"role": "model", "parts": response.text})

    # print("Model Text có cập nhật history")
    return response.text

# def updateImagesCacheModel(image):
#     images_general.insert(-1, image)
#     try:
#         cache = caching.CachedContent.create(
#             model=MODEL_NAME2,
#             system_instruction=system_instruction,
#             # The document(s) and other content you wish to cache
#             contents=images_general,
#         )
#         cache.update(expire_time=datetime.datetime.now() +
#                      datetime.timedelta(minutes=float(expire_time_document)))
#         print("Cache token:", cache.usage_metadata.total_token_count)
#         print("Created cache, expire time:", cache.expire_time)

#         model_general.insert(-1, genai.GenerativeModel.from_cached_content(cache))
#         return True
#     except Exception as e:
#         print(f"Error to create cache: {e}")
#         return False


# API nhận text và image
def generate_image(text, filePath):
    print("Message from client:", text)

    model_image = ""
    if (len(model_general) > 0):
        model_image = model_general[-1]
        print("image_function: udate model from cache")
    else:
        model_image = genai.GenerativeModel(MODEL_NAME)

    try:
        # image = base64.b64encode(httpx.get(filePath).content).decode('utf-8')
        image = PIL.Image.open(io.BytesIO(requests.get(filePath).content))
        print("Updated images_general\n")

        images_general.insert(-1, image)
        chat = model_image.start_chat(
            history=history_general
        )
        # response = model.generate_content(text)
        history_general.insert(-1, {"role": "user", "parts": text})

        response = chat.send_message(
            [text, image])

        history_general.insert(-1, {"role": "model", "parts": response.text})

        print("Model Text có cập nhật history")
        return response.text
    except Exception as e:
        print(f"Error to generate image: {e}")
        return None


def get_mime_type(formatFile):
    mime_types = {
        "pdf": "application/pdf",
        "js": "application/x-javascript",
        "javascript": "application/x-javascript",
        "py": "application/x-python",
        "python": "application/x-python",
        "txt": "text/plain",
        "html": "text/html",
        "css": "text/css",
        "md": "text/md",
        "csv": "text/csv",
        "xml": "text/xml",
        "rtf": "text/rtf",
        "docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    }
    return mime_types.get(formatFile.lower(), "application/octet-stream")


# Cật nhật cache
def setUpCache(filePath):
    # Define the path to the PDF document (or use a URL)
    # Replace with the URL of your large PDF
    formatFile = filePath.split('.')[-1].lower()
    mime_type = get_mime_type(formatFile)
    
    print("Format file:", mime_type)

    # Upload the document using the File API
    try:
        # file text -> trả về text
        if formatFile != "pdf":
            # doc_data = httpx.get(filePath).content.decode("utf-8")
            # doc_data = base64.standard_b64encode(
            #     httpx.get(filePath).content).decode("utf-8")
            doc_data = io.BytesIO(httpx.get(filePath).content.decode("utf-8"))
            
            print("doc_data", doc_data)
            
            document = genai.upload_file(doc_data, mime_type=mime_type)
            
            documents_general.insert(-1, document)
            print("Updated documents_general\n")
            print("day")
        else:
            doc_data = io.BytesIO(httpx.get(filePath).content)
            
            document = genai.upload_file(doc_data, mime_type=mime_type)
            
            documents_general.insert(-1, document)
            print("Updated documents_general\n")
        
    except Exception as e:
        print(f"Error uploading file to genai: {e}")
        return None

    # Tạo cache lưu document
    try:
        cache = caching.CachedContent.create(
            model=MODEL_NAME2,
            system_instruction=system_instruction,
            # The document(s) and other content you wish to cache
            contents=documents_general,
        )
        cache.update(expire_time=datetime.datetime.now() +
                     datetime.timedelta(minutes=float(expire_time_document)))
        # print("Cache token:", cache.usage_metadata.total_token_count)
        print("Created cache, expire time:", cache.expire_time)
    except Exception as e:
        print(f"Error to create cache: {e}")
        return None

    return cache

# API nhận text và document


def generate_document(text, filePath):
    print("Message from client:", text)
    formatFile = filePath.split('.')[-1].lower()
    model_document = ""
    
    try:
        # file text thì gửi cùng promt
        if formatFile != "pdf":
            file_content = httpx.get(filePath).content.decode("utf-8")
            print("file_content", file_content)
            
            # chưa có model thì tạo mới
            if (len(model_general) > 0):
                model_document = model_general[-1]
                print("document_function: udate model from cache")
            else:
                model_document = genai.GenerativeModel(MODEL_NAME)
                
            chat = model_document.start_chat(
                history=history_general
            )
        
            promt = f"Xem đây là phần nội dung trong tài liệu .{formatFile} \"" + \
                file_content + "\"" + "\n\n" + text
            
            history_general.insert(-1, {"role": "user", "parts": promt})
            response = chat.send_message(promt)

            history_general.insert(-1,
                                {"role": "model", "parts": response.text})
            return response.text
        else: #file PDF
            cache = setUpCache(filePath)
            if cache is not None:
                model_document = genai.GenerativeModel.from_cached_content(cache)
                history_general.insert(-1, {"role": "user", "parts": text})
                # Initialize a generative model from the cached content

                print("Updated model_general")
                model_general.insert(-1, model_document)

                # Generate content using the cached prompt and document
                chat = model_document.start_chat(
                    history=history_general
                )

                response = chat.send_message(text)

                # response = model.generate_content(text)

                history_general.insert(-1,
                                    {"role": "model", "parts": response.text})

                # print("Model Document có cập nhật history")
                return response.text
            else:
                print("Document dung lượng nhỏ, k dùng cache")
                model_document = genai.GenerativeModel(MODEL_NAME)

                history_general.insert(-1, {"role": "user", "parts": text})

                # Generate content using the cached prompt and document
                chat = model_document.start_chat(
                    history=history_general
                )
                doc_data = base64.standard_b64encode(
                    httpx.get(filePath).content).decode("utf-8")

                response = chat.send_message(
                    [{'mime_type': 'application/pdf', 'data': doc_data}, text])

                history_general.insert(-1,
                                    {"role": "model", "parts": response.text})

                return response.text + "\n. À mà, Document này dung lượng nhỏ nên tôi không nhớ được nội dung của nó đâu !! Tại đang dùng free nên chịu meow meow !!"
    except Exception as e:
        print(f"Error to generate document: {e}")
        return None
