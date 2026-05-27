const payments = {
    async renderPricing(container) {
        ui.showLoading(container);
        try {
            const data = await api.call('/transactions/pricing');
            const rows = data.data || [];
            container.innerHTML = `
            <div class="card">
                <div class="card-header"><div class="card-title">Pricing Rules (${rows.length})</div></div>
                <div class="table-wrapper">
                    <table class="fly-table">
                        <thead><tr><th>Name</th><th>Scope</th><th>Rate ($)</th><th>Margin (%)</th><th>Status</th></tr></thead>
                        <tbody>
                            ${rows.map(r => `
                            <tr>
                                <td>${ui.escapeHtml(r.name)}</td>
                                <td><span class="badge badge-primary">${r.scope}</span></td>
                                <td>$${parseFloat(r.rate||0).toFixed(4)}</td>
                                <td>${r.profit_margin}%</td>
                                <td><span class="badge ${r.is_active ? 'badge-success' : 'badge-secondary'}">${r.is_active ? 'Active' : 'Inactive'}</span></td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } catch (err) { ui.renderError(container, err.message); }
    },

    async renderTransactions(container) {
        ui.showLoading(container);
        try {
            const data = await api.call('/transactions/ledger');
            const rows = data.data || [];
            container.innerHTML = `
            <div class="card">
                <div class="card-header"><div class="card-title">Transaction Ledger</div></div>
                <div class="table-wrapper">
                    <table class="fly-table">
                        <thead><tr><th>User</th><th>Type</th><th>Amount</th><th>Before</th><th>After</th><th>Date</th></tr></thead>
                        <tbody>
                            ${rows.map(t => `
                            <tr>
                                <td>${ui.escapeHtml(t.username)}</td>
                                <td><span class="badge">${t.tx_type}</span></td>
                                <td style="color:${t.amount>=0?'#16a34a':'#ef4444'}">$${Math.abs(t.amount).toFixed(4)}</td>
                                <td>$${(t.balance_before||0).toFixed(4)}</td>
                                <td>$${(t.balance_after||0).toFixed(4)}</td>
                                <td>${ui.formatDate(t.created_at)}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>
            </div>`;
        } catch (err) { ui.renderError(container, err.message); }
    },

    async renderPayouts(container) {
        ui.showLoading(container);
        const role = auth.getUser()?.role || 'user';
        const load = async () => {
            try {
                const data = await api.call('/transactions/payouts');
                const rows = data.data || [];
                container.innerHTML = `
                <div class="card">
                    <div class="card-header">
                        <div class="card-title">Payout Management</div>
                        ${role !== 'admin' ? `<button class="fly-btn fly-btn-sm" id="req-payout-btn">${ICONS.plus} Request Payout</button>` : ''}
                    </div>
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr>${role === 'admin' ? '<th>User</th>' : ''}<th>Amount</th><th>Method</th><th>Status</th><th>Date</th>${role === 'admin' ? '<th>Actions</th>' : ''}</tr></thead>
                            <tbody>
                                ${rows.map(p => `
                                <tr>
                                    ${role === 'admin' ? `<td style="font-weight:600">${ui.escapeHtml(p.username)}</td>` : ''}
                                    <td style="font-weight:700">$${p.amount.toFixed(2)}</td>
                                    <td>${p.method.toUpperCase()}</td>
                                    <td><span class="badge ${p.status==='pending'?'badge-warning':p.status==='approved'?'badge-success':'badge-danger'}">${p.status}</span></td>
                                    <td>${ui.formatDate(p.created_at)}</td>
                                    ${role === 'admin' ? `
                                    <td class="actions-cell">
                                        ${p.status === 'pending' ? `
                                            <button class="action-btn" onclick="payments.reviewPayout('${p.id}', 'approved')">Approve</button>
                                            <button class="action-btn delete" onclick="payments.reviewPayout('${p.id}', 'rejected')">Reject</button>
                                        ` : '—'}
                                    </td>` : ''}
                                </tr>`).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>`;
                document.getElementById('req-payout-btn')?.addEventListener('click', () => this.showPayoutModal(load));
            } catch (err) { ui.renderError(container, err.message); }
        };
        await load();
    },

    showPayoutModal(reload) {
        const root = document.getElementById('modal-root');
        root.innerHTML = `
        <div class="modal-overlay" id="payout-overlay">
            <div class="modal" style="max-width:400px">
                <div class="modal-header"><div class="modal-title">Request Payout</div><button class="modal-close" id="close-payout">${ICONS.x}</button></div>
                <div class="modal-body">
                    <div class="form-group"><label>Amount ($) *</label><input type="number" step="0.01" class="fly-input" id="payout-amount"></div>
                    <div class="form-group"><label>Method *</label>
                        <select class="fly-input" id="payout-method">
                            <option value="binance_uid">Binance UID</option>
                            <option value="usdt_trc20">USDT TRC20</option>
                        </select>
                    </div>
                    <div class="form-group"><label>Payment Detail *</label><input type="text" class="fly-input" id="payout-detail" placeholder="UID or Address"></div>
                </div>
                <div class="modal-footer">
                    <button class="fly-btn fly-btn-secondary" id="cancel-payout">Cancel</button>
                    <button class="fly-btn" id="do-payout">Submit Request</button>
                </div>
            </div>
        </div>`;
        const close = () => root.innerHTML = '';
        document.getElementById('close-payout').onclick = close;
        document.getElementById('cancel-payout').onclick = close;
        document.getElementById('do-payout').onclick = async () => {
            const body = { amount: parseFloat(document.getElementById('payout-amount').value), method: document.getElementById('payout-method').value, detail: document.getElementById('payout-detail').value.trim() };
            if (!body.amount || !body.detail) return ui.showToast('All fields required', 'error');
            try {
                await api.call('/transactions/payouts', { method: 'POST', body: JSON.stringify(body) });
                ui.showToast('Payout request submitted', 'success'); close(); reload();
            } catch (err) { ui.showToast(err.message, 'error'); }
        };
    },

    async reviewPayout(id, status) {
        let reason = null;
        if (status === 'rejected') {
            reason = prompt('Enter rejection reason:');
            if (reason === null) return;
        }
        try {
            await api.call(`/transactions/payouts/${id}/review`, { method: 'POST', body: JSON.stringify({ status, reason }) });
            ui.showToast(`Payout ${status}`, 'success');
            app.renderCurrentPage();
        } catch (err) { ui.showToast(err.message, 'error'); }
    }
};
