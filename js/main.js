
document.addEventListener('DOMContentLoaded', function () {
    const header = document.getElementById('header');

    function scrollToSection(selector) {
        const target = typeof selector === 'string' ? document.querySelector(selector) : selector;
        if (!target) return;
        const offset = header ? header.offsetHeight : 0;
        const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    function setBodyScrollLock(locked) {
        document.body.style.overflow = locked ? 'hidden' : '';
    }

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const nav = document.querySelector('.nav');

    function closeMobileMenu() {
        if (!nav || !mobileMenuToggle) return;
        nav.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        setBodyScrollLock(false);
    }

    if (mobileMenuToggle && nav) {
        mobileMenuToggle.addEventListener('click', function () {
            const opening = !nav.classList.contains('active');
            nav.classList.toggle('active', opening);
            this.classList.toggle('active', opening);
            this.setAttribute('aria-expanded', opening ? 'true' : 'false');
            setBodyScrollLock(opening);
        });

        nav.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', closeMobileMenu);
        });
    }

    if (header) {
        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                header.classList.toggle('scrolled', window.scrollY > 100);
                ticking = false;
            });
        };
        window.addEventListener('scroll', onScroll, { passive: true });
        onScroll();
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        if (anchor.id === 'hero-arrow') return;

        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (!href || href === '#') return;

            const target = document.querySelector(href);
            if (!target) return;

            e.preventDefault();
            scrollToSection(target);
        });
    });

    const heroArrow = document.getElementById('hero-arrow');
    const heroSkullTap = document.getElementById('hero-skull-tap');
    const heroBackground = document.querySelector('.hero-background');

    function playJawAnimation(scrollAfter) {
        if (!heroBackground) return;
        heroBackground.classList.remove('jaw-animate');
        requestAnimationFrame(() => {
            heroBackground.classList.add('jaw-animate');
        });
        setTimeout(() => heroBackground.classList.remove('jaw-animate'), 1200);
        if (scrollAfter) {
            setTimeout(() => scrollToSection('#about'), 400);
        }
    }

    if (heroArrow && heroBackground) {
        heroArrow.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            playJawAnimation(true);
        }, true);
    }

    if (heroSkullTap && heroBackground) {
        heroSkullTap.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            playJawAnimation(true);
        });
    }

    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    if (!entry.isIntersecting) return;
                    entry.target.classList.add('animate-in');
                    observer.unobserve(entry.target);
                });
            },
            { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
        );

        document.querySelectorAll(
            '.advantage-item, .bento-card, .about-content, .process-step, .faq-item, .facts-strip li'
        ).forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    const gallery = document.getElementById('gallery-lightbox');
    const galleryImg = gallery && gallery.querySelector('.gallery-lightbox__img');
    const galleryTitle = gallery && gallery.querySelector('.gallery-lightbox__title');
    const galleryCounter = gallery && gallery.querySelector('.gallery-lightbox__counter');
    const galleryClose = gallery && gallery.querySelector('.gallery-lightbox__close');
    const galleryPrev = gallery && gallery.querySelector('.gallery-lightbox__nav--prev');
    const galleryNext = gallery && gallery.querySelector('.gallery-lightbox__nav--next');

    let galleryItems = [];
    let galleryIndex = 0;
    let touchStartX = 0;
    let touchStartY = 0;

    function renderGallerySlide() {
        if (!galleryImg || !galleryItems.length) return;
        const src = galleryItems[galleryIndex];
        galleryImg.src = src;
        galleryImg.alt = galleryTitle ? galleryTitle.textContent : '';
        if (galleryCounter) {
            galleryCounter.textContent = `${galleryIndex + 1} / ${galleryItems.length}`;
        }
    }

    function openGallery(items, title, startIndex) {
        if (!gallery || !items.length) return;
        galleryItems = items;
        galleryIndex = Math.max(0, Math.min(startIndex || 0, items.length - 1));
        if (galleryTitle) galleryTitle.textContent = title || '';
        renderGallerySlide();
        gallery.classList.add('is-open');
        gallery.setAttribute('aria-hidden', 'false');
        setBodyScrollLock(true);
    }

    function closeGallery() {
        if (!gallery) return;
        gallery.classList.remove('is-open');
        gallery.setAttribute('aria-hidden', 'true');
        setBodyScrollLock(false);
        if (galleryImg) galleryImg.src = '';
        galleryItems = [];
    }

    function showGalleryDelta(delta) {
        if (!galleryItems.length) return;
        galleryIndex = (galleryIndex + delta + galleryItems.length) % galleryItems.length;
        renderGallerySlide();
    }

    function readGalleryFrom(el) {
        const host = el.closest('[data-gallery]') || el;
        try {
            const items = JSON.parse(host.getAttribute('data-gallery') || '[]');
            const title = host.getAttribute('data-gallery-title') || '';
            return { items, title };
        } catch (err) {
            console.error('[gallery] Некорректный data-gallery', err);
            return { items: [], title: '' };
        }
    }

    document.querySelectorAll('.js-gallery-open').forEach(trigger => {
        trigger.addEventListener('click', function (e) {
            e.preventDefault();
            e.stopPropagation();
            const { items, title } = readGalleryFrom(this);
            openGallery(items, title, 0);
        });
    });

    if (galleryClose) galleryClose.addEventListener('click', closeGallery);
    if (galleryPrev) galleryPrev.addEventListener('click', () => showGalleryDelta(-1));
    if (galleryNext) galleryNext.addEventListener('click', () => showGalleryDelta(1));

    if (gallery) {
        gallery.addEventListener('click', function (e) {
            if (e.target === gallery) closeGallery();
        });

        gallery.addEventListener('touchstart', function (e) {
            if (!gallery.classList.contains('is-open') || !e.changedTouches.length) return;
            touchStartX = e.changedTouches[0].clientX;
            touchStartY = e.changedTouches[0].clientY;
        }, { passive: true });

        gallery.addEventListener('touchend', function (e) {
            if (!gallery.classList.contains('is-open') || !e.changedTouches.length) return;
            const dx = e.changedTouches[0].clientX - touchStartX;
            const dy = e.changedTouches[0].clientY - touchStartY;
            if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy)) return;
            showGalleryDelta(dx < 0 ? 1 : -1);
        }, { passive: true });
    }

    document.addEventListener('keydown', function (e) {
        if (gallery && gallery.classList.contains('is-open')) {
            if (e.key === 'Escape') {
                closeGallery();
                return;
            }
            if (e.key === 'ArrowLeft') {
                showGalleryDelta(-1);
                return;
            }
            if (e.key === 'ArrowRight') {
                showGalleryDelta(1);
                return;
            }
        }
        if (e.key === 'Escape') closeMobileMenu();
    });
});

window.addEventListener('load', function () {
    document.body.classList.remove('loading');
});

const yearEl = document.getElementById('copyright-year');
if (yearEl) yearEl.textContent = String(new Date().getFullYear());
