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
    }
};
