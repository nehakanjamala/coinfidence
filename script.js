// Initialize transactions in localStorage if not exists
if (!localStorage.getItem("transactions")) {
  localStorage.setItem("transactions", JSON.stringify([]));
}

// Add transaction function
function addTransaction(event) {
  
  event.preventDefault(); // Prevent default form submission behavior

  const dateInput = document.getElementById("date");
  const amountInput = document.getElementById("amount");
  const descriptionInput = document.getElementById("description");
  const categoryInput = document.getElementById("category");

  if (!dateInput.value || !amountInput.value || !descriptionInput.value || !categoryInput.value) {
    alert("Please fill in all fields");
    return;
  }

  const amount = parseFloat(amountInput.value);
  if (isNaN(amount) || amount <= 0) {
    alert("Amount must be greater than 0");
    return;
  }

  const transaction = {
    id: Date.now(),
    date: dateInput.value,
    amount: amount,
    description: descriptionInput.value,
    category: categoryInput.value
  };

  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  dateInput.value = "";
  amountInput.value = "";
  descriptionInput.value = "";
  categoryInput.value = "necessities"; // Reset to default category

  updateBudgetSummary(); // Update the budget summary
  loadTransactions(); // Reload the transactions to reflect the new one
  alert("Transaction added successfully!"); // Notify user
}

// Load transactions from localStorage
function loadTransactions() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const transactionList = document.getElementById("transaction-list");

  if (!transactionList) return;

  transactionList.innerHTML = ""; // Clear any existing content

  if (transactions.length === 0) {
    const noTransactionsMessage = document.createElement("li");
    noTransactionsMessage.textContent = "No transactions available.";
    transactionList.appendChild(noTransactionsMessage);
  } else {
    transactions.sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date (newest first)

    transactions.forEach(tx => {
      const li = document.createElement("li");
      li.className = "transaction-item";

      li.innerHTML = `
        <div>
          <strong>${new Date(tx.date).toLocaleDateString()}</strong> - 
          $${tx.amount.toFixed(2)} - 
          ${tx.description} (${tx.category})
        </div>
      `;

      transactionList.appendChild(li); // Append the transaction to the list
    });
  }
}

// Update budget summary and progress bars
function updateBudgetSummary() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const totals = { necessities: 0, savings: 0, lifestyle: 0 };

  transactions.forEach(tx => totals[tx.category] += parseFloat(tx.amount));

  const totalSpending = Object.values(totals).reduce((a, b) => a + b, 0);
  const percentages = {
    necessities: totalSpending > 0 ? (totals.necessities / totalSpending) * 100 : 0,
    savings: totalSpending > 0 ? (totals.savings / totalSpending) * 100 : 0,
    lifestyle: totalSpending > 0 ? (totals.lifestyle / totalSpending) * 100 : 0
  };

  // Update the progress bars and percentage text
  ["necessities", "savings", "lifestyle"].forEach(category => {
    const progressBar = document.getElementById(`${category}-bar`);
    if (progressBar) progressBar.style.width = `${percentages[category]}%`;
    const percentageText = document.getElementById(`${category}-percentage`);
    if (percentageText) percentageText.textContent = `${percentages[category].toFixed(1)}%`;
  });

  document.getElementById("total-spending").textContent = totalSpending.toFixed(2);

  // Update the chart with the new percentages
  if (window.budgetChart) {
    window.budgetChart.data.datasets[0].data = [percentages.necessities, percentages.savings, percentages.lifestyle];
    window.budgetChart.update();
  }
}

// Initialize charts
function initializeCharts() {
  const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
  const totals = { necessities: 0, savings: 0, lifestyle: 0 };
  transactions.forEach(tx => totals[tx.category] += parseFloat(tx.amount));
  const totalSpending = Object.values(totals).reduce((a, b) => a + b, 0);
  const percentages = {
    necessities: totalSpending > 0 ? (totals.necessities / totalSpending) * 100 : 0,
    savings: totalSpending > 0 ? (totals.savings / totalSpending) * 100 : 0,
    lifestyle: totalSpending > 0 ? (totals.lifestyle / totalSpending) * 100 : 0
  };

  const budgetCtx = document.getElementById("budgetChart");
  if (budgetCtx) {
    window.budgetChart = new Chart(budgetCtx, {
      type: "pie",
      data: {
        labels: ["Necessities", "Savings", "Lifestyle"],
        datasets: [{ data: [percentages.necessities, percentages.savings, percentages.lifestyle], backgroundColor: ["#89cff0", "#93c83e", "#f46fa1"] }]
      }
    });
  }

  const idealCtx = document.getElementById("idealChart");
  if (idealCtx) {
    new Chart(idealCtx, {
      type: "pie",
      data: {
        labels: ["Necessities (50%)", "Savings (20%)", "Lifestyle (30%)"],
        datasets: [{ data: [50, 20, 30], backgroundColor: ["#89cff0", "#93c83e", "#f46fa1"] }]
      }
    });
  }
}

// Event listener for page load
document.addEventListener("DOMContentLoaded", () => {
  // Initialize charts and transactions on page load
  initializeCharts();
  updateBudgetSummary();
  if (document.getElementById("transaction-list")) loadTransactions(); // Load transactions on page load
});
