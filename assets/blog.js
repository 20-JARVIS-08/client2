/* =========================================================
   موتور ساده وبلاگ مستر شورت‌فیلم
   همه پست‌ها در localStorage مرورگر ذخیره می‌شوند.
   برای افزودن پست جدید از صفحه blog-admin.html استفاده کنید.
   ========================================================= */
const BLOG_KEY = 'mrshortfilm_blog_posts';

const BLOG_GRADIENTS = [
    ['#1a1a2e', '#c0392b'],
    ['#0d2137', '#c9a84c'],
    ['#1a3a1a', '#2e86ab'],
    ['#4a0e0e', '#833ab4'],
    ['#0f2027', '#2c5364'],
    ['#2d1b69', '#11998e']
];

function seedPosts() {
    return [
        {
            id: 'seed-1',
            title: 'بهنام خسروی: «ماندالا» روایتی از هویت و فراموشی است',
            category: 'گفتگو',
            summary: 'گفتگوی اختصاصی با بهنام خسروی، کارگردان، رمان‌نویس و فیلمنامه‌نویس، درباره ساخت فیلم کوتاه «ماندالا» و مسیر آن تا جشنواره‌های بین‌المللی.',
            content: 'فیلم کوتاه «ماندالا» به کارگردانی بهنام خسروی در مدت کوتاهی توانست توجه چند جشنواره بین‌المللی را به خود جلب کند.\n\nدر این گفتگو خسروی از روند نگارش فیلمنامه، چالش‌های تولید یک اثر مستقل و تجربه حضور در جشنواره‌های خارجی می‌گوید. او همچنین به رابطه میان رمان‌نویسی و فیلمسازی کوتاه در کارنامه خودش اشاره می‌کند و توضیح می‌دهد که چگونه تجربه نوشتن رمان «سرزمین غریبه» بر نگاه سینمایی او تاثیر گذاشته است.\n\nبرای اطلاعات بیشتر درباره این فیلم می‌توانید به گزارش سایت خانه سینما مراجعه کنید.',
            date: '1404-04-09',
            color: 0,
            icon: 'ri-mic-line',
            sourceLabel: 'خانه سینما',
            sourceUrl: 'http://www.cinemahouse.ir/1405/04/09/%D9%81%DB%8C%D9%84%D9%85-%DA%A9%D9%88%D8%AA%D8%A7%D9%87-%D9%85%D8%A7%D9%86%D8%AF%D8%A7%D9%84%D8%A7-%D8%AF%D8%B1-%D9%85%D8%B3%DB%8C%D8%B1-%D8%A7%D8%B3%DA%A9%D8%A7%D8%B1-%DA%A9%D8%A7%D9%86/',
            seed: true
        },
        {
            id: 'seed-2',
            title: 'نقد «یک تصادف ساده»؛ فیلمی که نخل طلای کن را برد',
            category: 'نقد و بررسی',
            summary: 'نگاهی تحلیلی به فیلم جعفر پناهی و دلایلی که این اثر را به نخل طلای جشنواره کن ۲۰۲۵ رساند.',
            content: 'جعفر پناهی با «یک تصادف ساده» موفق شد اولین نخل طلای تاریخ سینمای ایران را کسب کند.\n\nاین فیلم با روایتی ساده اما تاثیرگذار، مخاطب را با پرسش‌های اخلاقی پیچیده‌ای روبه‌رو می‌کند. در این یادداشت به ساختار روایی، بازی بازیگران و نگاه اجتماعی فیلم پرداخته‌ایم.',
            date: '1404-03-20',
            color: 1,
            icon: 'ri-quill-pen-line',
            seed: true
        },
        {
            id: 'seed-3',
            title: 'مروری بر بهترین فیلم‌های کوتاه ایرانی سال ۱۴۰۴',
            category: 'فیلم کوتاه',
            summary: 'جمع‌بندی سالانه ما از درخشان‌ترین فیلم‌های کوتاه ایرانی که در جشنواره‌های داخلی و خارجی مورد توجه قرار گرفتند.',
            content: 'سال ۱۴۰۴ برای فیلم کوتاه ایران سال پرباری بود. از «ماندالا» ساخته بهنام خسروی تا آثار راه‌یافته به جشنواره فجر مانند «آدمک» و «سرخ‌رگ»، سینمای کوتاه ایران بار دیگر نشان داد که در سطح بین‌المللی حرفی برای گفتن دارد.\n\nدر این مطلب فهرستی از ده فیلم کوتاه برگزیده سال را همراه با معرفی کوتاه هر اثر می‌خوانید.',
            date: '1404-02-01',
            color: 2,
            icon: 'ri-film-line',
            seed: true
        }
    ];
}

function ensureSeeded() {
    if (!localStorage.getItem(BLOG_KEY)) {
        localStorage.setItem(BLOG_KEY, JSON.stringify(seedPosts()));
    }
}

function getPosts() {
    ensureSeeded();
    try {
        return JSON.parse(localStorage.getItem(BLOG_KEY)) || [];
    } catch (e) {
        return seedPosts();
    }
}

function savePosts(posts) {
    localStorage.setItem(BLOG_KEY, JSON.stringify(posts));
}

function addPost(post) {
    const posts = getPosts();
    post.id = 'post-' + Date.now();
    posts.unshift(post);
    savePosts(posts);
    return post.id;
}

function deletePost(id) {
    const posts = getPosts().filter(p => p.id !== id);
    savePosts(posts);
}

function getPostById(id) {
    return getPosts().find(p => p.id === id);
}

function farsiDateLabel(dateStr) {
    /* Accepts already-Jalali "1404-04-09" style strings and returns a readable label */
    if (!dateStr) return '';
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        const y = parts[0], m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
        const fa = n => String(n).replace(/\d/g, x => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][x]);
        return fa(d) + ' ' + (months[m - 1] || '') + ' ' + fa(y);
    }
    return dateStr;
}

function thumbGradient(post) {
    const g = BLOG_GRADIENTS[post.color % BLOG_GRADIENTS.length];
    return `background:linear-gradient(135deg,${g[0]},${g[1]});`;
}

function blogCardHTML(post) {
    return `
    <a class="blog-card" href="blog-post.html?id=${encodeURIComponent(post.id)}">
        ${!post.seed ? `<button class="bc-delete" title="حذف مطلب" onclick="event.preventDefault();event.stopPropagation();handleDeleteClick('${post.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
        <div class="nc-thumb">
            <div class="img-ph" style="${thumbGradient(post)}"><i class="${post.icon || 'ri-file-text-line'}" style="font-size:30px;color:rgba(255,255,255,.5);"></i></div>
        </div>
        <div class="bc-body">
            <div class="nc-cat">${post.category || 'وبلاگ'}</div>
            <div class="bc-title">${post.title}</div>
            <div class="bc-summary">${post.summary || ''}</div>
            <div class="bc-meta"><span><i class="ri-calendar-line"></i> ${farsiDateLabel(post.date)}</span><span>مطالعه ادامه مطلب ›</span></div>
        </div>
    </a>`;
}

function handleDeleteClick(id) {
    if (confirm('آیا از حذف این مطلب مطمئن هستید؟')) {
        deletePost(id);
        renderBlogGrid();
    }
}

function renderBlogGrid() {
    const el = document.getElementById('blog-grid');
    if (!el) return;
    const posts = getPosts();
    if (!posts.length) {
        el.innerHTML = '';
        document.getElementById('blog-empty').style.display = 'block';
        return;
    }
    document.getElementById('blog-empty').style.display = 'none';
    el.innerHTML = posts.map(blogCardHTML).join('');
}

function renderSinglePost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const post = id ? getPostById(id) : null;
    const wrap = document.getElementById('post-wrap');
    if (!post) {
        wrap.innerHTML = `<div class="empty-state"><i class="ri-file-warning-line"></i>این مطلب یافت نشد یا حذف شده است.<br><br><a href="blog.html" class="btn-primary" style="display:inline-flex;text-decoration:none;">بازگشت به وبلاگ</a></div>`;
        return;
    }
    document.title = post.title + ' | وبلاگ مستر شورت‌فیلم';
    const g = BLOG_GRADIENTS[post.color % BLOG_GRADIENTS.length];
    const paragraphs = (post.content || '').split(/\n+/).filter(Boolean).map(p => `<p>${p}</p>`).join('');
    const sourceHTML = post.sourceUrl ? `<p style="margin-top:24px;padding-top:16px;border-top:1px solid var(--gray-100);font-size:13px;">منبع خبر: <a href="${post.sourceUrl}" target="_blank" rel="noopener" style="color:var(--red);font-weight:700;">${post.sourceLabel || post.sourceUrl}</a></p>` : '';
    wrap.innerHTML = `
        <div class="breadcrumb" style="margin-top:0;margin-bottom:16px;"><a href="index.html">خانه</a> / <a href="blog.html">وبلاگ</a> / ${post.category || ''}</div>
        <div class="post-hero"><div class="img-ph" style="background:linear-gradient(135deg,${g[0]},${g[1]});"><i class="${post.icon || 'ri-file-text-line'}" style="font-size:64px;color:rgba(255,255,255,.35);"></i></div></div>
        <div class="post-header">
            <span class="feat-cat" style="position:static;display:inline-block;margin-bottom:10px;">${post.category || 'وبلاگ'}</span>
            <h1>${post.title}</h1>
            <div class="post-meta-row">
                <span><i class="ri-calendar-line"></i> ${farsiDateLabel(post.date)}</span>
                <span><i class="ri-user-line"></i> تیم مستر شورت‌فیلم</span>
            </div>
        </div>
        <div class="post-body">${paragraphs}${sourceHTML}</div>
    `;
}
