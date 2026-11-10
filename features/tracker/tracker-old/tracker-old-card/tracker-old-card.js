/* ============================================================
   Nur Prayer — Tracker Old Card Component
   Path: features/tracker/tracker-old/tracker-old-card/tracker-old-card.js
   Responsibilities:
     - Represents an individual prayer item card/row in Old tracking
     - Renders prayer icon, timing, state (Done vs Missed)
     - Dispatches user toggle actions to parent via explicit onToggle callback
   ============================================================ */
'use strict';

import { unwrap, PRAYER_CARD_ICONS } from '../../tracker-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const TrackerOldCardTemplate = {
    element: 'tracker-old-card-template',
    file: 'features/tracker/tracker-old/tracker-old-card/tracker-old-card.html'
};

export function TrackerOldCardViewModel(params) {
    if (params instanceof TrackerOldCardViewModel) return params;
    if (!(this instanceof TrackerOldCardViewModel)) return new TrackerOldCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.prayer = unwrap(item.prayer, '');
    self.time = unwrap(item.time, '--:--');
    self.isDone = !!unwrap(item.isDone, false);
    self.isUpcoming = false;
    self.isMissed = !self.isDone;
    self.isCurrent = false;
    self.isStandard = false;
    self.prefix = unwrap(item.prefix || p.prefix, 'page.old');
    self.actionAct = unwrap(item.actionAct || p.actionAct, 'toggle-old');
    self.date = unwrap(item.date || p.date, '');

    var rawIcon = unwrap(item.iconClass || p.iconClass, (PRAYER_CARD_ICONS && PRAYER_CARD_ICONS[self.prayer]) || 'fa-solid fa-mosque');
    if (typeof rawIcon === 'string' && rawIcon.indexOf('<') !== -1) {
        var m = rawIcon.match(/name:\s*['"]([^'"]+)['"]/);
        if (m) {
            rawIcon = m[1];
        } else {
            var m2 = rawIcon.match(/class=['"][^'"]*fa-([a-z0-9-]+)[^'"]*['"]/);
            if (m2) rawIcon = m2[1];
        }
    }
    self.iconClass = rawIcon;

    self.onToggle = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onToggle || p.onClick;
        if (typeof cb === 'function') {
            cb(self, event);
        }
    };
}

if (typeof window !== 'undefined') {
    window.TrackerOldCardViewModel = TrackerOldCardViewModel;
}

export default {
    template: TrackerOldCardTemplate,
    viewModel: TrackerOldCardViewModel
};

