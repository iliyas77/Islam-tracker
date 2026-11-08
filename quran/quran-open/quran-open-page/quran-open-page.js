/* ============================================================
   Nur Prayer — Quran Reader Page Component
   Path: quran/quran-open/quran-open-page/quran-open-page.js
   ============================================================ */
import {
    loadSurah,
    getSurahMeta,
    loadBookmarks,
    toggleBookmark,
    playAyahAudio,
    stopAyahAudio,
    subscribeAudioState,
    unwrap
} from '../../quran-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const QuranOpenPageTemplate = {
    element: 'quran-open-page-template',
    file: 'quran/quran-open/quran-open-page/quran-open-page.html'
};

export function QuranOpenPageViewModel(params) {
    if (params instanceof QuranOpenPageViewModel) return params;
    if (!(this instanceof QuranOpenPageViewModel)) return new QuranOpenPageViewModel(params);

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

    self.currentSurahNum = (p.surahNum && k && k.isObservable(p.surahNum))
        ? p.surahNum
        : obs(unwrap(p.surahNum, 1));

    self.ayahs = obsArr([]);
    self.isLoading = obs(false);
    self.hasError = obs(false);
    self.errorMessage = obs('');
    self.activeAudioKey = obs(null);

    function getInitialBookmarkKeys() {
        var bms = loadBookmarks();
        return bms.map(function (b) { return b.surahNumber + ':' + b.ayahNumber; });
    }
    self.bookmarkKeys = obsArr(getInitialBookmarkKeys());

    // Subscribe to external audio playback changes
    subscribeAudioState(function (key) {
        if (typeof self.activeAudioKey === 'function') {
            self.activeAudioKey(key);
        }
    });

    self.readerTitle = comp(function () {
        var s = typeof self.currentSurahNum === 'function' ? self.currentSurahNum() : self.currentSurahNum;
        var meta = getSurahMeta(s);
        return meta ? ('Surah ' + meta.name) : ('Surah ' + s);
    });

    self.readerSubtitle = comp(function () {
        var s = typeof self.currentSurahNum === 'function' ? self.currentSurahNum() : self.currentSurahNum;
        var meta = getSurahMeta(s);
        if (!meta) return '';
        var rev = meta.revelation === 'Makkah' ? 'Makkah' : 'Madinah';
        return rev + ' • ' + meta.ayahs + ' Ayahs';
    });

    self.loadCurrentSurah = async function () {
        var s = typeof self.currentSurahNum === 'function' ? self.currentSurahNum() : self.currentSurahNum;
        self.isLoading(true);
        self.hasError(false);
        self.errorMessage('');

        try {
            var result = await loadSurah(s);
            // Verify surah hasn't changed while fetching
            var cur = typeof self.currentSurahNum === 'function' ? self.currentSurahNum() : self.currentSurahNum;
            if (cur === s) {
                self.ayahs(result || []);
                self.isLoading(false);
                var scrollEl = (typeof document !== 'undefined') ? document.getElementById('quranReaderScroll') : null;
                if (scrollEl) scrollEl.scrollTop = 0;
            }
        } catch (err) {
            var curErr = typeof self.currentSurahNum === 'function' ? self.currentSurahNum() : self.currentSurahNum;
            if (curErr === s) {
                self.isLoading(false);
                self.hasError(true);
                self.errorMessage(err.message || 'Network error');
            }
        }
    };

    if (k && k.isObservable(self.currentSurahNum)) {
        self.currentSurahNum.subscribe(function () {
            self.loadCurrentSurah();
        });
    }

    self.handleBookmarkToggle = function (ayah) {
        var s = typeof self.currentSurahNum === 'function' ? self.currentSurahNum() : self.currentSurahNum;
        var a = ayah && ayah.aya;
        var meta = getSurahMeta(s);
        toggleBookmark(s, a, ayah, meta);
        self.bookmarkKeys(getInitialBookmarkKeys());
        if (typeof p.onBookmarksChanged === 'function') {
            p.onBookmarksChanged();
        }
    };

    self.handlePlay = function (ayah) {
        var s = typeof self.currentSurahNum === 'function' ? self.currentSurahNum() : self.currentSurahNum;
        var a = ayah && ayah.aya;
        playAyahAudio(s, a);
    };

    self.goBack = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        stopAyahAudio();
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

    // Initial load
    self.loadCurrentSurah();
}

export default {
    template: QuranOpenPageTemplate,
    viewModel: QuranOpenPageViewModel
};

