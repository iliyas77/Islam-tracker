/* ============================================================
   Nur Prayer — Digital Tasbeeh: Old View Module
   Path: features/tasbeeh/tasbeeh-old.js
   Handles:
     - Old Tasbeeh period settings & local storage persistence
     - Sequential monthly clearance (jumps back month-by-month till start date)
     - Old tab rendering (Month banner, step-by-step progress, TO DO & COMPLETED groups)
     - Old item interactions (edit count, toggle completed, open counter for old month)
     - Period settings modal (presets, start date & end date picker, timeline preview)
   ============================================================ */
'use strict';

window.TasbeehOldApp = (function () {
    /* ---------- Constants ---------- */
    var PERIOD_KEY = 'app_tasbeeh_period';

    /* ---------- State ---------- */
    var currentOldMonthKey = null; // Currently active / displayed old month
    var periodModalInstance = null;

    /* ---------- Data Access Bridges ---------- */
    function getItems() {
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getItems === 'function') {
            return window.TasbeehCurrentApp.getItems();
        }
        return [];
    }

    function persistItems() {
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.persist === 'function') {
            window.TasbeehCurrentApp.persist();
        }
    }

    /* ---------- Period Storage Layer ---------- */
    function loadPeriod() {
        var raw = localStorage.getItem(PERIOD_KEY);
        var now = new Date();
        var defaultStart = now.getFullYear() + '-01-01';
        var defaultEnd = td();

        if (!raw) {
            var initial = { startDate: defaultStart, endDate: defaultEnd, completedMonths: [], updatedAt: Date.now() };
            try { localStorage.setItem(PERIOD_KEY, JSON.stringify(initial)); } catch (_) {}
            return initial;
        }
        try {
            var p = JSON.parse(raw);
            if (!p || !p.startDate) {
                return { startDate: defaultStart, endDate: defaultEnd, completedMonths: [], updatedAt: Date.now() };
            }
            return {
                startDate: p.startDate || defaultStart,
                endDate: p.endDate || defaultEnd,
                completedMonths: Array.isArray(p.completedMonths) ? p.completedMonths : [],
                updatedAt: p.updatedAt || Date.now()
            };
        } catch (_) {
            return { startDate: defaultStart, endDate: defaultEnd, completedMonths: [], updatedAt: Date.now() };
        }
    }

    function savePeriod(start, end, completedMonths) {
        var cur = loadPeriod();
        var p = {
            startDate: start,
            endDate: end,
            completedMonths: Array.isArray(completedMonths) ? completedMonths : (cur.completedMonths || []),
            updatedAt: Date.now()
        };
        try { localStorage.setItem(PERIOD_KEY, JSON.stringify(p)); } catch (_) {}
        return p;
    }

    /* ---------- Old Tracking Month Selection Logic ---------- */
    function getUncompletedOldMonths() {
        var period = loadPeriod();
        var allOldMonths = getPreviousMonthsList(period.startDate, period.endDate);
        var completed = period.completedMonths || [];
        return allOldMonths.filter(function (mKey) {
            return completed.indexOf(mKey) === -1;
        });
    }

    function getCurrentOldMonth() {
        var period = loadPeriod();
        var allOldMonths = getPreviousMonthsList(period.startDate, period.endDate);
        if (allOldMonths.length === 0) return null;

        var uncompleted = getUncompletedOldMonths();

        // Strictly sequential: locks to the active month until completed, then automatically jumps to the previous month
        if (uncompleted.length > 0) {
            currentOldMonthKey = uncompleted[0];
            return currentOldMonthKey;
        }

        currentOldMonthKey = null;
        return null; // All months completed
    }

    function checkAndAdvanceMonth(mKey) {
        if (!mKey) return;
        var items = getItems();
        var finiteItems = items.filter(function (it) { return it.targetCount !== 'infinite'; });
        if (finiteItems.length === 0) return;
        var allDone = finiteItems.every(function (it) {
            var target = it.targetCount * it.targetCycles;
            var cur = (it.monthlyHistory && it.monthlyHistory[mKey]) || 0;
            return cur >= target;
        });
        if (allDone) {
            var period = loadPeriod();
            var completed = period.completedMonths || [];
            if (completed.indexOf(mKey) === -1) {
                completed.push(mKey);
                savePeriod(period.startDate, period.endDate, completed);
                currentOldMonthKey = null;
                var monthName = formatMonthLabel(mKey);
                var nextM = getCurrentOldMonth();
                if (nextM) {
                    showToast('🎉 ' + monthName + ' completed! Advanced to ' + formatMonthLabel(nextM), 3000);
                } else {
                    showToast('🎉 ' + monthName + ' completed! All months cleared!', 3500);
                }
            }
        }
    }

    function markMonthCompleted(mKey) {
        var period = loadPeriod();
        var curM = mKey || getCurrentOldMonth();
        if (!curM) return;
        var monthName = formatMonthLabel(curM);

        var completed = period.completedMonths || [];
        if (completed.indexOf(curM) === -1) {
            completed.push(curM);
        }

        var items = getItems();
        // Fill counts to target for finite dhikrs in this month
        items.forEach(function (it) {
            if (it.targetCount !== 'infinite') {
                var target = it.targetCount * it.targetCycles;
                var cur = (it.monthlyHistory && it.monthlyHistory[curM]) || 0;
                if (cur < target) {
                    it.monthlyHistory = it.monthlyHistory || {};
                    it.monthlyHistory[curM] = target;
                }
            }
        });

        savePeriod(period.startDate, period.endDate, completed);
        persistItems();

        // Advance to next uncompleted month
        currentOldMonthKey = null;
        var nextM = getCurrentOldMonth();

        if (nextM) {
            showToast('🎉 ' + monthName + ' completed! Advanced to ' + formatMonthLabel(nextM), 3000);
        } else {
            showToast('🎉 ' + monthName + ' completed! All months cleared!', 3500);
        }

        renderOldTab();
    }

    function reopenLastMonth() {
        var period = loadPeriod();
        var completed = period.completedMonths || [];
        if (completed.length === 0) return;

        var last = completed.pop();
        savePeriod(period.startDate, period.endDate, completed);
        currentOldMonthKey = last;
        showToast('Reopened ' + formatMonthLabel(last));
        renderOldTab();
    }

    function resetAllCompleted() {
        if (!confirm('Reset all completed months for Old Tasbeeh tracking?')) return;
        var period = loadPeriod();
        savePeriod(period.startDate, period.endDate, []);
        currentOldMonthKey = null;
        showToast('Reset completed months');
        renderOldTab();
    }

    function openCounterOld(id, monthKey) {
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.openCounterOld === 'function') {
            window.TasbeehCurrentApp.openCounterOld(id, monthKey);
        }
    }

    /* ---------- Old Card HTML Generator ---------- */
    function renderOldCardHtml(item, isDhikrDone, curOldMonth, monthName) {
        var isInfinite = item.targetCount === 'infinite';
        var countInMonth = (item.monthlyHistory && item.monthlyHistory[curOldMonth]) || 0;
        var targetTotal = isInfinite ? '∞' : (item.targetCount * item.targetCycles);

        var metaLine = isInfinite
            ? 'Target: ∞ · Recited in ' + monthName + ': <strong>' + countInMonth.toLocaleString() + '</strong>'
            : 'Target: ' + item.targetCount + ' · Cycles: ' + item.targetCycles + ' · Done: <strong>' + countInMonth.toLocaleString() + '</strong>/' + targetTotal;

        return '<div class="tb-card p-3 shadow-sm ' + (isDhikrDone ? 'tb-card-done' : '') + '" data-id="' + item.id + '" data-month="' + curOldMonth + '" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
            '<div class="d-flex align-items-center gap-3">' +
            '<div class="tb-badge ' + (isDhikrDone ? 'bg-success-subtle text-success' : '') + '">' +
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="100%" height="100%">' +
            '  <rect width="200" height="200" fill="#E6F3EA" rx="24"/>' +
            '  <g transform="translate(100, 85)">' +
            '    <defs>' +
            '      <circle id="bead" cx="0" cy="-55" r="12" stroke="#178B51" stroke-width="9" fill="none"/>' +
            '    </defs>' +
            '    <circle cx="0" cy="-55" r="16" fill="#178B51"/>' +
            '    <use href="#bead" transform="rotate(30)"/>' +
            '    <use href="#bead" transform="rotate(60)"/>' +
            '    <use href="#bead" transform="rotate(90)"/>' +
            '    <use href="#bead" transform="rotate(120)"/>' +
            '    <use href="#bead" transform="rotate(150)"/>' +
            '    <use href="#bead" transform="rotate(180)"/>' +
            '    <use href="#bead" transform="rotate(210)"/>' +
            '    <use href="#bead" transform="rotate(240)"/>' +
            '    <use href="#bead" transform="rotate(270)"/>' +
            '    <use href="#bead" transform="rotate(300)"/>' +
            '    <use href="#bead" transform="rotate(330)"/>' +
            '  </g>' +
            '  <g>' +
            '    <path d="M 94 154 L 106 154 L 103 162 L 97 162 Z" fill="#178B51"/>' +
            '    <g stroke="#178B51" stroke-linecap="round" fill="none">' +
            '      <path d="M 97 161 Q 93 172 91 185" stroke-width="4.5"/>' +
            '      <path d="M 100 162 L 100 188" stroke-width="4.5"/>' +
            '      <path d="M 103 161 Q 107 172 109 185" stroke-width="4.5"/>' +
            '    </g>' +
            '  </g>' +
            '</svg>' +
            '</div>' +
            '<div class="flex-grow-1 min-w-0">' +
            '<div class="d-flex align-items-center justify-content-between gap-2">' +
            '<h6 class="fw-bold mb-0 text-truncate text-gr1">' + escHtml(item.title) + '</h6>' +
            (isDhikrDone ? '<span class="badge-pill-custom badge-done py-1 px-2 fs-xs flex-shrink-0"><i class="fa-solid fa-check me-1"></i>Completed</span>' : '') +
            '</div>' +
            '<div class="tb-meta mt-1">' + metaLine + '</div>' +
            '</div>' +
            '</div>' +
            '</div>';
    }

    /* ---------- Rendering: Old Tab (Single Active Previous Month) ---------- */
    function renderOldTab() {
        var oldBody = getEl('tbOldBody');
        if (!oldBody) return;

        var period = loadPeriod();
        var allOldMonths = getPreviousMonthsList(period.startDate, period.endDate);
        var items = getItems();

        if (allOldMonths.length === 0) {
            var curMonthName = formatMonthLabel(getCurrentMonthKey());
            oldBody.innerHTML =
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white">' +
                '<div class="mb-3">' +
                '<i class="fa-regular fa-calendar-xmark display-4 text-warning opacity-75"></i>' +
                '</div>' +
                '<h5 class="fw-bold text-gr1 mb-2">No Previous Months in Period</h5>' +
                '<p class="text-muted small mb-3">' +
                'Your tracking start date is <strong>' + formatDate(period.startDate) + '</strong>, which falls in the current month (' + curMonthName + ').<br>' +
                'The Old tab displays previous completed months prior to <strong>' + curMonthName + '</strong>.' +
                '</p>' +
                '<button type="button" class="btn btn-brand px-4 py-2 rounded-3 fw-bold mx-auto" data-act="tb-open-settings">' +
                '<i class="fa-solid fa-calendar-days me-2"></i>Adjust Start Date' +
                '</button>' +
                '</div>';
            return;
        }

        var curOldMonth = getCurrentOldMonth();

        // If all previous months in period are completed!
        if (!curOldMonth) {
            var subAll = getEl('tbHeaderSub');
            if (subAll) subAll.textContent = 'All Completed';
            oldBody.innerHTML =
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white">' +
                '<div class="mb-3">' +
                '<i class="fa-solid fa-circle-check display-4 text-success"></i>' +
                '</div>' +
                '<h5 class="fw-bold text-gr1 mb-2">All Previous Months Completed!</h5>' +
                '<p class="text-muted small mb-3">' +
                'All previous months up to the current month have been completed.' +
                '</p>' +
                '<div class="d-flex justify-content-center gap-2">' +
                '<button type="button" class="btn btn-outline-brand rounded-pill px-4 py-2 fw-bold" data-act="tb-old-reopen">' +
                '<i class="fa-solid fa-rotate-left me-1"></i>Reopen Last Month' +
                '</button>' +
                '<button type="button" class="btn btn-light border rounded-pill px-3 py-2 text-muted small" data-act="tb-reset-all-completed">' +
                '<i class="fa-solid fa-arrows-rotate me-1"></i>Reset Completed' +
                '</button>' +
                '</div>' +
                '</div>';
            return;
        }

        var monthName = formatMonthLabel(curOldMonth);

        // Header subtitle update: shows present active month under Old
        var sub = getEl('tbHeaderSub');
        if (sub) {
            sub.textContent = monthName;
        }

        // Partition items into To Do and Completed for this active old month
        var todoOldItems = [];
        var doneOldItems = [];

        items.forEach(function (item) {
            var isInfinite = item.targetCount === 'infinite';
            var countInMonth = (item.monthlyHistory && item.monthlyHistory[curOldMonth]) || 0;
            var targetTotal = isInfinite ? null : (item.targetCount * item.targetCycles);
            var isDhikrDone = targetTotal !== null && countInMonth >= targetTotal;
            if (isDhikrDone) {
                doneOldItems.push(item);
            } else {
                todoOldItems.push(item);
            }
        });

        var todoOldCardsHtml = todoOldItems.length > 0
            ? todoOldItems.map(function (it) { return renderOldCardHtml(it, false, curOldMonth, monthName); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<i class="fa-solid fa-circle-check text-success fs-3 mb-2"></i>' +
              '<div class="fw-bold text-gr1">All Dhikrs for ' + monthName + ' Completed!</div>' +
              '</div>';

        var doneOldCardsHtml = doneOldItems.length > 0
            ? doneOldItems.map(function (it) { return renderOldCardHtml(it, true, curOldMonth, monthName); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<div class="text-muted small">No completed Dhikrs for ' + monthName + ' yet. Completed chants will appear here.</div>' +
              '</div>';

        oldBody.innerHTML =
            '<!-- TO DO GROUP (OLD) -->' +
            '<section class="prayer-group mb-3">' +
            '<button type="button" class="group-toggle py-1 d-flex align-items-center gap-2" data-bs-toggle="collapse" data-bs-target="#tbOldTodoList" aria-expanded="true">' +
            '<span class="toggle-icon">▼</span>' +
            '<span class="section-title text-gr1 fw-bold">TO DO</span>' +
            '<span class="badge rounded-pill bg-light text-muted border small px-2 py-1">' + todoOldItems.length + '</span>' +
            '</button>' +
            '<div class="collapse show" id="tbOldTodoList">' +
            '<div class="d-flex flex-column gap-3 mt-2">' +
            todoOldCardsHtml +
            '</div>' +
            '</div>' +
            '</section>' +

            '<!-- COMPLETED GROUP (OLD) -->' +
            '<section class="prayer-group mb-3">' +
            '<button type="button" class="group-toggle py-1 d-flex align-items-center gap-2" data-bs-toggle="collapse" data-bs-target="#tbOldDoneList" aria-expanded="true">' +
            '<span class="toggle-icon">▼</span>' +
            '<span class="section-title text-success fw-bold">COMPLETED</span>' +
            '<span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle small px-2 py-1">' + doneOldItems.length + '</span>' +
            '</button>' +
            '<div class="collapse show" id="tbOldDoneList">' +
            '<div class="d-flex flex-column gap-3 mt-2">' +
            doneOldCardsHtml +
            '</div>' +
            '</div>' +
            '</section>';
    }

    /* ---------- Period Settings Modal Management ---------- */
    function updatePeriodPreview() {
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        var previewText = getEl('tbPeriodPreviewText');
        if (!startInp || !endInp || !previewText) return;

        var startVal = startInp.value;
        var endVal = endInp.value || td();

        if (!startVal) {
            previewText.innerHTML = '<span class="text-danger">Please pick a Start Date.</span>';
            return;
        }

        var prevEnd = getPreviousMonthEnd();
        var curMonthName = formatMonthLabel(getCurrentMonthKey());
        var oldMonths = getPreviousMonthsList(startVal, endVal);

        if (oldMonths.length === 0) {
            previewText.innerHTML =
                '<div><strong>Current Month:</strong> ' + curMonthName + '</div>' +
                '<div class="text-warning mt-1"><i class="fa-solid fa-triangle-exclamation me-1"></i>Start Date is in current month. No previous months will show in Old tab.</div>';
        } else {
            var newestOldMonth = formatMonthLabel(oldMonths[0]);
            var oldestMonth = formatMonthLabel(oldMonths[oldMonths.length - 1]);
            previewText.innerHTML =
                '<div class="mb-1"><strong>Old Tab Timeline:</strong> ' + formatDate(startVal) + ' → ' + formatDate(prevEnd) + '</div>' +
                '<div class="mb-1"><strong>Step-by-Step:</strong> Starts at <strong>' + newestOldMonth + '</strong>, then jumps back month by month till <strong>' + oldestMonth + '</strong> (' + oldMonths.length + ' total months).</div>' +
                '<div><strong>Current Tab:</strong> ' + curMonthName + '</div>';
        }
    }

    function openPeriodModal() {
        var p = loadPeriod();
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (startInp) startInp.value = p.startDate || '';
        if (endInp) endInp.value = p.endDate || td();

        updatePeriodPreview();

        var modalEl = getEl('tasbeehPeriodModal');
        if (modalEl) {
            if (!periodModalInstance) {
                periodModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            }
            periodModalInstance.show();
        }
    }

    function savePeriodModal() {
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (!startInp) return;

        var startVal = startInp.value;
        var endVal = (endInp && endInp.value) ? endInp.value : td();

        if (!startVal) {
            alert('Please select a Start Date.');
            startInp.focus();
            return;
        }

        if (endVal && endVal < startVal) {
            alert('End Date must be on or after Start Date.');
            if (endInp) endInp.focus();
            return;
        }

        var cur = loadPeriod();
        savePeriod(startVal, endVal, cur.completedMonths || []);

        if (periodModalInstance) {
            periodModalInstance.hide();
        }

        currentOldMonthKey = null;
        showToast('Tasbeeh period updated');
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab('old');
        } else {
            renderOldTab();
        }
    }

    function resetPeriodModal() {
        var now = new Date();
        var defaultStart = now.getFullYear() + '-01-01';
        var defaultEnd = td();

        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (startInp) startInp.value = defaultStart;
        if (endInp) endInp.value = defaultEnd;

        savePeriod(defaultStart, defaultEnd, []);
        updatePeriodPreview();

        if (periodModalInstance) {
            periodModalInstance.hide();
        }

        currentOldMonthKey = null;
        showToast('Period reset to current year');
        if (window.TasbeehApp && typeof window.TasbeehApp.switchTab === 'function') {
            window.TasbeehApp.switchTab('old');
        } else {
            renderOldTab();
        }
    }

    function setPeriodPreset(type) {
        var now = new Date();
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (!startInp || !endInp) return;

        var startStr = '';
        var endStr = td();

        if (type === 'this-year') {
            startStr = now.getFullYear() + '-01-01';
        } else if (type === '6-months') {
            var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
        } else if (type === '1-year') {
            var d12 = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            startStr = d12.getFullYear() + '-' + pad2(d12.getMonth() + 1) + '-01';
        }

        startInp.value = startStr;
        endInp.value = endStr;
        updatePeriodPreview();
    }

    /* ---------- Event Bindings ---------- */
    function bindEvents() {
        /* Period Settings Modal button in header */
        var settingsBtn = getEl('tbSettingsBtn');
        if (settingsBtn) {
            settingsBtn.onclick = openPeriodModal;
        }

        /* Period Modal controls */
        var btnSavePeriod = getEl('tbBtnSavePeriod');
        if (btnSavePeriod) {
            btnSavePeriod.onclick = savePeriodModal;
        }

        var btnResetPeriod = getEl('tbBtnResetPeriod');
        if (btnResetPeriod) {
            btnResetPeriod.onclick = resetPeriodModal;
        }

        var presetThisYear = getEl('tbPresetThisYear');
        if (presetThisYear) {
            presetThisYear.onclick = function () { setPeriodPreset('this-year'); };
        }

        var preset6M = getEl('tbPreset6Months');
        if (preset6M) {
            preset6M.onclick = function () { setPeriodPreset('6-months'); };
        }

        var preset1Y = getEl('tbPreset1Year');
        if (preset1Y) {
            preset1Y.onclick = function () { setPeriodPreset('1-year'); };
        }

        var pStart = getEl('tbPeriodStart');
        var pEnd = getEl('tbPeriodEnd');
        if (pStart) pStart.oninput = updatePeriodPreview;
        if (pEnd) pEnd.oninput = updatePeriodPreview;

        /* Old tab delegations */
        var oldBody = getEl('tbOldBody');
        if (oldBody) {
            oldBody.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                if (btn) {
                    var act = btn.dataset.act;
                    if (act === 'tb-old-reopen') {
                        reopenLastMonth();
                    } else if (act === 'tb-reset-all-completed') {
                        resetAllCompleted();
                    } else if (act === 'tb-open-settings' || act === 'tb-change-period') {
                        openPeriodModal();
                    }
                    return;
                }

                var card = e.target.closest('.tb-card[data-id]');
                if (card) {
                    var id = card.dataset.id;
                    var mKey = card.dataset.month;
                    openCounterOld(id, mKey);
                }
            };

            oldBody.onkeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    var btn = e.target.closest('button[data-act]');
                    if (btn) return;
                    var card = e.target.closest('.tb-card[data-id]');
                    if (card) {
                        e.preventDefault();
                        var id = card.dataset.id;
                        var mKey = card.dataset.month;
                        openCounterOld(id, mKey);
                    }
                }
            };
        }
    }

    /* ---------- Public API ---------- */
    function init() {
        loadPeriod();
        bindEvents();
    }

    var api = {
        init: init,
        renderOldTab: renderOldTab,
        getCurrentOldMonth: getCurrentOldMonth,
        checkAndAdvanceMonth: checkAndAdvanceMonth,
        markMonthCompleted: markMonthCompleted,
        markCurrentMonthCompleted: markMonthCompleted,
        reopenLastMonth: reopenLastMonth,
        resetAllCompleted: resetAllCompleted,
        openPeriodModal: openPeriodModal,
        savePeriodModal: savePeriodModal,
        resetPeriodModal: resetPeriodModal,
        loadPeriod: loadPeriod,
        savePeriod: savePeriod
    };

    // Bridge Old methods onto window.TasbeehApp for full backwards compatibility
    if (window.TasbeehApp) {
        window.TasbeehApp.openPeriodModal = openPeriodModal;
        window.TasbeehApp.checkAndAdvanceMonth = checkAndAdvanceMonth;
        window.TasbeehApp.markCurrentMonthCompleted = markMonthCompleted;
        window.TasbeehApp.reopenLastMonth = reopenLastMonth;
        window.TasbeehApp.resetAllCompleted = resetAllCompleted;
        window.TasbeehApp.getCurrentOldMonth = getCurrentOldMonth;
        window.TasbeehApp.loadPeriod = loadPeriod;
        window.TasbeehApp.savePeriod = savePeriod;
        window.TasbeehApp.renderOldTab = renderOldTab;
    }

    return api;
})();
