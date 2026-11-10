/* ============================================================
   Nur Prayer — Quran Main Surah Row Card Component
   Path: features/quran/quran-main/quran-main-card/quran-main-card.js
   ============================================================ */
import { unwrap, getArabicName } from '../../quran-service.js';

export const QuranMainCardTemplate = {
    element: 'quran-main-card-template',
    file: 'features/quran/quran-main/quran-main-card/quran-main-card.html'
};

export function QuranMainCardViewModel(params) {
    if (params instanceof QuranMainCardViewModel) return params;
    if (!(this instanceof QuranMainCardViewModel)) return new QuranMainCardViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var item = (p.item && typeof p.item === 'function') ? p.item() : (p.item || p);
    var self = this;

    self.item = item;
    self.number = unwrap(item.n, 1);
    self.name = unwrap(item.name, '');
    self.meaning = unwrap(item.meaning, '');
    self.revelation = unwrap(item.revelation, 'Makkah');
    self.ayahs = unwrap(item.ayahs, 7);

    self.revelationTelugu = self.revelation === 'Makkah' ? 'మక్కీ' : 'మదనీ';
    self.revelationIcon = self.revelation === 'Makkah' ? 'fa-solid fa-kaaba' : 'fa-solid fa-mosque';
    self.revelationMetaText = self.revelationTelugu + ' • ' + self.ayahs + ' ఆయత్ లు';
    self.arabicName = unwrap(item.arabicName, getArabicName(self.number));

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
}

export default {
    template: QuranMainCardTemplate,
    viewModel: QuranMainCardViewModel
};

