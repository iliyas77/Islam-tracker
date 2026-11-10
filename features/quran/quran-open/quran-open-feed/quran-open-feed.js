/* ============================================================
   Nur Prayer — Quran Reader Ayahs Feed Component
   Path: features/quran/quran-open/quran-open-feed/quran-open-feed.js
   ============================================================ */
import { unwrap } from '../../quran-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const QuranOpenFeedTemplate = {
    element: 'quran-open-feed-template',
    file: 'features/quran/quran-open/quran-open-feed/quran-open-feed.html'
};

export function QuranOpenFeedViewModel(params) {
    if (params instanceof QuranOpenFeedViewModel) return params;
    if (!(this instanceof QuranOpenFeedViewModel)) return new QuranOpenFeedViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }
    function obsArr(arr) {
        return (k && k.observableArray) ? k.observableArray(arr) : function () { return arr; };
    }
    function comp(fn) {
        return (k && k.pureComputed) ? k.pureComputed(fn) : fn;
    }

    self.surahNum = (p.surahNum && k && k.isObservable(p.surahNum)) ? p.surahNum : obs(p.surahNum || 1);
    self.ayahs = (p.ayahs && k && k.isObservable(p.ayahs)) ? p.ayahs : obsArr(p.ayahs || []);
    self.isLoading = (p.isLoading && k && k.isObservable(p.isLoading)) ? p.isLoading : obs(false);
    self.hasError = (p.hasError && k && k.isObservable(p.hasError)) ? p.hasError : obs(false);
    self.errorMessage = (p.errorMessage && k && k.isObservable(p.errorMessage)) ? p.errorMessage : obs('');
    self.activeAudioKey = (p.activeAudioKey && k && k.isObservable(p.activeAudioKey)) ? p.activeAudioKey : obs(null);
    self.bookmarkKeys = (p.bookmarkKeys && k && k.isObservable(p.bookmarkKeys)) ? p.bookmarkKeys : obsArr([]);

    self.getAyahBookmarkObservable = function (ayah) {
        var aNum = ayah && ayah.aya;
        return comp(function () {
            var s = typeof self.surahNum === 'function' ? self.surahNum() : self.surahNum;
            var key = s + ':' + aNum;
            var bms = typeof self.bookmarkKeys === 'function' ? self.bookmarkKeys() : self.bookmarkKeys;
            return Array.isArray(bms) ? bms.indexOf(key) !== -1 : false;
        });
    };

    self.getAyahPlayingObservable = function (ayah) {
        var aNum = ayah && ayah.aya;
        return comp(function () {
            var s = typeof self.surahNum === 'function' ? self.surahNum() : self.surahNum;
            var key = s + ':' + aNum;
            var cur = typeof self.activeAudioKey === 'function' ? self.activeAudioKey() : self.activeAudioKey;
            return cur === key;
        });
    };

    self.handleBookmarkToggle = function (ayah, event) {
        var cb = p.onBookmarkToggle || p.onBookmark;
        if (typeof cb === 'function') {
            cb(ayah, event);
        }
    };

    self.handlePlay = function (ayah, event) {
        var cb = p.onPlay || p.onAudioPlay;
        if (typeof cb === 'function') {
            cb(ayah, event);
        }
    };

    self.retryLoad = function () {
        if (typeof p.onRetry === 'function') {
            p.onRetry();
        }
    };
}

export default {
    template: QuranOpenFeedTemplate,
    viewModel: QuranOpenFeedViewModel
};

