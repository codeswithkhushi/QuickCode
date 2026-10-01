// Dark-mode toggle (remembers choice; safe if storage is blocked)
const root = document.documentElement;
const themeBtn = document.getElementById("theme");
let saved = null;
try { saved = localStorage.getItem("theme"); } catch (e) {}
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
setTheme(saved || (prefersDark ? "dark" : "light"));

function setTheme(t) {
  root.dataset.theme = t;
  themeBtn.textContent = t === "dark" ? "Light" : "Dark";
  themeBtn.setAttribute("aria-label", t === "dark" ? "Switch to light mode" : "Switch to dark mode");
}
themeBtn.addEventListener("click", () => {
  const next = root.dataset.theme === "dark" ? "light" : "dark";
  setTheme(next);
  try { localStorage.setItem("theme", next); } catch (e) {}
});

// Copy button on every command
document.querySelectorAll(".card li").forEach((li) => {
  const btn = document.createElement("button");
  btn.type = "button"; btn.className = "copy"; btn.textContent = "Copy";
  btn.addEventListener("click", async () => {
    const text = li.querySelector("code").textContent;
    try { await navigator.clipboard.writeText(text); btn.textContent = "Copied"; }
    catch (e) { btn.textContent = "Press Ctrl+C"; }
    btn.classList.add("done");
    setTimeout(() => { btn.textContent = "Copy"; btn.classList.remove("done"); }, 1400);
  });
  li.appendChild(btn);
});

// Search + topic filter (also matches hidden keywords like "center", "undo", "loop")
const q = document.getElementById("q");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const chips = document.querySelectorAll(".chip");
let group = "all";
function applyFilter() {
  const words = q.value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  let shownCards = 0, shownCmds = 0;
  document.querySelectorAll(".card").forEach((card) => {
    const inGroup = group === "all" || card.dataset.group === group;
    const title = card.querySelector("h3").textContent;
    let hits = 0;
    card.querySelectorAll("li").forEach((li) => {
      const hay = (li.textContent + " " + (li.dataset.k || "") + " " + title).toLowerCase();
      const match = inGroup && words.every((w) => hay.includes(w));
      li.hidden = !match;
      if (match) hits++;
    });
    card.hidden = hits === 0;
    if (hits) { shownCards++; shownCmds += hits; }
  });
  empty.hidden = shownCards !== 0;
  count.textContent = shownCmds + " commands";
}
q.addEventListener("input", applyFilter);
chips.forEach((chip) => chip.addEventListener("click", () => {
  group = chip.dataset.g;
  chips.forEach((c) => c.classList.toggle("on", c === chip));
  applyFilter();
}));
applyFilter();
