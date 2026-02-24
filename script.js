// ========================================
// Portfolio Website JavaScript
// ========================================

// ========================================
// PRELOADER
// ========================================
window.addEventListener('load', function () {
    const preloader = document.getElementById('preloader');
    if (preloader) {
        setTimeout(() => {
            preloader.classList.add('hidden');
        }, 1600); // Matches 1.5s animation + a little buffer
    }
});

// ========================================
// SCROLL PROGRESS BAR
// ========================================
window.addEventListener('scroll', function () {
    const scrollProgress = document.getElementById('scroll-progress');
    if (scrollProgress) {
        const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrollPercent = (scrollTop / scrollHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';
    }
});

// ========================================
// PARTICLE SYSTEM (Hero Background)
// ========================================
(function initParticles() {
    const canvas = document.getElementById('particle-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    function resize() {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 60;
    const MAX_DIST = 130;
    const particles = [];

    function getColor() {
        const isDark = document.body.classList.contains('dark-mode');
        return isDark ? 'rgba(227, 239, 38,' : 'rgba(7, 102, 83,';
    }

    for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            r: Math.random() * 2.5 + 1
        });
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        const colorBase = getColor();

        particles.forEach(p => {
            p.x += p.vx;
            p.y += p.vy;
            if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
            if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = colorBase + '0.6)';
            ctx.fill();
        });

        // Draw connecting lines
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < MAX_DIST) {
                    const opacity = (1 - dist / MAX_DIST) * 0.3;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = colorBase + opacity + ')';
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }
        }
        requestAnimationFrame(draw);
    }
    draw();
})();

// ========================================
// TYPEWRITER EFFECT (Hero Subtitle)
// ========================================
(function initTypewriter() {
    const el = document.getElementById('typewriter-text');
    if (!el) return;

    const roles = [
        'Aspiring Data Scientist',
        'Web Developer',
        'Python Enthusiast',
        'Problem Solver',
        'Informatics Student'
    ];
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const TYPING_SPEED = 90;
    const DELETING_SPEED = 50;
    const PAUSE_AFTER = 2000;

    function type() {
        const current = roles[roleIndex];
        if (isDeleting) {
            el.textContent = current.substring(0, charIndex - 1);
            charIndex--;
        } else {
            el.textContent = current.substring(0, charIndex + 1);
            charIndex++;
        }

        if (!isDeleting && charIndex === current.length) {
            setTimeout(() => { isDeleting = true; type(); }, PAUSE_AFTER);
            return;
        }
        if (isDeleting && charIndex === 0) {
            isDeleting = false;
            roleIndex = (roleIndex + 1) % roles.length;
        }

        setTimeout(type, isDeleting ? DELETING_SPEED : TYPING_SPEED);
    }
    setTimeout(type, 500);
})();

// ========================================
// SKILL PROGRESS BARS (About Section)
// ========================================
(function initSkillBars() {
    const fills = document.querySelectorAll('.skill-bar-fill');
    if (!fills.length) return;

    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const fill = entry.target;
                const targetWidth = fill.getAttribute('data-width');
                fill.style.width = targetWidth + '%';
                observer.unobserve(fill);
            }
        });
    }, { threshold: 0.3 });

    fills.forEach(fill => observer.observe(fill));
})();

// ========================================
// PROJECT MODAL
// ========================================
(function initProjectModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close-btn');
    if (!modal) return;

    function openModal(card) {
        document.getElementById('modal-img').src = card.dataset.img || '';
        document.getElementById('modal-title').textContent = card.dataset.title || '';
        document.getElementById('modal-date').textContent = '📅 ' + (card.dataset.date || '');
        document.getElementById('modal-role').textContent = '🎯 Role: ' + (card.dataset.role || '');
        document.getElementById('modal-collaboration').textContent = card.dataset.collaboration ? '🤝 Collaboration: ' + card.dataset.collaboration : '';
        document.getElementById('modal-desc').textContent = card.dataset.desc || '';

        // Tags
        const tags = (card.dataset.tags || '').split(',').map(t => t.trim()).filter(Boolean);
        const tagsEl = document.getElementById('modal-tags');
        tagsEl.textContent = tags.join(' · ');

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Open modal on "View Details" button click
    document.querySelectorAll('.project-detail-btn').forEach(btn => {
        btn.addEventListener('click', function (e) {
            e.preventDefault();
            const card = btn.closest('.project-card');
            if (card) openModal(card);
        });
    });

    closeBtn.addEventListener('click', closeModal);

    // Close when clicking outside modal content
    modal.addEventListener('click', function (e) {
        if (e.target === modal) closeModal();
    });

    // Close with Escape key
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
    });
})();

// ========================================
// CERTIFICATE LIGHTBOX
// ========================================
(function initLightbox() {
    const lightbox = document.getElementById('cert-lightbox');
    const lbImg = document.getElementById('lightbox-img');
    const closeBtn = document.getElementById('lightbox-close-btn');
    if (!lightbox) return;

    function openLightbox(src, alt) {
        lbImg.src = src;
        lbImg.alt = alt || 'Certificate';
        lightbox.classList.add('open');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('open');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    }

    // Both certificate images and experience photos use the same lightbox
    document.querySelectorAll('.cert-lightbox-trigger, .exp-lightbox-trigger').forEach(img => {
        img.addEventListener('click', function () {
            openLightbox(this.dataset.src || this.src, this.alt);
        });
    });


    closeBtn.addEventListener('click', closeLightbox);
    lightbox.addEventListener('click', function (e) {
        if (e.target === lightbox) closeLightbox();
    });
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
    });
})();

document.addEventListener('DOMContentLoaded', function () {
    // ========================================
    // VARIABLES
    // ========================================
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const navbar = document.querySelector('.navbar');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const backToTopBtn = document.getElementById('back-to-top');
    const sections = document.querySelectorAll('section');

    // ========================================
    // DARK MODE TOGGLE
    // ========================================

    // Check for saved theme preference or default to 'light'
    const currentTheme = localStorage.getItem('theme') || 'light';

    // Apply saved theme on page load
    if (currentTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = '<i class="fas fa-sun text-xl"></i>';
    }

    // Toggle theme
    themeToggle.addEventListener('click', function () {
        body.classList.toggle('dark-mode');

        // Update icon
        if (body.classList.contains('dark-mode')) {
            themeToggle.innerHTML = '<i class="fas fa-sun text-xl"></i>';
            localStorage.setItem('theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon text-xl"></i>';
            localStorage.setItem('theme', 'light');
        }

        // Add animation
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'rotate(0deg)';
        }, 300);
    });

    // ========================================
    // MOBILE MENU TOGGLE
    // ========================================

    mobileMenuBtn.addEventListener('click', function () {
        mobileMenu.classList.toggle('hidden');

        // Toggle icon
        const icon = mobileMenuBtn.querySelector('i');
        if (mobileMenu.classList.contains('hidden')) {
            icon.classList.remove('fa-times');
            icon.classList.add('fa-bars');
        } else {
            icon.classList.remove('fa-bars');
            icon.classList.add('fa-times');
        }
    });

    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function () {
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        });
    });

    // ========================================
    // SMOOTH SCROLLING
    // ========================================

    navLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);

            if (targetSection) {
                const navbarHeight = navbar.offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // ========================================
    // ACTIVE NAV LINK ON SCROLL
    // ========================================

    function updateActiveNavLink() {
        let currentSection = '';
        const navbarHeight = navbar.offsetHeight;

        sections.forEach(section => {
            const sectionTop = section.offsetTop - navbarHeight - 100;
            const sectionBottom = sectionTop + section.offsetHeight;

            if (window.scrollY >= sectionTop && window.scrollY < sectionBottom) {
                currentSection = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }

    // ========================================
    // NAVBAR SCROLL EFFECT
    // ========================================

    function handleNavbarScroll() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }

    // ========================================
    // BACK TO TOP BUTTON
    // ========================================

    function handleBackToTop() {
        if (window.scrollY > 300) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }
    }

    backToTopBtn.addEventListener('click', function () {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    // ========================================
    // SCROLL ANIMATIONS
    // ========================================

    function handleScrollAnimations() {
        const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in, .slide-in-right');

        animatedElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const windowHeight = window.innerHeight;

            if (elementTop < windowHeight - 100) {
                element.classList.add('active');
            }
        });
    }

    // ========================================
    // SCROLL EVENT LISTENER
    // ========================================

    let scrollTimeout;
    window.addEventListener('scroll', function () {
        // Debounce scroll events for better performance
        if (scrollTimeout) {
            window.cancelAnimationFrame(scrollTimeout);
        }

        scrollTimeout = window.requestAnimationFrame(function () {
            handleNavbarScroll();
            handleBackToTop();
            updateActiveNavLink();
            handleScrollAnimations();
        });
    });

    // Initial calls
    handleNavbarScroll();
    handleBackToTop();
    updateActiveNavLink();
    handleScrollAnimations();

    // ========================================
    // TYPEWRITER EFFECT (Optional Enhancement)
    // ========================================

    function typewriterEffect(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }

        type();
    }

    // ========================================
    // DOWNLOAD CV ALERT
    // ========================================

    const downloadCvBtn = document.getElementById('download-cv');

    if (downloadCvBtn) {
        downloadCvBtn.addEventListener('click', function (e) {
            e.preventDefault();

            // Check if CV file exists (you'll need to update the path when you add the actual CV)
            // For now, show an alert
            alert('CV will be available soon! Please check back later or contact me directly via email.');

            // When you have the actual CV file, uncomment and modify this:
            // const cvPath = 'path/to/your/cv.pdf';
            // const link = document.createElement('a');
            // link.href = cvPath;
            // link.download = 'Fajar_Ilham_Suryawisesa_CV.pdf';
            // document.body.appendChild(link);
            // link.click();
            // document.body.removeChild(link);
        });
    }

    // ========================================
    // SKILL CARDS ANIMATION ON HOVER
    // ========================================

    const skillCards = document.querySelectorAll('.skill-card');

    skillCards.forEach(card => {
        card.addEventListener('mouseenter', function () {
            this.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
        });
    });

    // ========================================
    // PROJECT CARDS TILT EFFECT (Optional)
    // ========================================

    const projectCardsForTilt = document.querySelectorAll('.project-card');

    projectCardsForTilt.forEach(card => {
        card.addEventListener('mousemove', function (e) {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = (y - centerY) / 20;
            const rotateY = (centerX - x) / 20;

            card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-10px)`;
        });

        card.addEventListener('mouseleave', function () {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateY(0)';
        });
    });

    // ========================================
    // CERTIFICATE CARDS ANIMATION
    // ========================================

    const certificateCards = document.querySelectorAll('.certificate-card');

    certificateCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });

    // ========================================
    // INTERSECTION OBSERVER FOR BETTER PERFORMANCE
    // ========================================

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');

                // Optional: Unobserve after animation
                // observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all animated elements
    const observedElements = document.querySelectorAll('.fade-in-up, .certificate-card, .project-card, .skill-card');
    observedElements.forEach(element => {
        observer.observe(element);
    });

    // ========================================
    // PARALLAX EFFECT ON SCROLL (Disabled to fix overlap bug)
    // ========================================

    // Parallax effect disabled to prevent sections from overlapping
    // If you want parallax, use it only on background elements, not sections
    /*
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const parallaxElements = document.querySelectorAll('.hero-section, .profile-image-container');
        
        parallaxElements.forEach(element => {
            const speed = 0.5;
            element.style.transform = `translateY(${scrolled * speed}px)`;
        });
    });
    */

    // ========================================
    // CUSTOM CURSOR (Optional Enhancement)
    // ========================================

    // Uncomment if you want a custom cursor effect
    /*
    const cursor = document.createElement('div');
    cursor.classList.add('custom-cursor');
    document.body.appendChild(cursor);
    
    document.addEventListener('mousemove', function(e) {
        cursor.style.left = e.clientX + 'px';
        cursor.style.top = e.clientY + 'px';
    });
    
    const clickableElements = document.querySelectorAll('a, button, .nav-link');
    clickableElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            cursor.classList.add('cursor-hover');
        });
        element.addEventListener('mouseleave', function() {
            cursor.classList.remove('cursor-hover');
        });
    });
    */

    // ========================================
    // PRELOADER (Optional)
    // ========================================

    window.addEventListener('load', function () {
        // Hide preloader if you add one
        const preloader = document.querySelector('.preloader');
        if (preloader) {
            preloader.style.opacity = '0';
            setTimeout(() => {
                preloader.style.display = 'none';
            }, 500);
        }

        // Add loaded class to body for additional animations
        body.classList.add('loaded');
    });

    // ========================================
    // CONSOLE MESSAGE
    // ========================================

    console.log('%c👋 Hello Developer!', 'color: #076653; font-size: 20px; font-weight: bold;');
    console.log('%cInterested in the code? Check out my GitHub!', 'color: #E3EF26; font-size: 14px;');
    console.log('%chttps://github.com/fajarwisesa-maker', 'color: #076653; font-size: 14px;');

    // ========================================
    // DISABLE RIGHT CLICK (Optional - Remove if not needed)
    // ========================================

    // Uncomment if you want to disable right-click
    /*
    document.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        return false;
    });
    */

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================

    document.addEventListener('keydown', function (e) {
        // Press 'D' to toggle dark mode
        if (e.key === 'd' || e.key === 'D') {
            if (!e.target.matches('input, textarea')) {
                themeToggle.click();
            }
        }

        // Press 'Escape' to close mobile menu
        if (e.key === 'Escape') {
            if (!mobileMenu.classList.contains('hidden')) {
                mobileMenu.classList.add('hidden');
                const icon = mobileMenuBtn.querySelector('i');
                icon.classList.remove('fa-times');
                icon.classList.add('fa-bars');
            }
        }

        // Press 'Home' to scroll to top
        if (e.key === 'Home') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });

    // ========================================
    // SOCIAL LINKS ANALYTICS (Optional)
    // ========================================

    const socialLinks = document.querySelectorAll('.social-icon, .social-icon-large');

    socialLinks.forEach(link => {
        link.addEventListener('click', function (e) {
            const platform = this.querySelector('i').classList.contains('fa-github') ? 'GitHub' :
                this.querySelector('i').classList.contains('fa-envelope') ? 'Email' :
                    this.querySelector('i').classList.contains('fa-linkedin') ? 'LinkedIn' : 'Unknown';

            console.log(`Social link clicked: ${platform}`);

            // You can add analytics tracking here
            // Example: gtag('event', 'click', { 'event_category': 'Social', 'event_label': platform });
        });
    });

    // ========================================
    // PERFORMANCE MONITORING
    // ========================================

    // Log page load time
    window.addEventListener('load', function () {
        const loadTime = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
        console.log(`%cPage loaded in ${loadTime}ms`, 'color: #076653; font-weight: bold;');
    });

    // ========================================
    // PROJECT FILTERING
    // ========================================

    const filterBtns = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const filterValue = this.getAttribute('data-filter');

            // Update active button
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            // Filter projects
            projectCards.forEach(card => {
                if (filterValue === 'all') {
                    card.style.display = 'block';
                    setTimeout(() => card.classList.add('active'), 10);
                } else if (card.getAttribute('data-category') === filterValue) {
                    card.style.display = 'block';
                    setTimeout(() => card.classList.add('active'), 10);
                } else {
                    card.style.display = 'none';
                    card.classList.remove('active');
                }
            });
        });
    });

    // ========================================
    // TOAST NOTIFICATION
    // ========================================

    function showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? '#22c55e' : '#ef4444'};
            color: white;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            animation: slideInUp 0.3s ease;
            z-index: 1000;
            font-weight: 500;
            font-size: 0.875rem;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOutDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // ========================================
    // CONTACT FORM VALIDATION & SUBMISSION
    // ========================================

    const contactForm = document.getElementById('contact-form');

    if (contactForm) {
        const formInputs = contactForm.querySelectorAll('input[required], textarea[required], select[required]');

        // Real-time validation
        formInputs.forEach(input => {
            input.addEventListener('blur', function () {
                validateField(this);
            });

            input.addEventListener('input', function () {
                if (this.classList.contains('error')) {
                    validateField(this);
                }
            });
        });

        // Form submission
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Validate all fields
            let isValid = true;
            formInputs.forEach(input => {
                if (!validateField(input)) {
                    isValid = false;
                }
            });

            if (isValid) {
                // Get form data
                const formData = new FormData(contactForm);
                const name = formData.get('name');
                const email = formData.get('email');
                const subject = formData.get('subject');
                const message = formData.get('message');

                // For now, show success message (replace with actual form submission)
                const successDiv = document.getElementById('form-success');
                successDiv.classList.remove('hidden');
                contactForm.style.opacity = '0.6';
                contactForm.style.pointerEvents = 'none';

                // Log to console (for development)
                console.log('Form Data:', { name, email, subject, message });

                // Reset form after 2 seconds
                setTimeout(() => {
                    contactForm.reset();
                    successDiv.classList.add('hidden');
                    contactForm.style.opacity = '1';
                    contactForm.style.pointerEvents = 'auto';
                }, 2000);

                // Show toast
                showToast('Thank you! Your message has been sent.');

                /* Uncomment this block when you have a backend/Formspree endpoint
                // Submit to Formspree
                fetch('https://formspree.io/f/YOUR_FORM_ID', {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ name, email, subject, message })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.ok) {
                        const successDiv = document.getElementById('form-success');
                        successDiv.classList.remove('hidden');
                        contactForm.reset();
                        showToast('Thank you! Your message has been sent.');
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    showToast('Error sending message. Please try again.', 'error');
                });
                */
            }
        });
    }

    function validateField(field) {
        const value = field.value.trim();
        const errorEl = document.getElementById(`${field.id}-error`);
        let isValid = true;
        let errorMsg = '';

        if (field.hasAttribute('required') && !value) {
            isValid = false;
            errorMsg = 'This field is required';
        } else if (field.type === 'email' && value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(value)) {
                isValid = false;
                errorMsg = 'Please enter a valid email address';
            }
        }

        field.classList.toggle('error', !isValid);
        if (errorEl) {
            errorEl.textContent = errorMsg;
            errorEl.classList.toggle('hidden', isValid);
        }

        return isValid;
    }

    // ========================================
    // CV DOWNLOAD HANDLERS
    // ========================================

    const heroDownloadCv = document.getElementById('hero-download-cv');
    const contactDownloadCv = document.getElementById('contact-download-cv');

    function handleCVDownload(e) {
        e.preventDefault();

        // CV path
        const cvPath = 'CV - Fajar Ilham Surya Wisesa.pdf';

        try {
            const link = document.createElement('a');
            link.href = cvPath;
            link.download = 'CV - Fajar Ilham Surya Wisesa.pdf';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            showToast('CV downloaded successfully!');
        } catch (error) {
            console.error('Error downloading CV:', error);
            showToast('CV will be available soon. Please contact me via email.', 'error');
        }
    }

    if (heroDownloadCv) {
        heroDownloadCv.addEventListener('click', handleCVDownload);
    }

    if (contactDownloadCv) {
        contactDownloadCv.addEventListener('click', handleCVDownload);
    }

    // ========================================
    // END OF SCRIPT
    // ========================================

    console.log('%c✅ Portfolio website initialized successfully!', 'color: #076653; font-size: 16px; font-weight: bold;');
});

// ========================================
// UTILITY FUNCTIONS
// ========================================

// Debounce function for performance optimization
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function for scroll events
function throttle(func, limit) {
    let inThrottle;
    return function () {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Check if element is in viewport
function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}
