<template>
  <div class="container py-4 review-vip-outer">
    <!-- FORM ĐĂNG BÀI MỚI -->
     <div class="review-flex-main">
      <!-- DIV 1: FORM ĐĂNG BÀI MỚI -->
      <div class="review-left">
        <div class="review-post-form card mb-4 shadow-lg p-4">
            <h5 class="fw-bold text-gradient-vip mb-3">📝 Đăng bài chia sẻ</h5>
  <input
    v-model="newPostTitle"
    type="text"
    class="form-control mb-2 fw-bold"
    placeholder="Tiêu đề bài viết (ví dụ: Mẹo săn sale hiệu quả)"
    maxlength="100"
  />
  <textarea
    v-model="newPostContent"
    class="form-control mb-2"
    rows="3"
    placeholder="Bạn đang nghĩ gì?"
    maxlength="400"
  ></textarea>
  <label class="form-label mb-0">Ảnh minh họa (tối đa 4):</label>
  <input type="file" multiple accept="image/*" @change="handleImages" class="form-control mb-2" />
  <div class="d-flex gap-2 mt-2">
    <img
      v-for="(img, i) in previewImages"
      :key="i"
      :src="img"
      class="preview-img-vip"
      style="max-width:60px;max-height:60px;"
    />
  </div>
<button class="btn btn-vip-review mt-3 w-100"
        @click="submitPost"
        :disabled="posting">
<span v-if="!posting"><i class="fa-solid fa-paper-plane me-2"></i>ĐĂNG BÀI</span>

  <span v-else class="loading-spinner"></span>
</button>


        </div>
      </div>
      <!-- DIV 2 + 3 BÊN PHẢI -->
      <div class="review-right d-flex flex-column gap-3">
        <!-- DIV 2: BỘ LỌC -->
        <div class="review-filter card shadow-sm p-3 mb-2">
          <label class="fw-bold mb-2">Bộ lọc:</label>
          <select v-model="selectedFilter" class="form-select mb-2" @change="applyFilter">
            <option value="all">Tất cả bài đăng</option>
            <option value="reviews">Bài đánh giá</option>
            <option value="posts">Bài đăng thường</option>
            <option value="latest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
            <option value="most_liked">Nhiều like nhất</option>
            <option value="most_commented">Nhiều cmt nhất</option>
            <option value="most_reviewed_product">Sản phẩm được đánh giá nhiều nhất</option>
            <option value="highest_rated_product">Sản phẩm rate cao nhất</option>
          </select>
        </div>
        <!-- DIV 3: TÌM KIẾM -->
      <div class="review-search card shadow-sm p-3">
  <label class="fw-bold mb-2">Tìm kiếm:</label>
  <div class="search-input-wrap" style="position:relative;">
    <input
      v-model="searchQuery"
      type="text"
      class="form-control"
      placeholder="Nhập tên sản phẩm hoặc từ khóa bài viết"
      @input="onInputSearch"
      @focus="searchFocused = true; onInputSearch()"
      @blur="() => setTimeout(() => searchFocused = false, 160)"
      autocomplete="off"
    />
    <ul
      v-if="showSuggestions && filteredSuggestions.length"
      class="search-suggestion-list"
    >
      <li v-for="(item, i) in filteredSuggestions"
          :key="i"
          class="search-suggestion-item d-flex align-items-center gap-2"
          @mousedown.prevent="selectSuggestion(item.name)">
        <img v-if="item.img" :src="item.img" style="width:30px;height:30px;object-fit:cover;border-radius:7px;margin-right:7px;border:1.2px solid #fcb045;">
        <span>{{ item.name }}</span>
      </li>
    </ul>
  </div>
</div>


      </div>
</div>
   
    <h4 class="fw-bold text-gradient-vip mb-4">🗣️ Bình luận từ cộng đồng</h4>
    <!-- 1. Skeleton loading -->
    <div v-if="loadingComments" class="row g-4 review-grid">
      <div v-for="i in 6" :key="'skeleton-'+i" class="col-md-6 col-lg-4">
        <div class="review-card card h-100 shadow-vip skeleton-review-card">
          <div class="card-body d-flex flex-column">
            <div class="d-flex align-items-center gap-3 mb-2">
              <div class="skeleton skeleton-avatar"></div>
              <div class="flex-grow-1">
                <div class="skeleton skeleton-user mb-2"></div>
                <div class="skeleton skeleton-time"></div>
              </div>
            </div>
            <div class="skeleton skeleton-title mb-2"></div>
            <div class="skeleton skeleton-body mb-2"></div>
            <div class="d-flex gap-2 mb-2">
              <div class="skeleton skeleton-img" v-for="img in 2" :key="img"></div>
            </div>
            <div class="skeleton skeleton-btn mb-1"></div>
            <div class="skeleton skeleton-btn"></div>
          </div>
        </div>
      </div>
    </div>
    <!-- 2. Khi hết loading -->
    <div v-else>
      <div v-if="displayedComments.length > 0" class="row g-4 review-grid">
        <transition-group name="review-fade" tag="div" class="row g-4">
          <div class="col-md-6 col-lg-4" v-for="(cmt, index) in displayedComments" :key="cmt.idPost || index">
            <div class="review-card card h-100 shadow-vip animate__animated animate__fadeInUp">
              <div class="card-body d-flex flex-column">
                <div class="review-user-info d-flex align-items-center gap-3 mb-2">
                  <img
                    :src="cmt.avatar || 'https://i.ibb.co/nDypvGk/user-default.png'"
                    class="avatar-vip"
                  />
                  <div class="user-info-wrap">
                    <span class="fw-bold user-vip user-vip-bg">{{ cmt['TÊN ĐĂNG NHẬP'] }}</span>
                    <span class="review-time">
                   <i class="fa-solid fa-clock" style="color: #005eff;"></i>{{ formatReplyTime(cmt['THỜI GIAN']) }}
                    </span>
                  </div>
                </div>
                <!-- Tiêu đề -->
                <div v-if="getTitle(cmt)" class="fw-bold review-title-vip mb-2">
                  {{ getTitle(cmt) }}
                </div>
                <!-- Nội dung -->
                <p class="review-body-vip mb-2">
                  {{ getBody(cmt) }}
                </p>
                <!-- Ảnh bình luận -->
                <div class="row g-2 mb-2">
                  <template v-for="(img, i) in filteredImages(cmt)" :key="i">
                    <div
                      :class="getColClass(filteredImages(cmt).length, i)"
                      class="review-img-col"
                    >
                      <img
                        :src="img"
                        class="review-img"
                        @click="openImage(img)"
                        title="Click để phóng to"
                      />
                    </div>
                  </template>
                </div>
                <!-- Modal zoom ảnh -->
                <div v-if="showImageModal" class="modal-backdrop-vip" @click.self="showImageModal = false">
                  <img :src="currentImage" class="modal-image-vip" />
                </div>
                <!-- Đã đánh giá (mã sản phẩm + tên) -->
                <div
                  class="text-muted small mb-2"
                  v-if="cmt['ID SẢN PHẨM'] && cmt['ID SẢN PHẨM'].trim() !== '' && Number(cmt['ĐÁNH GIÁ']) > 0"
                >
                  <span
                    class="review-link-prod"
                    @click="goToProduct(cmt['ID SẢN PHẨM'])"
                    title="Xem chi tiết sản phẩm"
                  >
                    ⭐ĐÃ ĐÁNH GIÁ ({{ cmt['ID SẢN PHẨM'] }}{{ getProductName(cmt['ID SẢN PHẨM']) ? ' – ' + getProductName(cmt['ID SẢN PHẨM']) : '' }})
                  </span>
                </div>
                <!-- Ảnh sản phẩm (nếu có) -->
                <div v-if="productsMap[cmt['ID SẢN PHẨM']]" class="review-prod-img-wrap mb-2">
                  <img
                    :src="productsMap[cmt['ID SẢN PHẨM']]"
                    class="review-prod-img"
                    @click="goToProduct(cmt['ID SẢN PHẨM'])"
                    title="Xem sản phẩm"
                  />
                </div>
                <!-- ❤️ Lượt tym - 💬 cmt -->
                <div class="mt-2 d-flex gap-2">
                  <button
                    class="btn btn-sm btn-like-vip"
                    :class="{ active: cmt.liked }"
                    @click="likeComment(getRealIndex(cmt))"
                  >
                    <i class="fa-solid fa-heart fa-xl"></i> {{ cmt['LƯỢT TYM'] || 0 }}
                  </button>
                  <button class="btn btn-sm btn-cmt-vip" disabled>
                    <i class="fa-solid fa-comment fa-xl"></i> {{ cmt['LƯỢT CMT'] || 0 }}
                  </button>
                </div>
                <!-- 💬 Danh sách phản hồi -->
                <div v-if="repliesMap[cmt.idPost]?.length" class="mt-3">
                  <transition-group name="reply-pop" tag="div">
                    <div
                      v-for="(r, idx) in repliesMap[cmt.idPost]"
                      :key="idx"
                      class="reply-card-vip d-flex align-items-center gap-2 mb-2"
                    >
                      <img
                        :src="r.avatar || 'https://i.ibb.co/nDypvGk/user-default.png'"
                        class="avatar-reply-vip"
                      />
                      <div>
                        <span class="user-reply-vip">{{ r.username }}</span>
                        <small class="reply-time-vip">{{ formatReplyTime(r.time) }}</small>
                        <div class="reply-content-vip">{{ r.content }}</div>
                      </div>
                    </div>
                  </transition-group>
                </div>
                <!-- ✏️ Gửi phản hồi -->
                <div class="mt-2 d-flex flex-column align-items-end">
                  <textarea v-model="cmt.replyInput" rows="2" class="form-control form-control-sm mb-2 w-100" placeholder="Viết phản hồi..."></textarea>
                  <button class="btn btn-sm btn-reply-vip"
                          @click="submitReply(cmt)"
                          :disabled="replyPostingMap[cmt.idPost]">
                    <span v-if="!replyPostingMap[cmt.idPost]">
                      <i class="fa-solid fa-paper-plane fa-2xl"></i>
                    </span>
                    <span v-else class="loading-spinner" style="width:18px;height:18px;border-width:2.2px;"></span>
                  </button>
                </div>
                <!-- Phản hồi admin -->
                <div v-if="cmt['REPLY']" class="admin-reply-vip mt-3">
                  <strong class="text-primary">Phản hồi Admin:</strong> {{ cmt['REPLY'] }}
                </div>
              </div>
            </div>
          </div>
        </transition-group>
        <!-- Nút Xem thêm -->
        <div v-if="displayedComments.length < comments.length" class="text-center mt-2 mb-4 w-100">
          <button class="btn btn-outline-warning px-5 py-2 fw-bold"
                  @click="loadMoreComments"
                  style="font-size:1.08em;border-width: 3px; border-radius: 14px; box-shadow: 0 1.5px 10px #fcb0451a;color:blue">
            Xem thêm bài viết
          </button>
        </div>
      </div>
      <div v-else class="text-center text-muted">Chưa có bình luận nào.</div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      newPostTitle: '',
      comments: [],
      displayedComments: [],
      commentsPerPage: 6,
      currentPage: 1,
      productsMap: {},
      productsList: [],
      repliesMap: {},
      newPostContent: '',
      selectedImages: [],
      previewImages: [],
      showImageModal: false,
      currentImage: '',
        selectedFilter: "all",
    searchQuery: "",
      searchFocused: false,
    showSuggestions: false,
    allKeywords: [], // danh sách từ khóa gợi ý
     loadingComments: true,
       likedPosts: JSON.parse(localStorage.getItem('likedPosts') || '[]'),
       posting: false,         // <--- Thêm biến này
    replyPostingMap: {},
    };
  },
  methods: {
    onBlurSearch() {
  setTimeout(() => this.searchFocused = false, 160);
}
,
     onInputSearch() {
    this.showSuggestions = !!this.searchQuery && this.filteredSuggestions.length > 0 && this.searchFocused;
    this.applySearch();
  },
selectSuggestion(itemName) {
  this.searchQuery = itemName;
  this.showSuggestions = false;
  this.applySearch();
},

  // ...methods khác giữ nguyên...

     getFilteredAndSortedComments() {
    let arr = [...this.comments];

    // Filter theo loại bài
    if (this.selectedFilter === "reviews") {
      arr = arr.filter(c => Number(c["ĐÁNH GIÁ"]) > 0);
    }
    if (this.selectedFilter === "posts") {
      arr = arr.filter(c => !c["ĐÁNH GIÁ"] || Number(c["ĐÁNH GIÁ"]) === 0);
    }

    // Sắp xếp
    if (this.selectedFilter === "latest") {
      arr.sort((a, b) => new Date(b["THỜI GIAN"]) - new Date(a["THỜI GIAN"]));
    }
    if (this.selectedFilter === "oldest") {
      arr.sort((a, b) => new Date(a["THỜI GIAN"]) - new Date(b["THỜI GIAN"]));
    }
    if (this.selectedFilter === "most_liked") {
      arr.sort((a, b) => Number(b["LƯỢT TYM"] || 0) - Number(a["LƯỢT TYM"] || 0));
    }
    if (this.selectedFilter === "most_commented") {
      arr.sort((a, b) => Number(b["LƯỢT CMT"] || 0) - Number(a["LƯỢT CMT"] || 0));
    }

    // Lọc sản phẩm được đánh giá nhiều nhất
    if (this.selectedFilter === "most_reviewed_product") {
      // Đếm số lần mỗi sản phẩm được đánh giá
      const count = {};
      arr.forEach(c => {
        if (c["ID SẢN PHẨM"] && Number(c["ĐÁNH GIÁ"]) > 0) {
          count[c["ID SẢN PHẨM"]] = (count[c["ID SẢN PHẨM"]] || 0) + 1;
        }
      });
      // Sắp xếp theo sản phẩm có nhiều đánh giá nhất
      arr.sort((a, b) => {
        const ca = count[a["ID SẢN PHẨM"]] || 0;
        const cb = count[b["ID SẢN PHẨM"]] || 0;
        return cb - ca;
      });
    }
    // Lọc sản phẩm rate cao nhất
    if (this.selectedFilter === "highest_rated_product") {
      // Lấy trung bình rate cho từng sản phẩm
      const rate = {};
      const cnt = {};
      arr.forEach(c => {
        if (c["ID SẢN PHẨM"] && Number(c["ĐÁNH GIÁ"]) > 0) {
          rate[c["ID SẢN PHẨM"]] = (rate[c["ID SẢN PHẨM"]] || 0) + Number(c["ĐÁNH GIÁ"]);
          cnt[c["ID SẢN PHẨM"]] = (cnt[c["ID SẢN PHẨM"]] || 0) + 1;
        }
      });
      // Sắp xếp theo điểm TB
      arr.sort((a, b) => {
        const ra = rate[a["ID SẢN PHẨM"]] / (cnt[a["ID SẢN PHẨM"]] || 1) || 0;
        const rb = rate[b["ID SẢN PHẨM"]] / (cnt[b["ID SẢN PHẨM"]] || 1) || 0;
        return rb - ra;
      });
    }

    // Tìm kiếm (lọc thêm)
  if (this.searchQuery.trim()) {
  const q = this.searchQuery.trim().toLowerCase();
  arr = arr.filter(c =>
    (typeof c["BÌNH LUẬN"] === "string" && c["BÌNH LUẬN"].toLowerCase().includes(q)) ||
    (typeof c["title"] === "string" && c["title"].toLowerCase().includes(q)) ||
    (this.getProductName && typeof this.getProductName(c["ID SẢN PHẨM"]) === "string" && this.getProductName(c["ID SẢN PHẨM"]).toLowerCase().includes(q))
  );
}


    // Phân trang
    return arr.slice(0, this.commentsPerPage * this.currentPage);
  },
  // Gọi khi chọn filter/search
  applyFilter() {
    this.displayedComments = this.getFilteredAndSortedComments();
  },
  applySearch() {
    this.displayedComments = this.getFilteredAndSortedComments();
  },
  loadMoreComments() {
    this.currentPage++;
    this.displayedComments = this.getFilteredAndSortedComments();
  },
  formatReplyTime(dt) {
  if (!dt) return '';
  // Nếu đã là Date object
  let d = typeof dt === "string" ? new Date(dt) : dt;
  if (isNaN(d.getTime())) {
    // Trường hợp time là string vi-VN (ví dụ "29/05/2025, 09:58:00") thì trả luôn
    return dt.length <= 17 ? dt : '';
  }
  const pad = v => String(v).padStart(2, '0');
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
,
    getProductName(id) {
      if (this.productsList && Array.isArray(this.productsList)) {
        const prod = this.productsList.find(p => p.ID === id);
        return prod ? prod["TÊN SẢN PHẨM"] : "";
      }
      return "";
    },
    getTitle(cmt) {
      const val = String(cmt['BÌNH LUẬN'] || '').trim();
      return val.startsWith('✅') ? val.split('\n')[0] : '';
    },
    getBody(cmt) {
      const val = String(cmt['BÌNH LUẬN'] || '').trim();
      return val.startsWith('✅') ? val.split('\n').slice(1).join('\n') : val;
    },
    filteredImages(cmt) {
      return [cmt.IMG1, cmt.IMG2, cmt.IMG3, cmt.IMG4].filter(i => i && i.startsWith("http"));
    },
    getColClass(total, index) {
      if (total === 1) return "col-12";
      if (total === 2) return "col-6";
      if (total === 3) return index < 2 ? "col-6" : "col-12";
      return "col-6";
    },
    openImage(img) {
      this.currentImage = img;
      this.showImageModal = true;
    },
    goToProduct(id) {
      window.open(`/product/${id}`, '_blank');
    },
    handleImages(e) {
      const files = Array.from(e.target.files).slice(0, 4);
      this.selectedImages = files;
      this.previewImages = [];
      files.forEach(file => {
        const reader = new FileReader();
        reader.onload = () => this.previewImages.push(reader.result);
        reader.readAsDataURL(file);
      });
    },
   async submitPost() {
  if (this.posting) return; // Tránh spam submit
  const content = this.newPostContent.trim();
  const title = this.newPostTitle.trim();
  if (!content) return alert("Vui lòng nhập nội dung bài viết.");
  this.posting = true;
  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const username = user.username || "guest";
    const avatar = user.avatar || "https://i.ibb.co/nDypvGk/user-default.png";
    const idPost = Date.now();

    // Upload ảnh lên ImgBB
    const uploadedUrls = [];
    for (const img of this.selectedImages) {
      const form = new FormData();
      form.append("image", img);
      const res = await fetch("https://api.imgbb.com/1/upload?key=b202a4bdc79bf1dc72f6f6ded6b74501", {
        method: "POST",
        body: form,
      });
      const json = await res.json();
      if (json.data && json.data.url) uploadedUrls.push(json.data.url);
    }

    // Thời gian chuẩn format
    const now = new Date();
    const time = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")} ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;

    // Build data
    const formData = new URLSearchParams();
    formData.append("action", "addComment");
    formData.append("idPost", idPost);
    formData.append("username", username);
    formData.append("rating", 0);
    formData.append("comment", content);
    formData.append("productId", "");
    formData.append("time", time);
    formData.append("img1", uploadedUrls[0] || "");
    formData.append("img2", uploadedUrls[1] || "");
    formData.append("img3", uploadedUrls[2] || "");
    formData.append("img4", uploadedUrls[3] || "");
    formData.append("title", title);

    // Gửi lên Google Apps Script
    await fetch("https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec", {
      method: "POST",
      mode: "no-cors",
      body: formData,
    });

    // Thêm ngay vào UI (optimistic update)
    const newComment = {
      "TÊN ĐĂNG NHẬP": username,
      "ĐÁNH GIÁ": 0,
      "BÌNH LUẬN": content,
      "ID SẢN PHẨM": "",
      "THỜI GIAN": time,
      "IMG1": uploadedUrls[0] || "",
      "IMG2": uploadedUrls[1] || "",
      "IMG3": uploadedUrls[2] || "",
      "IMG4": uploadedUrls[3] || "",
      "title": title,
      avatar: avatar,
      replyInput: '',
      rowIndex: 9999,
      idPost: idPost
    };
    this.comments.unshift(newComment);
    this.displayedComments = this.comments.slice(0, this.commentsPerPage * this.currentPage);

    // Reset
    this.newPostTitle = "";
    this.newPostContent = "";
    this.selectedImages = [];
    this.previewImages = [];
    alert("✅ Bài viết đã được gửi!");
  } catch (err) {
    alert("Lỗi khi đăng bài, thử lại hoặc kiểm tra kết nối!");
  } finally {
    this.posting = false;
  }
},
    async fetchRepliesByPostId(idPost) {
      if (!idPost) return;
      const url = `https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getRepliesByPostId&idPost=${idPost}`;
      const res = await fetch(url);
      const data = await res.json();
      this.repliesMap[idPost] = data;
    },
   async fetchComments() {
  this.loadingComments = true;
  try {
    const url = `https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getAllCmtForPublic`;
    const res = await fetch(url);
    const data = await res.json();
    this.comments = data
  .sort((a, b) => new Date(b["THỜI GIAN"]) - new Date(a["THỜI GIAN"]))
  .map((cmt, i) => ({
    ...cmt,
    replyInput: '',
    rowIndex: i + 2,
    idPost: cmt["ID POST"] || "",
    liked: false // <-- THÊM TRẠNG THÁI
  }));
    this.displayedComments = this.comments.slice(0, this.commentsPerPage * this.currentPage);
    await Promise.all(this.comments.map(c => this.fetchRepliesByPostId(c.idPost)));
  } catch (e) {
    console.error(e);
  }
  this.loadingComments = false; // <-- Done loading
}
,
    async fetchProducts() {
      const res = await fetch(`https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getProducts`);
      const products = await res.json();
      this.productsList = products;
      products.forEach(p => {
        this.productsMap[p.ID] = p["ẢNH(URL)"];
      });
    },
    async fetchReplies(commentId) {
      const res = await fetch(`https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec?action=getRepliesByCommentId&commentId=${commentId}`);
      const data = await res.json();
      this.repliesMap[commentId] = data;
    },
    formatDate(dateString) {
      const d = new Date(dateString);
      return d.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
    getRealIndex(cmt) {
      // Dùng để like đúng bài trong mảng comments gốc
      return this.comments.findIndex(x => x.idPost == cmt.idPost);
    },
   async likeComment(index) {
  const idPost = this.comments[index].idPost;
  if (!idPost) return;

  // Kiểm tra: đã like thì không cho like nữa (chỉ cho like 1 lần, nếu muốn)
  if (this.comments[index].liked) return;

  // Set trạng thái Like ngay
  this.comments[index]["LƯỢT TYM"] = Number(this.comments[index]["LƯỢT TYM"] || 0) + 1;
  this.comments[index].liked = true;
  this.displayedComments = this.comments.slice(0, this.commentsPerPage * this.currentPage);

  // Gửi API
  try {
    await fetch(`https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec`, {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams({
        action: "likeComment",
        idPost: idPost
      }),
    });
    // Nếu muốn, lưu trạng thái like vào localStorage ở đây (theo user, theo idPost)
  } catch (e) {
    // Nếu thất bại, revert lại trạng thái
    this.comments[index]["LƯỢT TYM"]--;
    this.comments[index].liked = false;
    alert("Lỗi khi like, thử lại!");
  }
}
,

async submitReply(cmt) {
  if (this.replyPostingMap[cmt.idPost]) return;
  const content = (cmt.replyInput || "").trim();
  if (!content) return;

  // Đánh dấu loading cho reply đang gửi
  this.replyPostingMap = { ...this.replyPostingMap, [cmt.idPost]: true };

  try {
    const user = JSON.parse(localStorage.getItem("user")) || {};
    const username = user.username || "guest";
    const avatar = user.avatar || "https://i.ibb.co/nDypvGk/user-default.png";

    await fetch("https://script.google.com/macros/s/AKfycbx9PtKQU7BwVz6jD3I4j-SjBJP7zQWJi-ORmex0YAxsdYB6ZeMrZPdtvhnfjeflfy7GRw/exec", {
      method: "POST",
      mode: "no-cors",
      body: new URLSearchParams({
        action: "addReplyToComment",
        commentId: cmt.rowIndex,
        idPost: cmt.idPost,
        username,
        avatar,
        content,
      }),
    });

    // Update UI ngay lập tức
    if (!this.repliesMap[cmt.idPost]) this.repliesMap[cmt.idPost] = [];
    this.repliesMap[cmt.idPost].push({
      username,
      avatar,
      content,
      time: new Date().toLocaleString("vi-VN")
    });
    cmt.replyInput = "";
  } catch (err) {
    alert("Gửi phản hồi thất bại, thử lại!");
  } finally {
    this.replyPostingMap = { ...this.replyPostingMap, [cmt.idPost]: false };
  }
},

    loadMoreComments() {
      this.currentPage++;
      this.displayedComments = this.comments.slice(0, this.commentsPerPage * this.currentPage);
    }
  },
  watch: {
  searchQuery() {
    this.showSuggestions = !!this.searchQuery && this.filteredSuggestions.length > 0 && this.searchFocused;
  }
},

  computed: {
filteredSuggestions() {
  if (!this.searchQuery.trim()) return [];
  const q = this.searchQuery.trim().toLowerCase();
  return this.allKeywords.filter(
    item => item.name.toLowerCase().includes(q)
  ).slice(0, 8);
},



},
async mounted() {
  await this.fetchProducts();
  await this.fetchComments();
  // Sau khi có dữ liệu rồi mới fill gợi ý
  const productNames = this.productsList.map(p => p["TÊN SẢN PHẨM"]).filter(name => typeof name === "string" && name.trim());
const postTitles = this.comments.map(c => c.title).filter(title => typeof title === "string" && title.trim());
// Sau khi load productsList:
this.allKeywords = this.productsList
  .filter(p => typeof p["TÊN SẢN PHẨM"] === "string" && p["TÊN SẢN PHẨM"].trim())
  .map(p => ({
    name: p["TÊN SẢN PHẨM"],
    img: p["ẢNH(URL)"] || ""
  }));


  this.displayedComments = this.getFilteredAndSortedComments();
  

},


async fetchComments() {
  // ...lấy data như cũ...
  this.displayedComments = this.getFilteredAndSortedComments();
}
};
</script>

<style scoped>
/* === KHUNG NGOÀI === */
.review-vip-outer {
  background: rgb(200, 212, 226);
  border-radius: 22px;
  min-height: 80vh;
  box-shadow: 0 6px 34px #039be534, 0 1px 2px #0277bd18;
   padding-left: 50px;
  padding-right: 50px;
}
@media (max-width: 991px) {
  .review-vip-outer {
    padding-left: 10px;
    padding-right: 10px;
  }}
/* === GRADIENT TEXT === */
.text-gradient-vip {
  background: linear-gradient(90deg, #0277bd 40%, #039BE5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 900;
  font-size: 1.38rem;
  letter-spacing: 0.01em;
}

/* === CARD BÀI ĐĂNG, BỘ LỌC, TÌM KIẾM === */
.review-post-form,
.review-filter,
.review-search {
  border-radius: 21px;
  background: linear-gradient(120deg, #f7fbff 70%, #e1f5fe 100%);
  box-shadow: 0 8px 40px 0 #0277bd21, 0 2px 12px 0 #039be521;
  border: 2.5px solid #e3f2fd;
  position: relative;
  animation: cardFadeIn 0.68s cubic-bezier(.44,1.11,.52,.94);
  transition: box-shadow 0.23s, border 0.19s, transform 0.18s;
}
.review-post-form:hover,
.review-filter:hover,
.review-search:hover {
  box-shadow: 0 18px 52px #039be555, 0 4px 19px #0277bd29;
  border-color: #039be5;
  transform: scale(1.025) translateY(-2.5px);
}
@keyframes cardFadeIn {
  0%   { opacity: 0; transform: scale(0.93) translateY(24px);}
  80%  { opacity: 1; transform: scale(1.025) translateY(-7px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
.review-post-form { padding: 26px 22px 20px 22px; }
.review-filter { padding: 22px 20px 17px 20px; }
.review-search { padding: 22px 20px 16px 20px; }

/* === HEADER CARD ==== */
.review-post-form h5,
.review-filter label,
.review-search label {
  font-weight: 900;
  font-size: 1.17rem;
  background: linear-gradient(90deg, #0277bd 30%, #039BE5 95%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: 0.01em;
  margin-bottom: 10px;
  text-shadow: 0 1.5px 6px #039be530;
}

/* ==== BỘ LỌC ==== */
.review-filter select {
  border-radius: 12px;
  border: 2.1px solid #039be589;
  box-shadow: 0 2px 10px #039be511;
  font-size: 1.03em;
  font-weight: 700;
  color: #0277bd;
  background: #f7fbff;
  padding: 10px 14px;
  margin-bottom: 0;
  transition: border-color 0.18s, box-shadow 0.18s;
  outline: none;
  cursor: pointer;
  appearance: none;
  background-image:
    url("data:image/svg+xml,%3Csvg viewBox='0 0 20 20' fill='%23039BE5' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M5.25 7.75L10 12.25L14.75 7.75' stroke='%230277bd' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 18px;
}
.review-filter select:focus {
  border-color: #0277bd;
  box-shadow: 0 4px 22px #039be53a, 0 1.5px 5px #0277bd1a;
}
.review-filter option {
  color: #0277bd;
  font-weight: 700;
  background: #f7fbff;
  font-size: 1.01em;
}

/* ==== TÌM KIẾM VIP + KÍNH LÚP ==== */
.search-input-wrap {
  position: relative;
  width: 100%;
}
.review-search input[type="text"] {
  border-radius: 13px;
  border: 2.2px solid #039be589;
  font-size: 1.04em;
  font-weight: 700;
  color: #0277bd;
  background: #f7fbff;
  padding: 11px 46px 11px 17px;
  box-shadow: 0 2.5px 12px #039be50c;
  outline: none;
  width: 100%;
  transition: border-color 0.18s, box-shadow 0.18s;
}
.review-search input[type="text"]:focus {
  border-color: #0277bd;
  box-shadow: 0 4px 18px #039be539, 0 1.5px 8px #0277bd10;
}
/* Icon kính lúp trong input */
.search-input-wrap::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 14px;
  width: 25px; height: 25px;
  background: url("data:image/svg+xml,%3Csvg width='22' height='22' fill='none' stroke='%230277bd' stroke-width='2.2' viewBox='0 0 24 24' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='11' cy='11' r='7'/%3E%3Cpath d='M21 21l-3.6-3.6'/%3E%3C/svg%3E") no-repeat center/22px 22px;
  transform: translateY(-50%);
  opacity: 0.95;
  pointer-events: none;
  filter: drop-shadow(0 0 4px #fff7) drop-shadow(0 2px 6px #0277bd33);
}

/* ==== SUGGESTION GỢI Ý ==== */
.search-suggestion-list {
  position: absolute;
  left: 0; right: 0; top: 100%;
  z-index: 1202;
  margin-top: 6px;
  background: #f7fbff;
  border-radius: 13px;
  border: 1.6px solid #039BE5;
  box-shadow: 0 7px 25px #039be523;
  max-height: 220px;
  overflow: auto;
  padding: 0;
  list-style: none;
  animation: suggestionPop 0.26s cubic-bezier(.55,1.13,.44,.97);
  min-width: 120px;
}
@keyframes suggestionPop {
  0% { opacity: 0; transform: scale(.97) translateY(12px);}
  100% { opacity: 1; transform: scale(1) translateY(0);}
}
.search-suggestion-item {
  background: #f7fbff;
  transition: background 0.14s, color 0.15s, transform 0.11s;
  cursor: pointer;
  padding: 10px 16px 10px 11px;
  display: flex;
  align-items: center;
  gap: 9px;
  font-weight: 700;
  color: #0277bd;
  border-bottom: 1px solid #039BE518;
}
.search-suggestion-item:last-child {
  border-bottom: none;
}
.search-suggestion-item:hover {
  background: linear-gradient(90deg, #e1f5fe 60%, #039be516 100%);
  color: #039BE5;
  transform: scale(1.032);
}
.search-suggestion-item img {
  width: 32px; height: 32px;
  object-fit: cover;
  border-radius: 7px;
  border: 1.4px solid #039BE5;
  background: #e1f5fe;
  box-shadow: 0 1.5px 5px #039BE518;
  margin-right: 6px;
  transition: border 0.13s, box-shadow 0.13s;
}

/* ==== BỐ CỤC ==== */
.review-flex-main {
  display: flex;
  gap: 26px;
  align-items: flex-start;
}
.review-left {
  flex: 1.8;
  min-width: 350px;
}
.review-right {
  flex: 1;
  min-width: 260px;
  max-width: 310px;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

/* ==== NÚT VIP ==== */
.btn-vip-review {
  background: linear-gradient(90deg, #0277bd 40%, #039BE5 100%);
  color: #fff;
  border-radius: 14px;
  font-size: 1.14rem;
  font-weight: 900;
  box-shadow: 0 3px 20px #0277bd39, 0 1.5px 7px #039be533;
  letter-spacing: 0.07em;
  transition: background 0.18s, box-shadow 0.13s, filter 0.13s;
  padding: 10px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 13px;
  border: none;
}
.btn-vip-review:hover {
  background: linear-gradient(90deg, #039BE5 40%, #0277bd 100%);
  filter: brightness(1.07) saturate(1.08);
  box-shadow: 0 6px 24px #0277bd66, 0 3px 9px #039be539;
}

/* === ICON PLUS === */
.plus-circle-vip {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: #e1f5fe;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 7px;
  box-shadow: 0 4px 12px #039BE521, 0 1px 7px #0277bd10;
  animation: plusBounce 1.6s infinite cubic-bezier(.55,1.15,.44,.96);
}
.plus-icon {
  color: #0277bd;
  font-size: 1.7rem;
  font-weight: 900;
  user-select: none;
}
@keyframes plusBounce {
  0%, 100% { transform: scale(1);}
  45% { transform: scale(1.12) rotateZ(-10deg);}
}

/* === REVIEW CARD (COMMENT) === */
.review-card {
  border-radius: 19px;
  background: linear-gradient(120deg, #f7fbff 60%, #e1f5fe 100%);
  box-shadow: 0 8px 36px #039be522;
  border: 2px solid #e3f2fd;
  transition: box-shadow 0.21s, border 0.17s, transform 0.17s;
  min-height: 360px;
  animation: reviewCardPop .47s cubic-bezier(.62,1.15,.44,.96);
}
@keyframes reviewCardPop {
  0% {opacity: 0; transform: scale(.95) translateY(38px);}
  100% {opacity: 1; transform: scale(1) translateY(0);}
}
.review-card:hover {
  box-shadow: 0 18px 44px #039BE533, 0 4px 16px #0277bd29;
  border-color: #039BE5;
  transform: translateY(-7px) scale(1.025) rotateZ(-0.5deg);
}

/* === AVATAR === */
.avatar-vip {
  width: 46px; height: 46px;
  border-radius: 50%;
  border: 2.5px solid #039BE5;
  object-fit: cover;
  background: #e1f5fe;
  box-shadow: 0 3px 10px #039BE519;
}
.user-vip { color: #0277bd; font-weight: bold; font-size: 1.03rem; }
.review-time { color: #039be5; font-size: 0.92em; margin-top: -2px; }

/* === ĐIỂM SAO === */
.rating-stars-vip {
  font-size: 1.16em;
  letter-spacing: 2px;
  background: linear-gradient(90deg,#ffd700 30%, #039BE5 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: 900;
}
.review-title-vip { color: #0277bd; font-size: 1.12rem; letter-spacing: 0.01em; }
.review-body-vip { color: #222; font-size: 1.04rem; line-height: 1.35; opacity: .97; font-weight: 500; }

/* === HÌNH ẢNH BÌNH LUẬN === */
.review-img-col {padding: 3px;}
.review-img {
  width: 100%; height: 100%;
  object-fit: cover;
  border-radius: 7px;
  box-shadow: 0 1.5px 7px #039BE522;
  border: 1.3px solid #b3e5fc;
  cursor: zoom-in;
  transition: transform 0.16s, box-shadow 0.16s;
}
.review-img:hover {
  transform: scale(1.09) rotateZ(-1.5deg);
  box-shadow: 0 8px 24px #039be519;
  border-color: #039BE5;
}

.review-link-prod {
  font-size: 1.07em;
  color: #039BE5;
  font-weight: 700;
  text-decoration: underline;
  cursor: pointer;
  transition: color 0.18s;
}
.review-link-prod:hover {
  color: #0277bd;
  text-shadow: 0 1px 8px #b3e5fc;
}

.review-prod-img-wrap {width: 100%; text-align: center;}
.review-prod-img {
  max-width: 100%; max-height: 115px;
  border-radius: 10px;
  object-fit: contain;
  background: #e1f5fe;
  border: 1.5px solid #039be580;
  box-shadow: 0 1px 9px #039BE521;
  cursor: pointer;
  transition: box-shadow 0.18s, border 0.13s;
}
.review-prod-img:hover {
  border: 2px solid #0277bd;
  box-shadow: 0 4px 16px #039be533;
}

/* ==== BUTTONS LIKE, COMMENT, REPLY ==== */
.btn-like-vip,
.btn-cmt-vip {
  background: #fff;
  border-radius: 9px;
  font-weight: 700;
  transition: background 0.16s, color 0.14s, border 0.15s;
  padding: 5px 16px 5px 14px;
  margin-right: 5px;
  font-size: 1em;
}
.btn-like-vip {
  border: 2.2px solid #0277bd;
  color: #0277bd;
}
.btn-like-vip:hover {
  background: linear-gradient(90deg, #039BE5 60%, #0277bd 100%);
  color: #fff;
  border-color: #039BE5;
}
.btn-cmt-vip {
  border: 2.2px solid #0277bd44;
  color: #039BE5;
}
.btn-cmt-vip:disabled {
  opacity: 0.75;
  cursor: default;
}
.btn-reply-vip {
  background: linear-gradient(90deg, #0277bd 80%, #039BE5 100%);
  color: #fff;
  font-weight: 700;
  border-radius: 8px;
  box-shadow: 0 1px 4px #039BE519;
  padding: 5px 18px;
  border: none;
  font-size: 0.99em;
  transition: background 0.13s, filter 0.12s;
}
.btn-reply-vip:hover {filter: brightness(1.08); background: linear-gradient(90deg, #039BE5 60%, #0277bd 100%);}

/* ==== PHẢN HỒI, AVATAR, ADMIN ==== */
.reply-card-vip {
  background: #e1f5fe;
  border: 1.2px solid #039BE5;
  border-radius: 15px;
  padding: 9px 16px 8px 10px;
  box-shadow: 0 2px 8px #039be510;
  margin-bottom: 7px;
  display: flex;
  align-items: center;
}
.avatar-reply-vip {
  width: 29px; height: 29px; border-radius: 50%; object-fit: cover; border: 1.6px solid #039BE5;
}
.user-reply-vip {
  color: #039BE5;
  font-weight: 700;
  font-size: 1.02em;
  margin-right: 4px;
}
.admin-reply-vip {
  background: #e3f2fd;
  border-left: 6px solid #039BE5;
  border-radius: 9px;
  padding: 8px 15px;
  color: #0277bd;
  font-weight: 600;
  font-size: 1.02em;
  box-shadow: 0 1px 5px #039BE511;
  margin-bottom: 3px;
}

/* Responsive */
@media (max-width: 991px) {
  .review-flex-main { flex-direction: column; }
  .review-right { flex-direction: row; max-width: 100%; min-width: unset; gap: 13px; }
  .review-post-form, .review-filter, .review-search {margin-bottom: 15px;}
  .search-suggestion-item {padding: 9px 8px 9px 8px;}
  .search-input-wrap::after {right: 7px;}
}
.fa-star {
  font-size: 1.5em;
  color: #cfd8dc;   /* Màu xám nhạt cho sao chưa chọn */
  margin-right: 1px;
  transition: color 0.17s;
}
.fa-star.rated {
  color: #ffd600;   /* Màu vàng tươi cho sao đã chọn */
}

.user-vip-bg{
 background: linear-gradient(90deg, #0277bd 0%, #039BE5 100%);
 font-weight: bold;
 color:white;
 border-radius: 25px;
 
 padding:4px;

}

.review-user-info {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-bottom: 6px;
}
.avatar-vip {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  object-fit: cover;
  border: 2.2px solid #03A9F4;
  background: #fff;
  box-shadow: 0 2px 7px #039be522;
}
.user-vip-bg {
  background: linear-gradient(90deg, #0277bd 0%, #039BE5 100%);
  color: #fff;
  font-weight: 800;
  font-size: 1em;
  border-radius: 12px;
  padding: 3px 15px 3px 11px;
  box-shadow: 0 1.5px 5px #039be511;
  letter-spacing: 0.02em;
  display: inline-block;
}
.review-time {
  color: #4a90e2;
  font-size: 0.97em;
  font-weight: 500;
  margin-left: 5px;
  display: flex;
  align-items: center;
  gap: 3px;
  background: #f1fafe;
  border-radius: 8px;
  padding: 2px 9px;
}
.review-time i {
  color: #039be5;
  margin-right: 4px;
  font-size: 1.1em;
}
.user-info-wrap {
  display: flex;
  flex-direction: column;
  align-items: flex-start;  /* Canh sát lề trái */
  gap: 2px;
}

/* Đảm bảo KHÔNG có margin-left trên review-time */
.review-time {
  margin-left: 0 !important;
  padding-left: 0 !important;
  background: #f1fafe;
  border-radius: 8px;
  padding: 2px 9px;
  font-size: 0.97em;
  font-weight: 500;
  color: #4a90e2;
  display: flex;
  align-items: center;
  gap: 3px;
}
.user-vip-bg {
  /* Đảm bảo không có padding-left/padding-right quá lớn */
  padding: 3px 15px 3px 11px;
  margin: 0;
}
.skeleton {
  background: linear-gradient(90deg, #e3f2fd 25%, #f7fbff 50%, #e3f2fd 75%);
  background-size: 200% 100%;
  animation: skeletonLoading 1.2s infinite linear;
  border-radius: 6px;
  opacity: 0.94;
}

@keyframes skeletonLoading {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.skeleton-avatar {
  width: 46px;
  height: 46px;
  border-radius: 50%;
}

.skeleton-user {
  width: 70px;
  height: 17px;
  margin-bottom: 4px;
}

.skeleton-time {
  width: 45px;
  height: 13px;
  border-radius: 7px;
}

.skeleton-title {
  width: 100px;
  height: 18px;
  margin-bottom: 6px;
}

.skeleton-body {
  width: 100%;
  height: 36px;
  margin-bottom: 12px;
}

.skeleton-img {
  width: 42px;
  height: 42px;
  border-radius: 8px;
  margin-right: 8px;
}

.skeleton-btn {
  width: 50%;
  height: 28px;
  border-radius: 12px;
  margin-bottom: 6px;
}

.btn-like-vip.active,
.btn-like-vip:active,
.btn-like-vip:disabled {
  background: linear-gradient(90deg, #0277bd 60%, #039BE5 100%);
  color: #fff !important;
  border-color: #0277bd;
  animation: btnLikePop 0.24s cubic-bezier(.51,1.51,.53,.98);
  box-shadow: 0 6px 22px #039BE533, 0 2px 9px #0277bd11;
}

.btn-like-vip.active i,
.btn-like-vip:active i {
  color: #fff !important;
  text-shadow: 0 2px 9px #039BE555;
}
@keyframes btnLikePop {
  0%   { transform: scale(1.1) rotateZ(-8deg);}
  55%  { transform: scale(1.14) rotateZ(6deg);}
  100% { transform: scale(1) rotateZ(0);}
}

.loading-spinner {
  display: inline-block;
  width: 23px;
  height: 23px;
  border: 3.2px solid #039BE5;
  border-top: 3.2px solid #fff;
  border-radius: 50%;
  animation: spin 0.72s linear infinite;
  margin: 0 auto;
  vertical-align: middle;
}
@keyframes spin {
  0% { transform: rotate(0);}
  100% { transform: rotate(360deg);}
}

</style>
