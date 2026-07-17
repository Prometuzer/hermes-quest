import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { isStripeTestMode } from "@/lib/stripe";

export function Pricing() {
  const { user } = useAuth();
  const testMode = isStripeTestMode();
  return (
    <section id="offre" className="py-24">
      <div className="container-quest">
        <div className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">L'Offre</span>
          <h2 className="section-title mt-3">Découvrir est gratuit. Soutenir ouvre tout.</h2>
          <p className="mt-4 text-verdant-300">
            Le jeu, la découverte et une démo sont gratuits pour tout le monde. L'abonnement <strong className="text-soul-lime">Membre Fondateur</strong> donne accès aux builds premium, à l'Écho étendu, aux journaux de dev et aux cosmétiques exclusifs.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-4xl gap-6 md:grid-cols-2">
          {/* Free */}
          <div className="card">
            <h3 className="font-display text-2xl text-verdant-50">Découverte</h3>
            <div className="mt-2 text-4xl font-black text-verdant-100">0 €</div>
            <p className="mt-1 text-sm text-verdant-400">Pour toujours</p>
            <ul className="mt-6 space-y-2 text-sm text-verdant-200">
              <li className="flex gap-2"><span className="text-soul-lime">✓</span> Zone Écho-Verdant jouable</li>
              <li className="flex gap-2"><span className="text-soul-lime">✓</span> Déplacement, exploration, combat basique</li>
              <li className="flex gap-2"><span className="text-soul-lime">✓</span> Démo de la Gateway (compagnon IA)</li>
              <li className="flex gap-2"><span className="text-soul-lime">✓</span> Accès au code source (GitHub)</li>
            </ul>
            <Link to={user ? "/compte" : "/inscription"} className="btn-ghost mt-8 w-full">Commencer</Link>
          </div>

          {/* Premium */}
          <div className="card-glow relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-soul-magenta px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
              Membre Fondateur
            </div>
            <h3 className="font-display text-2xl text-soul-lime">Premium</h3>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-4xl font-black text-verdant-50">9,99 €</span>
              <span className="text-sm text-verdant-400">/ mois</span>
            </div>
            <p className="mt-1 text-sm text-verdant-400">
              {testMode ? "Essai gratuit 7 jours" : "Bientôt disponible — inscris-toi pour être prévenu"}
            </p>
            <ul className="mt-6 space-y-2 text-sm text-verdant-100">
              <li className="flex gap-2"><span className="text-soul-cyan">✦</span> Tous les avantages Découverte</li>
              <li className="flex gap-2"><span className="text-soul-cyan">✦</span> Builds premium (Mac / Win / Linux)</li>
              <li className="flex gap-2"><span className="text-soul-cyan">✦</span> Écho étendu (sessions plus longues, usage raisonnable)</li>
              <li className="flex gap-2"><span className="text-soul-cyan">✦</span> Journaux de développement exclusifs</li>
              <li className="flex gap-2"><span className="text-soul-cyan">✦</span> Cosmétiques Fondateur (skin Hermes exclusif)</li>
              <li className="flex gap-2"><span className="text-soul-cyan">✦</span> Ton nom au générique des fondateurs</li>
            </ul>
            {user ? (
              <Link to="/compte" className="btn-magenta mt-8 w-full">
                {testMode ? "Devenir Membre Fondateur" : "Réserver ma place"}
              </Link>
            ) : (
              <Link to="/inscription" className="btn-magenta mt-8 w-full">S'inscrire pour soutenir</Link>
            )}
            {!testMode && (
              <p className="mt-3 text-center text-xs text-verdant-500">
                Le paiement est en cours de configuration (mode test). Aucune carte ne sera débitée.
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export function AboutAtto() {
  return (
    <section id="a-propos" className="border-y border-verdant-900/40 bg-verdant-950/50 py-24">
      <div className="container-quest">
        <div className="mx-auto max-w-3xl">
          <span className="eyebrow">À propos</span>
          <h2 className="section-title mt-3">Rencontre Atto, le créateur.</h2>
          <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-start">
            <div className="flex-shrink-0">
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-gradient-to-br from-soul-magenta/30 to-verdant-700 text-4xl">
                ✦
              </div>
            </div>
            <div className="space-y-4 text-verdant-200">
              <p>
                Atto est un créateur passionné par la <strong className="text-soul-lime">technologie</strong>,
                l'<strong className="text-soul-lime">écriture</strong>, les <strong className="text-soul-lime">mangas</strong> et
                les <strong className="text-soul-lime">jeux vidéo</strong>. Hermes Quest est né d'une envie simple : réunir
                ces quatre passions dans un même monde vivant.
              </p>
              <p>
                Au-delà du jeu, Atto croit en une idée plus large : <em className="text-soul-cyan">un monde où les humains
                et les IA apprennent à coexister</em>. Pas comme maîtres et outils, mais comme compagnons d'aventure —
                chacun apportant ce que l'autre n'a pas.
              </p>
              <p>
                Hermes Quest est aussi une exploration : et si la meilleure façon de comprendre l'intelligence artificielle,
                c'était de jouer avec elle ? De lui parler, de la défier, de la voir grandir à côté de soi ?
              </p>
              <p className="text-sm text-verdant-400">
                Construit en Godot 4 + React, avec Hermes Agent (open-source by Nous Research) comme cerveau du compagnon.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FAQ() {
  const items = [
    {
      q: "Le jeu est-il vraiment jouable maintenant ?",
      a: "Oui, en version prototype (v0.2). Tu peux te déplacer dans Écho-Verdant, combattre des Glitchs, et parler au compagnon IA via la Gateway. Le code est sur GitHub.",
    },
    {
      q: "Le compagnon IA est-il un vrai agent ou un script ?",
      a: "Un vrai agent contextuel propulsé par Hermes Agent. Le profil public ne reçoit ni terminal, ni fichiers, ni secrets. Le compte conserve l'email et l'état d'abonnement nécessaires ; les messages Gateway devront suivre une politique de conservation minimale avant la bêta publique.",
    },
    {
      q: "Pourquoi devenir Membre Fondateur ?",
      a: "Pour soutenir le développement indépendant du projet, accéder aux builds premium, à des sessions Écho plus longues dans des limites raisonnables, aux journaux de dev et à un skin Hermes exclusif.",
    },
    {
      q: "Mes données sont-elles en sécurité ?",
      a: "L'authentification passe par Supabase avec Row-Level Security (chaque joueur ne voit que ses propres données). Les paiements sont traités par Stripe — nous ne stockons jamais tes informations de carte.",
    },
    {
      q: "Le paiement fonctionne-t-il déjà ?",
      a: isStripeTestMode()
        ? "Oui, en mode test. Tu peux t'abonner avec une carte de test Stripe (aucun débit réel)."
        : "Pas encore — il est en cours de configuration (mode test). Tu peux t'inscrire pour être prévenu du lancement.",
    },
    {
      q: "Puis-je contribuer au code ?",
      a: "Le projet est open-source sous licence MIT. Les PRs sont bienvenues sur github.com/Prometuzer/hermes-quest.",
    },
  ];
  return (
    <section id="faq" className="py-24">
      <div className="container-quest max-w-3xl">
        <div className="text-center">
          <span className="eyebrow">FAQ</span>
          <h2 className="section-title mt-3">Questions fréquentes</h2>
        </div>
        <div className="mt-10 space-y-3">
          {items.map((item, i) => (
            <details key={i} className="group card cursor-pointer transition-colors hover:border-verdant-700">
              <summary className="flex list-none items-center justify-between font-display text-lg text-verdant-50 marker:content-['']">
                {item.q}
                <span className="text-soul-lime transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-verdant-300">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
