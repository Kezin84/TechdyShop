<template>
   <transition name="fade-slide-in" appear>
  <div class="currency-exchange-container">
    <h2 class="title">🌏 Đổi Ngoại Tệ</h2>
    <div class="exchange-form-row">
      <!-- FROM -->
      <div class="input-block">
        <label>💵 Từ</label>
        <select v-model="fromCurrency" @change="autoExchange">
          <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.name }}</option>
        </select>
        <input
          type="text"
          v-model="fromAmountInput"
          placeholder="Số tiền"
          @input="onInputFromAmount"
          @focus="fromActive = true"
          @blur="fromActive = false"
        />
      </div>

      <!-- TỈ GIÁ Ở GIỮA -->
      <transition name="fade-scale">
        <div class="exchange-rate-block" key="rate">
          <div class="swap-btn" @click="swapCurrency" title="Đảo chiều">
            <span>⇄</span>
          </div>
          <div class="rate-label">
            1 {{ fromCurrency }} =
            <input
              type="number"
              step="0.0001"
              min="0"
              v-model.number="exchangeRate"
              @input="autoExchange"
              class="rate-input"
              @focus="rateActive = true"
              @blur="rateActive = false"
            />
            {{ toCurrency }}
          </div>
        </div>
      </transition>

      <!-- TO -->
      <div class="input-block">
        <label>💸 Sang</label>
        <select v-model="toCurrency" @change="autoExchange">
          <option v-for="c in currencies" :key="c.code" :value="c.code">{{ c.name }}</option>
        </select>
        <input
          type="text"
          :class="{ highlight: showResultHighlight }"
          :value="formatNumber(toAmount)"
          placeholder="Kết quả"
          readonly
        />
      </div>
    </div>

    <div class="actions">
      <button @click="exchange" class="btn-primary">Đổi Tiền</button>
    </div>

    <div class="rate-note">
      <small>
        <b>Lưu ý:</b> Tỉ giá chỉ là ví dụ. Bạn có thể chỉnh tỉ giá ở giữa.<br />
       
      </small>
    </div>
  </div>
  </transition>
</template>

<script setup>
import { ref, watch } from 'vue'

const currencies = [
  { code: 'VND', name: '🇻🇳 Việt Nam' },
  { code: 'KHR', name: '🇰🇭 Campuchia' },
  { code: 'LAK', name: '🇱🇦 Lào' },
  { code: 'THB', name: '🇹🇭 Thái Lan' },
  { code: 'LKR', name: '🇱🇰 Sri Lanka' },
  { code: 'AMD', name: '🇦🇲 Armenia' },
  { code: 'PHP', name: '🇵🇭 Philippines' },
  { code: 'USD', name: '🇺🇸 USD' },
]

const baseRates = {
  VND: 1,
  USD: 25000,
  KHR: 6.1,
  LAK: 1.2,
  THB: 710,
  LKR: 82,
  AMD: 6.5,
  PHP: 440,
}

const fromCurrency = ref('USD')
const toCurrency = ref('VND')
const fromAmount = ref(100)
const fromAmountInput = ref(formatNumber(100))
const toAmount = ref(0)
const exchangeRate = ref(getRate(fromCurrency.value, toCurrency.value))
const showResultHighlight = ref(false)
const fromActive = ref(false)
const rateActive = ref(false)

function getRate(from, to) {
  if (!baseRates[from] || !baseRates[to]) return 1
  return +(baseRates[from] / baseRates[to]).toFixed(6)
}

function autoExchange() {
  exchange()
}

watch([fromCurrency, toCurrency], ([f, t]) => {
  exchangeRate.value = getRate(f, t)
  autoExchange()
})

function onInputFromAmount(e) {
  let val = e.target.value.replace(/,/g, '')
  if (val === '' || isNaN(Number(val))) {
    fromAmount.value = 0
    fromAmountInput.value = ''
    toAmount.value = 0
  } else {
    fromAmount.value = Number(val)
    fromAmountInput.value = formatNumber(val)
    autoExchange()
  }
}

function swapCurrency() {
  const temp = fromCurrency.value
  fromCurrency.value = toCurrency.value
  toCurrency.value = temp
  highlightResult()
}

function exchange() {
  if (!fromAmount.value || !exchangeRate.value) {
    toAmount.value = 0
    highlightResult()
    return
  }
  toAmount.value = +(fromAmount.value * exchangeRate.value).toFixed(2)
  highlightResult()
}

function highlightResult() {
  showResultHighlight.value = false
  setTimeout(() => {
    showResultHighlight.value = true
    setTimeout(() => (showResultHighlight.value = false), 400)
  }, 10)
}

function formatNumber(val) {
  if (val == null || val === '') return ''
  const n = Number(val)
  if (isNaN(n)) return ''
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 })
}

watch(fromAmount, (val) => {
  fromAmountInput.value = formatNumber(val)
})
</script>

<style scoped>
.currency-exchange-container {
  max-width: 760px;
  min-width: 350px;
  margin: 60px auto;
  background: linear-gradient(115deg, #fff6f6 0%, #ffeaea 100%);
  border-radius: 28px;
  box-shadow: 0 6px 32px 0 #e5b7b730;
  padding: 48px 36px 32px 36px;
  transition: box-shadow 0.3s;
}
.currency-exchange-container:hover {
  box-shadow: 0 10px 50px #b0040440;
}
.title {
  text-align: center;
  margin-bottom: 36px;
  font-weight: 800;
  color: rgb(176, 4, 4);
  font-size: 2.4rem;
  letter-spacing: 1.2px;
  text-shadow: 0 1px 0 #fff, 0 2px 12px #f3adad55;
}
.exchange-form-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 38px;
  margin-bottom: 0;
  width: 100%;
}
.input-block {
  flex: 1 1 0;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-width: 320px;
}
.input-block label {
  font-weight: 700;
  color: rgb(176, 4, 4);
  margin-bottom: 4px;
  letter-spacing: 0.5px;
  font-size: 1.15rem;
}
.input-block select,
.input-block input {
  padding: 15px 14px;
  border: 1.5px solid #f7b3b3;
  border-radius: 13px;
  font-size: 1.17rem;
  background: #fff9f9;
  margin-bottom: 3px;
  transition: border-color 0.22s, box-shadow 0.22s;
  width: 100%;
  min-width: 0;
  max-width: 100%;
  font-weight: 500;
  min-height: 46px;
  box-sizing: border-box;
}
.input-block input[readonly] {
  background: #fff0f0;
  color: #b00404;
  font-weight: 700;
  border: 1.4px solid #eab0b0;
  width: 100%;
  min-width: 0;
  max-width: 100%;
}
.input-block input.highlight {
  animation: highlightResult 0.45s;
  background: linear-gradient(90deg,#ffe4e1 0%,#ffeaea 80%);
  color: #b00404;
}
@keyframes highlightResult {
  0% { background: #fff4c7; }
  40% { background: #fff6ee; }
  100% { background: #fff0f0; }
}
.exchange-rate-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
  gap: 12px;
  justify-content: center;
  margin: 0 8px;
}
.swap-btn {
  cursor: pointer;
  padding: 11px 19px 8px 19px;
  border-radius: 50px;
  background: linear-gradient(110deg, rgb(176, 4, 4) 60%, #ffb4a2 100%);
  color: #fff;
  font-size: 2.05rem;
  margin-bottom: 7px;
  transition: background 0.19s, box-shadow 0.19s, transform 0.18s;
  border: none;
  box-shadow: 0 2px 12px #b0040424;
  border: 2px solid #ffebe8;
}
.swap-btn:hover {
  background: linear-gradient(100deg, #900202 50%, #ffb4a2 100%);
  transform: scale(1.11) rotate(-10deg);
  box-shadow: 0 4px 22px #ffb4a22c;
}
.rate-label {
  font-size: 1.12rem;
  color: #a61e1e;
  text-align: center;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 5px;
}
.rate-input {
  width: 120px;
  text-align: right;
  padding: 6px 12px;
  margin: 0 4px;
  border-radius: 9px;
  border: 1.4px solid #f8b6b6;
  font-size: 1.12em;
  background: #fff5f5;
  transition: border-color 0.22s, box-shadow 0.22s;
  font-weight: 600;
}
.rate-input:focus {
  border-color: rgb(176, 4, 4);
  outline: none;
  box-shadow: 0 2px 12px #b004041e;
}
.actions {
  display: flex;
  justify-content: center;
  margin: 32px 0 6px 0;
}
.btn-primary {
  background: linear-gradient(90deg, rgb(176, 4, 4) 10%, #b93a33 100%);
  color: #fff;
  border: none;
  border-radius: 13px;
  padding: 16px 62px;
  font-weight: 800;
  font-size: 1.3rem;
  cursor: pointer;
  transition: background 0.19s, box-shadow 0.18s, transform 0.18s;
  box-shadow: 0 3.5px 18px #b0040442;
  letter-spacing: 1.5px;
}
.btn-primary:hover {
  background: linear-gradient(100deg, #8d1414 40%, #b00404 100%);
  transform: scale(1.04) translateY(-2px);
}
.rate-note {
  margin-top: 17px;
  text-align: left;
  font-size: 1.04em;
  color: #b00404;
  letter-spacing: 0.1px;
}
@media (max-width: 1100px) {
  .currency-exchange-container {
    max-width: 97vw;
    padding: 18px 1vw 10px 1vw;
    min-width: 0;
  }
  .exchange-form-row {
    flex-direction: column;
    gap: 17px;
  }
  .input-block, .exchange-rate-block {
    max-width: 100%;
    min-width: 0;
    width: 100%;
  }
  .rate-label {
    justify-content: center;
  }
  .btn-primary {
    padding: 12px 2vw;
    font-size: 1.08rem;
  }
}
.fade-slide-in-enter-active,
.fade-slide-in-leave-active,
.fade-slide-in-appear-active {
  transition: opacity 0.58s cubic-bezier(.32,1.17,.39,1), transform 0.58s cubic-bezier(.32,1.17,.39,1);
}
.fade-slide-in-enter-from,
.fade-slide-in-appear-from {
  opacity: 0;
  transform: translateY(45px) scale(0.98);
}
.fade-slide-in-enter-to,
.fade-slide-in-appear-to {
  opacity: 1;
  transform: none;
}
.fade-slide-in-leave-from {
  opacity: 1;
  transform: none;
}
.fade-slide-in-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.98);
}

</style>
