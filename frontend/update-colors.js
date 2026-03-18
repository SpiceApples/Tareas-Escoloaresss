const fs = require('fs');
let css = fs.readFileSync('src/styles.css', 'utf8');

css = css.replace(/--bg: #0b0f19;/, '--bg: #09090b;');
css = css.replace(/--bg-alt: #111827;/, '--bg-alt: #18181b;');
css = css.replace(/--ink: #f1f5f9;/, '--ink: #f8fafc;');
css = css.replace(/--muted: #94a3b8;/, '--muted: #a1a1aa;');
css = css.replace(/--accent: #06b6d4;/, '--accent: #d946ef;');
css = css.replace(/--accent-strong: #0891b2;/, '--accent-strong: #c026d3;');
css = css.replace(/--accent-warm: #f59e0b;/, '--accent-warm: #fb923c;');
css = css.replace(/--surface: rgba\(30, 41, 59, 0\.6\);/, '--surface: rgba(39, 39, 42, 0.7);');
css = css.replace(/--surface-2: rgba\(51, 65, 85, 0\.5\);/, '--surface-2: rgba(63, 63, 70, 0.5);');

css = css.replace(/--bg: #f8fafc;/, '--bg: #fdf4ff;');
css = css.replace(/--ink: #0f172a;/, '--ink: #27272a;');
css = css.replace(/--muted: #64748b;/, '--muted: #71717a;');
css = css.replace(/--surface: rgba\(255, 255, 255, 0\.8\);/, '--surface: rgba(255, 255, 255, 0.85);');
css = css.replace(/--surface-2: rgba\(241, 245, 249, 0\.8\);/, '--surface-2: rgba(250, 232, 255, 0.6);');
css = css.replace(/--stroke: rgba\(0, 0, 0, 0\.08\);/, '--stroke: rgba(0, 0, 0, 0.06);');
css = css.replace(/--shadow: 0 8px 32px rgba\(0, 0, 0, 0\.08\);/, '--shadow: 0 8px 32px rgba(217, 70, 239, 0.12);');

// Dark mode background gradient
css = css.replace(/rgba\(6, 182, 212, 0\.15\)/g, 'rgba(217, 70, 239, 0.18)');
css = css.replace(/rgba\(168, 85, 247, 0\.12\)/g, 'rgba(251, 146, 60, 0.12)');
css = css.replace(/rgba\(59, 130, 246, 0\.1\)/g, 'rgba(59, 130, 246, 0.15)');

// Light mode background gradient
css = css.replace(/rgba\(6, 182, 212, 0\.06\)/g, 'rgba(217, 70, 239, 0.1)');
css = css.replace(/rgba\(168, 85, 247, 0\.06\)/g, 'rgba(251, 146, 60, 0.08)');
css = css.replace(/rgba\(59, 130, 246, 0\.06\)/g, 'rgba(59, 130, 246, 0.08)');

// Hover active state navbar
css = css.replace(/rgba\(14, 165, 164, 0\.12\)/g, 'rgba(217, 70, 239, 0.12)');
css = css.replace(/rgba\(14, 165, 164, 0\.16\)/g, 'rgba(217, 70, 239, 0.16)');

// Primary buttons and ghost buttons
css = css.replace(/rgba\(14, 165, 164, 0\.25\)/g, 'rgba(217, 70, 239, 0.25)');
css = css.replace(/rgba\(15, 118, 110, 0\.1\)/g, 'rgba(217, 70, 239, 0.1)');

// Auth panel aside
css = css.replace(/background: rgba\(14, 165, 164, 0\.12\);/, 'background: linear-gradient(135deg, rgba(217, 70, 239, 0.15), rgba(251, 146, 60, 0.1));');

fs.writeFileSync('src/styles.css', css);
