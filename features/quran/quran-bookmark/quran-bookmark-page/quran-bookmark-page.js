/* ============================================================
   Nur Prayer — Quran Bookmarks Page Component
   Path: features/quran/quran-bookmark/quran-bookmark-page/quran-bookmark-page.js
   ============================================================ */
import { loadBookmarks, removeBookmark } from '../../quran-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const QuranBookmarkPageTemplate = {
    element: 'quran-bookmark-page-template',
    file: 'features/quran/quran-bookmark/quran-bookmark-page/quran-bookmark-page.html'
};

export function QuranBookmarkPageViewModel(params) {
    if (params instanceof QuranBookmarkPageViewModel) return params;
    if (!(this instanceof QuranBookmarkPageViewModel)) return new QuranBookmarkPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr) : function () { return arr; };
    }

    self.bookmarks = obsArr(loadBookmarks());

    self.refreshBookmarks = function () {
        self.bookmarks(loadBookmarks());
    };

    self.handleSelectBookmark = function (item, event) {
        var cb = p.onOpenSurah || p.onSelectBookmark;
        if (typeof cb === 'function') {
            cb(item.surahNumber, item.ayahNumber, event);
        }
    };

    self.handleRemoveBookmark = function (item, event) {
        var updated = removeBookmark(item.id || (item.surahNumber + ':' + item.ayahNumber));
        self.bookmarks(updated);
        if (typeof p.onBookmarksChanged === 'function') {
            p.onBookmarksChanged();
        }
    };

    self.goBack = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onBack === 'function') {
            p.onBack();
        } else if (typeof _win.showQuranTab === 'function') {
            _win.showQuranTab('quran');
        }
    };

    self.goToSettings = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onSettings === 'function') {
            p.onSettings();
        } else if (typeof _win.showPage === 'function') {
            _win.showPage('settings');
        }
    };
}

export default {
    template: QuranBookmarkPageTemplate,
    viewModel: QuranBookmarkPageViewModel
};

