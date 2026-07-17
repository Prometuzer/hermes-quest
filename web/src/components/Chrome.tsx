import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const { user, signOut } = useAuth();
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-verdant-900/50 bg-verdant-950/80 backdrop-blur-md">
      <div className="container-quest flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl text-soul-cyan drop-shadow-[0_0_8px_rgba(130,255,217,0.6)]">⟁</span>
          <span className="font-display text-lg font-bold tracking-widest">HERMES</span>
          <span className="hidden text-xs text-verdant-500 sm:inline">QUEST</span>
        </Link>
        <div className="flex items-center gap-6 text-sm">
          <Link to="/#univers" className="hidden text-verdant-300 hover:text-soul-lime md:inline">Univers</Link>
          <Link to="/#gameplay" className="hidden text-verdant-300 hover:text-soul-lime md:inline">Gameplay</Link>
          <Link to="/#gateway" className="hidden text-verdant-300 hover:text-soul-lime md:inline">Gateway</Link>
          <Link to="/#offre" className="hidden text-verdant-300 hover:text-soul-lime md:inline">Offre</Link>
          {user ? (
            <>
              <Link to="/compte" className="text-verdant-200 hover:text-soul-lime">Mon compte</Link>
              <button onClick={() => signOut()} className="btn-ghost px-4 py-1.5 text-xs">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="text-verdant-300 hover:text-soul-lime">Connexion</Link>
              <Link to="/inscription" className="btn-primary px-4 py-1.5 text-xs">S'inscrire</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-verdant-900/60 bg-verdant-950 py-12">
      <div className="container-quest grid gap-8 md:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xl text-soul-cyan">⟁</span>
            <span className="font-display font-bold tracking-widest">HERMES QUEST</span>
          </div>
          <p className="mt-3 text-sm text-verdant-400">
            Une aventure 2D où les humains et les IA apprennent à coexister. Un monde vivant, une IA qui existe vraiment.
          </p>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-verdant-300">Projet</h4>
          <ul className="space-y-2 text-sm text-verdant-400">
            <li><a href="https://github.com/Prometuzer/hermes-quest" target="_blank" rel="noreferrer" className="hover:text-soul-lime">GitHub</a></li>
            <li><Link to="/#offre" className="hover:text-soul-lime">Devenir Membre Fondateur</Link></li>
            <li><a href="https://t.me/MuseHermesHyperBot" target="_blank" rel="noreferrer" className="hover:text-soul-lime">Telegram</a></li>
          </ul>
        </div>
        <div>
          <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-verdant-300">Légal</h4>
          <ul className="space-y-2 text-sm text-verdant-400">
            <li>© 2026 Hermes Quest</li>
            <li>Construit avec Godot 4 + React</li>
            <li>MIT License</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
