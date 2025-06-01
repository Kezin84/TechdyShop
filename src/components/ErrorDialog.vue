<template>
  <transition name="fade">
    <div v-if="show" class="dialog-overlay">
      <div class="dialog-box">
        <span class="error-icon">
          <svg viewBox="0 0 44 44" class="svg-x">
            <circle class="x-circle" cx="22" cy="22" r="20" fill="none"/>
            <polyline class="x-left" points="15,15 29,29" fill="none"/>
            <polyline class="x-right" points="29,15 15,29" fill="none"/>
          </svg>
        </span>
        <div class="dialog-message">{{ message }}</div>
        <button class="dialog-btn error" @click="handleOk">OK</button>
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
function closeDialog() {
  show.value = false
}
defineExpose({ open })



</script>

<style scoped>
.dialog-overlay {
  position: fixed; top:0; left:0; width:100vw; height:100vh;
  background: rgba(0,0,0,0.22); display: flex; align-items: center; justify-content: center; z-index: 100000;
}
.dialog-box {
  background: #fff; color: #222; border-radius: 16px; box-shadow: 0 8px 36px rgba(255,0,0,0.15);
  padding: 38px 42px 28px 42px; min-width: 290px; display: flex; flex-direction: column; align-items: center;
  animation: pop .23s;
}
.error-icon {
  font-size: 2.5em; color: #e83e3e; margin-bottom: 13px;
}
.svg-x { width: 42px; height: 42px; display: block;}
.x-circle {
  stroke: #e83e3e; stroke-width: 3.3; stroke-dasharray: 126; stroke-dashoffset: 126;
  animation: circle-ani .46s cubic-bezier(.7,0,0,1) forwards;
}
.x-left, .x-right {
  stroke: #e83e3e; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 20; stroke-dashoffset: 20;
}
.x-left { animation: x-left-ani .28s .35s cubic-bezier(.7,0,0,1) forwards; }
.x-right { animation: x-right-ani .28s .48s cubic-bezier(.7,0,0,1) forwards; }
@keyframes circle-ani { to { stroke-dashoffset: 0; } }
@keyframes x-left-ani { to { stroke-dashoffset: 0; } }
@keyframes x-right-ani { to { stroke-dashoffset: 0; } }
.dialog-message {
  font-size: 1.18em; margin: 16px 0 16px 0; text-align: center; font-weight: 500;
}
.dialog-btn {
  background: #e83e3e; color: #fff; border: none; border-radius: 7px;
  padding: 9px 27px; font-size: 1.07em; cursor: pointer; font-weight: 600;
  box-shadow: 0 2px 12px rgba(220,44,44,0.12); transition: background .15s;
}
.dialog-btn:hover { background: #c91f1f; }
.fade-enter-active, .fade-leave-active { transition: opacity .21s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes pop { 0% { transform: scale(0.93);} 100% { transform: scale(1);} }
</style>
