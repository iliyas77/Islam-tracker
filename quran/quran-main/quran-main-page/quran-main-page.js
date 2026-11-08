/* ============================================================
   Nur Prayer — Quran Main Page Component
   Path: quran/quran-main/quran-main-page/quran-main-page.js
   ============================================================ */
var _win = typeof window !== 'undefined' ? window : (typeof globalThis !== 'undefined' ? globalThis : {});
var _ko = typeof ko !== 'undefined' ? ko : (_win.ko || null);

export const QuranMainPageTemplate = {
    element: 'quran-main-page-template',
    file: 'quran/quran-main/quran-main-page/quran-main-page.html'
};

export function QuranMainPageViewModel(params) {
    if (params instanceof QuranMainPageViewModel) return params;
    if (!(this instanceof QuranMainPageViewModel)) return new QuranMainPageViewModel(params);

    var p = (params && typeof params === 'function') ? params() : (params || {});
    var k = _ko;
    var self = this;

    function obs(val) {
        return (k && k.observable) ? k.observable(val) : function () { return val; };
    }

    self.searchQuery = obs('');

    self.clearSearch = function () {
        self.searchQuery('');
    };

    self.handleSelectSurah = function (item, event) {
        var cb = p.onOpenSurah || p.onSelectSurah;
        if (typeof cb === 'function') {
            cb(item, event);
        }
    };

    self.goHome = function (d, e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (typeof p.onHome === 'function') {
            p.onHome();
        } else if (typeof _win.showPage === 'function') {
            _win.showPage('dashboard');
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
    template: QuranMainPageTemplate,
    viewModel: QuranMainPageViewModel
};

