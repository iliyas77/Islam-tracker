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

    self.handleClick = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var targetItem = self.item;
        var cb = p.onClick || p.onCardClick;
        if (typeof cb === 'function') {
            cb(targetItem, self.month, event);
        }
    };
    self.onCardClick = self.handleClick;

    self.handleEditClick = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var targetItem = self.item;
        var cb = p.onEditClick || p.onEdit;
        if (typeof cb === 'function') {
            cb(targetItem, event);
        }
    };
    self.onEditClick = self.handleEditClick;
}

if (typeof window !== 'undefined') {
    window.OldCardViewModel = OldCardViewModel;
}

export default OldCardViewModel;

