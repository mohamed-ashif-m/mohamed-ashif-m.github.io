import gsap from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/+esm';
import { ScrollTrigger } from 'https://cdn.jsdelivr.net/npm/gsap@3.12.5/ScrollTrigger/+esm';

if (!window.__projectsSectionInit) {
    window.__projectsSectionInit = true;
    gsap.registerPlugin(ScrollTrigger);

    const NO_MOTION_PREFERENCE_QUERY = '(prefers-reduced-motion: no-preference)';

    function debounce(fn, wait) {
        let timeout;
        return function debouncedFunction(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => fn.apply(this, args), wait);
        };
    }

    function initProjectsSection() {
        const section = document.querySelector('.section-container.projects-section');
        if (!section) return;

        const titleBlock = section.querySelector('.inner-container.title-block');
        const projectWrapper = section.querySelector('.project-wrapper');
        const dotsContainer = document.getElementById('projectsDots');
        const projectLinks = Array.from(section.querySelectorAll('.project-link'));

        if (!projectWrapper || !projectLinks.length) return;

        let projectsTimeline = null;
        let projectsScrollTrigger = null;
        let projectsRevealTimeline = null;
        let projectsRevealScrollTrigger = null;

        function cleanup() {
            if (projectsScrollTrigger) projectsScrollTrigger.kill();
            if (projectsTimeline) projectsTimeline.kill();
            if (projectsRevealScrollTrigger) projectsRevealScrollTrigger.kill();
            if (projectsRevealTimeline) projectsRevealTimeline.progress(1);

            section.style.removeProperty('width');
            section.style.removeProperty('transform');
            section.classList.remove('will-change-transform');
            if (titleBlock) titleBlock.classList.remove('will-change-transform');

            projectWrapper.style.removeProperty('width');
            projectWrapper.style.removeProperty('padding');
            projectWrapper.style.removeProperty('transform');
            projectWrapper.classList.remove('overflow-x-auto');
        }

        function setWillChange(active) {
            section.classList.toggle('will-change-transform', active);
            if (titleBlock) titleBlock.classList.toggle('will-change-transform', active);
        }

        function initReveal() {
            if (projectsRevealScrollTrigger) projectsRevealScrollTrigger.kill();
            if (projectsRevealTimeline) projectsRevealTimeline.progress(1);

            projectsRevealTimeline = gsap.timeline({ defaults: { ease: 'none' } });
            projectsRevealTimeline.from(section.querySelectorAll('.seq'), {
                opacity: 0,
                duration: 0.5,
                stagger: 0.2
            });

            projectsRevealScrollTrigger = ScrollTrigger.create({
                trigger: section,
                start: 'top bottom',
                end: 'bottom bottom',
                scrub: 0,
                animation: projectsRevealTimeline
            });
        }

        function initDesktopPin() {
            if (projectsScrollTrigger) projectsScrollTrigger.kill();
            if (projectsTimeline) projectsTimeline.kill();

            const innerContainer = section.querySelector('.inner-container');
            if (!innerContainer) return;

            const sidePadding = document.body.clientWidth - innerContainer.clientWidth;
            const projectsWidth = projectWrapper.scrollWidth;
            const viewportWidth = window.innerWidth;
            const containerPadding = sidePadding / 2;
            const totalScrollDistance = projectsWidth - viewportWidth + containerPadding;
            const elementWidth = sidePadding + projectsWidth;

            section.style.width = `${elementWidth}px`;
            const xDistance = -Math.max(0, totalScrollDistance);
            const duration = `${Math.max((totalScrollDistance / viewportWidth) * 100, 100)}%`;

            projectsTimeline = gsap.timeline({ defaults: { ease: 'none' } });
            projectsTimeline
                .to(section, { x: xDistance })
                .to(titleBlock, { x: -xDistance }, '<');

            projectsScrollTrigger = ScrollTrigger.create({
                trigger: section,
                start: 'top top',
                end: duration,
                scrub: 1.1,
                anticipatePin: 1,
                fastScrollEnd: false,
                pin: true,
                animation: projectsTimeline,
                pinSpacing: 'margin',
                invalidateOnRefresh: true,
                onToggle: (self) => {
                    setWillChange(self.isActive);
                    try {
                        if (self.isActive) {
                            gsap.set(section, { force3D: true });
                            section.style.willChange = 'transform, top, left';
                        } else {
                            section.style.willChange = '';
                        }
                    } catch (error) {}
                }
            });

            ScrollTrigger.refresh();
        }

        function initMobileFallback() {
            const parentPadding = window.getComputedStyle(section).paddingLeft;
            section.style.setProperty('width', '100%');
            projectWrapper.classList.add('overflow-x-auto');
            projectWrapper.style.setProperty('width', 'calc(100vw)');
            projectWrapper.style.setProperty('padding', `0 ${parentPadding}`);
            projectWrapper.style.setProperty('transform', `translateX(-${parentPadding})`);
        }

        function initVanillaTilt() {
            if (!window.VanillaTilt) return;
            section.querySelectorAll('.project-tile').forEach((tile) => {
                VanillaTilt.init(tile, {
                    max: 5,
                    speed: 400,
                    glare: true,
                    'max-glare': 0.2,
                    gyroscope: false
                });
            });
        }

        function setProjectGradients() {
            section.querySelectorAll('.project-tile').forEach((tile) => {
                try {
                    tile.style.background = 'linear-gradient(180deg, rgba(255,255,255,0.06), rgba(255,255,255,0.03))';
                    tile.style.border = '2px solid rgba(255,255,255,0.95)';
                    tile.style.backdropFilter = 'blur(8px)';
                    tile.style.webkitBackdropFilter = 'blur(8px)';
                    tile.style.boxShadow = '0 6px 18px rgba(0,0,0,0.18)';
                } catch (error) {}
            });
        }

        function equalizeProjectCardHeights() {
            try {
                projectLinks.forEach((link) => {
                    link.style.height = 'auto';
                    link.style.minHeight = '';
                });
                section.querySelectorAll('.project-tile').forEach((tile) => {
                    tile.style.height = '';
                });

                let maxHeight = 0;
                projectLinks.forEach((link) => {
                    const tile = link.querySelector('.project-tile');
                    if (!tile) return;
                    const height = tile.offsetHeight;
                    if (height > maxHeight) maxHeight = height;
                });

                if (maxHeight > 0) {
                    projectLinks.forEach((link) => {
                        link.style.height = `${maxHeight}px`;
                    });
                }
            } catch (error) {
                console.warn('equalizeProjectCardHeights failed', error);
            }
        }

        function buildDots() {
            if (!dotsContainer) return;
            dotsContainer.innerHTML = '';
            dotsContainer.setAttribute('aria-hidden', 'false');

            projectLinks.forEach((item, index) => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'projects-dot';
                button.setAttribute('aria-label', `Go to project ${index + 1}`);
                button.addEventListener('click', (event) => {
                    event.preventDefault();
                    const desiredLeft = Math.round(item.offsetLeft - (projectWrapper.clientWidth - item.clientWidth) / 2);
                    const maxLeft = Math.max(0, projectWrapper.scrollWidth - projectWrapper.clientWidth);
                    const clampedLeft = Math.max(0, Math.min(desiredLeft, maxLeft));
                    projectWrapper.scrollTo({ left: clampedLeft, behavior: 'smooth' });
                });
                dotsContainer.appendChild(button);
            });
        }

        function activateDot(index) {
            if (!dotsContainer) return;
            Array.from(dotsContainer.querySelectorAll('button')).forEach((button, i) => {
                button.classList.toggle('active', i === index);
            });
        }

        function syncDotsWithScroll() {
            if (!dotsContainer) return;
            const containerRect = projectWrapper.getBoundingClientRect();
            const centerX = containerRect.left + containerRect.width / 2;
            let nearestIndex = 0;
            let minDistance = Infinity;

            projectLinks.forEach((item, index) => {
                const rect = item.getBoundingClientRect();
                const itemCenter = rect.left + rect.width / 2;
                const distance = Math.abs(centerX - itemCenter);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestIndex = index;
                }
            });

            activateDot(nearestIndex);
        }

        function enableMobileDots() {
            if (!dotsContainer) return;
            buildDots();
            projectWrapper.addEventListener('scroll', onProjectScroll, { passive: true });
        }

        function disableMobileDots() {
            projectWrapper.removeEventListener('scroll', onProjectScroll);
            if (dotsContainer) dotsContainer.innerHTML = '';
        }

        function onProjectScroll() {
            requestAnimationFrame(syncDotsWithScroll);
        }

        function initResponsiveMode() {
            cleanup();
            initReveal();

            const isDesktop = window.matchMedia('(min-width: 1024px)').matches;
            const motionAllowed = window.matchMedia(NO_MOTION_PREFERENCE_QUERY).matches;

            if (isDesktop && motionAllowed) {
                initDesktopPin();
                disableMobileDots();
            } else {
                initMobileFallback();
                enableMobileDots();
            }

            setProjectGradients();
            initVanillaTilt();
            equalizeProjectCardHeights();
            if (dotsContainer && !isDesktop) {
                syncDotsWithScroll();
            }
            ScrollTrigger.refresh();
        }

        const resizeHandler = debounce(() => {
            initResponsiveMode();
        }, 160);

        window.addEventListener('resize', resizeHandler);
        window.addEventListener('orientationchange', resizeHandler);
        window.addEventListener('beforeunload', () => {
            cleanup();
        });

        setTimeout(initResponsiveMode, 100);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProjectsSection, { once: true });
    } else {
        initProjectsSection();
    }
}
