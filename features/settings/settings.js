/* ---------- Settings ---------- */
var INDIAN_CITIES = [
    { name: 'Guntur', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
    { name: 'Vijayawada', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
    { name: 'Visakhapatnam', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
    { name: 'Tirupati', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
    { name: 'Kurnool', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },
    { name: 'Nellore', state: 'Andhra Pradesh', group: 'Popular Andhra Pradesh Cities' },

    { name: 'Delhi', state: 'National Capital Region', group: 'Major Indian Metros' },
    { name: 'Hyderabad', state: 'Telangana', group: 'Major Indian Metros' },
    { name: 'Bengaluru', state: 'Karnataka', group: 'Major Indian Metros' },
    { name: 'Mumbai', state: 'Maharashtra', group: 'Major Indian Metros' },
    { name: 'Chennai', state: 'Tamil Nadu', group: 'Major Indian Metros' },
    { name: 'Kolkata', state: 'West Bengal', group: 'Major Indian Metros' },

    { name: 'Ahmedabad', state: 'Gujarat', group: 'Other Prominent Cities' },
    { name: 'Lucknow', state: 'Uttar Pradesh', group: 'Other Prominent Cities' },
    { name: 'Pune', state: 'Maharashtra', group: 'Other Prominent Cities' },
    { name: 'Jaipur', state: 'Rajasthan', group: 'Other Prominent Cities' },
    { name: 'Bhopal', state: 'Madhya Pradesh', group: 'Other Prominent Cities' },
    { name: 'Patna', state: 'Bihar', group: 'Other Prominent Cities' },
    { name: 'Srinagar', state: 'Jammu & Kashmir', group: 'Other Prominent Cities' },
    { name: 'Kozhikode', state: 'Kerala', group: 'Other Prominent Cities' },
    { name: 'Kochi', state: 'Kerala', group: 'Other Prominent Cities' },
    { name: 'Indore', state: 'Madhya Pradesh', group: 'Other Prominent Cities' },
    { name: 'Nagpur', state: 'Maharashtra', group: 'Other Prominent Cities' },
    { name: 'Kanpur', state: 'Uttar Pradesh', group: 'Other Prominent Cities' },
    { name: 'Surat', state: 'Gujarat', group: 'Other Prominent Cities' },
    { name: 'Aurangabad', state: 'Maharashtra', group: 'Other Prominent Cities' },
    { name: 'Chandigarh', state: 'Punjab/Haryana', group: 'Other Prominent Cities' }
];

function rSET() {
    var fs = rdFS();
    var sdate = rdSD();
    var cfg = typeof getPrayerConfig === 'function' ? getPrayerConfig() : { city: 'Guntur', country: 'India', school: 1 };
    var opts = [{ v: 0.9, l: 'Small' }, { v: 1, l: 'Medium' }, { v: 1.15, l: 'Large' }];
    var fsb = opts.map(function (o) {
        var a = Math.abs(fs - o.v) < 0.01;
        return '<button type="button" class="btn ' + (a ? 'btn-brand' : 'btn-light border') +
            ' flex-fill py-3 fw-bold" data-act="font" data-fs="' + o.v +
            '" style="border-radius:12px;font-size:1rem" data-ref="page.settings.font-size.' + o.l.toLowerCase() + '">' + o.l + '</button>';
    }).join('');

    var statusText = prayerTimingsStatus === 'live' ? 'Live' : (prayerTimingsStatus === 'cached' ? 'Cached' : 'Offline');

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
        '<option value="__custom__"' + (!isPredefined ? ' selected' : '') + ' data-ref="page.settings.prayer-times.city-option.custom">Other / Custom City...</option>' +
        '</optgroup>';

    var customDisplay = !isPredefined ? '' : ' d-none';
    var customVal = !isPredefined ? esc(cfg.city) : '';

    $('settingsBody').innerHTML =
        '<!-- Prayer Times Location Card -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.settings.prayer-times.card">' +
        '<div class="d-flex align-items-center gap-3 mb-3" data-ref="page.settings.prayer-times.header">' +
        '<span class="modal-icon-badge" style="background:#e8f4ed" data-ref="page.settings.prayer-times.icon-badge">' +
        '<i class="fa-solid fa-mosque fs-4 text-success" data-ref="page.settings.prayer-times.icon"></i></span>' +
        '<div class="flex-grow-1" data-ref="page.settings.prayer-times.info">' +
        '<div class="fw-bold fs-6 text-gr1" data-ref="page.settings.prayer-times.title">Prayer Times Location</div>' +
        '<div class="text-muted small" data-ref="page.settings.prayer-times.subtitle">Selected City: ' + esc(cfg.city) + ', India</div>' +
        '</div>' +
        '<span class="badge rounded-pill bg-gr-accent-soft text-gr-accent px-2 py-1" style="font-size:0.72rem" data-ref="page.settings.prayer-times.status-badge">' +
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
        '<div class="d-flex gap-2" data-ref="page.settings.prayer-times.custom-city-row">' +
        '<input type="text" class="form-control" id="ptCustomCityInput" value="' + customVal + '" placeholder="e.g. Guntur" data-ref="page.settings.prayer-times.custom-city-input">' +
        '<input type="text" class="form-control" id="ptCountryInput" value="' + esc(cfg.country || 'India') + '" placeholder="Country" style="max-width:130px" data-ref="page.settings.prayer-times.country-input">' +
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
        '<div class="d-flex align-items-center gap-3 mb-3" data-ref="page.settings.start-date.header">' +
        '<span class="modal-icon-badge" data-ref="page.settings.start-date.icon-badge">' +
        '<i class="fa-regular fa-calendar-check fs-4 text-success" data-ref="page.settings.start-date.icon"></i></span>' +
        '<div class="flex-grow-1" data-ref="page.settings.start-date.info"><div class="fw-bold" style="font-size:1.05rem" data-ref="page.settings.start-date.title">Current Start Date</div></div>' +
        '</div>' +
        '<div class="d-flex gap-2 align-items-center" data-ref="page.settings.start-date.input-row">' +
        '<input type="date" class="form-control form-control-lg" id="sdInput" value="' + sdate +
        '" max="' + td() + '" style="border-radius:10px" data-ref="page.settings.start-date.input">' +
        '<button class="btn btn-brand fw-bold px-4 fs-6" data-act="sd-save" type="button" ' +
        'style="white-space:nowrap" data-ref="page.settings.start-date.save-btn">Change</button>' +
        '</div>' +
        '</div>' +

        '<!-- Font Size Card -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.settings.font-size.card">' +
        '<div class="d-flex align-items-center gap-3 mb-3" data-ref="page.settings.font-size.header">' +
        '<span class="modal-icon-badge text-gr-accent" style="font-weight:700;font-size:1.3rem" data-ref="page.settings.font-size.icon-badge">Aa</span>' +
        '<div class="flex-grow-1" data-ref="page.settings.font-size.info"><div class="fw-bold" style="font-size:1.05rem" data-ref="page.settings.font-size.title">Font Size</div></div>' +
        '</div>' +
        '<div class="d-flex gap-2" id="fsBtns" data-ref="page.settings.font-size.buttons-row">' + fsb + '</div>' +
        '</div>' +

        '<!-- Reset DB Card -->' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2 bg-gr border-0" data-ref="page.settings.reset.card">' +
        '<div class="d-flex align-items-center gap-3 mb-2" data-ref="page.settings.reset.header">' +
        '<span class="modal-icon-badge" style="background:#fde8e8" data-ref="page.settings.reset.icon-badge">' +
        '<i class="fa-solid fa-triangle-exclamation fs-4 text-danger" data-ref="page.settings.reset.icon"></i></span>' +
        '<div class="flex-grow-1" data-ref="page.settings.reset.info">' +
        '<div class="fw-bold" style="font-size:1.05rem" data-ref="page.settings.reset.title">Reset Database</div>' +
        '<div class="text-muted" style="font-size:.8rem" data-ref="page.settings.reset.subtitle">This will delete all prayer data, old data and cache.</div>' +
        '</div>' +
        '</div>' +
        '<button class="btn btn-danger fw-bold w-100 mt-2 py-3" data-act="reset-db" type="button" ' +
        'style="border-radius:12px;font-size:1rem" data-ref="page.settings.reset.btn">Reset</button>' +
        '</div>' +

        '<!-- Storage Info -->' +
        '<div class="card rounded-4 p-3 border-0" style="background:#e7f1ff" data-ref="page.settings.info.card">' +
        '<div class="d-flex align-items-center gap-3" data-ref="page.settings.info.content">' +
        '<span class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" ' +
        'style="width:34px;height:34px;background:#0d6efd;color:#fff" data-ref="page.settings.info.icon">' +
        '<i class="fa-solid fa-info" style="font-size:1rem"></i></span>' +
        '<div class="small text-gr1" style="line-height:1.4" data-ref="page.settings.info.text">' +
        'All changes are saved automatically in your device (localStorage).</div>' +
        '</div>' +
        '</div>';

    var sel = $('ptCitySelect');
    if (sel) {
        sel.onchange = function () {
            var wrap = $('ptCustomCityWrap');
            if (wrap) {
                if (this.value === '__custom__') {
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
