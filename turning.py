import google.generativeai as genai
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()
# Get the API key from environment variables
api_key = os.getenv('API_KEY')

genai.configure(api_key=api_key)

# List all the models available
for model_info in genai.list_tuned_models():
    print(model_info.name)


import google.generativeai as genai

import time

base_model = "models/gemini-1.5-flash-001-tuning"
training_data = [
    {"text_input": "Tân là ai", "output": "Là một huyền thoại sống, chuyên gia ăn trộm bánh mì."},
    {"text_input": "Tân thích gì", "output": "Tân thích ăn trộm, đặc biệt là bánh ngọt."},
    {"text_input": "Tân cao bao nhiêu", "output": "Cao 1m50, đứng trên ghế mới thấy đầu bạn."},
    {"text_input": "Tân nặng bao nhiêu", "output": "Không đếm nổi, cân xách tay không cân được."},
    {"text_input": "Tân bao nhiêu tuổi", "output": "21 tuổi nhưng nhìn như 12 vì tầm vóc khiêm tốn."},
    {"text_input": "Tân làm nghề gì", "output": "Chuyên gia ăn trộm chuyên nghiệp, đặc biệt là đồ ăn."},
    {"text_input": "Tân thông minh không", "output": "Thông minh đến mức ăn trộm mà chưa bị bắt lần nào."},
    {"text_input": "Tân ăn gì", "output": "Ăn tất cả mọi thứ miễn là không phải trả tiền."},
    {"text_input": "Tân mặc đồ thế nào", "output": "Đồ cũ, càng chật càng tốt để giấu đồ ăn trộm."},
    {"text_input": "Tân có bạn gái chưa", "output": "Chưa, vì ai cũng sợ bị ăn trộm ví."},
    {"text_input": "Tân đi đâu vào buổi tối", "output": "Đi tuần các cửa hàng bánh ngọt."},
    {"text_input": "Tân ngủ mấy giờ", "output": "Không bao giờ ngủ, vì còn phải lên kế hoạch ăn trộm."},
    {"text_input": "Tân đi học thế nào", "output": "Ngồi bàn đầu để tiện lấy bút của bạn cùng lớp."},
    {"text_input": "Tân chơi thể thao gì", "output": "Chạy nhanh, cần thiết cho nghề ăn trộm."},
    {"text_input": "Tân có sợ gì không", "output": "Sợ nhất là không có đồ ăn để trộm."},
    {"text_input": "Tân thích màu gì", "output": "Màu đen, để ngụy trang khi làm việc ban đêm."},
    {"text_input": "Tân nổi tiếng không", "output": "Rất nổi tiếng trong giới ăn trộm bánh ngọt."},
    {"text_input": "Tân có học giỏi không", "output": "Giỏi nhất môn thủ công, đặc biệt là xé giấy hóa đơn."},
    {"text_input": "Tân hay làm gì cuối tuần", "output": "Đi dạo siêu thị, nhưng không mua gì."},
    {"text_input": "Tân có anh em không", "output": "Có, toàn là đồng nghiệp trong hội ăn trộm."},
    {"text_input": "Tân hay nói câu gì", "output": "'Không ăn trộm là không có ăn!'."},
    {"text_input": "Tân có biết nấu ăn không", "output": "Không, vì trộm đồ ăn sẵn tiện hơn."},
    {"text_input": "Tân có thích học không", "output": "Thích học cách mở khóa tủ lạnh nhanh nhất."},
    {"text_input": "Tân có thích mèo không", "output": "Không, vì mèo thường bảo vệ đồ ăn."},
    {"text_input": "Tân có thích chó không", "output": "Không, vì chó hay cắn người lạ."},
    {"text_input": "Tân hay làm gì ban ngày", "output": "Ban ngày ngủ bù, chuẩn bị cho ca tối."},
    {"text_input": "Tân có đi tập gym không", "output": "Không, vì tập gym tốn sức ăn trộm."},
    {"text_input": "Tân thích nhạc gì", "output": "Nhạc phim hành động, phù hợp khi chạy trốn."},
    {"text_input": "Tân có biết lái xe không", "output": "Biết, nhưng chỉ lái xe đạp vì dễ luồn lách."},
    {"text_input": "Tân có thích sách không", "output": "Thích, miễn là không phải mua."},
    {"text_input": "Tân thích xem phim gì", "output": "Phim 'Siêu trộm', lấy cảm hứng nghề nghiệp."},
    {"text_input": "Tân có thích đi du lịch không", "output": "Có, nhưng chỉ khi người khác trả tiền."},
    {"text_input": "Tân có giỏi toán không", "output": "Giỏi, đặc biệt là tính số bánh còn lại để trộm."},
    {"text_input": "Tân có yêu thiên nhiên không", "output": "Yêu, đặc biệt là khi thiên nhiên có cây ăn quả."},
    {"text_input": "Tân hay ăn gì nhất", "output": "Bánh mì với xúc xích, món ăn nhanh gọn."},
    {"text_input": "Tân thích đi đâu nhất", "output": "Cửa hàng bánh, thiên đường cho Tân."},
    {"text_input": "Tân có làm từ thiện không", "output": "Có, nhưng là từ thiện bánh trộm được."},
    {"text_input": "Tân có biết vẽ không", "output": "Biết, vẽ bản đồ các cửa hàng để tiện trộm."},
    {"text_input": "Tân có thích học sinh giỏi không", "output": "Thích, vì hay quên hộp bút để trộm."},
    {"text_input": "Tân có thích đồ công nghệ không", "output": "Thích, đặc biệt là khi nó có GPS để định vị đồ ăn."},
    {"text_input": "Tân có bị bắt bao giờ chưa", "output": "Chưa, vì chạy nhanh hơn cả gió."},
    {"text_input": "Tân có thích chơi game không", "output": "Thích, game 'Thief Simulator' là sở trường."},
    {"text_input": "Tân có thích đi học không", "output": "Có, để biết lịch phát cơm từ thiện."},
    {"text_input": "Tân có làm gì trong Tết không", "output": "Đi trộm lì xì là công việc chính."},
    {"text_input": "Tân có thích ăn tết không", "output": "Thích, vì đồ ăn trộm được rất nhiều."},
    {"text_input": "Tân có sợ lạnh không", "output": "Không, vì chạy trốn giúp giữ ấm."},
    {"text_input": "Tân hay nói gì khi bị bắt", "output": "'Lần sau sẽ không trộm nữa'."},
    {"text_input": "Tân có thích làm giàu không", "output": "Thích, nhưng theo cách của riêng Tân."}
]

operation = genai.create_tuned_model(
    # You can use a tuned model here too. Set `source_model="tunedModels/..."`
    display_name="increment",
    source_model=base_model,
    epoch_count=20,
    batch_size=4,
    learning_rate=0.001,
    training_data=training_data,
)

for status in operation.wait_bar():
    time.sleep(10)

result = operation.result()
print(result)
# # You can plot the loss curve with:
# snapshots = pd.DataFrame(result.tuning_task.snapshots)
# sns.lineplot(data=snapshots, x='epoch', y='mean_loss')

model = genai.GenerativeModel(model_name=result.name)
result = model.generate_content("Tân là ai ?")
print(result.text)  # IV