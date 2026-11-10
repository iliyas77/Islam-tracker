/* ============================================================
   Nur Prayer — Quran Bookmark Feed Component
   Path: features/quran/quran-bookmark/quran-bookmark-feed/quran-bookmark-feed.js
   ============================================================ */
var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const QuranBookmarkFeedTemplate = {
    element: 'quran-bookmark-feed-template',
    file: 'features/quran/quran-bookmark/quran-bookmark-feed/quran-bookmark-feed.html'
};

export function QuranBookmarkFeedViewModel(params) {
    if (params instanceof QuranBookmarkFeedViewModel) return params;
    if (!(this instanceof QuranBookmarkFeedViewModel)) return new QuranBookmarkFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr) : function () { return arr; };
    }

    self.bookmarks = (p.bookmarks && k && k.isObservable(p.bookmarks))
        ? p.bookmarks
        : obsArr(p.bookmarks || []);

    self.handleCardClick = function (item, event) {
        var cb = p.onSelectBookmark || p.onCardClick;
        if (typeof cb === 'function') {
            cb(item, event);
        }
    };

    self.handleRemove = function (item, event) {
        var cb = p.onRemoveBookmark || p.onRemove;
        if (typeof cb === 'function') {
            cb(item, event);
        }
    };
}

export default {
    template: QuranBookmarkFeedTemplate,
    viewModel: QuranBookmarkFeedViewModel
};

