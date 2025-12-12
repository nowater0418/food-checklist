const STORAGE_KEY = "food_app";
const foodList = document.getElementById("foodList");
const emptyState = document.getElementById("emptyState");
const form = document.getElementById("foodForm");
const nameInput = document.getElementById("name");
const nameHint = document.getElementById("nameHint");

let foods = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
let filter = "all";

/* ---------- 主题 ---------- */
const themeToggle = document.getElementById("themeToggle");
let theme = localStorage.getItem("theme") || "light";

function applyTheme() {
  document.documentElement.dataset.theme = theme;
  themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
}
themeToggle.onclick = () => {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem("theme", theme);
  applyTheme();
};
applyTheme();

/* ---------- 渲染 ---------- */
function render() {
  foodList.innerHTML = "";
  const data = foods.filter(f => {
    if (filter === "all") return true;
    if (filter.includes("status")) return f.status === filter.split(":")[1];
    if (filter.includes("type")) return f.type === filter.split(":")[1];
  });

  emptyState.style.display = data.length ? "none" : "block";

  data.forEach(item => {
    const li = document.createElement("li");
    li.className = `item ${item.status === "visited" ? "visited" : ""}`;
    li.innerHTML = `
      <div>
        <strong>${item.name}</strong>
        <div class="status" data-id="${item.id}">
          ${item.status === "visited" ? "✓ 已打卡" : "未打卡"}
        </div>
      </div>
      <button class="delete-btn" data-id="${item.id}">删除</button>
    `;
    foodList.appendChild(li);
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(foods));
}

/* ---------- 交互 ---------- */
form.onsubmit = e => {
  e.preventDefault();
  if (!nameInput.value.trim()) {
    nameHint.textContent = "名称不能为空";
    return;
  }

  foods.unshift({
    id: Date.now(),
    name: nameInput.value.trim(),
    status: "unvisited"
  });

  form.reset();
  nameHint.textContent = "";
  render();
};

foodList.onclick = e => {
  const id = Number(e.target.dataset.id);
  if (!id) return;

  if (e.target.classList.contains("delete-btn")) {
    foods = foods.filter(f => f.id !== id);
  } else if (e.target.classList.contains("status")) {
    const item = foods.find(f => f.id === id);
    item.status = item.status === "visited" ? "unvisited" : "visited";
  }
  render();
};

document.querySelectorAll(".filter-btn").forEach(btn => {
  btn.onclick = () => {
    document.querySelector(".filter-btn.active")?.classList.remove("active");
    btn.classList.add("active");
    filter = btn.dataset.filter;
    render();
  };
});

render();
