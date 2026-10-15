/* ---------- Settings ---------- */
function rSET() {
    var fs = rdFS();
    var sdate = rdSD();
    var opts = [{ v: 0.9, l: 'Small' }, { v: 1, l: 'Medium' }, { v: 1.15, l: 'Large' }];
    var fsb = opts.map(function (o) {
        var a = Math.abs(fs - o.v) < 0.01;
        return '<button type="button" class="btn ' + (a ? 'btn-brand' : 'btn-light border') +
            ' flex-fill py-3 fw-bold" data-act="font" data-fs="' + o.v +
            '" style="border-radius:12px;font-size:1rem">' + o.l + '</button>';
    }).join('');

    $('settingsBody').innerHTML =
        '<div class="card shadow-sm rounded-4 p-3 mb-2" style="background:#fff">' +
        '<div class="d-flex align-items-center gap-3 mb-3">' +
        '<span class="modal-icon-badge">' +
        '<i class="fa-regular fa-calendar-check fs-4 text-success"></i></span>' +
        '<div class="flex-grow-1"><div class="fw-bold" style="font-size:1.05rem">Current Start Date</div></div>' +
        '</div>' +
        '<div class="d-flex gap-2 align-items-center">' +
        '<input type="date" class="form-control form-control-lg" id="sdInput" value="' + sdate +
        '" max="' + td() + '" style="border-radius:10px">' +
        '<button class="btn btn-brand fw-bold px-4 fs-6" data-act="sd-save" type="button" ' +
        'style="white-space:nowrap">Change</button>' +
        '</div>' +
        '</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2" style="background:#fff">' +
        '<div class="d-flex align-items-center gap-3 mb-3">' +
        '<span class="modal-icon-badge" style="font-weight:700;color:#1b7a4b;font-size:1.3rem">Aa</span>' +
        '<div class="flex-grow-1"><div class="fw-bold" style="font-size:1.05rem">Font Size</div></div>' +
        '</div>' +
        '<div class="d-flex gap-2" id="fsBtns">' + fsb + '</div>' +
        '</div>' +
        '<div class="card shadow-sm rounded-4 p-3 mb-2" style="background:#fff">' +
        '<div class="d-flex align-items-center gap-3 mb-2">' +
        '<span class="modal-icon-badge" style="background:#fde8e8">' +
        '<i class="fa-solid fa-triangle-exclamation fs-4 text-danger"></i></span>' +
        '<div class="flex-grow-1">' +
        '<div class="fw-bold" style="font-size:1.05rem">Reset Database</div>' +
        '<div class="text-muted" style="font-size:.8rem">This will delete all prayer data, old data and old period.</div>' +
        '</div>' +
        '</div>' +
        '<button class="btn btn-danger fw-bold w-100 mt-2 py-3" data-act="reset-db" type="button" ' +
        'style="border-radius:12px;font-size:1rem">Reset</button>' +
        '</div>' +
        '<div class="card rounded-4 p-3" style="background:#e7f1ff">' +
        '<div class="d-flex align-items-center gap-3">' +
        '<span class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" ' +
        'style="width:34px;height:34px;background:#0d6efd;color:#fff">' +
        '<i class="fa-solid fa-info" style="font-size:1rem"></i></span>' +
        '<div class="small" style="color:#1a2b23;line-height:1.4">' +
        'All changes are saved automatically in your device (localStorage).</div>' +
        '</div>' +
        '</div>';
}
