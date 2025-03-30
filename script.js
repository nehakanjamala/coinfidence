async function addTransaction() {
  const transaction = {
      date: document.getElementById("date").value,
      amount: document.getElementById("amount").value,
      description: document.getElementById("description").value,
      category: document.getElementById("category").value
  };

  const response = await fetch("http://127.0.0.1:5000/add_transaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(transaction)
  });

  const result = await response.json();
  console.log(result);

  loadTransactions(); // Refresh transaction list
}

async function loadTransactions() {
  const response = await fetch("http://127.0.0.1:5000/transactions");
  const transactions = await response.json();

  let transactionList = document.getElementById("transaction-list");
  transactionList.innerHTML = ""; // Clear existing transactions

  transactions.forEach(tx => {
      let li = document.createElement("li");
      li.textContent = `${tx.date} - $${tx.amount} - ${tx.description} (${tx.category})`;
      transactionList.appendChild(li);
  });
}

// Load transactions on page load
window.onload = loadTransactions;



