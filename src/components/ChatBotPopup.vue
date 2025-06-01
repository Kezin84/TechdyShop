<template>
  <div>
    <!-- Thanh chat bar -->
    <div class="chatbar" @click="openChatbar" v-if="!open">
      <i class="fa-solid fa-comments fa-xl"></i> 
      <span class="chatbar-text">Chat với shop</span>
      <span v-if="newMsgCount > 0" class="badge-chat-noti">{{ newMsgCount }}</span>
    </div>

    <!-- Box chat nổi lên trên thanh bar -->
    <transition name="slide-up">
      <div class="chatbox" v-if="open">
        <div class="chatbox-header d-flex justify-content-between align-items-center">
          <span class="fw-bold">Chat với shop</span>
          <button class="close-btn" @click="closeChatbox">&times;</button>
        </div>
        <div class="chatbox-body">
          <div v-for="(msg, idx) in messages" :key="idx" :class="['msg-row', msg.sender]">
            <div class="bubble" v-html="msg.text"></div>
          </div>
        </div>
        <div class="chatbox-footer">
          <div class="faq-quick mb-2">
            <button
              v-for="(item, i) in faqs"
              :key="i"
              class="faq-btn"
              @click="askFAQ(item)"
            >
              {{ item.question }}
            </button>
          </div>
          <div class="input-group">
            <input
              type="text"
              v-model="userInput"
              @keyup.enter="send"
              placeholder="Nhập câu hỏi..."
              class="form-control"
            />
            <button class="send-btn" @click="send"><i class="fa-solid fa-paper-plane fa-xl"></i></button>
          </div>
        </div>
        <audio ref="popSound" src="https://cdn.pixabay.com/audio/2022/03/15/audio_115b9e6b8e.mp3"></audio>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, nextTick ,onMounted} from 'vue'
import axios from 'axios'
const newMsgCount = ref(0)  // số tin nhắn mới từ shop (hoặc từ bot, hoặc API)
const open = ref(false)
const userInput = ref('')
const messages = ref([
  { sender: 'bot', text: 'Xin chào! Bạn cần shop hỗ trợ gì nè?' }
])
const faqs = [
  { question: "Shop ở đâu", answer: "Shop có ở PHI,CAM,THÁI,LÀO,SRILANKA,VIỆT NAM bạn nhé!" },
  { question: "Mấy giờ mở cửa", answer: "Shop mở cửa 24/24 mỗi ngày!" },
  { question: "Có ship không", answer: "Những đơn gần khu vực của shop thì ship hỏa tốc luôn ạ" },
  { question: "Cách đặt hàng", answer: "Bạn nhấn nút zalo,tele,fb kế bên để nhắn cho shop hoặc có thể đặt hàng trực tiếp trên web ạ!" },
  { question: "Hotline shop", answer: "Hotline: 0933511334 (call/Zalo)" }
]
const popSound = ref(null)
function playPop() {
  if (popSound.value) {
    popSound.value.currentTime = 0;
    popSound.value.play();
  }
}
function send() {
  if (!userInput.value.trim()) return;
  const text = userInput.value;
  messages.value.push({ sender: 'user', text });
  userInput.value = '';
  nextTick(scrollToEnd);
  setTimeout(() => {
    const reply = getReply(text);
    messages.value.push({ sender: 'bot', text: reply });
    // Nếu chatbox đang ĐÓNG thì cộng badge
    if (!open.value) newMsgCount.value++;
    nextTick(() => {
      scrollToEnd();
      playPop();
    });
  }, 420)
}
function askFAQ(item) {
  messages.value.push({ sender: 'user', text: item.question });
  nextTick(scrollToEnd);
  setTimeout(() => {
    messages.value.push({ sender: 'bot', text: item.answer });
    // Nếu chatbox đang ĐÓNG thì cộng badge
    if (!open.value) newMsgCount.value++;
    nextTick(() => {
      scrollToEnd();
      playPop();
    });
  }, 350)
}
function getReply(input) {
  const lower = input.toLowerCase();
  for (let item of faqs) {
    if (lower.includes(item.question.toLowerCase())) {
      return item.answer;
    }
  }
  return `Bạn cần hỗ trợ thêm?<br>
    <a href="https://zalo.me/0933511334" target="_blank" style="color:#ed3737;font-weight:bold">Nhắn Zalo</a> 
    hoặc nhắn tele <a href="https://t.me/SieubachhoaPH8888" style="color:#ed3737;font-weight:bold">@sieubachhoaph8888</a> nhé!`;
}
function scrollToEnd() {
  setTimeout(() => {
    const el = document.querySelector('.chatbox-body')
    if (el) el.scrollTop = el.scrollHeight
  }, 60)
}
function openChatbar() {
  open.value = true
  newMsgCount.value = 0   // Xem rồi thì hết badge
}
function closeChatbox() {
  open.value = false
}
onMounted(() => {
  newMsgCount.value = 1; // test, số sẽ hiện badge ngay
});
</script>

<style scoped>
.chatbar {
  position: fixed;
  right: 95px;
  bottom: 0;
  min-width: 260px;
  max-width: 370px;
  border-radius: 18px 18px 0 0;
  background: linear-gradient(90deg,#039BE5 0%,#21c6ff 100%);
  color: #fff;
  z-index: 940;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  font-weight: bold;
  font-size: 18px;
  padding-left: 28px;
  cursor: pointer;
  box-shadow: 0 6px 32px #039be533;
  letter-spacing: 0.03em;
  transition: background .17s;
  
}
.chatbar:hover {
  background: linear-gradient(90deg,#0277bd 0%,#039BE5 100%);
}
.chatbar-text {
  font-size: 17.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  margin-top: 2px;
}
.badge-chat-noti {
  position: absolute;
  top: -18px;           /* Nằm cao lên trên nút luôn */
  right: 24px;          /* Xa chữ ra, dễ nhìn hơn */
  background: #e72a2a;
  color: #fff;
  font-size: 1.1em;    /* To hơn */
  font-weight: bold;
  padding: 5px 15px;    /* To hơn */
  border-radius: 18px;
  min-width: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px #c8000055;
  border: 2.5px solid #fff;
  z-index: 100;
  animation: popIn 0.19s cubic-bezier(.33,1.9,.56,.84);
  pointer-events: none; /* Không bị click */
}

@keyframes popIn {
  0% { transform: scale(0.3); opacity: 0.1; }
  70% { transform: scale(1.13); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}
.chatbox {
  position: fixed;
  right: 95px;
  bottom: 0;
  width: 350px;
  max-height: 480px;
  background: #fff;
  border-radius: 22px 22px 0 0;
  box-shadow: 0 4px 40px #039be540;
  z-index: 940;
  display: flex;
  flex-direction: column;
  animation: slideup .21s cubic-bezier(.68,1.8,.32,1.1);
}
@keyframes slideup {
  0% { opacity: 0; transform: translateY(60px) scale(.7);}
  100% { opacity: 1; transform: translateY(0) scale(1);}
}
.chatbox-header {
  padding: 13px 22px;
  background: #039BE5;
  color: #fff;
  border-top-left-radius: 22px;
  border-top-right-radius: 22px;
  font-weight: bold;
  font-size: 18px;
  display: flex;
  justify-content: space-between; align-items: center;
}
.close-btn {
  border: none;
  background: #fff;
  color: #039BE5;
  border-radius: 50%;
  font-size: 1.5em;
  width: 36px;
  height: 36px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
  margin-left: 8px;
  transition: background 0.2s, color 0.2s;
}
.close-btn:hover {
  background: #039BE5;
  color: #fff;
}
.chatbox-body {
  flex: 1;
  padding: 15px 12px 11px 12px;
  background: #f7fafd;
  overflow-y: auto;
  font-size: 15px;
  display: flex; flex-direction: column;
}
.msg-row {
  display: flex;
  margin-bottom: 7px;
}
.msg-row.bot { justify-content: flex-start; }
.msg-row.user { justify-content: flex-end; }
.bubble {
  display: inline-block;
  padding: 10px 17px;
  border-radius: 20px;
  max-width: 83%;
  word-break: break-word;
  font-size: 15px;
  box-shadow: 0 2px 9px #039be509;
}
.msg-row.bot .bubble {
  background: #fff;
  color: #333;
  border-bottom-left-radius: 6px;
  border-bottom-right-radius: 18px;
  border-top-right-radius: 18px;
  border-top-left-radius: 18px;
  border: 1.2px solid #b3e5fc;
  text-align: left;
}
.msg-row.user .bubble {
  background: linear-gradient(90deg, #039BE5 0%, #21c6ff 100%);
  color: #fff;
  border-bottom-right-radius: 6px;
  border-bottom-left-radius: 18px;
  border-top-left-radius: 18px;
  border-top-right-radius: 18px;
  text-align: right;
}
.chatbox-footer {
  padding: 14px 18px 14px 18px;
  background: #fff;
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
}
.faq-quick {
  display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px;
}
.faq-btn {
  background: #e3f6fd;
  color: #039BE5;
  border: 1.2px solid #81d4fa;
  border-radius: 11px;
  padding: 5px 14px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.13s, color 0.13s;
}
.faq-btn:hover {
  background: #039BE5;
  color: #fff;
}
.input-group {
  display: flex;
  gap: 7px;
}
.form-control {
  flex: 1;
  border-radius: 10px;
  border: 1.1px solid #039BE5;
  padding: 7px 12px;
  font-size: 15px;
}
.send-btn {
  background: linear-gradient(90deg,#039BE5 0%,#21c6ff 100%);
  color: #fff;
  border: none;
  border-radius: 10px;
  padding: 7px 17px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  transition: filter 0.14s;
}
.send-btn:hover { filter: brightness(1.11);}
.slide-up-enter-active,
.slide-up-leave-active { transition: all 0.24s; }
.slide-up-enter-from,
.slide-up-leave-to { opacity: 0; transform: translateY(20px);}
@media (max-width: 650px) {
  .chatbar, .chatbox {
    right: 58px !important;
    left: 2vw !important;
    min-width: 85vw;
    max-width: 95vw;
  }
}
</style>
