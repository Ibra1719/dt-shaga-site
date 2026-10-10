
(function () {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.documentElement.classList.add('reduced-motion');
        return;
    }

    const heroBg = document.querySelector('.hero-background');
    if (!heroBg) return;

    document.addEventListener('visibilitychange', () => {
        heroBg.style.animationPlayState = document.hidden ? 'paused' : 'running';
    });
})();
