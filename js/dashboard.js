// Testimonial Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    initializeTestimonials();
    setupVideoPlayers();
});

// Initialize testimonials page
function initializeTestimonials() {
    setupEventListeners();
    animateOnScroll();
    loadTestimonialStats();
}

// Setup video players
function setupVideoPlayers() {
    const videos = document.querySelectorAll('.video-container video');
    
    videos.forEach(video => {
        // Add poster/thumbnail if not set
        if (!video.poster) {
            const videoCard = video.closest('.video-card');
            if (videoCard) {
                const title = videoCard.querySelector('h3')?.textContent || 'video';
                // Set default poster
                video.poster = 'images/video-thumbnail.jpg';
            }
        }
        
        // Handle video play tracking
        video.addEventListener('play', function() {
            const videoTitle = this.closest('.video-card')?.querySelector('h3')?.textContent || 'Unknown';
            trackVideoPlay(videoTitle);
            
            // Pause other videos when this one plays
            videos.forEach(otherVideo => {
                if (otherVideo !== video && !otherVideo.paused) {
                    otherVideo.pause();
                }
            });
        });
        
        // Add error handling
        video.addEventListener('error', function() {
            console.warn('Video failed to load');
            const container = this.closest('.video-container');
            if (container) {
                container.innerHTML += '<div class="video-error">Video tidak dapat dimuat</div>';
            }
        });
    });
}

// Setup event listeners for interactive elements
function setupEventListeners() {
    // Video card hover effects
    const videoCards = document.querySelectorAll('.video-card');
    videoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
        
        card.addEventListener('click', function(e) {
            // Don't trigger if clicking on video controls
            if (!e.target.closest('video')) {
                const video = this.querySelector('video');
                if (video) {
                    if (video.paused) {
                        video.play();
                    } else {
                        video.pause();
                    }
                }
            }
        });
    });

    // Photo card hover effects
    const photoCards = document.querySelectorAll('.photo-card');
    photoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.cursor = 'pointer';
        });
    });
}

// Animate elements on scroll
function animateOnScroll() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                
                // Animate stats if they become visible
                if (entry.target.classList.contains('stat-item')) {
                    animateStats(entry.target);
                }
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    });

    // Observe all cards
    const cards = document.querySelectorAll('.video-card, .photo-card, .stat-item, .section-header');
    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
}

// Animate statistics numbers
function animateStats(statElement) {
    const numberElement = statElement.querySelector('.stat-number');
    if (!numberElement) return;
    
    const targetNumber = parseInt(numberElement.textContent.replace(/[^0-9]/g, ''));
    if (isNaN(targetNumber)) return;
    
    let currentNumber = 0;
    const duration = 2000; // 2 seconds
    const steps = 60;
    const increment = targetNumber / steps;
    let step = 0;
    
    const timer = setInterval(() => {
        step++;
        currentNumber = Math.min(Math.floor(increment * step), targetNumber);
        
        if (numberElement.textContent.includes('.')) {
            // Handle decimal numbers like 4.9
            const decimal = (targetNumber % 1).toFixed(1);
            numberElement.textContent = currentNumber + decimal.substring(1);
        } else if (numberElement.textContent.includes('/')) {
            // Handle ratings like 4.9/5
            const rating = (currentNumber / steps * 5).toFixed(1);
            numberElement.textContent = rating + '/5';
        } else {
            // Handle regular numbers
            numberElement.textContent = currentNumber + '+';
        }
        
        if (step >= steps) {
            clearInterval(timer);
        }
    }, duration / steps);
}

// Load testimonial statistics
function loadTestimonialStats() {
    // In a real app, this would fetch from an API
    // For now, we'll use static data
    
    const stats = {
        totalCustomers: 5234,
        averageRating: 4.9,
        naturalProducts: 100,
        supportHours: '24/7'
    };
    
    // Update stats if needed dynamically
}

// Track video play (for analytics)
function trackVideoPlay(videoTitle) {
    const playHistory = storage.get('videoPlayHistory', []);
    playHistory.push({
        video: videoTitle,
        timestamp: new Date().toISOString()
    });
    storage.set('videoPlayHistory', playHistory);
    
    console.log(`Video played: ${videoTitle}`);
}

// Add smooth scroll behavior
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Add CSS for animations if needed
const testimonialStyles = document.createElement('style');
testimonialStyles.textContent = `
    .video-card,
    .photo-card,
    .stat-item {
        transition: all 0.3s ease;
    }
    
    .video-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }
    
    .photo-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 8px 16px rgba(0,0,0,0.15);
    }
    
    /* Smooth transitions for all interactive elements */
    .video-container {
        transition: filter 0.3s ease;
    }
    
    .video-card:hover .video-container {
        filter: brightness(1.05);
    }
    
    .photo-wrapper img {
        transition: transform 0.3s ease;
    }
    
    .photo-card:hover .photo-wrapper img {
        transform: scale(1.05);
    }
    
    /* Video error message */
    .video-error {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 10px 20px;
        border-radius: 4px;
        font-size: 14px;
    }
    
    /* Counter animation */
    .stat-number {
        animation: countUp 1s ease-in-out;
        display: inline-block;
    }
    
    @keyframes countUp {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    /* Loading state for videos */
    .video-container.loading::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1;
    }
    
    .video-container.loading::after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #4caf50;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        z-index: 2;
    }
    
    @keyframes spin {
        0% { transform: translate(-50%, -50%) rotate(0deg); }
        100% { transform: translate(-50%, -50%) rotate(360deg); }
    }
`;
document.head.appendChild(testimonialStyles);
