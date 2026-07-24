function toJalali(gy, gm, gd) { var g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334]; var jy = (gy <= 1600) ? 0 : 979; gy -= (gy <= 1600) ? 621 : 1600; var gy2 = (gm > 2) ? (gy + 1) : gy; var days = (365 * gy) + (Math.floor((gy2 + 3) / 4)) - (Math.floor((gy2 + 99) / 100)) + (Math.floor((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1]; jy += 33 * Math.floor(days / 12053); days %= 12053; jy += 4 * Math.floor(days / 1461); days %= 1461; if (days > 365) { jy += Math.floor((days - 1) / 365); days = (days - 1) % 365; } var jm = (days < 186) ? 1 + Math.floor(days / 31) : 7 + Math.floor((days - 186) / 30); var jd = 1 + ((days < 186) ? (days % 31) : ((days - 186) % 30)); return [jy, jm, jd]; }
function toFarsiNum(n) { var f = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹']; return String(n).replace(/\d/g, d => f[d]); }
function getJalaliDate() { var now = new Date(); var jd = toJalali(now.getFullYear(), now.getMonth() + 1, now.getDate()); var weekDays = ['یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه', 'پنج‌شنبه', 'جمعه', 'شنبه']; var months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند']; return { full: weekDays[now.getDay()] + ' ' + toFarsiNum(jd[2]) + ' ' + months[jd[1] - 1] + ' ' + toFarsiNum(jd[0]), year: toFarsiNum(jd[0]), monthDay: toFarsiNum(jd[2]) + ' ' + months[jd[1] - 1] + ' ' + toFarsiNum(jd[0]) }; }
function updateDates() { var d = getJalaliDate(); var t = document.getElementById('jalali-date'); var h = document.getElementById('jalali-date-header'); var f = document.getElementById('footer-year-copy'); if (t) t.textContent = d.full; if (h) h.textContent = d.monthDay; if (f) f.innerHTML = '<i class="ri-copyright-line" style="vertical-align:-2px;margin-left:4px;"></i>' + d.year + ' مستر شورت‌فیلم — تمام حقوق محفوظ است'; }
updateDates();
(function () { var now = new Date(); var midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1); setTimeout(function () { updateDates(); setInterval(updateDates, 86400000); }, midnight - now); })();
// Select the button and listen for a click event (فقط اگر در این صفحه وجود داشته باشد)
(function () {
    var newsletterBtn = document.getElementById("unknownB");
    if (newsletterBtn) {
        newsletterBtn.addEventListener("click", function () {
            alert("این بخش در حال حاضر در دسترس نمی‌باشد");
        });
    }
})();

// ===== منوی کشویی (اخبار / نمایش فیلم کوتاه) - برای لمسی/موبایل =====
(function () {
    var navItems = document.querySelectorAll('.nav-item');
    if (!navItems.length) return;

    function closeAll(except) {
        navItems.forEach(function (it) {
            if (it !== except) it.classList.remove('open');
        });
    }

    navItems.forEach(function (item) {
        var link = item.querySelector('.nav-link');
        if (!link) return;
        link.addEventListener('click', function (e) {
            // در دسکتاپ با هاور کار می‌کند؛ این کلیک برای موبایل/تاچ است
            if (window.matchMedia('(max-width:900px)').matches) {
                e.preventDefault();
                var isOpen = item.classList.contains('open');
                closeAll(item);
                item.classList.toggle('open', !isOpen);
            }
        });
    });

    document.addEventListener('click', function (e) {
        if (!e.target.closest('.nav-item')) closeAll(null);
    });
})();

// ===== اسلایدر بنر تبلیغاتی =====
(function () {
    var sliders = document.querySelectorAll('.ad-slider');
    if (!sliders.length) return;

    sliders.forEach(function (slider) {
        var track = slider.querySelector('.ad-slider-track');
        var slides = slider.querySelectorAll('.ad-slide');
        var dotsWrap = slider.querySelector('.ad-slider-dots');
        var prevBtn = slider.querySelector('.ad-slider-arrow.prev');
        var nextBtn = slider.querySelector('.ad-slider-arrow.next');
        if (!track || slides.length < 2) return;

        var count = slides.length;
        var current = 0;
        var timer = null;

        // ساخت نقطه‌ها
        var dots = [];
        if (dotsWrap) {
            dotsWrap.innerHTML = '';
            for (var i = 0; i < count; i++) {
                var d = document.createElement('button');
                d.type = 'button';
                d.className = 'ad-slider-dot' + (i === 0 ? ' active' : '');
                d.setAttribute('aria-label', 'اسلاید ' + (i + 1));
                (function (idx) {
                    d.addEventListener('click', function () { goTo(idx); resetTimer(); });
                })(i);
                dotsWrap.appendChild(d);
                dots.push(d);
            }
        }

        function render() {
            // چون RTL است، برای حرکت طبیعی از چپ به راست از translateX مثبت استفاده می‌کنیم
            track.style.transform = 'translateX(' + (current * 100) + '%)';
            dots.forEach(function (d, i) { d.classList.toggle('active', i === current); });
        }

        function goTo(idx) {
            current = (idx + count) % count;
            render();
        }

        function next() { goTo(current + 1); }
        function prevSlide() { goTo(current - 1); }

        if (nextBtn) nextBtn.addEventListener('click', function () { next(); resetTimer(); });
        if (prevBtn) prevBtn.addEventListener('click', function () { prevSlide(); resetTimer(); });

        function startTimer() { timer = setInterval(next, 5000); }
        function resetTimer() { if (timer) clearInterval(timer); startTimer(); }

        // سوایپ لمسی
        var touchStartX = null;
        track.addEventListener('touchstart', function (e) { touchStartX = e.touches[0].clientX; }, { passive: true });
        track.addEventListener('touchend', function (e) {
            if (touchStartX === null) return;
            var dx = e.changedTouches[0].clientX - touchStartX;
            if (Math.abs(dx) > 40) { dx > 0 ? prevSlide() : next(); resetTimer(); }
            touchStartX = null;
        }, { passive: true });

        render();
        startTimer();
    });
})();

// ===== فیلتر ژانر (صفحه نمایش فیلم کوتاه) =====
(function () {
    var bar = document.querySelector('.genre-filter-bar:not([data-custom])');
    if (!bar) return;
    var chips = bar.querySelectorAll('.genre-chip');
    var cards = document.querySelectorAll('[data-genre]');

    var emptyMsg = document.querySelector('.genre-empty');

    function applyFilter(genre) {
        chips.forEach(function (c) { c.classList.toggle('active', c.getAttribute('data-genre') === genre); });
        var visibleCount = 0;
        cards.forEach(function (card) {
            var show = (genre === 'all') || (card.getAttribute('data-genre') === genre);
            card.hidden = !show;
            if (show) visibleCount++;
        });
        if (emptyMsg) emptyMsg.style.display = visibleCount === 0 ? 'block' : 'none';
    }

    chips.forEach(function (chip) {
        chip.addEventListener('click', function () {
            var genre = chip.getAttribute('data-genre');
            applyFilter(genre);
            var url = new URL(window.location.href);
            if (genre === 'all') { url.searchParams.delete('genre'); }
            else { url.searchParams.set('genre', genre); }
            window.history.replaceState(null, '', url);
        });
    });

    var params = new URLSearchParams(window.location.search);
    var initialGenre = params.get('genre') || 'all';
    applyFilter(initialGenre);
})();
