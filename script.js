let users = JSON.parse(localStorage.getItem('hh_users')) || [];
let activeUserId = localStorage.getItem('hh_active_user') || null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    // التأكد من إزالة أي شاشة قفل قديمة إن وجدت
    const oldOverlay = document.getElementById('authOverlay');
    if (oldOverlay) oldOverlay.remove();

    if (users.length === 0 || !activeUserId) {
        document.getElementById('welcomeOverlay').style.display = 'flex';
    } else {
        currentUser = users.find(u => u.id === activeUserId) || users[0];
        loadUserData();
    }
});

function completeFirstSetup() {
    const name = document.getElementById('setupName').value.trim();
    if (!name) return alert('يرجى إدخال اسمك الكريم للبدء');

    const newUser = {
        id: 'usr_' + Date.now(),
        name,
        cash: 0,
        wallet: 0,
        transactions: [],
        products: [],
        tasks: []
    };

    users.push(newUser);
    activeUserId = newUser.id;
    currentUser = newUser;

    localStorage.setItem('hh_users', JSON.stringify(users));
    localStorage.setItem('hh_active_user', activeUserId);

    document.getElementById('welcomeOverlay').style.display = 'none';
    loadUserData();
}

function openSwitchAccount() {
    const name = prompt('أدخل اسم المستخدم الجديد:');
    if (name && name.trim()) {
        const newUser = {
            id: 'usr_' + Date.now(),
            name: name.trim(),
            cash: 0,
            wallet: 0,
            transactions: [],
            products: [],
            tasks: []
        };
        users.push(newUser);
        activeUserId = newUser.id;
        currentUser = newUser;
        localStorage.setItem('hh_users', JSON.stringify(users));
        localStorage.setItem('hh_active_user', activeUserId);
        loadUserData();
    }
}

function loadUserData() {
    if (!currentUser) return;

    document.getElementById('headerUserName').innerText = currentUser.name;
    document.getElementById('headerAvatar').innerText = currentUser.name.charAt(0);
    document.getElementById('profileName').innerText = currentUser.name;

    const totalBalance = (currentUser.cash || 0) + (currentUser.wallet || 0);
    document.getElementById('homeTotalBalance').innerText = totalBalance.toLocaleString() + ' ج.م';
    document.getElementById('accCashBalance').innerText = (currentUser.cash || 0).toLocaleString() + ' ج.م';
    document.getElementById('accWalletBalance').innerText = (currentUser.wallet || 0).toLocaleString() + ' ج.م';

    const incomeTotal = (currentUser.transactions || []).filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
    const expenseTotal = (currentUser.transactions || []).filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);

    document.getElementById('homeMonthlyIncome').innerText = incomeTotal.toLocaleString() + ' ج.م';
    document.getElementById('homeMonthlyExpense').innerText = expenseTotal.toLocaleString() + ' ج.م';

    renderTransactions();
    renderProducts();
    renderTasks();
}

function saveState() {
    const index = users.findIndex(u => u.id === currentUser.id);
    if (index !== -1) {
        users[index] = currentUser;
        localStorage.setItem('hh_users', JSON.stringify(users));
    }
    loadUserData();
}

function switchTab(tabId) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(`view-${tabId}`).classList.add('active');
}

/* --- Store Management Logic --- */
function saveProduct() {
    const name = document.getElementById('prodName').value.trim();
    const cost = parseFloat(document.getElementById('prodCost').value);
    const price = parseFloat(document.getElementById('prodPrice').value);
    const qty = parseInt(document.getElementById('prodQty').value);

    if (!name || isNaN(cost) || isNaN(price) || isNaN(qty)) {
        return alert('يرجى ملء كافة بيانات المنتج بطريقة صحيحة');
    }

    if (!currentUser.products) currentUser.products = [];

    currentUser.products.unshift({
        id: Date.now(),
        name,
        cost,
        price,
        qty,
        soldQty: 0
    });

    saveState();
    closeModal('modalProduct');
    document.getElementById('prodName').value = '';
    document.getElementById('prodCost').value = '';
    document.getElementById('prodPrice').value = '';
    document.getElementById('prodQty').value = '';
}

function sellProduct(id) {
    const prod = (currentUser.products || []).find(p => p.id === id);
    if (prod && prod.qty > 0) {
        prod.qty -= 1;
        prod.soldQty = (prod.soldQty || 0) + 1;
        
        const profit = prod.price - prod.cost;

        currentUser.cash = (currentUser.cash || 0) + prod.price;
        currentUser.transactions.unshift({
            id: Date.now(),
            type: 'income',
            amount: prod.price,
            category: 'مبيعات المحل',
            note: `بيع: ${prod.name} (صافي ربح: ${profit} ج.م)`,
            date: new Date().toLocaleDateString('ar-EG')
        });

        saveState();
    } else {
        alert('المنتج نفد من المخزون!');
    }
}

function renderProducts() {
    const container = document.getElementById('productsList');
    const products = currentUser.products || [];

    let totalProfit = 0;
    let inventoryVal = 0;

    products.forEach(p => {
        totalProfit += ((p.soldQty || 0) * (p.price - p.cost));
        inventoryVal += (p.qty * p.cost);
    });

    document.getElementById('storeTotalProfit').innerText = totalProfit.toLocaleString() + ' ج.م';
    document.getElementById('storeInventoryValue').innerText = inventoryVal.toLocaleString() + ' ج.م';
    document.getElementById('storeTotalItems').innerText = products.length + ' منتج';

    if (products.length === 0) {
        container.innerHTML = `<div class="empty-state"><i class="fa-solid fa-box-open"></i><p>اضغط + لإضافة أول منتج في محلك</p></div>`;
        return;
    }

    container.innerHTML = products.map(p => {
        const profitPerUnit = p.price - p.cost;
        const isOut = p.qty <= 0;

        return `
            <div class="product-card">
                <div class="product-header">
                    <h4>${p.name}</h4>
                    <span class="stock-badge ${isOut ? 'stock-empty' : 'stock-available'}">
                        ${isOut ? '🔴 نفذت الكمية' : `🟢 متاح: ${p.qty} قطعة`}
                    </span>
                </div>
                <div class="product-metrics">
                    <div class="metric-box">
                        <p>سعر الشراء</p>
                        <strong>${p.cost} ج.م</strong>
                    </div>
                    <div class="metric-box">
                        <p>سعر البيع</p>
                        <strong>${p.price} ج.م</strong>
                    </div>
                    <div class="metric-box">
                        <p>الربح للقطعة</p>
                        <strong style="color: var(--success);">+${profitPerUnit} ج.م</strong>
                    </div>
                </div>
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 11px; color: var(--text-muted);">إجمالي المباع: ${p.soldQty || 0} قطعة</span>
                    <button class="btn btn-gold btn-sm" onclick="sellProduct(${p.id})" ${isOut ? 'disabled style="opacity:0.5"' : ''}>
                        <i class="fa-solid fa-cart-shopping"></i> بيع قطعة
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

/* --- Income & Expenses & Tasks --- */
function saveExpense() {
    const amount = parseFloat(document.getElementById('expAmount').value);
    const category = document.getElementById('expCategory').value;
    const account = document.getElementById('expAccount').value;

    if (!amount || amount <= 0) return alert('الرجاء إدخال مبلغ صحيح');

    if (account === 'cash') currentUser.cash = (currentUser.cash || 0) - amount;
    else currentUser.wallet = (currentUser.wallet || 0) - amount;

    currentUser.transactions.unshift({
        id: Date.now(),
        type: 'expense',
        amount,
        category,
        note: category,
        date: new Date().toLocaleDateString('ar-EG')
    });

    saveState();
    closeModal('modalExpense');
    document.getElementById('expAmount').value = '';
}

function saveIncome() {
    const amount = parseFloat(document.getElementById('incAmount').value);
    const category = document.getElementById('incCategory').value || 'دخل آخر';

    if (!amount || amount <= 0) return alert('الرجاء إدخال مبلغ صحيح');

    currentUser.cash = (currentUser.cash || 0) + amount;
    currentUser.transactions.unshift({
        id: Date.now(),
        type: 'income',
        amount,
        category,
        note: category,
        date: new Date().toLocaleDateString('ar-EG')
    });

    saveState();
    closeModal('modalIncome');
    document.getElementById('incAmount').value = '';
}

function saveTask() {
    const title = document.getElementById('taskTitle').value.trim();
    if (!title) return alert('أدخل عنوان المهمة');

    if (!currentUser.tasks) currentUser.tasks = [];
    currentUser.tasks.unshift({ id: Date.now(), title, done: false });
    saveState();
    closeModal('modalTask');
    document.getElementById('taskTitle').value = '';
}

function toggleTask(id) {
    const t = currentUser.tasks.find(x => x.id === id);
    if (t) { t.done = !t.done; saveState(); }
}

function renderTasks() {
    const container = document.getElementById('lifeTasksList');
    const tasks = currentUser.tasks || [];
    if (tasks.length === 0) {
        container.innerHTML = `<div class="empty-state"><p>لا توجد مهام مضافة</p></div>`;
        return;
    }
    container.innerHTML = tasks.map(t => `
        <div class="list-item" onclick="toggleTask(${t.id})" style="cursor: pointer;">
            <div class="item-left">
                <i class="fa-regular ${t.done ? 'fa-square-check' : 'fa-square'}" style="font-size: 20px; color: var(--gold-primary);"></i>
                <h4 style="${t.done ? 'text-decoration: line-through; opacity: 0.6;' : ''}">${t.title}</h4>
            </div>
        </div>
    `).join('');
}

function renderTransactions() {
    const recentContainer = document.getElementById('homeRecentTransactions');
    const fullContainer = document.getElementById('fullTransactionsList');
    const list = currentUser.transactions || [];

    if (list.length === 0) {
        recentContainer.innerHTML = `<div class="empty-state"><p>لا توجد معاملات بعد</p></div>`;
        fullContainer.innerHTML = `<div class="empty-state"><p>لا توجد معاملات مسجلة</p></div>`;
        return;
    }

    const html = list.map(t => `
        <div class="list-item">
            <div class="item-left">
                <div class="item-icon"><i class="fa-solid ${t.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i></div>
                <div class="item-details">
                    <h4>${t.note}</h4>
                    <p>${t.date} • ${t.category}</p>
                </div>
            </div>
            <div class="item-amount ${t.type === 'income' ? 'inc' : 'exp'}">
                ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()} ج.م
            </div>
        </div>
    `).join('');

    recentContainer.innerHTML = html;
    fullContainer.innerHTML = html;
}

function openModal(id) { document.getElementById(id).classList.add('active'); }
function closeModal(id) { document.getElementById(id).classList.remove('active'); }
