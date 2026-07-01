// 🧩 Mobile Chrome viewport fix applied (stable vh & invalidateOnRefresh)
// Exports initViewportFix which sets --vh and wires resize/orientationchange/load

export function initViewportFix({ debounceMs = 120 } = {}) {
    function setViewportHeight() {
        const vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // Debounce helper
    function debounce(fn, wait) {
        let t = null;
        return function(...args) {
            clearTimeout(t);
            t = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    // Run once now
    setViewportHeight();

    const onResize = debounce(() => {
        setViewportHeight();
        try { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); } catch (e) { /* ignore */ }
    }, debounceMs);

    window.addEventListener('resize', onResize, { passive: true });
    window.addEventListener('orientationchange', onResize, { passive: true });

    // Also refresh on load and schedule a delayed refresh per requirements
    window.addEventListener('load', () => {
        setViewportHeight();
        try { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); } catch (e) { /* ignore */ }
        setTimeout(() => { try { if (window.ScrollTrigger) window.ScrollTrigger.refresh(); } catch (e) {} }, 500);
    }, { once: true });

    // expose programmatic setter
    return { setViewportHeight, destroy: () => { window.removeEventListener('resize', onResize); window.removeEventListener('orientationchange', onResize); } };
}
