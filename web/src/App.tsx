import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/hooks/useAuth";
import { Navbar, Footer } from "@/components/Chrome";
import { Hero, Universe, Gameplay, Gateway, Gallery } from "@/sections/LandingSections";
import { Pricing, AboutAtto, FAQ } from "@/sections/PricingSections";
import { AuthForm } from "@/components/AuthForm";
import { AccountPage } from "@/components/AccountPage";

function LandingPage() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Universe />
        <Gameplay />
        <Gateway />
        <Gallery />
        <Pricing />
        <AboutAtto />
        <FAQ />
      </main>
      <Footer />
    </>
  );
}

function AuthPage({ mode }: { mode: "signin" | "signup" | "reset" }) {
  return (
    <>
      <Navbar />
      <AuthForm mode={mode} />
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inscription" element={<AuthPage mode="signup" />} />
        <Route path="/connexion" element={<AuthPage mode="signin" />} />
        <Route path="/reset-password" element={<AuthPage mode="reset" />} />
        <Route path="/compte" element={<><Navbar /><AccountPage /></>} />
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthProvider>
  );
}
