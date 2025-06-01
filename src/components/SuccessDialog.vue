<template>
  <transition name="fade">
    <div v-if="show" class="dialog-overlay">
      <div class="dialog-box animate-pop">
        <span class="success-icon">
  <svg width="110" height="110" viewBox="0 0 110 110">
    <circle cx="55" cy="55" r="48" fill="#23c95c" />
    <polyline points="33,60 50,77 77,39" fill="none" stroke="#fff" stroke-width="9" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</span>

        <div class="dialog-message">{{ message }}</div>
        <button class="dialog-btn" @click="handleOk">OK</button>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, defineExpose, defineEmits } from 'vue'
const props = defineProps({ message: String })
const emit = defineEmits(['ok'])

const show = ref(false)
function open() { show.value = true }
function handleOk() {
  show.value = false
  emit('ok')
}
defineExpose({ open })
</script>

<style scoped>
.dialog-overlay {
  position: fixed;
  top:0; left:0; width:100vw; height:100vh;
  background: rgba(30,40,60,0.15);
  display: flex; align-items: center; justify-content: center; z-index: 99999;
  animation: fade-in-bg .18s;
}

.dialog-box {
  background: #fff;
  color: #253240;
  border-radius: 22px;
  box-shadow: 0 12px 56px 0 rgba(40,54,84,0.13), 0 3px 20px 0 rgba(30,41,59,0.10);
  padding: 54px 62px 38px 62px;
  min-width: 360px;
  max-width: 97vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  animation: pop .36s cubic-bezier(.7,1.6,.35,1);
  position: relative;
  gap: 18px;
}

.success-icon {
  font-size: 4.4em;
  margin-bottom: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border-radius: 50%;
}

.svg-tick {
  width: 86px; height: 86px; display: block;
}
.tick-circle-bg {
  stroke: none;
  filter: drop-shadow(0 2px 12px #23c95c55);
}
.tick-check {
  stroke: #fff;
  stroke-width: 5.2;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 44;
  stroke-dashoffset: 44;
  animation: check-ani .38s .19s cubic-bezier(.7,0,0,1) forwards;
}
@keyframes check-ani { to { stroke-dashoffset: 0; } }
@keyframes fade-in-bg { from {background: rgba(30,40,60,0);} to {background: rgba(30,40,60,0.15);} }
@keyframes pop { 0% { transform: scale(0.92);} 70%{transform: scale(1.04);} 100% { transform: scale(1);} }

.dialog-message {
  font-size: 1.42em;
  margin: 22px 0 24px 0;
  text-align: center;
  font-weight: 800;
  color: #232b32;
  line-height: 1.48;
  letter-spacing: .02em;
}

.dialog-btn {
  background: #23c95c;
  color: #fff;
  border: none;
  border-radius: 12px;
  padding: 15px 60px;
  font-size: 1.16em;
  cursor: pointer;
  font-weight: 800;
  box-shadow: 0 2.5px 12px rgba(44,220,110,0.10);
  transition: background .16s, box-shadow .18s, transform .14s;
  outline: none;
  margin-top: 8px;
  letter-spacing: .02em;
}
.dialog-btn:hover {
  background: #149944;
  box-shadow: 0 5px 22px rgba(36,199,92,0.11);
  transform: scale(1.07);
}

.fade-enter-active, .fade-leave-active {
  transition: opacity .23s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

@media (max-width: 600px) {
  .dialog-box {
    padding: 25px 4vw 17px 4vw;
    min-width: 0;
  }
  .svg-tick { width: 54px; height: 54px;}
  .success-icon { font-size: 2.1em; margin-bottom: 10px;}
  .dialog-btn { padding: 10px 28px; font-size: 1em;}
  .dialog-message { font-size: 1.06em; }
}
</style>
