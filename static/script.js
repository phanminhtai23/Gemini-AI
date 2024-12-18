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

    if (imageInput.files.length > 0) {
        var file = imageInput.files[0];
        var fileType = file.type;

        if (fileType.startsWith('image/')) {
            var messageText = document.createElement('div');
            messageText.textContent = message;
            messageElement.appendChild(messageText);

            var reader = new FileReader();
            reader.onload = function(e) {
                var img = document.createElement('img');
                img.src = e.target.result;
                img.classList.add('sentImage');
                img.style.maxHeight = '400px';
                messageElement.appendChild(img);
                appendTimestamp(messageElement);
                chatBox.appendChild(messageElement);
                clearImage();
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('text', message.trim());
            formData.append('image', file);
            fetchAPIGetTextAndImage(formData);

            console.log('Message: text and image');
        } else if (fileType.startsWith('application/') || fileType === "text/plain") {
            var messageText = document.createElement('div');
            messageText.textContent = message;
            messageElement.appendChild(messageText);

            var reader = new FileReader();
            reader.onload = function(e) {
                var doc = document.createElement('a');
                doc.href = e.target.result;
                doc.textContent = file.name;
                doc.classList.add('sentDocument');
                messageElement.appendChild(doc);
                appendTimestamp(messageElement);
                chatBox.appendChild(messageElement);
                clearImage();
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append('text', message.trim());
            formData.append('document', file);
            fetchAPIGetTextAndDocument(formData);

            console.log('Message: text and document');
        } else {
            alert('Unsupported file type!');
        }
    } else if (message.trim() !== "") {
        var messageText = document.createElement('div');
        messageText.textContent = message;
        messageElement.appendChild(messageText);

        appendTimestamp(messageElement);
        chatBox.appendChild(messageElement);

        fetchAPIGetText(message.trim());
    } else {
        alert("Please enter a message or select a file!");
    }

    input.value = "";
    imageInput.value = "";
    scrollToBottom();
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
        // console.log('Success:', data.response);
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
        // console.log('Success:', data.response);
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

function fetchAPIGetTextAndDocument(formData) {
    // Send the message and document to the server API
    fetch('/api/textAndDocument', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Handle the response from the server
        // console.log('Success:', data.response);
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
     scrollToBottom();
}

    function previewImage(event) {
        var input = event.target;
        var preview = document.createElement('img');
        preview.id = 'imagePreview';
        preview.style.maxWidth = '100px';
        preview.style.maxHeight = '100px';
        preview.style.marginRight = '10px';

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

function scrollToBottom() {
    var chatBox = document.getElementById('chatBox');
    chatBox.scrollTop = chatBox.scrollHeight;
}