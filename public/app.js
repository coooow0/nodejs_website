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

document.querySelector('.chat-input-form').addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent default form submission

    // Get message input value
    const messageInput = document.querySelector('.chat-input');
    const messageText = messageInput.value.trim();

    if (messageText !== '') {
        const chatMessages = document.querySelector('.chat-messages');

        // Create new message element
        const newMessage = document.createElement('div');
        newMessage.classList.add('message');

        // Determine message style based on active person
        if (document.querySelector('.active-person').id === 'young-selector') {
            newMessage.classList.add('blue-bg');
        } else {
            newMessage.classList.add('gray-bg');
        }

        // Create message sender element
        const senderElement = document.createElement('div');
        senderElement.classList.add('message-sender');
        senderElement.textContent = document.querySelector('.active-person').innerText;

        // Create message text element
        const textElement = document.createElement('div');
        textElement.classList.add('message-text');
        textElement.textContent = messageText;

        // Append sender and text elements to new message element
        newMessage.appendChild(senderElement);
        newMessage.appendChild(textElement);

        // Append new message element to chat messages container
        chatMessages.appendChild(newMessage);

        // Clear message input
        messageInput.value = '';
    }
});
// 채팅 지우기 버튼에 대한 이벤트 핸들러 추가
const clearChatBtn = document.querySelector('.clear-chat-button');
clearChatBtn.addEventListener('click', () => {
    // 채팅 메시지들을 모두 삭제합니다.
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML = '';
});
function sendMessage(e) {
    e.preventDefault();

    const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
    const message = {
        sender: messageSender,
        text: chatInput.value,
        timestamp,
    };

    messages.push(message);
    localStorage.setItem('messages', JSON.stringify(messages));

    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML += `<div class="message">
                                    <div class="message-sender">${message.sender}</div>
                                    <div class="message-text">${message.text}</div>
                                    <div class="message-timestamp">${message.timestamp}</div>
                                </div>`;

    chatInputForm.reset();
    chatMessages.scrollTop = chatMessages.scrollHeight;
}