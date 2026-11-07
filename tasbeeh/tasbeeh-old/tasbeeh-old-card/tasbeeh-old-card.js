/* ============================================================
   Nur Prayer — Old Tasbeeh Card Component
   Path: tasbeeh/tasbeeh-old/tasbeeh-old-card/tasbeeh-old-card.js
   ============================================================ */

import { unwrap } from '../../tasbeeh-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const OldCardTemplate = {
    element: 'tasbeeh-old-card-template',
    file: 'tasbeeh/tasbeeh-old/tasbeeh-old-card/tasbeeh-old-card.html'
};

export function OldCardViewModel(params) {
    if (params instanceof OldCardViewModel) return params;
    if (!(this instanceof OldCardViewModel)) return new OldCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.item = item;
    self.id = unwrap(item.id, '');
    self.month = unwrap(p.month, unwrap(item.month, null));
    self.title = unwrap(item.title, 'Dhikr');
    self.targetCount = unwrap(item.targetCount, 33);
    self.completedDays = unwrap(item.completedDays, 0);
    self.totalDays = unwrap(item.totalDays, 30);
    self.isComplete = unwrap(item.isComplete, unwrap(item.isCompleted, false));

    self.targetDisplay = (self.targetCount === 'infinite' || self.targetCount === '∞') ? '∞' : self.targetCount;
    self.totalDaysText = self.totalDays + ' days';

    self.onCardClick = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onCardClick === 'function') {
            p.onCardClick(item, self.month, e);
        } else if (_win.TasbeehApp && typeof _win.TasbeehApp.openCounterOld === 'function') {
            _win.TasbeehApp.openCounterOld(self.id, self.month);
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
    window.OldCardViewModel = OldCardViewModel;
}

export default OldCardViewModel;

