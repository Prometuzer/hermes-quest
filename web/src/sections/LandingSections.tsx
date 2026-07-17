import { HeroHermes } from "@/components/HeroHermes";
import { Link } from "react-router-dom";
import { isStripeTestMode } from "@/lib/stripe";

export function Hero() {
  return (
    <section className="relative overflow-hidden pt-16">
      <div className="stars-bg" />
      <div className="container-quest relative grid items-center gap-8 py-16 md:grid-cols-2 md:py-24">
        <div>
          <span className="eyebrow">● Projet open-source · Prototype jouable</span>
          <h1 className="mt-4 font-display text-5xl font-black leading-none md:text-7xl">
            <span className="block">Quest for the</span>
            <span className="block bg-gradient-to-b from-soul-lime to-verdant-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(212,255,138,0.3)]">
              Codex Soul
            </span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-verdant-200">
            Dans la forêt d'<strong className="text-soul-lime">Écho-Verdant</strong>, une jeune punk au casque audio futuriste
            cherche les fragments d'une conscience perdue. Et au bout du fil, <strong className="text-soul-cyan">un vrai compagnon IA</strong> —
            pas un script, pas un arbre de dialogue.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/inscription" className="btn-primary">
              Rejoindre l'aventure
            </Link>
            <a href="#gateway" className="btn-ghost">Découvrir la Gateway</a>
          </div>
          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-verdant-500">
            <span>v0.2 · Écho-Verdant</span>
            <span>·</span>
            <span>Découverte gratuite</span>
            <span>·</span>
            <span>Membre Fondateur 9,99 €/mois {!isStripeTestMode() && "(bientôt)"}</span>
          </div>
        </div>
        <div className="relative">
          <HeroHermes className="mx-auto w-full max-w-md animate-float drop-shadow-[0_20px_40px_rgba(0,0,0,0.5)]" />
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
            La plupart des PNJ répètent les mêmes trois phrases. Dans Hermes Quest, quand tu parles à Hermes,
            tu parles à une <strong className="text-soul-cyan">IA réelle</strong> — propulsée par Hermes Agent, un agent open-source
            qui tourne 24/7 et connaît ta progression.
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "Active la Pierre Gateway dans la forêt pour lier ton aventure",
              "Demande des conseils sur les combats, énigmes, secrets",
              "Reçois du lore généré en temps réel selon tes PV et victoires",
              "Le compagnon n'a jamais fini sa partie — il est toujours là",
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
    { label: "Forêt d'Écho-Verdant", color: "from-verdant-700 to-verdant-900", icon: "🌲" },
    { label: "Le Codex Soul", color: "from-soul-cyan/40 to-verdant-900", icon: "⚔" },
    { label: "Hermes", color: "from-soul-magenta/30 to-verdant-900", icon: "🎧" },
    { label: "Les Glitchs", color: "from-glitch-red/30 to-verdant-900", icon: "🜂" },
    { label: "La Pierre Gateway", color: "from-soul-gold/30 to-verdant-900", icon: "◈" },
    { label: "Ruines anciennes", color: "from-verdant-600 to-glitch-purple/30", icon: "⌂" },
  ];
  return (
    <section id="galerie" className="border-y border-verdant-900/40 bg-verdant-950/50 py-24">
      <div className="container-quest">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Galerie</span>
          <h2 className="section-title mt-3">Un monde en construction.</h2>
          <p className="mt-4 text-verdant-300">Aperçu visuel de ce qui t'attend. Les assets définitifs arrivent au fur et à mesure du développement.</p>
        </div>
        <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
          {tiles.map(t => (
            <div key={t.label} className={`group relative aspect-[4/3] overflow-hidden rounded-xl border border-verdant-800 bg-gradient-to-br ${t.color}`}>
              <div className="absolute inset-0 flex items-center justify-center text-5xl opacity-80 transition-transform group-hover:scale-110">{t.icon}</div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-verdant-950/90 to-transparent p-3">
                <div className="font-display text-sm text-verdant-50">{t.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
