// app.js 파일


function updateMessageSender(name) {
    const messageSender = name;
    const chatHeader = document.querySelector('.chat-header');
    const chatInput = document.querySelector('.chat-input');
    const yonSeletorBtn = document.getElementById('young-selector');
    const minSeletorBtn = document.getElementById('ming-selector');

    chatHeader.innerText = `${messageSender} chatting...`;
    chatInput.placeholder = `Type here, ${messageSender}...`;

    if (name === '영이') {
        yonSeletorBtn.classList.add('active-person');
        minSeletorBtn.classList.remove('active-person');
    }

    if (name === '밍기') {
        minSeletorBtn.classList.add('active-person');
        yonSeletorBtn.classList.remove('active-person');
    }

    chatInput.focus();
}


document.getElementById('young-selector').addEventListener('click', function () {
    updateMessageSender('영이');
});

document.getElementById('ming-selector').addEventListener('click', function () {
    updateMessageSender('밍기');
});

document.querySelector('.chat-input-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get message input value
    const messageInput = document.querySelector('.chat-input');
    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        // 클라이언트 측에서 서버로 메시지를 전송
        fetch('/chatting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: messageText }), // 메시지 내용 전송
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('서버 응답 오류');
                }
                return response.json();
            })
            .then(data => {
                console.log('메시지가 성공적으로 전송되었습니다:', data);
                // 메시지가 성공적으로 전송되었을 때 실행할 코드 작성
            })
            .catch(error => {
                console.error('메시지 전송 중 오류 발생:', error);
                // 오류 발생 시 실행할 코드 작성
            });

        // 클라이언트 측에서 메시지를 화면에 표시하는 코드 작성
        const chatMessages = document.querySelector('.chat-messages');
        // Create new message element...
    }
});

const clearChatBtn = document.querySelector('.clear-chat-button');
clearChatBtn.addEventListener('click', () => {
    // 채팅 메시지들을 모두 삭제합니다.
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML = '';
});


document.querySelector('.chat-input-form').addEventListener('submit', sendMessage);


function sendMessage(e) {
    e.preventDefault();

    const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const message = {
        sender: document.querySelector('.active-person').innerText,
        text: document.querySelector('.chat-input').value,
        timestamp,
    };

    // 로컬스토리지 또는 다른 저장 방법을 사용하여 메시지 저장

    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML += `<div class="message">
                                    <div class="message-sender">${message.sender}</div>
                                    <div class="message-text">${message.text}</div>
                                    <div class="message-timestamp">${message.timestamp}</div>
                                </div>`;

    document.querySelector('.chat-input').value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
