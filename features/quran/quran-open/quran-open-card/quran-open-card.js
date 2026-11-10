/* ============================================================
   Nur Prayer — Quran Reader Ayah Card Component
   Path: features/quran/quran-open/quran-open-card/quran-open-card.js
   ============================================================ */
import {
    unwrap,
    escapeHtml,
    renderFootnotes,
    linkFootnoteMarkers,
    isAyahBookmarked
} from '../../quran-service.js';

var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const QuranOpenCardTemplate = {
    element: 'quran-open-card-template',
    file: 'features/quran/quran-open/quran-open-card/quran-open-card.html'
};

export function QuranOpenCardViewModel(params) {
    if (params instanceof QuranOpenCardViewModel) return params;
    if (!(this instanceof QuranOpenCardViewModel)) return new QuranOpenCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var ayah = (p.ayah && typeof p.ayah === 'function') ? p.ayah() : (p.ayah || p);
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    self.ayah = ayah;
    self.surahNum = unwrap(p.surahNum, 1);
    self.ayahNum = unwrap(ayah.aya, 1);
    self.badgeText = '#' + self.surahNum + ':' + self.ayahNum;

    self.arabicText = ayah.arabic_text || '';
    self.translationHtml = linkFootnoteMarkers(ayah.translation || '', self.surahNum);
    self.hasFootnotes = Boolean(ayah.footnotes && String(ayah.footnotes).trim().length > 0);
    self.footnotesHtml = self.hasFootnotes ? renderFootnotes(ayah.footnotes, self.surahNum) : '';

    if (p.isBookmarked && k && k.isObservable(p.isBookmarked)) {
        self.isBookmarked = p.isBookmarked;
    } else {
        self.isBookmarked = obs(isAyahBookmarked(self.surahNum, self.ayahNum));
    }

    if (p.isPlaying && k && k.isObservable(p.isPlaying)) {
        self.isPlaying = p.isPlaying;
    } else {
        self.isPlaying = obs(false);
    }

    self.handleBookmarkClick = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onBookmarkToggle || p.onBookmark;
        if (typeof cb === 'function') {
            cb(self.ayah, event);
        }
    };

    self.handlePlayClick = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onPlay || p.onAudioPlay;
        if (typeof cb === 'function') {
            cb(self.ayah, event);
        }
    };
}

export default {
    template: QuranOpenCardTemplate,
    viewModel: QuranOpenCardViewModel
};

