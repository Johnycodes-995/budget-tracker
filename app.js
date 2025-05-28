// Budget Tracker - Core Functionality
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
let nextId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

// Save transactions to localStorage
function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

// Update dashboard summary
function updateSummary() {
  const income = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const expenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const balance = income - expenses;

  if (document.getElementById('total-balance')) {
    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('total-income').textContent = formatCurrency(income);
    document.getElementById('total-expenses').textContent = formatCurrency(expenses);
  }
}

// Initialize dark mode
function initDarkMode() {
  const darkModeToggle = document.getElementById('theme-toggle');
  if (!darkModeToggle) return;

  const currentTheme = localStorage.getItem('theme') || 'light';
  document.body.classList.toggle('dark-mode', currentTheme === 'dark');
  darkModeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';

  darkModeToggle.addEventListener('click', () => {
    const isDark = document.body.classList.toggle('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    darkModeToggle.textContent = isDark ? '☀️' : '🌙';
  });
}

// Initialize app when DOM loads
document.addEventListener('DOMContentLoaded', () => {
  updateSummary();
  initDarkMode();
});
// Transactions Page Functionality
function renderTransactions() {
    const tbody = document.getElementById('transactions-body');
    if (!tbody) return;
  
    tbody.innerHTML = transactions.map(transaction => `
      <tr data-id="${transaction.id}">
        <td>${transaction.description}</td>
        <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
          ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
        </td>
        <td>${transaction.date}</td>
        <td>${transaction.category}</td>
        <td class="actions">
          <button class="btn-edit">Edit</button>
          <button class="btn-delete">Delete</button>
        </td>
      </tr>
    `).join('');
  
    // Add event listeners for edit/delete
    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.closest('tr').dataset.id);
        deleteTransaction(id);
      });
    });
  
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.closest('tr').dataset.id);
        editTransaction(id);
      });
    });
  }
  
  function deleteTransaction(id) {
    transactions = transactions.filter(t => t.id !== id);
    saveTransactions();
    renderTransactions();
    updateSummary();
  }
  
  function editTransaction(id) {
    const transaction = transactions.find(t => t.id === id);
    const modal = document.getElementById('transaction-modal');
    const form = document.getElementById('transaction-form');
    
    // Fill the form
    document.getElementById('transaction-description').value = transaction.description;
    document.getElementById('transaction-amount').value = transaction.amount;
    document.getElementById('transaction-type').value = transaction.type;
    document.getElementById('transaction-category').value = transaction.category;
    document.getElementById('transaction-date').value = transaction.date;
    
    // Show modal
    modal.style.display = 'block';
    
    // Update form handler
    form.onsubmit = function(e) {
      e.preventDefault();
      
      // Update transaction
      transaction.description = document.getElementById('transaction-description').value;
      transaction.amount = parseFloat(document.getElementById('transaction-amount').value);
      transaction.type = document.getElementById('transaction-type').value;
      transaction.category = document.getElementById('transaction-category').value;
      transaction.date = document.getElementById('transaction-date').value;
      
      saveTransactions();
      renderTransactions();
      updateSummary();
      modal.style.display = 'none';
      form.reset();
    };
  }
  
  function setupTransactionForm() {
    const form = document.getElementById('transaction-form');
    const modal = document.getElementById('transaction-modal');
    const addBtn = document.getElementById('add-transaction');
    const closeBtn = document.querySelector('.close-modal');
  
    if (!form) return;
  
    // Add new transaction
    form.onsubmit = function(e) {
      e.preventDefault();
      
      const newTransaction = {
        id: nextId++,
        description: document.getElementById('transaction-description').value,
        amount: parseFloat(document.getElementById('transaction-amount').value),
        type: document.getElementById('transaction-type').value,
        category: document.getElementById('transaction-category').value,
        date: document.getElementById('transaction-date').value
      };
      
      transactions.push(newTransaction);
      saveTransactions();
      renderTransactions();
      updateSummary();
      modal.style.display = 'none';
      form.reset();
    };
  
    // Modal controls
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        form.reset();
        form.onsubmit = function(e) {
          e.preventDefault();
          
          const newTransaction = {
            id: nextId++,
            description: document.getElementById('transaction-description').value,
            amount: parseFloat(document.getElementById('transaction-amount').value),
            type: document.getElementById('transaction-type').value,
            category: document.getElementById('transaction-category').value,
            date: document.getElementById('transaction-date').value
          };
          
          transactions.push(newTransaction);
          saveTransactions();
          renderTransactions();
          updateSummary();
          modal.style.display = 'none';
          form.reset();
        };
        modal.style.display = 'block';
      });
    }
  
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        modal.style.display = 'none';
      });
    }
  
    window.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.style.display = 'none';
      }
    });
  }
  
  // Initialize transactions page
  document.addEventListener('DOMContentLoaded', () => {
    renderTransactions();
    setupTransactionForm();
  });
  // Reports Page Functionality
function renderReports() {
    // Income vs Expenses Chart
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  
    new Chart(document.getElementById('income-expense-chart'), {
      type: 'doughnut',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [income, expenses],
          backgroundColor: ['#4CAF50', '#F44336'],
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${context.label}: ${formatCurrency(context.raw)}`;
              }
            }
          }
        }
      }
    });
  
    // Category Breakdown Chart
    const categories = {};
    transactions.forEach(t => {
      if (!categories[t.category]) categories[t.category] = 0;
      categories[t.category] += t.amount;
    });
  
    new Chart(document.getElementById('category-chart'), {
      type: 'bar',
      data: {
        labels: Object.keys(categories),
        datasets: [{
          label: 'Amount',
          data: Object.values(categories),
          backgroundColor: '#2196F3',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          tooltip: {
            callbacks: {
              label: function(context) {
                return `${formatCurrency(context.raw)}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return formatCurrency(value);
              }
            }
          }
        }
      }
    });
  }
  
  // Initialize reports page
  document.addEventListener('DOMContentLoaded', renderReports);
  // Add these to your existing app.js

// Format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
  
  // Update all parts of the app when transactions change
  function updateAll() {
    updateSummary();
    if (typeof renderTransactions === 'function') renderTransactions();
    if (typeof renderReports === 'function') renderReports();
    if (typeof renderRecentTransactions === 'function') renderRecentTransactions();
    if (typeof renderIncomeExpenseChart === 'function') renderIncomeExpenseChart();
  }
  
  // Listen for storage changes (updates when other tabs make changes)
  window.addEventListener('storage', function() {
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    updateAll();
  });
  // Settings Page Functionality
function initSettings() {
    // Load saved budget
    const savedBudget = localStorage.getItem('monthlyBudget');
    if (savedBudget) {
      document.getElementById('monthly-budget').value = savedBudget;
    }
  
    // Save budget
    document.getElementById('save-budget').addEventListener('click', function() {
      const budgetAmount = document.getElementById('monthly-budget').value;
      if (budgetAmount && !isNaN(budgetAmount)) {
        localStorage.setItem('monthlyBudget', budgetAmount);
        showAlert('Budget saved successfully!');
      } else {
        showAlert('Please enter a valid budget amount', 'error');
      }
    });
  
    // Export data
    document.getElementById('export-data').addEventListener('click', exportData);
  
    // Reset data
    document.getElementById('reset-data').addEventListener('click', function() {
      showConfirm(
        'Reset All Data',
        'This will permanently delete all your transactions. Are you sure?',
        resetData
      );
    });
  }
  
  function exportData() {
    const headers = ['ID', 'Description', 'Amount', 'Type', 'Category', 'Date'];
    const csvContent = [
      headers.join(','),
      ...transactions.map(t => `${t.id},"${t.description}",${t.amount},${t.type},${t.category},${t.date}`)
    ].join('\n');
  
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'budget-tracker-export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  
    showAlert('Data exported successfully!');
  }
  
  function resetData() {
    transactions = [];
    nextId = 1;
    localStorage.removeItem('transactions');
    showAlert('All data has been reset.');
    updateSummary();
  }
  
  function showAlert(message, type = 'success') {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    document.body.appendChild(alert);
  
    setTimeout(() => {
      alert.remove();
    }, 3000);
  }
  
  function showConfirm(title, message, confirmCallback) {
    const modal = document.createElement('div');
    modal.className = 'confirm-modal';
    modal.innerHTML = `
      <div class="confirm-content">
        <h3>${title}</h3>
        <p>${message}</p>
        <div class="confirm-buttons">
          <button id="confirm-cancel" class="btn">Cancel</button>
          <button id="confirm-ok" class="btn btn-danger">Confirm</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  
    document.getElementById('confirm-cancel').addEventListener('click', () => {
      modal.remove();
    });
  
    document.getElementById('confirm-ok').addEventListener('click', () => {
      confirmCallback();
      modal.remove();
    });
  }
  
  // Initialize settings page
  document.addEventListener('DOMContentLoaded', initSettings);
  // Add this function to update recent transactions
function updateRecentTransactions() {
    const recentTransactions = [...transactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
  
    const tbody = document.getElementById('recent-transactions');
    tbody.innerHTML = recentTransactions.map(transaction => `
      <tr>
        <td>${transaction.description}</td>
        <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
          ${transaction.type === 'income' ? '+' : '-'}${formatCurrency(transaction.amount)}
        </td>
        <td>${transaction.date}</td>
      </tr>
    `).join('');
  }
  
  // Modify the updateAll function to include recent transactions
  function updateAll() {
    updateSummary();
    updateRecentTransactions();
    renderIncomeExpenseChart();
    
    // If on transactions page, refresh that too
    if (typeof renderTransactions === 'function') {
      renderTransactions();
    }
  }
  
  // Initialize with all updates
  function initDashboard() {
    updateAll();
    
    // Listen for storage changes (updates when transactions change)
    window.addEventListener('storage', function() {
      transactions = JSON.parse(localStorage.getItem('transactions')) || [];
      updateAll();
    });
  }
  
  document.addEventListener('DOMContentLoaded', initDashboard);
  // Modify the form submission handler to trigger updates
transactionForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const newTransaction = {
      id: nextId++,
      description: document.getElementById('transaction-description').value,
      amount: parseFloat(document.getElementById('transaction-amount').value),
      type: document.getElementById('transaction-type').value,
      category: document.getElementById('transaction-category').value,
      date: document.getElementById('transaction-date').value
    };
    
    transactions.push(newTransaction);
    saveTransactions();
    
    // Trigger updates across all pages
    updateAll();
    window.dispatchEvent(new Event('storage'));
    
    // Close modal and reset form
    transactionModal.style.display = 'none';
    transactionForm.reset();
  });
  // Add this global function to trigger updates
function updateAll() {
    if (typeof updateSummary === 'function') updateSummary();
    if (typeof updateRecentTransactions === 'function') updateRecentTransactions();
    if (typeof renderIncomeExpenseChart === 'function') renderIncomeExpenseChart();
    if (typeof renderTransactions === 'function') renderTransactions();
  }
  
  // Add this event listener for cross-tab updates
  window.addEventListener('storage', function() {
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    updateAll();
  });