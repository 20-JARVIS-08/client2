/* =========================================================
   موتور نظرسنجی فیلم‌های کوتاه — مستر شورت‌فیلم
   -----------------------------------------------------------
   نتیجه نظرسنجی در Firebase Firestore ذخیره می‌شود تا برای همه
   بازدیدکننده‌های سایت (حتی روی GitHub Pages) مشترک و به‌روز
   باشد. اگر Firebase تنظیم نشده باشد، به‌صورت خودکار روی حالت
   localStorage (فقط همین مرورگر) سوییچ می‌کند.

   افزودن نظرسنجی جدید: کافی است یک آبجکت به POLLS اضافه کنید.
   ========================================================= */

const POLL_LOCAL_VOTES_KEY = 'mrshortfilm_poll_votes_local';   // کدام نظرسنجی‌ها را کاربر رای داده
const POLL_LOCAL_COUNTS_KEY = 'mrshortfilm_poll_counts_local'; // شمارش محلی (وقتی فایربیس غیرفعال است)

/* ---------- تشخیص وضعیت اتصال Firebase (مشترک با blog.js اما مستقل) ---------- */
let pollDb = null;
let pollFirestoreEnabled = false;
try {
    if (typeof firebaseConfig !== 'undefined' &&
        firebaseConfig.apiKey &&
        firebaseConfig.apiKey.indexOf('YOUR_') !== 0 &&
        typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        pollDb = firebase.firestore();
        pollFirestoreEnabled = true;
    }
} catch (e) {
    console.warn('Firebase برای نظرسنجی غیرفعال است، حالت محلی استفاده می‌شود.', e);
    pollFirestoreEnabled = false;
}

function isPollBackendConnected() {
    return pollFirestoreEnabled;
}

/* =========================================================
   ✍️ فهرست نظرسنجی‌ها — نظرسنجی جدید را همین‌جا اضافه کنید
   ========================================================= */
const POLLS = [
    {
        id: 'favorite-short-film-1405',
        question: 'کدام‌یک از این فیلم‌های کوتاه را بیشتر می‌پسندید؟',
        subtitle: 'نتیجه این نظرسنجی به‌صورت زنده برای همه بازدیدکننده‌های سایت نمایش داده می‌شود.',
        options: [
            { id: 'mandala', title: 'ماندالا', director: 'بهنام خسروی', icon: 'ri-award-fill', grad: ['#0d2137', '#c9a84c'] },
            { id: 'tanhaie-mah', title: 'تنهایی ماه', director: 'پژهان ضیائیان', icon: 'ri-moon-clear-line', grad: ['#1a3a1a', '#2e86ab'] },
            { id: 'naje', title: 'ناجه', director: 'مصطفی شکوهی', icon: 'ri-heart-pulse-line', grad: ['#4a0e0e', '#833ab4'] },
            { id: 'night-nanny', title: 'The Night Nanny', director: 'امین نیک‌نژاد', icon: 'ri-ghost-2-line', grad: ['#1a1a2e', '#c0392b'] },
            { id: 'rangha', title: 'رنگ‌ها همه سیاه هستند', director: 'مهیار میرپادیاب', icon: 'ri-palette-line', grad: ['#0f2027', '#c9a84c'] },
            { id: 'shirje', title: 'شیرجه', director: 'محمد تنابنده', icon: 'ri-water-flash-line', grad: ['#0d2137', '#2e86ab'] }
        ]
    }
];

function getPollConfig(pollId) {
    return POLLS.find(p => p.id === pollId) || null;
}

/* ---------- لایه ذخیره‌سازی محلی (fallback) ---------- */
function readLocalVotes() {
    try { return JSON.parse(localStorage.getItem(POLL_LOCAL_VOTES_KEY)) || {}; }
    catch (e) { return {}; }
}
function writeLocalVotes(obj) {
    localStorage.setItem(POLL_LOCAL_VOTES_KEY, JSON.stringify(obj));
}
function readLocalCounts() {
    try { return JSON.parse(localStorage.getItem(POLL_LOCAL_COUNTS_KEY)) || {}; }
    catch (e) { return {}; }
}
function writeLocalCounts(obj) {
    localStorage.setItem(POLL_LOCAL_COUNTS_KEY, JSON.stringify(obj));
}

/* آیا کاربر (در همین مرورگر) قبلاً به این نظرسنجی رای داده است؟ */
function getMyVote(pollId) {
    return readLocalVotes()[pollId] || null;
}
function setMyVote(pollId, optionId) {
    const v = readLocalVotes();
    v[pollId] = optionId;
    writeLocalVotes(v);
}

/* ---------- دریافت نتایج فعلی (یک‌بار، بدون گوش‌دادن زنده) ---------- */
async function getPollResults(pollId) {
    if (pollFirestoreEnabled) {
        try {
            const doc = await pollDb.collection('polls').doc(pollId).get();
            return (doc.exists && doc.data().votes) ? doc.data().votes : {};
        } catch (e) {
            console.error('خطا در خواندن نظرسنجی از Firestore:', e);
            return {};
        }
    }
    const all = readLocalCounts();
    return all[pollId] || {};
}

/* گوش‌دادن زنده به تغییرات نتیجه (فقط وقتی فایربیس فعال است)
   callback(votes, errorOrNull) — اگر errorOrNull ست باشد یعنی خواندن با خطا مواجه شده
   (معمولاً یعنی Firestore Rules اجازه خواندن collection «polls» را نداده) */
function listenPollResults(pollId, callback) {
    if (pollFirestoreEnabled) {
        return pollDb.collection('polls').doc(pollId).onSnapshot(function (doc) {
            callback((doc.exists && doc.data().votes) ? doc.data().votes : {}, null);
        }, function (e) {
            console.error('خطا در دریافت نتیجه نظرسنجی (به احتمال زیاد Firestore Rules):', e);
            callback({}, e);
        });
    }
    // بدون فایربیس: فقط یک‌بار مقدار محلی را برمی‌گردانیم
    getPollResults(pollId).then(function (votes) { callback(votes, null); });
    return function unsubscribe() { };
}

/* ---------- ثبت رای ----------
   خروجی: { ok: true } یا { ok: false, reason: 'already_voted' | 'error', error?: any }
   (قبلاً هر نوع خطایی به اشتباه به‌عنوان «قبلاً رای داده‌اید» نمایش داده می‌شد) */
async function submitVote(pollId, optionId) {
    if (getMyVote(pollId)) return { ok: false, reason: 'already_voted' };

    if (pollFirestoreEnabled) {
        const ref = pollDb.collection('polls').doc(pollId);
        try {
            await pollDb.runTransaction(async function (tx) {
                const doc = await tx.get(ref);
                const data = doc.exists ? doc.data() : { votes: {}, totalVotes: 0 };
                const votes = data.votes || {};
                votes[optionId] = (votes[optionId] || 0) + 1;
                const totalVotes = (data.totalVotes || 0) + 1;
                tx.set(ref, { votes: votes, totalVotes: totalVotes, updatedAt: firebase.firestore.FieldValue.serverTimestamp() }, { merge: true });
            });
        } catch (e) {
            console.error('خطا در ثبت رای در Firestore:', e);
            return { ok: false, reason: 'error', error: e };
        }
    } else {
        const all = readLocalCounts();
        const votes = all[pollId] || {};
        votes[optionId] = (votes[optionId] || 0) + 1;
        all[pollId] = votes;
        writeLocalCounts(all);
    }

    setMyVote(pollId, optionId);
    return { ok: true };
}

/* ---------- رندر UI ---------- */
function pollOptionHTML(opt, selectedId) {
    const isSelected = selectedId === opt.id;
    return `
        <button type="button" class="poll-option${isSelected ? ' selected' : ''}" data-option-id="${opt.id}">
            <span class="po-icon" style="background:linear-gradient(135deg, ${opt.grad[0]}, ${opt.grad[1]});">
                <i class="${opt.icon}"></i>
            </span>
            <span class="po-body">
                <span class="po-title">${opt.title}</span>
                <span class="po-director">${opt.director}</span>
            </span>
            <span class="po-radio"></span>
        </button>
    `;
}

/* ردیف نتیجه به سبک نظرسنجی‌های تلگرام:
   عنوان + درصد در بالا، نوار پرشونده انیمیشنی پایین،
   تیک قرمز برای گزینه‌ای که خود کاربر انتخاب کرده، جایزه برای گزینه برنده */
function pollResultRowHTML(opt, count, total, isWinner, isMine) {
    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
    return `
        <div class="tg-poll-row${isWinner && total > 0 ? ' tg-winner' : ''}${isMine ? ' tg-mine' : ''}">
            <div class="tg-poll-top">
                <span class="tg-poll-title">
                    ${isMine ? '<span class="tg-check"><i class="ri-check-line"></i></span>' : ''}
                    ${opt.title}
                    ${isWinner && total > 0 ? '<i class="ri-award-fill tg-crown"></i>' : ''}
                </span>
                <span class="tg-poll-pct">${toFarsiNum(pct)}٪</span>
            </div>
            <div class="tg-poll-track">
                <div class="tg-poll-fill" data-pct="${pct}" style="width:0%"></div>
            </div>
            <div class="tg-poll-count">${toFarsiNum(count)} رای</div>
        </div>
    `;
}

function renderPollResults(config, votes, wrapEl, myVoteId) {
    const total = Object.values(votes).reduce((a, b) => a + b, 0);
    const maxCount = Math.max(0, ...config.options.map(o => votes[o.id] || 0));
    const rows = config.options
        .slice()
        .sort((a, b) => (votes[b.id] || 0) - (votes[a.id] || 0))
        .map(o => pollResultRowHTML(
            o, votes[o.id] || 0, total,
            total > 0 && (votes[o.id] || 0) === maxCount,
            o.id === myVoteId
        ))
        .join('');
    wrapEl.innerHTML = `
        <div class="tg-poll-results">${rows}</div>
        <div class="poll-total"><i class="ri-bar-chart-2-line"></i> مجموع آرا: ${toFarsiNum(total)}</div>
    `;
    // انیمیشن پرشدن نوارها (از صفر تا درصد واقعی)
    requestAnimationFrame(function () {
        wrapEl.querySelectorAll('.tg-poll-fill').forEach(function (bar) {
            requestAnimationFrame(function () {
                bar.style.width = bar.getAttribute('data-pct') + '%';
            });
        });
    });
}

function renderPollError(wrapEl) {
    wrapEl.innerHTML = `
        <div class="empty-state" style="padding:30px 10px;">
            <i class="ri-cloud-off-line"></i>
            امکان دریافت نتیجه نظرسنجی از دیتابیس وجود ندارد.<br>
            لطفاً Firestore Rules پروژه را بررسی کنید (دسترسی خواندن/نوشتن روی collection «polls»).
        </div>
    `;
}

function renderPollStatus(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (pollFirestoreEnabled) {
        el.innerHTML = '<i class="ri-cloud-line" style="color:#2ecc71;"></i> نتیجه نظرسنجی زنده و برای همه بازدیدکنندگان مشترک است.';
        el.style.color = '#1a6b3a';
    } else {
        el.innerHTML = '<i class="ri-error-warning-line" style="color:#e67e22;"></i> Firebase هنوز تنظیم نشده؛ رای‌ها فقط در همین مرورگر ذخیره می‌شوند.';
        el.style.color = '#a05a10';
    }
}

/* ساخت کامل یک کارت نظرسنجی داخل یک المان مشخص */
function mountPoll(pollId, containerEl) {
    const config = getPollConfig(pollId);
    if (!config || !containerEl) return;

    const myVote = getMyVote(pollId);

    containerEl.innerHTML = `
        <div class="poll-card">
            <div class="poll-q">${config.question}</div>
            <div class="poll-sub">${config.subtitle || ''}</div>
            <div class="poll-status" id="poll-status-${pollId}"></div>
            <div class="poll-body-${pollId}"></div>
        </div>
    `;
    renderPollStatus('poll-status-' + pollId);

    const bodyEl = containerEl.querySelector('.poll-body-' + pollId);

    function showVoteForm(selectedId) {
        bodyEl.innerHTML = `
            <div class="poll-options">${config.options.map(o => pollOptionHTML(o, selectedId)).join('')}</div>
            <div class="poll-actions">
                <button type="button" class="btn-primary" id="poll-submit-${pollId}"><i class="ri-checkbox-circle-line"></i> ثبت رای</button>
                <span class="poll-note">هر بازدیدکننده فقط یک بار می‌تواند رای دهد.</span>
            </div>
        `;
        let chosen = selectedId || null;
        const optionEls = bodyEl.querySelectorAll('.poll-option');
        optionEls.forEach(function (el) {
            el.addEventListener('click', function () {
                chosen = el.getAttribute('data-option-id');
                optionEls.forEach(function (o) { o.classList.toggle('selected', o === el); });
            });
        });
        const submitBtn = document.getElementById('poll-submit-' + pollId);
        submitBtn.addEventListener('click', async function () {
            if (!chosen) { alert('لطفاً یکی از گزینه‌ها را انتخاب کنید.'); return; }
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="ri-loader-4-line"></i> در حال ثبت...';
            const result = await submitVote(pollId, chosen);
            if (result.ok) {
                showResultsView();
            } else if (result.reason === 'already_voted') {
                alert('شما قبلاً در این نظرسنجی رای داده‌اید.');
                showResultsView();
            } else {
                // خطای واقعی (مثلاً دسترسی Firestore Rules) — این را با «قبلاً رای داده‌اید» اشتباه نمی‌گیریم
                submitBtn.disabled = false;
                submitBtn.innerHTML = '<i class="ri-checkbox-circle-line"></i> ثبت رای';
                alert('ثبت رای با خطا مواجه شد. لطفاً دوباره امتحان کنید.');
            }
        });
    }

    function showResultsView() {
        const votedId = getMyVote(pollId);
        bodyEl.innerHTML = `
            ${votedId ? '<div class="poll-note" style="margin-bottom:10px;"><i class="ri-checkbox-circle-fill" style="color:var(--red);"></i> رای شما ثبت شد. سپاس از مشارکت شما!</div>' : ''}
            <div class="poll-results-wrap-${pollId}"></div>
        `;
        const resultsWrap = bodyEl.querySelector('.poll-results-wrap-' + pollId);
        listenPollResults(pollId, function (votes, err) {
            if (err) {
                renderPollError(resultsWrap);
                return;
            }
            renderPollResults(config, votes, resultsWrap, votedId);
        });
    }

    if (myVote) {
        showResultsView();
    } else {
        showVoteForm(null);
    }
}
