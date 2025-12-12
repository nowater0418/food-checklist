/* =========================
   吃货清单：纯前端本地存储 + 语言/主题 + 像素猫
   ========================= */

const STORAGE_KEY = "food_checklist_cleanweb_v1";
const THEME_KEY = "theme";
const LANG_KEY = "lang";

/* ---------- DOM ---------- */
const form = document.getElementById("foodForm");
const nameInput = document.getElementById("name");
const noteInput = document.getElementById("note");
const nameHint = document.getElementById("nameHint");

const listEl = document.getElementById("foodList");
const emptyState = document.getElementById("emptyState");
const counterEl = document.getElementById("counter");

const filterBtns = Array.from(document.querySelectorAll(".filter-btn"));

const langToggle = document.getElementById("langToggle");
const themeToggle = document.getElementById("themeToggle");

const catLayer = document.getElementById("catLayer");

/* ---------- State ---------- */
let foods = loadFoods();
let currentFilter = "all";
let currentLang = localStorage.getItem(LANG_KEY) || "zh";
let theme = localStorage.getItem(THEME_KEY) || "light";

/* ---------- i18n ---------- */
const i18n = {
  zh: {
    title: "吃货清单",
    subtitle: "记录每一口好吃的，不辜负美食～",
    filter_all: "全部",
    filter_unvisited: "未打卡",
    filter_visited: "已打卡",
    filter_home: "家常菜",
    filter_snack: "小吃",
    filter_dessert: "甜品",
    add_food: "新增美食",
    food_name: "美食名称 *",
    type: "类型",
    restaurant: "餐厅菜",
    home: "家常菜",
    snack: "小吃",
    dessert: "甜品",
    rating: "推荐度",
    note: "备注",
    note_placeholder: "记录地址/做法/口感～",
    status: "打卡状态",
    unvisited: "未打卡",
    visited: "已打卡",
    save: "保存",
    list: "美食列表",
    empty: "暂无记录",
    noMatch: "没有符合当前筛选条件的记录～",
    del: "删除",
    meow: "喵~",
    count: (shown, total) => `${shown} 条（共 ${total} 条）`,
  },
  en: {
    title: "Food Checklist",
    subtitle: "Save every delicious bite you love.",
    filter_all: "All",
    filter_unvisited: "Unvisited",
    filter_visited: "Visited",
    filter_home: "Home",
    filter_snack: "Snacks",
    filter_dessert: "Dessert",
    add_food: "Add Food",
    food_name: "Food name *",
    type: "Type",
    restaurant: "Restaurant",
    home: "Home",
    snack: "Snacks",
    dessert: "Dessert",
    rating: "Rating",
    note: "Notes",
    note_placeholder: "Address / recipe / taste…",
    status: "Status",
    unvisited: "Unvisited",
    visited: "Visited",
    save: "Save",
    list: "Food List",
    empty: "No records yet",
    noMatch: "No items match this filter.",
    del: "Delete",
    meow: "Meow~",
    count: (shown, total) => `${shown} shown (total ${total})`,
  },
};

function t(key) {
  const pack = i18n[currentLang] || i18n.zh;
  return pack[key];
}

function applyLang() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    const val = t(key);
    if (typeof val === "string") el.textContent = val;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = t(key);
  });

  langToggle.textContent = currentLang === "zh" ? "EN" : "中";
}

/* ---------- Theme ---------- */
function applyTheme() {
  document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}

/* ---------- Storage ---------- */
function loadFoods() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function saveFoods() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}

/* ---------- Helpers ---------- */
function uid() {
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function typeLabel(type) {
  const map = {
    restaurant: t("restaurant"),
    home: t("home"),
    snack: t("snack"),
    dessert: t("dessert"),
  };
  return map[type] || type;
}

function renderStars(rating) {
  const r = Number(rating) || 0;
  let html = `<span class="stars" aria-label="rating ${r}">`;
  for (let i = 1; i <= 5; i++) html += i <= r ? "★" : "☆";
  html += `</span>`;
  return html;
}

function getFilteredFoods() {
  if (currentFilter === "all") return foods;

  const [kind, value] = currentFilter.split(":");
  if (kind === "status") return foods.filter(x => x.status === value);
  if (kind === "type") return foods.filter(x => x.type === value);
  return foods;
}

/* ---------- Render ---------- */
function render() {
  const data = getFilteredFoods();
  listEl.innerHTML = "";

  counterEl.textContent = t("count")(data.length, foods.length);

  // 空状态：全空 / 筛选为空
  if (foods.length === 0) {
    emptyState.style.display = "block";
    emptyState.textContent = t("empty");
  } else if (data.length === 0) {
    emptyState.style.display = "block";
    emptyState.textContent = t("noMatch");
  } else {
    emptyState.style.display = "none";
  }

  for (const item of data) {
    const li = document.createElement("li");
    li.className = `item ${item.status === "visited" ? "visited" : ""}`;
    li.dataset.id = item.id;

    li.innerHTML = `
      <div class="item-main">
        <div class="row-1">
          <span class="name">${escapeHtml(item.name)}</span>
          <span class="tag ${item.type}">${escapeHtml(typeLabel(item.type))}</span>
        </div>

        <div class="meta">
          ${renderStars(item.rating)}
          <span class="status" data-action="toggleStatus">
            ${item.status === "visited" ? "✓ " + t("visited") : t("unvisited")}
          </span>
        </div>

        <div class="note">${item.note ? escapeHtml(item.note) : `<span class="muted">（—）</span>`}</div>
      </div>

      <div class="item-actions">
        <button class="delete-btn" type="button" data-action="delete">${t("del")}</button>
      </div>
    `;

    listEl.appendChild(li);
  }
}

/* ---------- Form ---------- */
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const fd = new FormData(form);
  const name = (fd.get("name") || "").toString().trim();
  const type = (fd.get("type") || "restaurant").toString();
  const rating = Number(fd.get("rating") || 3);
  const note = (fd.get("note") || "").toString().trim();
  const status = (fd.get("status") || "unvisited").toString();

  if (!name) {
    nameHint.textContent = currentLang === "zh" ? "美食名称不能为空～" : "Food name is required.";
    nameInput.focus();
    return;
  }
  nameHint.textContent = "";

  foods.unshift({
    id: uid(),
    name,
    type,
    rating,
    note,
    status,
    createdAt: Date.now(),
  });

  saveFoods();
  render();

  // 清空表单：保留 3 星
  form.reset();
  const rating3 = form.querySelector('input[name="rating"][value="3"]');
  if (rating3) rating3.checked = true;
  nameInput.focus();
});

nameInput.addEventListener("input", () => {
  if (nameInput.value.trim()) nameHint.textContent = "";
});

/* ---------- List actions ---------- */
listEl.addEventListener("click", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLElement)) return;

  const action = target.dataset.action;
  if (!action) return;

  const li = target.closest(".item");
  if (!li) return;

  const id = li.dataset.id;

  if (action === "delete") {
    foods = foods.filter(x => x.id !== id);
    saveFoods();
    render();
    return;
  }

  if (action === "toggleStatus") {
    const idx = foods.findIndex(x => x.id === id);
    if (idx === -1) return;
    foods[idx].status = foods[idx].status === "visited" ? "unvisited" : "visited";
    saveFoods();
    render();
  }
});

/* ---------- Filters ---------- */
filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.dataset.filter || "all";
    render();
  });
});

/* ---------- Lang / Theme toggle ---------- */
langToggle.addEventListener("click", () => {
  currentLang = currentLang === "zh" ? "en" : "zh";
  localStorage.setItem(LANG_KEY, currentLang);
  applyLang();
  render(); // 动态文本更新
});

themeToggle.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem(THEME_KEY, theme);
  applyTheme();
});

/* =========================
   像素小猫：生成 + 独立动画 + 交互 + 拖拽
   ========================= */

/* 一个简单像素猫 SVG（crispEdges） */
function catSVG({ body="#c9c9c9", ear="#111827", eye="#111827", accent="#34d399" }) {
  // 16x16 像素风，用 rect 画，缩放到 52px
  return `
  <svg class="cat-svg" viewBox="0 0 16 16" shape-rendering="crispEdges" xmlns="http://www.w3.org/2000/svg">
    <g class="bob">
      <!-- 耳朵 -->
      <rect x="3" y="2" width="2" height="2" fill="${ear}"/>
      <rect x="11" y="2" width="2" height="2" fill="${ear}"/>
      <rect x="4" y="3" width="1" height="1" fill="${ear}"/>
      <rect x="11" y="3" width="1" height="1" fill="${ear}"/>

      <!-- 头 -->
      <rect x="3" y="4" width="10" height="7" rx="0" fill="${body}"/>
      <!-- 眼睛 -->
      <g class="eyes">
        <rect x="6" y="7" width="1" height="1" fill="${eye}"/>
        <rect x="10" y="7" width="1" height="1" fill="${eye}"/>
      </g>
      <!-- 鼻子 -->
      <rect x="8" y="8" width="1" height="1" fill="${accent}"/>

      <!-- 身体 -->
      <rect x="4" y="11" width="8" height="4" fill="${body}"/>
      <!-- 腿 -->
      <rect x="5" y="14" width="2" height="1" fill="${ear}"/>
      <rect x="9" y="14" width="2" height="1" fill="${ear}"/>

      <!-- 尾巴 -->
      <g class="tail">
        <rect x="12" y="11" width="2" height="1" fill="${ear}"/>
        <rect x="13" y="10" width="1" height="1" fill="${ear}"/>
        <rect x="13" y="9" width="1" height="1" fill="${ear}"/>
      </g>
    </g>
  </svg>`;
}

function createCat(options) {
  const el = document.createElement("div");
  el.className = "pixel-cat";
  el.style.left = options.left;
  el.style.top = options.top;

  // 每只猫的独立动画节奏
  el.style.setProperty("--bob", options.bob);
  el.style.setProperty("--tail", options.tail);
  el.style.setProperty("--blink", options.blink);

  el.innerHTML = catSVG(options.colors);

  // 点击：跳一下 + 气泡
  el.addEventListener("click", (ev) => {
    ev.stopPropagation();
    el.classList.remove("jump");
    // 触发重排以便重复动画
    void el.offsetWidth;
    el.classList.add("jump");

    const bubble = document.createElement("div");
    bubble.className = "cat-bubble";
    bubble.textContent = t("meow");
    el.appendChild(bubble);
    setTimeout(() => bubble.remove(), 900);
  });

  // 拖拽（鼠标 + 触摸）
  makeDraggable(el);

  return el;
}

function makeDraggable(el) {
  let dragging = false;
  let startX = 0, startY = 0;
  let originLeft = 0, originTop = 0;

  function px(n){ return `${n}px`; }

  function pointerDown(e) {
    dragging = true;
    el.setPointerCapture?.(e.pointerId);

    const rect = el.getBoundingClientRect();
    originLeft = rect.left;
    originTop = rect.top;
    startX = e.clientX;
    startY = e.clientY;
  }

  function pointerMove(e) {
    if (!dragging) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    const x = clamp(originLeft + dx, 6, window.innerWidth - el.offsetWidth - 6);
    const y = clamp(originTop + dy, 6, window.innerHeight - el.offsetHeight - 6);

    el.style.left = px(x);
    el.style.top = px(y);
  }

  function pointerUp() {
    dragging = false;
  }

  el.addEventListener("pointerdown", pointerDown);
  window.addEventListener("pointermove", pointerMove);
  window.addEventListener("pointerup", pointerUp);
}

function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }

/* 在页面“空白处”放猫：尽量靠边缘，避免盖住主内容 */
function placeCats() {
  catLayer.innerHTML = "";

  const cats = [
    createCat({
      left: "18px",
      top: "210px",
      bob: "2.6s",
      tail: "1.1s",
      blink: "4.7s",
      colors: { body: "#cbd5e1", ear: "#111827", eye: "#111827", accent: "#34d399" }
    }),
    createCat({
      left: "calc(100vw - 90px)",
      top: "180px",
      bob: "3.1s",
      tail: "1.35s",
      blink: "3.9s",
      colors: { body: "#fde68a", ear: "#111827", eye: "#111827", accent: "#38bdf8" }
    }),
    createCat({
      left: "24px",
      top: "calc(100vh - 120px)",
      bob: "2.9s",
      tail: "1.25s",
      blink: "5.2s",
      colors: { body: "#fecaca", ear: "#111827", eye: "#111827", accent: "#34d399" }
    }),
  ];

  cats.forEach(c => catLayer.appendChild(c));
}

/* ---------- Init ---------- */
(function init() {
  applyTheme();
  applyLang();
  render();
  placeCats();
})();
