// Mission Trainer — estado del cliente y render.
const RESOURCES = ["o2", "energia", "agua", "moral"];
const PENALTY = 10;
const RESOURCE_CATEGORY = {
  o2: "atmosfera",
  agua: "soporte-vital",
  energia: "energia",
  moral: "salud",
};

const state = {
  questions: [],
  index: 0,
  score: 0,
  streak: 0,
  maxStreak: 0,
  resources: { o2: 100, energia: 100, agua: 100, moral: 100 },
  answered: [],
  locked: false,
  loading: false,
  wrong: 0,
  lowSeen: {},
  supportOpen: false,
  pendingHint: null,
  hintUsed: false,
};

const $ = (id) => document.getElementById(id);
const screens = { start: $("start"), game: $("game"), report: $("report") };

function show(name) {
  for (const [key, el] of Object.entries(screens)) el.hidden = key !== name;
  $("hud").hidden = name === "start";
}

function reset() {
  state.questions = [];
  state.index = 0;
  state.score = 0;
  state.streak = 0;
  state.maxStreak = 0;
  state.resources = { o2: 100, energia: 100, agua: 100, moral: 100 };
  state.answered = [];
  state.locked = false;
  state.wrong = 0;
  state.lowSeen = {};
  state.supportOpen = false;
  state.pendingHint = null;
  state.hintUsed = false;
  $("support").hidden = true;
  renderResources();
}

function renderResources() {
  for (const key of RESOURCES) {
    const el = document.querySelector(`.resource[data-resource="${key}"]`);
    const value = Math.max(0, state.resources[key]);
    el.querySelector("i").style.width = `${value}%`;
    el.classList.toggle("low", value <= 30);
  }
}

async function start() {
  if (state.loading) return;
  state.loading = true;
  try {
    const count = Number($("count").value);
    const res = await fetch(`/api/quiz?n=${count}`);
    const data = await res.json();
    reset();
    state.questions = data.questions;
    state.index = 0;
    show("game");
    renderQuestion();
  } finally {
    state.loading = false;
  }
}

function renderQuestion() {
  const q = state.questions[state.index];
  state.locked = false;
  $("progress").textContent = `Pregunta ${state.index + 1} de ${state.questions.length} · ${q.category_label}`;
  $("streak").textContent = state.streak >= 2 ? `racha ×${state.streak}` : "";
  $("prompt").textContent = q.prompt;
  $("feedback").hidden = true;

  const options = $("options");
  options.innerHTML = "";
  q.options.forEach((text, i) => {
    const btn = document.createElement("button");
    btn.className = "option";
    btn.textContent = `${i + 1}. ${text}`;
    btn.addEventListener("click", () => answer(q, i, btn));
    options.appendChild(btn);
  });

  if (state.pendingHint?.length) {
    for (const i of state.pendingHint) {
      const btn = options.children[i];
      if (btn) {
        btn.classList.add("discarded");
        btn.disabled = true;
      }
    }
    state.pendingHint = null;
  }
}

async function answer(question, choice, button) {
  if (state.locked) return;
  state.locked = true;
  for (const btn of $("options").querySelectorAll("button")) btn.disabled = true;

  const res = await fetch("/api/answer", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: question.id, choice }),
  });
  const data = await res.json();
  if (data.id !== question.id) return; // respuesta de otra partida: se ignora

  if (data.correct) {
    state.streak += 1;
    state.maxStreak = Math.max(state.maxStreak, state.streak);
    state.score += 100 + (state.streak >= 3 ? 25 * state.streak : 0);
    button.classList.add("correct");
  } else {
    state.streak = 0;
    state.wrong += 1;
    button.classList.add("wrong");
    state.resources[data.resource] -= PENALTY;
    const correctBtn = $("options").querySelectorAll("button")[data.answer];
    if (correctBtn) correctBtn.classList.add("correct");
    state.answered.push({
      category: question.category_label,
      prompt: question.prompt,
      source: data.source.url,
    });
  }

  renderResources();

  const verdict = $("verdict");
  verdict.textContent = data.correct ? "Correcto. Sistema estable." : "Ahí falló un sistema.";
  verdict.className = `verdict ${data.correct ? "ok" : "bad"}`;
  $("scenario").textContent = data.scenario;
  $("explanation").textContent = data.explanation;
  $("consequence").textContent = data.consequence;
  $("hook").textContent = data.hook;
  $("hook").hidden = !data.hook;
  $("source").href = data.source.url;
  $("source").textContent = `Fuente: ${data.source.title} →`;
  $("feedback").hidden = false;
  maybeSupport(question.category);
  $("next").textContent = state.index === state.questions.length - 1 ? "Ver informe" : "Siguiente";
}

function next() {
  state.index += 1;
  if (state.index >= state.questions.length) return report();
  renderQuestion();
}

function report() {
  const total = state.questions.length;
  const hits = total - state.answered.length;
  const ratio = total ? hits / total : 0;
  const rank =
    ratio >= 0.75 ? "Comandante" :
    ratio >= 0.5 ? "Oficial de misión" :
    ratio >= 0.25 ? "Especialista" : "Cadete";
  const message =
    ratio >= 0.75 ? "Listo para Artemis." :
    ratio >= 0.5 ? "El puesto confía en vos." :
    ratio >= 0.25 ? "Ya podés cuidar un sistema." : "Todo astronauta empieza acá.";

  $("rank").textContent = `${rank} · ${hits}/${total} aciertos`;
  $("rank-msg").textContent = message;
  $("score").textContent = `${state.score} puntos · racha máxima ×${state.maxStreak}`;

  const list = $("failed");
  list.innerHTML = "";
  if (state.answered.length === 0) {
    const li = document.createElement("li");
    li.textContent = "Ninguno: misión perfecta.";
    list.appendChild(li);
  } else {
    const seen = new Set();
    for (const a of state.answered) {
      if (seen.has(a.category)) continue;
      seen.add(a.category);
      const li = document.createElement("li");
      li.textContent = `${a.category}: ${a.prompt}`;
      list.appendChild(li);
    }
  }
  show("report");
}

$("start-btn").addEventListener("click", start);
$("next").addEventListener("click", next);
$("again").addEventListener("click", () => {
  reset();
  show("start");
});

document.addEventListener("keydown", (event) => {
  if (!screens.game.hidden) {
    if (event.key === "Enter" && !$("feedback").hidden) next();
    const n = Number(event.key);
    if (n >= 1 && n <= 4) {
      const btn = $("options").querySelectorAll("button")[n - 1];
      if (btn && !btn.disabled) btn.click();
    }
  }
});


// --- Apoyo de Tierra: información cuando el jugador va perdiendo -----------
function maybeSupport(category) {
  if (state.supportOpen) return;
  const low = Object.keys(state.resources).filter(
    (key) => state.resources[key] <= 30 && !state.lowSeen[key],
  );
  const third = state.wrong > 0 && state.wrong % 3 === 0;
  if (low.length === 0 && !third) return;
  for (const key of low) state.lowSeen[key] = true;
  const trigger = low.length ? RESOURCE_CATEGORY[low[0]] : category;
  openSupport(trigger);
}

async function openSupport(category) {
  const res = await fetch(`/api/support/${category}`);
  if (!res.ok) return;
  const brief = await res.json();
  $("sup-headline").textContent = brief.headline;
  $("sup-concept").textContent = brief.concept;
  $("sup-tip").textContent = brief.tip;
  $("sup-source").textContent = `Fuente: ${brief.source.title} →`;
  $("sup-source").href = brief.source.url;
  $("sup-hint").disabled = state.hintUsed;
  $("sup-hint").textContent = state.hintUsed ? "Pista ya usada" : "Pedir pista";
  state.supportOpen = true;
  $("support").hidden = false;
}

function closeSupport() {
  state.supportOpen = false;
  $("support").hidden = true;
}

$("sup-close").addEventListener("click", closeSupport);

$("sup-hint").addEventListener("click", async () => {
  const nextQuestion = state.questions[state.index + 1];
  if (!nextQuestion) {
    $("sup-hint").textContent = "Última pregunta: sin pista";
    return;
  }
  const res = await fetch("/api/hint", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id: nextQuestion.id }),
  });
  if (!res.ok) return;
  const data = await res.json();
  state.pendingHint = data.discard;
  state.hintUsed = true;
  closeSupport();
});
