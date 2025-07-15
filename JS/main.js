// Navbar scroll functionality
let lastScrollTop = 0;
const navbar = document.querySelector('.navbar');
const collapse = document.querySelector('.collapse');

window.addEventListener('scroll', () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    if (collapse.classList.contains('show')) {
        return;
    }
    
    if (scrollTop > lastScrollTop && scrollTop > 100) {
        navbar.classList.add('hide-navbar');
        navbar.classList.remove('show-navbar');
    } else {
        navbar.classList.remove('hide-navbar');
        navbar.classList.add('show-navbar');
    }
    
    lastScrollTop = scrollTop;
});

const toggler = document.querySelector('.custom-toggler');
const navLinks = document.querySelectorAll('.nav-link');

function toggleNavbar() {
    toggler.classList.toggle('open');
    collapse.classList.toggle('show');
}

toggler.addEventListener('click', toggleNavbar);

// Set active nav-link on click
navLinks.forEach(link => {
    link.addEventListener('click', function() {
        navbarClicked = true;
        
        navLinks.forEach(l => l.classList.remove('active'));
        this.classList.add('active');
        if (window.innerWidth < 992) {
            toggler.classList.remove('open');
            collapse.classList.remove('show');
        }
        
        setTimeout(() => {
            navbarClicked = false;
        }, 2000);
    });
});

// Scroll-based navbar highlighting
function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const scrollPos = window.scrollY + 100; // Offset for navbar height

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');
        const correspondingNavLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => link.classList.remove('active'));
            if (correspondingNavLink) {
                correspondingNavLink.classList.add('active');
            }
        }
    });
}

// Add scroll event listener
window.addEventListener('scroll', updateActiveNavLink);

// Mobile auto-scroll from home to about us (downward only)
let isAutoScrolling = false;
let lastScrollY = 0;
let wasInHeader = false;
let navbarClicked = false;

function handleMobileAutoScroll() {
    // Only apply on mobile devices
    if (window.innerWidth >= 992) return;
    
    // Don't auto-scroll if navbar was recently clicked
    if (navbarClicked) return;
    
    const currentScrollY = window.scrollY;
    const headerSection = document.getElementById('header');
    const aboutSection = document.getElementById('aboutus');
    
    if (!headerSection || !aboutSection) return;
    
    const headerTop = headerSection.offsetTop;
    const headerHeight = headerSection.offsetHeight;
    const headerBottom = headerTop + headerHeight;
    
    const isInHeader = currentScrollY >= headerTop && currentScrollY < headerBottom;
    if (isInHeader && !wasInHeader) {
        wasInHeader = true;
    }
    if (!isInHeader) {
        wasInHeader = false;
    }
    if (currentScrollY > lastScrollY &&
        wasInHeader && 
        currentScrollY > headerTop && 
        currentScrollY < headerBottom && 
        !isAutoScrolling) {
        
        isAutoScrolling = true;
        
        aboutSection.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
        
        setTimeout(() => {
            isAutoScrolling = false;
        }, 1000);
    }
    
    lastScrollY = currentScrollY;
}

// Add mobile auto-scroll event listener
window.addEventListener('scroll', handleMobileAutoScroll);

document.addEventListener('click', (e) => {
    if (window.innerWidth < 992) {
        if (!collapse.contains(e.target) && !toggler.contains(e.target)) {
            toggler.classList.remove('open');
            collapse.classList.remove('show');
        }
    }
});

// Gallery Modal
class GalleryModal {
    constructor() {
        this.modal = document.getElementById('imageModal');
        this.track = document.querySelector('.gallery-track');
        this.prevBtn = document.querySelector('.gallery-prev');
        this.nextBtn = document.querySelector('.gallery-next');
        this.counter = document.querySelector('.gallery-counter');
        this.dotsContainer = document.querySelector('.gallery-dots-container');
        this.currentIndex = 0;
        this.images = [];
        this.currentGallery = '';
        this._historyPushed = false; // Track if we pushed state
        this.init();
    }
    init() {
        document.querySelectorAll('.interior-category-card').forEach(container => {
            container.addEventListener('click', (e) => this.openGallery(e));
        });
        this.prevBtn.addEventListener('click', () => this.prevImage());
        this.nextBtn.addEventListener('click', () => this.nextImage());
        document.addEventListener('keydown', (e) => this.handleKeyboard(e));
        this.initTouchSupport();
        this.modal.addEventListener('hidden.bs.modal', () => this.resetGallery());
    }
    openGallery(e) {
        const container = e.currentTarget;
        const gallery = container.dataset.gallery;
        this.currentGallery = gallery;
        this.currentIndex = 0;
        
        // Get all images for this gallery from the hidden image containers only
        const allGalleryImages = Array.from(document.querySelectorAll(`[data-gallery="${gallery}"][data-index]`));
        this.images = allGalleryImages.map(el => {
            const img = el.querySelector('img');
            return { src: img.src, alt: img.alt };
        });
        
        const modalTitle = document.getElementById('imageModalLabel');
        modalTitle.textContent = gallery.charAt(0).toUpperCase() + gallery.slice(1);
        this.buildGallery();
        const modal = new bootstrap.Modal(this.modal);
        modal.show();
        this.goToImage(0);
        // --- Push history state for modal ---
        if (!this._historyPushed) {
            history.pushState({ modalOpen: true }, '');
            this._historyPushed = true;
        }
    }
    buildGallery() {
        this.track.innerHTML = '';
        this.images.forEach((image, index) => {
            const slide = document.createElement('div');
            slide.className = 'gallery-slide';
            slide.innerHTML = `<img src="${image.src}" alt="${image.alt}">`;
            this.track.appendChild(slide);
        });
        this.renderDots();
        this.updateCounter();
    }
    goToImage(index) {
        this.currentIndex = index;
        const translateX = -index * 100;
        this.track.style.transform = `translateX(${translateX}%)`;
        this.updateCounter();
        this.updateNavButtons();
        this.updateDots();
    }
    prevImage() {
        if (this.images.length === 0) return;
        if (this.currentIndex > 0) {
            this.goToImage(this.currentIndex - 1);
        } else {
            this.goToImage(this.images.length - 1);
        }
    }
    nextImage() {
        if (this.images.length === 0) return;
        if (this.currentIndex < this.images.length - 1) {
            this.goToImage(this.currentIndex + 1);
        } else {
            this.goToImage(0);
        }
    }
    updateCounter() {
        const currentSpan = this.counter.querySelector('.current-image');
        const totalSpan = this.counter.querySelector('.total-images');
        currentSpan.textContent = this.currentIndex + 1;
        totalSpan.textContent = this.images.length;
    }
    updateNavButtons() {
        this.prevBtn.style.opacity = this.currentIndex === 0 ? '0.5' : '1';
        this.nextBtn.style.opacity = this.currentIndex === this.images.length - 1 ? '0.5' : '1';
    }
    handleKeyboard(e) {
        if (!this.modal.classList.contains('show')) return;
        switch(e.key) {
            case 'ArrowLeft': e.preventDefault(); this.prevImage(); break;
            case 'ArrowRight': e.preventDefault(); this.nextImage(); break;
            case 'Escape': bootstrap.Modal.getInstance(this.modal).hide(); break;
        }
    }
    initTouchSupport() {
        let startX = 0, currentX = 0, isDragging = false;
        this.track.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; isDragging = true; });
        this.track.addEventListener('touchmove', (e) => { if (!isDragging) return; currentX = e.touches[0].clientX; if (Math.abs(startX - currentX) > 10) e.preventDefault(); });
        this.track.addEventListener('touchend', (e) => { if (!isDragging) return; const diff = startX - currentX; const threshold = 50; if (Math.abs(diff) > threshold) { if (diff > 0) this.nextImage(); else this.prevImage(); } isDragging = false; });
    }
    resetGallery() {
        this.currentIndex = 0;
        this.images = [];
        this.track.style.transform = 'translateX(0)';
        // --- Go back in history if modal state was pushed ---
        if (this._historyPushed) {
            this._historyPushed = false;
            // Only go back if the current history state is modalOpen
            if (history.state && history.state.modalOpen) {
                history.back();
            }
        }
    }
    renderDots() {
        if (!this.dotsContainer) return;
        this.dotsContainer.innerHTML = '';
        this.dots = [];
        for (let i = 0; i < this.images.length; i++) {
            const dot = document.createElement('span');
            dot.className = 'gallery-dot' + (i === this.currentIndex ? ' active' : '');
            dot.addEventListener('click', (e) => {
                e.stopPropagation();
                this.goToImage(i);
            });
            this.dotsContainer.appendChild(dot);
            this.dots.push(dot);
        }
    }
    updateDots() {
        if (!this.dots) return;
        this.dots.forEach((dot, i) => {
            if (i === this.currentIndex) dot.classList.add('active');
            else dot.classList.remove('active');
        });
    }
}

// Smooth Scrolling for NavBar
function initSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const targetPosition = target.offsetTop;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    const galleryModalInstance = new GalleryModal();
    initSmoothScrolling();
    
    // Scroll to top functionality
    const scrollToTopBtn = document.getElementById('scrollToTop');
    
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });
    
    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    // --- Listen for popstate to close modal on back button ---
    window.addEventListener('popstate', function (event) {
        const modal = document.getElementById('imageModal');
        if (modal && modal.classList.contains('show')) {
            // Close the modal if open
            const modalInstance = bootstrap.Modal.getInstance(modal);
            if (modalInstance) {
                modalInstance.hide();
            }
        }
    });
});