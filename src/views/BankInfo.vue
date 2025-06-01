<script setup>
import { ref } from 'vue'
import { Copy, Check ,ScanQrCode,QrCode} from 'lucide-vue-next'

const copiedValue = ref(null)
const copyText = async (value, key) => {
  try {
    await navigator.clipboard.writeText(value)
    copiedValue.value = key
    setTimeout(() => copiedValue.value = null, 1200)
  } catch (e) {
    alert('Không thể copy!')
  }
}
</script>

<template>
  <div class="bank-info-bg">
    <div class="bank-info-container">
      <h2 class="bank-info-title">
        
        THÔNG TIN CHUYỂN KHOẢN
       <QrCode size="90" />
      </h2>
      <div class="bank-cards-row">
        <!-- MB BANK -->
        <div class="bank-card mb-bank animate-slidein" style="animation-delay: 0.12s;">
          <img class="bank-qr" src="https://i.ibb.co/5XFbbpM3/mbbank.jpg" alt="QR MB Bank" />
          <div class="bank-label mb-color">MB BANK</div>
          <div class="bank-info-line">
            <span class="bank-key">Số TK:</span>
            <span class="bank-value">0876482642</span>
            <button
              class="copy-btn"
              @click="copyText('0876482642', 'mb')"
              :title="copiedValue === 'mb' ? 'Đã copy!' : 'Copy'"
              style="background: none; border: none; padding: 0 4px; cursor: pointer;"
            >
              <component :is="copiedValue === 'mb' ? Check : Copy" size="19" />
            </button>
          </div>
          <div class="bank-info-line">
            <span class="bank-key">Chủ TK:</span>
            <span class="bank-owner" style="color : rgb(35, 146, 242)">NGUYEN VO DINH ANH</span>
          </div>
        </div>
        <!-- MOMO -->
        <div class="bank-card momo-bank animate-slidein" style="animation-delay: 0.28s;">
          <img class="bank-qr" src="https://i.ibb.co/Pvq4y9d5/momo.jpg" alt="QR MOMO" />
          <div class="bank-label momo-color">MOMO</div>
          <div class="bank-info-line">
            <span class="bank-key">Số ĐT:</span>
            <span class="bank-value">0933511334</span>
            <button
              class="copy-btn"
              @click="copyText('0933511334', 'momo')"
              :title="copiedValue === 'momo' ? 'Đã copy!' : 'Copy'"
              style="background: none; border: none; padding: 0 4px; cursor: pointer;"
            >
              <component :is="copiedValue === 'momo' ? Check : Copy" size="19" />
            </button>
          </div>
          <div class="bank-info-line">
            <span class="bank-key">Chủ TK:</span>
            <span class="bank-owner" style="color : rgb(168, 0, 137)">NGUYEN VO DINH ANH</span>
          </div>
        </div>
        <!-- VISA -->
        <div class="bank-card visa-bank animate-slidein" style="animation-delay: 0.44s;">
          <img class="bank-qr" src="https://i.ibb.co/gMfWtsbS/VISA-3.jpg" alt="QR VISA" />
          <div class="bank-label visa-color">VISA</div>
          <div class="bank-info-line">
            <span class="bank-key">Số thẻ:</span>
            <span class="bank-value">4848 0410 7663 4759</span>
            <button
              class="copy-btn"
              @click="copyText('4848 0410 7663 4759', 'visa')"
              :title="copiedValue === 'visa' ? 'Đã copy!' : 'Copy'"
              style="background: none; border: none; padding: 0 4px; cursor: pointer;"
            >
              <component :is="copiedValue === 'visa' ? Check : Copy" size="19" />
            </button>
          </div>
          <div class="bank-info-line">
            <span class="bank-key">Chủ TK:</span>
            <span class="bank-owner" style="color : rgb(39, 94, 198)">NGUYEN VO DINH ANH</span>
          </div>
        </div>
      </div>
      <div class="bank-warning-box">
        <b>LƯU Ý:</b> TECHDY <b>chỉ có duy nhất</b> các thông tin chuyển khoản trên.<br>
        Khách chuyển sai STK, chúng tôi <b>không chịu trách nhiệm!</b>
      </div>
    </div>
  </div>
</template>


<style scoped>
.copy-btn {
  background: none;
  border: none;
  outline: none;
  margin-left: 2px;
  color: #0087ffb6;
  transition: color 0.15s;
}
.copy-btn:hover {
  color: #ff8b0d;
  transform: scale(1.18);
}

.bank-info-bg {
  min-height: 100vh;
 
  padding: 40px 0 80px 0;
}
.bank-info-container {
   max-width: 1280px;
  margin: 0 auto;
  background: #fff;
  border-radius: 32px;
  box-shadow: 0 8px 42px 0 #44121218, 0 4px 20px 0 #fd880133;
  padding: 36px 28px 32px 28px;
}
.bank-info-title {
  font-size: 2.1em;
  font-weight: 900;
  color: #441212;
  margin-bottom: 32px;
  letter-spacing: 1.1px;
  text-align: center;
  text-transform: uppercase;
}
.bank-cards-row {
  display: flex;
  gap: 36px;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 38px;
}
.bank-card {
  background: #f9f7f5;
  border-radius: 28px;
  box-shadow: 0 2px 14px #44121222;
  padding: 36px 38px 32px 38px;
  min-width: 350px;
  max-width: 390px;
  flex: 1 1 370px;
  display: flex;
  flex-direction: column;
  align-items: center;
  border: 3px solid #eceaea;
  transition: box-shadow 0.18s, border-color 0.18s;
  position: relative;
}

.bank-card .bank-qr {
  width: 185px;
  height: 185px;
  object-fit: contain;
  border-radius: 18px;
  box-shadow: 0 2px 16px #1a2bb04b;
  margin-bottom: 18px;
  background: #fff;
  border: 2.5px solid #f0eded;
}
.bank-label {
  font-weight: 900;
  font-size: 1.45em;
  margin-bottom: 18px;
  letter-spacing: 1.2px;
  text-shadow: 0 1.5px 8px #ccc6;
  text-transform: uppercase;
}

.bank-info-line {
  font-size: 1.22em;
  margin-bottom: 12px;
  display: flex;
  gap: 10px;
  justify-content: flex-start;
  align-items: left;
}
.bank-key {
  color: #441212;
  font-weight: 700;
  min-width: 78px;
  font-size: 1.09em;
}
.bank-value {
  font-weight: 800;
  color: #5b2424;
  font-family: 'Roboto Mono', monospace, Arial;
  font-size: 1.16em;
  letter-spacing: 1.2px;
}
.bank-owner {
  color: #13764b;
  font-weight: 900;
  font-size: 1.16em;
  font-family: inherit;
}

.mb-bank { border-color: #2392f2; background: #eaf4fd; }
.mb-bank .mb-color, .mb-bank .bank-key { color: #2392f2 !important; }
.mb-bank .bank-label { color: #2392f2; }

.momo-bank { border-color: #a80089; background: #fce8fb; }
.momo-bank .momo-color, .momo-bank .bank-key { color: #a80089 !important; }
.momo-bank .bank-label { color: #a80089; }

.visa-bank { border-color: #275ec6; background: #e5eeff; }
.visa-bank .visa-color, .visa-bank .bank-key { color: #275ec6 !important; }
.visa-bank .bank-label { color: #275ec6; }

.bank-warning-box {
  background: #fff5ec;
  color: #d20000;
  border-radius: 18px;
  box-shadow: 0 2px 12px #fd880120;
  padding: 19px 23px 16px 23px;
  margin-top: 18px;
  font-size: 1.14em;
  font-weight: 800;
  letter-spacing: 0.5px;
  border: 2px solid #fd8801;
  text-align: center;
  line-height: 1.5;
}

@media (max-width: 1000px) {
  .bank-cards-row {
    flex-direction: column;
    gap: 24px;
    align-items: center;
  }
}

@media (max-width: 600px) {
  .bank-info-container {
    padding: 6vw 1vw 5vw 1vw;
    border-radius: 16px;
  }
  .bank-card {
    padding: 6vw 2vw 5vw 2vw;
    border-radius: 14px;
    min-width: 90vw;
    max-width: 99vw;
  }
  .bank-card .bank-qr {
    width: 58vw;
    height: 58vw;
    min-width: 120px;
    min-height: 120px;
    max-width: 210px;
    max-height: 210px;
  }
}

@keyframes bankSlideIn {
  0% {
    opacity: 0;
    transform: translateY(64px) scale(0.98);
  }
  100% {
    opacity: 1;
    transform: none;
  }
}
.animate-slidein {
  animation: bankSlideIn 0.75s cubic-bezier(.42,1.74,.41,.85) both;
}

.bank-card {
  transition:
    box-shadow 0.21s cubic-bezier(.47,1.64,.41,1.17),
    border-color 0.18s,
    transform 0.22s cubic-bezier(.73,2.1,.51,1.23);
}

.bank-card:hover {
  transform: scale(1.2);
  box-shadow: 0 10px 36px 8px #fd880155, 0 4px 48px #2392f233, 0 0 0 2px #fd880199;
  z-index: 2;
  border-color: #fd8801;
}

</style>
