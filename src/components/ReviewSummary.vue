<template>
  <div class="summary-wrap">
    <h5 class="summary-title">
      ⭐ Tóm tắt đánh giá
    </h5>
    <div class="summary-content">
      <div class="summary-stars">
        <span class="avg-rating">{{ avgRating }}/5</span>
        <span class="stars">
          <span v-for="n in 5" :key="n" :style="{ color: n <= Math.round(avgRating) ? '#ffd600' : '#ccc', fontSize: '1.8em' }">★</span>
        </span>
      </div>
      <div class="summary-total mb-2">
        <b>{{ comments.length }}</b> lượt đánh giá
      </div>
      <div class="summary-distribution">
        <div v-for="star in [5,4,3,2,1]" :key="star" class="star-row">
          <span class="star-label">{{ star }}★</span>
          <div class="bar">
            <div class="bar-fill"
              :style="{ width: (countByStar(star) / (comments.length || 1)) * 100 + '%'}"></div>
          </div>
          <span class="star-count">{{ countByStar(star) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['comments', 'avgRating']);
const countByStar = (star) =>
  props.comments.filter(c => Number(c.rating) === star).length;
</script>

<style scoped>
.summary-wrap {
  background: #f8fafd;
  border-radius: 26px;
  border: 2px solid #b3e5fc;
  padding: 34px 32px;
  min-width: 320px;
  box-shadow: 0 8px 36px #b3e5fc33;
}
.summary-title {
  font-size: 1.3em;
  font-weight: 900;
  color: #0277bd;
  margin-bottom: 18px;
  text-align: center;
}
.summary-stars {
  display: flex;
  align-items: center;
  gap: 18px;
  justify-content: center;
  margin-bottom: 10px;
}
.avg-rating {
  font-size: 2.3em;
  color: #0277bd;
  font-weight: bold;
  margin-right: 7px;
}
.stars {
  font-size: 1.5em;
}
.summary-total {
  text-align: center;
  margin-bottom: 10px;
  color: #444;
  font-size: 1.07em;
}
.summary-distribution .star-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 5px;
}
.star-label {
  width: 32px;
  font-weight: 700;
  color: #0277bd;
  text-align: right;
}
.bar {
  flex: 1;
  background: #e3f4fc;
  height: 13px;
  border-radius: 7px;
  overflow: hidden;
  margin: 0 6px;
  min-width: 66px;
}
.bar-fill {
  background: linear-gradient(90deg, #ffd600 50%, #ffd600cc 100%);
  height: 100%;
  border-radius: 7px;
  transition: width .25s;
}
.star-count {
  width: 28px;
  text-align: left;
  font-size: 0.98em;
  color: #333;
}
</style>
