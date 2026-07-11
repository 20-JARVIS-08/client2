/* =========================================================
   موتور وبلاگ مستر شورت‌فیلم
   -----------------------------------------------------------
   این نسخه مطالب را در Firebase Firestore ذخیره می‌کند تا برای
   همه بازدیدکننده‌های سایت (حتی روی GitHub Pages که فقط هاست
   استاتیک است) مشترک و همیشگی باشد.

   راه‌اندازی: فایل assets/firebase-config.js را با اطلاعات
   پروژه رایگان Firebase خودتان پر کنید (راهنما در همان فایل).

   اگر فایربیس هنوز تنظیم نشده باشد، به‌صورت خودکار روی حالت
   localStorage (فقط همین مرورگر) سوییچ می‌کند تا در حین تست
   هم کار کند.
   ========================================================= */

const BLOG_LOCAL_KEY = 'mrshortfilm_blog_posts_local';

const BLOG_GRADIENTS = [
    ['#1a1a2e', '#c0392b'],
    ['#0d2137', '#c9a84c'],
    ['#1a3a1a', '#2e86ab'],
    ['#4a0e0e', '#833ab4'],
    ['#0f2027', '#2c5364'],
    ['#2d1b69', '#11998e']
];

/* ---------- تشخیص وضعیت اتصال Firebase ---------- */
let db = null;
let firestoreEnabled = false;
try {
    if (typeof firebaseConfig !== 'undefined' &&
        firebaseConfig.apiKey &&
        firebaseConfig.apiKey.indexOf('YOUR_') !== 0 &&
        typeof firebase !== 'undefined') {
        if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        firestoreEnabled = true;
    }
} catch (e) {
    console.warn('Firebase غیرفعال است، حالت محلی (localStorage) استفاده می‌شود.', e);
    firestoreEnabled = false;
}

function isBlogBackendConnected() {
    return firestoreEnabled;
}

/* =========================================================
   ✍️ راهنمای افزودن سریع مطلب از طریق کد (ساده‌ترین روش)
   -----------------------------------------------------------
   برای افزودن یک مطلب جدید، لازم نیست وارد ساختار پیچیده
   seedPosts() بشوید. کافی است یک آبجکت به آرایه NEW_POSTS
   (کمی پایین‌تر) اضافه کنید. فقط سه فیلد title و category و
   content الزامی هستند؛ بقیه اختیاری‌اند و خودکار پر می‌شوند:

     - id          : خودکار ساخته می‌شود (نیازی به وارد کردن نیست)
     - image       : اختیاری. آدرس یک عکس (لینک اینترنتی مثل
                     https://... یا مسیر محلی مثل 'Images/x.jpg')
                     اگر ننویسید، همان پس‌زمینه رنگی + آیکون قبلی
                     نمایش داده می‌شود.
     - date        : اختیاری، به شمسی و به فرم 'YYYY-MM-DD'
                     (مثلا '1405-05-10'). اگر ننویسید، تاریخ
                     امروز به‌صورت خودکار گذاشته می‌شود.
     - summary     : اختیاری. یک یا دو جمله کوتاه برای کارت مطلب.
                     اگر ننویسید، خودش از ابتدای content ساخته می‌شود.
     - icon        : اختیاری. نام آیکون Remix Icon (مثلا 'ri-award-line').
                     اگر ننویسید، بر اساس دسته‌بندی خودکار انتخاب می‌شود.
     - color       : اختیاری. عددی بین 0 تا 5 برای رنگ کارت.
                     اگر ننویسید، خودکار و به‌ترتیب انتخاب می‌شود.
     - sourceLabel / sourceUrl : اختیاری، برای نمایش «منبع خبر».

   نکته درباره متن (content):
   برای پاراگراف جدید، یک خط خالی (\n\n) بین دو جمله بگذارید.

   نمونه کامل:
   {
       title: 'عنوان مطلب اینجا',
       category: 'جشنواره‌ها',
       content: 'پاراگراف اول.\n\nپاراگراف دوم.',
       image: 'https://example.com/photo.jpg'
   },

   دسته‌بندی‌های موجود: فیلم کوتاه، سینمای ایران، سینمای جهان،
   جشنواره‌ها، مستند، نقد و بررسی، گفتگو
   ========================================================= */

const NEW_POSTS = [
    // 👇 مطالب جدید را از همینجا، به همین شکل، اضافه کنید:
    // {
    //     title: 'عنوان مطلب',
    //     category: 'جشنواره‌ها',
    //     content: 'متن مطلب اینجا...',
    //     image: 'Images/example.jpg'
    // },
];

/* آیکون پیش‌فرض برای هر دسته‌بندی — اگر در NEW_POSTS آیکون ننویسید از همین استفاده می‌شود */
const CATEGORY_ICONS = {
    'فیلم کوتاه': 'ri-film-line',
    'سینمای ایران': 'ri-flag-line',
    'سینمای جهان': 'ri-earth-line',
    'جشنواره‌ها': 'ri-award-line',
    'مستند': 'ri-vidicon-line',
    'نقد و بررسی': 'ri-quill-pen-line',
    'گفتگو': 'ri-mic-line'
};

/* تبدیل مطالب ساده NEW_POSTS به ساختار کامل مورد نیاز سایت */
function normalizeNewPosts() {
    return NEW_POSTS.map((p, i) => {
        let date = p.date;
        if (!date) {
            try {
                const jd = toJalali(new Date().getFullYear(), new Date().getMonth() + 1, new Date().getDate());
                date = jd[0] + '-' + String(jd[1]).padStart(2, '0') + '-' + String(jd[2]).padStart(2, '0');
            } catch (e) {
                date = '';
            }
        }
        return Object.assign({
            id: 'code-' + i,
            summary: (p.content || '').split(/\n+/)[0].slice(0, 140),
            icon: CATEGORY_ICONS[p.category] || 'ri-file-text-line',
            color: i % BLOG_GRADIENTS.length,
            date: date,
            seed: true
        }, p);
    });
}

/* ---------- مطالب پیش‌فرض (همیشه نمایش داده می‌شوند) ---------- */
function seedPosts() {
    return normalizeNewPosts().concat([
        {
            id: 'seed-4',
            title: 'ماندالا بار دیگر درخشید؛ دومین جایزه بین‌المللی برای فیلم کوتاه بهنام خسروی',
            category: 'جشنواره‌ها',
            summary: 'فیلم کوتاه «ماندالا» به کارگردانی بهنام خسروی جایزه Golden Standard Award را از چهارمین دوره جشنواره Stay Gold Film Festival دریافت کرد.',
            content: 'فیلم کوتاه «ماندالا» به نویسندگی و کارگردانی بهنام خسروی در چهارمین حضور بین‌المللی خود، موفق به کسب جایزه Golden Standard Award از چهارمین دوره Stay Gold Film Festival شد.\n\nنمایش این فیلم در بخش رسمی جشنواره، روز ۲۸ ژوئن ۲۰۲۶ برگزار شد و نتایج نهایی و برندگان جشنواره در تاریخ ۴ جولای ۲۰۲۶ اعلام شدند. هیئت داوران این جشنواره، فیلم «ماندالا» را به دلیل روایت تأثیرگذار، کیفیت هنری، خلاقیت و استانداردهای بالای فیلمسازی مستقل، شایسته دریافت این جایزه دانستند.\n\nجشنواره Stay Gold Film Festival در پیام رسمی خود ضمن تبریک به بهنام خسروی اعلام کرد که فیلم «ماندالا» با داستان‌پردازی برجسته، کیفیت هنری و نگاه خلاقانه خود، داوران را تحت تأثیر قرار داده و به عنوان یکی از آثار شاخص این دوره موفق به دریافت جایزه Golden Standard Award شده است.',
            date: '1405-04-16',
            color: 1,
            icon: 'ri-trophy-fill',
            image: 'Images/award-staygold.jpg',
            sourceLabel: 'اینستاگرام sevenskies.distribution',
            sourceUrl: 'https://www.instagram.com/sevenskies.distribution/p/Dae9QwWI53J/',
            seed: true
        },
        {
            id: 'seed-5',
            title: '«ماندالا» بهنام خسروی برنده جایزه بهترین فیلم جشنواره بین‌المللی Accolade شد',
            category: 'جشنواره‌ها',
            summary: 'فیلم کوتاه «ماندالا» به کارگردانی بهنام خسروی موفق به کسب جایزه بهترین فیلم از جشنواره بین‌المللی Accolade شد.',
            content: 'فیلم کوتاه «ماندالا» به نویسندگی و کارگردانی بهنام خسروی موفق شد جایزه بهترین فیلم را از جشنواره بین‌المللی Accolade دریافت کند.\n\nجشنواره Accolade که هر ساله آثار مستقل از سراسر جهان را داوری می‌کند، «ماندالا» را به دلیل کیفیت روایت، ساختار بصری و اجرای حرفه‌ای در میان آثار برگزیده خود قرار داد.\n\nاین جایزه یکی از نخستین افتخارات بین‌المللی «ماندالا» بود و مسیر حضور این فیلم کوتاه در جشنواره‌های بعدی از جمله TINFF کانادا و پونه هند را هموار کرد.',
            date: '1404-04-01',
            color: 1,
            icon: 'ri-trophy-fill',
            image: 'Images/award-staygold-2.jpg',
            seed: true
        },
        {
            id: 'seed-6',
            title: '«ماندالا» نامزد بهترین کارگردانی در دهمین جشنواره بین‌المللی فیلم TINFF کانادا شد',
            category: 'جشنواره‌ها',
            summary: 'فیلم کوتاه «ماندالا» به کارگردانی بهنام خسروی در بخش رقابتی دهمین جشنواره بین‌المللی فیلم TINFF کانادا، نامزد جایزه بهترین کارگردانی شد.',
            content: 'فیلم کوتاه «ماندالا» ساخته بهنام خسروی در دهمین دوره جشنواره بین‌المللی فیلم TINFF کانادا حضور یافت و در بخش رقابتی این رویداد، نامزد دریافت جایزه بهترین کارگردانی شد.\n\nجشنواره TINFF کانادا یکی از رویدادهای شناخته‌شده در معرفی فیلم‌سازان مستقل بین‌المللی است و حضور «ماندالا» در جمع نامزدهای بخش کارگردانی، یکی دیگر از دستاوردهای این فیلم کوتاه ایرانی در مسیر جشنواره‌ای آن به شمار می‌رود.\n\nاین نامزدی، دومین دستاورد بین‌المللی «ماندالا» پس از جایزه Accolade بود و بار دیگر نشان داد فیلم‌های کوتاه ایرانی می‌توانند در رقابت‌های معتبر بین‌المللی حرفی برای گفتن داشته باشند.',
            date: '1404-05-01',
            color: 5,
            icon: 'ri-award-fill',
            image: 'Images/mandala.jpg',
            seed: true
        },
        {
            id: 'seed-7',
            title: 'فیلم کوتاه «ماندالا» در جشنواره بین‌المللی فیلم پونه هندوستان حضور یافت',
            category: 'جشنواره‌ها',
            summary: 'فیلم کوتاه «ماندالا» به کارگردانی بهنام خسروی به بخش رسمی جشنواره بین‌المللی فیلم پونه هند راه یافت.',
            content: 'فیلم کوتاه «ماندالا» به کارگردانی بهنام خسروی به عنوان یکی از آثار حاضر در جشنواره بین‌المللی فیلم پونه هندوستان معرفی شد.\n\nاین حضور، ادامه مسیر موفق «ماندالا» در جشنواره‌های بین‌المللی پس از حضور در Accolade و TINFF کانادا بود و بار دیگر نشان داد که این فیلم کوتاه ایرانی توانسته توجه داوران و مخاطبان بین‌المللی را جلب کند.\n\nحضور در پونه هند، سومین ایستگاه بین‌المللی «ماندالا» به شمار می‌رفت و بر تداوم استقبال جشنواره‌های آسیایی از این اثر تاکید داشت.',
            date: '1404-06-15',
            color: 3,
            icon: 'ri-earth-fill',
            image: 'Images/award-accolade-2.jpg',
            seed: true
        },
        {
            id: 'seed-8',
            title: 'درباره «ماندالا»؛ روایتی از هویت و فراموشی',
            category: 'نقد و بررسی',
            summary: 'نگاهی به موضوع و مضمون اصلی فیلم کوتاه «ماندالا» ساخته بهنام خسروی؛ اثری که هویت، فراموشی و رابطه انسان با گذشته خود را روایت می‌کند.',
            content: 'فیلم کوتاه «ماندالا» به نویسندگی و کارگردانی بهنام خسروی، روایتی است درباره هویت و فراموشی و اینکه انسان چگونه با بخش‌هایی از گذشته خود روبه‌رو می‌شود که ترجیح می‌دهد آن‌ها را به یاد نیاورد.\n\nخسروی که پیش‌تر تجربه رمان‌نویسی نیز داشته، در «ماندالا» از همان نگاه لایه‌لایه و نمادین در ساختار داستانی بهره برده است؛ نامی که خود به شکلی نمادین به مفهوم چرخه و کمال در فرهنگ‌های مختلف اشاره دارد.\n\nهمین رویکرد روایی و بصری بود که باعث شد فیلم در جشنواره‌های متعدد بین‌المللی مورد توجه قرار گیرد.\n\nبدون آنکه داستان فیلم لو برود، می‌توان گفت «ماندالا» مخاطب را به سفری درونی دعوت می‌کند که در آن مرز میان خاطره و واقعیت به آرامی محو می‌شود.',
            date: '1404-01-15',
            color: 2,
            icon: 'ri-quill-pen-line',
            image: 'Images/P8.jpg',
            seed: true
        },
        {
            id: 'seed-9',
            title: 'بهنام خسروی، کارگردان «ماندالا»؛ نگاهی به مسیر فیلمسازی او',
            category: 'گفتگو',
            summary: 'معرفی بهنام خسروی، کارگردان فیلم کوتاه «ماندالا» و مسیر حرفه‌ای او در فیلمسازی مستقل.',
            content: 'بهنام خسروی، کارگردان، رمان‌نویس و فیلمنامه‌نویس ایرانی، سازنده فیلم کوتاه «ماندالا» است؛ اثری که در مدت کوتاهی توانست در چند جشنواره بین‌المللی از جمله Accolade، TINFF کانادا، جشنواره پونه هند و Stay Gold Film Festival حضور یابد و جوایزی کسب کند.\n\nخسروی در کارنامه خود همزمان تجربه نویسندگی رمان و فیلمنامه را دارد و همین پیشینه، در ساختار روایی و لایه‌های نمادین آثارش از جمله «ماندالا» قابل مشاهده است.\n\nاو همچنان به فعالیت در حوزه فیلم کوتاه و نویسندگی ادامه می‌دهد و «ماندالا» را نقطه عطفی مهم در مسیر حرفه‌ای خود می‌داند.',
            date: '1404-01-05',
            color: 0,
            icon: 'ri-user-star-fill',
            image: 'Images/P10.jpg',
            seed: true
        },
        {
            id: 'seed-10',
            title: 'بهنام خسروی، نویسنده «ماندالا»؛ از رمان‌نویسی تا فیلمنامه‌نویسی',
            category: 'گفتگو',
            summary: 'نگاهی به بهنام خسروی در مقام نویسنده فیلم‌نامه «ماندالا» و پیوند آثار داستانی او با این فیلم کوتاه.',
            content: 'بهنام خسروی، نویسنده فیلم‌نامه «ماندالا»، پیش از ورود جدی‌تر به فیلمسازی کوتاه، تجربه نویسندگی رمان را نیز در کارنامه خود دارد؛ از جمله رمان «غریبستان» که نگاه داستانی او را شکل داده است.\n\nاو در فیلم‌نامه «ماندالا» از همان حس و نگاه روایی حاضر در آثار داستانی‌اش بهره گرفته و توانسته با ساختاری فشرده و نمادین، مضمون هویت و فراموشی را در قالب یک فیلم کوتاه روایت کند.\n\nبه گفته خسروی، نگارش فیلم‌نامه «ماندالا» فرآیندی تدریجی بود که طی آن ایده اولیه داستان بارها بازنویسی شد تا به فرم فشرده و نمادین نهایی خود برسد.',
            date: '1404-01-10',
            color: 4,
            icon: 'ri-book-open-fill',
            image: 'Images/personal_picture2.jpg',
            sourceLabel: 'behnamkhosravi.com',
            sourceUrl: 'https://behnamkhosravi.com/index-fa.html',
            seed: true
        },
        {
            id: 'seed-11',
            title: 'آغاز فیلم‌برداری «ماندالا»؛ نخستین گام فیلم کوتاه بهنام خسروی',
            category: 'فیلم کوتاه',
            summary: 'فیلم‌برداری فیلم کوتاه «ماندالا» به نویسندگی و کارگردانی بهنام خسروی آغاز شد.',
            content: 'فیلم‌برداری فیلم کوتاه «ماندالا» به نویسندگی و کارگردانی بهنام خسروی آغاز شد؛ اثری که بعدها مسیر پرافتخاری را در جشنواره‌های بین‌المللی طی کرد.\n\nپروژه با یک تیم کوچک و مستقل کلید خورد؛ رویکردی که بعدها در کیفیت روایت و اجرای فیلم در جشنواره‌های بین‌المللی نیز بازتاب یافت.',
            date: '1403-08-15',
            color: 2,
            icon: 'ri-camera-lens-fill',
            image: 'Images/P2.jpg',
            seed: true
        },
        {
            id: 'seed-12',
            title: 'پایان فیلم‌برداری «ماندالا»؛ فیلم کوتاه بهنام خسروی وارد مرحله پس‌تولید شد',
            category: 'فیلم کوتاه',
            summary: 'فیلم‌برداری فیلم کوتاه «ماندالا» به پایان رسید و پروژه وارد مرحله تدوین و پس‌تولید شد.',
            content: 'فیلم‌برداری فیلم کوتاه «ماندالا» به نویسندگی و کارگردانی بهنام خسروی به پایان رسید و کار تدوین و پس‌تولید این اثر آغاز شد.\n\nبا پایان فیلم‌برداری، تیم سازنده وارد مرحله تدوین و آماده‌سازی نسخه نهایی فیلم برای ارسال به جشنواره‌های بین‌المللی شد؛ مسیری که در نهایت «ماندالا» را به جوایز متعدد رساند.',
            date: '1403-11-10',
            color: 5,
            icon: 'ri-scissors-cut-fill',
            image: 'Images/P6.jpg',
            seed: true
        },
        {
            id: 'seed-1',
            title: 'بهنام خسروی: «ماندالا» روایتی از هویت و فراموشی است',
            category: 'گفتگو',
            summary: 'گفتگوی اختصاصی با بهنام خسروی، کارگردان، رمان‌نویس و فیلمنامه‌نویس، درباره ساخت فیلم کوتاه «ماندالا» و مسیر آن تا جشنواره‌های بین‌المللی.',
            content: 'فیلم کوتاه «ماندالا» به کارگردانی بهنام خسروی در مدت کوتاهی توانست توجه چند جشنواره بین‌المللی را به خود جلب کند.\n\nدر این گفتگو خسروی از روند نگارش فیلمنامه، چالش‌های تولید یک اثر مستقل و تجربه حضور در جشنواره‌های خارجی می‌گوید. او همچنین به رابطه میان رمان‌نویسی و فیلمسازی کوتاه در کارنامه خودش اشاره می‌کند و توضیح می‌دهد که چگونه تجربه نوشتن رمان «سرزمین غریبه» بر نگاه سینمایی او تاثیر گذاشته است.\n\nبرای اطلاعات بیشتر درباره این فیلم می‌توانید به گزارش سایت خانه سینما مراجعه کنید.',
            date: '1404-04-09',
            color: 0,
            icon: 'ri-mic-line',
            image: 'Images/mb.png',
            sourceLabel: 'خانه سینما',
            sourceUrl: 'http://www.cinemahouse.ir/1405/04/09/%D9%81%DB%8C%D9%84%D9%85-%DA%A9%D9%88%D8%AA%D8%A7%D9%87-%D9%85%D8%A7%D9%86%D8%AF%D8%A7%D9%84%D8%A7-%D8%AF%D8%B1-%D9%85%D8%B3%DB%8C%D8%B1-%D8%A7%D8%B3%DA%A9%D8%A7%D8%B1-%DA%A9%D8%A7%D9%86/',
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
            image: 'Images/shortFilm.jpeg',
            seed: true
        }
    ]);
}

/* ---------- لایه ذخیره‌سازی ---------- */

function readLocal() {
    try {
        return JSON.parse(localStorage.getItem(BLOG_LOCAL_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function writeLocal(posts) {
    localStorage.setItem(BLOG_LOCAL_KEY, JSON.stringify(posts));
}

/* دریافت همه پست‌ها (پیش‌فرض + کاربرساخته)، جدیدترین‌ها اول */
async function getPosts() {
    const seeds = seedPosts();
    if (firestoreEnabled) {
        try {
            const snap = await db.collection('posts').orderBy('createdAt', 'desc').get();
            const remote = snap.docs.map(d => ({ id: d.id, ...d.data() }));
            return remote.concat(seeds);
        } catch (e) {
            console.error('خطا در خواندن از Firestore:', e);
            return seeds;
        }
    }
    return readLocal().concat(seeds);
}

async function getPostById(id) {
    if (!id) return null;
    if (id.indexOf('seed-') === 0 || id.indexOf('code-') === 0) {
        return seedPosts().find(p => p.id === id) || null;
    }
    if (firestoreEnabled) {
        try {
            const doc = await db.collection('posts').doc(id).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (e) {
            console.error(e);
            return null;
        }
    }
    return readLocal().find(p => p.id === id) || null;
}

/* افزودن پست جدید؛ id تولیدشده را برمی‌گرداند */
async function addPost(post) {
    if (firestoreEnabled) {
        const ref = await db.collection('posts').add(Object.assign({}, post, {
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        }));
        return ref.id;
    }
    const posts = readLocal();
    post.id = 'local-' + Date.now();
    posts.unshift(post);
    writeLocal(posts);
    return post.id;
}

async function deletePost(id) {
    if (id.indexOf('seed-') === 0 || id.indexOf('code-') === 0) return; // مطالب ثابت کد قابل حذف از سایت نیستند
    if (firestoreEnabled) {
        await db.collection('posts').doc(id).delete();
        return;
    }
    writeLocal(readLocal().filter(p => p.id !== id));
}

/* ---------- کمکی‌های نمایش ---------- */

function farsiDateLabel(dateStr) {
    if (!dateStr) return '';
    const months = ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'];
    const parts = String(dateStr).split('-');
    if (parts.length === 3) {
        const y = parts[0], m = parseInt(parts[1], 10), d = parseInt(parts[2], 10);
        const fa = n => String(n).replace(/\d/g, x => ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'][x]);
        return fa(d) + ' ' + (months[m - 1] || '') + ' ' + fa(y);
    }
    return dateStr;
}

function thumbGradient(post) {
    const g = BLOG_GRADIENTS[(post.color || 0) % BLOG_GRADIENTS.length];
    return `background:linear-gradient(135deg,${g[0]},${g[1]});`;
}

/* اگر مطلب عکس داشته باشد همان را نمایش می‌دهد، وگرنه پس‌زمینه گرادیانی + آیکون قبلی */
function thumbHTML(post, iconSize) {
    if (post.image) {
        return `<img src="${post.image}" alt="${(post.title || '').replace(/"/g, '&quot;')}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=&quot;img-ph&quot; style=&quot;${thumbGradient(post)}&quot;><i class=&quot;${post.icon || 'ri-file-text-line'}&quot; style=&quot;font-size:${iconSize}px;color:rgba(255,255,255,.5);&quot;></i></div>';">`;
    }
    return `<div class="img-ph" style="${thumbGradient(post)}"><i class="${post.icon || 'ri-file-text-line'}" style="font-size:${iconSize}px;color:rgba(255,255,255,.5);"></i></div>`;
}

function blogCardHTML(post) {
    return `
    <a class="blog-card" href="blog-post.html?id=${encodeURIComponent(post.id)}">
        ${!post.seed ? `<button class="bc-delete" title="حذف مطلب" onclick="event.preventDefault();event.stopPropagation();handleDeleteClick('${post.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
        <div class="nc-thumb">
            ${thumbHTML(post, 30)}
        </div>
        <div class="bc-body">
            <div class="nc-cat">${post.category || 'وبلاگ'}</div>
            <div class="bc-title">${post.title}</div>
            <div class="bc-summary">${post.summary || ''}</div>
            <div class="bc-meta"><span><i class="ri-calendar-line"></i> ${farsiDateLabel(post.date)}</span><span>مطالعه ادامه مطلب ›</span></div>
        </div>
    </a>`;
}

async function handleDeleteClick(id) {
    if (!confirm('آیا از حذف این مطلب مطمئن هستید؟')) return;
    await deletePost(id);
    await renderBlogGrid();
}

async function renderBlogGrid() {
    const el = document.getElementById('blog-grid');
    if (!el) return;
    el.innerHTML = '<div class="empty-state" style="grid-column:1/-1;"><i class="ri-loader-4-line"></i>در حال بارگذاری مطالب...</div>';
    const posts = await getPosts();
    const emptyEl = document.getElementById('blog-empty');
    if (!posts.length) {
        el.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
        return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    el.innerHTML = posts.map(blogCardHTML).join('');
}

async function renderSinglePost() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const wrap = document.getElementById('post-wrap');
    wrap.innerHTML = '<div class="empty-state"><i class="ri-loader-4-line"></i>در حال بارگذاری مطلب...</div>';
    const post = id ? await getPostById(id) : null;
    if (!post) {
        wrap.innerHTML = `<div class="empty-state"><i class="ri-file-warning-line"></i>این مطلب یافت نشد یا حذف شده است.<br><br><a href="blog.html" class="btn-primary" style="display:inline-flex;text-decoration:none;">بازگشت به وبلاگ</a></div>`;
        return;
    }
    document.title = post.title + ' | وبلاگ مستر شورت‌فیلم';
    const paragraphs = (post.content || '').split(/\n+/).filter(Boolean).map(p => `<p>${p}</p>`).join('');
    const sourceHTML = post.sourceUrl ? `<p style="margin-top:24px;padding-top:16px;border-top:1px solid var(--gray-100);font-size:13px;">منبع خبر: <a href="${post.sourceUrl}" target="_blank" rel="noopener" style="color:var(--red);font-weight:700;">${post.sourceLabel || post.sourceUrl}</a></p>` : '';
    wrap.innerHTML = `
        <div class="breadcrumb" style="margin-top:0;margin-bottom:16px;"><a href="index.html">خانه</a> / <a href="blog.html">وبلاگ</a> / ${post.category || ''}</div>
        <div class="post-hero">${thumbHTML(post, 64)}</div>
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

/* نشان‌دهنده وضعیت اتصال، برای صفحه افزودن مطلب */
function renderBackendStatus(elId) {
    const el = document.getElementById(elId);
    if (!el) return;
    if (firestoreEnabled) {
        el.innerHTML = '<i class="ri-cloud-line" style="color:#2ecc71;"></i> اتصال به Firebase برقرار است — مطالب برای همه بازدیدکنندگان سایت نمایش داده می‌شود.';
        el.style.color = '#1a6b3a';
    } else {
        el.innerHTML = '<i class="ri-error-warning-line" style="color:#e67e22;"></i> Firebase هنوز تنظیم نشده؛ مطالب فقط در همین مرورگر ذخیره می‌شوند و برای بقیه بازدیدکننده‌ها نمایش داده نمی‌شوند. فایل assets/firebase-config.js را تکمیل کنید.';
        el.style.color = '#a05a10';
    }
}
