const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "togoInvestDemoV1";
let state = { name: "", email: "", balance: 0, invested: 0, profit: 0, transactions: [] };

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && typeof saved === "object") state = { ...state, ...saved };
  } catch (_) {}
}
function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function money(value) { return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(value) + " FCFA"; }
function toast(message) {
  const el = $("toast"); el.textContent = message; el.classList.add("show");
  clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove("show"), 3200);
}
function render() {
  $("profileName").textContent = state.name || "Visiteur";
  $("profileEmail").textContent = state.email || "Mode démonstration";
  $("welcomeName").textContent = state.name || "Visiteur";
  $("avatar").textContent = (state.name || "TI").trim().slice(0, 2).toUpperCase();
  $("availableBalance").textContent = money(state.balance);
  $("investedTotal").textContent = money(state.invested);
  $("profitTotal").textContent = money(state.profit);
  $("referralCount").textContent = "0";
  $("transactionsBody").innerHTML = "";
  if (!state.transactions.length) {
    $("transactionsBody").innerHTML = '<tr class="empty-row"><td colspan="6">Aucune transaction pour le moment.</td></tr>';
  } else {
    state.transactions.slice().reverse().forEach(tx => {
      const tr = document.createElement("tr");
      [tx.ref, tx.type, tx.method, money(tx.amount), tx.date].forEach(value => {
        const td = document.createElement("td"); td.textContent = value; tr.appendChild(td);
      });
      const td = document.createElement("td"); const badge = document.createElement("span");
      badge.className = "status"; badge.textContent = "Démo — non payé"; td.appendChild(badge); tr.appendChild(td);
      $("transactionsBody").appendChild(tr);
    });
  }
}
function addTransaction(type, method, amount) {
  state.transactions.push({
    ref: "TI-" + Date.now().toString().slice(-8),
    type, method, amount,
    date: new Date().toLocaleDateString("fr-FR")
  });
  saveState(); render();
}
function openLogin() {
  if (!state.name && $("loginDialog").showModal) $("loginDialog").showModal();
}
$("loginForm").addEventListener("submit", e => {
  e.preventDefault();
  state.name = $("userName").value.trim() || "Visiteur";
  state.email = $("userEmail").value.trim();
  saveState(); $("loginDialog").close(); render(); toast("Bienvenue sur Togo Invest (mode démo).");
});
$("depositForm").addEventListener("submit", e => {
  e.preventDefault();
  const amount = Number($("depositAmount").value), method = $("depositMethod").value;
  if (amount < 500 || !method) return toast("Vérifiez le montant et le moyen de paiement.");
  addTransaction("Demande de dépôt", method, amount);
  e.target.reset(); toast("Demande de dépôt de démonstration enregistrée. Aucun paiement effectué.");
});
$("withdrawForm").addEventListener("submit", e => {
  e.preventDefault();
  const amount = Number($("withdrawAmount").value), method = $("withdrawMethod").value;
  if (amount < 500 || !method || !$("withdrawPhone").value.trim()) return toast("Complétez les informations du retrait.");
  if (amount > state.balance) return toast("Solde démo insuffisant : aucun argent réel n'est disponible.");
  addTransaction("Demande de retrait", method, amount);
  e.target.reset(); toast("Demande de retrait démo enregistrée. Aucun transfert effectué.");
});
document.querySelectorAll("[data-plan]").forEach(button => button.addEventListener("click", () => {
  const amount = Number(button.dataset.amount);
  if (!confirm(`Tester « ${button.dataset.plan} » avec un montant fictif de ${money(amount)} ? Aucun paiement ne sera effectué.`)) return;
  state.invested += amount;
  addTransaction("Test de plan : " + button.dataset.plan, "Simulation", amount);
  toast("Plan ajouté aux statistiques de démonstration.");
}));
$("clearHistory").addEventListener("click", () => {
  if (!confirm("Effacer les transactions et les statistiques de démonstration ?")) return;
  state.balance = 0; state.invested = 0; state.profit = 0; state.transactions = [];
  saveState(); render(); toast("Historique de démonstration effacé.");
});
$("copyCode").addEventListener("click", async () => {
  try { await navigator.clipboard.writeText("TOGODEMO"); toast("Code TOGODEMO copié."); }
  catch (_) { toast("Votre code de démonstration : TOGODEMO"); }
});
$("logoutBtn").addEventListener("click", () => {
  state.name = ""; state.email = ""; saveState(); render(); openLogin();
});
$("menuToggle").addEventListener("click", () => {
  $("nav").classList.toggle("open"); $("sidebar").classList.toggle("open");
});
document.querySelectorAll(".side-link").forEach(a => a.addEventListener("click", () => $("sidebar").classList.remove("open")));
$("year").textContent = new Date().getFullYear();
loadState(); render(); openLogin();
