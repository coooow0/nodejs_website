// app.js 파일
let messageSender = '영이'; // 페이지 첫 화면이 '영이' 버튼으로 되어었기 때문에 선언

//버튼이 클릭된 사람의 이름을 가져오는 함수
function getActivePersonName() {
    const activePersonButton = document.querySelector('.active-person');
    return activePersonButton.textContent;
}

// 메시지 보낸 사람을 업데이트하는 함수입니다.
function updateMessageSender(name) {
    messageSender = name; // sender 정보를 전역 변수에 저장

    // 채팅 헤더와 입력창의 텍스트를 업데이트합니다.
    const chatHeader = document.querySelector('.chat-header');
    const chatInput = document.querySelector('.chat-input');
    chatHeader.innerText = `${messageSender} chatting...`;
    chatInput.placeholder = `Type here, ${messageSender}...`;

    // 버튼의 활성화 상태를 업데이트합니다.
    const yonSeletorBtn = document.getElementById('young-selector');
    const minSeletorBtn = document.getElementById('ming-selector');
    if (name === '영이') {
        yonSeletorBtn.classList.add('active-person');
        minSeletorBtn.classList.remove('active-person');
    } else if (name === '밍기') {
        minSeletorBtn.classList.add('active-person');
        yonSeletorBtn.classList.remove('active-person');
    }

    // 입력창에 포커스를 줍니다.
    chatInput.focus();
}

// 영이 버튼 클릭 시 messageSender를 '영이'로 업데이트합니다.
document.getElementById('young-selector').addEventListener('click', function () {
    updateMessageSender('영이');
});

// 밍기 버튼 클릭 시 messageSender를 '밍기'로 업데이트합니다.
document.getElementById('ming-selector').addEventListener('click', function () {
    updateMessageSender('밍기');
});



document.querySelector('.chat-input-form').addEventListener('submit', function (event) {
    event.preventDefault(); // 기본 제출 행동 방지

    // 메시지 입력값 가져오기
    const messageInput = document.querySelector('.chat-input');
    const messageText = messageInput.value.trim();
    const timestamp = new Date().toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });

    if (messageText !== '') {
        // 클라이언트에서 서버로 메시지 및 타임스탬프 전송
        fetch('/chatting', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sender: messageSender, text: messageText, timestamp: timestamp }),
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('서버 응답 오류');
            }
            return response.json();
        })
        .then(data => {
            console.log('메시지가 성공적으로 전송되었습니다:', data);
            // 성공적으로 전송된 경우 실행할 코드
        })
        .catch(error => {
            console.error('메시지 전송 중 오류 발생:', error);
            // 오류 발생 시 실행할 코드
        });

        // 클라이언트 측에서 메시지를 화면에 표시하는 코드 작성
        const chatMessages = document.querySelector('.chat-messages');
        // 새로운 메시지 엘리먼트 생성...
    }
});


const clearChatBtn = document.querySelector('.clear-chat-button');
clearChatBtn.addEventListener('click', () => {
    // 채팅 메시지들을 모두 삭제
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.innerHTML = '';
});

// 메시지를 전송했을 때 바로 화면에 띄움
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

window.addEventListener('DOMContentLoaded', (event) => {
    // 페이지가 로드되면 실행될 코드
    scrollToBottom(); // 페이지 로드 후 스크롤 하단으로 이동
});

function scrollToBottom() {
    const chatMessages = document.querySelector('.chat-messages');
    chatMessages.scrollTop = chatMessages.scrollHeight;
}
