var globalText = '';
var global_InforImage = '';
var global_InforDocument = '';

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
			console.log('Done! Here is the image info: ', result.info);
			previewImage(result);
			//   document
			//     .getElementById("uploadedimage")
			//     .setAttribute("src", result.info.secure_url);
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

function sendMessage() {
	var input = document.getElementById('messageInput');
	var chatBox = document.getElementById('chatBox');
	var messageElement = document.createElement('div');
	messageElement.classList.add('message', 'sent');

	var imageInput = document.getElementById('filePreview');

	globalText = input.value.trim();

	console.log('global', globalText, global_InforImage, global_InforDocument);

	if (global_InforImage !== '') {
		var messageText = document.createElement('div');
		messageText.textContent = globalText;
		messageElement.appendChild(messageText);

		var img = document.createElement('img');
		img.src = global_InforImage.secure_url;
		img.classList.add('sentImage');
		img.style.maxHeight = '400px';
		messageElement.appendChild(img);

		appendTimestamp(messageElement);
		chatBox.appendChild(messageElement);

		const formData = new FormData();
		formData.append('text', globalText);
		formData.append('image', global_InforImage.secure_url);
		fetchAPIGetTextAndImage(formData);
		console.log('Vao anhr');
	} else if (global_InforDocument !== '') {
		var messageText = document.createElement('div');
		messageText.textContent = globalText;
		messageElement.appendChild(messageText);

		var doc = document.createElement('a');
		doc.href = global_InforDocument.secure_url;
		doc.textContent =
			global_InforDocument.original_filename +
			'.' +
			global_InforDocument.format;
		doc.classList.add('sentDocument');
		messageElement.appendChild(doc);
		appendTimestamp(messageElement);
		chatBox.appendChild(messageElement);

		const formData = new FormData();
		formData.append('text', globalText);
		formData.append('document', global_InforDocument.secure_url);
		fetchAPIGetTextAndDocument(formData);

		console.log('Vao document');
	} else if (
		globalText !== '' &&
		global_InforImage === '' &&
		global_InforDocument === ''
	) {
		console.log('Vao texxt');

		var messageText = document.createElement('div');
		messageText.textContent = globalText;
		messageElement.appendChild(messageText);

		appendTimestamp(messageElement);
		chatBox.appendChild(messageElement);

		fetchAPIGetText(globalText);
	} else {
		alert('Please enter a message or select a file!');
	}

	clearReviewFile();
	clearGlobalLink();
	scrollToBottom();
}
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
			if (data.response !== undefined) {
				initializeSSE(data.response);
			}
		})
		.catch((error) => {
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
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.response !== undefined) {
				initializeSSE(data.response);
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

function fetchAPIGetTextAndDocument(formData) {
	// Send the message and document to the server API
	fetch('/api/textAndDocument', {
		method: 'POST',
		body: formData,
	})
		.then((response) => response.json())
		.then((data) => {
			if (data.response !== undefined) {
				initializeSSE(data.response);
			}
		})
		.catch((error) => {
			console.error('Error:', error);
		});
}

// Function to initialize the SSE connection
function initializeSSE(responseText) {
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

	eventSource.onmessage = function (event) {
		const data = JSON.parse(event.data);
		if (data.type === 'text') {
			messageText.textContent += data.content;
			scrollToBottom();
			// receiveMessage(data.content);
		} else if (data.type === 'end') {
			eventSource.close();
			return;
		}
	};

	eventSource.onerror = function (error) {
		eventSource.close();
		console.error('EventSource failed:', error);
		return;
	};
}

// Function to receive and display messages
function receiveMessage(message) {
	scrollToBottom();
}

// Function to preview image or document based on Cloudinary upload result
function previewImage(result) {
	var format = result.info.format.toLowerCase();
	var inputBox = document.querySelector('.inputBox');
	var existingPreview = document.getElementById('filePreview');
	if (existingPreview) {
		inputBox.removeChild(existingPreview);
	}

	var preview;
	if (checkFileType(format) === 'image') {
		// File is an image
		preview = document.createElement('img');
		preview.src = result.info.secure_url;

		// set global link image
		global_InforImage = result.info;

		preview.style.maxWidth = '70px';
		preview.style.maxHeight = '70px';
	} else if (checkFileType(format) === 'document') {
		// File is a document
		preview = document.createElement('div');
		preview.textContent =
			result.info.original_filename + '.' + result.info.format;

		global_InforDocument = result.info;
	} else {
		alert('Không hỗ trợ file này!');
		return;
	}

	preview.id = 'filePreview';
	preview.style.marginRight = '10px';
	inputBox.appendChild(preview);
	inputBox.insertBefore(preview, inputBox.firstChild);
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

function clearReviewFile() {
	var inputBox = document.querySelector('.inputBox');
	var existingPreview = document.getElementById('filePreview');
	if (existingPreview) {
		inputBox.removeChild(existingPreview);
	}
}

function clearGlobalLink() {
	globalText = '';
	global_InforImage = '';
	global_InforDocument = '';
	var input = document.getElementById('messageInput');
	input.value = '';
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
		'docx',
		'xls',
		'xlsx',
		'ppt',
		'pptx',
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
