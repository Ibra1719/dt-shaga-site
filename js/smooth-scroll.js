
(function () {
    if (document.documentElement.style.scrollBehavior === undefined) {
        const style = document.createElement('style');
        style.textContent = 'html{scroll-behavior:smooth}@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}}';
        document.head.appendChild(style);
    }
})();
