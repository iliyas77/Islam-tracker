/* ============================================================
   Nur Prayer — Digital Tasbeeh Feature Module
   Path: features/tasbeeh/tasbeeh.js
   ============================================================ */
'use strict';

window.TasbeehApp = (function () {
    /* ---------- Constants & Presets ---------- */
    var STORAGE_KEY = 'app_tasbeeh_data';
    var DAY_KEY = 'app_tasbeeh_day';
    var PERIOD_KEY = 'app_tasbeeh_period';
    var INFINITE_LAP = 33;
    var MAX_BEADS = 60;
    var SVG_NS = 'http://www.w3.org/2000/svg';

    var DEFAULT_PRESETS = [
        { title: 'SubhanAllah', targetCount: 33, targetCycles: 3, icon: '🌿' },
        { title: 'Alhamdulillah', targetCount: 33, targetCycles: 3, icon: '🕌' },
        { title: 'Allahu Akbar', targetCount: 34, targetCycles: 3, icon: '🌙' },
        { title: 'Astaghfirullah', targetCount: 100, targetCycles: 1, icon: '✨' }
    ];

    var ICON_POOL = ['🌿', '🕌', '🌙', '✨', '📿', '🌟', '🕊️', '🕋'];

    /* ---------- State ---------- */
    var items = [];
    var activeId = null;
    var editingId = null;
    var editingMonthKey = null;
    var activeTab = 'current'; // 'current' or 'old'
    var currentOldMonthKey = null; // Currently active / displayed old month
    var counterMonthKey = null; // When counting for a specific old month
    var countMode = 'finite';
    var flashFull = false;
    var counterLocked = false;

    /* Ring SVG state */
    var beadEls = [];
    var ringN = 33;
    var ringTarget = 33;

    /* Session timer */
    var sessionStart = null;
    var sessionTimer = null;
    var toastTimer = null;

    /* Modal instances */
    var editModalInstance = null;
    var resetModalInstance = null;
    var periodModalInstance = null;

    /* ---------- Helper Utilities ---------- */
    function getEl(id) {
        return document.getElementById(id);
    }

    function clamp(val, min, max) {
        return Math.min(max, Math.max(min, val));
    }

    function createRipple(e, container) {
        if (!container || !e) return;
        var rect = container.getBoundingClientRect();
        var size = Math.max(rect.width, rect.height);
        var ripple = document.createElement('span');
        ripple.className = 'tb-ripple';
        ripple.style.width = size + 'px';
        ripple.style.height = size + 'px';
        var clientX = (e.clientX !== undefined) ? e.clientX : ((e.touches && e.touches[0] && e.touches[0].clientX) || (rect.left + size / 2));
        var clientY = (e.clientY !== undefined) ? e.clientY : ((e.touches && e.touches[0] && e.touches[0].clientY) || (rect.top + size / 2));
        ripple.style.left = (clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (clientY - rect.top - size / 2) + 'px';
        container.appendChild(ripple);
        setTimeout(function () { ripple.remove(); }, 620);
    }

    function uid() {
        return 'tb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
    }

    function vibrate(pattern) {
        if (typeof navigator !== 'undefined' && navigator.vibrate) {
            try { navigator.vibrate(pattern); } catch (_) {}
        }
    }

    function pad2(n) {
        return String(n).padStart(2, '0');
    }

    function td() {
        if (typeof window !== 'undefined' && typeof window.td === 'function') {
            return window.td();
        }
        var d = new Date();
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1) + '-' + pad2(d.getDate());
    }

    function formatDate(ds) {
        if (typeof fr === 'function') return fr(ds);
        if (typeof window !== 'undefined' && typeof window.fr === 'function') return window.fr(ds);
        if (!ds) return '';
        var p = ds.split('-');
        if (p.length < 3) return ds;
        return p[2] + '-' + p[1] + '-' + p[0];
    }

    function todayKey() {
        return new Date().toDateString();
    }

    function getCurrentMonthKey() {
        var d = new Date();
        return d.getFullYear() + '-' + pad2(d.getMonth() + 1);
    }

    function formatMonthLabel(mKey) {
        if (!mKey) return '';
        var parts = mKey.split('-');
        if (parts.length < 2) return mKey;
        var d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, 1);
        return d.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }

    function getPreviousMonthEnd() {
        var now = new Date();
        var lastDayPrev = new Date(now.getFullYear(), now.getMonth(), 0);
        return lastDayPrev.getFullYear() + '-' + pad2(lastDayPrev.getMonth() + 1) + '-' + pad2(lastDayPrev.getDate());
    }

    function getPreviousMonthsList(startDate, endDate) {
        if (!startDate) return [];
        var sParts = startDate.split('-');
        var sY = parseInt(sParts[0], 10);
        var sM = parseInt(sParts[1], 10);

        var now = new Date();
        var curY = now.getFullYear();
        var curM = now.getMonth() + 1; // 1-12

        // Upper bound for old tab: previous month
        var endLimitY = curY;
        var endLimitM = curM - 1;
        if (endLimitM === 0) {
            endLimitM = 12;
            endLimitY -= 1;
        }

        if (endDate) {
            var eParts = endDate.split('-');
            var eY = parseInt(eParts[0], 10);
            var eM = parseInt(eParts[1], 10);
            if (eY < endLimitY || (eY === endLimitY && eM < endLimitM)) {
                endLimitY = eY;
                endLimitM = eM;
            }
        }

        var list = [];
        var y = endLimitY;
        var m = endLimitM;

        while (y > sY || (y === sY && m >= sM)) {
            list.push(y + '-' + pad2(m));
            m--;
            if (m === 0) {
                m = 12;
                y--;
            }
        }
        return list; // Most recent month first (e.g. ['2026-09', '2026-08', ...])
    }

    /* ---------- Toast ---------- */
    function showToast(message, duration) {
        var el = getEl('tbToast');
        if (!el) return;
        duration = duration || 2200;
        el.textContent = message;
        el.classList.remove('d-none');
        el.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(function () {
            el.classList.remove('show');
            setTimeout(function () { el.classList.add('d-none'); }, 200);
        }, duration);
    }

    /* ---------- Storage Layer ---------- */
    function normalizeItem(raw) {
        // PRESERVE ALL EXISTING 9 PROPERTIES:
        var norm = {
            id: raw.id || uid(),
            title: raw.title || 'Dhikr',
            targetCount: raw.targetCount === 'infinite' ? 'infinite' : clamp(parseInt(raw.targetCount, 10) || 33, 1, 9999),
            targetCycles: clamp(parseInt(raw.targetCycles, 10) || 1, 1, 99),
            currentCount: clamp(parseInt(raw.currentCount, 10) || 0, 0, 99999),
            currentCycle: clamp(parseInt(raw.currentCycle, 10) || 1, 1, 999),
            totalCountToday: clamp(parseInt(raw.totalCountToday, 10) || 0, 0, 9999999),
            icon: raw.icon || ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)],
            updatedAt: raw.updatedAt || Date.now(),

            // NEW LOCAL STORAGE PROPERTIES:
            dailyHistory: (raw.dailyHistory && typeof raw.dailyHistory === 'object') ? Object.assign({}, raw.dailyHistory) : {},
            monthlyHistory: (raw.monthlyHistory && typeof raw.monthlyHistory === 'object') ? Object.assign({}, raw.monthlyHistory) : {},
            oldTotalCount: clamp(parseInt(raw.oldTotalCount, 10) || 0, 0, 99999999)
        };

        // Bootstrap history for today if totalCountToday > 0 but not yet recorded in history
        var today = td();
        if (norm.totalCountToday > 0 && !norm.dailyHistory[today]) {
            norm.dailyHistory[today] = norm.totalCountToday;
        }
        var curMonth = getCurrentMonthKey();
        if (norm.totalCountToday > 0 && !norm.monthlyHistory[curMonth]) {
            norm.monthlyHistory[curMonth] = norm.totalCountToday;
        }

        return norm;
    }

    function loadItems() {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return DEFAULT_PRESETS.map(function (p) {
                return normalizeItem({
                    title: p.title,
                    targetCount: p.targetCount,
                    targetCycles: p.targetCycles,
                    icon: p.icon,
                    currentCount: 0,
                    currentCycle: 1,
                    totalCountToday: 0
                });
            });
        }
        try {
            var parsed = JSON.parse(raw);
            if (!Array.isArray(parsed) || parsed.length === 0) {
                return DEFAULT_PRESETS.map(function (p) { return normalizeItem(p); });
            }
            return parsed.map(normalizeItem);
        } catch (_) {
            return DEFAULT_PRESETS.map(function (p) { return normalizeItem(p); });
        }
    }

    function persist() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
        } catch (_) { }
    }

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

    function checkDailyReset() {
        var today = todayKey();
        var last = localStorage.getItem(DAY_KEY);
        if (last !== today) {
            items.forEach(function (it) { it.totalCountToday = 0; });
            localStorage.setItem(DAY_KEY, today);
            persist();
        }
    }

    function getActiveItem() {
        if (!activeId) return null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === activeId) return items[i];
        }
        return null;
    }

    /* ---------- Progress Computation ---------- */
    function computeProgress(item) {
        if (item.targetCount === 'infinite') {
            return { pct: 0, done: item.currentCount, total: null };
        }
        var perCycle = item.targetCount;
        var total = perCycle * item.targetCycles;
        var doneCycles = Math.min(item.currentCycle - 1, item.targetCycles);
        var done = doneCycles * perCycle + item.currentCount;
        var pct = total > 0 ? clamp((done / total) * 100, 0, 100) : 0;
        return { pct: pct, done: done, total: total };
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
        var completed = period.completedMonths || [];

        if (currentOldMonthKey && allOldMonths.indexOf(currentOldMonthKey) !== -1 && completed.indexOf(currentOldMonthKey) === -1) {
            return currentOldMonthKey;
        }

        if (uncompleted.length > 0) {
            currentOldMonthKey = uncompleted[0];
            return currentOldMonthKey;
        }

        return null; // All months completed
    }

    function prevOldMonth() {
        var period = loadPeriod();
        var all = getPreviousMonthsList(period.startDate, period.endDate);
        var cur = getCurrentOldMonth();
        if (!cur) return;
        var idx = all.indexOf(cur);
        // Next month further back into the past
        if (idx !== -1 && idx < all.length - 1) {
            currentOldMonthKey = all[idx + 1];
            renderOldTab();
        }
    }

    function nextOldMonth() {
        var period = loadPeriod();
        var all = getPreviousMonthsList(period.startDate, period.endDate);
        var cur = getCurrentOldMonth();
        if (!cur) return;
        var idx = all.indexOf(cur);
        // Next month closer to current month
        if (idx > 0) {
            currentOldMonthKey = all[idx - 1];
            renderOldTab();
        }
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
        persist();

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
        persist();
        renderOldTab();
        showToast('Updated ' + item.title + ' to ' + num.toLocaleString());
    }

    function toggleOldItemDone(id, monthKey) {
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
        persist();
        renderOldTab();
    }

    /* ---------- Card HTML Generators ---------- */
    function renderCurrentCardHtml(item, isComplete, curMonthKey) {
        var isInfinite = item.targetCount === 'infinite';
        var prog = computeProgress(item);
        var thisMonthCount = (item.monthlyHistory && item.monthlyHistory[curMonthKey]) || 0;
        var metaLine = isInfinite
            ? 'Target: ∞ · Cycles: ∞ · Recited: <strong>' + item.currentCount + '</strong>'
            : 'Target: ' + item.targetCount + ' · Cycles: ' + item.targetCycles + ' · Done: <strong>' + prog.done + '</strong>/' + prog.total;

        return '<div class="tb-card p-3 shadow-sm ' + (isComplete ? 'tb-card-done' : '') + '" data-id="' + item.id + '" data-ref="page.tasbeeh.card">' +
            '<div class="d-flex align-items-center gap-3 mb-2" data-ref="page.tasbeeh.card.header">' +
            '<div class="tb-badge ' + (isComplete ? 'bg-success-subtle text-success' : '') + '" data-ref="page.tasbeeh.card.icon">' + (item.icon || '🌿') + '</div>' +
            '<div class="flex-grow-1 min-w-0" data-ref="page.tasbeeh.card.info">' +
            '<div class="d-flex align-items-center justify-content-between">' +
            '<h6 class="fw-bold mb-0 text-truncate text-gr1" data-ref="page.tasbeeh.card.title">' + escHtml(item.title) + '</h6>' +
            (isComplete ? '<span class="badge-pill-custom badge-done py-1 px-2 fs-xs"><i class="fa-solid fa-check me-1"></i>Completed</span>' : '') +
            '</div>' +
            '<div class="tb-meta mt-1" data-ref="page.tasbeeh.card.meta">' + metaLine + '</div>' +
            '</div>' +
            '</div>' +
            '<div class="progress progress-thin mb-2" data-ref="page.tasbeeh.card.progress">' +
            '<div class="progress-bar ' + (isComplete ? 'bg-success' : '') + '" style="width:' + prog.pct.toFixed(1) + '%" data-ref="page.tasbeeh.card.progress-bar"></div>' +
            '</div>' +
            '<div class="d-flex align-items-center justify-content-between mb-3 px-1">' +
            '<span class="tb-chant-chip ' + (thisMonthCount > 0 ? 'has-count' : '') + '"><i class="fa-regular fa-calendar-check me-1"></i>This Month: <strong>' + thisMonthCount.toLocaleString() + '</strong></span>' +
            '<span class="tb-chant-chip ' + (item.totalCountToday > 0 ? 'has-count' : '') + '"><i class="fa-solid fa-sparkles me-1"></i>Today: <strong>' + (item.totalCountToday || 0) + '</strong></span>' +
            '</div>' +
            '<div class="d-flex align-items-center gap-2 pt-1 border-top" data-ref="page.tasbeeh.card.actions">' +
            '<button type="button" class="btn ' + (isComplete ? 'btn-outline-brand' : 'btn-brand') + ' flex-grow-1 py-2 rounded-3 fw-bold btn-h-42" data-act="tb-open" data-ref="page.tasbeeh.card.open-btn">' +
            '<i class="fa-solid ' + (isComplete ? 'fa-rotate-right' : 'fa-play') + ' me-2"></i>' + (isComplete ? 'Recount / Add' : 'Open Counter') + '</button>' +
            '<button type="button" class="btn btn-light rounded-3 px-3 py-2 border btn-h-42" data-act="tb-edit" title="Edit" data-ref="page.tasbeeh.card.edit-btn">' +
            '<i class="fa-solid fa-pen text-secondary"></i></button>' +
            '<button type="button" class="btn btn-light rounded-3 px-3 py-2 border btn-h-42" data-act="tb-del" title="Delete" data-ref="page.tasbeeh.card.del-btn">' +
            '<i class="fa-solid fa-trash text-danger"></i></button>' +
            '</div>' +
            '</div>';
    }

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

    /* ---------- Rendering: Current Tab (Current Month) ---------- */
    function renderCurrentTab() {
        var curMonthKey = getCurrentMonthKey();
        var listEl = getEl('tbList');
        var emptyEl = getEl('tbEmptyState');

        if (!listEl) return;

        if (items.length === 0) {
            if (emptyEl) emptyEl.classList.remove('d-none');
            listEl.innerHTML = '';
            return;
        }

        if (emptyEl) emptyEl.classList.add('d-none');

        var todoItems = [];
        var doneItems = [];

        items.forEach(function (item) {
            var isComplete = item.targetCount !== 'infinite' && item.currentCycle > item.targetCycles;
            if (isComplete) {
                doneItems.push(item);
            } else {
                todoItems.push(item);
            }
        });

        var todoCardsHtml = todoItems.length > 0
            ? todoItems.map(function (it) { return renderCurrentCardHtml(it, false, curMonthKey); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<i class="fa-solid fa-circle-check text-success fs-3 mb-2"></i>' +
              '<div class="fw-bold text-gr1">All Dhikrs Completed!</div>' +
              '<div class="text-muted small">All your target cycles for this month are complete.</div>' +
              '</div>';

        var doneCardsHtml = doneItems.length > 0
            ? doneItems.map(function (it) { return renderCurrentCardHtml(it, true, curMonthKey); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<div class="text-muted small">No completed Dhikrs yet. Completed chants will appear here.</div>' +
              '</div>';

        var html =
            '<!-- TO DO GROUP -->' +
            '<section class="prayer-group mb-3" data-ref="page.tasbeeh.group.todo">' +
            '<button type="button" class="group-toggle py-1 d-flex align-items-center gap-2" data-bs-toggle="collapse" data-bs-target="#tbCurrentTodoList" aria-expanded="true">' +
            '<span class="toggle-icon">▼</span>' +
            '<span class="section-title text-gr1 fw-bold">TO DO</span>' +
            '<span class="badge rounded-pill bg-light text-muted border small px-2 py-1">' + todoItems.length + '</span>' +
            '</button>' +
            '<div class="collapse show" id="tbCurrentTodoList">' +
            '<div class="d-flex flex-column gap-3 mt-2">' +
            todoCardsHtml +
            '</div>' +
            '</div>' +
            '</section>' +

            '<!-- COMPLETED GROUP -->' +
            '<section class="prayer-group mb-3" data-ref="page.tasbeeh.group.done">' +
            '<button type="button" class="group-toggle py-1 d-flex align-items-center gap-2" data-bs-toggle="collapse" data-bs-target="#tbCurrentDoneList" aria-expanded="true">' +
            '<span class="toggle-icon">▼</span>' +
            '<span class="section-title text-success fw-bold">COMPLETED</span>' +
            '<span class="badge rounded-pill bg-success-subtle text-success border border-success-subtle small px-2 py-1">' + doneItems.length + '</span>' +
            '</button>' +
            '<div class="collapse show" id="tbCurrentDoneList">' +
            '<div class="d-flex flex-column gap-3 mt-2">' +
            doneCardsHtml +
            '</div>' +
            '</div>' +
            '</section>';

        listEl.innerHTML = html;
    }

    /* ---------- Rendering: Old Tab (Single Active Previous Month) ---------- */
    function renderOldTab() {
        var oldBody = getEl('tbOldBody');
        if (!oldBody) return;

        var period = loadPeriod();
        var allOldMonths = getPreviousMonthsList(period.startDate, period.endDate);

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
            oldBody.innerHTML =
                '<div class="card p-4 text-center border-0 shadow-sm rounded-4 bg-white">' +
                '<div class="mb-3">' +
                '<i class="fa-solid fa-circle-check display-4 text-success"></i>' +
                '</div>' +
                '<h5 class="fw-bold text-gr1 mb-2">All Previous Months Completed!</h5>' +
                '<p class="text-muted small mb-3">' +
                'All ' + allOldMonths.length + ' previous months from <strong>' + formatDate(period.startDate) + '</strong> up to the current month have been completed.' +
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

        // Navigation limits
        var hasEarlier = monthIndex < allOldMonths.length - 1;
        var hasLater = monthIndex > 0;

        // Month total chants
        var monthTotalChants = items.reduce(function (sum, it) {
            return sum + ((it.monthlyHistory && it.monthlyHistory[curOldMonth]) || 0);
        }, 0);

        // Header subtitle update
        var sub = getEl('tbHeaderSub');
        if (sub) {
            sub.textContent = monthName + ' · Month ' + (monthIndex + 1) + ' of ' + totalMonths;
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
            '<div class="d-flex align-items-center justify-content-between mb-2">' +
            '<div class="d-flex align-items-center gap-2 min-w-0">' +
            '<span class="modal-icon-badge badge-icon-sm bg-warning-subtle text-warning">' +
            '<i class="fa-solid fa-clock-rotate-left fs-5"></i>' +
            '</span>' +
            '<div class="min-w-0">' +
            '<div class="d-flex align-items-center gap-2">' +
            '<h5 class="fw-bold mb-0 text-gr1 text-truncate">' + monthName + '</h5>' +
            (isMonthDone ? '<span class="badge rounded-pill bg-success text-white small px-2 py-1"><i class="fa-solid fa-check me-1"></i>Completed</span>' : '') +
            '</div>' +
            '<div class="text-muted small">Month ' + (monthIndex + 1) + ' of ' + totalMonths + ' in Old Period · ' + monthTotalChants.toLocaleString() + ' chants</div>' +
            '</div>' +
            '</div>' +
            '<div class="d-flex align-items-center gap-1">' +
            (hasEarlier ? '<button type="button" class="btn btn-sm btn-light border rounded-circle" data-act="tb-prev-month" title="Previous Month (' + formatMonthLabel(allOldMonths[monthIndex + 1]) + ')"><i class="fa-solid fa-chevron-left"></i></button>' : '') +
            (hasLater ? '<button type="button" class="btn btn-sm btn-light border rounded-circle" data-act="tb-next-month" title="Next Month (' + formatMonthLabel(allOldMonths[monthIndex - 1]) + ')"><i class="fa-solid fa-chevron-right"></i></button>' : '') +
            '</div>' +
            '</div>' +
            '<div class="d-flex align-items-center justify-content-between pt-2 border-top mt-1">' +
            '<span class="small text-muted"><i class="fa-regular fa-calendar-days me-1 text-success"></i>Start Date: <strong>' + formatDate(period.startDate) + '</strong></span>' +
            '<button type="button" class="btn btn-brand btn-sm px-3 py-2 fw-bold rounded-3" data-act="tb-complete-month" data-month="' + curOldMonth + '">' +
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





    /* ---------- Tab Navigation & Rendering ---------- */
    function render() {
        if (activeTab === 'old') {
            renderOldTab();
        } else {
            renderCurrentTab();
        }
    }

    function switchTab(tab) {
        activeTab = tab === 'old' ? 'old' : 'current';
        var btnCur = getEl('tabTbCurrent');
        var btnOld = getEl('tabTbOld');
        var bodyCur = getEl('tbCurrentBody');
        var bodyOld = getEl('tbOldBody');
        var icon = getEl('tbHeaderIcon');
        var label = getEl('tbHeaderLabel');
        var sub = getEl('tbHeaderSub');

        if (activeTab === 'old') {
            if (btnCur) { btnCur.classList.remove('active'); btnCur.setAttribute('aria-selected', 'false'); }
            if (btnOld) { btnOld.classList.add('active'); btnOld.setAttribute('aria-selected', 'true'); }
            if (bodyCur) bodyCur.classList.add('d-none');
            if (bodyOld) bodyOld.classList.remove('d-none');
            if (icon) icon.className = 'fa-solid fa-clock-rotate-left text-warning';
            if (label) label.textContent = 'Old Tasbeeh';
            var curOldM = getCurrentOldMonth();
            if (sub) {
                sub.textContent = curOldM ? (formatMonthLabel(curOldM) + ' · Old Tracking') : 'Old Tracking Completed';
            }
            renderOldTab();
        } else {
            if (btnCur) { btnCur.classList.add('active'); btnCur.setAttribute('aria-selected', 'true'); }
            if (btnOld) { btnOld.classList.remove('active'); btnOld.setAttribute('aria-selected', 'false'); }
            if (bodyCur) bodyCur.classList.remove('d-none');
            if (bodyOld) bodyOld.classList.add('d-none');
            if (icon) icon.className = 'fa-regular fa-calendar text-primary';
            if (label) label.textContent = 'Digital Tasbeeh';
            if (sub) sub.textContent = 'Current Month · ' + formatMonthLabel(getCurrentMonthKey());
            renderCurrentTab();
        }
    }

    function escHtml(str) {
        if (!str) return '';
        return String(str).replace(/[&<>"']/g, function (m) {
            return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m];
        });
    }

    /* ---------- SVG Bead Ring ---------- */
    function buildRing(item) {
        var isInfinite = item.targetCount === 'infinite';
        ringTarget = isInfinite ? INFINITE_LAP : item.targetCount;
        ringN = isInfinite ? INFINITE_LAP : Math.min(item.targetCount, MAX_BEADS);

        var group = getEl('tbBeadGroup');
        if (!group) return;
        group.innerHTML = '';
        beadEls = [];

        var cx = 130, cy = 130, radius = 104;
        var spacing = (2 * Math.PI * radius) / ringN;
        var beadR = clamp(spacing * 0.33, 2.6, 7.5);

        for (var i = 0; i < ringN; i++) {
            var angle = (-90 + (360 / ringN) * i) * (Math.PI / 180);
            var circle = document.createElementNS(SVG_NS, 'circle');

            circle.setAttribute('cx', (cx + radius * Math.cos(angle)).toFixed(2));
            circle.setAttribute('cy', (cy + radius * Math.sin(angle)).toFixed(2));
            circle.setAttribute('r', beadR.toFixed(2));
            circle.setAttribute('class', 'tb-bead');

            group.appendChild(circle);
            beadEls.push(circle);
        }
    }

    /* ---------- Counter View UI Update ---------- */
    function updateCounterUI() {
        var item = getActiveItem();
        if (!item) return;

        var isInfinite = item.targetCount === 'infinite';
        var lapTarget = isInfinite ? INFINITE_LAP : item.targetCount;
        var isComplete, displayCount, displayCycle;

        if (counterMonthKey) {
            var mCount = (item.monthlyHistory && item.monthlyHistory[counterMonthKey]) || 0;
            if (isInfinite) {
                isComplete = false;
                displayCount = mCount;
                displayCycle = Math.floor(mCount / INFINITE_LAP) + 1;
            } else {
                var totalTarget = item.targetCount * item.targetCycles;
                isComplete = mCount >= totalTarget;
                if (flashFull || isComplete) {
                    displayCount = lapTarget;
                    displayCycle = item.targetCycles;
                } else {
                    displayCycle = Math.min(item.targetCycles, Math.floor(mCount / item.targetCount) + 1);
                    displayCount = mCount % item.targetCount;
                }
            }
        } else {
            isComplete = !isInfinite && item.currentCycle > item.targetCycles;
            displayCount = (flashFull || isComplete) ? lapTarget : item.currentCount;
            displayCycle = (flashFull || isComplete) ? Math.min(item.targetCycles, Math.max(1, item.currentCycle - 1)) : item.currentCycle;
        }

        var topTitle = item.title;
        if (counterMonthKey) {
            topTitle += ' (' + formatMonthLabel(counterMonthKey) + ')';
        }

        getEl('tbCounterTopTitle').textContent = topTitle;
        getEl('tbCounterTitle').textContent = item.title;

        var cycleBadge = getEl('tbCounterCycle');
        if (isInfinite) {
            cycleBadge.textContent = 'Cycle ' + displayCycle + ' / ∞';
            cycleBadge.className = 'badge-pill-custom badge-notyet';
        } else if (isComplete) {
            cycleBadge.textContent = 'All ' + item.targetCycles + ' Cycles Completed ✓';
            cycleBadge.className = 'badge-pill-custom badge-done';
        } else {
            cycleBadge.textContent = 'Cycle ' + displayCycle + ' of ' + item.targetCycles;
            cycleBadge.className = 'badge-pill-custom badge-done';
        }

        getEl('tbCounterCount').textContent = displayCount;
        getEl('tbCounterTarget').textContent = isInfinite ? 'OF ∞' : 'OF ' + item.targetCount;

        /* Beads */
        var filled;
        if (isInfinite) {
            var lapCount = displayCount === 0 ? 0 : ((displayCount - 1) % INFINITE_LAP) + 1;
            filled = Math.round((lapCount / INFINITE_LAP) * ringN);
        } else {
            filled = isComplete ? ringN : Math.round((displayCount / item.targetCount) * ringN);
        }
        filled = clamp(filled, 0, ringN);

        beadEls.forEach(function (bead, i) {
            bead.classList.toggle('on', i < filled);
            bead.classList.toggle('next', i === filled && !isComplete);
        });

        /* Ring Wrap & Tap Zone */
        var ringWrap = getEl('tbRingWrap') || document.querySelector('[data-ref="page.tasbeeh.counter.ring-wrap"]');
        if (ringWrap) ringWrap.classList.toggle('done', isComplete);

        var tapZone = getEl('tbTapZone');
        var tapLabel = getEl('tbTapLabel');
        if (tapZone) tapZone.classList.toggle('done', isComplete);
        if (tapLabel) tapLabel.textContent = isComplete ? 'COMPLETED ✓' : 'TAP (+1)';

        updateSessionLine();
    }

    /* ---------- Session Timer ---------- */
    function startSession() {
        sessionStart = Date.now();
        clearInterval(sessionTimer);
        sessionTimer = setInterval(updateSessionLine, 1000);
    }

    function stopSession() {
        clearInterval(sessionTimer);
        sessionTimer = null;
        sessionStart = null;
    }

    function updateSessionLine() {
        var item = getActiveItem();
        if (!item) return;

        var timerEl = getEl('tbSessionTimer');
        if (timerEl && sessionStart) {
            var secs = Math.floor((Date.now() - sessionStart) / 1000);
            var mm = String(Math.floor(secs / 60)).padStart(2, '0');
            var ss = String(secs % 60).padStart(2, '0');
            timerEl.innerHTML = '<i class="fa-regular fa-clock me-1"></i>' + mm + ':' + ss;
        }

        var todayEl = getEl('tbSessionToday');
        if (todayEl) {
            if (counterMonthKey) {
                var mCount = (item.monthlyHistory && item.monthlyHistory[counterMonthKey]) || 0;
                todayEl.textContent = formatMonthLabel(counterMonthKey) + ' ' + mCount;
            } else {
                todayEl.textContent = 'Today ' + (item.totalCountToday || 0);
            }
        }
    }

    /* ---------- Counter Actions ---------- */
    function openCounter(id, oldMonthKey) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;

        activeId = id;
        counterMonthKey = oldMonthKey || null;
        flashFull = false;
        counterLocked = false;

        if (!counterMonthKey && item.targetCount !== 'infinite' && item.currentCount >= item.targetCount) {
            item.currentCount = 0;
            item.currentCycle += 1;
            persist();
        }

        buildRing(item);
        updateCounterUI();
        startSession();

        var counterView = getEl('tasbeehCounterView');
        if (counterView) {
            counterView.classList.remove('d-none');
            counterView.classList.add('d-flex');
        }
    }

    function openCounterOld(id, monthKey) {
        openCounter(id, monthKey);
    }

    function closeCounter() {
        stopSession();
        activeId = null;
        counterMonthKey = null;
        flashFull = false;
        counterLocked = false;

        var counterView = getEl('tasbeehCounterView');
        if (counterView) {
            counterView.classList.add('d-none');
            counterView.classList.remove('d-flex');
        }

        render();
    }

    function increment() {
        var item = getActiveItem();
        if (!item || counterLocked || flashFull) return;

        var isInfinite = item.targetCount === 'infinite';
        var isComplete;

        if (counterMonthKey) {
            var mCount = (item.monthlyHistory && item.monthlyHistory[counterMonthKey]) || 0;
            isComplete = !isInfinite && mCount >= (item.targetCount * item.targetCycles);
        } else {
            isComplete = !isInfinite && item.currentCycle > item.targetCycles;
        }

        if (isComplete) {
            showToast('All cycles complete — reset counter to recount');
            return;
        }

        vibrate(20);
        var countEl = getEl('tbCounterCount');
        if (countEl) {
            countEl.classList.remove('pop');
            void countEl.offsetWidth;
            countEl.classList.add('pop');
        }

        if (counterMonthKey) {
            item.monthlyHistory = item.monthlyHistory || {};
            var prevMCount = item.monthlyHistory[counterMonthKey] || 0;
            var nextMCount = prevMCount + 1;
            item.monthlyHistory[counterMonthKey] = nextMCount;
            item.oldTotalCount = (item.oldTotalCount || 0) + 1;
            item.updatedAt = Date.now();

            if (!isInfinite) {
                var cycleDone = (nextMCount % item.targetCount) === 0;
                var totalTarget = item.targetCount * item.targetCycles;
                if (cycleDone) {
                    var finishedCycle = Math.floor(nextMCount / item.targetCount);
                    flashFull = true;
                    counterLocked = true;
                    updateCounterUI();
                    if (nextMCount >= totalTarget) {
                        showToast('🎉 All ' + item.targetCycles + ' cycles complete for ' + formatMonthLabel(counterMonthKey) + '!', 3000);
                    } else {
                        showToast('Cycle ' + finishedCycle + ' complete · Starting Cycle ' + (finishedCycle + 1) + ' of ' + item.targetCycles);
                    }
                    setTimeout(function () {
                        flashFull = false;
                        counterLocked = false;
                        updateCounterUI();
                    }, 520);
                    persist();
                    return;
                }
            }
            persist();
            updateCounterUI();
            return;
        }

        // Increment existing properties for Current Month
        item.currentCount += 1;
        item.totalCountToday += 1;
        item.updatedAt = Date.now();

        var today = td();
        item.dailyHistory = item.dailyHistory || {};
        item.dailyHistory[today] = (item.dailyHistory[today] || 0) + 1;

        var curMonth = getCurrentMonthKey();
        item.monthlyHistory = item.monthlyHistory || {};
        item.monthlyHistory[curMonth] = (item.monthlyHistory[curMonth] || 0) + 1;

        /* Cycle completion for Current Month */
        if (!isInfinite && item.currentCount >= item.targetCount) {
            var finishedCycle = item.currentCycle;

            item.currentCount = 0;
            item.currentCycle += 1;
            persist();

            flashFull = true;
            counterLocked = true;
            updateCounterUI();

            if (item.currentCycle > item.targetCycles) {
                showToast('🎉 All ' + item.targetCycles + ' cycles complete!', 3000);
            } else {
                showToast('Cycle ' + finishedCycle + ' complete · Starting Cycle ' + item.currentCycle + ' of ' + item.targetCycles);
            }

            setTimeout(function () {
                flashFull = false;
                counterLocked = false;
                updateCounterUI();
            }, 520);

            return;
        }

        persist();
        updateCounterUI();
    }

    function undo() {
        var item = getActiveItem();
        if (!item || counterLocked || flashFull) return;

        var isInfinite = item.targetCount === 'infinite';

        if (counterMonthKey) {
            item.monthlyHistory = item.monthlyHistory || {};
            var curMCount = item.monthlyHistory[counterMonthKey] || 0;
            if (curMCount > 0) {
                item.monthlyHistory[counterMonthKey] = curMCount - 1;
                item.oldTotalCount = Math.max(0, (item.oldTotalCount || 0) - 1);
                item.updatedAt = Date.now();
                persist();
                updateCounterUI();
            } else {
                showToast('Nothing to undo');
            }
            return;
        }

        if (item.currentCount > 0) {
            item.currentCount = Math.max(0, item.currentCount - 1);
        } else if (item.currentCycle > 1) {
            item.currentCycle -= 1;
            item.currentCount = isInfinite ? 0 : Math.max(0, item.targetCount - 1);
        } else {
            showToast('Nothing to undo');
            return;
        }

        if (item.totalCountToday > 0) item.totalCountToday -= 1;
        var today = td();
        if (item.dailyHistory && item.dailyHistory[today] > 0) {
            item.dailyHistory[today] -= 1;
        }
        var curMonth = getCurrentMonthKey();
        if (item.monthlyHistory && item.monthlyHistory[curMonth] > 0) {
            item.monthlyHistory[curMonth] -= 1;
        }

        item.updatedAt = Date.now();
        persist();
        updateCounterUI();
    }

    function promptReset() {
        var item = getActiveItem();
        if (!item) return;

        var modalEl = getEl('tasbeehResetModal');
        if (modalEl) {
            getEl('tbResetModalName').textContent = '“' + item.title + '”';
            if (!resetModalInstance) {
                resetModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
            }
            resetModalInstance.show();
        } else {
            if (confirm('Reset counter for “' + item.title + '”?')) {
                doReset('all');
            }
        }
    }

    function doReset(type) {
        var item = getActiveItem();
        if (!item) return;

        if (counterMonthKey) {
            item.monthlyHistory = item.monthlyHistory || {};
            var prevVal = item.monthlyHistory[counterMonthKey] || 0;
            if (type === 'round' && item.targetCount !== 'infinite') {
                var inCycle = prevVal % item.targetCount;
                item.monthlyHistory[counterMonthKey] = Math.max(0, prevVal - inCycle);
                item.oldTotalCount = Math.max(0, (item.oldTotalCount || 0) - inCycle);
            } else {
                item.monthlyHistory[counterMonthKey] = 0;
                item.oldTotalCount = Math.max(0, (item.oldTotalCount || 0) - prevVal);
            }
            item.updatedAt = Date.now();
            flashFull = false;
            counterLocked = false;
            persist();
            updateCounterUI();
            if (resetModalInstance) resetModalInstance.hide();
            showToast(type === 'round' ? 'Current round reset' : 'Month count reset to 0');
            return;
        }

        if (type === 'round') {
            item.currentCount = 0;
        } else {
            item.currentCount = 0;
            item.currentCycle = 1;
        }

        item.updatedAt = Date.now();
        flashFull = false;
        counterLocked = false;

        persist();
        updateCounterUI();
        if (resetModalInstance) resetModalInstance.hide();
        showToast(type === 'round' ? 'Current round reset' : 'Counter fully reset');
    }

    /* ---------- Add / Edit Modal ---------- */
    function syncChips() {
        var chips = document.querySelectorAll('#tbCountChips button');
        chips.forEach(function (btn) {
            var v = btn.dataset.count;
            var isOn = v === 'infinite'
                ? countMode === 'infinite'
                : countMode === 'finite' && Number(v) === Number(getEl('tbFormCount').value);
            btn.classList.toggle('active', isOn);
        });
    }

    function openModal(id) {
        editingId = id || null;
        var item = null;
        if (id) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === id) { item = items[i]; break; }
            }
        }

        getEl('tbModalTitle').textContent = item ? 'Edit Dhikr' : 'Add New Dhikr';
        getEl('tbFormTitle').value = item ? item.title : '';

        countMode = item && item.targetCount === 'infinite' ? 'infinite' : 'finite';
        getEl('tbFormCount').value = item && item.targetCount !== 'infinite' ? item.targetCount : 33;
        getEl('tbFormCount').disabled = countMode === 'infinite';

        getEl('tbFormCycles').value = item ? item.targetCycles : 3;

        syncChips();

        var modalEl = getEl('tasbeehModal');
        if (!editModalInstance) {
            editModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
        }
        editModalInstance.show();
    }

    function saveModal() {
        var title = getEl('tbFormTitle').value.trim();
        if (!title) {
            alert('Please enter a chant title.');
            getEl('tbFormTitle').focus();
            return;
        }

        var targetCount = countMode === 'infinite'
            ? 'infinite'
            : clamp(parseInt(getEl('tbFormCount').value, 10) || 33, 1, 9999);

        var targetCycles = clamp(parseInt(getEl('tbFormCycles').value, 10) || 1, 1, 99);

        if (editingId) {
            var item = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === editingId) { item = items[i]; break; }
            }
            if (item) {
                item.title = title;
                item.targetCount = targetCount;
                item.targetCycles = targetCycles;
                item.updatedAt = Date.now();

                if (item.currentCycle > targetCycles) item.currentCycle = targetCycles;
                if (targetCount !== 'infinite' && item.currentCount > targetCount) item.currentCount = 0;

                showToast('Dhikr updated');
            }
        } else {
            items.push(normalizeItem({
                id: uid(),
                title: title,
                targetCount: targetCount,
                targetCycles: targetCycles,
                currentCount: 0,
                currentCycle: 1,
                totalCountToday: 0,
                icon: ICON_POOL[Math.floor(Math.random() * ICON_POOL.length)],
                updatedAt: Date.now()
            }));
            showToast('Dhikr added');
        }

        persist();
        render();

        if (activeId && activeId === editingId) {
            var active = getActiveItem();
            if (active) {
                buildRing(active);
                flashFull = false;
                counterLocked = false;
                updateCounterUI();
            }
        }

        if (editModalInstance) editModalInstance.hide();
        editingId = null;
    }

    function deleteItem(id) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;

        if (!confirm('Delete “' + item.title + '”? This will remove its recorded progress.')) {
            return;
        }

        items = items.filter(function (it) { return it.id !== id; });

        if (activeId === id) {
            closeCounter();
        }

        persist();
        render();
        showToast('Dhikr deleted');
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
        switchTab(activeTab);
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
        switchTab(activeTab);
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
        /* Open Dhikr Add modal */
        var addBtn = getEl('tbAddBtn');
        if (addBtn) {
            addBtn.onclick = function () { openModal(null); };
        }

        var saveBtn = getEl('tbModalSaveBtn');
        if (saveBtn) {
            saveBtn.onclick = saveModal;
        }

        /* Period Settings Modal button in header */
        var settingsBtn = getEl('tbSettingsBtn');
        if (settingsBtn) {
            settingsBtn.onclick = openPeriodModal;
        }

        /* Subtab Switching */
        var tabCurrent = getEl('tabTbCurrent');
        if (tabCurrent) {
            tabCurrent.onclick = function () { switchTab('current'); };
        }

        var tabOld = getEl('tabTbOld');
        if (tabOld) {
            tabOld.onclick = function () { switchTab('old'); };
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

        /* Chips */
        var chipsBox = getEl('tbCountChips');
        if (chipsBox) {
            chipsBox.onclick = function (e) {
                var btn = e.target.closest('button[data-count]');
                if (!btn) return;
                var val = btn.dataset.count;
                var countInput = getEl('tbFormCount');
                if (val === 'infinite') {
                    countMode = 'infinite';
                    countInput.disabled = true;
                } else {
                    countMode = 'finite';
                    countInput.disabled = false;
                    countInput.value = val;
                }
                syncChips();
            };
        }

        var formCount = getEl('tbFormCount');
        if (formCount) {
            formCount.oninput = function () {
                if (formCount.value !== '') countMode = 'finite';
                syncChips();
            };
        }

        /* Steppers */
        var cycMinus = getEl('tbCyclesMinus');
        var cycPlus = getEl('tbCyclesPlus');
        var cycInput = getEl('tbFormCycles');
        if (cycMinus && cycInput) {
            cycMinus.onclick = function () {
                var v = parseInt(cycInput.value, 10) || 1;
                cycInput.value = clamp(v - 1, 1, 99);
            };
        }
        if (cycPlus && cycInput) {
            cycPlus.onclick = function () {
                var v = parseInt(cycInput.value, 10) || 1;
                cycInput.value = clamp(v + 1, 1, 99);
            };
        }


        /* Current List card delegations */
        var listEl = getEl('tbList');
        if (listEl) {
            listEl.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                var card = e.target.closest('[data-id]');
                if (!card) return;
                e.stopPropagation();
                var id = card.dataset.id;
                if (btn) {
                    var act = btn.dataset.act;
                    if (act === 'tb-open') openCounter(id);
                    else if (act === 'tb-edit') openModal(id);
                    else if (act === 'tb-del') deleteItem(id);
                } else {
                    openCounter(id);
                }
            };
        }

        /* Old tab delegation */
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

        /* Counter View Controls */
        var btnBack = getEl('tbBtnBack');
        if (btnBack) btnBack.onclick = closeCounter;

        var btnEditActive = getEl('tbBtnEditActive');
        if (btnEditActive) {
            btnEditActive.onclick = function () {
                if (activeId) openModal(activeId);
            };
        }

        /* Ring Wrap Tap Target */
        var ringWrap = getEl('tbRingWrap') || document.querySelector('[data-ref="page.tasbeeh.counter.ring-wrap"]');
        if (ringWrap) {
            ringWrap.addEventListener('pointerdown', function (e) {
                createRipple(e, ringWrap);
            });
            ringWrap.onclick = increment;
            ringWrap.addEventListener('keydown', function (e) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    increment();
                }
            });
        }

        /* Oversized Tap Target */
        var tapZone = getEl('tbTapZone');
        if (tapZone) {
            tapZone.addEventListener('pointerdown', function (e) {
                createRipple(e, tapZone);
            });
            tapZone.onclick = increment;
        }

        /* Counter Footer Action Buttons */
        var counterControls = getEl('tbCounterControls');
        if (counterControls) {
            counterControls.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                if (!btn) return;
                var act = btn.dataset.act;
                if (act === 'tb-reset') {
                    promptReset();
                } else if (act === 'tb-undo') {
                    undo();
                }
            };
        }

        /* Reset Dialog Buttons */
        var btnResetRound = getEl('tbBtnResetRound');
        if (btnResetRound) {
            btnResetRound.onclick = function () { doReset('round'); };
        }
        var btnResetAll = getEl('tbBtnResetAll');
        if (btnResetAll) {
            btnResetAll.onclick = function () { doReset('all'); };
        }

        /* Keyboard shortcuts */
        document.addEventListener('keydown', function (e) {
            var counterView = getEl('tasbeehCounterView');
            var isOverlayOpen = counterView && !counterView.classList.contains('d-none');
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (isOverlayOpen) {
                if (e.code === 'Space' || e.code === 'Enter') {
                    e.preventDefault();
                    increment();
                } else if (e.code === 'Backspace') {
                    e.preventDefault();
                    undo();
                } else if (e.code === 'Escape') {
                    closeCounter();
                }
            }
        });
    }

    /* ---------- Public API ---------- */
    function init() {
        items = loadItems();
        checkDailyReset();
        loadPeriod();
        persist();
        bindEvents();
        switchTab('current');
    }

    return {
        init: init,
        render: render,
        switchTab: switchTab,
        openCounter: openCounter,
        openCounterOld: openCounterOld,
        closeCounter: closeCounter,
        openModal: openModal,
        openPeriodModal: openPeriodModal,
        markCurrentMonthCompleted: markMonthCompleted,
        reopenLastMonth: reopenLastMonth,
        resetAllCompleted: resetAllCompleted,
        prevOldMonth: prevOldMonth,
        nextOldMonth: nextOldMonth,
        editOldItemCount: editOldItemCount,
        toggleOldItemDone: toggleOldItemDone,
        getCurrentOldMonth: getCurrentOldMonth,
        loadPeriod: loadPeriod,
        savePeriod: savePeriod
    };
})();
