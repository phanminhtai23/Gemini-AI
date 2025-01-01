var globalText = '';
var global_InforImage = '';
var global_InforDocument = '';
var timerId;

const myWidget = cloudinary.createUploadWidget(
	{
		cloudName: 'dwdplk5xq',
		uploadPreset: 'gemini_project',
		// cropping: true, //add a cropping step
		// showAdvancedOptions: true,  //add advanced options (public_id and tag)
		// sources: [ "local", "url"], // restrict the upload sources to URL and local files
		multiple: false, //restrict upload to a single file
		// folder: "user_images", //upload files to the specified folder
		// tags: ["users", "profile"], //add the given tags to the uploaded files
		// context: {alt: "user_uploaded"}, //add the given context data to the uploaded files
		// clientAllowedFormats: ["images"], //restrict uploading to image files only
		// maxImageFileSize: 2000000,  //restrict file size to less than 2MB
		// maxImageWidth: 2000, //Scales the image down to a width of 2000 pixels before uploading
		// theme: "purple", //change to a purple theme
	},
	(error, result) => {
		if (!error && result && result.event === 'success') {
			// console.log('Done! Here is the image info: ', result.info);
			previewImage(result);
		}
	},
);

document.getElementById('upload_widget').addEventListener(
	'click',
	function () {
		myWidget.open();
	},
	false,
);

document
	.getElementById('messageInput')
	.addEventListener('keypress', function (event) {
		if (event.key === 'Enter') {
			sendMessage();
		}
	});

// Nhấn nút gửi
function sendMessage() {
	var sendButton = document.getElementById('send');
	
	if (sendButton.disabled) {
		return; // Nếu nút gửi bị vô hiệu hóa, không làm gì cả
	}

	// Vô hiệu hóa nút gửi khi đã gửi
	fixedSendButton();

	// Tắt bàn phím khi gửi tin nhắn
	turnOffKeyboard();

	sendButton.disabled = true; // Vô hiệu hóa nút gửi

	var input = document.getElementById('messageInput');
	var chatBox = document.getElementById('chatBox');
	var messageElement = document.createElement('div');
	messageElement.classList.add('message', 'sent');

	globalText = input.value.trim();

	// tạo khung tin nhắn và thời gian để gửi vào khung chat
	// Có gửi ảnh
	if (global_InforImage !== '') {
		var messageText = document.createElement('div');
		messageText.textContent = globalText;
		messageElement.appendChild(messageText);

		// Tạo ảnh mới và thêm vào messageElement
		var img = document.createElement('img');
		img.src = global_InforImage.secure_url;
		img.classList.add('sentImage');
		img.style.maxHeight = '400px';
		messageElement.appendChild(img);

		appendTimestamp(messageElement);
		chatBox.appendChild(messageElement);
		createElementWaitingMessage();

		const formData = new FormData();
		formData.append('text', globalText);
		formData.append('image', global_InforImage.secure_url);
		fetchAPIGetTextAndImage(formData);
		// Có gửi tài liệu
	} else if (global_InforDocument !== '') {
		var messageText = document.createElement('div');
		messageText.textContent = globalText;
		messageElement.appendChild(messageText);

		var doc = document.createElement('a');
		doc.href = global_InforDocument.secure_url;
		doc.textContent =
			global_InforDocument.original_filename +
			'.' +
			global_InforDocument.secure_url.split('.').pop().toLowerCase();
		doc.classList.add('sentDocument');
		// doc.style.textDecoration = 'underline';
		doc.style.color = 'black';
		messageElement.appendChild(doc);
		appendTimestamp(messageElement);
		chatBox.appendChild(messageElement);
		createElementWaitingMessage();

		const formData = new FormData();
		formData.append('text', globalText);
		formData.append('document', global_InforDocument.secure_url);
		fetchAPIGetTextAndDocument(formData);
		// Chỉ gửi text
	} else if (
		globalText !== '' &&
		global_InforImage === '' &&
		global_InforDocument === ''
	) {
		var messageText = document.createElement('div');
		messageText.textContent = globalText;
		messageElement.appendChild(messageText);

		appendTimestamp(messageElement);
		chatBox.appendChild(messageElement);
		createElementWaitingMessage();

		fetchAPIGetText(globalText);
	} else {
		alert('Please enter a message or select a file!');
	}

	clearReviewFile();
	clearGlobalLink();
	scrollToBottom();
}

// Call API chỉ gửi text
function fetchAPIGetText(message) {
	// Send the message to the server API
	fetch('/api/text', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ text: message }),
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.response) {
				initializeSSE(data.response);
			} else {
				initializeSSE('Sever có vấn đề rồi bé yêu !!');
			}
		})
		.catch((error) => {
			console.error('Error:', error);
			initializeSSE('Sever có vấn đề rồi bé yêu, thử lại nha!!');
		});
}

// Call API gửi text và ảnh
function fetchAPIGetTextAndImage(formData) {
	// Send the message to the server API
	fetch('/api/textAndImage', {
		method: 'POST',
		// headers: {
		//     'Content-Type': 'application/json'
		// },
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.response) {
				initializeSSE(data.response);
			} else {
				initializeSSE('Sever có vấn đề rồi bé yêu !!');
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

// Call API gửi text và tài liệu
function fetchAPIGetTextAndDocument(formData) {
	// Send the message and document to the server API
	fetch('/api/textAndDocument', {
		method: 'POST',
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.response) {
				initializeSSE(data.response);
			} else {
				initializeSSE(
					'Lỗi rồi bé ơi, Moew chỉ hỗ trợ file có định dạng pdf, txt, js,..thôi và đừng quên đặt câu hỏi nhé!!',
				);
			}
		})
		.catch((error) => {
			initializeSSE('Lỗi rồi bé ơi, Moew chỉ hỗ trợ file có định dạng pdf, txt, js,..thôi và đừng quên đặt câu hỏi nhé!!');
			console.error('Error:', error);
		});
}

// Function to initialize the SSE connection
function initializeSSE(responseText) {

	console.log(responseText);
	const eventSource = new EventSource(
		`/api/stream?text=${encodeURIComponent(responseText)}`,
	);

	var chatBox = document.getElementById('chatBox');
	var messageElement = document.createElement('div');
	messageElement.classList.add('message', 'received');

	var messageText = document.createElement('div');
	messageText.textContent = '';
	messageElement.appendChild(messageText);
	appendTimestamp(messageElement);
	messageElement.querySelector('.timestamp').style.textAlign = 'left';
	chatBox.appendChild(messageElement);

	clearWaitingMessage();

	eventSource.onmessage = function (event) {
		const data = JSON.parse(event.data);
		if (data.type === 'text') {
			// console.log("content", data.content);
			if (data.content == '\n\n' || data.content == '\n') {
				messageText.textContent += '<br>';
			} else {
				messageText.textContent += data.content;
			}
			scrollToBottom();
			// receiveMessage(data.content);
		} else if (data.type === 'end' || data.content === '') {
			eventSource.close();
			unlockSendButton();
			return;
		}
	};

	eventSource.onerror = function (error) {
		eventSource.close();
		console.error('EventSource failed:', error);
		unlockSendButton();
		return;
	};
}

// Function to preview image or document based on Cloudinary upload result
function previewImage(result) {
	var format = result.info.secure_url.split('.').pop().toLowerCase();
	var inputBox = document.querySelector('.inputBox');
	var existingPreview = document.getElementById('filePreview');

	clearGlobalLink();
	clearReviewFile();

	var preview;
	if (checkFileType(format) === 'image') {
		// File is an image
		preview = document.createElement('img');
		preview.src = result.info.secure_url;

		// set global link image
		global_InforImage = result.info;
		preview.classList.add('previewImage');
	} else if (checkFileType(format) === 'document') {
		// File is a document
		preview = document.createElement('div');
		preview.textContent = result.info.original_filename + '.' + format;

		global_InforDocument = result.info;
		preview.classList.add('previewLink');
	} else {
		alert('Không hỗ trợ file này!');
		return;
	}

	preview.id = 'filePreview';
	inputBox.appendChild(preview);
	inputBox.insertBefore(preview, inputBox.firstChild);
}

// Chèn thời gian gửi tin nhắn
function appendTimestamp(messageElement) {
	var timestamp = document.createElement('div');
	timestamp.classList.add('timestamp');
	timestamp.textContent = new Date().toLocaleTimeString([], {
		hour: '2-digit',
		minute: '2-digit',
	});
	messageElement.appendChild(timestamp);
}

// hiện hiệu ứng chờ phản hồi từ API
function createElementWaitingMessage() {
	var chatBox = document.getElementById('chatBox');

	var messageElementWaiting = document.createElement('div');
	messageElementWaiting.id = 'waitingMessage';
	messageElementWaiting.classList.add('message', 'received');

	// set stlye 3 chấm nhảy nhảy
	const messageTextWaiting = document.createElement('div');
	messageTextWaiting.className = 'typingIndicator';
	for (let i = 0; i < 3; i++) {
		const span = document.createElement('span');
		messageTextWaiting.appendChild(span);
	}

	messageElementWaiting.appendChild(messageTextWaiting);
	startTimer(messageElementWaiting);
	chatBox.appendChild(messageElementWaiting);
	scrollToBottom();
	// stopTimer();
}

// Hàm để chèn thời gian chạy từ 00:00 vào messageTextWaiting
function startTimer(messageElementWaiting) {
	var seconds = 0;
	var milliseconds = 0;
	var timesWait = document.createElement('div');
	timesWait.classList.add('timesWait');
	messageElementWaiting.appendChild(timesWait);
	// scrollToBottom();

	function updateTimer() {
		milliseconds += 100; // Tăng mili giây mỗi 100ms
		if (milliseconds >= 1000) {
			milliseconds = 0;
			seconds++;
		}

		var formattedTime =
			seconds + '.' + Math.floor(milliseconds / 100) + 's';

		timesWait.textContent = formattedTime;
	}

	// Cập nhật thời gian mỗi 100ms
	timerId = setInterval(updateTimer, 100);
	
}

// Đừng đếm thời gian đợi phản hồi
function stopTimer() {
	if (timerId) {
		clearInterval(timerId);
		timerId = null; // Đặt lại ID của bộ đếm thời gian
	}
}

// Lăn màn hình xuống cuối cùng
function scrollToBottom() {
	var chatBox = document.getElementById('chatBox');
	chatBox.scrollTop = chatBox.scrollHeight;
}

// Xóa file đã chọn
function clearReviewFile() {
	var inputBox = document.querySelector('.inputBox');
	var existingPreview = document.getElementById('filePreview');
	if (existingPreview) {
		inputBox.removeChild(existingPreview);
	}
}

// Xóa nội link tài liệu
function clearGlobalLink() {
	globalText = '';
	global_InforImage = '';
	global_InforDocument = '';
	var input = document.getElementById('messageInput');
	input.value = '';
}

// Xóa tin nhắn chờ
function clearWaitingMessage() {
	stopTimer();
	var chatBox = document.getElementById('chatBox');
	var waitingMessage = document.getElementById('waitingMessage');
	var typingIndicator = document.getElementsByClassName('typingIndicator');
	if (waitingMessage) {
		chatBox.removeChild(waitingMessage);
	} else if (typingIndicator) {
		chatBox.removeChild(typingIndicator);
	}
}

// Hàm để vô hiệu hóa nút gửi
function fixedSendButton() {
	var sendButton = document.getElementById('send');
	sendButton.disabled = true;
}

// Hàm để mở khóa nút gửi
function unlockSendButton() {
	var sendButton = document.getElementById('send');
	sendButton.disabled = false;
}

// Hàm tắt bàn phím
function turnOffKeyboard() {
	var input = document.getElementById('messageInput');
	input.blur();
}

/**
 * Hàm kiểm tra loại file dựa trên URL
 * @param {string} url - URL của tài liệu
 * @returns {string} - 'image' nếu là ảnh, 'document' nếu là tài liệu
 */
function checkFileType(url) {
	// Lấy phần mở rộng của file từ URL
	var extension = url.split('.').pop().toLowerCase();

	// Danh sách các phần mở rộng của ảnh
	var imageExtensions = ['jpg', 'jpeg', 'png', 'heif', 'heic', 'webp'];
	var documentExtensions = [
		'pdf',
		'html',
		'txt',
		'js',
		'py',
		'css',
		'md',
		'csv',
		'xml',
		'rtf',
	];

	// Kiểm tra nếu phần mở rộng nằm trong danh sách các phần mở rộng của ảnh
	if (imageExtensions.includes(extension)) {
		return 'image';
	} else if (documentExtensions.includes(extension)) {
		return 'document';
	}
	return 'other';
}
