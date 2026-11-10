/* ============================================================
   Nur Prayer — Digital Tasbeeh: Calendar Tracker Module
   Path: features/tasbeeh/tasbeeh-calendar.js
   Handles:
     - Confirmation action dialog (Vanilla modal + fallback)
     - Month advancement (current and old clearance)
     - Calendar grid and monthly tracking overlay
     - Day cell click interactions and animations
   ============================================================ */

import {
    getDaysInMonth,
    getFirstDayOfMonth,
    makeDateStr,
    isDayCompleted,
    setDayCompleted,
    isMonthFullyCompleted,
    removeMonthTrackingData,
    saveCurrentPeriod,
    getCurrentTrackingMonth
} from './tasbeeh-model.js';
import { escHtml } from './tasbeeh-view-model.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

function getEl(id) {
    return document.getElementById(id);
}

var pad2 = function (n) {
    if (typeof _win.pad2 === 'function' && _win.pad2 !== pad2) return _win.pad2(n);
    return n < 10 ? '0' + n : '' + n;
};

var td = function () {
    if (typeof _win.td === 'function' && _win.td !== td) return _win.td();
    return new Date().toISOString().slice(0, 10);
};

function showToast(msg, duration) {
    if (typeof _win.showToast === 'function') {
        _win.showToast(msg, duration);
    }
}

var formatMonthLabel = function (m) {
    if (typeof _win.formatMonthLabel === 'function' && _win.formatMonthLabel !== formatMonthLabel) return _win.formatMonthLabel(m);
    return m;
};

var formatDate = function (d) {
    if (typeof _win.formatDate === 'function' && _win.formatDate !== formatDate) return _win.formatDate(d);
    return d;
};

export var pendingToggleDate = null;
export var pendingConfirmCallback = null;
export var confirmModalInstance = null;

/* ---------- Confirmation Action Dialog (Vanilla Modal + Fallback) ---------- */
export function confirmAction(options, onConfirm) {
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
            badgeEl.className = 'icon-box icon-box-lg bg-brand-light';
            if (_win.Icon && typeof _win.Icon.update === 'function') {
                _win.Icon.update(iconEl, { name: 'circle-check', size: 'fs-3', color: 'text-brand' });
            }
        } else {
            badgeEl.className = 'icon-box icon-box-lg bg-warning-subtle';
            if (_win.Icon && typeof _win.Icon.update === 'function') {
                _win.Icon.update(iconEl, { name: 'triangle-exclamation', size: 'fs-3', color: 'text-warning' });
            }
        }
    }

    var ModalClass = _win.UIModal || (_win.bootstrap && _win.bootstrap.Modal);
    if (confirmModalEl && ModalClass) {
        if (!confirmModalInstance) {
            confirmModalInstance = ModalClass.getOrCreateInstance(confirmModalEl);
            confirmModalEl.addEventListener('hidden.bs.modal', function () {
                pendingToggleDate = null;
                pendingConfirmCallback = null;
            });
        }
        confirmModalInstance.show();
    } else {
        var plain = (options.message || '').replace(/<br\s*[\/]?>/gi, '\n').replace(/<[^>]+>/g, '');
        if (_win.confirm && _win.confirm((options.title || 'Confirm') + '\n\n' + plain)) {
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

export function advanceCurrentMonth(state) {
    var curMonthKey = getCurrentTrackingMonth();
    if (!isMonthFullyCompleted(state.calCompletions, state.items, curMonthKey)) {
        showToast('Please complete all targets for ' + formatMonthLabel(curMonthKey) + ' before moving to next month.');
        return;
    }
    var nextMonthKey = typeof _win.getNextMonthKey === 'function' ? _win.getNextMonthKey(curMonthKey) : (function (m) {
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
        removeMonthTrackingData(state.calCompletions, state.items, curMonthKey);
        saveCurrentPeriod(nextMonthKey);

        if (state.counterMonthKey === null && state.activeId) {
            var parts = nextMonthKey.split('-');
            state.calViewYear = parseInt(parts[0], 10);
            state.calViewMonth = parseInt(parts[1], 10) - 1;
            renderCalendar(state);
        }
        if (typeof state.renderCurrentTab === 'function') {
            state.renderCurrentTab();
        }
        showToast('🎉 ' + curLabel + ' completed! Advanced to ' + nextLabel, 3500);
    });
}

export function advanceOldMonth(state) {
    if (!_win.TasbeehOldApp || typeof _win.TasbeehOldApp.getCurrentOldMonth !== 'function') return;
    var curOldMonth = _win.TasbeehOldApp.getCurrentOldMonth();
    if (!curOldMonth) return;

    if (!isMonthFullyCompleted(state.calCompletions, state.items, curOldMonth)) {
        showToast('Please complete all targets for ' + formatMonthLabel(curOldMonth) + ' before moving to previous month.');
        return;
    }

    var prevMonthKey = typeof _win.getPrevMonthKey === 'function' ? _win.getPrevMonthKey(curOldMonth) : (function (m) {
        var p = m.split('-'); var y = parseInt(p[0], 10); var mo = parseInt(p[1], 10) - 1;
        if (mo === 0) { mo = 12; y--; } return y + '-' + pad2(mo);
    })(curOldMonth);

    var curLabel = formatMonthLabel(curOldMonth);
    var prevLabel = formatMonthLabel(prevMonthKey);
    var period = _win.TasbeehOldApp.loadPeriod();
    var isAllCleared = (prevMonthKey < period.startDate);

    confirmAction({
        title: '🎉 Month Completed!',
        message: 'All dhikr targets for <strong>' + curLabel + '</strong> are completed!<br><br>' +
            'Do you want to finalize this month, remove its tracking data, and ' +
            (isAllCleared ? 'complete all Old Tracking months?' : ('move to <strong>' + prevLabel + '</strong>?')),
        btnText: 'Finalize & Move Backward',
        isSuccess: true
    }, function () {
        removeMonthTrackingData(state.calCompletions, state.items, curOldMonth);
        _win.TasbeehOldApp.savePeriod(period.startDate, prevMonthKey, period.initialEnd);

        if (state.counterMonthKey !== null && state.activeId) {
            if (isAllCleared) {
                if (typeof state.closeCounter === 'function') state.closeCounter();
            } else {
                state.counterMonthKey = prevMonthKey;
                var parts = prevMonthKey.split('-');
                state.calViewYear = parseInt(parts[0], 10);
                state.calViewMonth = parseInt(parts[1], 10) - 1;
                renderCalendar(state);
                var act = typeof state.getActiveItem === 'function' ? state.getActiveItem() : null;
                var topTitle = (act ? act.title : 'Chant') + ' (' + formatMonthLabel(prevMonthKey) + ')';
                var topTitleEl = getEl('tbCounterTopTitle');
                if (topTitleEl) topTitleEl.textContent = topTitle;
            }
        }
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') {
            _win.TasbeehOldApp.renderOldTab();
        }
        if (isAllCleared) {
            showToast('🎉 ' + curLabel + ' completed! All old tracking months cleared!', 3500);
        } else {
            showToast('🎉 ' + curLabel + ' completed! Moved to ' + prevLabel, 3500);
        }
    });
}

/* ---------- Monthly Calendar Tracker ---------- */
export function renderCalendar(state) {
    var item = typeof state.getActiveItem === 'function' ? state.getActiveItem() : null;
    if (!item) return;

    var grid = getEl('tbCalGrid');
    if (!grid) return;

    var year = state.calViewYear;
    var month = state.calViewMonth;
    var daysInMonth = getDaysInMonth(year, month);
    var firstDay = getFirstDayOfMonth(year, month);

    var isInfinite = item.targetCount === 'infinite';
    var todayStr = td();

    var html = '';
    var completedCount = 0;
    var totalDays = daysInMonth;

    for (var e = 0; e < firstDay; e++) {
        html += '<div class="tb-cal-cell tb-cal-empty aspect-square rounded-xl bg-transparent border-0" aria-hidden="true"></div>';
    }

    for (var d = 1; d <= daysInMonth; d++) {
        var dateStr = makeDateStr(year, month, d);
        var isToday = (dateStr === todayStr);
        var isCompleted = isDayCompleted(state.calCompletions, item.id, dateStr);

        if (isCompleted) completedCount++;

        var classes = 'tb-cal-cell';
        if (isCompleted) classes += ' tb-cal-done';
        if (isToday) classes += ' tb-cal-today';

        html += '<div class="' + classes + ' aspect-square rounded-xl flex items-center justify-center cursor-pointer border-2 border-transparent bg-white relative select-none transition-all hover:border-brand" data-date="' + dateStr + '" role="button" tabindex="0" ' +
            'aria-label="' + d + ' ' + (isCompleted ? 'Completed' : 'Pending') + '">' +
            '<span class="tb-cal-date text-lg font-bold text-brand leading-none inline-flex items-center justify-center">' + d + '</span>' +
            '</div>';
    }

    grid.innerHTML = html;

    var monthLabel = getEl('tbCalMonthLabel');
    if (monthLabel) {
        var dateObj = new Date(year, month, 1);
        monthLabel.textContent = dateObj.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
    }

    var targetLabel = getEl('tbCalTargetLabel');
    if (targetLabel) {
        targetLabel.textContent = isInfinite ? 'Target: ∞ / day' : ('Target: ' + item.targetCount + ' / day');
    }

    var activeMKey = state.counterMonthKey || getCurrentTrackingMonth();
    var isOldTracking = !!state.counterMonthKey;
    var isFullyDone = isMonthFullyCompleted(state.calCompletions, state.items, activeMKey);

    var prevBtn = getEl('tbCalPrevMonth');
    var nextBtn = getEl('tbCalNextMonth');

    if (isOldTracking) {
        if (nextBtn) {
            nextBtn.style.opacity = '0.2';
            nextBtn.style.pointerEvents = 'none';
            nextBtn.title = 'Next month unavailable in Old Tracking';
        }
        if (prevBtn) {
            prevBtn.style.pointerEvents = 'auto';
            if (isFullyDone) {
                prevBtn.style.opacity = '1';
                prevBtn.className = 'tb-cal-nav-btn text-brand border-brand';
                prevBtn.title = 'All targets complete: tap to move to previous month';
            } else {
                prevBtn.style.opacity = '0.5';
                prevBtn.className = 'tb-cal-nav-btn';
                prevBtn.title = 'Complete all targets to move backward';
            }
        }
    } else {
        if (prevBtn) {
            prevBtn.style.opacity = '0.2';
            prevBtn.style.pointerEvents = 'none';
            prevBtn.title = 'Previous month unavailable in Current Tracking';
        }
        if (nextBtn) {
            nextBtn.style.pointerEvents = 'auto';
            if (isFullyDone) {
                nextBtn.style.opacity = '1';
                nextBtn.className = 'tb-cal-nav-btn text-brand border-brand';
                nextBtn.title = 'All targets complete: tap to advance to next month';
            } else {
                nextBtn.style.opacity = '0.5';
                nextBtn.className = 'tb-cal-nav-btn';
                nextBtn.title = 'Complete all targets to advance forward';
            }
        }
    }
}

export function handleCalendarDayClick(state, dateStr) {
    var item = typeof state.getActiveItem === 'function' ? state.getActiveItem() : null;
    if (!item || !dateStr) return;

    var isCompleted = isDayCompleted(state.calCompletions, item.id, dateStr);

    if (isCompleted) {
        confirmAction({
            title: 'Change Day Status',
            message: 'Mark <strong>' + formatDate(dateStr) + '</strong> for “' + escHtml(item.title) + '” as incomplete?',
            btnText: 'Yes, Mark Incomplete',
            isSuccess: false
        }, function () {
            setDayCompleted(state.calCompletions, state.items, item.id, dateStr, false);
            animateCell(dateStr);
            renderCalendar(state);
            if (typeof state.renderCurrentTab === 'function') state.renderCurrentTab();
            if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') _win.TasbeehOldApp.renderOldTab();
        });
    } else {
        setDayCompleted(state.calCompletions, state.items, item.id, dateStr, true);
        animateCell(dateStr);
        renderCalendar(state);
        if (typeof state.renderCurrentTab === 'function') state.renderCurrentTab();
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') _win.TasbeehOldApp.renderOldTab();

        var activeMKey = state.counterMonthKey || getCurrentTrackingMonth();
        if (isMonthFullyCompleted(state.calCompletions, state.items, activeMKey)) {
            setTimeout(function () {
                if (state.counterMonthKey) {
                    advanceOldMonth(state);
                } else {
                    advanceCurrentMonth(state);
                }
            }, 300);
        }
    }
}

export function confirmDayStatusChange(state) {
    if (!pendingToggleDate) return;
    var item = typeof state.getActiveItem === 'function' ? state.getActiveItem() : null;
    if (item) {
        setDayCompleted(state.calCompletions, state.items, item.id, pendingToggleDate, false);
        animateCell(pendingToggleDate);
        renderCalendar(state);
        if (typeof state.renderCurrentTab === 'function') state.renderCurrentTab();
        if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.renderOldTab === 'function') _win.TasbeehOldApp.renderOldTab();
    }
    if (confirmModalInstance) {
        confirmModalInstance.hide();
    }
    pendingToggleDate = null;
}

export function animateCell(dateStr) {
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

export function navigateMonth(state, delta) {
    if (state.counterMonthKey) {
        if (delta < 0) {
            advanceOldMonth(state);
        } else {
            showToast('Next month is not available in Old tracking.');
        }
    } else {
        if (delta > 0) {
            advanceCurrentMonth(state);
        } else {
            showToast('Previous month is not available in Current tracking.');
        }
    }
}

