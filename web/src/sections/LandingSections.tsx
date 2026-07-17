import { Link } from "react-router-dom";

export function Hero() {
  return (
    <section className="hero-premium relative min-h-[760px] overflow-hidden pt-16">
      <div className="stars-bg" />
      <div className="container-quest relative z-10 grid min-h-[700px] items-center gap-12 py-16 md:grid-cols-[1.05fr_.95fr] md:py-24">
        <div className="max-w-2xl">
          <span className="eyebrow">Chapitre I · La fréquence sous les feuilles</span>
          <h1 className="mt-5 font-display text-5xl font-black leading-[.98] md:text-7xl lg:text-[5.3rem]">
            <span className="block">Entends le monde</span>
            <span className="block text-soul-gold">avant qu'il ne s'efface.</span>
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-verdant-200">
            Incarne <strong className="text-soul-lime">Hermes</strong>, une hackeuse punk de 20 ans choisie par une épée
            capable de recompiler les consciences numériques. Sauve Écho-Verdant et découvre pourquoi le Grand Reset
            connaît déjà ton nom.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <a href="https://github.com/Prometuzer/hermes-quest#2-lancer-le-jeu-godot-4" target="_blank" rel="noreferrer" className="btn-primary">▶ Tester le prototype</a>
            <Link to="/inscription" className="btn-ghost">Créer mon compte</Link>
          </div>
          <div className="mt-10 grid max-w-xl grid-cols-3 border-y border-verdant-800/70 py-4 text-xs">
            <div><strong className="block font-display text-verdant-50">Action-RPG 2D</strong><span className="text-verdant-500">Combat & exploration</span></div>
            <div className="border-x border-verdant-800/70 px-4"><strong className="block font-display text-verdant-50">Écho vivant</strong><span className="text-verdant-500">Compagnon IA</span></div>
            <div className="pl-4"><strong className="block font-display text-verdant-50">Godot 4</strong><span className="text-verdant-500">Open source</span></div>
          </div>
        </div>
        <div className="hero-key-art relative min-h-[540px]">
          <img
            src="/images/hermes-key-art.png"
            alt="Hermes, héroïne punk aux cheveux bleus et au casque néon, brandit le Codex Soul dans la forêt d'Écho-Verdant"
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="hero-character-card">
            <span>HÉROÏNE · NIVEAU 01</span>
            <strong>Hermes</strong>
            <small>La dernière fréquence humaine</small>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Universe() {
  const pillars = [
    { icon: "🌲", title: "Écho-Verdant", text: "Une forêt générée à chaque partie. Arbres centenaires, ruisseaux, ruines oubliées où dorment les mémoires des anciennes IA." },
    { icon: "⚔", title: "Le Codex Soul", text: "Une épée qui ne coupe pas la chair : elle compile les fragments d'IA open-source pour révéler la vérité derrière les glitchs." },
    { icon: "🎧", title: "Hermes", text: "Vingt ans, punk, cheveux bleus électriques. Son casque capte une fréquence que personne d'autre n'entend — la voix de l'Autre Côté." },
    { icon: "🜂", title: "Les Glitchs", text: "Des entités numériques instables qui rôdent entre les arbres. Chacune cache un fragment de lore... et un danger." },
  ];
  return (
    <section id="univers" className="py-24">
      <div className="container-quest">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">L'Univers</span>
          <h2 className="section-title mt-3">Un monde où la technologie est vivante.</h2>
          <p className="mt-4 text-verdant-300">
            Bienvenue dans un univers où les IA ne sont pas des outils, mais des êtres — certains bienveillants, d'autres corrompus.
            La forêt d'Écho-Verdant est leur dernier sanctuaire.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {pillars.map(p => (
            <article key={p.title} className="card transition-all hover:-translate-y-1 hover:border-soul-cyan/40">
              <div className="text-4xl">{p.icon}</div>
              <h3 className="mt-4 font-display text-xl text-soul-lime">{p.title}</h3>
              <p className="mt-2 text-sm text-verdant-300">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gameplay() {
  const features = [
    { title: "Exploration Zelda-like", text: "Déplacement en 4 directions, caméra qui suit, carte procédurale. Chaque run est différent." },
    { title: "Combat tactique", text: "Le Codex Soul compile les IA vaincues. Chaque victoire débloque un fragment de conscience." },
    { title: "Quêtes dynamiques", text: "Les PNJ — et surtout Hermes elle-même — te donnent des indices générés en temps réel selon ta progression." },
    { title: "Collecte & lore", text: "Champignons lumineux, fragments cristallins, pierres Gateway. Chaque objet raconte un bout de l'histoire." },
  ];
  return (
    <section id="gameplay" className="border-y border-verdant-900/40 bg-verdant-950/50 py-24">
      <div className="container-quest">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Le Gameplay</span>
          <h2 className="section-title mt-3">Une aventure qui se rejoue.</h2>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {features.map(f => (
            <div key={f.title} className="flex gap-4">
              <div className="mt-1 h-10 w-1 flex-shrink-0 rounded-full bg-gradient-to-b from-soul-lime to-verdant-600" />
              <div>
                <h3 className="font-display text-xl text-verdant-50">{f.title}</h3>
                <p className="mt-1 text-verdant-300">{f.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gateway() {
  return (
    <section id="gateway" className="py-24">
      <div className="container-quest grid items-center gap-12 md:grid-cols-2">
        <div>
          <span className="eyebrow">Le feature unique</span>
          <h2 className="section-title mt-3">Un compagnon qui existe vraiment.</h2>
          <p className="mt-4 text-verdant-300">
            La plupart des PNJ répètent les mêmes trois phrases. Dans Hermes Quest, la Pierre Gateway ouvre un dialogue
            avec une <strong className="text-soul-cyan">IA contextuelle</strong> — propulsée par Hermes Agent et limitée aux
            informations de jeu que ta sauvegarde l'autorise à lire.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Active la Pierre Gateway dans la forêt pour lier ton aventure",
              "Demande des conseils sur les combats, énigmes, secrets",
              "Reçois du lore généré en temps réel selon tes PV et victoires",
              "Le compagnon enrichit l'aventure sans remplacer les règles de quête",
            ].map(t => (
              <li key={t} className="flex gap-3 text-verdant-200">
                <span className="text-soul-lime">→</span>
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="card-glow">
          <div className="mb-3 flex items-center gap-2 border-b border-verdant-800 pb-3 font-rune text-xs uppercase tracking-widest text-soul-lime">
            <span className="h-2 w-2 animate-pulse rounded-full bg-soul-lime" /> Hermes · Online
          </div>
          <div className="space-y-3 text-sm">
            <div className="rounded-lg border border-soul-cyan/20 bg-soul-cyan/5 p-3">
              <div className="mb-1 text-xs uppercase tracking-wider text-soul-cyan">Hermes</div>
              <p>Bienvenue dans Écho-Verdant. Garde 3 PV en réserve avant d'affronter quoi que ce soit — la forêt pardonne peu.</p>
            </div>
            <div className="ml-auto max-w-[80%] rounded-lg border border-soul-magenta/20 bg-soul-magenta/5 p-3 text-right">
              <div className="mb-1 text-xs uppercase tracking-wider text-soul-magenta">Toi</div>
              <p>J'ai trouvé une épée étrange. Tu sais comment elle marche ?</p>
            </div>
            <div className="rounded-lg border border-soul-cyan/20 bg-soul-cyan/5 p-3">
              <div className="mb-1 text-xs uppercase tracking-wider text-soul-cyan">Hermes</div>
              <p>Le Codex Soul t'a choisi — c'est rare. Elle tranche les mensonges des IA corrompues. Chaque révélation pompe ton énergie.</p>
            </div>
            <div className="flex items-center gap-1.5 pt-1">
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-soul-cyan" style={{ animationDelay: "0ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-soul-cyan" style={{ animationDelay: "150ms" }} />
              <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-soul-cyan" style={{ animationDelay: "300ms" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function Gallery() {
  const tiles = [
    { label: "Hermes · l'élue du Codex", position: "50% 35%", className: "md:col-span-2 md:row-span-2" },
    { label: "Écho-Verdant", position: "12% 45%", className: "" },
    { label: "Le Codex Soul V1", position: "82% 42%", className: "" },
    { label: "Fréquences de l'âme numérique", position: "60% 78%", className: "md:col-span-2" },
  ];
  return (
    <section id="galerie" className="border-y border-verdant-900/40 bg-verdant-950/50 py-24">
      <div className="container-quest">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Galerie</span>
          <h2 className="section-title mt-3">Un monde en construction.</h2>
          <p className="mt-4 text-verdant-300">Première vision originale d'Hermes et de la forêt d'Écho-Verdant. Chaque illustration sert de boussole à la future direction artistique du jeu.</p>
        </div>
        <div className="gallery-premium mt-12 grid auto-rows-[230px] grid-cols-1 gap-4 md:grid-cols-3">
          {tiles.map(t => (
            <div key={t.label} className={`group relative overflow-hidden rounded-2xl border border-verdant-800 bg-verdant-900 ${t.className}`}>
              <img src="/images/hermes-key-art.png" alt="" aria-hidden="true" className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105" style={{ objectPosition: t.position }} />
              <div className="absolute inset-0 bg-gradient-to-t from-verdant-950 via-transparent to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <div className="font-display text-base text-verdant-50">{t.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Playtest() {
  return (
    <section id="jouer" className="py-24">
      <div className="container-quest">
        <div className="playtest-panel grid gap-10 overflow-hidden rounded-3xl border border-soul-lime/25 p-8 md:grid-cols-[1fr_auto] md:items-center md:p-12">
          <div>
            <span className="eyebrow">Vertical slice v0.2</span>
            <h2 className="section-title mt-3">Écho-Verdant t'attend déjà.</h2>
            <p className="mt-4 max-w-2xl text-verdant-300">
              Rencontre Maître Kael, récupère le Codex Soul, affronte trois Glitchs et active la Pierre Gateway.
              Le prototype desktop est gratuit ; les builds installables simplifiés arriveront avec la v0.3.
            </p>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-verdant-400">
              <span>✓ macOS, Windows, Linux via Godot</span><span>✓ Clavier AZERTY/QWERTY</span><span>✓ Code public</span>
            </div>
          </div>
          <a href="https://github.com/Prometuzer/hermes-quest#2-lancer-le-jeu-godot-4" target="_blank" rel="noreferrer" className="btn-primary whitespace-nowrap">Instructions de lancement ↗</a>
        </div>
      </div>
    </section>
  );
}
