<template>
  <transition name="fade">
    <div v-if="show" class="dialog-overlay">
      <div class="dialog-box">
        <span class="success-icon">
          <svg viewBox="0 0 44 44" class="svg-tick">
            <circle class="tick-circle" cx="22" cy="22" r="20" fill="none"/>
            <polyline class="tick-check" points="13,23 20,30 32,16" fill="none"/>
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
  position: fixed; top:0; left:0; width:100vw; height:100vh;
  background: rgba(0,0,0,0.23); display: flex; align-items: center; justify-content: center; z-index: 100000;
}
.dialog-box {
  background: #fff; color: #222; border-radius: 16px; box-shadow: 0 8px 36px rgba(30,0,0,0.18);
  padding: 38px 42px 28px 42px; min-width: 290px; display: flex; flex-direction: column; align-items: center;
  animation: pop .23s;
}
.success-icon {
  font-size: 2.5em; color: #23c95c; margin-bottom: 13px;
}
.svg-tick { width: 42px; height: 42px; display: block;}
.tick-circle {
  stroke: #37cc74; stroke-width: 3.3; stroke-dasharray: 126; stroke-dashoffset: 126;
  animation: circle-ani .48s cubic-bezier(.7,0,0,1) forwards;
}
.tick-check {
  stroke: #1cc154; stroke-width: 3; stroke-linecap: round; stroke-linejoin: round;
  stroke-dasharray: 24; stroke-dashoffset: 24; animation: check-ani .32s .33s cubic-bezier(.7,0,0,1) forwards;
}
@keyframes circle-ani { to { stroke-dashoffset: 0; } }
@keyframes check-ani { to { stroke-dashoffset: 0; } }
.dialog-message {
  font-size: 1.18em; margin: 16px 0 16px 0; text-align: center; font-weight: 500;
}
.dialog-btn {
  background: #23c95c; color: #fff; border: none; border-radius: 7px;
  padding: 9px 27px; font-size: 1.07em; cursor: pointer; font-weight: 600;
  box-shadow: 0 2px 12px rgba(44,220,110,0.14); transition: background .15s;
}
.dialog-btn:hover { background: #17ad4b; }
.fade-enter-active, .fade-leave-active { transition: opacity .21s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
@keyframes pop { 0% { transform: scale(0.93);} 100% { transform: scale(1);} }
</style>
