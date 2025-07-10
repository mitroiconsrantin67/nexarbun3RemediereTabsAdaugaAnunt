import React, { useEffect } from "react";
import {
	BrowserRouter as Router,
	Routes,
	Route,
	useLocation,
} from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import HomePage from "./pages/HomePage";
import ListingsPage from "./pages/ListingsPage";
import CreateListingPage from "./pages/CreateListingPage";
import EditListingPage from "./pages/EditListingPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import AuthPage from "./pages/AuthPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CookiesPage from "./pages/CookiesPage";
import FixSupabasePage from "./pages/FixSupabasePage";
import AboutPage from "./pages/AboutPage";
import ContactPage from "./pages/ContactPage";
import PasswordResetPage from "./pages/PasswordResetPage";
import CookieConsent from "./components/CookieConsent";
import AuthConfirmPage from "./pages/AuthConfirmPage";

// Scroll to top on route change
function ScrollToTop() {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
}

// Hook cu flag pentru reload controlat
function useAppVisibility() {
	// Dezactivăm reîncărcarea automată pentru a evita problemele
	return null;
}

// Componentă care conține logica după Router
function AppContent() {
	useAppVisibility();

	return (
		<>
			<ScrollToTop />
			<div className="min-h-screen bg-nexar-light flex flex-col">
				<Header />
				<main className="flex-1">
					<Routes>
						<Route path="/" element={<HomePage />} />
						<Route path="/anunt/:id" element={<ListingsPage />} />
						<Route path="/adauga-anunt" element={<CreateListingPage />} />
						<Route path="/editeaza-anunt/:id" element={<EditListingPage />} />
						<Route path="/profil" element={<ProfilePage />} />
						<Route path="/profil/:id" element={<ProfilePage />} />
						<Route path="/admin" element={<AdminPage />} />
						<Route path="/auth" element={<AuthPage />} />
						<Route path="/auth/confirm" element={<AuthConfirmPage />} />

						<Route
							path="/auth/reset-password"
							element={<PasswordResetPage />}
						/>
						<Route path="/despre" element={<AboutPage />} />
						<Route path="/contact" element={<ContactPage />} />
						<Route path="/termeni" element={<TermsPage />} />
						<Route path="/confidentialitate" element={<PrivacyPage />} />
						<Route path="/cookies" element={<CookiesPage />} />
						<Route path="/fix-supabase" element={<FixSupabasePage />} />
					</Routes>
				</main>
				<Footer />
				<CookieConsent />
			</div>
		</>
	);
}

function App() {
	return (
		<Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
			<AppContent />
		</Router>
	);
}

export default App;
