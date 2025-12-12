const langToggle = document.getElementById("langToggle");

let currentLang = localStorage.getItem("lang") || "zh";

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
    note_placeholder: "记录地址 / 做法 / 口感～",
    status: "打卡状态",
    unvisited: "未打卡",
    visited: "已打卡",
    save: "保存",
    list: "美食列表",
    empty: "暂无记录"
  },
  en: {
    title: "Food Checklist",
    subtitle: "Save every delicious bite you love 🍽️",
    filter_all: "All",
    filter_unvisited: "Unvisited",
    filter_visited: "Visited",
    filter_home: "Home Cooked",
    filter_snack: "Snacks",
    filter_dessert: "Dessert",
    add_food: "Add Food",
    food_name: "Food Name *",
    type: "Type",
    restaurant: "Restaurant",
    home: "Home",
    snack: "Snack",
    dessert: "Dessert",
    rating: "Rating",
    note: "Notes",
    note_placeholder: "Address / recipe / taste...",
    status: "Status",
    unvisited: "Not Visited",
    visited: "Visited",
    save: "Save",
    list: "Food List",
    empty: "No records yet"
  }
};

function applyLang() {
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = i18n[currentLang][key];
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    el.placeholder = i18n[currentLang][key];
  });

  langToggle.textContent = currentLang === "zh" ? "EN" : "中";
}

langToggle.addEventListener("click", () => {
  currentLang = currentLang === "zh" ? "en" : "zh";
  localStorage.setItem("lang", currentLang);
  applyLang();
});

applyLang();
