
// ─── TRANSLATIONS ───────────────────────────────────────────────────────────
const i18n = {
  uk: {
    htmlLang: 'uk',
    pageTitle: 'Юлія Макарицька — Сенсорна інтеграція · Харків',
    navLogo: 'Ю. Макарицька',
    navAbout: 'Про мене',
    navMethods: 'Методики',
    navApproach: 'Підхід',
    navWho: 'Для кого',
    navCta: 'Записатись',

    heroEyebrow: 'Сенсорна інтеграція · Харків',
    heroTitle: 'Спеціаліст із сенсорної інтеграції',
    heroDesc: 'Допомагаю дітям і дорослим гармонізувати роботу нервової системи через науково доведені методи. Індивідуальний підхід, сучасне обладнання, вимірювані результати.',
    heroBtnPrimary: 'Записатись на консультацію',
    heroBtnSecondary: 'Методики роботи',
    heroBadgeCity: 'Харків, Україна',
    heroBadgeCert: 'Сертифікований фахівець',

    aboutLabel: 'Про мене',
    aboutHeading: 'Фахівець, якому <em>довіряють</em>',
    aboutSub: 'Більше 10 років практики у сфері сенсорної інтеграції та нейророзвитку. Постійне навчання та впровадження найсучасніших світових методик.',
    statYears: 'років практики',
    statCases: 'родин у роботі',
    statMethods: 'напрями роботи',
    statSupport: 'підтримки родин',
    quote: 'Кожна нервова система унікальна. Моє завдання — знайти індивідуальний ключ, що відкриває потенціал розвитку.',
    credEduTitle: 'Вища освіта',
    credEduDesc: 'Спеціальна педагогіка та психологія розвитку',
    credEduContTitle: 'Постійна освіта',
    credEduContDesc: 'Стажування у США, Польщі, Ізраїлі',

    methodsLabel: 'Методи роботи',
    methodsHeading: 'Що саме входить у <em>заняття</em>',
    methodsSub: 'Робота будується за шістьма напрямами. Програма для кожної дитини складається індивідуально, повний перелік методів — нижче.',

    approachLabel: 'Мій підхід',
    approachHeading: 'Як проходить <em>робота</em>',
    approachSub: 'Кожна програма будується індивідуально на основі глибокої діагностики та постійного моніторингу прогресу.',
    steps: [
      { title: 'Первинна консультація', desc: 'Збір анамнезу, бесіда з батьками або клієнтом. Обговорення цілей та очікувань від терапії.' },
      { title: 'Комплексна діагностика', desc: 'Стандартизовані тести (SIPT, SPM, BOT-2), клінічні спостереження, оцінка сенсорного профілю.' },
      { title: 'Індивідуальна програма', desc: 'Підбір методик, частоти сесій та домашніх завдань на основі результатів діагностики.' },
      { title: 'Сесії та моніторинг', desc: 'Регулярні заняття + навчання батьків + повторна оцінка прогресу кожні 8–12 тижнів.' },
    ],
    features: [
      { icon: '🧠', title: 'Доказова база', desc: 'Лише методи з підтвердженою ефективністю та міжнародними стандартами' },
      { icon: '👨‍👩‍👧', title: 'Партнерство з родиною', desc: 'Батьки — активні учасники терапії. Навчання та підтримка на кожному етапі' },
      { icon: '📊', title: 'Вимірювані результати', desc: 'Стандартизовані тести до та після. Звіти про прогрес для батьків та педагогів' },
      { icon: '🌐', title: 'Онлайн-підтримка', desc: 'Консультації у форматі онлайн для родин по всій Україні та за кордоном' },
      { icon: '🤝', title: 'Міждисциплінарна команда', desc: 'Співпраця з логопедами, психологами та неврологами' },
      { icon: '🛡', title: 'Безпечний простір', desc: 'Спеціально обладнаний сенсорний зал у Харкові' },
    ],

    whoLabel: 'Для кого',
    whoHeading: 'Допомагаю дітям <em>і дорослим</em>',
    whoCards: [
      { icon: '👶', title: 'Діти 0–3 роки', desc: 'Рання інтервенція, затримки розвитку, порушення тонусу, труднощі з годуванням та сном' },
      { icon: '🧒', title: 'Дошкільнята', desc: 'Гіперактивність, труднощі з увагою, координацією, сенсорна чутливість, аутизм (РАС)' },
      { icon: '🧑', title: 'Школярі', desc: 'Дисграфія, дислексія, СДУГ, труднощі з навчанням, тривожність, дезорганізація' },
      { icon: '🧑‍💼', title: 'Дорослі', desc: 'Хронічний стрес, сенсорна перевтома, наслідки травм, порушення регуляції нервової системи' },
    ],

    contactLabel: 'Контакти',
    contactHeading: 'Зробіть перший <em>крок</em>',
    contactSub: 'Запишіться на безкоштовну 20-хвилинну первинну консультацію. Разом визначимо, чи підходить мій підхід вашій ситуації.',
    contactPhoneLabel: 'Телефон / Telegram / Viber / WhatsApp',
    contactCityLabel: 'Місто',
    contactCityVal: 'Харків, Україна',
    contactHoursLabel: 'Прийом',
    contactHoursVal: 'Пн–Пт: 9:00–19:00 · Сб: 10:00–15:00',
    formHeading: 'Залишити\nзаявку',
    formName: 'Ваше ім\'я',
    formPhone: 'Номер телефону',
    formMessage: 'Коротко опишіть запит (вік дитини, основні труднощі)',
    formSubmit: 'Надіслати заявку →',

    footerName: 'Юлія Макарицька — Сенсорна інтеграція',
    footerCity: 'Харків, Україна',
    footerCopyright: '© 2026 · Харків, Україна',
  },

  ru: {
    htmlLang: 'ru',
    pageTitle: 'Юлия Макарицкая — Сенсорная интеграция · Харьков',
    navLogo: 'Ю. Макарицкая',
    navAbout: 'Обо мне',
    navMethods: 'Методики',
    navApproach: 'Подход',
    navWho: 'Для кого',
    navCta: 'Записаться',

    heroEyebrow: 'Сенсорная интеграция · Харьков',
    heroTitle: 'Специалист по сенсорной интеграции',
    heroDesc: 'Помогаю детям и взрослым гармонизировать работу нервной системы через научно обоснованные методы. Индивидуальный подход, современное оборудование, измеримые результаты.',
    heroBtnPrimary: 'Записаться на консультацию',
    heroBtnSecondary: 'Методики работы',
    heroBadgeCity: 'Харьков, Украина',
    heroBadgeCert: 'Сертифицированный специалист',

    aboutLabel: 'Обо мне',
    aboutHeading: 'Специалист, которому <em>доверяют</em>',
    aboutSub: 'Более 10 лет практики в области сенсорной интеграции и нейроразвития. Постоянное обучение и внедрение современнейших мировых методик.',
    statYears: 'лет практики',
    statCases: 'семей в работе',
    statMethods: 'направления работы',
    statSupport: 'поддержки семей',
    quote: 'Каждая нервная система уникальна. Моя задача — найти индивидуальный ключ, открывающий потенциал развития.',
    credEduTitle: 'Высшее образование',
    credEduDesc: 'Специальная педагогика и психология развития',
    credEduContTitle: 'Непрерывное образование',
    credEduContDesc: 'Стажировки в США, Польше, Израиле',

    methodsLabel: 'Методы работы',
    methodsHeading: 'Что именно входит в <em>занятие</em>',
    methodsSub: 'Работа строится по шести направлениям. Программа для каждого ребёнка составляется индивидуально, полный перечень методов — ниже.',

    approachLabel: 'Мой подход',
    approachHeading: 'Как проходит <em>работа</em>',
    approachSub: 'Каждая программа строится индивидуально на основе глубокой диагностики и постоянного мониторинга прогресса.',
    steps: [
      { title: 'Первичная консультация', desc: 'Сбор анамнеза, беседа с родителями или клиентом. Обсуждение целей и ожиданий от терапии.' },
      { title: 'Комплексная диагностика', desc: 'Стандартизированные тесты (SIPT, SPM, BOT-2), клинические наблюдения, оценка сенсорного профиля.' },
      { title: 'Индивидуальная программа', desc: 'Подбор методик, частоты сессий и домашних заданий на основе результатов диагностики.' },
      { title: 'Сессии и мониторинг', desc: 'Регулярные занятия + обучение родителей + повторная оценка прогресса каждые 8–12 недель.' },
    ],
    features: [
      { icon: '🧠', title: 'Доказательная база', desc: 'Только методы с подтверждённой эффективностью и международными стандартами' },
      { icon: '👨‍👩‍👧', title: 'Партнёрство с семьёй', desc: 'Родители — активные участники терапии. Обучение и поддержка на каждом этапе' },
      { icon: '📊', title: 'Измеримые результаты', desc: 'Стандартизированные тесты до и после. Отчёты о прогрессе для родителей и педагогов' },
      { icon: '🌐', title: 'Онлайн-поддержка', desc: 'Консультации в формате онлайн для семей по всей Украине и за рубежом' },
      { icon: '🤝', title: 'Междисциплинарная команда', desc: 'Сотрудничество с логопедами, психологами и неврологами' },
      { icon: '🛡', title: 'Безопасное пространство', desc: 'Специально оборудованный сенсорный зал в Харькове' },
    ],

    whoLabel: 'Для кого',
    whoHeading: 'Помогаю детям <em>и взрослым</em>',
    whoCards: [
      { icon: '👶', title: 'Дети 0–3 года', desc: 'Ранняя интервенция, задержки развития, нарушения тонуса, трудности с питанием и сном' },
      { icon: '🧒', title: 'Дошкольники', desc: 'Гиперактивность, трудности с вниманием, координацией, сенсорная чувствительность, аутизм (РАС)' },
      { icon: '🧑', title: 'Школьники', desc: 'Дисграфия, дислексия, СДВГ, трудности с учёбой, тревожность, дезорганизация' },
      { icon: '🧑‍💼', title: 'Взрослые', desc: 'Хронический стресс, сенсорная перегрузка, последствия травм, нарушения регуляции нервной системы' },
    ],

    contactLabel: 'Контакты',
    contactHeading: 'Сделайте первый <em>шаг</em>',
    contactSub: 'Запишитесь на бесплатную 20-минутную первичную консультацию. Вместе определим, подходит ли мой подход вашей ситуации.',
    contactPhoneLabel: 'Телефон / Telegram / Viber / WhatsApp',
    contactCityLabel: 'Город',
    contactCityVal: 'Харьков, Украина',
    contactHoursLabel: 'Приём',
    contactHoursVal: 'Пн–Пт: 9:00–19:00 · Сб: 10:00–15:00',
    formHeading: 'Оставить\nзаявку',
    formName: 'Ваше имя',
    formPhone: 'Номер телефона',
    formMessage: 'Кратко опишите запрос (возраст ребёнка, основные трудности)',
    formSubmit: 'Отправить заявку →',

    footerName: 'Юлия Макарицкая — Сенсорная интеграция',
    footerCopyright: '© 2026 · Харьков, Украина',
  },

  en: {
    htmlLang: 'en',
    pageTitle: 'Yuliia Makarytska — Sensory Integration · Kharkiv',
    navLogo: 'Yu. Makarytska',
    navAbout: 'About',
    navMethods: 'Methods',
    navApproach: 'Approach',
    navWho: 'Who I help',
    navCta: 'Book a session',

    heroEyebrow: 'Sensory Integration · Kharkiv',
    heroTitle: 'Sensory Integration Specialist',
    heroDesc: 'I help children and adults harmonise their nervous system through evidence-based sensory integration methods. Personalised approach, modern equipment, measurable outcomes.',
    heroBtnPrimary: 'Book a consultation',
    heroBtnSecondary: 'View methods',
    heroBadgeCity: 'Kharkiv, Ukraine',
    heroBadgeCert: 'Certified specialist',

    aboutLabel: 'About me',
    aboutHeading: 'A specialist you can <em>trust</em>',
    aboutSub: 'Over 10 years of practice in sensory integration and neurodevelopment. Continuous education and implementation of cutting-edge global methodologies.',
    statYears: 'years of practice',
    statCases: 'families supported',
    statMethods: 'areas of work',
    statSupport: 'families supported',
    quote: 'Every nervous system is unique. My task is to find the individual key that unlocks the potential for development.',
    credEduTitle: 'Higher Education',
    credEduDesc: 'Special Education and Developmental Psychology',
    credEduContTitle: 'Continuous Learning',
    credEduContDesc: 'Internships in the USA, Poland, Israel',

    methodsLabel: 'Methods',
    methodsHeading: 'What a <em>session</em> involves',
    methodsSub: 'The work is built around six areas. Each child gets an individually built programme; the full list of methods is below.',

    approachLabel: 'My approach',
    approachHeading: 'How the <em>work</em> unfolds',
    approachSub: 'Every programme is built individually based on thorough assessment and continuous progress monitoring.',
    steps: [
      { title: 'Initial consultation', desc: 'History intake, conversation with parents or the client. Discussing goals and expectations from therapy.' },
      { title: 'Comprehensive assessment', desc: 'Standardised tests (SIPT, SPM, BOT-2), clinical observations, sensory profile evaluation.' },
      { title: 'Individual programme', desc: 'Selection of techniques, session frequency, and home exercises based on assessment results.' },
      { title: 'Sessions & monitoring', desc: 'Regular sessions + parent coaching + re-assessment of progress every 8–12 weeks.' },
    ],
    features: [
      { icon: '🧠', title: 'Evidence base', desc: 'Only methods with proven effectiveness and international standards' },
      { icon: '👨‍👩‍👧', title: 'Family partnership', desc: 'Parents are active participants in therapy. Coaching and support at every stage' },
      { icon: '📊', title: 'Measurable outcomes', desc: 'Standardised pre/post testing. Progress reports for parents and educators' },
      { icon: '🌐', title: 'Online support', desc: 'Online consultations for families across Ukraine and abroad' },
      { icon: '🤝', title: 'Multidisciplinary team', desc: 'Collaboration with speech therapists, psychologists, and neurologists' },
      { icon: '🛡', title: 'Safe environment', desc: 'Specially equipped sensory gym in Kharkiv' },
    ],

    whoLabel: 'Who I help',
    whoHeading: 'Supporting children <em>and adults</em>',
    whoCards: [
      { icon: '👶', title: 'Infants 0–3', desc: 'Early intervention, developmental delays, tone disorders, feeding and sleep difficulties' },
      { icon: '🧒', title: 'Preschoolers', desc: 'Hyperactivity, attention and coordination difficulties, sensory sensitivity, autism (ASD)' },
      { icon: '🧑', title: 'School-age children', desc: 'Dysgraphia, dyslexia, ADHD, learning difficulties, anxiety, disorganisation' },
      { icon: '🧑‍💼', title: 'Adults', desc: 'Chronic stress, sensory overload, trauma aftermath, nervous system dysregulation' },
    ],

    contactLabel: 'Contact',
    contactHeading: 'Take the first <em>step</em>',
    contactSub: 'Book a free 20-minute initial consultation. Together we\'ll determine whether my approach fits your situation.',
    contactPhoneLabel: 'Phone / Telegram / Viber / WhatsApp',
    contactCityLabel: 'City',
    contactCityVal: 'Kharkiv, Ukraine',
    contactHoursLabel: 'Hours',
    contactHoursVal: 'Mon–Fri: 9:00–19:00 · Sat: 10:00–15:00',
    formHeading: 'Leave a\nrequest',
    formName: 'Your name',
    formPhone: 'Phone number',
    formMessage: 'Briefly describe your request (child\'s age, main difficulties)',
    formSubmit: 'Send request →',

    footerName: 'Yuliia Makarytska — Sensory Integration',
    footerCopyright: '© 2026 · Kharkiv, Ukraine',
  }
};

// ─── RENDER CONTENT ─────────────────────────────────────────────────────────
function applyLang(lang) {
  const t = i18n[lang];
  if (!t) return;

  document.documentElement.lang = t.htmlLang;
  document.title = t.pageTitle;

  // Nav
  document.querySelector('.nav-logo').textContent = t.navLogo;
  const navLinks = document.querySelectorAll('.nav-links a');
  navLinks[0].textContent = t.navAbout;
  navLinks[1].textContent = t.navMethods;
  navLinks[2].textContent = t.navApproach;
  navLinks[3].textContent = t.navWho;
  document.querySelector('.nav-cta').textContent = t.navCta;

  // Hero
  document.querySelector('.hero-eyebrow').textContent = t.heroEyebrow;
  document.querySelector('.hero-title').textContent = t.heroTitle;
  document.querySelector('.hero-desc').textContent = t.heroDesc;
  document.querySelector('.btn-primary').innerHTML = t.heroBtnPrimary + ' <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>';
  document.querySelector('.btn-secondary').innerHTML = t.heroBtnSecondary + ' <svg width="14" height="14" fill="none" viewBox="0 0 24 24"><path stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" d="M5 12h14M12 5l7 7-7 7"/></svg>';
  document.querySelector('.badge-exp').innerHTML = '<span class="badge-dot dot-sage"></span>' + t.heroBadgeCity;
  document.querySelector('.badge-cert').innerHTML = '<span class="badge-dot dot-clay"></span>' + t.heroBadgeCert;

  // About
  document.querySelector('#about .section-label').textContent = t.aboutLabel;
  document.querySelector('#about .section-heading').innerHTML = t.aboutHeading;
  document.querySelector('#about .section-sub').textContent = t.aboutSub;
  const statDescs = document.querySelectorAll('.stat-desc');
  statDescs[0].textContent = t.statYears;
  statDescs[1].textContent = t.statCases;
  statDescs[2].textContent = t.statMethods;
  statDescs[3].textContent = t.statSupport;
  document.querySelector('.about-quote').textContent = t.quote;
  const creds = document.querySelectorAll('.cred-text');
  creds[0].innerHTML = `<strong>${t.credEduTitle}</strong>${t.credEduDesc}`;
  creds[1].innerHTML = `<strong>${t.credEduContTitle}</strong>${t.credEduContDesc}`;

  // Methods header
  document.querySelector('.methods .section-label').textContent = t.methodsLabel;
  document.querySelector('.methods .section-heading').innerHTML = t.methodsHeading;
  document.querySelector('.methods .section-sub').textContent = t.methodsSub;

  // Method cards are static markup; Step 3 moves them into content/<lang>.json

  // Approach
  document.querySelector('#approach .section-label').textContent = t.approachLabel;
  document.querySelector('#approach .section-heading').innerHTML = t.approachHeading;
  document.querySelector('#approach .section-sub').textContent = t.approachSub;
  const steps = document.querySelectorAll('.step-item');
  t.steps.forEach((s, i) => {
    if (steps[i]) {
      steps[i].querySelector('.step-title').textContent = s.title;
      steps[i].querySelector('.step-desc').textContent = s.desc;
    }
  });
  const feats = document.querySelectorAll('.feat-block');
  t.features.forEach((f, i) => {
    if (feats[i]) {
      feats[i].querySelector('.feat-title').textContent = f.title;
      feats[i].querySelector('.feat-desc').textContent = f.desc;
    }
  });

  // Who
  document.querySelector('#who .section-label').textContent = t.whoLabel;
  document.querySelector('#who .section-heading').innerHTML = t.whoHeading;
  const whoCards = document.querySelectorAll('.who-card');
  t.whoCards.forEach((w, i) => {
    if (whoCards[i]) {
      whoCards[i].querySelector('.who-title').textContent = w.title;
      whoCards[i].querySelector('.who-desc').textContent = w.desc;
    }
  });

  // Contact
  document.querySelector('#contact .section-label').textContent = t.contactLabel;
  document.querySelector('#contact .section-heading').innerHTML = t.contactHeading;
  document.querySelector('#contact .section-sub').textContent = t.contactSub;
  document.querySelector('.contact-phone-label').textContent = t.contactPhoneLabel;
  document.querySelector('.contact-city-label').textContent = t.contactCityLabel;
  document.querySelector('.contact-city-val').textContent = t.contactCityVal;
  document.querySelector('.contact-hours-label').textContent = t.contactHoursLabel;
  document.querySelector('.contact-hours-val').textContent = t.contactHoursVal;
  document.querySelector('.form-heading').innerHTML = t.formHeading.replace('\n', '<br>');
  document.querySelector('input[data-i18n="name"]').placeholder = t.formName;
  document.querySelector('input[data-i18n="phone"]').placeholder = t.formPhone;
  document.querySelector('textarea[data-i18n="message"]').placeholder = t.formMessage;
  document.querySelector('.form-submit').textContent = t.formSubmit;

  // Footer
  document.querySelector('.footer-name').textContent = t.footerName;
  document.querySelector('.footer-copyright').textContent = t.footerCopyright;

  // Update active lang button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });


  // Save preference
  localStorage.setItem('lang', lang);
}

// ─── SCROLL REVEAL ───────────────────────────────────────────────────────────
function initReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// ─── BURGER MENU ─────────────────────────────────────────────────────────────
function initBurger() {
  const burger = document.querySelector('.burger');
  const menu = document.getElementById('mobileMenu');
  if (!burger || !menu) return;

  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on nav link click
  menu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      burger.classList.remove('open');
      menu.classList.remove('open');
      burger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    });
  });
}

// ─── INIT ────────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initReveal();
  initBurger();

  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => applyLang(btn.dataset.lang));
  });

  const saved = localStorage.getItem('lang') || 'uk';
  applyLang(saved);
});
