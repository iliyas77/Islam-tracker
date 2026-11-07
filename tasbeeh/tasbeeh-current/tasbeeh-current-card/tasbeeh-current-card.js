/* ============================================================
   Nur Prayer — Current Tasbeeh Card Component
   Path: tasbeeh/tasbeeh-current/tasbeeh-current-card/tasbeeh-current-card.js
   ============================================================ */

import { unwrap } from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const CurrentCardTemplate = {
    element: 'tasbeeh-current-card-template',
    file: 'tasbeeh/tasbeeh-current/tasbeeh-current-card/tasbeeh-current-card.html'
};

export function CurrentCardViewModel(params) {
    if (params instanceof CurrentCardViewModel) return params;
    if (!(this instanceof CurrentCardViewModel)) return new CurrentCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.item = item;
    self.id = unwrap(item.id, '');
    self.title = unwrap(item.title, 'Dhikr');
    self.targetCount = unwrap(item.targetCount, 33);
    self.completedDays = unwrap(item.completedDays, 0);
    self.totalDays = unwrap(item.totalDays, 30);
    self.isComplete = unwrap(item.isComplete, unwrap(item.isCompleted, false));
    self.isTodayDone = unwrap(item.isTodayDone, false);

    self.targetDisplay = (self.targetCount === 'infinite' || self.targetCount === '∞') ? '∞' : self.targetCount;
    self.totalDaysText = self.totalDays + ' days';

    self.onCardClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onCardClick === 'function') {
            p.onCardClick(item, e);
        } else if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounter === 'function') {
            _win.TasbeehApp.openCounter(self.id);
        }
    };

    self.onEditClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onEditClick === 'function') {
            p.onEditClick(item, e);
        } else if (_win.TasbeehApp && typeof _win.TasbeehApp.openEditModal === 'function') {
            _win.TasbeehApp.openEditModal(self.id);
        }
    };
}

if (typeof window !== 'undefined') {
    window.CurrentCardViewModel = CurrentCardViewModel;
}

export default CurrentCardViewModel;

