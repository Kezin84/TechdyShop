<template>
  <transition name="slide-fade">
    <div v-if="show" class="toast-success">
      <span class="icon-tick">
        <svg viewBox="0 0 44 44" class="svg-tick">
          <circle class="tick-circle" cx="22" cy="22" r="20" fill="none"/>
          <polyline class="tick-check" points="13,23 20,30 32,16" fill="none"/>
        </svg>
      </span>
      <span class="msg">{{ message }}</span>
      <button class="close-btn" @click="show = false">&times;</button>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, defineExpose } from 'vue'
const props = defineProps({ message: String })
const show = ref(false)

function open() {
  show.value = true
  setTimeout(() => { show.value = false }, 2200)
}
function close() {
  show.value = false
}
defineExpose({ open, close })
watch(() => props.message, () => { open() })
</script>

<style scoped>
.toast-success {
  position: fixed;
  top: 32px;
  right: 32px;
  background: #fff;
  color: #333;
  border-radius: 16px;
  box-shadow: 0 6px 32px rgba(38,220,120,0.18);
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 26px 48px 26px 30px;    /* tăng padding */
  font-size: 1.35em;               /* tăng cỡ chữ */
  z-index: 999999;
  animation: pop .18s cubic-bezier(.7,.3,.4,1.5);
  border: 2.5px solid #38d27a;
  min-width: 310px;                /* tăng min-width */
  max-width: 600px;                /* nếu muốn, không thì bỏ */
}

.icon-tick {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
}
.svg-tick {
  width: 52px;      /* tăng width */
  height: 52px;
  display: block;
}
.tick-circle {
  stroke: #37cc74;
  stroke-width: 4.2;
  stroke-dasharray: 126;
  stroke-dashoffset: 126;
  animation: circle-ani .5s cubic-bezier(.7,0,0,1) forwards;
}
.tick-check {
  stroke: #1cc154;
  stroke-width: 4;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-dasharray: 24;
  stroke-dashoffset: 24;
  animation: check-ani .35s .34s cubic-bezier(.7,0,0,1) forwards;
}
@keyframes circle-ani {
  to { stroke-dashoffset: 0; }
}
@keyframes check-ani {
  to { stroke-dashoffset: 0; }
}
.msg {
  font-weight: 600;
  font-size: 1.25em;
  letter-spacing: 0.12px;
  margin-left: 5px;
}

.close-btn {
  background: none;
  border: none;
  color: #38d27a;
  font-size: 1.7em;           /* to hơn */
  cursor: pointer;
  margin-left: 22px;
  opacity: 0.5;
  transition: opacity .14s;
}
.close-btn:hover { opacity: 1; }
.slide-fade-enter-active, .slide-fade-leave-active {
  transition: all 0.25s cubic-bezier(.5,1.7,.8,1.1);
}
.slide-fade-enter-from, .slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-25px);
}
@keyframes pop {
  0% { transform: scale(0.92);}
  100% { transform: scale(1);}
}
</style>
