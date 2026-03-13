import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DRACOLoader } from 'three/addons/loaders/DRACOLoader.js';

// ─── Hero Entrance Animations ─────────────────────────────────────────────
const heroTl = gsap.timeline();

heroTl.from('.hero-title', {
    opacity: 0,
    y: 50,
    duration: 1.2,
    ease: "power4.out"
})
    .from('.hero-subtitle', {
        opacity: 0,
        y: 30,
        duration: 1,
        ease: "power4.out"
    }, "-=0.9")
    .from('.hero-cards', {
        opacity: 0,
        y: 30,
        duration: 1.2,
        ease: "power4.out"
    }, "-=1");

// ─── "Why" Section 3D Model ───────────────────────────────────────────────
const whyContainer = document.getElementById('why-3d');

if (whyContainer) {
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, whyContainer.clientWidth / whyContainer.clientHeight, 0.1, 1000);
    camera.position.set(0, 3, 12);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(whyContainer.clientWidth, whyContainer.clientHeight);
    whyContainer.appendChild(renderer.domElement);

    // Lighting
    scene.add(new THREE.AmbientLight(0xffffff, 1.2));
    const keyLight = new THREE.DirectionalLight(0xffffff, 2);
    keyLight.position.set(10, 15, 10);
    scene.add(keyLight);
    const fillLight = new THREE.DirectionalLight(0x0D9488, 1);
    fillLight.position.set(-10, 5, -10);
    scene.add(fillLight);

    // Load Model
    const dracoLoader = new DRACOLoader();
    dracoLoader.setDecoderPath('https://unpkg.com/three@0.160.0/examples/jsm/libs/draco/');
    const loader = new GLTFLoader();
    loader.setDRACOLoader(dracoLoader);

    let model;
    loader.load(`model.glb?v=${Date.now()}`, (gltf) => {
        model = gltf.scene;

        // Compute bounding box and center the model
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());

        // Center the model on all axes
        model.position.sub(center);

        scene.add(model);

        // Auto-fit camera to model size
        const maxDim = Math.max(size.x, size.y, size.z);
        const fov = camera.fov * (Math.PI / 180);
        const camDist = (maxDim / 2) / Math.tan(fov / 2) * 1.2;
        camera.position.set(0, 0, camDist);
        camera.lookAt(0, 0, 0);
    });

    // Resize handler
    window.addEventListener('resize', () => {
        camera.aspect = whyContainer.clientWidth / whyContainer.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(whyContainer.clientWidth, whyContainer.clientHeight);
    });

    // Animate
    (function animate() {
        requestAnimationFrame(animate);
        if (model) model.rotation.y += 0.0012;
        renderer.render(scene, camera);
    })();
}

// ──────────────────────────────────────────────────────────────────────────
// ─── Lenis Smooth Scroll ───────────────────────────────────────────────────
const lenis = new Lenis({
    duration: 1.2,
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true
});

// Sync ScrollTrigger with Lenis
lenis.on('scroll', ScrollTrigger.update);

gsap.ticker.add((time) => {
    lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);

// Scroll Scrub for Hero Video
gsap.to('.hero-bg-video', {
    scale: 1.2,
    y: '10%',
    scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: 'bottom top',
        scrub: true
    }
});

// ─── Interactive Vision Section ───────────────────────────────────────────
const visionSection = document.querySelector('.vision-section');
const visionBody = document.querySelector('.vision-body');
const visionVideo = document.querySelector('#vision-bg-video');
const visionVideoSource = visionVideo.querySelector('source');
const sidebarItems = document.querySelectorAll('.vision-sidebar-item');

const visionPhases = [
    {
        eyebrow: "OUR VISION",
        heading: "Pioneering the Malaysian Skylines.",
        desc: "Blue Ocean International isn't just about building structures; we build icons. With a fusion of international expertise and local Malaysian heritage, we deliver engineering marvels that push the boundaries of what's possible.",
        video: "videos/v1.mp4"
    },
    {
        eyebrow: "COMMUNITY",
        heading: "Building Together, Growing Together.",
        desc: "Our commitment extends beyond concrete and steel. We create spaces that foster community growth, ensuring that every project contributes positively to the lives of Malaysians and the environment.",
        video: "videos/v3.mp4"
    },
    {
        eyebrow: "INNOVATION",
        heading: "Engineering the Impossible.",
        desc: "From advanced BIM modeling to sustainable construction techniques, innovation is in our DNA. We leverage cutting-edge technology to solve the most complex engineering challenges.",
        video: "videos/v4.mp4"
    },
    {
        eyebrow: "SAFETY",
        heading: "Our Zero-Compromise Commitment.",
        desc: "Safety isn't just a policy; it's our core value. We maintain the highest international standards to ensure every worker returns home safely, every single day.",
        video: "videos/v5.mp4"
    },
    {
        eyebrow: "EXCELLENCE",
        heading: "Standard Above the Rest.",
        desc: "Excellence is the result of intention, effort, and skillful execution. At Blue Ocean, we never settle for 'good enough' — we strive for perfection in every detail.",
        video: "videos/v6.mp4"
    }
];

let lastPhaseIndex = 0;

if (visionSection && visionBody) {
    console.log("Vision Scroller: Initializing Pillar Experience...");

    // Create ScrollTrigger for pinning
    const visionST = ScrollTrigger.create({
        trigger: ".vision-section",
        start: "top top",
        end: () => `+=${window.innerHeight * 4}`, // Exactly 4 viewport heights for 5 phases
        pin: ".vision-outer",
        scrub: 1, // Smoother scrub
        markers: false,
        onUpdate: (self) => {
            const progress = self.progress;
            const phaseIndex = Math.min(
                Math.floor(progress * visionPhases.length),
                visionPhases.length - 1
            );

            if (phaseIndex !== lastPhaseIndex) {
                console.log("Switching to Vision Phase:", phaseIndex);
                updateVisionPhase(phaseIndex);
                lastPhaseIndex = phaseIndex;
            }
        }
    });

    function updateVisionPhase(index) {
        const phase = visionPhases[index];

        // 1. Fade out current content
        visionBody.style.opacity = 0;
        visionBody.style.transform = "translateY(-20px)";

        // 2. Update sidebar
        sidebarItems.forEach((item, i) => {
            if (i === index) item.classList.add('active');
            else item.classList.remove('active');
        });

        setTimeout(() => {
            // 3. Update text content
            document.getElementById('vision-eyebrow').innerText = phase.eyebrow;
            document.getElementById('vision-heading').innerText = phase.heading;
            document.getElementById('vision-desc').innerText = phase.desc;

            // 4. Update Video
            if (visionVideoSource.src.indexOf(phase.video) === -1) {
                visionVideo.style.opacity = 0.4;
                visionVideoSource.src = phase.video;
                visionVideo.load();
                visionVideo.play().catch(e => console.warn("Video play interrupted", e));

                setTimeout(() => {
                    visionVideo.style.opacity = 1;
                }, 300);
            }

            // 5. Fade in new content
            visionBody.style.opacity = 1;
            visionBody.style.transform = "translateY(0)";
        }, 400);
    }
} else {
    console.error("Vision section or body not found in DOM.");
}

// Navbar change on scroll
ScrollTrigger.create({
    start: 'top -80',
    onUpdate: (self) => {
        if (self.direction === 1) {
            gsap.to('.glass-nav', { y: '-100%', duration: 0.3 });
        } else {
            gsap.to('.glass-nav', { y: '0%', duration: 0.3 });
        }
    }
});

// Section Revelations
const reveals = [
    { class: '.reveal-up', y: 60, x: 0 },
    { class: '.reveal-left', y: 0, x: -60 },
    { class: '.reveal-right', y: 0, x: 60 }
];

reveals.forEach(reveal => {
    document.querySelectorAll(reveal.class).forEach(el => {
        gsap.from(el, {
            opacity: 0,
            y: reveal.y,
            x: reveal.x,
            duration: 1.2,
            ease: "power3.out",
            scrollTrigger: {
                trigger: el,
                start: 'top 85%',
                toggleActions: "play none none reverse"
            }
        });
    });
});

// ─── Horizontal Projects Scroller ──────────────────────────────────────────
const projectsSection = document.querySelector('.projects-scroller');
const projectsTrack = document.querySelector('.projects-track');

if (projectsSection && projectsTrack) {
    // Calculate how much we need to scroll horizontally
    // (Total width of track - width of the viewport)
    const getScrollAmount = () => {
        let trackWidth = projectsTrack.offsetWidth;
        return -(trackWidth - window.innerWidth);
    };

    gsap.to(projectsTrack, {
        x: getScrollAmount,
        ease: "none",
        scrollTrigger: {
            trigger: projectsSection,
            start: "top top",
            end: () => `+=${projectsTrack.offsetWidth}`,
            pin: true,
            scrub: 1,
            invalidateOnRefresh: true,
            // markers: true // Uncomment to debug
        }
    });
}

// Stat Number Counter
const stats = document.querySelectorAll('.stat-number');
stats.forEach(stat => {
    const target = +stat.getAttribute('data-target');
    gsap.to(stat, {
        innerText: target,
        duration: 2,
        snap: { innerText: 1 },
        scrollTrigger: {
            trigger: stat,
            start: 'top 85%',
        }
    });
});

// CTA Scale Scroll
gsap.from('.reveal-scale', {
    scale: 0.8,
    opacity: 0,
    duration: 1.5,
    scrollTrigger: {
        trigger: '.cta-section',
        start: 'top 80%',
    }
});

// Mobile Drawer Toggle
const mobileToggle = document.querySelector('.mobile-toggle');
const navWrapper = document.querySelector('.nav-wrapper');
const allNavLinks = document.querySelectorAll('.nav-links a, .nav-links-mobile a');

if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
        navWrapper.classList.toggle('active');
    });
}

// Hero Card Slider Logic
const heroCards = document.querySelectorAll('.hero-card');
const heroDots = document.querySelectorAll('.hero-cards .dot');
let currentHeroCard = 0;

function showNextHeroCard() {
    heroCards[currentHeroCard].classList.remove('active');
    heroDots[currentHeroCard].classList.remove('active');

    currentHeroCard = (currentHeroCard + 1) % heroCards.length;

    heroCards[currentHeroCard].classList.add('active');
    heroDots[currentHeroCard].classList.add('active');
}

if (heroCards.length > 0) {
    setInterval(showNextHeroCard, 4000); // 4 seconds
}

// Close drawer when any nav link is clicked
allNavLinks.forEach(link => {
    link.addEventListener('click', () => {
        navWrapper.classList.remove('active');
    });
});

// Darken nav on scroll
window.addEventListener('scroll', () => {
    const nav = document.querySelector('.glass-nav');
    if (window.scrollY > 60) {
        nav.classList.add('scrolled');
    } else {
        nav.classList.remove('scrolled');
    }
});
