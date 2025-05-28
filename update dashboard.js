
// Dashboard Page Functionality
function initDashboard() {
    updateSummary();
    renderRecentTransactions();
    renderIncomeExpenseChart();
  }
  
  function updateSummary() {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
  
    document.getElementById('total-balance').textContent = formatCurrency(balance);
    document.getElementById('total-income').textContent = formatCurrency(income);
    document.getElementById('total-expenses').textContent = formatCurrency(expenses);
  }
  
  function renderRecentTransactions() {
    const recentTransactions = transactions
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    const tbody = document.getElementById('recent-transactions');
    tbody.innerHTML = recentTransactions.map(transaction => `
      <tr>
        <td>${transaction.description}</td>
        <td class="${transaction.type === 'income' ? 'positive' : 'negative'}">
          ${formatCurrency(transaction.amount)}
        </td>
        <td>${transaction.date}</td>
      </tr>
    `).join('');
  }
  
  function renderIncomeExpenseChart() {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  
    const ctx = document.getElementById('income-expense-chart').getContext('2d');
    
    // Destroy previous chart instance if exists
    if (window.incomeExpenseChart) {
      window.incomeExpenseChart.destroy();
    }
  
    window.incomeExpenseChart = new Chart(ctx, {
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
          },
          legend: {
            position: 'bottom'
          }
        }
      }
    });
  }
  
  // Initialize dashboard when page loads
  document.addEventListener('DOMContentLoaded', initDashboard);
  
  // Update dashboard when transactions change
  window.addEventListener('storage', function() {
    transactions = JSON.parse(localStorage.getItem('transactions')) || [];
    initDashboard();
  });