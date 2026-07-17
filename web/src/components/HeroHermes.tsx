/**
 * HeroHermes.tsx — Illustration SVG 100% originale de Hermes.
 * Hermes, 20 ans, punk : cheveux bleus électriques, casque audio futuriste
 * avec LED cyan + magenta, veste cyber, épée Codex Soul lumineuse.
 * Forêt d'Écho-Verdant en arrière-plan (silhouettes d'arbres, lucioles).
 *
 * Aucun asset externe — tout est généré en SVG inline.
 */
export function HeroHermes({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 480 600"
      className={className}
      role="img"
      aria-label="Hermes, jeune femme punk aux cheveux bleus et casque futuriste, brandissant l'épée Codex Soul dans la forêt d'Écho-Verdant"
    >
      <defs>
        {/* Gradients */}
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0a1a0a" />
          <stop offset="60%" stopColor="#142914" />
          <stop offset="100%" stopColor="#1f3a1f" />
        </linearGradient>
        <linearGradient id="hairBlue" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4a82e6" />
          <stop offset="100%" stopColor="#1a3a8a" />
        </linearGradient>
        <linearGradient id="hoodie" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2a2a3a" />
          <stop offset="100%" stopColor="#15151f" />
        </linearGradient>
        <linearGradient id="swordGlow" x1="0" y1="1" x2="0" y2="0">
          <stop offset="0%" stopColor="#82ffd9" stopOpacity="0.3" />
          <stop offset="40%" stopColor="#82ffd9" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
        </linearGradient>
        <radialGradient id="cyanGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#82ffd9" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#82ffd9" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="magentaGlow" cx="0.5" cy="0.5" r="0.5">
          <stop offset="0%" stopColor="#ff6bb4" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#ff6bb4" stopOpacity="0" />
        </radialGradient>
        <filter id="softBlur"><feGaussianBlur stdDeviation="2" /></filter>
      </defs>

      {/* Ciel / fond forêt */}
      <rect width="480" height="600" fill="url(#sky)" />

      {/* Silhouettes d'arbres lointains */}
      <g opacity="0.5" filter="url(#softBlur)">
        <polygon points="60,600 100,350 140,600" fill="#1a3a1a" />
        <polygon points="120,600 170,300 220,600" fill="#152a15" />
        <polygon points="280,600 330,320 380,600" fill="#1a3a1a" />
        <polygon points="370,600 420,360 470,600" fill="#152a15" />
      </g>

      {/* Lucioles */}
      <g>
        <circle cx="80" cy="200" r="2" fill="#d4ff8a"><animate attributeName="opacity" values="0.3;1;0.3" dur="3s" repeatCount="indefinite" /></circle>
        <circle cx="400" cy="180" r="1.5" fill="#82ffd9"><animate attributeName="opacity" values="0.8;0.2;0.8" dur="2.5s" repeatCount="indefinite" /></circle>
        <circle cx="150" cy="280" r="1.5" fill="#d4ff8a"><animate attributeName="opacity" values="0.4;0.9;0.4" dur="4s" repeatCount="indefinite" /></circle>
        <circle cx="350" cy="250" r="2" fill="#82ffd9"><animate attributeName="opacity" values="0.2;0.8;0.2" dur="3.5s" repeatCount="indefinite" /></circle>
        <circle cx="250" cy="150" r="1" fill="#ff6bb4"><animate attributeName="opacity" values="0.5;1;0.5" dur="2s" repeatCount="indefinite" /></circle>
      </g>

      {/* Halo derrière Hermes */}
      <ellipse cx="240" cy="300" rx="160" ry="220" fill="url(#cyanGlow)" />
      <ellipse cx="300" cy="200" rx="80" ry="100" fill="url(#magentaGlow)" />

      {/* === HERMES === */}
      <g transform="translate(240, 380)">
        {/* Ombre au sol */}
        <ellipse cx="0" cy="180" rx="70" ry="12" fill="#000" opacity="0.4" />

        {/* Jambes / bottes */}
        <path d="M -25 100 L -30 180 L -10 180 L -8 100 Z" fill="#15151f" />
        <path d="M 25 100 L 30 180 L 10 180 L 8 100 Z" fill="#15151f" />
        {/* Reflets néon bottes */}
        <rect x="-28" y="170" width="18" height="3" fill="#82ffd9" opacity="0.7" />
        <rect x="10" y="170" width="18" height="3" fill="#82ffd9" opacity="0.7" />

        {/* Pantalon */}
        <path d="M -25 40 L -28 105 L -8 105 L -5 40 Z" fill="#2a2a3a" />
        <path d="M 25 40 L 28 105 L 8 105 L 5 40 Z" fill="#2a2a3a" />

        {/* Veste / hoodie cyber */}
        <path d="M -45 -20 Q -50 40 -40 100 L -10 100 L -10 -10 Z" fill="url(#hoodie)" />
        <path d="M 45 -20 Q 50 40 40 100 L 10 100 L 10 -10 Z" fill="url(#hoodie)" />
        {/* Zip néon central */}
        <rect x="-2" y="-15" width="4" height="115" fill="#82ffd9" opacity="0.8" />
        {/* Détails magenta punk (études, patches) */}
        <rect x="-38" y="10" width="12" height="8" fill="#ff6bb4" opacity="0.8" />
        <rect x="28" y="30" width="10" height="6" fill="#ff6bb4" opacity="0.7" />
        {/* Reflets veste */}
        <path d="M -42 -10 L -45 50" stroke="#3a3a4a" strokeWidth="2" fill="none" />
        <path d="M 42 -10 L 45 50" stroke="#3a3a4a" strokeWidth="2" fill="none" />

        {/* Bras gauche (tendre vers l'épée) */}
        <path d="M 40 0 Q 70 -10 95 -30 L 100 -20 Q 75 5 48 18 Z" fill="url(#hoodie)" />
        {/* Main */}
        <circle cx="98" cy="-32" r="8" fill="#e8c4a0" />
        {/* Bracelet néon */}
        <rect x="88" y="-28" width="16" height="4" fill="#82ffd9" opacity="0.9" />

        {/* Bras droit (le long du corps) */}
        <path d="M -45 0 L -48 60 L -32 62 L -38 5 Z" fill="url(#hoodie)" />
        <circle cx="-40" cy="68" r="8" fill="#e8c4a0" />

        {/* Cou */}
        <rect x="-8" y="-35" width="16" height="20" fill="#e8c4a0" />

        {/* Tête / visage */}
        <ellipse cx="0" cy="-55" rx="32" ry="38" fill="#f0d4b0" />

        {/* Cheveux bleus (dépassent du casque, punk) */}
        {/* Mèche latérale gauche qui tombe */}
        <path d="M -30 -70 Q -45 -50 -42 -20 Q -38 -10 -28 -15 L -25 -60 Z" fill="url(#hairBlue)" />
        {/* Mèche droite ébouriffée */}
        <path d="M 25 -85 Q 40 -95 50 -80 Q 48 -65 30 -60 Z" fill="url(#hairBlue)" />
        {/* Sous le casque, derrière */}
        <path d="M -28 -75 Q 0 -90 28 -75 L 28 -55 Q 0 -65 -28 -55 Z" fill="url(#hairBlue)" />

        {/* Casque audio futuriste */}
        {/* Arceau */}
        <path d="M -34 -75 Q 0 -100 34 -75" stroke="#2a2a3a" strokeWidth="8" fill="none" strokeLinecap="round" />
        <path d="M -34 -75 Q 0 -100 34 -75" stroke="#15151f" strokeWidth="4" fill="none" strokeLinecap="round" />
        {/* LED arceau central */}
        <circle cx="0" cy="-98" r="4" fill="#82ffd9">
          <animate attributeName="opacity" values="0.5;1;0.5" dur="1.5s" repeatCount="indefinite" />
        </circle>
        {/* Écouteur gauche */}
        <ellipse cx="-34" cy="-55" rx="12" ry="18" fill="#15151f" />
        <ellipse cx="-34" cy="-55" rx="8" ry="13" fill="#0a0a12" />
        {/* LED écouteur gauche */}
        <circle cx="-34" cy="-50" r="3" fill="#ff6bb4">
          <animate attributeName="opacity" values="0.4;1;0.4" dur="2s" repeatCount="indefinite" />
        </circle>
        {/* Écouteur droit */}
        <ellipse cx="34" cy="-55" rx="12" ry="18" fill="#15151f" />
        <ellipse cx="34" cy="-55" rx="8" ry="13" fill="#0a0a12" />
        <circle cx="34" cy="-50" r="3" fill="#ff6bb4">
          <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
        </circle>

        {/* Visage : yeux fermés/déterminés, bouche serrée */}
        <path d="M -16 -55 L -8 -53" stroke="#1a1410" strokeWidth="2" strokeLinecap="round" />
        <path d="M 8 -53 L 16 -55" stroke="#1a1410" strokeWidth="2" strokeLinecap="round" />
        {/* Joue rosée */}
        <circle cx="-14" cy="-45" r="4" fill="#ff6bb4" opacity="0.3" />
        <circle cx="14" cy="-45" r="4" fill="#ff6bb4" opacity="0.3" />
        {/* Bouche */}
        <path d="M -6 -35 L 6 -35" stroke="#9a4040" strokeWidth="2" strokeLinecap="round" />

        {/* === ÉPÉE CODEX SOUL === */}
        <g transform="translate(98, -32) rotate(20)">
          {/* Glow */}
          <rect x="-4" y="-200" width="24" height="240" fill="url(#cyanGlow)" opacity="0.5" />
          {/* Lame */}
          <path d="M 4 -190 L 8 -180 L 8 0 L 0 0 L 0 -180 Z" fill="url(#swordGlow)" />
          {/* Tranchant blanc */}
          <line x1="4" y1="-185" x2="4" y2="-5" stroke="#ffffff" strokeWidth="1.5" opacity="0.9" />
          {/* Garde */}
          <rect x="-8" y="-5" width="24" height="6" fill="#8a6a3a" />
          <rect x="-6" y="-3" width="20" height="2" fill="#f0c674" />
          {/* Poignée */}
          <rect x="2" y="1" width="6" height="20" fill="#5a3a1a" />
          {/* Pommeau */}
          <circle cx="5" cy="24" r="4" fill="#f0c674" />
          {/* Runes néon sur la lame */}
          <g fill="#82ffd9" opacity="0.95">
            <rect x="2" y="-150" width="4" height="4" />
            <rect x="2" y="-100" width="4" height="4" />
            <rect x="2" y="-50" width="4" height="4" />
          </g>
          {/* Halo pointe */}
          <circle cx="4" cy="-190" r="6" fill="#ffffff" opacity="0.8">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="1.8s" repeatCount="indefinite" />
          </circle>
        </g>
      </g>
    </svg>
  );
}
