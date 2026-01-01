let user = "";
let entries = [];
let entryType = "expense";
let category = "";
let mode = "Cash 💵";

const expenseCats = ["Food 🍜","Travel 🚕","Fun 🎧","Other ✨"];
const incomeCats = ["Salary 💼","Pocket Money 🪙","Gift 🎁"];

const login = document.getElementById("loginScreen");
const dash = document.getElementById("dashboard");

const historyView = document.getElementById("historyView");
const overviewView = document.getElementById("overviewView");

loginBtn.onclick = () => {
  user = usernameInput.value.trim();
  if (!user) return;

  login.style.display = "none";
  dash.style.display = "grid";
  greeting.innerText = `Hi ${user} 🌷`;

  entries = JSON.parse(localStorage.getItem("soft_" + user)) || [];
  render();
};

addBtn.onclick = () => modal.style.display = "flex";
cancelBtn.onclick = () => modal.style.display = "none";

document.querySelectorAll(".type").forEach(t => {
  t.onclick = () => {
    document.querySelectorAll(".type").forEach(x => x.classList.remove("active"));
    t.classList.add("active");
    entryType = t.dataset.type;
    loadCategories();
  };
});

document.querySelectorAll(".mode").forEach(m => {
  m.onclick = () => {
    document.querySelectorAll(".mode").forEach(x => x.classList.remove("active"));
    m.classList.add("active");
    mode = m.innerText;
  };
});

function loadCategories() {
  categoryWrap.innerHTML = "";
  const list = entryType === "expense" ? expenseCats : incomeCats;
  list.forEach((c, i) => {
    const b = document.createElement("button");
    b.className = "cat" + (i === 0 ? " active" : "");
    if (i === 0) category = c;
    b.innerText = c;
    b.onclick = () => {
      document.querySelectorAll(".cat").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      category = c;
    };
    categoryWrap.appendChild(b);
  });
}
loadCategories();

saveBtn.onclick = () => {
  const amt = +amount.value;
  const date = document.getElementById("date").value;
  if (!amt || !date) return;

  entries.push({ amt, date, category, mode, type: entryType });
  localStorage.setItem("soft_" + user, JSON.stringify(entries));
  modal.style.display = "none";
  render();
};

toggleBtn.onclick = () => {
  const showingHistory = historyView.style.display !== "none";

  if (showingHistory) {
    historyView.style.display = "none";
    overviewView.style.display = "block";
    toggleBtn.innerText = "Back to History 📜";
    drawChart();
  } else {
    overviewView.style.display = "none";
    historyView.style.display = "block";
    toggleBtn.innerText = "View Overview 📊";
  }
};

function render() {
  historyView.style.display = "block";
  overviewView.style.display = "none";
  toggleBtn.innerText = "View Overview 📊";

  entryList.innerHTML = "";
  let income = 0, expense = 0;

  entries.forEach((e, i) => {
    e.type === "income" ? income += e.amt : expense += e.amt;

    const li = document.createElement("li");
    li.innerHTML = `
      ${e.category} · ${e.mode} · ${e.date}
      <strong>₹ ${e.amt}</strong>
      <span class="delete">✖</span>
    `;

    li.querySelector(".delete").onclick = () => {
      entries.splice(i, 1);
      localStorage.setItem("soft_" + user, JSON.stringify(entries));
      render();
    };

    entryList.appendChild(li);
  });

  netTotal.innerText = income - expense;
}

function drawChart() {
  const ctx = chartCanvas.getContext("2d");
  ctx.clearRect(0, 0, 300, 300);

  const map = {};
  entries.filter(e => e.type === "expense").forEach(e => {
    map[e.category] = (map[e.category] || 0) + e.amt;
  });

  const sum = Object.values(map).reduce((a, b) => a + b, 0);
  if (!sum) return;

  let start = 0;
  let top = "", topVal = 0;
  legend.innerHTML = "";

  Object.entries(map).forEach(([c, v], i) => {
    const angle = (v / sum) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(150, 150);
    ctx.arc(150, 150, 120, start, start + angle);
    ctx.fillStyle = ["#CBDAD2","#EBC6BF","#D9CCE6","#F3E1B6"][i];
    ctx.fill();
    start += angle;

    legend.innerHTML += `<div>${c} — ₹${v}</div>`;
    if (v > topVal) { topVal = v; top = c; }
  });

  ctx.beginPath();
  ctx.arc(150,150,70,0,Math.PI*2);
  ctx.fillStyle="#F7F4F0";
  ctx.fill();

  ctx.fillStyle="#2E2E2E";
  ctx.font="bold 16px Poppins";
  ctx.textAlign="center";
  ctx.fillText("₹ "+sum,150,145);
  ctx.font="12px Poppins";
  ctx.fillText("this month",150,165);

  statTotal.innerText = sum;
  statTop.innerText = top.split(" ")[0];
  statCount.innerText = entries.length;
  insight.innerText =
    `Looks like ${top.split(" ")[0].toLowerCase()} is winning your heart (and wallet) 💸💗`;
}
