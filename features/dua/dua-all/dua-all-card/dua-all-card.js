/* ============================================================
   Nur Prayer — Dua All Card Component
   Path: features/dua/dua-all/dua-all-card/dua-all-card.js
   Responsibilities:
     - Represents an individual Dua row card in All Duas list
     - Renders Dua number, surah name, pronunciation preview
     - Dispatches click, favourite toggle, and pin toggle events to parent
   ============================================================ */
'use strict';

import { unwrap, getSurah, getUchcharana, getArdham } from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const DuaAllCardTemplate = {
    element: 'dua-all-card-template',
    file: 'features/dua/dua-all/dua-all-card/dua-all-card.html'
};

export function DuaAllCardViewModel(params) {
    if (params instanceof DuaAllCardViewModel) return params;
    if (!(this instanceof DuaAllCardViewModel)) return new DuaAllCardViewModel(params);

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
    self.preview = self.uchcharana || self.ardham;

    self.isFav = !!unwrap(p.isFav, unwrap(item.isFav, false));
    self.isPinned = !!unwrap(p.isPinned, unwrap(item.isPinned, false));
    self.source = unwrap(p.source, 'all');

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

    self.onTogglePin = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onTogglePin;
        if (typeof cb === 'function') {
            cb(self.item, self.index, event);
        }
    };

    self.onToggleFav = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onToggleFav;
        if (typeof cb === 'function') {
            cb(self.item, self.index, event);
        }
    };
}

if (typeof window !== 'undefined') {
    window.DuaAllCardViewModel = DuaAllCardViewModel;
}

export default {
    template: DuaAllCardTemplate,
    viewModel: DuaAllCardViewModel
};

