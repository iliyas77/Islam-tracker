/* ============================================================
   Nur Prayer — Dua Favourites Card Component
   Path: features/dua/dua-favourites/dua-favourites-card/dua-favourites-card.js
   Responsibilities:
     - Represents an individual favourite Dua row card
     - Displays number, surah, preview, and active filled heart icon
     - Dispatches open detail and remove favourite actions
   ============================================================ */
'use strict';

import { unwrap, getSurah, getUchcharana, getArdham } from '../../dua-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});

export const DuaFavouritesCardTemplate = {
    element: 'dua-favourites-card-template',
    file: 'features/dua/dua-favourites/dua-favourites-card/dua-favourites-card.html'
};

export function DuaFavouritesCardViewModel(params) {
    if (params instanceof DuaFavouritesCardViewModel) return params;
    if (!(this instanceof DuaFavouritesCardViewModel)) return new DuaFavouritesCardViewModel(params);

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
    window.DuaFavouritesCardViewModel = DuaFavouritesCardViewModel;
}

export default {
    template: DuaFavouritesCardTemplate,
    viewModel: DuaFavouritesCardViewModel
};

