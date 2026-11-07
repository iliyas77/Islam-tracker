/* ============================================================
   Nur Prayer — History Tasbeeh Card Component
   Path: tasbeeh/tasbeeh-history/tasbeeh-history-card/tasbeeh-history-card.js
   ============================================================ */

import { unwrap, reopenLastMonth } from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const HistoryCardTemplate = {
    element: 'tasbeeh-history-card-template',
    file: 'tasbeeh/tasbeeh-history/tasbeeh-history-card/tasbeeh-history-card.html'
};

export function HistoryCardViewModel(params) {
    if (params instanceof HistoryCardViewModel) return params;
    if (!(this instanceof HistoryCardViewModel)) return new HistoryCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var self = this;

    self.monthKey = unwrap(p.monthKey, '');
    self.monthLabel = unwrap(p.monthLabel, self.monthKey);
    self.indexNumber = unwrap(p.indexNumber, 1);
    self.status = unwrap(p.status, 'pending'); // 'completed' | 'active' | 'pending'
    self.canReopen = unwrap(p.canReopen, false);

    self.indexText = '#' + self.indexNumber;

    if (self.status === 'completed') {
        self.badgeClass = 'bg-brand-light text-brand border border-brand-subtle';
        self.badgeIcon = 'circle-check';
        self.badgeText = 'Completed';
    } else if (self.status === 'active') {
        self.badgeClass = 'bg-brand text-white border-0';
        self.badgeIcon = 'play';
        self.badgeText = 'In Progress';
    } else {
        self.badgeClass = 'bg-surfaceBg text-gr-textMuted border border-borderGrey';
        self.badgeIcon = 'clock';
        self.badgeText = 'Pending';
    }

    self.onReopen = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onReopen === 'function') {
            p.onReopen(self.monthKey, e);
        } else if (_win.TasbeehOldApp && typeof _win.TasbeehOldApp.reopenLastMonth === 'function') {
            _win.TasbeehOldApp.reopenLastMonth();
        } else {
            reopenLastMonth();
        }
    };
}

if (typeof window !== 'undefined') {
    window.HistoryCardViewModel = HistoryCardViewModel;
}

export default HistoryCardViewModel;

