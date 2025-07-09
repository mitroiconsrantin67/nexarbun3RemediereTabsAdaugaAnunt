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
import ListingDetailPage from "./pages/ListingDetailPage";
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
	const location = useLocation();

	useEffect(() => {
		const handleReload = () => {
			// Verificăm dacă există procese critice în desfășurare
			const isSubmitting = sessionStorage.getItem('isSubmittingListing') === 'true';
			const isProcessingPayment = sessionStorage.getItem('isProcessingPayment') === 'true';
			
			// Nu reîncărcăm dacă sunt procese critice active
			if (isSubmitting || isProcessingPayment) {
				console.log('🚫 Reload prevented - critical process in progress');
				return;
			}
			
			if (
				location.pathname === "/" ||
				location.pathname.startsWith("/profil") ||
				location.pathname.startsWith("/anunt") ||
				location.pathname.startsWith("/admin")
			) {
				if (!sessionStorage.getItem("reloaded")) {
					sessionStorage.setItem("reloaded", "true");
					window.location.reload();
				}
			}
		};

		const handleVisibilityChange = () => {
			if (document.visibilityState === "visible") {
				handleReload();
			}
		};

		const handleFocus = () => {
			handleReload();
		};

		// Curățăm flag-ul la montare pentru a permite reload-ul data viitoare
		sessionStorage.removeItem("reloaded");

		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("focus", handleFocus);

		return () => {
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("focus", handleFocus);
		};
	}, [location.pathname]);
}
// Hook cu flag pentru reload controlat - VERSIUNE REPARATĂ
function useAppVisibility() {
	const location = useLocation();

	useEffect(() => {
		let reloadTimeout: NodeJS.Timeout;

		const handleReload = () => {
			// Verificăm dacă există procese critice în desfășurare
			const isSubmitting = sessionStorage.getItem('isSubmittingListing') === 'true';
			const isProcessingPayment = sessionStorage.getItem('isProcessingPayment') === 'true';
			
			// Nu reîncărcăm dacă sunt procese critice active
			if (isSubmitting || isProcessingPayment) {
				console.log('🚫 Reload prevented - critical process in progress');
				return;
			}
			
			// Nu reîncărcăm pe pagina de adăugare anunț
			if (location.pathname === "/adauga-anunt" || location.pathname.startsWith("/editeaza-anunt")) {
				console.log('🚫 Reload prevented - on listing creation/edit page');
				return;
			}
			
			if (
				location.pathname === "/" ||
				location.pathname.startsWith("/profil") ||
				location.pathname.startsWith("/anunt") ||
				location.pathname.startsWith("/admin")
			) {
				const hasReloaded = sessionStorage.getItem("reloaded");
				const lastReload = sessionStorage.getItem("lastReload");
				const now = Date.now();
				
				// Prevenim reload-uri prea frecvente (mai puțin de 5 secunde)
				if (lastReload && (now - parseInt(lastReload)) < 5000) {
					console.log('🚫 Reload prevented - too frequent');
					return;
				}
				
				if (!hasReloaded) {
					sessionStorage.setItem("reloaded", "true");
					sessionStorage.setItem("lastReload", now.toString());
					
					// Delay pentru a evita reload-ul imediat
					reloadTimeout = setTimeout(() => {
						window.location.reload();
					}, 100);
				}
			}
		};

		const handleVisibilityChange = () => {
			// Doar când pagina devine vizibilă din nou
			if (document.visibilityState === "visible") {
				// Delay pentru a permite stabilizarea stării
				setTimeout(handleReload, 500);
			}
		};

		const handleFocus = () => {
			// Delay pentru a permite stabilizarea stării
			setTimeout(handleReload, 300);
		};

		// Curățăm flag-ul la montare pentru a permite reload-ul data viitoare
		const clearReloadFlag = () => {
			sessionStorage.removeItem("reloaded");
			sessionStorage.removeItem("lastReload");
		};

		// Curățăm flag-ul când componenta se montează
		clearReloadFlag();

		// Event listeners
		document.addEventListener("visibilitychange", handleVisibilityChange);
		window.addEventListener("focus", handleFocus);

		// Cleanup
		return () => {
			if (reloadTimeout) {
				clearTimeout(reloadTimeout);
			}
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			window.removeEventListener("focus", handleFocus);
		};
	}, [location.pathname]);
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
						<Route path="/anunt/:id" element={<ListingDetailPage />} />
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
