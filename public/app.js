// app.js 파일
let messageSender= '영이'; // 전역 변수로 선언

function updateMessageSender(name) {
    messageSender = name; // sender 정보를 전역 변수에 저장
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
    updateMessageSender('영이'); // 영이 버튼 클릭 시 messageSender에 '영이' 할당
});

document.getElementById('ming-selector').addEventListener('click', function () {
    updateMessageSender('밍기'); // 밍기 버튼 클릭 시 messageSender에 '밍기' 할당
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
            body: JSON.stringify({ sender: messageSender, text: messageText }), // sender와 text 정보를 함께 전송
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
    const senderName = getActivePersonName();
    const messageText = document.querySelector('.chat-input').value;

    // 새로운 메시지 엘리먼트 생성
    const messageElement = document.createElement('div');
    messageElement.classList.add('message');

    // senderName이 '영이'일 때 파란색, 그 외에는 회색 배경색을 가진 message 클래스 추가
    messageElement.classList.add(senderName === '영이' ? 'blue-bg' : 'gray-bg');

    messageElement.innerHTML = `
        <div class="message-sender">${senderName}</div>
        <div class="message-text">${messageText}</div>
        <div class="message-timestamp">${timestamp}</div>
    `;

    // 생성한 메시지를 채팅 메시지들 엘리먼트에 추가
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.appendChild(messageElement);

    // 입력 필드 초기화
    document.querySelector('.chat-input').value = '';

    // 스크롤을 가장 아래로 이동
    chatMessages.scrollTop = chatMessages.scrollHeight;
}


function getActivePersonName() {
    const activePersonButton = document.querySelector('.active-person');
    return activePersonButton.textContent;
}