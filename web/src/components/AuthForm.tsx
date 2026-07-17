import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface Props { mode: "signin" | "signup" | "reset" | "update"; }

export function AuthForm({ mode }: Props) {
  const { signIn, signUp, resetPassword, updatePassword, configured } = useAuth();
  const navigate = useNavigate();
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await signUp(email, password, displayName);
        if (error) setError(error);
        else setSuccess(configured
          ? "Compte créé ! Vérifie ton email pour confirmer ton inscription."
          : "Compte créé (mode démo). Tu peux te connecter.");
      } else if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) setError(error);
        else navigate("/compte");
      } else if (mode === "reset") {
        const { error } = await resetPassword(email);
        if (error) setError(error);
        else setSuccess("Si un compte existe, un email de réinitialisation a été envoyé.");
      } else {
        const { error } = await updatePassword(password);
        if (error) setError(error);
        else {
          setSuccess("Mot de passe mis à jour. Tu peux maintenant te connecter.");
          window.setTimeout(() => navigate("/connexion"), 900);
        }
      }
    } finally {
      setLoading(false);
    }
  }

  const titles = {
    signin: "Connexion",
    signup: "Créer un compte",
    reset: "Réinitialiser le mot de passe",
    update: "Choisir un nouveau mot de passe",
  };
  const submitLabels = {
    signin: "Se connecter",
    signup: "Créer mon compte",
    reset: "Envoyer le lien",
    update: "Enregistrer le mot de passe",
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <Link to="/" className="text-2xl text-soul-cyan">⟁</Link>
          <h1 className="mt-2 font-display text-3xl font-bold">{titles[mode]}</h1>
          {!configured && import.meta.env.MODE !== "test" && (
            <p className="mt-2 rounded-lg border border-soul-gold/30 bg-soul-gold/10 px-3 py-2 text-xs text-soul-gold">
              Le portail de compte est en cours de liaison. Aucun faux compte ne sera créé localement.
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card space-y-4">
          {mode !== "update" && (
            <div>
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email" type="email" required autoComplete="email"
                className="input" value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="toi@exemple.com"
              />
            </div>
          )}
          {mode === "signup" && (
            <div>
              <label className="label" htmlFor="display-name">Nom de voyageur</label>
              <input
                id="display-name" type="text" required minLength={2} maxLength={30} autoComplete="nickname"
                className="input" value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                placeholder="Atto"
              />
            </div>
          )}
          {mode !== "reset" && (
            <div>
              <label className="label" htmlFor="password">Mot de passe</label>
              <input
                id="password" type="password" required minLength={8}
                autoComplete={mode === "signin" ? "current-password" : "new-password"}
                className="input" value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Minimum 8 caractères"
              />
            </div>
          )}

          {error && (
            <div role="alert" className="rounded-lg border border-glitch-red/40 bg-glitch-red/10 px-3 py-2 text-sm text-glitch-red">
              {error}
            </div>
          )}
          {success && (
            <div role="status" className="rounded-lg border border-soul-lime/40 bg-soul-lime/10 px-3 py-2 text-sm text-soul-lime">
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? "Patientez..." : submitLabels[mode]}
          </button>
        </form>

        <div className="mt-4 space-y-2 text-center text-sm text-verdant-400">
          {mode === "signin" && (
            <>
              <p>Pas encore de compte ? <Link to="/inscription" className="text-soul-lime hover:underline">S'inscrire</Link></p>
              <p><Link to="/reset-password" className="text-verdant-300 hover:text-soul-lime">Mot de passe oublié ?</Link></p>
            </>
          )}
          {mode === "signup" && (
            <p>Déjà un compte ? <Link to="/connexion" className="text-soul-lime hover:underline">Se connecter</Link></p>
          )}
          {mode === "reset" && (
            <p><Link to="/connexion" className="text-soul-lime hover:underline">← Retour à la connexion</Link></p>
          )}
          {mode === "update" && (
            <p><Link to="/connexion" className="text-soul-lime hover:underline">Retour à la connexion</Link></p>
          )}
        </div>
      </div>
    </div>
  );
}
