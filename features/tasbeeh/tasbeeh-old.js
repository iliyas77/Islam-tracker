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
    /* ---------- Constants (Referenced from utilities/constant.js) ---------- */
    var PERIOD_KEY = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.STORAGE_KEYS && window.CONSTANTS.TASBEEH.STORAGE_KEYS.PERIOD) || 'app_tasbeeh_period';
    var PERIOD_PRESETS = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.PERIOD_PRESETS) || {
        THIS_YEAR: 'this-year',
        LAST_6_MONTHS: '6-months',
        LAST_1_YEAR: '1-year'
    };

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

    /* ---------- Period Storage Layer (YYYY-MM) ---------- */
    function loadPeriod() {
        var raw = localStorage.getItem(PERIOD_KEY);
        var now = new Date();
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

        if (!raw) {
            var initial = { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
            try { localStorage.setItem(PERIOD_KEY, JSON.stringify(initial)); } catch (_) {}
            return initial;
        }
        try {
            var p = JSON.parse(raw);
            if (!p || !p.startDate) {
                return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
            }
            var s = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.startDate) : String(p.startDate).slice(0, 7)) || defaultStart;
            var e = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.endDate) : String(p.endDate).slice(0, 7)) || defaultEnd;
            var initE = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.initialEnd) : String(p.initialEnd || '').slice(0, 7)) || e;
            if (e >= curMonth) {
                e = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : e;
            }
            return {
                startDate: s,
                endDate: e,
                initialEnd: initE,
                updatedAt: p.updatedAt || Date.now()
            };
        } catch (_) {
            return { startDate: defaultStart, endDate: defaultEnd, initialEnd: defaultEnd, updatedAt: Date.now() };
        }
    }

    function savePeriod(start, end, initialEnd) {
        var cur = loadPeriod();
        var s = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(start) : String(start).slice(0, 7));
        var e = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(end) : String(end).slice(0, 7));
        var initE = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(initialEnd) : String(initialEnd || '').slice(0, 7)) || cur.initialEnd || e;
        var p = {
            startDate: s,
            endDate: e,
            initialEnd: initE,
            updatedAt: Date.now()
        };
        try { localStorage.setItem(PERIOD_KEY, JSON.stringify(p)); } catch (_) {}
        return p;
    }

    /* ---------- Old Tracking Month Selection Logic ---------- */
    function getCurrentOldMonth() {
        var period = loadPeriod();
        if (!period || !period.startDate || !period.endDate) return null;
        if (period.endDate < period.startDate) {
            return null; // All old months completed
        }
        return period.endDate;
    }

    function checkAndAdvanceMonth(mKey) {
        var curM = mKey || getCurrentOldMonth();
        if (!curM) return;
        var period = loadPeriod();
        if (curM < period.startDate) return;

        // Verify if all targets for curM are completed
        var isAllDone = false;
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.isMonthFullyCompleted === 'function') {
            isAllDone = window.TasbeehCurrentApp.isMonthFullyCompleted(curM);
        } else {
            var items = getItems();
            var finiteItems = items.filter(function (it) { return it.targetCount !== 'infinite'; });
            if (finiteItems.length === 0) return;
            var parts = curM.split('-');
            var yr = parseInt(parts[0], 10);
            var mo = parseInt(parts[1], 10) - 1;
            var totalDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getDaysInMonth === 'function')
                ? window.TasbeehCurrentApp.getDaysInMonth(yr, mo)
                : new Date(yr, mo + 1, 0).getDate();
            isAllDone = finiteItems.every(function (it) {
                var completedDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
                    ? window.TasbeehCurrentApp.getCompletedDaysInMonth(it.id, yr, mo)
                    : 0;
                return completedDays >= totalDays;
            });
        }

        if (!isAllDone) {
            showToast('Please complete all targets for ' + formatMonthLabel(curM) + ' before moving to previous month.');
            return;
        }

        var prevMonthKey = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curM) : (function (m) {
            var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) - 1;
            if (mo === 0) { mo = 12; y--; } return y + '-' + pad2(mo);
        })(curM);

        var curLabel = formatMonthLabel(curM);
        var prevLabel = formatMonthLabel(prevMonthKey);
        var isAllCleared = (prevMonthKey < period.startDate);

        var confirmFn = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.confirmAction === 'function')
            ? window.TasbeehCurrentApp.confirmAction
            : function (opt, cb) { if (confirm(opt.title + '\n\n' + opt.message.replace(/<[^>]+>/g, ''))) cb(); };

        confirmFn({
            title: '🎉 Month Completed!',
            message: 'All dhikr targets for <strong>' + curLabel + '</strong> are completed!<br><br>' +
                     'Do you want to finalize this month, remove its tracking data, and ' +
                     (isAllCleared ? 'complete all Old Tracking months?' : ('move to <strong>' + prevLabel + '</strong>?')),
            btnText: 'Finalize & Move Backward',
            isSuccess: true
        }, function () {
            // 1. Remove that month's tracking data
            if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.removeMonthTrackingData === 'function') {
                window.TasbeehCurrentApp.removeMonthTrackingData(curM);
            }

            // 2. Update end date in app_tasbeeh_period to previous month
            savePeriod(period.startDate, prevMonthKey, period.initialEnd);
            currentOldMonthKey = null;

            // 3. Move to that month
            renderOldTab();
            if (isAllCleared) {
                showToast('🎉 ' + curLabel + ' completed! All old tracking months cleared!', 3500);
            } else {
                showToast('🎉 ' + curLabel + ' completed! Moved to ' + prevLabel, 3500);
            }
        });
    }

    function advanceOldMonth() {
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.advanceOldMonth === 'function') {
            window.TasbeehCurrentApp.advanceOldMonth();
        } else {
            checkAndAdvanceMonth(getCurrentOldMonth());
        }
    }

    function markMonthCompleted(mKey) {
        checkAndAdvanceMonth(mKey);
    }

    function reopenLastMonth() {
        var period = loadPeriod();
        var maxEnd = period.initialEnd || period.endDate;
        if (period.endDate >= maxEnd) {
            showToast('Cannot reopen: already at latest month (' + formatMonthLabel(maxEnd) + ')');
            return;
        }
        var nextM = typeof getNextMonthKey === 'function' ? getNextMonthKey(period.endDate) : (function (m) {
            var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) + 1;
            if (mo > 12) { mo = 1; y++; } return y + '-' + pad2(mo);
        })(period.endDate);

        savePeriod(period.startDate, nextM, maxEnd);
        showToast('Reopened ' + formatMonthLabel(nextM));
        renderOldTab();
    }

    function resetAllCompleted() {
        if (!confirm('Reset Old Tasbeeh tracking back to initial period end?')) return;
        var period = loadPeriod();
        var maxEnd = period.initialEnd || period.endDate;
        savePeriod(period.startDate, maxEnd, maxEnd);
        showToast('Reset old tracking period to ' + formatMonthLabel(maxEnd));
        renderOldTab();
    }

    function openCounterOld(id, monthKey) {
        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.openCounter === 'function') {
            window.TasbeehCurrentApp.openCounter(id, monthKey);
        }
    }

    /* ---------- Old Card HTML Generator ---------- */
    function renderOldCardHtml(item, isDhikrDone, curOldMonth, monthName) {
        var isInfinite = item.targetCount === 'infinite';
        var parts = curOldMonth.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getDaysInMonth === 'function')
            ? window.TasbeehCurrentApp.getDaysInMonth(yr, mo)
            : new Date(yr, mo + 1, 0).getDate();
        var completedDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
            ? window.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, yr, mo)
            : 0;

        var icons = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.ICONS) || {};
        var targetDisplay = isInfinite ? '∞' : item.targetCount;

        var misbahaIcon = typeof renderIcon === 'function' ? renderIcon('misbaha') : (icons.MISBAHA || '<i class="fa-solid fa-hand-holding-heart"></i>');
        var pencilIcon = typeof renderIcon === 'function' ? renderIcon('tb-pencil') : (icons.PENCIL || '<i class="fa-solid fa-pen"></i>');
        var chevronIcon = typeof renderIcon === 'function' ? renderIcon('tb-chevron') : (((window.SVG_CONSTANTS && window.SVG_CONSTANTS.TASBEEH && window.SVG_CONSTANTS.TASBEEH.CHEVRON) || icons.CHEVRON || ''));
        var targetIcon = typeof renderIcon === 'function' ? renderIcon('tb-target') : (icons.TARGET || '<i class="fa-solid fa-bullseye"></i>');
        var checkCircleIcon = typeof renderIcon === 'function' ? renderIcon('tb-check-circle') : (icons.CHECK_CIRCLE || '<i class="fa-solid fa-circle-check"></i>');
        var calendarDaysIcon = typeof renderIcon === 'function' ? renderIcon({ name: 'calendar-days', variant: 'regular', color: 'text-muted', size: 13 }) : '<i class="fa-regular fa-calendar-days text-muted" style="font-size: 13px;"></i>';

        return '<div class="tb-card ' + (isDhikrDone ? 'tb-card-done' : '') + '" data-id="' + item.id + '" data-month="' + curOldMonth + '" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
            '<div class="tb-card-top">' +
            '<div class="icon-box icon-box-md">' +
            misbahaIcon +
            '</div>' +
            '<div class="tb-card-actions">' +
            '<button type="button" class="tb-btn-edit" data-act="tb-edit" title="Edit Dhikr" aria-label="Edit Dhikr">' +
            pencilIcon +
            '</button>' +
            chevronIcon +
            '</div>' +
            '</div>' +
            '<div class="tb-card-body">' +
            '<h6 class="tb-card-title">' + escHtml(item.title) + '</h6>' +
            '<div class="tb-card-meta">' +
            '<div class="tb-meta-row">' +
            targetIcon +
            '<span class="tb-meta-text">Target: <span class="tb-val-num">' + targetDisplay + '</span> / day</span>' +
            '</div>' +
            '<div class="tb-meta-row">' +
            checkCircleIcon +
            '<span class="tb-meta-text"><span class="badge-pill-custom badge-done" style="font-size:0.72rem;padding:0.25rem 0.6rem;">Done</span><strong class="tb-val-done ms-1">' + completedDays + '</strong></span>' +
            '</div>' +
            '<div class="tb-meta-row">' +
            calendarDaysIcon +
            '<span class="tb-meta-text">Total: <span class="tb-val-total">' + totalDays + ' days</span></span>' +
            '</div>' +
            (isDhikrDone
                ? '<div class="tb-meta-row tb-meta-sub-row"><span class="text-brand fw-bold" style="font-size: 11px;">' + (typeof renderIcon === 'function' ? renderIcon({ name: 'circle-check', className: 'me-1' }) : '<i class="fa-solid fa-circle-check me-1"></i>') + 'Month Completed</span></div>'
                : '') +
            '</div>' +
            '</div>' +
            '</div>';
    }

    /* ---------- Rendering: Old Tab (Single Active Previous Month) ---------- */
    function renderOldTab() {
        var oldBody = getEl('tbOldBody');
        if (!oldBody) return;

        var period = loadPeriod();
        var curOldMonth = getCurrentOldMonth();
        var curMonthName = formatMonthLabel(getCurrentMonthKey());
        var initialMaxEnd = period.initialEnd || period.endDate;

        // Check if no previous months exist in configured period
        if (initialMaxEnd < period.startDate) {
            var subNone = getEl('tbHeaderSub');
            if (subNone) subNone.textContent = 'None';
            oldBody.innerHTML =
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white">' +
                '<div class="mb-3">' +
                (typeof renderIcon === 'function' ? renderIcon({ name: 'calendar-xmark', variant: 'regular', size: 'display-4', color: 'text-warning', className: 'opacity-75' }) : '<i class="fa-regular fa-calendar-xmark display-4 text-warning opacity-75"></i>') +
                '</div>' +
                '<h5 class="fw-bold text-gr1 mb-2">No Previous Months in Period</h5>' +
                '<p class="text-muted small mb-3">' +
                'Your tracking start date is <strong>' + formatMonthLabel(period.startDate) + '</strong>, which falls in or after the current period.<br>' +
                'The Old tab displays previous completed months prior to <strong>' + curMonthName + '</strong>.' +
                '</p>' +
                '<button type="button" class="btn btn-brand px-4 py-2 rounded-3 fw-bold mx-auto" data-act="tb-open-settings">' +
                (typeof renderIcon === 'function' ? renderIcon({ name: 'calendar-days', className: 'me-2' }) : '<i class="fa-solid fa-calendar-days me-2"></i>') + 'Adjust Start Date' +
                '</button>' +
                '</div>';
            return;
        }

        // If all previous months in period are completed!
        if (!curOldMonth) {
            var subAll = getEl('tbHeaderSub');
            if (subAll) subAll.textContent = 'All Completed';
            oldBody.innerHTML =
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white">' +
                '<div class="mb-3">' +
                (typeof renderIcon === 'function' ? renderIcon({ name: 'circle-check', size: 'display-4', color: 'text-brand' }) : '<i class="fa-solid fa-circle-check display-4 text-brand"></i>') +
                '</div>' +
                '<h5 class="fw-bold text-gr1 mb-2">All Previous Months Completed!</h5>' +
                '<p class="text-muted small mb-3">' +
                'All previous months back to ' + formatMonthLabel(period.startDate) + ' have been completed.' +
                '</p>' +
                '<div class="flex justify-center gap-2">' +
                '<button type="button" class="btn btn-outline-brand rounded-pill px-4 py-2 fw-bold" data-act="tb-old-reopen">' +
                (typeof renderIcon === 'function' ? renderIcon({ name: 'rotate-left', className: 'me-1' }) : '<i class="fa-solid fa-rotate-left me-1"></i>') + 'Reopen Last Month' +
                '</button>' +
                '<button type="button" class="btn btn-light border rounded-pill px-3 py-2 text-muted small" data-act="tb-reset-all-completed">' +
                (typeof renderIcon === 'function' ? renderIcon({ name: 'arrows-rotate', className: 'me-1' }) : '<i class="fa-solid fa-arrows-rotate me-1"></i>') + 'Reset Completed' +
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

        var items = getItems();
        var parts = curOldMonth.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getDaysInMonth === 'function')
            ? window.TasbeehCurrentApp.getDaysInMonth(yr, mo)
            : new Date(yr, mo + 1, 0).getDate();

        // Partition items into To Do and Completed for this active old month
        var todoOldItems = [];
        var doneOldItems = [];

        items.forEach(function (item) {
            var isInfinite = item.targetCount === 'infinite';
            var completedDays = (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.getCompletedDaysInMonth === 'function')
                ? window.TasbeehCurrentApp.getCompletedDaysInMonth(item.id, yr, mo)
                : 0;
            var isDhikrDone = !isInfinite && completedDays >= totalDays;
            if (isDhikrDone) {
                doneOldItems.push(item);
            } else {
                todoOldItems.push(item);
            }
        });

        var isAllDone = todoOldItems.length === 0 && items.length > 0;
        var advanceMonthHtml = isAllDone
            ? '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm mb-3">' +
              '<div class="text-brand fw-bold mb-2">' +
              (typeof renderIcon === 'function' ? renderIcon({ name: 'circle-check', className: 'me-1' }) : '<i class="fa-solid fa-circle-check me-1"></i>') + 'All targets for ' + monthName + ' are completed!' +
              '</div>' +
              '<button type="button" class="btn btn-brand btn-sm fw-bold rounded-pill px-4 py-2 mx-auto" data-act="tb-old-advance">' +
              (typeof renderIcon === 'function' ? renderIcon({ name: 'arrow-left', className: 'me-1' }) : '<i class="fa-solid fa-arrow-left me-1"></i>') + 'Finalize & Move to Previous Month' +
              '</button>' +
              '</div>'
            : '';

        var todoOldCardsHtml = todoOldItems.length > 0
            ? todoOldItems.map(function (it) { return renderOldCardHtml(it, false, curOldMonth, monthName); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              (typeof renderIcon === 'function' ? renderIcon({ name: 'circle-check', color: 'text-brand', size: 'fs-3', className: 'mb-2' }) : '<i class="fa-solid fa-circle-check text-brand fs-3 mb-2"></i>') +
              '<div class="fw-bold text-gr1">All Dhikrs for ' + monthName + ' Completed!</div>' +
              '</div>';

        var doneOldCardsHtml = doneOldItems.length > 0
            ? doneOldItems.map(function (it) { return renderOldCardHtml(it, true, curOldMonth, monthName); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<div class="text-muted small">No completed Dhikrs for ' + monthName + ' yet. Completed chants will appear here.</div>' +
              '</div>';

        var isOldDoneExpanded = doneOldItems.length > 0;

        oldBody.innerHTML =
            advanceMonthHtml +
            '<!-- TO DO GROUP (OLD) -->' +
            '<section class="prayer-group mb-3">' +
            '<button type="button" class="group-toggle tb-group-toggle py-1 flex items-center gap-2" data-bs-toggle="collapse" data-bs-target="#tbOldTodoList" aria-expanded="true">' +
            '<span class="tb-toggle-icon">' +
            (typeof renderIcon === 'function' ? renderIcon('tb-group-toggle-down') : (((window.SVG_CONSTANTS && window.SVG_CONSTANTS.TASBEEH && window.SVG_CONSTANTS.TASBEEH.GROUP_TOGGLE_DOWN) || ''))) +
            '</span>' +
            '<span class="tb-group-title">To Do</span>' +
            '<span class="tb-group-badge">' + todoOldItems.length + '</span>' +
            '</button>' +
            '<div class="collapse show" id="tbOldTodoList">' +
            '<div class="tb-grid mt-2">' +
            todoOldCardsHtml +
            '</div>' +
            '</div>' +
            '</section>' +

            '<!-- COMPLETED GROUP (OLD) -->' +
            '<section class="prayer-group mb-3">' +
            '<button type="button" class="group-toggle tb-group-toggle py-1 flex items-center gap-2 ' + (isOldDoneExpanded ? '' : 'collapsed') + '" data-bs-toggle="collapse" data-bs-target="#tbOldDoneList" aria-expanded="' + (isOldDoneExpanded ? 'true' : 'false') + '">' +
            '<span class="tb-toggle-icon">' +
            (typeof renderIcon === 'function' ? renderIcon('tb-group-toggle-collapsed') : (((window.SVG_CONSTANTS && window.SVG_CONSTANTS.TASBEEH && window.SVG_CONSTANTS.TASBEEH.GROUP_TOGGLE_COLLAPSED) || ''))) +
            '</span>' +
            '<span class="tb-group-title-completed">COMPLETED</span>' +
            '<span class="tb-group-badge">' + doneOldItems.length + '</span>' +
            '</button>' +
            '<div class="collapse ' + (isOldDoneExpanded ? 'show' : '') + '" id="tbOldDoneList">' +
            '<div class="tb-grid mt-2">' +
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

        var startMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(startVal) : startVal.slice(0, 7);
        var endMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(endVal) : endVal.slice(0, 7);
        var curMonthName = formatMonthLabel(getCurrentMonthKey());
        var oldMonths = getPreviousMonthsList(startMonth, endMonth);

        if (oldMonths.length === 0) {
            previewText.innerHTML =
                '<div><strong>Current Month:</strong> ' + curMonthName + '</div>' +
                '<div class="text-warning mt-1">' + (typeof renderIcon === 'function' ? renderIcon({ name: 'triangle-exclamation', className: 'me-1' }) : '<i class="fa-solid fa-triangle-exclamation me-1"></i>') + 'Start Date is in or after current month. No previous months will show in Old tab.</div>';
        } else {
            var newestOldMonth = formatMonthLabel(oldMonths[0]);
            var oldestMonth = formatMonthLabel(oldMonths[oldMonths.length - 1]);
            previewText.innerHTML =
                '<div class="mb-1"><strong>Old Tab Timeline:</strong> ' + formatMonthLabel(startMonth) + ' → ' + formatMonthLabel(endMonth) + '</div>' +
                '<div class="mb-1"><strong>Step-by-Step:</strong> Starts at <strong>' + newestOldMonth + '</strong>, then navigates backward month by month till <strong>' + oldestMonth + '</strong> (' + oldMonths.length + ' total months).</div>' +
                '<div><strong>Current Tab:</strong> ' + curMonthName + '</div>';
        }
    }

    function openPeriodModal() {
        var p = loadPeriod();
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (startInp) {
            var sVal = p.startDate || (new Date().getFullYear() + '-01');
            startInp.value = sVal.length === 7 ? (sVal + '-01') : sVal;
        }
        if (endInp) {
            var eVal = p.initialEnd || p.endDate || td();
            endInp.value = eVal.length === 7 ? (eVal + '-01') : eVal;
        }

        updatePeriodPreview();

        var modalEl = getEl('tasbeehPeriodModal');
        if (modalEl) {
            if (!periodModalInstance) {
                var ModalClass = window.UIModal || (window.bootstrap && window.bootstrap.Modal);
                periodModalInstance = ModalClass ? ModalClass.getOrCreateInstance(modalEl) : null;
            }
            if (periodModalInstance) periodModalInstance.show();
        }
    }

    function savePeriodModal() {
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (!startInp) return;

        var startRaw = startInp.value;
        var endRaw = (endInp && endInp.value) ? endInp.value : td();

        if (!startRaw) {
            alert('Please select a Start Date.');
            startInp.focus();
            return;
        }

        var startMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(startRaw) : startRaw.slice(0, 7);
        var endMonth = typeof normalizeMonthKey === 'function' ? normalizeMonthKey(endRaw) : endRaw.slice(0, 7);

        if (endMonth < startMonth) {
            alert('End Date must be on or after Start Date.');
            if (endInp) endInp.focus();
            return;
        }

        savePeriod(startMonth, endMonth, endMonth);

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
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var defaultStart = now.getFullYear() + '-01';
        var defaultEnd = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');

        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (startInp) startInp.value = defaultStart + '-01';
        if (endInp) endInp.value = defaultEnd + '-01';

        savePeriod(defaultStart, defaultEnd, defaultEnd);
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
        var curMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (now.getFullYear() + '-' + pad2(now.getMonth() + 1));
        var prevMonth = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curMonth) : (now.getFullYear() + '-09');
        var startInp = getEl('tbPeriodStart');
        var endInp = getEl('tbPeriodEnd');
        if (!startInp || !endInp) return;

        var startStr = '';
        var endStr = prevMonth + '-01';

        if (type === PERIOD_PRESETS.THIS_YEAR) {
            startStr = now.getFullYear() + '-01-01';
        } else if (type === PERIOD_PRESETS.LAST_6_MONTHS) {
            var d6 = new Date(now.getFullYear(), now.getMonth() - 6, 1);
            startStr = d6.getFullYear() + '-' + pad2(d6.getMonth() + 1) + '-01';
        } else if (type === PERIOD_PRESETS.LAST_1_YEAR) {
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
            presetThisYear.onclick = function () { setPeriodPreset(PERIOD_PRESETS.THIS_YEAR); };
        }

        var preset6M = getEl('tbPreset6Months');
        if (preset6M) {
            preset6M.onclick = function () { setPeriodPreset(PERIOD_PRESETS.LAST_6_MONTHS); };
        }

        var preset1Y = getEl('tbPreset1Year');
        if (preset1Y) {
            preset1Y.onclick = function () { setPeriodPreset(PERIOD_PRESETS.LAST_1_YEAR); };
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
                    if (act === 'tb-old-advance') {
                        advanceOldMonth();
                    } else if (act === 'tb-old-reopen') {
                        reopenLastMonth();
                    } else if (act === 'tb-reset-all-completed') {
                        resetAllCompleted();
                    } else if (act === 'tb-open-settings' || act === 'tb-change-period') {
                        openPeriodModal();
                    }
                    return;
                }

                var editBtn = e.target.closest('button[data-act="tb-edit"]');
                if (editBtn) {
                    var cardForEdit = editBtn.closest('.tb-card[data-id]');
                    if (cardForEdit) {
                        e.stopPropagation();
                        if (window.TasbeehCurrentApp && typeof window.TasbeehCurrentApp.openModal === 'function') {
                            window.TasbeehCurrentApp.openModal(cardForEdit.dataset.id);
                        }
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
        advanceOldMonth: advanceOldMonth,
        markMonthCompleted: markMonthCompleted,
        markCurrentMonthCompleted: markMonthCompleted,
        reopenLastMonth: reopenLastMonth,
        resetAllCompleted: resetAllCompleted,
        openPeriodModal: openPeriodModal,
        savePeriodModal: savePeriodModal,
        resetPeriodModal: resetPeriodModal,
        loadPeriod: loadPeriod,
        savePeriod: savePeriod,
        openCounterOld: openCounterOld
    };

    // Bridge Old methods onto window.TasbeehApp for full backwards compatibility
    if (window.TasbeehApp) {
        window.TasbeehApp.openPeriodModal = openPeriodModal;
        window.TasbeehApp.checkAndAdvanceMonth = checkAndAdvanceMonth;
        window.TasbeehApp.advanceOldMonth = advanceOldMonth;
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
