document.addEventListener('DOMContentLoaded', () => {

    gsap.registerPlugin(ScrollTrigger);

    // In script.js

    function initParticleField() {
        const canvas = document.getElementById('particle-canvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        let particles = [];
        const mouse = { x: null, y: null };

        // --- CONFIGURATION TUNED FOR MAXIMUM SUBTLETY ---
        const config = {
            particleCount: 150,          // Less dense
            interactionRadius: 250,      // Larger, softer interaction area
            baseSpeed: 0.05,             // Very slow idle drift
            mouseRepelStrength: 0.15,    // Very gentle mouse push
            returnSpeed: 0.008,          // Slow, syrupy return to origin
            parallaxStrength: 0.2,       // Extremely subtle scroll parallax
        };
        // ------------------------------------------------

        // Storing RGB values to apply custom alpha per particle
        const colors = {
            light: { rgb: '26, 26, 26' },
            dark: { rgb: '240, 240, 240' },
        };

        function setup() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            particles = [];
            for (let i = 0; i < config.particleCount; i++) {
                const depth = Math.random() * 0.8 + 0.2;
                particles.push({
                    x: Math.random() * canvas.width,
                    y: Math.random() * canvas.height,
                    originX: Math.random() * canvas.width,
                    originY: Math.random() * canvas.height,
                    depth: depth,
                    // NEW: Each particle gets a random, low opacity
                    alpha: Math.random() * 0.3 + 0.05, // Opacity from 0.05 to 0.35
                    vx: (Math.random() - 0.5) * config.baseSpeed,
                    vy: (Math.random() - 0.5) * config.baseSpeed,
                });
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            
            const currentTheme = document.documentElement.getAttribute('data-theme') || 'dark';
            const themeColors = currentTheme === 'light' ? colors.light : colors.dark;
            const scrollY = window.scrollY;

            particles.forEach(p => {
                // Mouse Interaction (logic remains the same)
                let dx = mouse.x - p.x;
                let dy = mouse.y - p.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let force = 0;
                if (distance < config.interactionRadius) {
                    force = (config.interactionRadius - distance) / config.interactionRadius * config.mouseRepelStrength;
                }

                // Parallax and Return to Origin
                const targetY = p.originY + (scrollY * p.depth * config.parallaxStrength);
                p.x += (p.originX - p.x) * config.returnSpeed;
                p.y += (targetY - p.y) * config.returnSpeed;

                // Apply Forces
                if (distance > 0) { // Avoid division by zero
                    p.x -= dx / distance * force;
                    p.y -= dy / distance * force;
                }
                p.x += p.vx;
                p.y += p.vy;

                // Boundary checks
                if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
                // A buffer for y to make particles disappear more naturally on scroll
                if (p.y < -10 || p.y > canvas.height + 10) p.vy *= -1;
                
                // Draw the particle with its unique alpha
                ctx.fillStyle = `rgba(${themeColors.rgb}, ${p.alpha})`;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.depth * 1.2, 0, Math.PI * 2); // Slightly smaller max size
                ctx.fill();
            });

            requestAnimationFrame(animate);
        }

        // Event Listeners (no change needed here)
        if (window.matchMedia("(pointer: fine)").matches) {
            window.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
            window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });
        }
        window.addEventListener('resize', setup);
        
        // Initialize
        setup();
        animate();
    }

    // Don't forget to call it
    initParticleField();

    // Call the function
    initParticleField();

    function initializeMainPageAnimations() {
        const heroTimeline = gsap.timeline();
        heroTimeline
            .to('.hero-headline', { opacity: 1, y: 0, duration: 0.8, ease: 'power3.out' })
            .to('.hero-name', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.5')
            .to('.hero-title', { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }, '-=0.4');

        gsap.to("#page-progress", {
            scaleX: 1, ease: "none",
            scrollTrigger: { scrub: true, start: "top top", end: "bottom bottom" }
        });

        gsap.to(".shape", { yPercent: -100, ease: "none", scrollTrigger: { trigger: "body", start: "top top", end: "bottom bottom", scrub: true } });

        const sections = gsap.utils.toArray('section[id]');
        sections.forEach(section => {
            const sectionTitle = section.querySelector('.section-title[data-scramble-text]');
            const content = section.querySelector('.gsap-fade-in');
            
            ScrollTrigger.create({
                trigger: section, start: 'top center+=100', end: 'bottom center-=100',
                onToggle: self => {
                    const navLink = document.querySelector(`.main-nav a[data-nav-for="${section.id}"]`);
                    if(navLink) navLink.classList.toggle('active', self.isActive);
                }
            });

            if(content) {
                gsap.to(content, {
                    opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.1,
                    scrollTrigger: { trigger: section, start: 'top 80%', toggleActions: 'play none none reverse' }
                });
            }

            if(sectionTitle) {
                 ScrollTrigger.create({
                    trigger: sectionTitle, start: 'top 90%',
                    onEnter: () => scrambleText(sectionTitle),
                    once: true,
                 });
            }
        });

        const scrollToTopBtn = document.getElementById('scrollToTop');
        if (scrollToTopBtn) {
            ScrollTrigger.create({ start: '800px top', end: 'bottom bottom', onToggle: self => scrollToTopBtn.classList.toggle('is-visible', self.isActive) });
        }
    }

    function initialize404PageAnimations() {
        gsap.to('.gsap-fade-in', { opacity: 1, y: 0, duration: 1, ease: 'power3.out', stagger: 0.2, delay: 0.2 });
        const title = document.querySelector('.error-title[data-scramble-text]');
        if(title) scrambleText(title);
    }

    document.fonts.ready.then(function () {
        const preloader = document.querySelector('.preloader');
        const preloaderLogo = document.querySelector('.preloader-logo');
        const logoFill = document.querySelector('.logo-text-fill');
        
        const preloaderTimeline = gsap.timeline({
            onComplete: () => {
                document.body.classList.remove('is-loading');
                // Check which page we're on and run the correct animations
                if (document.querySelector('.hero')) {
                    initializeMainPageAnimations();
                } else if (document.querySelector('.error-content')) {
                    initialize404PageAnimations();
                }
            }
        });

        preloaderTimeline
            .from(preloaderLogo, { scale: 0.9, opacity: 0, duration: 0.5, ease: 'power2.out' })
            .to(logoFill, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power3.inOut' }, '-=0.2')
            .to(preloaderLogo, { delay: 0.2, scale: 0.95, opacity: 0, duration: 0.5, ease: 'power2.in' })
            .to(preloader, { yPercent: -100, duration: 0.8, ease: 'power3.inOut' }, '-=0.3');
    });

    console.log("%cHey there, curious developer! 👋", "color: #A3FF75; font-size: 16px; font-weight: bold; font-family: 'Poppins', sans-serif;");
    console.log("%cLooks like you're checking out the code. If you like what you see, let's connect!", "color: #F0F0F0; font-size: 12px; font-family: 'Poppins', sans-serif;");

    const themeSwitcher = document.querySelector('.theme-switcher');
    const doc = document.documentElement;
    const currentTheme = localStorage.getItem('theme') || (window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark');
    doc.setAttribute('data-theme', currentTheme);
    
    themeSwitcher.addEventListener('click', () => {
        let newTheme = doc.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        doc.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    });

    if (window.matchMedia("(pointer: fine)").matches) {
        const cursorDot = document.querySelector('.cursor-dot');
        const cursorOutline = document.querySelector('.cursor-outline');
        const dotX = gsap.quickSetter(cursorDot, "x", "px");
        const dotY = gsap.quickSetter(cursorDot, "y", "px");
        window.addEventListener('mousemove', e => {
            dotX(e.clientX); dotY(e.clientY);
            gsap.to(cursorOutline, { x: e.clientX, y: e.clientY, duration: 0.4, ease: "power2.out" });
        });
        document.querySelectorAll('a, button, .skill-tag, .btn, .interactive-text span, .logo').forEach(el => {
            el.addEventListener('mouseenter', () => gsap.to(cursorOutline, { scale: 1.8, duration: 0.3, overwrite: 'auto' }));
            el.addEventListener('mouseleave', () => gsap.to(cursorOutline, { scale: 1, duration: 0.3, overwrite: 'auto' }));
        });
        document.querySelectorAll('.magnetic-button').forEach(el => {
            let xTo = gsap.quickTo(el, "x", { duration: 0.8, ease: "elastic.out(1, 0.3)" });
            let yTo = gsap.quickTo(el, "y", { duration: 0.8, ease: "elastic.out(1, 0.3)" });
            el.addEventListener("mousemove", e => {
                const { clientX, clientY } = e;
                const { height, width, left, top } = el.getBoundingClientRect();
                const x = clientX - (left + width / 2);
                const y = clientY - (top + height / 2);
                xTo(x * 0.4);
                yTo(y * 0.4);
            });
            el.addEventListener("mouseleave", e => { xTo(0); yTo(0); });
        });
    }

    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', () => {
            gsap.fromTo('.logo', { scale: 1, rotation: 0 }, { scale: 1.2, rotation: 10, yoyo: true, repeat: 1, duration: 0.2, ease: 'power2.inOut' });
        });
    }
    
    const scrambleText = (element) => {
        const originalText = element.dataset.scrambleText;
        let iteration = 0;
        const interval = setInterval(() => {
            element.innerText = originalText.split("").map((letter, index) => {
                if (index < iteration) { return originalText[index]; }
                return "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz!@#$%^&*()"[Math.floor(Math.random() * 62)];
            }).join("");
            if (iteration >= originalText.length) { clearInterval(interval); }
            iteration += 1 / 3;
        }, 50);
    };

    const scrollToTopBtn = document.getElementById('scrollToTop');
    if(scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});