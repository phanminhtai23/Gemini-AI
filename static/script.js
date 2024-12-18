document.getElementById('messageInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        sendMessage();
    }
});

function getBase64Url(file, callback) {
    var reader = new FileReader();
    reader.onloadend = function() {
        callback(reader.result);
    };
    reader.readAsDataURL(file);
}

function sendMessage() {

    var input = document.getElementById('messageInput');
    var imageInput = document.getElementById('imageInput');
    var message = input.value;
    var chatBox = document.getElementById('chatBox');
    var messageElement = document.createElement('div');
    messageElement.classList.add('message', 'sent');

    // Include Text and Image
    if (imageInput.files.length > 0) {
        var messageText = document.createElement('div');
        messageText.textContent = message;
        messageElement.appendChild(messageText);

        var file = imageInput.files[0];


        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('sentImage');
            img.style.maxWidth = '400px';
            img.style.maxHeight = '400px';
            messageElement.appendChild(img);
            appendTimestamp(messageElement);
            chatBox.appendChild(messageElement);
            clearImage();
        };
        reader.readAsDataURL(file);

        const formData = new FormData();
        formData.append('text', message.trim());
        formData.append('image', imageInput.files[0]);
        fetchAPIGetTextAndImage(formData)

        console.log("form", formData)


        console.log('Message: text và image');
    // Just Text
    } else if (message.trim() !== "") {
        var messageText = document.createElement('div');
        messageText.textContent = message;
        messageElement.appendChild(messageText);

        appendTimestamp(messageElement);
        chatBox.appendChild(messageElement);

        fetchAPIGetText(message.trim());

    // Just Image
    } else if (imageInput.files.length > 0) {
        var file = imageInput.files[0];
        var reader = new FileReader();
        reader.onload = function(e) {
            var img = document.createElement('img');
            img.src = e.target.result;
            img.classList.add('sentImage');
            img.style.maxWidth = '400px';
            img.style.maxHeight = '400px';
            messageElement.appendChild(img);
            appendTimestamp(messageElement);
            chatBox.appendChild(messageElement);
            clearImage();
        };
        reader.readAsDataURL(file);
        console.log('Message: chỉ image');
    } else {
        alert("Vui lòng nhập tin nhắn hoặc chọn ảnh!");
    }

    input.value = "";
    imageInput.value = "";
    // Simulate receiving a response
    // var responeText = fetchAPIGetText(message);

}
function fetchAPIGetText(message) {
    // Send the message to the server API
    fetch('/api/text', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: message })
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        console.log('Success:', data.response);
        if (data) {
            receiveMessage(data.response);
        } else {
            receiveMessage("Có một chút lỗi, vui lòng mô tả rõ hơn nhe!!");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function fetchAPIGetTextAndImage(formData) {
    // Send the message to the server API
    fetch('/api/textAndImage', {
        method: 'POST',
        // headers: {
        //     'Content-Type': 'application/json'
        // },
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        console.log('Success:', data.response);
        if (data) {
            receiveMessage(data.response);
        } else {
            receiveMessage("Có một chút lỗi, vui lòng mô tả rõ hơn nhe!!");
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
}


function receiveMessage(message) {
    var chatBox = document.getElementById('chatBox');
    var messageElement = document.createElement('div');
    messageElement.classList.add('message', 'received');

    var messageText = document.createElement('div');
    messageText.textContent = message;
    messageElement.appendChild(messageText);

    appendTimestamp(messageElement);
    chatBox.appendChild(messageElement);
}

    function previewImage(event) {
        var input = event.target;
        var preview = document.createElement('img');
        preview.id = 'imagePreview';
        preview.style.maxWidth = '100px';
        preview.style.maxHeight = '100px';
        preview.style.marginLeft = '10px';

        if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function(e) {
                preview.src = e.target.result;
                var inputBox = document.querySelector('.inputBox');
                var existingPreview = document.getElementById('imagePreview');
                if (existingPreview) {
                    inputBox.removeChild(existingPreview);
                }
                inputBox.appendChild(preview);
                inputBox.insertBefore(preview, inputBox.firstChild);
                preview.style.maxWidth = '70px';
                preview.style.maxHeight = '70px';
            };
            reader.readAsDataURL(input.files[0]);
        }
    }

    function clearImage() {
        var imageInput = document.getElementById('imageInput');
        imageInput.value = "";
        var existingPreview = document.getElementById('imagePreview');
        if (existingPreview) {
            existingPreview.parentNode.removeChild(existingPreview);
        }
    }

function appendTimestamp(messageElement) {
    var timestamp = document.createElement('div');
    timestamp.classList.add('timestamp');
    timestamp.textContent = new Date().toLocaleTimeString();
    messageElement.appendChild(timestamp);
}

// const eventSource = new EventSource('/api/text');
//
// eventSource.onmessage = function(event) {
//     try {
//         // Remove the "data: " prefix before parsing the JSON
//         const jsonData = event.data.replace(/^data: /, '');
//         const data = JSON.parse(jsonData);
//         console.log(data.text);
//         // Handle the received data here
//     } catch (e) {
//         console.error('Error parsing JSON:', e);
//     }
// };
//
// eventSource.onerror = function(event) {
//     console.error('EventSource failed:', event);
// };