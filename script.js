/**
 * ISA MAULANA TANTRA — Full-Stack Developer & GovTech Architect
 * Interactive Portfolio Engine inspired by Dreamframe 3D Spatial Architecture
 */

document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initHeroCanvas();
  initBentoInteractions();
  initPortfolioFilter();
  initDeveloperPlayground();
  initContactForm();
});

/* ==========================================================================
   1. NAVBAR & NAVIGATION
   ========================================================================== */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const mobileToggle = document.getElementById('mobile-toggle');
  const mobileMenu = document.getElementById('mobile-menu');

  // Sticky navbar shadow & blur trigger
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // Mobile drawer menu toggle
  if (mobileToggle && mobileMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileMenu.classList.toggle('open');
      const icon = mobileToggle.querySelector('i');
      if (mobileMenu.classList.contains('open')) {
        icon.className = 'fa-solid fa-xmark';
      } else {
        icon.className = 'fa-solid fa-bars';
      }
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.remove('open');
        mobileToggle.querySelector('i').className = 'fa-solid fa-bars';
      });
    });
  }

  // Dynamic Scroll Spy for active section link
  const sections = Array.from(document.querySelectorAll('section[id]'));
  const desktopNavLinks = Array.from(document.querySelectorAll('.nav-link'));
  const mobileNavLinks = Array.from(document.querySelectorAll('.mobile-link'));

  function updateActiveNavLink() {
    const scrollPos = window.scrollY + 180;
    let currentId = 'hero';

    for (let i = sections.length - 1; i >= 0; i--) {
      const section = sections[i];
      if (section.offsetTop <= scrollPos) {
        currentId = section.getAttribute('id');
        break;
      }
    }

    // Bottom edge case: activate contact when scrolled near the end
    if ((window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 70)) {
      currentId = 'contact';
    }

    desktopNavLinks.forEach(link => {
      const targetId = link.getAttribute('href')?.replace('#', '');
      if (targetId === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    mobileNavLinks.forEach(link => {
      const targetId = link.getAttribute('href')?.replace('#', '');
      if (targetId === currentId) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  window.addEventListener('scroll', updateActiveNavLink, { passive: true });
  window.addEventListener('resize', updateActiveNavLink, { passive: true });
  updateActiveNavLink();
}

/* ==========================================================================
   2. HERO NEURAL BACKGROUND CANVAS (Cinematic Particle / Nebula Field)
   ========================================================================== */
function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width, height;
  let particles = [];
  let mouse = { x: window.innerWidth * 0.7, y: window.innerHeight * 0.4, targetX: 0, targetY: 0 };

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  window.addEventListener('mousemove', (e) => {
    mouse.targetX = e.clientX;
    mouse.targetY = e.clientY;
  });

  // Particle constellation
  const PARTICLE_COUNT = Math.min(window.innerWidth < 768 ? 40 : 80, 95);
  for (let i = 0; i < PARTICLE_COUNT; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.6,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      alpha: Math.random() * 0.6 + 0.2,
      baseColor: i % 3 === 0 ? '168, 85, 247' : i % 3 === 1 ? '249, 115, 22' : '6, 182, 212'
    });
  }

  // Preload local scroll sequence frames from assets/frames/
  const TOTAL_FRAMES = 60;
  const frameImages = [];
  let targetFrame = 0;
  let currentFrame = 0;

  for (let i = 1; i <= TOTAL_FRAMES; i++) {
    const img = new Image();
    const pad = String(i).padStart(3, '0');
    img.src = `assets/frames/frame-${pad}.png`;
    frameImages.push(img);
  }

  window.addEventListener('scroll', () => {
    const scrollMax = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    const progress = Math.max(0, Math.min(1, window.scrollY / (scrollMax * 0.5)));
    targetFrame = Math.min(TOTAL_FRAMES - 1, Math.floor(progress * TOTAL_FRAMES));
  });

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Smooth frame lerp & render cover
    currentFrame += (targetFrame - currentFrame) * 0.12;
    const frameIdx = Math.min(TOTAL_FRAMES - 1, Math.max(0, Math.floor(currentFrame)));
    const frameImg = frameImages[frameIdx];

    if (frameImg && frameImg.complete && frameImg.naturalWidth > 0) {
      ctx.save();
      ctx.globalAlpha = 0.75;
      const hRatio = width / frameImg.width;
      const vRatio = height / frameImg.height;
      const ratio = Math.max(hRatio, vRatio);
      const shiftX = (width - frameImg.width * ratio) / 2;
      const shiftY = (height - frameImg.height * ratio) / 2;
      ctx.drawImage(frameImg, 0, 0, frameImg.width, frameImg.height, shiftX, shiftY, frameImg.width * ratio, frameImg.height * ratio);
      ctx.restore();
    }

    // Smooth mouse lerp
    mouse.x += (mouse.targetX - mouse.x) * 0.05;
    mouse.y += (mouse.targetY - mouse.y) * 0.05;

    // Atmospheric cosmic glow centered on right-middle
    const glowX = width * 0.65 + (mouse.x - width * 0.5) * 0.1;
    const glowY = height * 0.38 + (mouse.y - height * 0.5) * 0.1;
    const gradient = ctx.createRadialGradient(glowX, glowY, 40, glowX, glowY, width * 0.55);
    gradient.addColorStop(0, 'rgba(147, 51, 234, 0.16)');
    gradient.addColorStop(0.35, 'rgba(236, 72, 153, 0.08)');
    gradient.addColorStop(0.65, 'rgba(6, 182, 212, 0.04)');
    gradient.addColorStop(1, 'rgba(7, 7, 11, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw and connect particles
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.baseColor}, ${p.alpha})`;
      ctx.fill();

      // Connect near particles
      for (let j = i + 1; j < particles.length; j++) {
        const p2 = particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.15 * (1 - dist / 130)})`;
          ctx.lineWidth = 0.7;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(render);
  }
  render();
}

/* ==========================================================================
   3. BENTO GRID INTERACTIVE CONTROLS
   ========================================================================== */
function initBentoInteractions() {
  const chips = document.querySelectorAll('.chip');
  const codeContent = document.getElementById('bento-code-content');

  const snippets = {
    clean: `// Clean Architecture / Domain Driven Service
namespace App\\Services\\Domain;

class CoreTransactionService {
    public function __construct(
        protected TransactionRepository $repo,
        protected AuditLogger $logger
    ) {}

    public function processTransaction(TransactionDTO $dto): Response {
        $result = $this->repo->createWithAtomicLock($dto);
        $this->logger->recordAudit('TransactionCompleted', $dto->id);
        return Response::success($result);
    }
}`,
    perf: `// High-Concurrency Query & Redis Cache Layer
$cacheKey = "platform:metrics:" . $tenantId;

return Cache::remember($cacheKey, now()->addMinutes(10), function() use ($tenantId) {
    return DB::table('analytics_events')
        ->where('tenant_id', $tenantId)
        ->selectRaw('status, count(*) as total, avg(response_time) as avg_latency')
        ->groupBy('status')
        ->get();
}); // Execution: 4ms (In-Memory Redis Cache Hit)`,
    api: `// High-Throughput REST API & Microservice Dispatcher
POST /api/v1/services/dispatch
Header: Authorization: Bearer <SECURE_JWT>
Content-Type: application/json

Payload: { "service_id": "SRV-2026-X1", "cluster": "ap-southeast-3" }

Response (200 OK):
{
  "status": "success",
  "data": { "task_id": "TSK-88190", "processed": true },
  "latency": "1.8ms"
}`
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const snippetKey = chip.getAttribute('data-snippet');
      if (codeContent && snippets[snippetKey]) {
        codeContent.textContent = snippets[snippetKey];
      }
    });
  });
}

/* ==========================================================================
   6. PORTFOLIO FILTER
   ========================================================================== */
function initPortfolioFilter() {
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const category = btn.getAttribute('data-filter');

      projectCards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        if (category === 'all' || cardCategory === category) {
          card.style.display = 'flex';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'translateY(0)';
          }, 50);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'translateY(20px)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 300);
        }
      });
    });
  });
}

/* ==========================================================================
   7. INTERACTIVE DEVELOPER PLAYGROUND & CLI TERMINAL
   ========================================================================== */
function initDeveloperPlayground() {
  const terminalInput = document.getElementById('cli-input');
  const terminalOutput = document.getElementById('cli-output');
  const commandPills = document.querySelectorAll('.cmd-pill');

  const commands = {
    help: `Available commands:
  - <span style="color:#d8b4fe">about</span>       : Profil & background Isa Maulana Tantra
  - <span style="color:#d8b4fe">skills</span>      : Daftar keahlian & stack teknologi
  - <span style="color:#d8b4fe">projects</span>    : Ringkasan proyek unggulan
  - <span style="color:#d8b4fe">stats</span>       : Statistik pengalaman & portofolio
  - <span style="color:#d8b4fe">contact</span>     : Info WhatsApp, Email & GitHub
  - <span style="color:#d8b4fe">clear</span>       : Membersihkan layar terminal`,

    about: `SOULOFJAVA LABS — Digital Engineering & Software Studio
Think Tank & Principal Architect : Isa Maulana Tantra, S.Kom (Lulusan UKSW 2017)
Pengalaman Industri              : 8+ Tahun (Aktif berkarya sejak 2018)
Keahlian Inti                    : Web Platform, Mobile Native Android (Kotlin, Java), Multiplatform (Flutter), Microservices & Cloud Infrastructure
Filosofi                         : Harmoni logika komputasi & presisi musik menghasilkan arsitektur kode rapi, stabil, dan berkinerja tinggi.
Basis Operasional                : Wonosobo, Jawa Tengah, Indonesia`,

    skills: `Tech Stack & Core Competencies:
[Backend]    : PHP, Laravel, Go (Golang), CodeIgniter, REST API, JWT
[Database]   : MySQL, MariaDB, Redis, Query Optimization & Indexing
[Frontend]   : JavaScript (ES6+), Vue.js, TailwindCSS, Bootstrap 5, HTML5/CSS3
[Mobile]     : Kotlin (Android Native), Java (Android), Flutter (Cross-platform Android & iOS), Dart
[DevOps]     : Docker, Linux Server (PDNS / Ubuntu), Nginx, Git, CI/CD`,

    projects: `Featured Engineering & Production Solutions:
1. Enterprise Web Platforms & Multi-Tenant SaaS (Laravel, Vue.js, MySQL)
2. Native Android Applications (Kotlin, Java, Room DB, Retrofit)
3. Cross-Platform Mobile Apps (Flutter & Dart for Android & iOS)
4. High-Throughput REST APIs & Microservices (Golang, PHP, Redis)
5. Low-Latency Media & Live Streaming Systems (WebSockets, Nginx RTMP)
6. Digital Transformation & GovTech Public Sector Platforms`,

    stats: `SOULOFJAVA LABS Benchmark & Metrics:
• Think Tank      : Isa Maulana Tantra, S.Kom (8+ Tahun Pengalaman / Sejak 2018)
• Production Apps : 20+ Platform Web, Mobile & Sistem Informasi
• Satisfied Reach : 71+ Klien & Satuan Kerja Pemerintah
• Scope Mastery   : Full-Stack Web Architecture + Native & Multiplatform Mobile
• Code Quality    : Clean Architecture, Modular, High-Uptime (99.9%)`,

    contact: `Direct Contact Channels:
• WhatsApp : <a href="https://api.whatsapp.com/send?phone=6285643710007" target="_blank" style="color:#34d399">085643710007</a>
• Email    : <a href="mailto:isamaulanatantra@gmail.com" style="color:#38bdf8">isamaulanatantra@gmail.com</a>
• GitHub   : <a href="https://github.com/soulofjava" target="_blank" style="color:#ec4899">github.com/soulofjava</a>
• Location : Wonosobo, Jawa Tengah, Indonesia`
  };

  function executeCommand(cmdRaw) {
    const cmd = cmdRaw.trim().toLowerCase();
    if (!cmd) return;

    if (cmd === 'clear') {
      if (terminalOutput) terminalOutput.innerHTML = '';
      return;
    }

    const outputLine = document.createElement('div');
    outputLine.style.marginBottom = '1rem';

    const promptEcho = document.createElement('div');
    promptEcho.innerHTML = `<span style="color:#34d399">thinktank@soulofjava:~$</span> <span style="color:#fff">${cmd}</span>`;
    outputLine.appendChild(promptEcho);

    const responseDiv = document.createElement('div');
    responseDiv.style.marginTop = '0.35rem';
    responseDiv.style.color = '#cbd5e1';

    if (commands[cmd]) {
      responseDiv.innerHTML = `<pre style="white-space:pre-wrap;font-family:inherit;">${commands[cmd]}</pre>`;
    } else {
      responseDiv.innerHTML = `<span style="color:#f87171">Command not found: '${cmd}'. Type '<span style="color:#d8b4fe">help</span>' for available commands.</span>`;
    }

    outputLine.appendChild(responseDiv);
    if (terminalOutput) {
      terminalOutput.appendChild(outputLine);
      terminalOutput.scrollTop = terminalOutput.scrollHeight;
    }
  }

  if (terminalInput) {
    terminalInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const val = terminalInput.value;
        terminalInput.value = '';
        executeCommand(val);
      }
    });
  }

  commandPills.forEach(pill => {
    pill.addEventListener('click', () => {
      const cmd = pill.getAttribute('data-cmd');
      executeCommand(cmd);
    });
  });

  // Project Estimator
  const estimatorType = document.getElementById('est-type');
  const estimatorTimeline = document.getElementById('est-timeline');
  const estimatorResultBtn = document.getElementById('btn-est-wa');

  function updateEstimator() {
    if (!estimatorType || !estimatorTimeline) return;
    const type = estimatorType.value;

    let timeline = '2-3 Minggu';
    let scopeDesc = 'Landing Page / Company Profile Modern';

    if (type === 'govtech') {
      timeline = '4-6 Minggu';
      scopeDesc = 'Sistem Informasi GovTech / Portal Terpadu SPBE';
    } else if (type === 'webapp') {
      timeline = '4-8 Minggu';
      scopeDesc = 'Custom Web Application & High Concurrency API';
    } else if (type === 'mobile') {
      timeline = '6-10 Minggu';
      scopeDesc = 'Aplikasi Mobile (Kotlin / Java / Flutter)';
    }

    estimatorTimeline.textContent = timeline;

    if (estimatorResultBtn) {
      const waText = encodeURIComponent(`Halo Mas Isa, saya tertarik untuk mendiskusikan pembuatan "${scopeDesc}" dengan perkiraan timeline pengerjaan ${timeline}. Mohon info jadwal konsultasi.`);
      estimatorResultBtn.href = `https://api.whatsapp.com/send?phone=6285643710007&text=${waText}`;
    }
  }

  if (estimatorType) {
    estimatorType.addEventListener('change', updateEstimator);
    updateEstimator();
  }
}

/* ==========================================================================
   8. CONTACT FORM HANDLER
   ========================================================================== */
function initContactForm() {
  const form = document.getElementById('contact-form');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('form-name')?.value || 'Klien';
    const email = document.getElementById('form-email')?.value || '-';
    const service = document.getElementById('form-service')?.value || 'Website Development';
    const message = document.getElementById('form-message')?.value || '';

    const text = `Halo SOULOFJAVA LABS (Mas Isa Maulana), perkenalkan saya ${name} (${email}).%0A%0ASaya tertarik untuk berkolaborasi mengenai: *${service}*.%0A%0APesan:%0A${message}`;
    window.open(`https://api.whatsapp.com/send?phone=6285643710007&text=${text}`, '_blank');
  });
}
