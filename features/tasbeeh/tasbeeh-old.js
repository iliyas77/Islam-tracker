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

    function prevOldMonth() {
        // Disabled: month progression is strictly sequential
    }

    function nextOldMonth() {
        // Disabled: month progression is strictly sequential
    }

    function markMonthCompleted(mKey) {
        var period = loadPeriod();
        var curM = mKey || getCurrentOldMonth();
        if (!curM) return;
        var monthName = formatMonthLabel(curM);

        if (!confirm('Mark ' + monthName + ' as Completed and jump to the previous month?')) {
            return;
        }

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
            showToast('🎉 ' + monthName + ' completed! Jumped to ' + formatMonthLabel(nextM), 3000);
        } else {
            showToast('🎉 ' + monthName + ' completed! All months till start date cleared!', 3500);
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

    function editOldItemCount(id, monthKey) {
        var items = getItems();
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;

        var cur = (item.monthlyHistory && item.monthlyHistory[monthKey]) || 0;
        var val = prompt('Enter chants for “' + item.title + '” in ' + formatMonthLabel(monthKey) + ':', cur);
        if (val === null) return;

        var num = Math.max(0, parseInt(val, 10) || 0);
        item.monthlyHistory = item.monthlyHistory || {};
        item.monthlyHistory[monthKey] = num;
        item.updatedAt = Date.now();
        persistItems();
        renderOldTab();
        showToast('Updated ' + item.title + ' to ' + num.toLocaleString());
    }

    function toggleOldItemDone(id, monthKey) {
        var items = getItems();
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item || item.targetCount === 'infinite') return;

        var target = item.targetCount * item.targetCycles;
        var cur = (item.monthlyHistory && item.monthlyHistory[monthKey]) || 0;
        item.monthlyHistory = item.monthlyHistory || {};

        if (cur >= target) {
            item.monthlyHistory[monthKey] = 0;
            showToast(item.title + ' marked incomplete for ' + formatMonthLabel(monthKey));
        } else {
            item.monthlyHistory[monthKey] = target;
            showToast(item.title + ' marked complete for ' + formatMonthLabel(monthKey));
        }
        item.updatedAt = Date.now();
        persistItems();
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
        var pct = isInfinite ? 0 : clamp((countInMonth / targetTotal) * 100, 0, 100);

        var metaLine = isInfinite
            ? 'Target: ∞ · Recited in ' + monthName + ': <strong>' + countInMonth.toLocaleString() + '</strong>'
            : 'Target: ' + item.targetCount + ' · Cycles: ' + item.targetCycles + ' · Done: <strong>' + countInMonth.toLocaleString() + '</strong>/' + targetTotal;

        return '<div class="tb-card p-3 shadow-sm ' + (isDhikrDone ? 'tb-card-done' : '') + '" data-id="' + item.id + '">' +
            '<div class="d-flex align-items-center gap-3 mb-2">' +
            '<div class="tb-badge ' + (isDhikrDone ? 'bg-success-subtle text-success' : '') + '">' + (item.icon || '🌿') + '</div>' +
            '<div class="flex-grow-1 min-w-0">' +
            '<div class="d-flex align-items-center justify-content-between">' +
            '<h6 class="fw-bold mb-0 text-truncate text-gr1">' + escHtml(item.title) + '</h6>' +
            (isDhikrDone ? '<span class="badge-pill-custom badge-done py-1 px-2 fs-xs"><i class="fa-solid fa-check me-1"></i>Completed</span>' : '') +
            '</div>' +
            '<div class="tb-meta mt-1">' + metaLine + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="progress progress-thin mb-3">' +
            '<div class="progress-bar ' + (isDhikrDone ? 'bg-success' : '') + '" style="width:' + pct.toFixed(1) + '%"></div>' +
            '</div>' +
            '<div class="d-flex align-items-center gap-2 pt-1 border-top">' +
            '<button type="button" class="btn ' + (isDhikrDone ? 'btn-outline-brand' : 'btn-brand') + ' flex-grow-1 py-2 rounded-3 fw-bold btn-h-42" data-act="tb-open-old" data-id="' + item.id + '" data-month="' + curOldMonth + '">' +
            '<i class="fa-solid fa-play me-2"></i>' + (isDhikrDone ? 'Recount / Add' : 'Open Counter') + '</button>' +
            '<button type="button" class="btn btn-light rounded-3 px-3 py-2 border btn-h-42" data-act="tb-edit-old-item" data-id="' + item.id + '" data-month="' + curOldMonth + '" title="Edit Count">' +
            '<i class="fa-solid fa-pen text-secondary"></i></button>' +
            '<button type="button" class="btn btn-light rounded-3 px-3 py-2 border btn-h-42" data-act="tb-toggle-old-done" data-id="' + item.id + '" data-month="' + curOldMonth + '" title="' + (isDhikrDone ? 'Reset to 0' : 'Mark Completed') + '">' +
            '<i class="fa-solid ' + (isDhikrDone ? 'fa-rotate-left text-warning' : 'fa-check text-success') + '"></i></button>' +
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

        var monthIndex = allOldMonths.indexOf(curOldMonth);
        var totalMonths = allOldMonths.length;
        var monthName = formatMonthLabel(curOldMonth);

        var completedList = period.completedMonths || [];
        var isMonthDone = completedList.indexOf(curOldMonth) !== -1;

        // Month total chants
        var monthTotalChants = items.reduce(function (sum, it) {
            return sum + ((it.monthlyHistory && it.monthlyHistory[curOldMonth]) || 0);
        }, 0);

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
              '<div class="text-muted small mt-1">Tap “Mark Month Complete” above to advance to the previous month.</div>' +
              '</div>';

        var doneOldCardsHtml = doneOldItems.length > 0
            ? doneOldItems.map(function (it) { return renderOldCardHtml(it, true, curOldMonth, monthName); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<div class="text-muted small">No completed Dhikrs for ' + monthName + ' yet. Completed chants will appear here.</div>' +
              '</div>';

        oldBody.innerHTML =
            '<!-- Active Old Month Header -->' +
            '<div class="card p-3 rounded-4 mb-3 bg-white shadow-sm border-0">' +
            '<div class="d-flex align-items-center justify-content-between gap-2">' +
            '<div class="d-flex align-items-center gap-2 min-w-0">' +
            '<span class="modal-icon-badge badge-icon-sm bg-warning-subtle text-warning">' +
            '<i class="fa-solid fa-clock-rotate-left fs-5"></i>' +
            '</span>' +
            '<div class="min-w-0">' +
            '<div class="d-flex align-items-center gap-2">' +
            '<h5 class="fw-bold mb-0 text-gr1 text-truncate">' + monthName + '</h5>' +
            (isMonthDone ? '<span class="badge rounded-pill bg-success text-white small px-2 py-1"><i class="fa-solid fa-check me-1"></i>Completed</span>' : '') +
            '</div>' +
            '<div class="text-muted small">' + monthTotalChants.toLocaleString() + ' chants recited</div>' +
            '</div>' +
            '</div>' +
            '<button type="button" class="btn btn-brand btn-sm px-3 py-2 fw-bold rounded-3 text-nowrap" data-act="tb-complete-month" data-month="' + curOldMonth + '">' +
            '<i class="fa-solid fa-check me-1"></i>Mark Month Complete' +
            '</button>' +
            '</div>' +
            '</div>' +

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
                if (!btn) return;
                e.stopPropagation();
                var act = btn.dataset.act;
                if (act === 'tb-complete-month') {
                    var m = btn.dataset.month;
                    markMonthCompleted(m);
                } else if (act === 'tb-prev-month') {
                    prevOldMonth();
                } else if (act === 'tb-next-month') {
                    nextOldMonth();
                } else if (act === 'tb-old-reopen') {
                    reopenLastMonth();
                } else if (act === 'tb-reset-all-completed') {
                    resetAllCompleted();
                } else if (act === 'tb-open-old') {
                    var id = btn.dataset.id;
                    var mKey = btn.dataset.month;
                    openCounterOld(id, mKey);
                } else if (act === 'tb-edit-old-item') {
                    var id2 = btn.dataset.id;
                    var mKey2 = btn.dataset.month;
                    editOldItemCount(id2, mKey2);
                } else if (act === 'tb-toggle-old-done') {
                    var id3 = btn.dataset.id;
                    var mKey3 = btn.dataset.month;
                    toggleOldItemDone(id3, mKey3);
                } else if (act === 'tb-open-settings' || act === 'tb-change-period') {
                    openPeriodModal();
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
        markMonthCompleted: markMonthCompleted,
        markCurrentMonthCompleted: markMonthCompleted,
        prevOldMonth: prevOldMonth,
        nextOldMonth: nextOldMonth,
        reopenLastMonth: reopenLastMonth,
        resetAllCompleted: resetAllCompleted,
        editOldItemCount: editOldItemCount,
        toggleOldItemDone: toggleOldItemDone,
        openPeriodModal: openPeriodModal,
        savePeriodModal: savePeriodModal,
        resetPeriodModal: resetPeriodModal,
        loadPeriod: loadPeriod,
        savePeriod: savePeriod
    };

    // Bridge Old methods onto window.TasbeehApp for full backwards compatibility
    if (window.TasbeehApp) {
        window.TasbeehApp.openPeriodModal = openPeriodModal;
        window.TasbeehApp.markCurrentMonthCompleted = markMonthCompleted;
        window.TasbeehApp.reopenLastMonth = reopenLastMonth;
        window.TasbeehApp.resetAllCompleted = resetAllCompleted;
        window.TasbeehApp.prevOldMonth = prevOldMonth;
        window.TasbeehApp.nextOldMonth = nextOldMonth;
        window.TasbeehApp.editOldItemCount = editOldItemCount;
        window.TasbeehApp.toggleOldItemDone = toggleOldItemDone;
        window.TasbeehApp.getCurrentOldMonth = getCurrentOldMonth;
        window.TasbeehApp.loadPeriod = loadPeriod;
        window.TasbeehApp.savePeriod = savePeriod;
        window.TasbeehApp.renderOldTab = renderOldTab;
    }

    return api;
})();
