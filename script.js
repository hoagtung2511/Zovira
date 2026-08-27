// Trạng thái ứng dụng giả lập (Demo State)
let state = {
    user: null,
    balances: {
        USDT: 100.00,
        BTC: 0.00,
        ETH: 0.00,
        BNB: 0.00,
        SOL: 0.00
    },
    orders: [],
    tradeSide: 'BUY',
    currentPair: 'BTC/USDT'
};

const marketPrices = {
    'BTC/USDT': 64250.00,
    'ETH/USDT': 3450.00,
    'BNB/USDT': 580.00,
    'SOL/USDT': 145.00
};

// Khởi chạy hệ thống tự động tạo ví demo mặc định
window.addEventListener('DOMContentLoaded', () => {
    // Tự động đăng nhập sẵn tài khoản Demo để trải nghiệm ngay lập tức
    state.user = { username: "trader_demo", address: "zvx_demo_" + Math.random().toString(16).substring(2, 14) };
    updateUI();
    showToast("Đã khởi tạo Zovira Demo Wallet với 100 USDT miễn phí!");
});

// Chuyển Tab giao diện
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(`tab-${tabId}`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('text-amber-400');
        btn.classList.add('text-slate-400');
    });
    event.target.classList.remove('text-slate-400');
    event.target.classList.add('text-amber-400');
}

// Cập nhật giao diện toàn cục
function updateUI() {
    if (state.user) {
        document.getElementById('auth-buttons').classList.add('hidden');
        document.getElementById('user-info').classList.remove('hidden');
        document.getElementById('nav-usdt-balance').innerText = state.balances.USDT.toFixed(2);
        document.getElementById('form-usdt-balance').innerText = state.balances.USDT.toFixed(2);
        document.getElementById('wallet-total-usdt').innerText = state.balances.USDT.toFixed(2);
        document.getElementById('dash-total').innerText = state.balances.USDT.toFixed(2);
        document.getElementById('user-wallet-address').innerText = state.user.address;
        document.getElementById('dash-order-count').innerText = state.orders.length;
        renderAssets();
    }
}

// Hiển thị danh sách tài sản ví
function renderAssets() {
    const container = document.getElementById('asset-list-container');
    container.innerHTML = '';
    
    for (let [coin, amount] of Object.entries(state.balances)) {
        container.innerHTML += `
            <div class="bg-darker border border-slate-800 p-4 rounded-xl flex justify-between items-center">
                <div>
                    <span class="font-bold text-amber-400 text-sm">${coin}</span>
                    <p class="text-xs text-slate-500 font-mono">Zovira Sandbox Asset</p>
                </div>
                <span class="font-mono font-bold text-sm text-white">${amount.toFixed(4)}</span>
            </div>
        `;
    }
}

// Đổi cặp giao dịch
function changePair() {
    const pair = document.getElementById('pair-select').value;
    state.currentPair = pair;
    const price = marketPrices[pair];
    document.getElementById('header-price').innerText = `$${price.toLocaleString()}`;
    document.getElementById('order-price').value = price;
}

// Chọn Mua / Bán
function setTradeSide(side) {
    state.tradeSide = side;
    const buyBtn = document.getElementById('btn-side-buy');
    const sellBtn = document.getElementById('btn-side-sell');
    const submitBtn = document.getElementById('submit-order-btn');

    if (side === 'BUY') {
        buyBtn.className = "flex-1 py-1.5 text-xs font-semibold rounded-md transition bg-emerald-600 text-white";
        sellBtn.className = "flex-1 py-1.5 text-xs font-semibold rounded-md transition text-slate-400";
        submitBtn.className = "w-full py-3 rounded-lg font-bold text-sm transition bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg";
        submitBtn.innerText = "BUY (DEMO)";
    } else {
        buyBtn.className = "flex-1 py-1.5 text-xs font-semibold rounded-md transition text-slate-400";
        sellBtn.className = "flex-1 py-1.5 text-xs font-semibold rounded-md transition bg-rose-600 text-white";
        submitBtn.className = "w-full py-3 rounded-lg font-bold text-sm transition bg-rose-600 hover:bg-rose-500 text-white shadow-lg";
        submitBtn.innerText = "SELL (DEMO)";
    }
}

// Xử lý đặt lệnh Trading giả lập
function handlePlaceOrder(e) {
    e.preventDefault();
    const amount = parseFloat(document.getElementById('order-amount').value);
    const price = parseFloat(document.getElementById('order-price').value);
    const type = document.getElementById('order-type').value;

    if (state.tradeSide === 'BUY') {
        let cost = amount * price;
        if (state.balances.USDT < cost) {
            showToast("Số dư USDT Demo không đủ!", "error");
            return;
        }
        state.balances.USDT -= cost;
        const baseCoin = state.currentPair.split('/')[0];
        state.balances[baseCoin] = (state.balances[baseCoin] || 0) + amount;
    } else {
        const baseCoin = state.currentPair.split('/')[0];
        if ((state.balances[baseCoin] || 0) < amount) {
            showToast(`Số dư ${baseCoin} Demo không đủ!`, "error");
            return;
        }
        state.balances[baseCoin] -= amount;
        state.balances.USDT += amount * price;
    }

    // Thêm vào danh sách lệnh mô phỏng
    state.orders.unshift({
        time: new Date().toLocaleTimeString(),
        pair: state.currentPair,
        type: type,
        side: state.tradeSide,
        price: price,
        amount: amount,
        status: 'COMPLETED (DEMO)'
    });

    renderOrdersTable();
    updateUI();
    showToast(`Đã khớp lệnh ${state.tradeSide} thành công (Demo Sandbox)!`);
}

// Render bảng Order
function renderOrdersTable() {
    const tbody = document.getElementById('orders-table-body');
    if (state.orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-slate-500">Chưa có giao dịch mô phỏng nào.</td></tr>`;
        return;
    }
    tbody.innerHTML = '';
    state.orders.forEach(o => {
        const sideColor = o.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400';
        tbody.innerHTML += `
            <tr class="border-b border-slate-800/50 hover:bg-slate-900/40">
                <td class="py-2.5 text-slate-400">${o.time}</td>
                <td class="py-2.5 font-bold">${o.pair}</td>
                <td class="py-2.5 text-slate-300">${o.type}</td>
                <td class="py-2.5 font-bold ${sideColor}">${o.side}</td>
                <td class="py-2.5">$${o.price.toLocaleString()}</td>
                <td class="py-2.5">${o.amount}</td>
                <td class="py-2.5 text-amber-400">${o.status}</td>
            </tr>
        `;
    });
}

// Nạp tiền Demo
function confirmDeposit() {
    const coin = document.getElementById('deposit-coin').value;
    const amount = parseFloat(document.getElementById('deposit-amount').value);
    state.balances[coin] = (state.balances[coin] || 0) + amount;
    updateUI();
    closeModal('deposit-modal');
    showToast(`Đã nạp thành công ${amount} ${coin} (Demo Sandbox)!`);
}

// Rút tiền Demo
function confirmWithdraw() {
    const coin = document.getElementById('withdraw-coin').value;
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    if ((state.balances[coin] || 0) < amount) {
        showToast(`Số dư ${coin} không đủ để rút!`, "error");
        return;
    }
    state.balances[coin] -= amount;
    updateUI();
    closeModal('withdraw-modal');
    showToast(`Đã gửi yêu cầu rút ${amount} ${coin} giả lập thành công!`);
}

// Modal Control
function openModal(id) { document.getElementById(id).classList.remove('hidden'); document.getElementById(id).classList.add('flex'); }
function closeModal(id) { document.getElementById(id).classList.add('hidden'); document.getElementById(id).classList.remove('flex'); }

function openAuthModal(mode) {
    openModal('auth-modal');
    document.getElementById('auth-title').innerText = mode === 'login' ? 'Đăng nhập Zovira' : 'Đăng ký tài khoản Zovira';
}
function closeAuthModal() { closeModal('auth-modal'); }

function handleAuthSubmit(e) {
    e.preventDefault();
    const username = document.getElementById('auth-username').value;
    state.user = { username, address: "zvx_demo_" + Math.random().toString(16).substring(2, 14) };
    closeAuthModal();
    updateUI();
    showToast(`Chào mừng ${username} đến với Zovira Sandbox!`);
}

function logout() {
    state.user = null;
    document.getElementById('user-info').classList.add('hidden');
    document.getElementById('auth-buttons').classList.remove('hidden');
    showToast("Đã đăng xuất khỏi phiên Demo.");
}

function copyAddress() {
    navigator.clipboard.writeText(state.user.address);
    showToast("Đã sao chép địa chỉ ví Demo vào bộ nhớ tạm!");
}

// Toast System
function showToast(msg, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');
    const toastIcon = document.getElementById('toast-icon');

    toastMsg.innerText = msg;
    if (type === 'error') {
        toastIcon.className = "fa-solid fa-circle-exclamation text-rose-400 text-base";
    } else {
        toastIcon.className = "fa-solid fa-circle-check text-emerald-400 text-base";
    }

    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
}
