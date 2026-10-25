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

// ===== حالت تاریک/روشن (Dark / Light theme) =====
(function () {
    var THEME_KEY = 'mrsf-theme';
    var root = document.documentElement;
    var sw = document.getElementById('themeSwitch');

    function getTheme() {
        try { return localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { return 'light'; }
    }

    function setTheme(theme) {
        if (theme === 'dark') { root.setAttribute('data-theme', 'dark'); }
        else { root.removeAttribute('data-theme'); }
        try { localStorage.setItem(THEME_KEY, theme); } catch (e) { }
    }

    setTheme(getTheme());
    if (sw) {
        sw.checked = getTheme() === 'dark';
        sw.addEventListener('change', function () {
            setTheme(sw.checked ? 'dark' : 'light');
        });
    }
})();

// ===== جستجوی سایت (باکس جستجوی هدر) =====
(function () {
    var input = document.getElementById('headerSearchInput');
    var btn = document.getElementById('headerSearchBtn');
    if (!input) return;

    // اگر همین الان در صفحه وبلاگ با پارامتر جستجو هستیم، مقدار باکس را پر کن
    var params = new URLSearchParams(window.location.search);
    var currentQuery = params.get('s');
    if (currentQuery) input.value = currentQuery;

    function runSearch() {
        var q = input.value.trim();
        var onBlogPage = !!document.getElementById('blog-grid');

        if (onBlogPage) {
            var url = new URL(window.location.href);
            if (q) url.searchParams.set('s', q); else url.searchParams.delete('s');
            window.history.replaceState(null, '', url);
            if (typeof renderBlogGrid === 'function') renderBlogGrid();
        } else {
            var target = (location.pathname.indexOf('/news/') !== -1 ? '../' : '') + 'blog.html' + (q ? ('?s=' + encodeURIComponent(q)) : '');
            window.location.href = target;
        }
    }

    if (btn) btn.addEventListener('click', function (e) { e.preventDefault(); runSearch(); });
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') { e.preventDefault(); runSearch(); }
    });
})();


// ===== جلوه‌های سبک: ظاهر شدن تدریجی، نوار مطالعه، بازگشت به بالا، گذار تم =====
(function () {
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var root = document.documentElement;

    // نوار پیشرفت مطالعه (فقط صفحه مطلب)
    var body = document.querySelector('.post-body');
    var bar = null;
    if (body) {
        bar = document.createElement('div');
        bar.id = 'read-progress';
        document.body.appendChild(bar);
    }

    // دکمه بازگشت به بالا
    var up = document.createElement('button');
    up.className = 'to-top';
    up.type = 'button';
    up.setAttribute('aria-label', 'بازگشت به بالا');
    up.innerHTML = '<i class="ri-arrow-up-line"></i>';
    up.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
    document.body.appendChild(up);

    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
            ticking = false;
            var y = window.scrollY || root.scrollTop;
            up.classList.toggle('show', y > 600);
            if (bar && body) {
                var r = body.getBoundingClientRect();
                var total = r.height - window.innerHeight * 0.6;
                var p = total > 0 ? Math.min(1, Math.max(0, (-r.top + window.innerHeight * 0.2) / total)) : 1;
                bar.style.transform = 'scaleX(' + p + ')';
            }
        });
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
})();


/* =====================================================================
   منوی بازشوی پشتیبانی + بهینه‌سازی‌های سبک نمایش
   ===================================================================== */
/* ★ تنظیمات پشتیبانی — فقط همین مقادیر را پر کنید ★
   email    : ایمیل پشتیبانی/تبلیغات (مثلاً 'ads@mrshortfilm.com')
   telegram : آی‌دی تلگرام بدون @ (مثلاً 'mrshortfilm_support')
   whatsapp : شماره با کد کشور بدون + (مثلاً '989121234567')
   هر کدام را خالی بگذارید، دکمهٔ آن در فرم نمایش داده نمی‌شود. */
var SUPPORT_CONFIG = { email: 'offcialmrstlortfilm@gmail.com', telegram: '', whatsapp: '' };

(function () {
    if (window.__spInit) return; window.__spInit = true;
    function ready(fn) { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); }

    ready(function () {
        /* ---- ۱) سبک‌سازی: تنبل‌بارگذاری تصاویر و ظهور نرم کارت‌ها ---- */
        try {
            document.querySelectorAll('img:not([loading])').forEach(function (im, i) {
                if (!im.closest('header') && !im.closest('.ad-slider')) { im.loading = 'lazy'; }
                im.decoding = 'async';
            });
            if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
                var io = new IntersectionObserver(function (es) {
                    es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
                }, { rootMargin: '0px 0px -8% 0px', threshold: .05 });
                var mark = function (root) {
                    (root || document).querySelectorAll('.news-card, .blog-card, .feat-card, .widget, .special-news-box, .poll-card').forEach(function (el) {
                        if (el.classList.contains('rv')) return;
                        var r = el.getBoundingClientRect();
                        if (r.top < innerHeight) return;           // بالای صفحه همان‌جا دیده شود
                        el.classList.add('rv'); io.observe(el);
                    });
                };
                mark();
                // کارت‌هایی که بعداً با جاوااسکریپت ساخته می‌شوند
                new MutationObserver(function (ms) { ms.forEach(function (m) { m.addedNodes.forEach(function (n) { if (n.nodeType === 1) mark(n); }); }); })
                    .observe(document.body, { childList: true, subtree: true });
            }
        } catch (e) { }

        /* ---- ۲) ساخت منوی پشتیبانی ---- */
        var C = SUPPORT_CONFIG || {};
        var isDev = !/(^|\.)mrshortfilm\.com$/.test(location.hostname);
        var TYPES = {
            ad: { t: 'ثبت تبلیغ', d: 'بنر، اسپانسری و تبلیغ در سایت', i: 'ri-advertisement-line', h: 'ثبت درخواست تبلیغ', p: 'نوع تبلیغ و توضیح کوتاه آن را بنویسید.', ph: 'مثلاً: بنر صفحهٔ اصلی برای مدت یک ماه / معرفی جشنواره یا فیلم...' },
            support: { t: 'تماس با پشتیبانی', d: 'پرسش، پیشنهاد یا هر موضوع دیگر', i: 'ri-customer-service-2-line', h: 'تماس با پشتیبانی', p: 'پیام خود را بنویسید تا بررسی شود.', ph: 'پیام شما...' },
            news: { t: 'ارسال خبر یا معرفی فیلم', d: 'خبر جشنواره، فیلم کوتاه یا اثر خودتان', i: 'ri-film-line', h: 'ارسال خبر / معرفی فیلم کوتاه', p: 'نام فیلم، کارگردان، جشنواره و لینک منبع را بنویسید.', ph: 'نام فیلم، کارگردان، جشنواره، تاریخ و لینک منبع خبر...' },
            bug: { t: 'گزارش مشکل سایت', d: 'خطا، صفحهٔ خراب یا لینک ناکار', i: 'ri-bug-line', h: 'گزارش مشکل', p: 'آدرس صفحه و مشکل را توضیح دهید.', ph: 'مثلاً: در صفحهٔ ... وقتی ... را می‌زنم ...' }
        };
        var FAQ = [
            ['چطور تبلیغ ثبت کنم؟', 'از همین منو گزینهٔ «ثبت تبلیغ» را انتخاب کنید، نوع تبلیغ و راه تماس خود را بنویسید و پیام را ارسال کنید.'],
            ['چطور خبر یا فیلم خودم را معرفی کنم؟', 'گزینهٔ «ارسال خبر یا معرفی فیلم» را بزنید و نام فیلم، کارگردان، جشنواره و لینک منبع را بفرستید. فقط اخبار دارای منبع معتبر منتشر می‌شود.'],
            ['آیا مستر شورت‌فیلم خبر سیاسی منتشر می‌کند؟', 'خیر؛ این سایت فقط دربارهٔ فیلم کوتاه، جشنواره‌ها و سینما می‌نویسد.'],
            ['یک صفحه یا لینک خراب است، چه کنم؟', 'گزینهٔ «گزارش مشکل سایت» را بزنید و آدرس صفحه را بنویسید.']
        ];
        var root = document.createElement('div');
        root.className = 'sp-root';
        var menu = Object.keys(TYPES).map(function (k) {
            var o = TYPES[k];
            return '<li><button type="button" data-k="' + k + '"><span class="sp-ic"><i class="' + o.i + '"></i></span><span><b>' + o.t + '</b><small>' + o.d + '</small></span><i class="ri-arrow-left-s-line sp-go"></i></button></li>';
        }).join('') + '<li><button type="button" data-k="faq"><span class="sp-ic"><i class="ri-question-line"></i></span><span><b>سؤال‌های متداول</b><small>پاسخ سریع به پرسش‌های رایج</small></span><i class="ri-arrow-left-s-line sp-go"></i></button></li>';
        root.innerHTML =
            '<div class="sp-bubble" role="status"><button type="button" aria-label="بستن">×</button>سلام! برای <a data-k="ad">ثبت تبلیغ</a> یا ارتباط با پشتیبانی از همین‌جا اقدام کنید.</div>' +
            '<div class="sp-panel" id="sp-panel" role="dialog" aria-label="پشتیبانی مستر شورت‌فیلم" aria-modal="false">' +
            '<div class="sp-head"><h3 id="sp-title">پشتیبانی مستر شورت‌فیلم</h3><p id="sp-sub">چطور می‌توانیم کمکتان کنیم؟</p>' +
            '<button type="button" class="sp-back" hidden aria-label="بازگشت"><i class="ri-arrow-right-line"></i></button>' +
            '<button type="button" class="sp-close" aria-label="بستن"><i class="ri-close-line"></i></button></div>' +
            '<ul class="sp-menu">' + menu + '</ul><div class="sp-view" hidden></div></div>' +
            '<button type="button" class="sp-fab" aria-expanded="false" aria-controls="sp-panel"><i class="ri-customer-service-2-fill"></i><span>پشتیبانی</span><i class="sp-dot" style="font-size:0"></i></button>';
        document.body.appendChild(root);

        var fab = root.querySelector('.sp-fab'), panel = root.querySelector('.sp-panel'), bubble = root.querySelector('.sp-bubble');
        var menuEl = root.querySelector('.sp-menu'), view = root.querySelector('.sp-view');
        var title = root.querySelector('#sp-title'), sub = root.querySelector('#sp-sub'), back = root.querySelector('.sp-back');

        function setOpen(v) {
            root.classList.toggle('open', v); fab.setAttribute('aria-expanded', v ? 'true' : 'false');
            fab.querySelector('i').className = v ? 'ri-close-line' : 'ri-customer-service-2-fill';
            if (v) { hideBubble(); } else { home(); }
        }
        function hideBubble() { bubble.classList.remove('show'); try { sessionStorage.setItem('sp-b', '1'); } catch (e) { } }
        function home() {
            menuEl.hidden = false; view.hidden = true; back.hidden = true;
            title.textContent = 'پشتیبانی مستر شورت‌فیلم'; sub.textContent = 'چطور می‌توانیم کمکتان کنیم؟';
        }
        function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
        function open(k) {
            menuEl.hidden = true; view.hidden = false; back.hidden = false;
            if (k === 'faq') {
                title.textContent = 'سؤال‌های متداول'; sub.textContent = 'پاسخ پرسش‌های رایج';
                view.innerHTML = '<div class="sp-faq">' + FAQ.map(function (f) { return '<details><summary>' + f[0] + '</summary><p>' + f[1] + '</p></details>'; }).join('') + '</div>';
                return;
            }
            var o = TYPES[k];
            title.textContent = o.h; sub.textContent = o.p;
            view.innerHTML =
                '<form novalidate>' +
                '<div class="sp-field"><label for="sp-n">نام</label><input id="sp-n" maxlength="60" autocomplete="name"></div>' +
                '<div class="sp-field"><label for="sp-c">راه تماس (ایمیل، تلفن یا آی‌دی تلگرام) <span style="color:var(--red)">*</span></label><input id="sp-c" maxlength="80" autocomplete="email"><div class="sp-err">راه تماس را وارد کنید.</div></div>' +
                '<div class="sp-field"><label for="sp-m">پیام <span style="color:var(--red)">*</span></label><textarea id="sp-m" maxlength="1500" placeholder="' + esc(o.ph) + '"></textarea><div class="sp-err">پیام را کامل‌تر بنویسید (حداقل ۱۰ حرف).</div></div>' +
                '<div class="sp-actions"></div><p class="sp-note"></p></form>';
            var acts = view.querySelector('.sp-actions'), note = view.querySelector('.sp-note');
            var any = C.email || C.telegram || C.whatsapp;
            if (C.email) acts.insertAdjacentHTML('beforeend', '<button class="sp-btn primary" type="button" data-s="mail"><i class="ri-mail-send-line"></i> ارسال با ایمیل</button>');
            if (C.telegram) acts.insertAdjacentHTML('beforeend', '<button class="sp-btn' + (C.email ? '' : ' primary') + '" type="button" data-s="tg"><i class="ri-telegram-fill"></i> تلگرام</button>');
            if (C.whatsapp) acts.insertAdjacentHTML('beforeend', '<button class="sp-btn" type="button" data-s="wa"><i class="ri-whatsapp-line"></i> واتس‌اپ</button>');
            acts.insertAdjacentHTML('beforeend', '<button class="sp-btn' + (any ? '' : ' primary') + '" type="button" data-s="copy"><i class="ri-file-copy-line"></i> کپی پیام</button>');
            note.textContent = any ? 'پیام در برنامهٔ انتخابی شما آماده می‌شود و با زدن «ارسال» به ما می‌رسد.' : 'برای ارسال، پیام را کپی کنید و برای ما بفرستید.';
            if (!any && isDev) { note.className = 'sp-note dev'; note.textContent = 'نسخهٔ آزمایشی: برای فعال شدن دکمه‌های ارسال، ایمیل/تلگرام/واتس‌اپ را در SUPPORT_CONFIG ابتدای بخش پشتیبانی در assets/common.js وارد کنید.'; }
            var form = view.querySelector('form');
            function build() {
                var n = form.querySelector('#sp-n').value.trim(), c = form.querySelector('#sp-c').value.trim(), m = form.querySelector('#sp-m').value.trim();
                var okc = c.length >= 3, okm = m.length >= 10;
                form.querySelector('#sp-c').parentNode.classList.toggle('bad', !okc);
                form.querySelector('#sp-m').parentNode.classList.toggle('bad', !okm);
                if (!okc || !okm) return null;
                var subj = 'مستر شورت‌فیلم | ' + o.t;
                return { subj: subj, body: subj + '\n\nنام: ' + (n || '-') + '\nراه تماس: ' + c + '\nصفحه: ' + location.href + '\n\n' + m };
            }
            function done(msg) { view.innerHTML = '<div class="sp-ok"><i class="ri-checkbox-circle-fill"></i><p>' + msg + '</p><div class="sp-actions" style="margin-top:12px"><button class="sp-btn" type="button" data-s="home">بازگشت به منو</button></div></div>'; }
            form.addEventListener('click', function (e) {
                var b = e.target.closest('[data-s]'); if (!b) return;
                var d = build(); if (!d) return;
                var s = b.getAttribute('data-s');
                if (s === 'mail') { location.href = 'mailto:' + C.email + '?subject=' + encodeURIComponent(d.subj) + '&body=' + encodeURIComponent(d.body); done('برنامهٔ ایمیل شما باز شد؛ پیام را ارسال کنید.'); }
                else if (s === 'tg') { copy(d.body); window.open('https://t.me/' + encodeURIComponent(C.telegram), '_blank', 'noopener'); done('پیام کپی شد؛ در گفتگوی تلگرام که باز شد آن را بچسبانید و بفرستید.'); }
                else if (s === 'wa') { window.open('https://wa.me/' + encodeURIComponent(C.whatsapp) + '?text=' + encodeURIComponent(d.body), '_blank', 'noopener'); done('واتس‌اپ باز شد؛ پیام را ارسال کنید.'); }
                else if (s === 'copy') { copy(d.body); done('پیام کپی شد. آن را برای ما بفرستید.'); }
            });
            form.addEventListener('submit', function (e) { e.preventDefault(); });
            setTimeout(function () { var f = view.querySelector('#sp-n'); if (f) f.focus(); }, 60);
        }
        function copy(t) {
            try { if (navigator.clipboard && window.isSecureContext) { navigator.clipboard.writeText(t); return; } } catch (e) { }
            var a = document.createElement('textarea'); a.value = t; a.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(a); a.select();
            try { document.execCommand('copy'); } catch (e) { } a.remove();
        }

        fab.addEventListener('click', function () { setOpen(!root.classList.contains('open')); });
        root.querySelector('.sp-close').addEventListener('click', function () { setOpen(false); fab.focus(); });
        back.addEventListener('click', home);
        menuEl.addEventListener('click', function (e) { var b = e.target.closest('[data-k]'); if (b) open(b.getAttribute('data-k')); });
        view.addEventListener('click', function (e) { if (e.target.closest('[data-s="home"]')) home(); });
        bubble.querySelector('button').addEventListener('click', hideBubble);
        bubble.querySelector('a').addEventListener('click', function () { setOpen(true); open('ad'); });
        document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && root.classList.contains('open')) { setOpen(false); fab.focus(); } });
        document.addEventListener('click', function (e) { if (root.classList.contains('open') && !root.contains(e.target)) setOpen(false); });

        // لینک‌های «آگهی‌دهی» و «تماس با ما» در سایت، منوی پشتیبانی را باز می‌کنند
        window.openSupport = function (k) { setOpen(true); open(k || 'support'); };
        document.querySelectorAll('a[href="#"]').forEach(function (a) {
            var t = a.textContent.trim();
            var k = /آگهی|تبلیغ/.test(t) ? 'ad' : /تماس/.test(t) ? 'support' : '';
            if (k) a.addEventListener('click', function (e) { e.preventDefault(); window.openSupport(k); });
        });

        // پیام خوش‌آمد؛ فقط یک بار در هر نشست
        try { if (!sessionStorage.getItem('sp-b')) setTimeout(function () { if (!root.classList.contains('open')) bubble.classList.add('show'); }, 3500); } catch (e) { }
        setTimeout(function () { bubble.classList.remove('show'); }, 14000);
    });
})();
