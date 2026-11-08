/* ============================================================
   Nur Prayer — Quran Bookmark Item Card Component
   Path: quran/quran-bookmark/quran-bookmark-card/quran-bookmark-card.js
   ============================================================ */
import { unwrap } from '../../quran-service.js';

export const QuranBookmarkCardTemplate = {
    element: 'quran-bookmark-card-template',
    file: 'quran/quran-bookmark/quran-bookmark-card/quran-bookmark-card.html'
};

export function QuranBookmarkCardViewModel(params) {
    if (params instanceof QuranBookmarkCardViewModel) return params;
    if (!(this instanceof QuranBookmarkCardViewModel)) return new QuranBookmarkCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.item = item;
    self.surahNumber = unwrap(item.surahNumber, 1);
    self.ayahNumber = unwrap(item.ayahNumber, 1);
    self.badgeText = '#' + self.surahNumber + ':' + self.ayahNumber;
    self.surahName = unwrap(item.surahName, 'Surah ' + self.surahNumber);
    self.arabicName = unwrap(item.arabicName, '');
    self.arabicText = unwrap(item.arabicText, '');
    self.translation = unwrap(item.translation, '');

    self.handleClick = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onClick || p.onCardClick;
        if (typeof cb === 'function') {
            cb(self.item, event);
        }
    };
    self.onCardClick = self.handleClick;

    self.handleRemove = function (d, e) {
        var event = e || (d && d.stopPropagation ? d : null);
        if (event && event.stopPropagation) {
            event.stopPropagation();
        }
        var cb = p.onRemove || p.onDelete;
        if (typeof cb === 'function') {
            cb(self.item, event);
        }
    };
}

export default {
    template: QuranBookmarkCardTemplate,
    viewModel: QuranBookmarkCardViewModel
};

