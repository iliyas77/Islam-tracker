/* ---------- Settings (Constants referenced from utilities/constant.js) ---------- */
var SETTINGS_CONSTANTS = (window.CONSTANTS && window.CONSTANTS.SETTINGS) || {};
var INDIAN_CITIES = SETTINGS_CONSTANTS.INDIAN_CITIES || window.INDIAN_CITIES || [];
var CUSTOM_CITY_VALUE = SETTINGS_CONSTANTS.CUSTOM_CITY_VALUE || '__custom__';
var TIMINGS_STATUS_LABELS = (window.CONSTANTS && window.CONSTANTS.PRAYER && window.CONSTANTS.PRAYER.STATUS_LABELS) || { live: 'Live', cached: 'Cached', offline: 'Offline' };

function rSET() {
    var fs = rdFS();
    var sdate = rdSD();
    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Guntur', country: 'India', school: 1 };
    var opts = (window.CONSTANTS && window.CONSTANTS.SETTINGS && window.CONSTANTS.SETTINGS.FONT_SIZE_OPTIONS) || [{ v: 0.9, l: 'Small' }, { v: 1, l: 'Medium' }, { v: 1.15, l: 'Large' }];
    var fsb = opts.map(function (o) {
        var a = Math.abs(fs - o.v) < 0.01;
        return '<button type="button" class="btn ' + (a ? 'btn-brand' : 'btn-light border') +
            ' flex-1 py-3 fw-bold rounded-3 fs-6" data-act="font" data-fs="' + o.v +
            '" data-ref="page.settings.font-size.' + o.l.toLowerCase() + '">' + o.l + '</button>';
    }).join('');

    var statusText = TIMINGS_STATUS_LABELS[prayerTimingsStatus] || 'Offline';

    var groups = {};
    INDIAN_CITIES.forEach(function (c) {
        if (!groups[c.group]) groups[c.group] = [];
        groups[c.group].push(c);
    });

    var isPredefined = INDIAN_CITIES.some(function (c) {
        return c.name.toLowerCase() === (cfg.city || '').toLowerCase();
    });

    var cityOptionsHtml = Object.keys(groups).map(function (gName) {
        var optsHtml = groups[gName].map(function (c) {
            var selected = (cfg.city || '').toLowerCase() === c.name.toLowerCase();
            return '<option value="' + c.name + '"' + (selected ? ' selected' : '') +
                ' data-ref="page.settings.prayer-times.city-option.' + c.name.toLowerCase() + '">' +
                c.name + ' (' + c.state + ')' +
                '</option>';
        }).join('');
        return '<optgroup label="' + gName + '" data-ref="page.settings.prayer-times.group.' + gName.toLowerCase().replace(/[^a-z0-9]/g, '-') + '">' + optsHtml + '</optgroup>';
    }).join('');

    cityOptionsHtml +=
        '<optgroup label="Custom" data-ref="page.settings.prayer-times.group.custom">' +
        '<option value="' + CUSTOM_CITY_VALUE + '"' + (!isPredefined ? ' selected' : '') + ' data-ref="page.settings.prayer-times.city-option.custom">Other / Custom City...</option>' +
        '</optgroup>';

    var customDisplay = !isPredefined ? '' : ' d-none';
    var customVal = !isPredefined ? esc(cfg.city) : '';

    $('settingsBody').innerHTML =
        '<!-- Prayer Times Location Card -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.settings.prayer-times.card">' +
        '<div class="flex items-center gap-3 mb-3" data-ref="page.settings.prayer-times.header">' +
        '<span class="modal-icon-badge bg-brand-light" data-ref="page.settings.prayer-times.icon-badge">' +
        ((window.SVG_CONSTANTS && window.SVG_CONSTANTS.SHARED && window.SVG_CONSTANTS.SHARED.MOSQUE) || '').replace('<svg ', '<svg data-ref="page.settings.prayer-times.icon" ') + '</span>' +
        '<div class="grow" data-ref="page.settings.prayer-times.info">' +
        '<div class="fw-bold fs-6 text-gr1" data-ref="page.settings.prayer-times.title">Prayer Times Location</div>' +
        '<div class="text-muted small" data-ref="page.settings.prayer-times.subtitle">Selected City: ' + esc(cfg.city) + ', India</div>' +
        '</div>' +
        '<span class="badge rounded-pill bg-gr-accent-soft text-gr-accent px-2 py-1 fs-xs" data-ref="page.settings.prayer-times.status-badge">' +
        '<i class="fa-solid fa-circle-dot me-1"></i>' + statusText +
        '</span>' +
        '</div>' +
        '<div class="row g-2 mb-3" data-ref="page.settings.prayer-times.form-row">' +
        '<div class="col-12" data-ref="page.settings.prayer-times.city-col">' +
        '<label class="form-label text-muted small fw-bold mb-1" data-ref="page.settings.prayer-times.city-label">City (India)</label>' +
        '<select class="form-select form-select-lg" id="ptCitySelect" data-ref="page.settings.prayer-times.city-select">' +
        cityOptionsHtml +
        '</select>' +
        '</div>' +
        '<div class="col-12' + customDisplay + '" id="ptCustomCityWrap" data-ref="page.settings.prayer-times.custom-city-wrap">' +
        '<label class="form-label text-muted small fw-bold mb-1" data-ref="page.settings.prayer-times.custom-city-label">Custom City Name &amp; Country</label>' +
        '<div class="flex gap-2" data-ref="page.settings.prayer-times.custom-city-row">' +
        '<input type="text" class="form-control" id="ptCustomCityInput" value="' + customVal + '" placeholder="e.g. Guntur" data-ref="page.settings.prayer-times.custom-city-input">' +
        '<input type="text" class="form-control country-input-width" id="ptCountryInput" value="' + esc(cfg.country || 'India') + '" placeholder="Country" data-ref="page.settings.prayer-times.country-input">' +
        '</div>' +
        '</div>' +
        '<div class="col-12" data-ref="page.settings.prayer-times.school-col">' +
        '<label class="form-label text-muted small fw-bold mb-1" data-ref="page.settings.prayer-times.school-label">Juristic Method (Asr calculation)</label>' +
        '<select class="form-select" id="ptSchoolSelect" data-ref="page.settings.prayer-times.school-select">' +
        '<option value="1"' + (cfg.school === 1 ? ' selected' : '') + '>Hanafi (Standard in South Asia)</option>' +
        '<option value="0"' + (cfg.school === 0 ? ' selected' : '') + '>Shafi / Maliki / Hanbali</option>' +
        '</select>' +
        '</div>' +
        '</div>' +
        '<button class="btn btn-brand fw-bold w-100 py-3 fs-6 rounded-3" data-act="pt-save" type="button" data-ref="page.settings.prayer-times.save-btn">' +
        '<i class="fa-solid fa-arrows-rotate me-1" data-ref="page.settings.prayer-times.save-icon"></i>Sync &amp; Save Prayer Times' +
        '</button>' +
        '</div>' +

        '<!-- Start Date Card -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.settings.start-date.card">' +
        '<div class="flex items-center gap-3 mb-3" data-ref="page.settings.start-date.header">' +
        '<span class="modal-icon-badge" data-ref="page.settings.start-date.icon-badge">' +
        '<i class="fa-regular fa-calendar-check fs-4 text-brand" data-ref="page.settings.start-date.icon"></i></span>' +
        '<div class="grow" data-ref="page.settings.start-date.info"><div class="fw-bold fs-6" data-ref="page.settings.start-date.title">Current Start Date</div></div>' +
        '</div>' +
        '<div class="flex gap-2 items-center" data-ref="page.settings.start-date.input-row">' +
        '<input type="date" class="form-control form-control-lg rounded-3" id="sdInput" value="' + sdate +
        '" max="' + td() + '" data-ref="page.settings.start-date.input">' +
        '<button class="btn btn-brand fw-bold px-4 fs-6 text-nowrap" data-act="sd-save" type="button" ' +
        'data-ref="page.settings.start-date.save-btn">Change</button>' +
        '</div>' +
        '</div>' +

        '<!-- Font Size Card -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.settings.font-size.card">' +
        '<div class="flex items-center gap-3 mb-3" data-ref="page.settings.font-size.header">' +
        '<span class="modal-icon-badge text-gr-accent fw-bold fs-5" data-ref="page.settings.font-size.icon-badge">Aa</span>' +
        '<div class="grow" data-ref="page.settings.font-size.info"><div class="fw-bold fs-6" data-ref="page.settings.font-size.title">Font Size</div></div>' +
        '</div>' +
        '<div class="flex gap-2" id="fsBtns" data-ref="page.settings.font-size.buttons-row">' + fsb + '</div>' +
        '</div>' +

        '<!-- Reset DB Card -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.settings.reset.card">' +
        '<div class="flex items-center gap-3 mb-2" data-ref="page.settings.reset.header">' +
        '<span class="modal-icon-badge bg-danger-subtle" data-ref="page.settings.reset.icon-badge">' +
        '<i class="fa-solid fa-triangle-exclamation fs-4 text-danger" data-ref="page.settings.reset.icon"></i></span>' +
        '<div class="grow" data-ref="page.settings.reset.info">' +
        '<div class="fw-bold fs-6" data-ref="page.settings.reset.title">Reset Database</div>' +
        '<div class="text-muted small" data-ref="page.settings.reset.subtitle">This will delete all prayer data, old data and cache.</div>' +
        '</div>' +
        '</div>' +
        '<button class="btn btn-danger fw-bold w-100 mt-2 py-3 rounded-3 fs-6" data-act="reset-db" type="button" ' +
        'data-ref="page.settings.reset.btn">Reset</button>' +
        '</div>' +

        '<!-- Storage Info -->' +
        '<div class="card rounded-4 p-3 border-0 bg-brand-light" data-ref="page.settings.info.card">' +
        '<div class="flex items-center gap-3" data-ref="page.settings.info.content">' +
        '<span class="flex items-center justify-center rounded-circle shrink-0 bg-brand text-white info-icon-badge" ' +
        'data-ref="page.settings.info.icon">' +
        '<i class="fa-solid fa-info fs-6"></i></span>' +
        '<div class="small text-gr1 lh-sm" data-ref="page.settings.info.text">' +
        'All changes are saved automatically in your device (localStorage).</div>' +
        '</div>' +
        '</div>';

    var sel = $('ptCitySelect');
    if (sel) {
        sel.onchange = function () {
            var wrap = $('ptCustomCityWrap');
            if (wrap) {
                if (this.value === CUSTOM_CITY_VALUE) {
                    wrap.classList.remove('d-none');
                    var inp = $('ptCustomCityInput');
                    if (inp) inp.focus();
                } else {
                    wrap.classList.add('d-none');
                }
            }
        };
    }
}
