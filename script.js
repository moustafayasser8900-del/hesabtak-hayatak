let users = JSON.parse(localStorage.getItem('hh_users')) || [];
let activeUserId = localStorage.getItem('hh_active_user') || null;
let currentUser = null;

document.addEventListener("DOMContentLoaded", () => {
    injectAuthOverlay();
    if (users.length === 0) {
        showWelcomeModal(true);
    } else {
        renderUserDropdown();
        checkAuth();
    }
});

// حقن واجهة تسجيل الدخول وإنشاء الحسابات الخاصة بالخصوصية
function injectAuthOverlay() {
    if (document.getElementById('authOverlay')) return;
    const overlayHtml = `
        <div id="authOverlay" class="auth-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 10, 10, 0.98); z-index: 3000; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px;">
            <div style="width: 100%; max-width: 360px; background: #1c1c1e; border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 24px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
                <div style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 30px; color: #000;">
                    <i class="fa-solid fa-shield-halved"></i>
                </div>
                <h2 style="margin-bottom: 6px; font-size: 20px; color: #d4af37;">حسابتك وحياتك</h2>
                <p style="font-size: 12px; color: #a1a1a6; margin-bottom: 16px;">اختر حسابك وأدخل كلمة السر الخاصة بك</p>

                <div style="margin-bottom: 14px; text-align: right;">
                    <label style="font-size: 12px; color: #a1a1a6; display: block; margin-bottom: 6px;">اختر الحساب:</label>
                    <select id="userSelect" class="form-control" onchange="onUserSelectChange()" style="width: 100%; padding: 12px; background: #29292c; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f5f5f7; font-size: 14px;"></select>
                </div>

                <div style="display: flex; justify-content: center; gap: 10px; margin: 20px 0; direction: ltr;">
                    <input type="password" maxlength="1" class="pin-input" id="pin1" style="width: 45px; height: 50px; border-radius: 8px; border: 1px solid rgba(212,175,55,0.3); background: #29292c; color: #d4af37; font-size: 22px; text-align: center;">
                    <input type="password" maxlength="1" class="pin-input" id="pin2" style="width: 45px; height: 50px; border-radius: 8px; border: 1px solid rgba(212,175,55,0.3); background: #29292c; color: #d4af37; font-size: 22px; text-align: center;">
                    <input type="password" maxlength="1" class="pin-input" id="pin3" style="width: 45px; height: 50px; border-radius: 8px; border: 1px solid rgba(212,175,55,0.3); background: #29292c; color: #d4af37; font-size: 22px; text-align: center;">
                    <input type="password" maxlength="1" class="pin-input" id="pin4" style="width: 45px; height: 50px; border-radius: 8px; border: 1px solid rgba(212,175,55,0.3); background: #29292c; color: #d4af37; font-size: 22px; text-align: center;">
                </div>

                <button onclick="verifyPin()" style="width: 100%; padding: 12px; border-radius: 10px; border: none; font-weight: 700; font-size: 14px; background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%); color: #000; cursor: pointer; margin-top: 10px;">
                    فتح الحساب
                </button>

                <p onclick="showWelcomeModal(false)" style="font-size: 12px; color: #d4af37; margin-top: 16px; cursor: pointer;">
                    + إنشاء حساب جديد بكلمة سر خاصة
                </p>
            </div>
        </div>

        <!-- مودال إنشاء حساب جديد وتعيين كلمة السر الشخصية -->
        <div id="modalWelcome" class="modal-overlay" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(10, 10, 10, 0.98); z-index: 3500; display: none; justify-content: center; align-items: center; padding: 20px;">
            <div style="width: 100%; max-width: 380px; background: #1c1c1e; border: 1px solid rgba(212,175,55,0.3); border-radius: 16px; padding: 24px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.8);">
                <div style="width: 70px; height: 70px; border-radius: 50%; background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 30px; color: #000;">
                    <i class="fa-solid fa-user-shield"></i>
                </div>
                <h3 style="margin-bottom: 6px; font-size: 18px; color: #d4af37;">إنشاء حساب جديد بخصوصية</h3>
                <p style="font-size: 12px; color: #a1a1a6; margin-bottom: 16px;">أدخل اسمك وحدد رمز PIN الخاص بك وحدك</p>
                
                <div class="form-group" style="margin-bottom: 14px; text-align: right;">
                    <label style="font-size: 12px; color: #a1a1a6; display: block; margin-bottom: 6px;">اسمك الكريم:</label>
                    <input type="text" id="setupName" class="form-control" placeholder="مثال: مصطفى ياسر" style="width: 100%; padding: 12px; background: #29292c; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f5f5f7;">
                </div>
                
                <div class="form-group" style="margin-bottom: 16px; text-align: right;">
                    <label style="font-size: 12px; color: #a1a1a6; display: block; margin-bottom: 6px;">حدد كلمة السر (رمز PIN من 4 أرقام):</label>
                    <input type="password" id="setupPin" maxlength="4" class="form-control" placeholder="****" style="width: 100%; padding: 12px; background: #29292c; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #f5f5f7; text-align: center; font-size: 18px; letter-spacing: 5px;">
                </div>

                <button class="btn btn-gold" onclick="completeFirstSetup()" style="width: 100%; padding: 12px; border-radius: 10px; border: none; font-weight: 700; background: linear-gradient(135deg, #d4af37 0%, #aa7c11 100%); color: #000; cursor: pointer;">
                    حفظ البدء والحماية
                </button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', overlayHtml);
    setupPinInputs();
}

function setupPinInputs() {
    const inputs = document.querySelectorAll('.pin-input');
    inputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
    });
}

function renderUserDropdown() {
    const select = document.getElementById('userSelect');
    if (!select) return;
    select.innerHTML = users.map(u => `<option value="${u.id}">${u.name}</option>`).join('');
    if (activeUserId) select.value = activeUserId;
}

function onUserSelectChange() {
    activeUserId = document.getElementById('userSelect').value;
}

function verifyPin() {
    const pinEntered = Array.from(document.querySelectorAll('.pin-input')).map(i => i.value).join('');
    const user = users.find(u => u.id === activeUserId);
    
    if (user && user.pin === pinEntered) {
        currentUser = user;
        localStorage.setItem('hh_active_user', currentUser.id);
        document.getElementById('authOverlay').style.display = 'none';
        clearPinInputs();
        loadUserData();
    } else {
        alert('كلمة السر غير صحيحة! تأكد من إدخال الرمز السري الخاص بك.');
        clearPinInputs();
    }
}

function clearPinInputs() {
    document.querySelectorAll('.pin-input').forEach(i => i.value = '');
    const firstPin = document.getElementById('pin1');
    if (firstPin) firstPin.focus();
}

function lockApp() {
    currentUser = null;
    document.getElementById('authOverlay').style.display = 'flex';
    renderUserDropdown();
    clearPinInputs();
}

function checkAuth() {
    document.getElementById('authOverlay').style.display = 'flex';
}

function showWelcomeModal(isFirst) {
    document.getElementById('modalWelcome').style.display = 'flex';
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay && isFirst) authOverlay.style.display = 'none';
}

function completeFirstSetup() {
    const name = document.getElementById('setupName').value.trim();
    const pin = document.getElementById('setupPin').value.trim();

    if (!name || pin.length !== 4) {
        return alert('يرجى كتابة اسمك وتحديد رمز PIN سري مكون من 4 أرقام بالضبط');
    }

    const newUser = {
        id: 'usr_' + Date.now(),
        name,
        pin,
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

    document.getElementById('modalWelcome').style.display = 'none';
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay) authOverlay.style.display = 'none';

    loadUserData();
    alert(`أهلاً بك يا ${name}! تم إنشاء حسابك وحمايته بكلمة سر خاصة بك.`);
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
