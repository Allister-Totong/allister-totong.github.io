const transactionForm = document.getElementById("transactionForm");
const titleInput = document.getElementById("title");
const amountInput = document.getElementById("amount");
const categoryInput = document.getElementById("category");
const balanceElement = document.getElementById("balance");
const transactionList = document.getElementById("transactionList");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [

];

const chartCanvas = document.getElementById("expenseChart");

const expenseChart = new Chart(chartCanvas, {
    type: "doughnut",
    data: {
        labels: [],
        datasets: [{
            data: [],
            backgroundColor: [
                "#2563eb",
                "#16a34a",
                "#dc2626",
                "#ca8a04",
                "#9333ea",
                "#0891b2"
            ]
        }]
    },
    options: {
        responsive: true,
        plugins: {
            legend: {
                position: "bottom"
            }
        }
    }
});

const clearButton = document.getElementById("clearData");

clearButton.addEventListener("click", function () {
    localStorage.removeItem("transactions");

    transactions = [];

    refreshUI();
});

function updateBalance() {
    const total = transactions.reduce((sum, transaction) => {
        return sum + transaction.amount;
    }, 0);

    balanceElement.textContent = `$${total.toFixed(2)}`;
}

function renderTransactions() {
    transactionList.innerHTML = "";

    transactions.forEach(transaction => {
        const li = document.createElement("li");
        li.classList.add("transaction-item");

        const amountClass = transaction.amount >= 0 ? "income" : "expense";

        li.innerHTML = `
            <div class="transaction-info">
                <span class="transaction-title">${transaction.title}</span>
                <span class="transaction-category">${transaction.category}</span>
            </div>

            <div class="transaction-right">
                <span class="amount ${amountClass}">
                    ${transaction.amount >= 0 ? "+" : "-"}$${Math.abs(transaction.amount).toFixed(2)}
                </span>
                <button class="delete-btn" data-id="${transaction.id}">✕</button>
            </div>
        `;

        transactionList.appendChild(li);
    });
}

function updateChart() {
    const categoryTotals = {};

    transactions.forEach(transaction => {
        if (transaction.amount < 0) {
            const category = transaction.category;
            const amount = Math.abs(transaction.amount);

            if (!categoryTotals[category]) {
                categoryTotals[category] = 0;
            }

            categoryTotals[category] += amount;
        }
    });

    expenseChart.data.labels = Object.keys(categoryTotals);
    expenseChart.data.datasets[0].data = Object.values(categoryTotals);

    expenseChart.update();
}

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

function refreshUI() {
    updateBalance();
    renderTransactions();
    updateChart();
}


transactionList.addEventListener("click", function (event) {
    const btn = event.target.closest(".delete-btn");
    if (!btn) return;

    const id = parseInt(btn.dataset.id);
    transactions = transactions.filter(t => t.id !== id);

    saveTransactions();
    refreshUI();
});

transactionForm.addEventListener("submit", function(event) {

    event.preventDefault();

    const title = titleInput.value.trim();
    const amount = parseFloat(amountInput.value);
    const category = categoryInput.value;

    if (title === "") {
        alert("Please enter a title.");
        return;
    }

    if (isNaN(amount) || amount <= 0) {
        alert("Please enter a valid amount.");
        return;
    }

    const finalAmount =
        category === "Income"
            ? amount
            : -amount;

    const newTransaction = {
        id: Date.now(),
        title: title,
        amount: finalAmount,
        category: category,
        date: new Date().toLocaleDateString()
    };

    transactions.unshift(newTransaction);

    saveTransactions();

    refreshUI();

    transactionForm.reset();

    titleInput.focus();
});


refreshUI();