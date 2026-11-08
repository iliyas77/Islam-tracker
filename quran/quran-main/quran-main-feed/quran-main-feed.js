/* ============================================================
   Nur Prayer — Quran Main Feed Component
   Path: quran/quran-main/quran-main-feed/quran-main-feed.js
   ============================================================ */
import { SURAH_META, filterSurahs, unwrap } from '../../quran-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const QuranMainFeedTemplate = {
    element: 'quran-main-feed-template',
    file: 'quran/quran-main/quran-main-feed/quran-main-feed.html'
};

export function QuranMainFeedViewModel(params) {
    if (params instanceof QuranMainFeedViewModel) return params;
    if (!(this instanceof QuranMainFeedViewModel)) return new QuranMainFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function comp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.isLoading = (p.isLoading && k && k.isObservable(p.isLoading)) ? p.isLoading : obs(false);
    self.searchQuery = (p.searchQuery && k && k.isObservable(p.searchQuery)) ? p.searchQuery : obs(p.query || '');

    var rawSurahs = (p.surahs && typeof p.surahs === 'function') ? p.surahs() : (p.surahs || SURAH_META);
    self.allSurahs = Array.isArray(rawSurahs) ? rawSurahs : SURAH_META;

    self.filteredSurahs = comp(function () {
        var q = typeof self.searchQuery === 'function' ? self.searchQuery() : '';
        return filterSurahs(q, self.allSurahs);
    });

    self.hasResults = comp(function () {
        var list = typeof self.filteredSurahs === 'function' ? self.filteredSurahs() : self.filteredSurahs;
        return Array.isArray(list) && list.length > 0;
    });

    self.handleCardClick = function (item, event) {
        var cb = p.onSelectSurah || p.onCardClick;
        if (typeof cb === 'function') {
            cb(item, event);
        }
    };
}

export default {
    template: QuranMainFeedTemplate,
    viewModel: QuranMainFeedViewModel
};

