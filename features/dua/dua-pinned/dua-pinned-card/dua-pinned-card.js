/* ============================================================
   Nur Prayer — Dua Pinned Card Component
   Path: features/dua/dua-pinned/dua-pinned-card/dua-pinned-card.js
   Responsibilities:
     - Represents an individual pinned Dua card on Pinned/Home view
     - Renders number, surah, Telugu pronunciation, and meaning
     - Dispatches open detail and unpin actions
   ============================================================ */
'use strict';

import { unwrap, getSurah, getUchcharana, getArdham } from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const DuaPinnedCardTemplate = {
    element: 'dua-pinned-card-template',
    file: 'features/dua/dua-pinned/dua-pinned-card/dua-pinned-card.html'
};

export function DuaPinnedCardViewModel(params) {
    if (params instanceof DuaPinnedCardViewModel) return params;
    if (!(this instanceof DuaPinnedCardViewModel)) return new DuaPinnedCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.item = item;
    self.index = unwrap(p.index, unwrap(item.index, 0));
    self.number = unwrap(item.number, unwrap(item.id, self.index + 1));
    self.displayNumber = '#' + String(self.number).padStart(2, '0');
    self.surah = unwrap(item.surah, getSurah(item));
    self.uchcharana = unwrap(item.uchcharana, getUchcharana(item));
    self.ardham = unwrap(item.ardham, getArdham(item));

    self.onOpenDetail = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onSelectDua || p.onClick || p.onOpenDetail;
        if (typeof cb === 'function') {
            cb(self.item, self.index, event);
        }
    };

    self.onUnpin = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onUnpin || p.onTogglePin;
        if (typeof cb === 'function') {
            cb(self.item, self.index, event);
        }
    };
}

if (typeof window !== 'undefined') {
    window.DuaPinnedCardViewModel = DuaPinnedCardViewModel;
}

export default {
    template: DuaPinnedCardTemplate,
    viewModel: DuaPinnedCardViewModel
};

