Here's the fixed version with all missing closing brackets added:

```javascript
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// If you still get "Cannot find module 'lucide-react'" after installing, try this workaround:
import {
	X,
	Plus,
	Check,
	AlertTriangle,
	Camera,
	Store,
	Clock,
} from "lucide-react";
// If the error persists, ensure you have installed lucide-react with:
// npm install lucide-react
// and that your node_modules are not excluded by your tsconfig.json or IDE.
import {
	listings,
	isAuthenticated,
	supabase,
	romanianCities,
} from "../lib/supabase";
import SuccessModal from "../components/SuccessModal";
import FixSupabaseButton from "../components/FixSupabaseButton";

const CreateListingPage = () => {
	const [currentStep, setCurrentStep] = useState(1);
	const [images, setImages] = useState<string[]>([]);
	const [imageFiles, setImageFiles] = useState<File[]>([]);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [userProfile, setUserProfile] = useState<any>(null);
	const [isLoadingProfile, setIsLoadingProfile] = useState(true);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [createdListingId, setCreatedListingId] = useState<string | null>(null);
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		title: "",
		category: "",
		brand: "",
		model: "",
		year: "",
		mileage: "",
		engine: "",
		fuel: "",
		transmission: "",
		color: "",
		condition: "",
		price: "",
		location: "",
		description: "",
		features: [] as string[],
		phone: "",
		email: "",
		availability: "pe_stoc", // Default value
	});

	type Availability = "pe_stoc" | "la_comanda";

	const availabilityValue: Availability =
		formData.availability === "la_comanda" ? "la_comanda" : "pe_stoc";

	// Check if user is logged in and load profile
	useEffect(() => {
		checkAuthAndLoadProfile();
	}, []);

	const checkAuthAndLoadProfile = async () => {
		try {
			setIsLoadingProfile(true);

			const isLoggedIn = await isAuthenticated();
			if (!isLoggedIn) {
				navigate("/auth");
				return;
			}

			// Get current user
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (!user) {
				navigate("/auth");
				return;
			}

			// Get user profile from database
			const { data: profileData, error: profileError } = await supabase
				.from("profiles")
				.select("*")
				.eq("user_id", user.id)
				.single();

			if (profileError) {
				console.error("Error loading profile:", profileError);
				// If profile doesn't exist, redirect to profile page to create it
				navigate("/profil");
				return;
			}

			if (profileData) {
				setUserProfile(profileData);

				// Pre-fill form with user data
				setFormData((prev) => ({
					...prev,
					email: profileData.email || "",
					phone: profileData.phone || "",
					location: "", // Reset location to empty string instead of pre-filling
				}));
			}
		} catch (error) {
			console.error("Error checking auth and loading profile:", error);
			navigate("/auth");
		} finally {
			setIsLoadingProfile(false);
		}
	};

	const steps = [
		{
			id: 1,
			title: "Informații de bază",
			description: "Detalii despre motocicletă",
		},
		{ id: 2, title: "Fotografii", description: "Adaugă până la 5 poze" },
		{ id: 3, title: "Descriere și preț", description: "Detalii complete" },
		{ id: 4, title: "Contact", description: "Informații de contact" },
	];

	const categories = [
		"Sport",
		"Touring",
		"Cruiser",
		"Adventure",
		"Naked",
		"Scooter",
		"Enduro",
		"Chopper",
	];
	const brands = [
		"Yamaha",
		"Honda",
		"Suzuki",
		"Kawasaki",
		"BMW",
		"Ducati",
		"KTM",
		"Aprilia",
		"Triumph",
		"Harley-Davidson",
		"MV Agusta",
		"Benelli",
		"Moto Guzzi",
		"Indian",
		"Zero",
		"Energica",
		"Husqvarna",
		"Beta",
		"Sherco",
		"GasGas",
	];
	const fuelTypes = ["Benzină", "Electric", "Hibrid"];
	const transmissionTypes = ["Manual", "Automat", "Semi-automat"];
	const conditions = [
		"Nouă",
		"Excelentă",
		"Foarte bună",
		"Bună",
		"Satisfăcătoare",
	];

	const availabilityOptions = [
		{ value: "pe_stoc", label: "Pe stoc" },
		{ value: "la_comanda", label: "La comandă" },
	];

	const availableFeatures = [
		"ABS (sistem antiblocare frâne)",
		"Mansoane încălzite (TCS)",
		"Parbriz",
		"Șa încălzită",
		"Mansoane încălzite",
		"Pilot automat",
		"Priză USB/12V",
		"Genți laterale",
		"Topcase",
		"Crash bar",
		"Suport telefon",
		"Navigație",
		"Bluetooth",
		"Sistem audio",
		"Keyless start",
		"Quickshifter/blipper",
		"TPMS",
		"Antifurt",
		"Imobilizator",
		"Evacuare sport",
		"Kit LED / DRL-uri personalizate",
		"Handguards (apărători mâini)",
		"Crash pads / frame sliders",
		"Bare protecție motor",
		"Scărițe reglabile",
	];

	// Mapare pentru valorile din baza de date
	const mapValueForDatabase = (field: string, value: string): string => {
		switch (field) {
			case "category":
				return value.toLowerCase();

			case "fuel":
				const fuelMap: Record<string, string> = {
					Benzină: "benzina",
					Electric: "electric",
					Hibrid: "hibrid",
				};
				return fuelMap[value] || value.toLowerCase();

			case "transmission":
				const transmissionMap: Record<string, string> = {
					Manual: "manuala",
					Automat: "automata",
					"Semi-automat": "semi-automata",
				};
				return transmissionMap[value] || value.toLowerCase();

			case "condition":
				const conditionMap: Record<string, string> = {
					Nouă: "noua",
					Excelentă: "excelenta",
					"Foarte bună": "foarte_buna",
					Bună: "buna",
					Satisfăcătoare: "satisfacatoare",
				};
				return conditionMap[value] || value.toLowerCase();

			default:
				return value;
		}
	};

	const validateStep = (step: number): boolean => {
		const newErrors: Record<string, string> = {};

		switch (step) {
			case 1:
				if (!formData.title.trim()) newErrors.title = "Titlul este obligatoriu";
				if (formData.title.length > 100)
					newErrors.title = "Titlul nu poate depăși 100 de caractere";

				if (!formData.category)
					newErrors.category = "Categoria este obligatorie";
				if (!formData.brand) newErrors.brand = "Marca este obligatorie";
				if (!formData.model.trim())
					newErrors.model = "Modelul este obligatoriu";

				if (!formData.year) {
					newErrors.year = "Anul este obligatoriu";
				} else {
					const year = parseInt(formData.year);
					const currentYear = new Date().getFullYear();
					if (year < 1990 || year > currentYear + 1) {
						newErrors.year = `Anul trebuie să fie între 1990 și ${
							currentYear + 1
						}`;
					}
				}

				if (!formData.mileage) {
					newErrors.mileage = "Kilometrajul este obligatoriu";
				} else {
					const mileage = parseInt(formData.mileage);
					if (mileage < 0 || mileage > 500000) {
						newErrors.mileage =
							"Kilometrajul trebuie să fie între 0 și 500,000 km";
					}
				}

				if (!formData.engine) {
					newErrors.engine = "Capacitatea motorului este obligatorie";
				} else {
					const engine = parseInt(formData.engine);
					if (engine < 50 || engine > 3000) {
						newErrors.engine =
							"Capacitatea motorului trebuie să fie între 50 și 3000 cc";
					}
				}

				if (!formData.fuel)
					newErrors.fuel = "Tipul de combustibil este obligatoriu";
				if (!formData.transmission)
					newErrors.transmission = "Transmisia este obligatorie";
				if (!formData.color.trim())
					newErrors.color = "Culoarea este obligatorie";
				if (!formData.condition)
					newErrors.condition = "Starea este obligatorie";
				if (!formData.location.trim()) {
					newErrors.location = "Locația este obligatorie";
				} else if (!romanianCities.includes(formData.location.trim())) {
					newErrors.location =
						"Te rugăm să selectezi un oraș din lista disponibilă";
				}

				// Verifică disponibilitatea pentru dealeri
				if (userProfile?.seller_type === "dealer" && !formData.availability) {
					newErrors.availability =
						"Disponibilitatea este obligatorie pentru dealeri";
				}
				break;

			case 2:
				if (imageFiles.length === 0) {
					newErrors.images = "Trebuie să adaugi cel puțin o fotografie";
				}
				break;

			case 3:
				if (!formData.price) {
					newErrors.price = "Prețul este obligatoriu";
				} else {
					const price = parseFloat(formData.price);
					if (price < 100 || price > 1000000) {
						newErrors.price =
							"Prețul trebuie să fie între 100 și 1,000,000 EUR";
					}
				}

				// Descrierea nu mai este obligatorie
				if (
					formData.description.trim().length > 0 &&
					formData.description.length > 2000
				) {
					newErrors.description =
						"Descrierea nu poate depăși 2000 de caractere";
				}
				break;

			case 4:
				if (!formData.phone.trim()) {
					newErrors.phone = "Numărul de telefon este obligatoriu";
				} else if (
					!/^[0-9+\-\s()]{10,15}$/.test(formData.phone.replace(/\s/g, ""))
				) {
					newErrors.phone = "Numărul de telefon nu este valid";
				}

				if (!formData.email.trim()) {
					newErrors.email = "Email-ul este obligatoriu";
				} else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
					newErrors.email = "Email-ul nu este valid";
				}
				break;
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleInputChange = (field: string, value: string) => {
		setFormData((prev) => ({ ...prev, [field]: value }));

		// Clear error when user starts typing
		if (errors[field]) {
			setErrors((prev) => ({ ...prev, [field]: "" }));
		}
	};

	const handleFeatureToggle = (feature: string) => {
		setFormData((prev) => ({
			...prev,
			features: prev.features.includes(feature)
				? prev.features.filter((f) => f !== feature)
				: [...prev.features, feature],
		}));
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		if (files && imageFiles.length < 5) {
			const newImageFiles = Array.from(files).slice(0, 5 - imageFiles.length);

			// Verificăm fiecare fișier
			for (const file of newImageFiles) {
				// Validare dimensiune (max 5MB)
				if (file.size > 5 * 1024 * 1024) {
					setErrors((prev) => ({
						...prev,
						images: "Fișierul nu poate depăși 5MB",
					}));
					return;
				}

				// Validare tip fișier
				if (!file.type.startsWith("image/")) {
					setErrors((prev) => ({
						...prev,
						images: "Doar fișiere imagine sunt permise",
					}));
					return;
				}
			}

			// Adăugăm fișierele valide
			setImageFiles((prev) => [...prev, ...newImageFiles]);

			// Generăm URL-uri pentru previzualizare
			newImageFiles.forEach((file) => {
				const reader = new FileReader();
				reader.onload = (e) => {
					if (e.target?.result) {
						setImages((prev) => [...prev, e.target!.result as string]);
						// Clear image errors when successfully adding
						setErrors((prev) => ({ ...prev, images: "" }));
					}
				};
				reader.readAsDataURL(file);
			});
		}
	};

	const removeImage = (index: number) => {
		setImages((prev) => prev.filter((_, i) => i !== index));
		setImageFiles((prev) => prev.filter((_, i) => i !== index));
	};

	const nextStep = () => {
		if (validateStep(currentStep)) {
			if (currentStep < 4) setCurrentStep(currentStep + 1);
		}
	};

	const prevStep = () => {
		if (currentStep > 1) setCurrentStep(currentStep - 1);
	};

	// ... alte logici ...

	const handleSubmit = async () => {
		if (!validateStep(4)) return;

		// Setăm flag-ul pentru a preveni reîncărcarea
		sessionStorage.setItem('isSubmittingListing', 'true');
		setIsSubmitting(true);

		try {
			// Verificăm din nou dacă procesul nu a fost deja inițiat
			if (sessionStorage.getItem('submissionInProgress') === 'true') {
				console.log('🚫 Submission already in progress, preventing duplicate');
				return;
			}

			// Setăm flag-urile pentru a preveni reîncărcarea și duplicate submissions
			sessionStorage.setItem('isSubmittingListing', 'true');
			sessionStorage.setItem('submissionInProgress', 'true');
			setIsSubmitting(true);

			try {
				if (!userProfile) {
					throw new Error("Profilul utilizatorului nu a fost găsit");
				}

				const { data: authUser, error: authError } =
					await supabase.auth.getUser();

				if (authError || !authUser) {
					console.error(
						"❌ Eroare la obținerea utilizatorului curent:",
						authError,
					);
					throw new Error("Utilizatorul nu este autentificat");
				}

				console.log("🔐 UID din auth:", authUser.user.id);
				console.log("🆔 seller_id din profil (user_id):", userProfile.user_id); // Log the correct user_id
				console.log("🆔 id-ul profilului (id):", userProfile.id); // Log the profile id

				if (userProfile.user_id !== authUser.user.id) {
					console.error("🚫 Mismatch între userProfile.user_id și auth.uid()");
					throw new Error("UID mismatch: seller_id diferit de auth.uid()");
				}

				console.log("🚀 Starting listing creation...");
				console.log("📋 Form data before mapping:", formData);

				// Pregătim datele pentru anunț cu maparea corectă
				const listingData = {
					title: formData.title.trim(),
					description: formData.description.trim() || "",
					price: parseFloat(formData.price),
					year: parseInt(formData.year),
					mileage: parseInt(formData.mileage),
					location: formData.location.trim(),
					category: mapValueForDatabase("category", formData.category),
					brand: formData.brand,
					model: formData.model.trim(),
					engine_capacity: parseInt(formData.engine),
					fuel_type: mapValueForDatabase("fuel", formData.fuel),
					transmission: mapValueForDatabase(
						"transmission",
						formData.transmission,
					),
					condition: mapValueForDatabase("condition", formData.condition),
					color: formData.color.trim(),
					features: formData.features,
					seller_id: userProfile.id, // AICI ESTE CORECȚIA: Folosește userProfile.user_id
					seller_name: userProfile.name || "Utilizator",
					seller_type: userProfile.seller_type,
					status: "pending",
					availability: availabilityValue,
				};

				console.log("availability:", listingData.availability);
				console.log("📝 Mapped listing data:", listingData);

				// Trimitem anunțul și imaginile la server
				console.log(
					"📤 Trimit date către listings.create:",
					listingData,
					imageFiles,
				);
				console.log("🔥 seller_id înainte de inserție:", listingData.seller_id);
				console.log("🔐 authUser.user.id înainte de inserție:", authUser.user.id);
				console.log("🔎 seller_id TRIMIS (corectat):", listingData.seller_id);

				const result = await listings.create(listingData, imageFiles);
				console.log("📬 Răspuns complet listings.create:", result);

				const { data, error } = result;
				console.log("📬 Răspuns de la server:", data, error);

				if (error) {
					console.error("❌ Error creating listing:", error);
					throw new Error(error.message || "Eroare la crearea anunțului");
				}

				console.log("✅ Listing created successfully:", data);

				setCreatedListingId(data.id);
				setShowSuccessModal(true);
			} catch (error: any) {
				console.error("💥 Error creating listing:", error);

				// Afișează alert la client
				alert(
					"Eroare la trimiterea anunțului: " + (error.message || "necunoscută"),
				);

				// Salvează eroarea în tabelul 'error_logs' (dacă e autentificat)
				try {
					const { data: authUser } = await supabase.auth.getUser();
					if (authUser?.user?.id) {
						await supabase.from("error_logs").insert([
							{
								user_id: authUser.user.id,
								message: error.message || "Eroare necunoscută",
								full_error: JSON.stringify(error),
								created_at: new Date().toISOString(),
							},
						]);
						console.log("✅ Eroarea a fost salvată în Supabase");
					}
				} catch (logError) {
					console.warn("❗ Nu am putut salva eroarea în Supabase:", logError);
				}

				// Afișează în pagină mesajul complet
				setErrors({
					submit:
						"Detalii tehnice: " +
						JSON.stringify(error, null, 2) +
						"\nMesaj: " +
						(error.message ||
							"A apărut o eroare necunoscută la publicarea anunțului."),
				});
			} finally {
				// Curățăm flag-ul și resetăm starea
				sessionStorage.removeItem('isSubmittingListing');
				setIsSubmitting(false);
			}
		} finally {
			// Curățăm flag-ul și resetăm starea
			sessionStorage.removeItem('isSubmittingListing');
			setIsSubmitting(false);
		}
	};

	const handleSuccessModalClose = () => {
		setShowSuccessModal(false);
	};

	const handleGoHome = () => {
		setShowSuccessModal(false);
		navigate("/");
	};

	const handleViewListing = () => {
		if (createdListingId) {
			setShowSuccessModal(false);
			navigate(`/anunt/${createdListingId}`);
		}
	};

	// Loading state
	if (isLoadingProfile) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-2xl shadow-lg text-center">
					<div className="w-16 h-16 border-4 border-nexar-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
					<p className="text-gray-600">Se încarcă datele profilului...</p>
				</div>
			</div>
		);
	}

	// No profile found
	if (!userProfile) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="bg-white p-8 rounded-2xl shadow-lg text-center max-w-md">
					<AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
					<h2 className="text-2xl font-bold text-gray-900 mb-2">
						Profil incomplet
					</h2>
					<p className="text-gray-600 mb-6">
						{errors.profile ||
							"Pentru a adăuga un anunț, trebuie să îți completezi profilul mai întâi."}
					</p>
					<div className="flex flex-col sm:flex-row gap-4">
						<button
							onClick={() => navigate("/profil")}
							className="bg-nexar-accent text-white px-6 py-3 rounded-lg font-semibold hover:bg-nexar-gold transition-colors"
						>
							Completează Profilul
						</button>
						<FixSupabaseButton buttonText="Repară Conexiunea" />
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
						Adaugă Anunț Nou
					</h1>
					<p className="text-gray-600 text-lg">
						Completează formularul pentru a-ți publica motocicleta
					</p>

					{/* User Info Display */}
					<div className="mt-4 inline-flex items-center space-x-3 bg-white rounded-lg px-4 py-2 shadow-sm border">
						<div className="w-8 h-8 bg-nexar-accent rounded-full flex items-center justify-center text-white font-semibold text-sm">
							{userProfile.name
								? userProfile.name.charAt(0).toUpperCase()
								: "U"}
						</div>
						<div className="text-left">
							<div className="font-semibold text-gray-900">
								{userProfile.name}
							</div>
							<div className="text-xs text-gray-600">
								{userProfile.seller_type === "dealer"
									? "Dealer Verificat"
									: "Vânzător Privat"}
							</div>
						</div>
					</div>
				</div>

				{/* Progress Steps */}
				<div className="mb-8">
					<div className="flex items-center justify-between">
						{steps.map((step, index) => (
							<div key={step.id} className="flex items-center">
								<div
									className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
										currentStep >= step.id
											? "bg-gray-900 border-gray-900 text-white"
											: "border-gray-300 text-gray-400"
									}`}
								>
									{currentStep > step.id ? (
										<Check className="h-5 w-5" />
									) : (
										<span className="font-semibold">{step.id}</span>
									)}
								</div>
								{index < steps.length - 1 && (
									<div
										className={`w-full h-1 mx-4 transition-colors ${
											currentStep > step.id ? "bg-gray-900" : "bg-gray-300"
										}`}
									/>
								)}
							</div>
						))}
					</div>
					<div className="mt-4 text-center">
						<h2 className="text-xl font-semibold text-gray-900">
							{steps[currentStep - 1].title}
						</h2>
						<p className="text-gray-600">
							{steps[currentStep - 1].description}
						</p>
					</div>
				</div>

				{/* Form Content */}
				<div className="bg-white rounded-2xl shadow-lg p-8">
					{/* Step 1: Basic Information */}
					{currentStep === 1 && (
						<div className="space-y-6 animate-fade-in">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Titlu anunț *
									</label>
									<input
										type="text"
										value={formData.title}
										onChange={(e) => handleInputChange("title", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.title ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="ex: Yamaha YZF-R1 2023"
										maxLength={100}
									/>
									{errors.title && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.title}
										</p>
									)}
									<p className="mt-1 text-xs text-gray-500">
										{formData.title.length}/100 caractere
									</p>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Categorie *
									</label>
									<select
										value={formData.category}
										onChange={(e) =>
											handleInputChange("category", e.target.value)
										}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.category ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Selectează categoria</option>
										{categories.map((cat) => (
											<option key={cat} value={cat}>
												{cat}
											</option>
										))}
									</select>
									{errors.category && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.category}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Marcă *
									</label>
									<select
										value={formData.brand}
										onChange={(e) => handleInputChange("brand", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.brand ? "border-red-500" : "border-gray-300"
										}`}
									>
										<option value="">Selectează marca</option>
										{brands.map((brand) => (
											<option key={brand} value={brand}>
												{brand}
											</option>
										))}
									</select>
									{errors.brand && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.brand}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Model *
									</label>
									<input
										type="text"
										value={formData.model}
										onChange={(e) => handleInputChange("model", e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.model ? "border-red-500" : "border-gray-300"
										}`}
										placeholder="ex: YZF-R1"
									/>
									{errors.model && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.model}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										An fabricație *
									</label>
									<input
										type="number"
										value={formData.year}
										onChange={(e) => handleInputChange("year", e.target.value)}
										className={
