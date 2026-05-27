const sms = {
    async renderReports(container) {
        ui.showLoading(container);
        let page = 1;
        const load = async () => {
            try {
                const data = await api.call(`/sms?page=${page}&limit=20`);
                const rows = data.data || [];
                const pg = data.pagination;
                container.innerHTML = `
                <div class="card">
                    <div class="card-header"><div class="card-title">SMS Reports (${pg.total})</div></div>
                    <div class="filter-bar">
                        <input type="text" class="search-input" placeholder="Search by number, service..." id="sms-search">
                        <select class="filter-select" id="sms-otp-filter"><option value="">All SMS</option><option value="true">With OTP only</option><option value="false">Without OTP</option></select>
                    </div>
                    <div class="table-wrapper">
                        <table class="fly-table">
                            <thead><tr><th>Number</th><th>Service (Sender)</th><th>Recipient</th><th>OTP</th><th>Country</th><th>Message</th><th>Received</th></tr></thead>
                            <tbody id="sms-tbody">
                                ${rows.map(s => this.renderRow(s)).join('')}
                                ${!rows.length ? '<tr class="empty-row"><td colspan="7">No SMS found</td></tr>' : ''}
                            </tbody>
                        </table>
                    </div>
                    ${this.renderPagination(pg)}
                </div>`;

                this.initEvents(load);
            } catch (err) {
                ui.renderError(container, err.message);
            }
        };
        await load();
    },

    renderRow(s) {
        return `
        <tr>
            <td><code style="font-size:12px">${s.number}</code></td>
            <td>${s.service ? `<span class="badge badge-primary">${s.service}</span>` : (s.sender ? `<span class="badge badge-secondary">${ui.escapeHtml(s.sender)}</span>` : '<span style="color:#9ca3af">N/A</span>')}</td>
            <td>${s.recipient || '<span style="color:#9ca3af">-</span>'}</td>
            <td>${s.otp ? `<span class="otp-code">${s.otp}</span>` : '-'}</td>
            <td>${s.country || '-'}</td>
            <td class="message-text" title="${ui.escapeHtml(s.message)}">${ui.escapeHtml(s.message)}</td>
            <td style="font-size:12px;color:#6B7280">${ui.formatDate(s.received_at)}</td>
        </tr>`;
    },

    initEvents(load) {
        document.getElementById('sms-search')?.addEventListener('input', this.debounce(async (e) => {
            const q = e.target.value;
            const data = await api.call(`/sms?number=${encodeURIComponent(q)}&limit=50`);
            const tbody = document.getElementById('sms-tbody');
            if (tbody) {
                tbody.innerHTML = data.data.map(s => this.renderRow(s)).join('');
            }
        }, 300));

        document.getElementById('sms-otp-filter')?.addEventListener('change', async (e) => {
            const val = e.target.value;
            const data = await api.call(`/sms?hasOtp=${val}&limit=20`);
            const tbody = document.getElementById('sms-tbody');
            if (tbody) {
                tbody.innerHTML = data.data.map(s => this.renderRow(s)).join('');
            }
        });
    },

    renderPagination(pg) {
        if (!pg || pg.totalPages <= 1) return '';
        // Simplified for brevity, same logic as app.js
        return `<div class="pagination"><div class="pagination-info">Page ${pg.page} of ${pg.totalPages}</div></div>`;
    },

    debounce(fn, delay) {
        let timer;
        return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), delay); };
    }
};
