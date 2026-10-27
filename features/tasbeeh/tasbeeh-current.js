/* ============================================================
   Nur Prayer — Digital Tasbeeh: Current View Module
   Path: features/tasbeeh/tasbeeh-current.js
   Handles:
     - Dhikr items data layer & local storage persistence
     - Calendar Tracker overlay (monthly calendar with day-by-day target completion)
     - Calendar completions data layer & daily tracking
     - Current tab rendering (TO DO & COMPLETED groups, daily progress)
     - Add / Edit Dhikr modal (Title & Daily Target Count)
     - Tab navigation coordinator (Home / Current / Old / History)
   ============================================================ */
'use strict';

window.TasbeehCurrentApp = (function () {
    /* ---------- Constants & Presets (Referenced from utilities/constant.js) ---------- */
    var TASBEEH_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.TASBEEH) || {};
    var STORAGE_KEY = (TASBEEH_CONSTANTS.STORAGE_KEYS && TASBEEH_CONSTANTS.STORAGE_KEYS.DATA) || 'app_tasbeeh_data';
    var DAY_KEY = (TASBEEH_CONSTANTS.STORAGE_KEYS && TASBEEH_CONSTANTS.STORAGE_KEYS.DAY) || 'app_tasbeeh_day';
    var BM_CUR_KEY = (TASBEEH_CONSTANTS.STORAGE_KEYS && TASBEEH_CONSTANTS.STORAGE_KEYS.BOOKMARK_CURRENT) || 'app_tasbeeh_bookmark_current';
    var BM_OLD_KEY = (TASBEEH_CONSTANTS.STORAGE_KEYS && TASBEEH_CONSTANTS.STORAGE_KEYS.BOOKMARK_OLD) || 'app_tasbeeh_bookmark_old';
    var CURRENT_PERIOD_KEY = (TASBEEH_CONSTANTS.STORAGE_KEYS && TASBEEH_CONSTANTS.STORAGE_KEYS.CURRENT_PERIOD) || 'app_tasbeeh_current_period';
    var CAL_COMPLETION_KEY = 'app_tasbeeh_cal_completions';
    var counterOpenedFrom = null;

    var DEFAULT_PRESETS = [
        { title: 'SubhanAllah', targetCount: 33 },
        { title: 'Alhamdulillah', targetCount: 33 },
        { title: 'Allahu Akbar', targetCount: 34 },
        { title: 'Astaghfirullah', targetCount: 100 }
    ];

    /* ---------- State ---------- */
    var items = [];
    var activeId = null;
    var editingId = null;
    var activeTab = 'current'; // 'home', 'current', 'old', 'history'
    var counterMonthKey = null; // When tracking for a specific old month, e.g. "2026-09"
    var countMode = 'finite';

    /* Calendar State */
    var calViewYear = null;
    var calViewMonth = null; // 0-indexed: 0 = Jan, 11 = Dec
    var pendingToggleDate = null; // Stored date when confirmation modal is shown
    var pendingConfirmCallback = null; // Callback for month completion confirmation

    /* Modal Instances */
    var editModalInstance = null;
    var confirmModalInstance = null;

    /* Calendar completions map: { [itemId]: { "2026-10-15": true, ... } } */
    var calCompletions = {};

    /* ---------- Calendar Completions Storage & Helpers ---------- */
    function loadCalCompletions() {
        try {
            var raw = localStorage.getItem(CAL_COMPLETION_KEY);
            if (raw) {
                calCompletions = JSON.parse(raw);
                if (typeof calCompletions !== 'object' || calCompletions === null) {
                    calCompletions = {};
                }
            }
        } catch (_) {
            calCompletions = {};
        }
    }

    function persistCalCompletions() {
        try {
            localStorage.setItem(CAL_COMPLETION_KEY, JSON.stringify(calCompletions));
        } catch (_) { }
    }

    function isDayCompleted(itemId, dateStr) {
        return !!(calCompletions[itemId] && calCompletions[itemId][dateStr] === true);
    }

    function setDayCompleted(itemId, dateStr, completed) {
        if (!itemId || !dateStr) return;
        if (!calCompletions[itemId]) {
            calCompletions[itemId] = {};
        }
        if (completed) {
            calCompletions[itemId][dateStr] = true;
        } else {
            delete calCompletions[itemId][dateStr];
        }
        persistCalCompletions();

        // Synchronize item history for stats and backwards compatibility
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === itemId) { item = items[i]; break; }
        }
        if (item) {
            var monthKey = dateStr.slice(0, 7);
            var parts = monthKey.split('-');
            var yr = parseInt(parts[0], 10);
            var mo = parseInt(parts[1], 10) - 1;
            var completedDays = getCompletedDaysInMonth(itemId, yr, mo);
            var targetNum = item.targetCount === 'infinite' ? 100 : item.targetCount;

            item.dailyHistory = item.dailyHistory || {};
            if (completed) {
                item.dailyHistory[dateStr] = targetNum;
            } else {
                delete item.dailyHistory[dateStr];
            }

            item.monthlyHistory = item.monthlyHistory || {};
            item.monthlyHistory[monthKey] = completedDays * targetNum;
            item.updatedAt = Date.now();
            persist();
        }
    }

    function getDaysInMonth(year, month) {
        // month is 0-indexed (0=Jan, 11=Dec)
        return new Date(year, month + 1, 0).getDate();
    }

    function getFirstDayOfMonth(year, month) {
        return new Date(year, month, 1).getDay(); // 0=Sun, 6=Sat
    }

    function makeDateStr(year, month, day) {
        return year + '-' + pad2(month + 1) + '-' + pad2(day);
    }

    function getCompletedDaysInMonth(itemId, year, month) {
        if (!calCompletions[itemId]) return 0;
        var prefix = year + '-' + pad2(month + 1) + '-';
        var count = 0;
        var daysInM = getDaysInMonth(year, month);
        for (var d = 1; d <= daysInM; d++) {
            var ds = prefix + pad2(d);
            if (calCompletions[itemId][ds] === true) {
                count++;
            }
        }
        return count;
    }

    /* ---------- Current Period Storage Layer (Month-by-Month) ---------- */
    function loadCurrentPeriod() {
        var defaultStartMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (new Date().getFullYear() + '-' + pad2(new Date().getMonth() + 1));
        try {
            var raw = localStorage.getItem(CURRENT_PERIOD_KEY);
            if (!raw) {
                var initial = { startDate: defaultStartMonth, updatedAt: Date.now() };
                localStorage.setItem(CURRENT_PERIOD_KEY, JSON.stringify(initial));
                return initial;
            }
            var p = JSON.parse(raw);
            if (!p || !p.startDate) {
                return { startDate: defaultStartMonth, updatedAt: Date.now() };
            }
            var norm = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(p.startDate) : String(p.startDate).slice(0, 7)) || defaultStartMonth;
            return {
                startDate: norm,
                updatedAt: p.updatedAt || Date.now()
            };
        } catch (_) {
            return { startDate: defaultStartMonth, updatedAt: Date.now() };
        }
    }

    function saveCurrentPeriod(startMonth) {
        var defaultStartMonth = typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey() : (new Date().getFullYear() + '-' + pad2(new Date().getMonth() + 1));
        var norm = (typeof normalizeMonthKey === 'function' ? normalizeMonthKey(startMonth) : String(startMonth).slice(0, 7)) || defaultStartMonth;
        var p = {
            startDate: norm,
            updatedAt: Date.now()
        };
        try {
            localStorage.setItem(CURRENT_PERIOD_KEY, JSON.stringify(p));
        } catch (_) { }
        return p;
    }

    function getCurrentTrackingMonth() {
        return loadCurrentPeriod().startDate;
    }

    /* ---------- Month Data Removal & Completion Check ---------- */
    function removeMonthTrackingData(mKey) {
        if (!mKey) return;
        var prefix = mKey + '-';
        // 1. Remove calendar completions for this month
        for (var itemId in calCompletions) {
            if (Object.prototype.hasOwnProperty.call(calCompletions, itemId)) {
                var dayMap = calCompletions[itemId];
                if (dayMap && typeof dayMap === 'object') {
                    for (var d in dayMap) {
                        if (d.indexOf(prefix) === 0) {
                            delete dayMap[d];
                        }
                    }
                }
            }
        }
        persistCalCompletions();

        // 2. Remove daily and monthly history for this month
        items.forEach(function (it) {
            if (it.dailyHistory && typeof it.dailyHistory === 'object') {
                for (var d2 in it.dailyHistory) {
                    if (d2.indexOf(prefix) === 0) {
                        delete it.dailyHistory[d2];
                    }
                }
            }
            if (it.monthlyHistory && typeof it.monthlyHistory === 'object') {
                delete it.monthlyHistory[mKey];
            }
            it.updatedAt = Date.now();
        });
        persist();
    }

    function isMonthFullyCompleted(mKey) {
        if (!mKey) return false;
        var finiteItems = items.filter(function (it) { return it.targetCount !== 'infinite'; });
        if (finiteItems.length === 0) return false;
        var parts = mKey.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = getDaysInMonth(yr, mo);
        if (totalDays <= 0) return false;

        return finiteItems.every(function (it) {
            var completedDays = getCompletedDaysInMonth(it.id, yr, mo);
            return completedDays >= totalDays;
        });
    }

    /* ---------- Confirmation Action Dialog (Bootstrap Modal + Fallback) ---------- */
    function confirmAction(options, onConfirm) {
        pendingConfirmCallback = onConfirm || null;
        pendingToggleDate = null;

        var confirmModalEl = getEl('tasbeehConfirmModal');
        var titleEl = getEl('tbConfirmModalTitle');
        var msgEl = getEl('tbConfirmModalMsg');
        var btnEl = getEl('tbBtnConfirmChange');
        var iconEl = getEl('tbConfirmModalIcon');
        var badgeEl = getEl('tbConfirmModalBadge');

        if (titleEl) titleEl.textContent = options.title || 'Confirm';
        if (msgEl) msgEl.innerHTML = options.message || '';
        if (btnEl) btnEl.textContent = options.btnText || 'Confirm';

        if (iconEl && badgeEl) {
            if (options.isSuccess) {
                badgeEl.className = 'modal-icon-badge bg-success-subtle';
                iconEl.className = 'fa-solid fa-circle-check fs-3 text-success';
            } else {
                badgeEl.className = 'modal-icon-badge bg-warning-subtle';
                iconEl.className = 'fa-solid fa-triangle-exclamation fs-3 text-warning';
            }
        }

        if (confirmModalEl && window.bootstrap && typeof window.bootstrap.Modal === 'function') {
            if (!confirmModalInstance) {
                confirmModalInstance = bootstrap.Modal.getOrCreateInstance(confirmModalEl);
                confirmModalEl.addEventListener('hidden.bs.modal', function () {
                    pendingToggleDate = null;
                    pendingConfirmCallback = null;
                });
            }
            confirmModalInstance.show();
        } else {
            var plain = (options.message || '').replace(/<br\s*[\/]?>/gi, '\n').replace(/<[^>]+>/g, '');
            if (window.confirm((options.title || 'Confirm') + '\n\n' + plain)) {
                if (typeof pendingConfirmCallback === 'function') {
                    var cb = pendingConfirmCallback;
                    pendingConfirmCallback = null;
                    cb();
                }
            } else {
                pendingConfirmCallback = null;
            }
        }
    }

    function advanceCurrentMonth() {
        var curMonthKey = getCurrentTrackingMonth();
        if (!isMonthFullyCompleted(curMonthKey)) {
            showToast('Please complete all targets for ' + formatMonthLabel(curMonthKey) + ' before moving to next month.');
            return;
        }
        var nextMonthKey = typeof getNextMonthKey === 'function' ? getNextMonthKey(curMonthKey) : (function (m) {
            var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) + 1;
            if (mo > 12) { mo = 1; y++; } return y + '-' + pad2(mo);
        })(curMonthKey);

        var curLabel = formatMonthLabel(curMonthKey);
        var nextLabel = formatMonthLabel(nextMonthKey);

        confirmAction({
            title: '🎉 Month Completed!',
            message: 'All dhikr targets for <strong>' + curLabel + '</strong> are completed!<br><br>' +
                     'Do you want to finalize this month, remove its tracking data, and advance to <strong>' + nextLabel + '</strong>?',
            btnText: 'Finalize & Advance',
            isSuccess: true
        }, function () {
            removeMonthTrackingData(curMonthKey);
            saveCurrentPeriod(nextMonthKey);

            if (counterMonthKey === null && activeId) {
                var parts = nextMonthKey.split('-');
                calViewYear = parseInt(parts[0], 10);
                calViewMonth = parseInt(parts[1], 10) - 1;
                renderCalendar();
            }
            renderCurrentTab();
            showToast('🎉 ' + curLabel + ' completed! Advanced to ' + nextLabel, 3500);
        });
    }

    function advanceOldMonth() {
        if (!window.TasbeehOldApp || typeof window.TasbeehOldApp.getCurrentOldMonth !== 'function') return;
        var curOldMonth = window.TasbeehOldApp.getCurrentOldMonth();
        if (!curOldMonth) return;

        if (!isMonthFullyCompleted(curOldMonth)) {
            showToast('Please complete all targets for ' + formatMonthLabel(curOldMonth) + ' before moving to previous month.');
            return;
        }

        var prevMonthKey = typeof getPrevMonthKey === 'function' ? getPrevMonthKey(curOldMonth) : (function (m) {
            var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) - 1;
            if (mo === 0) { mo = 12; y--; } return y + '-' + pad2(mo);
        })(curOldMonth);

        var curLabel = formatMonthLabel(curOldMonth);
        var prevLabel = formatMonthLabel(prevMonthKey);
        var period = window.TasbeehOldApp.loadPeriod();
        var isAllCleared = (prevMonthKey < period.startDate);

        confirmAction({
            title: '🎉 Month Completed!',
            message: 'All dhikr targets for <strong>' + curLabel + '</strong> are completed!<br><br>' +
                     'Do you want to finalize this month, remove its tracking data, and ' +
                     (isAllCleared ? 'complete all Old Tracking months?' : ('move to <strong>' + prevLabel + '</strong>?')),
            btnText: 'Finalize & Move Backward',
            isSuccess: true
        }, function () {
            removeMonthTrackingData(curOldMonth);
            window.TasbeehOldApp.savePeriod(period.startDate, prevMonthKey, period.initialEnd);

            if (counterMonthKey !== null && activeId) {
                if (isAllCleared) {
                    closeCounter();
                } else {
                    counterMonthKey = prevMonthKey;
                    var parts = prevMonthKey.split('-');
                    calViewYear = parseInt(parts[0], 10);
                    calViewMonth = parseInt(parts[1], 10) - 1;
                    renderCalendar();
                    var act = getActiveItem();
                    var topTitle = (act ? act.title : 'Chant') + ' (' + formatMonthLabel(prevMonthKey) + ')';
                    var topTitleEl = getEl('tbCounterTopTitle');
                    if (topTitleEl) topTitleEl.textContent = topTitle;
                }
            }
            if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
                window.TasbeehOldApp.renderOldTab();
            }
            if (isAllCleared) {
                showToast('🎉 ' + curLabel + ' completed! All old tracking months cleared!', 3500);
            } else {
                showToast('🎉 ' + curLabel + ' completed! Moved to ' + prevLabel, 3500);
            }
        });
    }

    /* ---------- Storage Layer ---------- */
    function normalizeItem(raw) {
        var norm = {
            id: raw.id || uid(),
            title: raw.title || 'Dhikr',
            targetCount: raw.targetCount === 'infinite' ? 'infinite' : clamp(parseInt(raw.targetCount, 10) || 33, 1, 9999),
            icon: raw.icon || 'fa-solid fa-ring',
            updatedAt: raw.updatedAt || Date.now(),
            dailyHistory: (raw.dailyHistory && typeof raw.dailyHistory === 'object') ? Object.assign({}, raw.dailyHistory) : {},
            monthlyHistory: (raw.monthlyHistory && typeof raw.monthlyHistory === 'object') ? Object.assign({}, raw.monthlyHistory) : {}
        };

        // Preserve legacy fields if present so no data is lost
        if (raw.targetCycles !== undefined) norm.targetCycles = raw.targetCycles;
        if (raw.currentCycle !== undefined) norm.currentCycle = raw.currentCycle;
        if (raw.currentCount !== undefined) norm.currentCount = raw.currentCount;
        if (raw.totalCountToday !== undefined) norm.totalCountToday = raw.totalCountToday;
        if (raw.oldTotalCount !== undefined) norm.oldTotalCount = raw.oldTotalCount;

        return norm;
    }

    function loadItems() {
        var raw = localStorage.getItem(STORAGE_KEY);
        if (raw === null) {
            return DEFAULT_PRESETS.map(function (p) {
                return normalizeItem({
                    title: p.title,
                    targetCount: p.targetCount
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

    function checkDailyReset() {
        var today = todayKey();
        var last = localStorage.getItem(DAY_KEY);
        if (last !== today) {
            localStorage.setItem(DAY_KEY, today);
        }
    }

    function getActiveItem() {
        if (!activeId) return null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === activeId) return items[i];
        }
        return null;
    }

    function getItems() {
        return items;
    }

    function setItems(newItems) {
        items = newItems || [];
        persist();
    }

    /* ---------- Bookmark Storage & Retrieval ---------- */
    function getBookmark(type) {
        var key = type === 'old' ? BM_OLD_KEY : BM_CUR_KEY;
        try {
            var raw = localStorage.getItem(key);
            if (!raw) return null;
            if (raw.charAt(0) === '{') {
                return JSON.parse(raw);
            }
            return { id: raw };
        } catch (_) {
            return null;
        }
    }

    function setBookmark(type, id, monthKey) {
        if (!id) return;
        var key = type === 'old' ? BM_OLD_KEY : BM_CUR_KEY;
        try {
            if (type === 'old') {
                localStorage.setItem(key, JSON.stringify({ id: id, month: monthKey || null }));
            } else {
                localStorage.setItem(key, JSON.stringify({ id: id }));
            }
        } catch (_) { }
    }

    function getBookmarkedChants() {
        if (!items || items.length === 0) {
            items = loadItems();
        }

        var curMonthKey = getCurrentTrackingMonth();
        var curParts = curMonthKey.split('-');
        var curYear = parseInt(curParts[0], 10);
        var curMonth = parseInt(curParts[1], 10) - 1;
        var curTotalDays = getDaysInMonth(curYear, curMonth);

        // 1. Current Tracking Bookmark
        var curBm = getBookmark('current');
        var curItem = null;
        if (curBm && curBm.id) {
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === curBm.id) { curItem = items[i]; break; }
            }
        }
        if (!curItem && items.length > 0) {
            curItem = items[0];
            setBookmark('current', curItem.id);
        }

        var curCompletedDays = curItem ? getCompletedDaysInMonth(curItem.id, curYear, curMonth) : 0;
        var curTargetDisplay = curItem ? (curItem.targetCount === 'infinite' ? '∞' : curItem.targetCount) : '—';
        var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);
        var curIsTodayDone = (curItem && isTodayInCurMonth) ? isDayCompleted(curItem.id, td()) : false;
        var curMonthName = formatMonthLabel(curMonthKey);

        // 2. Old Tracking Bookmark
        var oldBm = getBookmark('old');
        var oldItem = null;
        var oldMonthKey = (window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function')
            ? window.TasbeehOldApp.getCurrentOldMonth()
            : (oldBm ? oldBm.month : null);

        if (oldBm && oldBm.id) {
            for (var j = 0; j < items.length; j++) {
                if (items[j].id === oldBm.id) { oldItem = items[j]; break; }
            }
        }
        if (!oldItem && items.length > 0) {
            oldItem = items.length > 1 ? items[1] : items[0];
        }

        var oldYear = curYear;
        var oldMonth = curMonth - 1;
        if (oldMonthKey) {
            var p = oldMonthKey.split('-');
            oldYear = parseInt(p[0], 10);
            oldMonth = parseInt(p[1], 10) - 1;
        }
        var oldTotalDays = getDaysInMonth(oldYear, oldMonth);
        var oldCompletedDays = (oldItem && oldMonthKey) ? getCompletedDaysInMonth(oldItem.id, oldYear, oldMonth) : 0;
        var oldTargetDisplay = oldItem ? (oldItem.targetCount === 'infinite' ? '∞' : oldItem.targetCount) : '—';
        var oldMonthName = oldMonthKey ? formatMonthLabel(oldMonthKey) : 'All Completed';

        return {
            current: curItem ? {
                item: curItem,
                monthKey: curMonthKey,
                monthName: curMonthName,
                completedDays: curCompletedDays,
                totalDays: curTotalDays,
                targetDisplay: curTargetDisplay,
                isTodayDone: curIsTodayDone
            } : null,
            old: oldItem ? {
                item: oldItem,
                monthKey: oldMonthKey,
                monthName: oldMonthName,
                completedDays: oldCompletedDays,
                totalDays: oldTotalDays,
                targetDisplay: oldTargetDisplay
            } : null
        };
    }

    function openCounterFromHome(id, monthKey, type) {
        counterOpenedFrom = 'home';
        if (typeof showPage === 'function') {
            showPage('tasbeeh');
        }
        if (type === 'old') {
            switchTab('old');
            openCounterOld(id, monthKey);
        } else {
            switchTab('current');
            openCounter(id);
        }
    }

    /* ---------- Current Card HTML Generator ---------- */
    function renderCurrentCardHtml(item, isComplete) {
        var curMonthKey = getCurrentTrackingMonth();
        var parts = curMonthKey.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = getDaysInMonth(yr, mo);
        var completedDays = getCompletedDaysInMonth(item.id, yr, mo);
        var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);
        var isTodayDone = isTodayInCurMonth ? isDayCompleted(item.id, td()) : false;
        var isInfinite = item.targetCount === 'infinite';
        var targetDisplay = isInfinite ? '∞' : item.targetCount;
        var icons = (window.CONSTANTS && window.CONSTANTS.TASBEEH && window.CONSTANTS.TASBEEH.ICONS) || {};

        return '<div class="tb-card ' + (isComplete ? 'tb-card-done' : '') + '" data-id="' + item.id + '" data-ref="page.tasbeeh.card" role="button" tabindex="0" aria-label="' + escHtml(item.title) + '">' +
            '<div class="tb-card-top">' +
            '<div class="tb-card-icon-box" data-ref="page.tasbeeh.card.icon">' +
            (icons.MISBAHA || '<i class="fa-solid fa-hand-holding-heart"></i>') +
            '</div>' +
            '<div class="tb-card-actions">' +
            '<button type="button" class="tb-btn-edit" data-act="tb-edit" title="Edit Dhikr" aria-label="Edit Dhikr" data-ref="page.tasbeeh.card.edit-btn">' +
            (icons.PENCIL || '<i class="fa-solid fa-pen"></i>') +
            '</button>' +
            (icons.CHEVRON || '<svg class="tb-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>') +
            '</div>' +
            '</div>' +
            '<div class="tb-card-body" data-ref="page.tasbeeh.card.info">' +
            '<h6 class="tb-card-title" data-ref="page.tasbeeh.card.title">' + escHtml(item.title) + '</h6>' +
            '<div class="tb-card-meta" data-ref="page.tasbeeh.card.meta">' +
            '<div class="tb-meta-row">' +
            (icons.TARGET || '<i class="fa-solid fa-bullseye"></i>') +
            '<span class="tb-meta-text">Target: <span class="tb-val-num">' + targetDisplay + '</span> / day</span>' +
            '</div>' +
            '<div class="tb-meta-row">' +
            (icons.CHECK_CIRCLE || '<i class="fa-solid fa-circle-check"></i>') +
            '<span class="tb-meta-text">Completed: <strong class="tb-val-done">' + completedDays + '</strong><span class="tb-val-total"> / ' + totalDays + ' days</span></span>' +
            '</div>' +
            (isTodayDone
                ? '<div class="tb-meta-row tb-meta-sub-row"><span class="text-success fw-bold" style="font-size: 11px;"><i class="fa-solid fa-circle-check me-1"></i>Today Completed</span></div>'
                : '') +
            '</div>' +
            '</div>' +
            '</div>';
    }

    /* ---------- Rendering: Current Tab (Month-by-Month) ---------- */
    function renderCurrentTab() {
        var listEl = getEl('tbList');
        var emptyEl = getEl('tbEmptyState');

        if (!listEl) return;

        if (items.length === 0) {
            if (emptyEl) emptyEl.classList.remove('d-none');
            listEl.innerHTML = '';
            return;
        }

        if (emptyEl) emptyEl.classList.add('d-none');

        var curMonthKey = getCurrentTrackingMonth();
        var parts = curMonthKey.split('-');
        var yr = parseInt(parts[0], 10);
        var mo = parseInt(parts[1], 10) - 1;
        var totalDays = getDaysInMonth(yr, mo);
        var curMonthName = formatMonthLabel(curMonthKey);

        var sub = getEl('tbHeaderSub');
        if (sub && activeTab === 'current') {
            sub.textContent = curMonthName;
        }

        var todoItems = [];
        var doneItems = [];
        var isTodayInCurMonth = (td().slice(0, 7) === curMonthKey);

        items.forEach(function (item) {
            var completedDays = getCompletedDaysInMonth(item.id, yr, mo);
            var isTodayDone = isTodayInCurMonth ? isDayCompleted(item.id, td()) : false;
            var isAllMonthDone = totalDays > 0 && completedDays >= totalDays;

            // Dhikr is in COMPLETED group if all month is complete or today's target is complete
            if (isAllMonthDone || (isTodayInCurMonth && isTodayDone)) {
                doneItems.push(item);
            } else {
                todoItems.push(item);
            }
        });

        var isMonthComplete = isMonthFullyCompleted(curMonthKey);
        var todoCardsHtml = todoItems.length > 0
            ? todoItems.map(function (it) { return renderCurrentCardHtml(it, false); }).join('')
            : (isMonthComplete
                ? '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
                  '<i class="fa-solid fa-circle-check text-success fs-3 mb-2"></i>' +
                  '<div class="fw-bold text-gr1">All Dhikrs for ' + curMonthName + ' Completed!</div>' +
                  '<div class="text-muted small mb-3">All daily targets for this month have been achieved.</div>' +
                  '<button type="button" class="btn btn-brand btn-sm fw-bold rounded-pill px-4 py-2 mx-auto" data-act="tb-current-advance">' +
                  '<i class="fa-solid fa-arrow-right me-1"></i> Finalize & Advance to Next Month' +
                  '</button>' +
                  '</div>'
                : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
                  '<i class="fa-solid fa-circle-check text-success fs-3 mb-2"></i>' +
                  '<div class="fw-bold text-gr1">All Dhikrs Completed Today!</div>' +
                  '<div class="text-muted small">You have met today’s targets for all your chants.</div>' +
                  '</div>');

        var doneCardsHtml = doneItems.length > 0
            ? doneItems.map(function (it) { return renderCurrentCardHtml(it, true); }).join('')
            : '<div class="card p-3 text-center border-0 rounded-4 bg-white shadow-sm">' +
              '<div class="text-muted small">No completed Dhikrs for ' + curMonthName + ' yet. Mark your daily targets to see them here.</div>' +
              '</div>';

        var isDoneExpanded = doneItems.length > 0;

        var html =
            '<!-- TO DO GROUP -->' +
            '<section class="prayer-group mb-3" data-ref="page.tasbeeh.group.todo">' +
            '<button type="button" class="group-toggle tb-group-toggle py-1 d-flex align-items-center gap-2" data-bs-toggle="collapse" data-bs-target="#tbCurrentTodoList" aria-expanded="true">' +
            '<span class="tb-toggle-icon">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0b3829" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
            '<path d="m6 9 6 6 6-6"/>' +
            '</svg>' +
            '</span>' +
            '<span class="tb-group-title">To Do</span>' +
            '<span class="tb-group-badge">' + todoItems.length + '</span>' +
            '</button>' +
            '<div class="collapse show" id="tbCurrentTodoList">' +
            '<div class="tb-grid mt-2">' +
            todoCardsHtml +
            '</div>' +
            '</div>' +
            '</section>' +

            '<!-- COMPLETED GROUP -->' +
            '<section class="prayer-group mb-3" data-ref="page.tasbeeh.group.done">' +
            '<button type="button" class="group-toggle tb-group-toggle py-1 d-flex align-items-center gap-2 ' + (isDoneExpanded ? '' : 'collapsed') + '" data-bs-toggle="collapse" data-bs-target="#tbCurrentDoneList" aria-expanded="' + (isDoneExpanded ? 'true' : 'false') + '">' +
            '<span class="tb-toggle-icon">' +
            '<svg width="11" height="11" viewBox="0 0 24 24" fill="#0b3829">' +
            '<path d="m5 8 7 8 7-8z"/>' +
            '</svg>' +
            '</span>' +
            '<span class="tb-group-title-completed">COMPLETED</span>' +
            '<span class="tb-group-badge">' + doneItems.length + '</span>' +
            '</button>' +
            '<div class="collapse ' + (isDoneExpanded ? 'show' : '') + '" id="tbCurrentDoneList">' +
            '<div class="tb-grid mt-2">' +
            doneCardsHtml +
            '</div>' +
            '</div>' +
            '</section>';

        listEl.innerHTML = html;
    }

    /* ---------- Tab Navigation & Rendering ---------- */
    function render() {
        if (activeTab === 'home') {
            if (window.TasbeehHomeApp && typeof window.TasbeehHomeApp.renderHomeTab === 'function') {
                window.TasbeehHomeApp.renderHomeTab();
            }
        } else if (activeTab === 'old') {
            if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
                window.TasbeehOldApp.renderOldTab();
            }
        } else if (activeTab === 'history') {
            if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
                window.TasbeehHistoryApp.renderHistoryTab();
            }
        } else {
            renderCurrentTab();
        }
    }

    function switchTab(tab) {
        activeTab = (tab === 'old' || tab === 'history' || tab === 'home') ? tab : 'current';
        var btnHome = getEl('tabTbHome');
        var btnCur = getEl('tabTbCurrent');
        var btnOld = getEl('tabTbOld');
        var btnHist = getEl('tabTbHistory');

        var bodyHome = getEl('tbHomeBody');
        var bodyCur = getEl('tbCurrentBody');
        var bodyOld = getEl('tbOldBody');
        var bodyHist = getEl('tbHistoryBody');

        var addBtn = getEl('tbAddBtn');
        var icon = getEl('tbHeaderIcon');
        var label = getEl('tbHeaderLabel');
        var sub = getEl('tbHeaderSub');

        // Reset all tabs
        var allBtns = [btnHome, btnCur, btnOld, btnHist];
        for (var i = 0; i < allBtns.length; i++) {
            if (allBtns[i]) {
                allBtns[i].classList.remove('active');
                allBtns[i].setAttribute('aria-selected', 'false');
            }
        }

        // Hide all body containers
        var allBodies = [bodyHome, bodyCur, bodyOld, bodyHist];
        for (var j = 0; j < allBodies.length; j++) {
            if (allBodies[j]) {
                allBodies[j].classList.add('d-none');
            }
        }

        if (activeTab === 'home') {
            if (btnHome) { btnHome.classList.add('active'); btnHome.setAttribute('aria-selected', 'true'); }
            if (bodyHome) bodyHome.classList.remove('d-none');
            if (addBtn) addBtn.classList.add('d-none');
            if (icon) icon.className = 'fa-solid fa-house text-success';
            if (label) label.textContent = 'Digital Tasbeeh';
            if (sub) sub.textContent = 'Home · Bookmarks';

            if (window.TasbeehHomeApp && typeof window.TasbeehHomeApp.renderHomeTab === 'function') {
                window.TasbeehHomeApp.renderHomeTab();
            }
        } else if (activeTab === 'old') {
            if (btnOld) { btnOld.classList.add('active'); btnOld.setAttribute('aria-selected', 'true'); }
            if (bodyOld) bodyOld.classList.remove('d-none');
            if (addBtn) addBtn.classList.remove('d-none');
            if (icon) icon.className = 'fa-solid fa-clock-rotate-left text-warning';
            if (label) label.textContent = 'Old Tasbeeh';

            var curOldM = window.TasbeehOldApp && typeof window.TasbeehOldApp.getCurrentOldMonth === 'function'
                ? window.TasbeehOldApp.getCurrentOldMonth()
                : null;

            if (sub) {
                sub.textContent = curOldM ? formatMonthLabel(curOldM) : 'All Completed';
            }

            if (window.TasbeehOldApp && typeof window.TasbeehOldApp.renderOldTab === 'function') {
                window.TasbeehOldApp.renderOldTab();
            }
        } else if (activeTab === 'history') {
            if (btnHist) { btnHist.classList.add('active'); btnHist.setAttribute('aria-selected', 'true'); }
            if (bodyHist) bodyHist.classList.remove('d-none');
            if (addBtn) addBtn.classList.add('d-none');
            if (icon) icon.className = 'fa-solid fa-gear text-gr-accent';
            if (label) label.textContent = 'Tasbeeh History';
            if (sub) sub.textContent = 'Period & Settings';

            if (window.TasbeehHistoryApp && typeof window.TasbeehHistoryApp.renderHistoryTab === 'function') {
                window.TasbeehHistoryApp.renderHistoryTab();
            }
        } else {
            if (btnCur) { btnCur.classList.add('active'); btnCur.setAttribute('aria-selected', 'true'); }
            if (bodyCur) bodyCur.classList.remove('d-none');
            if (addBtn) addBtn.classList.remove('d-none');
            if (icon) icon.className = 'fa-regular fa-calendar text-primary';
            if (label) label.textContent = 'Digital Tasbeeh';
            if (sub) sub.textContent = formatMonthLabel(getCurrentTrackingMonth());

            renderCurrentTab();
        }
    }

    /* ---------- Monthly Calendar Tracker ---------- */
    function renderCalendar() {
        var item = getActiveItem();
        if (!item) return;

        var grid = getEl('tbCalGrid');
        if (!grid) return;

        var year = calViewYear;
        var month = calViewMonth;
        var daysInMonth = getDaysInMonth(year, month);
        var firstDay = getFirstDayOfMonth(year, month);

        var isInfinite = item.targetCount === 'infinite';
        var targetDisplay = isInfinite ? '∞' : item.targetCount;

        var todayStr = td();

        var html = '';
        var completedCount = 0;
        var totalDays = daysInMonth;

        // Empty offset cells for days before the 1st
        for (var e = 0; e < firstDay; e++) {
            html += '<div class="tb-cal-cell tb-cal-empty" aria-hidden="true"></div>';
        }

        // Calendar day cells
        for (var d = 1; d <= daysInMonth; d++) {
            var dateStr = makeDateStr(year, month, d);
            var isToday = (dateStr === todayStr);
            var isCompleted = isDayCompleted(item.id, dateStr);

            if (isCompleted) completedCount++;

            var classes = 'tb-cal-cell';
            if (isCompleted) classes += ' tb-cal-done';
            if (isToday) classes += ' tb-cal-today';

            html += '<div class="' + classes + '" data-date="' + dateStr + '" role="button" tabindex="0" ' +
                'aria-label="' + d + ' ' + (isCompleted ? 'Completed' : 'Pending') + '">' +
                '<span class="tb-cal-date">' + d + '</span>' +
                '</div>';
        }

        grid.innerHTML = html;

        // Month & Year header label
        var monthLabel = getEl('tbCalMonthLabel');
        if (monthLabel) {
            var dateObj = new Date(year, month, 1);
            monthLabel.textContent = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
        }

        // Target pill label
        var targetLabel = getEl('tbCalTargetLabel');
        if (targetLabel) {
            targetLabel.textContent = isInfinite ? 'Target: ∞ / day' : ('Target: ' + item.targetCount + ' / day');
        }

        // Update progress summary bar
        var remaining = Math.max(0, totalDays - completedCount);
        var pct = totalDays > 0 ? Math.round((completedCount / totalDays) * 100) : 0;

        var completedEl = getEl('tbCalCompletedCount');
        var remainingEl = getEl('tbCalRemainingCount');
        var pctEl = getEl('tbCalProgressPct');

        if (completedEl) completedEl.textContent = completedCount;
        if (remainingEl) remainingEl.textContent = remaining;
        if (pctEl) pctEl.textContent = pct + '%';

        // Setup Month Navigation Controls (Current vs Old)
        var activeMKey = counterMonthKey || getCurrentTrackingMonth();
        var isOldTracking = !!counterMonthKey;
        var isFullyDone = isMonthFullyCompleted(activeMKey);

        var prevBtn = getEl('tbCalPrevMonth');
        var nextBtn = getEl('tbCalNextMonth');

        if (isOldTracking) {
            // Old Tracking: navigates backward into the past
            if (nextBtn) {
                nextBtn.style.opacity = '0.2';
                nextBtn.style.pointerEvents = 'none';
                nextBtn.title = 'Next month unavailable in Old Tracking';
            }
            if (prevBtn) {
                prevBtn.style.pointerEvents = 'auto';
                if (isFullyDone) {
                    prevBtn.style.opacity = '1';
                    prevBtn.className = 'tb-cal-nav-btn text-success border-success';
                    prevBtn.title = 'All targets complete: tap to move to previous month';
                } else {
                    prevBtn.style.opacity = '0.5';
                    prevBtn.className = 'tb-cal-nav-btn';
                    prevBtn.title = 'Complete all targets to move backward';
                }
            }
        } else {
            // Current Tracking: navigates forward into the future
            if (prevBtn) {
                prevBtn.style.opacity = '0.2';
                prevBtn.style.pointerEvents = 'none';
                prevBtn.title = 'Previous month unavailable in Current Tracking';
            }
            if (nextBtn) {
                nextBtn.style.pointerEvents = 'auto';
                if (isFullyDone) {
                    nextBtn.style.opacity = '1';
                    nextBtn.className = 'tb-cal-nav-btn text-success border-success';
                    nextBtn.title = 'All targets complete: tap to advance to next month';
                } else {
                    nextBtn.style.opacity = '0.5';
                    nextBtn.className = 'tb-cal-nav-btn';
                    nextBtn.title = 'Complete all targets to advance forward';
                }
            }
        }
    }

    function handleCalendarDayClick(dateStr) {
        var item = getActiveItem();
        if (!item || !dateStr) return;

        var isCompleted = isDayCompleted(item.id, dateStr);

        if (isCompleted) {
            // Already completed: clicking again shows confirmation before changing status
            confirmAction({
                title: 'Change Day Status',
                message: 'Mark <strong>' + formatDate(dateStr) + '</strong> for “' + escHtml(item.title) + '” as incomplete?',
                btnText: 'Yes, Mark Incomplete',
                isSuccess: false
            }, function () {
                setDayCompleted(item.id, dateStr, false);
                animateCell(dateStr);
                renderCalendar();
            });
        } else {
            // Mark target as completed immediately
            setDayCompleted(item.id, dateStr, true);
            animateCell(dateStr);
            renderCalendar();

            // Check if this action completed the entire month's targets
            var activeMKey = counterMonthKey || getCurrentTrackingMonth();
            if (isMonthFullyCompleted(activeMKey)) {
                setTimeout(function () {
                    if (counterMonthKey) {
                        advanceOldMonth();
                    } else {
                        advanceCurrentMonth();
                    }
                }, 300);
            }
        }
    }

    function confirmDayStatusChange() {
        if (!pendingToggleDate) return;
        var item = getActiveItem();
        if (item) {
            setDayCompleted(item.id, pendingToggleDate, false);
            animateCell(pendingToggleDate);
            renderCalendar();
        }
        if (confirmModalInstance) {
            confirmModalInstance.hide();
        }
        pendingToggleDate = null;
    }

    function animateCell(dateStr) {
        setTimeout(function () {
            var grid = getEl('tbCalGrid');
            if (!grid) return;
            var cell = grid.querySelector('[data-date="' + dateStr + '"]');
            if (cell) {
                cell.classList.remove('tb-cal-pop');
                void cell.offsetWidth;
                cell.classList.add('tb-cal-pop');
            }
        }, 10);
    }

    function navigateMonth(delta) {
        if (counterMonthKey) {
            if (delta < 0) {
                advanceOldMonth();
            } else {
                showToast('Next month is not available in Old tracking.');
            }
        } else {
            if (delta > 0) {
                advanceCurrentMonth();
            } else {
                showToast('Previous month is not available in Current tracking.');
            }
        }
    }

    /* ---------- Counter Overlay Opening & Closing ---------- */
    function openCounter(id, oldMonthKey) {
        var item = null;
        for (var i = 0; i < items.length; i++) {
            if (items[i].id === id) { item = items[i]; break; }
        }
        if (!item) return;

        // Automatically update bookmark
        if (oldMonthKey) {
            setBookmark('old', id, oldMonthKey);
        } else {
            setBookmark('current', id);
        }

        activeId = id;
        counterMonthKey = oldMonthKey || null;

        // Determine which month to show in the calendar
        if (counterMonthKey) {
            // Old month: parse the month key (e.g., "2026-09")
            var parts = counterMonthKey.split('-');
            calViewYear = parseInt(parts[0], 10);
            calViewMonth = parseInt(parts[1], 10) - 1; // 0-indexed
        } else {
            // Current month: display current tracking month
            var curMonthKey = getCurrentTrackingMonth();
            var curParts = curMonthKey.split('-');
            calViewYear = parseInt(curParts[0], 10);
            calViewMonth = parseInt(curParts[1], 10) - 1;
        }

        // Header titles
        var topTitle = item.title;
        if (counterMonthKey) {
            topTitle += ' (' + formatMonthLabel(counterMonthKey) + ')';
        }

        var topTitleEl = getEl('tbCounterTopTitle');
        if (topTitleEl) topTitleEl.textContent = topTitle;

        var titleEl = getEl('tbCounterTitle');
        if (titleEl) titleEl.textContent = item.title;

        renderCalendar();

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
        activeId = null;
        var prevCM = counterMonthKey;
        counterMonthKey = null;

        var counterView = getEl('tasbeehCounterView');
        if (counterView) {
            counterView.classList.add('d-none');
            counterView.classList.remove('d-flex');
        }

        if (prevCM && window.TasbeehOldApp && typeof window.TasbeehOldApp.checkAndAdvanceMonth === 'function') {
            window.TasbeehOldApp.checkAndAdvanceMonth(prevCM);
        }

        render();

        if (counterOpenedFrom === 'home') {
            counterOpenedFrom = null;
            switchTab('home');
        }
    }

    /* ---------- Add / Edit Dhikr Modal ---------- */
    function syncChips() {
        var chips = document.querySelectorAll('#tbCountChips button');
        var formCount = getEl('tbFormCount');
        var curVal = formCount ? Number(formCount.value) : 33;

        chips.forEach(function (btn) {
            var v = btn.dataset.count;
            var isOn = (v === 'infinite')
                ? countMode === 'infinite'
                : (countMode === 'finite' && Number(v) === curVal);
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

        var modalTitle = getEl('tbModalTitle');
        if (modalTitle) modalTitle.textContent = item ? 'Edit Dhikr' : 'Add New Dhikr';

        var formTitle = getEl('tbFormTitle');
        if (formTitle) formTitle.value = item ? item.title : '';

        countMode = (item && item.targetCount === 'infinite') ? 'infinite' : 'finite';
        var formCount = getEl('tbFormCount');
        if (formCount) {
            formCount.value = (item && item.targetCount !== 'infinite') ? item.targetCount : 33;
            formCount.disabled = (countMode === 'infinite');
        }

        syncChips();

        var delBtn = getEl('tbModalDelBtn');
        if (delBtn) {
            if (item) {
                delBtn.classList.remove('d-none');
            } else {
                delBtn.classList.add('d-none');
            }
        }

        var modalEl = getEl('tasbeehModal');
        if (modalEl) {
            if (!editModalInstance) {
                editModalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
                modalEl.addEventListener('hidden.bs.modal', function () {
                    editingId = null;
                    var b = getEl('tbModalDelBtn');
                    if (b) b.classList.add('d-none');
                });
            }
            editModalInstance.show();
        }
    }

    function saveModal() {
        var formTitle = getEl('tbFormTitle');
        var title = formTitle ? formTitle.value.trim() : '';
        if (!title) {
            alert('Please enter a chant title.');
            if (formTitle) formTitle.focus();
            return;
        }

        var targetCount = (countMode === 'infinite')
            ? 'infinite'
            : clamp(parseInt(getEl('tbFormCount').value, 10) || 33, 1, 9999);

        if (editingId) {
            var item = null;
            for (var i = 0; i < items.length; i++) {
                if (items[i].id === editingId) { item = items[i]; break; }
            }
            if (item) {
                item.title = title;
                item.targetCount = targetCount;
                item.updatedAt = Date.now();
                showToast('Dhikr updated');
            }
        } else {
            items.push(normalizeItem({
                id: uid(),
                title: title,
                targetCount: targetCount,
                updatedAt: Date.now()
            }));
            showToast('Dhikr added');
        }

        persist();
        render();

        if (activeId && activeId === editingId) {
            var act = getActiveItem();
            if (act) {
                var topTitleEl = getEl('tbCounterTopTitle');
                if (topTitleEl) topTitleEl.textContent = act.title;
                var titleEl = getEl('tbCounterTitle');
                if (titleEl) titleEl.textContent = act.title;
                renderCalendar();
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
        if (!item) return false;

        if (!confirm('Delete “' + item.title + '”? This will remove its recorded progress.')) {
            return false;
        }

        items = items.filter(function (it) { return it.id !== id; });

        if (activeId === id) {
            closeCounter();
        }

        // Clean up calendar completions for this item
        if (calCompletions[id]) {
            delete calCompletions[id];
            persistCalCompletions();
        }

        persist();
        render();
        showToast('Dhikr deleted');
        return true;
    }

    /* ---------- Event Bindings ---------- */
    function bindEvents() {
        /* Open Dhikr Add Modal */
        var addBtn = getEl('tbAddBtn');
        if (addBtn) {
            addBtn.onclick = function () { openModal(null); };
        }

        var saveBtn = getEl('tbModalSaveBtn');
        if (saveBtn) {
            saveBtn.onclick = saveModal;
        }

        var modalDelBtn = getEl('tbModalDelBtn');
        if (modalDelBtn) {
            modalDelBtn.onclick = function () {
                if (editingId) {
                    var targetId = editingId;
                    if (deleteItem(targetId)) {
                        if (editModalInstance) editModalInstance.hide();
                        editingId = null;
                    }
                }
            };
        }

        /* Subtab Switching */
        var tabHome = getEl('tabTbHome');
        if (tabHome) {
            tabHome.onclick = function () { switchTab('home'); };
        }

        var tabCurrent = getEl('tabTbCurrent');
        if (tabCurrent) {
            tabCurrent.onclick = function () { switchTab('current'); };
        }

        var tabOld = getEl('tabTbOld');
        if (tabOld) {
            tabOld.onclick = function () { switchTab('old'); };
        }

        var tabHistory = getEl('tabTbHistory');
        if (tabHistory) {
            tabHistory.onclick = function () { switchTab('history'); };
        }

        /* Target Count Chips */
        var chipsBox = getEl('tbCountChips');
        if (chipsBox) {
            chipsBox.onclick = function (e) {
                var btn = e.target.closest('button[data-count]');
                if (!btn) return;
                var val = btn.dataset.count;
                var countInput = getEl('tbFormCount');
                if (val === 'infinite') {
                    countMode = 'infinite';
                    if (countInput) countInput.disabled = true;
                } else {
                    countMode = 'finite';
                    if (countInput) {
                        countInput.disabled = false;
                        countInput.value = val;
                    }
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

        /* Current List Card Delegations */
        var listEl = getEl('tbList');
        if (listEl) {
            listEl.onclick = function (e) {
                var btn = e.target.closest('button[data-act]');
                if (btn && btn.dataset.act === 'tb-current-advance') {
                    e.stopPropagation();
                    advanceCurrentMonth();
                    return;
                }
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

            listEl.onkeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    var btn = e.target.closest('button[data-act]');
                    if (btn) return;
                    var card = e.target.closest('[data-id]');
                    if (card) {
                        e.preventDefault();
                        openCounter(card.dataset.id);
                    }
                }
            };
        }

        /* Counter View Navigation & Controls */
        var btnBack = getEl('tbBtnBack');
        if (btnBack) btnBack.onclick = closeCounter;

        var btnEditActive = getEl('tbBtnEditActive');
        if (btnEditActive) {
            btnEditActive.onclick = function () {
                if (activeId) openModal(activeId);
            };
        }

        /* Calendar Grid: Day Click Delegation */
        var calGrid = getEl('tbCalGrid');
        if (calGrid) {
            calGrid.onclick = function (e) {
                var cell = e.target.closest('.tb-cal-cell[data-date]');
                if (!cell) return;
                if (cell.classList.contains('tb-cal-empty')) return;
                handleCalendarDayClick(cell.dataset.date);
            };

            calGrid.onkeydown = function (e) {
                if (e.key === 'Enter' || e.key === ' ') {
                    var cell = e.target.closest('.tb-cal-cell[data-date]');
                    if (!cell || cell.classList.contains('tb-cal-empty')) return;
                    e.preventDefault();
                    handleCalendarDayClick(cell.dataset.date);
                }
            };
        }

        /* Calendar Month Navigation Buttons */
        var prevMonth = getEl('tbCalPrevMonth');
        if (prevMonth) {
            prevMonth.onclick = function () { navigateMonth(-1); };
        }

        var nextMonth = getEl('tbCalNextMonth');
        if (nextMonth) {
            nextMonth.onclick = function () { navigateMonth(1); };
        }

        /* Confirmation Modal Button */
        var btnConfirmChange = getEl('tbBtnConfirmChange');
        if (btnConfirmChange) {
            btnConfirmChange.onclick = function () {
                if (typeof pendingConfirmCallback === 'function') {
                    var cb = pendingConfirmCallback;
                    pendingConfirmCallback = null;
                    if (confirmModalInstance) confirmModalInstance.hide();
                    cb();
                    return;
                }
                if (pendingToggleDate) {
                    confirmDayStatusChange();
                }
            };
        }

        /* Keyboard Shortcuts */
        document.addEventListener('keydown', function (e) {
            var counterView = getEl('tasbeehCounterView');
            var isOverlayOpen = counterView && !counterView.classList.contains('d-none');
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

            if (isOverlayOpen) {
                if (e.code === 'Escape') {
                    closeCounter();
                } else if (e.code === 'ArrowLeft') {
                    e.preventDefault();
                    navigateMonth(-1);
                } else if (e.code === 'ArrowRight') {
                    e.preventDefault();
                    navigateMonth(1);
                }
            }
        });
    }

    /* ---------- Public API ---------- */
    function init() {
        items = loadItems();
        loadCalCompletions();
        loadCurrentPeriod();
        checkDailyReset();
        persist();
        bindEvents();
        switchTab('home');
    }

    return {
        init: init,
        render: render,
        switchTab: switchTab,
        renderCurrentTab: renderCurrentTab,
        openCounter: openCounter,
        openCounterOld: openCounterOld,
        closeCounter: closeCounter,
        openModal: openModal,
        saveModal: saveModal,
        deleteItem: deleteItem,
        getItems: getItems,
        setItems: setItems,
        persist: persist,
        formatDate: typeof formatDate === 'function' ? formatDate : (window.formatDate || function (d) { return d; }),
        formatMonthLabel: typeof formatMonthLabel === 'function' ? formatMonthLabel : (window.formatMonthLabel || function (m) { return m; }),
        getCurrentMonthKey: typeof getCurrentMonthKey === 'function' ? getCurrentMonthKey : (window.getCurrentMonthKey || function () { return ''; }),
        showToast: typeof showToast === 'function' ? showToast : (window.showToast || function () { }),
        getBookmark: getBookmark,
        setBookmark: setBookmark,
        getBookmarkedChants: getBookmarkedChants,
        openCounterFromHome: openCounterFromHome,
        // Current Period Management
        loadCurrentPeriod: loadCurrentPeriod,
        saveCurrentPeriod: saveCurrentPeriod,
        getCurrentTrackingMonth: getCurrentTrackingMonth,
        removeMonthTrackingData: removeMonthTrackingData,
        isMonthFullyCompleted: isMonthFullyCompleted,
        advanceCurrentMonth: advanceCurrentMonth,
        advanceOldMonth: advanceOldMonth,
        confirmAction: confirmAction,
        // Calendar & Completion Helpers
        isDayCompleted: isDayCompleted,
        setDayCompleted: setDayCompleted,
        getDaysInMonth: getDaysInMonth,
        getCompletedDaysInMonth: getCompletedDaysInMonth,
        renderCalendar: renderCalendar
    };
})();

// Alias to window.TasbeehApp as primary coordinator
window.TasbeehApp = window.TasbeehCurrentApp;
