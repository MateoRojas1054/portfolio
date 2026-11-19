/**
 * data.js
 * Single source of truth for KrassnyOS portfolio content.
 * Synced with Mateo Rojas Martinez's CV, GitHub, LinkedIn, and Credly profiles.
 */

export const PROFILE = {
  name: 'Mateo Rojas Martinez',
  shortName: 'Mateo Rojas',
  handle: 'MateoRojas1054',
  osName: 'KrassnyOS',
  kernel: '6.12.9-arch1-krassny',
  wm: 'Hyprland (Wayland)',
  shell: 'zsh / krassny-sh',
  role: 'Backend & Full-Stack Developer',
  location: 'Bogotá, Colombia',
  experienceYears: '3 years',
  education: {
    institution: 'Universidad de La Salle',
    degree: 'B.S. in Systems / Software Engineering',
    expected: 'Expected 2029',
    location: 'Bogotá, Colombia',
  },
  summary:
    'Backend & Full-Stack Developer and Software Engineering student with 3 years of hands-on experience designing, refactoring, and maintaining production web applications, layered architectures, relational databases, and containerized environments.',
  contact: {
    email: 'mateo.rojas1054@gmail.com',
    phone: '(+57) 314-492-8347',
    github: 'https://github.com/MateoRojas1054',
    caseStudies: 'https://github.com/MateoRojas1054/architecture-case-studies',
    linkedin: 'https://www.linkedin.com/in/mateorojas1054/',
    credly: 'https://www.credly.com/users/mateorojas1054',
    cvPath: 'assets/Mateo_Rojas_Resume.pdf',
  },
};

export const BOOT_LINES = [
  'Booting KrassnyOS 6.12.9-arch1-krassny (x86_64)...',
  'Started systemd-udevd.service — Kernel Device Manager.',
  'Mounted /home/mateo/architecture-case-studies.',
  'Started php8.2-fpm.service — PHP FastCGI Process Manager.',
  'Started mysql8.0-innodb.service — Relational Database Server (ACID).',
  'Listening on docker.socket — Container Runtime API.',
  'Started constancias-prod.service — Certificate Issuance & Verification (Jan 2025 - Jul 2026).',
  'Loaded sigma-slim4.service — Academic Tutoring Platform (PHP 8.3 / Slim 4 / PHP-DI).',
  'Verified credly-badges.target — Certiprof MEAN Expert & Cisco Python Essentials 2.',
  'Reached target KrassnyOS Interactive TTY.',
];

export const EXPERIENCE = [
  {
    id: 'constancias',
    role: 'Core Developer & Maintainer',
    organization: 'Certificate Issuance & Verification System (constancias)',
    period: 'Jan 2025 – Jul 2026',
    badge: 'Production · 1.5 Years',
    stack: ['PHP 8.2+', 'MySQL 8.0', 'Apache', 'Docker', 'Composer (PSR-4)'],
    caseStudyUrl:
      'https://github.com/MateoRojas1054/architecture-case-studies/blob/main/constancias/README.md',
    highlights: [
      'Engineered and maintained a production web platform for certificate issuance, bulk CSV ingestion, and public third-party verification with zero external web frameworks.',
      'Led a 5-phase refactoring into a layered Front Controller architecture (Router -> Controller -> Service -> Model) with PSR-4 autoloading, a custom lazy-loading DI ServiceContainer, and SOLID/DIP interfaces.',
      'Implemented centralized authentication (Gatekeeper), CSRF token validation, XSS view escaping, PDO prepared statements, session fixation mitigation, .htaccess upload isolation, and module-by-module regression checklists across Docker and Apache.',
    ],
  },
  {
    id: 'hermano-mayor',
    role: 'Academic Mentor & Peer Tutor ("Hermano Mayor")',
    organization: 'Universidad de La Salle',
    period: 'Jul 2026 – Present',
    badge: 'Bogotá, Colombia',
    stack: ['Algorithms', 'CS Fundamentals', 'Mathematics', 'Mentoring'],
    caseStudyUrl: null,
    highlights: [
      'Mentored incoming engineering students in computer science fundamentals, algorithms, and mathematics through structured collaborative problem-solving sessions.',
    ],
  },
];

export const PROJECTS = [
  {
    id: 'constancias',
    name: 'constancias — Certificate Issuance & Verification',
    status: 'Production · Jan 2025 – Jul 2026',
    role: 'Core Developer & Maintainer',
    visibility: 'Private Repo · Public Case Study',
    stack: ['PHP 8.2+', 'MySQL 8.0', 'Apache', 'Docker', 'Composer (PSR-4)', 'SOLID / DI'],
    summary:
      'Zero-framework layered PHP platform handling certificate issuance, bulk CSV imports, isolated PDF storage, and unauthenticated public verification in production.',
    architecturePoints: [
      'Front Controller -> Gatekeeper Auth -> Router -> Controller -> ServiceInterface -> ModelInterface -> MySQL.',
      'Lazy-loading ServiceContainer wired via closures in core/Bootstrap.php.',
      'Security controls: CSRF validation, h() XSS escaping, PDO prepared statements, session_regenerate_id(), and .htaccess PDF execution blocking.',
    ],
    url: 'https://github.com/MateoRojas1054/architecture-case-studies/blob/main/constancias/README.md',
    urlLabel: 'Read Architecture Case Study',
  },
  {
    id: 'sigma',
    name: 'SIGMA — Academic Tutoring & Mentoring Platform',
    status: 'Institutional Platform',
    role: 'Architecture, DevOps & QA / Code Owner',
    visibility: 'Private Repo · Public Case Study',
    stack: ['PHP 8.3', 'Slim 4', 'PHP-DI', 'League Plates', 'MySQL 8.0 (InnoDB)', 'Docker Compose'],
    summary:
      'Multi-role web platform (Student, Mentor, Supervisor) centralizing academic tutoring schedules, attendance tracking, and validated administrative reporting.',
    architecturePoints: [
      'Apache + PHP-FPM containerized with Docker Compose and MySQL 8.0 InnoDB ACID transactions.',
      'Automated XLSX (PhpSpreadsheet) and PDF (TCPDF) report exports generated directly from database state.',
      'Protected main/develop Git branches with role-based feature lanes and mandatory Code Owner PR QA gates.',
    ],
    url: 'https://github.com/MateoRojas1054/architecture-case-studies/blob/main/sigma/README.md',
    urlLabel: 'Read Architecture Case Study',
  },
  {
    id: 'case-studies',
    name: 'Architecture & Engineering Case Studies',
    status: 'Public Repository · MIT Docs',
    role: 'Author',
    visibility: 'Public on GitHub',
    stack: ['System Design', 'Mermaid Diagrams', 'Security Matrices', 'DevOps Documentation'],
    summary:
      'Public documentation repository detailing system design, layer boundaries, security controls, and refactoring retrospectives for private production and institutional systems without exposing proprietary source code.',
    architecturePoints: [
      'Documents full architectural decisions and Mermaid flow diagrams cleanly under IP boundaries.',
    ],
    url: 'https://github.com/MateoRojas1054/architecture-case-studies',
    urlLabel: 'Open GitHub Repository',
  },
];

export const SKILLS = [
  {
    category: 'Backend & APIs',
    items: ['PHP 8.2+ / 8.3', 'Slim Framework 4', 'Composer (PSR-4)', 'PHP-DI', 'PDO', 'Node.js', 'Express', 'Python'],
  },
  {
    category: 'Databases & Data',
    items: ['MySQL 8.0 (InnoDB · ACID)', 'PostgreSQL', 'MongoDB', 'Relational Modeling', 'Query Optimization'],
  },
  {
    category: 'Frontend',
    items: ['TypeScript', 'JavaScript (ES6+)', 'Angular', 'HTML5', 'CSS3'],
  },
  {
    category: 'Engineering & DevOps',
    items: ['Docker & Docker Compose', 'Apache HTTP Server', 'Linux / Bash', 'Git & GitHub PR Workflows', 'SOLID / Layered Architecture', 'Playwright', 'Regression Testing', 'Agile / Scrum'],
  },
];

export const CERTIFICATIONS = [
  {
    name: 'FullStack Mean Expert',
    issuer: 'Certiprof',
    period: 'Issued Oct 2026 · Valid through Oct 2029',
    credentialId: '9f752c17-9fd1-42e2-994c-eb5873ba6be9',
    url: 'https://www.credly.com/badges/9f752c17-9fd1-42e2-994c-eb5873ba6be9',
  },
  {
    name: 'Python Essentials 2',
    issuer: 'Cisco Networking Academy',
    period: 'Issued Oct 2026',
    credentialId: '9d79edd8-cf2c-4a20-9b23-c7a4a0268b43',
    url: 'https://www.credly.com/badges/9d79edd8-cf2c-4a20-9b23-c7a4a0268b43',
  },
  {
    name: 'Data Science Essentials With Python',
    issuer: 'Cisco Networking Academy',
    period: 'Issued Oct 2026',
    credentialId: '03e1c780-6434-4a2c-bda2-5fe60fe28ffa',
    url: 'https://www.credly.com/badges/03e1c780-6434-4a2c-bda2-5fe60fe28ffa',
  },
  {
    name: 'JavaScript Essentials 1',
    issuer: 'Cisco Networking Academy',
    period: '100% Final Score',
    credentialId: null,
    url: null,
  },
];

export const VIRTUAL_FS = {
  '/home/mateo': ['projects/', 'about.txt', 'experience.txt', 'skills.json', 'certs.txt', 'contact.txt', 'resume.pdf'],
  '/home/mateo/projects': ['constancias.md', 'sigma.md', 'case-studies.md'],
};
