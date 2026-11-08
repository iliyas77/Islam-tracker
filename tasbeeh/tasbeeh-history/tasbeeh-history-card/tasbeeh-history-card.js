/* ============================================================
   Nur Prayer — History Tasbeeh Card Component
   Path: tasbeeh/tasbeeh-history/tasbeeh-history-card/tasbeeh-history-card.js
   ============================================================ */

import { unwrap } from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const HistoryCardTemplate = {
    element: 'tasbeeh-history-card-template',
    file: 'tasbeeh/tasbeeh-history/tasbeeh-history-card/tasbeeh-history-card.html'
};

export function HistoryCardViewModel(params) {
    if (params instanceof HistoryCardViewModel) return params;
    if (!(this instanceof HistoryCardViewModel)) return new HistoryCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.item = item;
    self.monthKey = unwrap(item.monthKey, unwrap(p.monthKey, ''));
    self.monthLabel = unwrap(item.monthLabel, unwrap(p.monthLabel, self.monthKey));
    self.indexNumber = unwrap(item.indexNumber, unwrap(p.indexNumber, 1));
    self.status = unwrap(item.status, unwrap(p.status, 'pending')); // 'completed' | 'active' | 'pending'
    self.canReopen = unwrap(item.canReopen, unwrap(p.canReopen, false));

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

    self.handleClick = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var targetMonth = self.monthKey;
        var cb = p.onClick || p.onReopen || p.onCardClick || (p.item && (p.item.onClick || p.item.onReopen));
        if (typeof cb === 'function') {
            cb(targetMonth, event);
        }
    };
    self.onReopen = self.handleClick;
}

if (typeof window !== 'undefined') {
    window.HistoryCardViewModel = HistoryCardViewModel;
}

export default HistoryCardViewModel;

