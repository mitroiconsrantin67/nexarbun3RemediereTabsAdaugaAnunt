import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Car, Upload, X, AlertTriangle, Check, MapPin, Calendar, Gauge, Fuel, Settings, FileText, Euro, Camera } from 'lucide-react';
import { listings, auth, romanianCities } from '../lib/supabase';

interface FormData {
	title: string;
	price: string;
	year: string;
	mileage: string;
	location: string;
	category: string;
	brand: string;
	model: string;
	engine_capacity: string;
	fuel_type: string;
	transmission: string;
	condition: string;
	description: string;
	availability: 'pe_stoc' | 'la_comanda';
}

interface FormErrors {
	[key: string]: string;
}

const CreateListingPage: React.FC = () => {
	const navigate = useNavigate();
	const [isLoading, setIsLoading] = useState(false);
	const [images, setImages] = useState<File[]>([]);
	const [imagePreviews, setImagePreviews] = useState<string[]>([]);
	const [errors, setErrors] = useState<FormErrors>({});
	const [isAuthenticated, setIsAuthenticated] = useState(false);

	const [formData, setFormData] = useState<FormData>({
		title: '',
		price: '',
		year: '',
		mileage: '',
		location: '',
		category: 'autoturisme',
		brand: '',
		model: '',
		engine_capacity: '',
		fuel_type: 'benzina',
		transmission: 'manuala',
		condition: 'folosit',
		description: '',
		availability: 'pe_stoc'
	});

	// Verificăm autentificarea la încărcarea componentei
	useEffect(() => {
		const checkAuth = async () => {
			const user = await auth.getCurrentUser();
			if (!user) {
				navigate('/auth');
				return;
			}
			setIsAuthenticated(true);
		};

		checkAuth();
	}, [navigate]);

	const categories = [
		{ value: 'autoturisme', label: 'Autoturisme' },
		{ value: 'motociclete', label: 'Motociclete' },
		{ value: 'camioane', label: 'Camioane' },
		{ value: 'autobuze', label: 'Autobuze' },
		{ value: 'remorci', label: 'Remorci' },
		{ value: 'utilaje', label: 'Utilaje' },
		{ value: 'piese', label: 'Piese auto' },
		{ value: 'accesorii', label: 'Accesorii' }
	];

	const fuelTypes = [
		{ value: 'benzina', label: 'Benzină' },
		{ value: 'motorina', label: 'Motorină' },
		{ value: 'hibrid', label: 'Hibrid' },
		{ value: 'electric', label: 'Electric' },
		{ value: 'gpl', label: 'GPL' },
		{ value: 'cng', label: 'CNG' }
	];

	const transmissionTypes = [
		{ value: 'manuala', label: 'Manuală' },
		{ value: 'automata', label: 'Automată' },
		{ value: 'cvt', label: 'CVT' }
	];

	const conditionTypes = [
		{ value: 'nou', label: 'Nou' },
		{ value: 'folosit', label: 'Folosit' },
		{ value: 'avariat', label: 'Avariat' }
	];

	const availabilityTypes = [
		{ value: 'pe_stoc', label: 'Pe stoc' },
		{ value: 'la_comanda', label: 'La comandă' }
	];

	const handleInputChange = (field: keyof FormData, value: string) => {
		setFormData(prev => ({ ...prev, [field]: value }));
		
		// Curățăm eroarea pentru câmpul modificat
		if (errors[field]) {
			setErrors(prev => ({ ...prev, [field]: '' }));
		}
	};

	const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = Array.from(e.target.files || []);
		
		if (files.length + images.length > 10) {
			alert('Poți încărca maximum 10 imagini');
			return;
		}

		// Verificăm dimensiunea fiecărui fișier (max 5MB)
		const maxSize = 5 * 1024 * 1024; // 5MB
		const validFiles = files.filter(file => {
			if (file.size > maxSize) {
				alert(`Imaginea ${file.name} este prea mare. Dimensiunea maximă este 5MB.`);
				return false;
			}
			return true;
		});

		setImages(prev => [...prev, ...validFiles]);

		// Creăm preview-uri pentru imaginile noi
		validFiles.forEach(file => {
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreviews(prev => [...prev, e.target?.result as string]);
			};
			reader.readAsDataURL(file);
		});
	};

	const removeImage = (index: number) => {
		setImages(prev => prev.filter((_, i) => i !== index));
		setImagePreviews(prev => prev.filter((_, i) => i !== index));
	};

	const validateForm = (): boolean => {
		const newErrors: FormErrors = {};

		// Validări obligatorii
		if (!formData.title.trim()) newErrors.title = 'Titlul este obligatoriu';
		if (!formData.price.trim()) newErrors.price = 'Prețul este obligatoriu';
		if (!formData.location.trim()) newErrors.location = 'Locația este obligatorie';
		if (!formData.brand.trim()) newErrors.brand = 'Marca este obligatorie';
		if (!formData.model.trim()) newErrors.model = 'Modelul este obligatoriu';
		if (!formData.description.trim()) newErrors.description = 'Descrierea este obligatorie';

		// Validări pentru vehicule
		if (formData.category !== 'piese' && formData.category !== 'accesorii') {
			if (!formData.year.trim()) newErrors.year = 'Anul este obligatoriu';
			if (!formData.mileage.trim()) newErrors.mileage = 'Kilometrajul este obligatoriu';
			if (!formData.engine_capacity.trim()) newErrors.engine_capacity = 'Capacitatea motorului este obligatorie';
		}

		// Validări numerice
		if (formData.price && isNaN(Number(formData.price))) {
			newErrors.price = 'Prețul trebuie să fie un număr valid';
		}

		if (formData.year && (isNaN(Number(formData.year)) || Number(formData.year) < 1990 || Number(formData.year) > new Date().getFullYear() + 1)) {
			newErrors.year = 'Anul trebuie să fie între 1990 și ' + (new Date().getFullYear() + 1);
		}

		if (formData.mileage && (isNaN(Number(formData.mileage)) || Number(formData.mileage) < 0)) {
			newErrors.mileage = 'Kilometrajul trebuie să fie un număr pozitiv';
		}

		if (formData.engine_capacity && (isNaN(Number(formData.engine_capacity)) || Number(formData.engine_capacity) <= 0)) {
			newErrors.engine_capacity = 'Capacitatea motorului trebuie să fie un număr pozitiv';
		}

		// Validare imagini
		if (images.length === 0) {
			newErrors.images = 'Adaugă cel puțin o imagine';
		}

		setErrors(newErrors);
		return Object.keys(newErrors).length === 0;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		if (!validateForm()) {
			return;
		}

		setIsLoading(true);

		try {
			const listingData = {
				...formData,
				price: Number(formData.price),
				year: formData.year ? Number(formData.year) : undefined,
				mileage: formData.mileage ? Number(formData.mileage) : 0,
				engine_capacity: formData.engine_capacity ? Number(formData.engine_capacity) : undefined,
			};

			const { data, error } = await listings.create(listingData, images);

			if (error) {
				throw error;
			}

			// Redirecționăm către pagina de anunțuri cu un mesaj de succes
			navigate('/listings?success=created');
		} catch (error: any) {
			console.error('Error creating listing:', error);
			alert(error.message || 'A apărut o eroare la crearea anunțului');
		} finally {
			setIsLoading(false);
		}
	};

	if (!isAuthenticated) {
		return (
			<div className="min-h-screen bg-gray-50 flex items-center justify-center">
				<div className="text-center">
					<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
					<p className="text-gray-600">Se verifică autentificarea...</p>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="bg-white rounded-lg shadow-sm border border-gray-200">
					<div className="px-6 py-4 border-b border-gray-200">
						<div className="flex items-center">
							<Car className="h-6 w-6 text-gray-900 mr-3" />
							<h1 className="text-2xl font-bold text-gray-900">Adaugă anunț nou</h1>
						</div>
						<p className="mt-2 text-sm text-gray-600">
							Completează formularul pentru a publica anunțul tău
						</p>
					</div>

					<form onSubmit={handleSubmit} className="p-6 space-y-8">
						{/* Informații de bază */}
						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<FileText className="h-5 w-5 mr-2" />
								Informații de bază
							</h2>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="md:col-span-2">
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Titlu anunț *
									</label>
									<input
										type="text"
										value={formData.title}
										onChange={(e) => handleInputChange('title', e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.title ? 'border-red-500' : 'border-gray-300'
										}`}
										placeholder="ex: BMW X5 2020, stare impecabilă"
									/>
									{errors.title && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.title}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Categorie *
									</label>
									<select
										value={formData.category}
										onChange={(e) => handleInputChange('category', e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
									>
										{categories.map(cat => (
											<option key={cat.value} value={cat.value}>
												{cat.label}
											</option>
										))}
									</select>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Preț (EUR) *
									</label>
									<div className="relative">
										<Euro className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<input
											type="number"
											value={formData.price}
											onChange={(e) => handleInputChange('price', e.target.value)}
											className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
												errors.price ? 'border-red-500' : 'border-gray-300'
											}`}
											placeholder="ex: 25000"
											min="0"
										/>
									</div>
									{errors.price && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.price}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Locație *
									</label>
									<div className="relative">
										<MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
										<select
											value={formData.location}
											onChange={(e) => handleInputChange('location', e.target.value)}
											className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
												errors.location ? 'border-red-500' : 'border-gray-300'
											}`}
										>
											<option value="">Selectează orașul</option>
											{romanianCities.map(city => (
												<option key={city} value={city}>
													{city}
												</option>
											))}
										</select>
									</div>
									{errors.location && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.location}
										</p>
									)}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Disponibilitate
									</label>
									<select
										value={formData.availability}
										onChange={(e) => handleInputChange('availability', e.target.value as 'pe_stoc' | 'la_comanda')}
										className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
									>
										{availabilityTypes.map(type => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>

						{/* Detalii vehicul */}
						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<Car className="h-5 w-5 mr-2" />
								Detalii vehicul
							</h2>
							
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Marca *
									</label>
									<input
										type="text"
										value={formData.brand}
										onChange={(e) => handleInputChange('brand', e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.brand ? 'border-red-500' : 'border-gray-300'
										}`}
										placeholder="ex: BMW"
									/>
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
										onChange={(e) => handleInputChange('model', e.target.value)}
										className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
											errors.model ? 'border-red-500' : 'border-gray-300'
										}`}
										placeholder="ex: X5"
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
										Stare
									</label>
									<select
										value={formData.condition}
										onChange={(e) => handleInputChange('condition', e.target.value)}
										className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
									>
										{conditionTypes.map(type => (
											<option key={type.value} value={type.value}>
												{type.label}
											</option>
										))}
									</select>
								</div>
							</div>
						</div>

						{/* Specificații tehnice - doar pentru vehicule */}
						{formData.category !== 'piese' && formData.category !== 'accesorii' && (
							<div>
								<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
									<Settings className="h-5 w-5 mr-2" />
									Specificații tehnice
								</h2>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Combustibil
										</label>
										<div className="relative">
											<Fuel className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
											<select
												value={formData.fuel_type}
												onChange={(e) => handleInputChange('fuel_type', e.target.value)}
												className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
											>
												{fuelTypes.map(type => (
													<option key={type.value} value={type.value}>
														{type.label}
													</option>
												))}
											</select>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Transmisie
										</label>
										<div className="relative">
											<Settings className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
											<select
												value={formData.transmission}
												onChange={(e) => handleInputChange('transmission', e.target.value)}
												className="w-full border border-gray-300 rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent"
											>
												{transmissionTypes.map(type => (
													<option key={type.value} value={type.value}>
														{type.label}
													</option>
												))}
											</select>
										</div>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Capacitate motor (cm³) *
										</label>
										<input
											type="number"
											value={formData.engine_capacity}
											onChange={(e) => handleInputChange('engine_capacity', e.target.value)}
											className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
												errors.engine_capacity ? 'border-red-500' : 'border-gray-300'
											}`}
											placeholder="ex: 2000"
											min="0"
										/>
										{errors.engine_capacity && (
											<p className="mt-1 text-sm text-red-600 flex items-center">
												<AlertTriangle className="h-4 w-4 mr-1" />
												{errors.engine_capacity}
											</p>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											An fabricație *
										</label>
										<div className="relative">
											<Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
											<input
												type="number"
												value={formData.year}
												onChange={(e) => handleInputChange('year', e.target.value)}
												className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
													errors.year ? 'border-red-500' : 'border-gray-300'
												}`}
												placeholder="ex: 2023"
												min="1990"
												max={new Date().getFullYear() + 1}
											/>
										</div>
										{errors.year && (
											<p className="mt-1 text-sm text-red-600 flex items-center">
												<AlertTriangle className="h-4 w-4 mr-1" />
												{errors.year}
											</p>
										)}
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-2">
											Kilometraj *
										</label>
										<div className="relative">
											<Gauge className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
											<input
												type="number"
												value={formData.mileage}
												onChange={(e) => handleInputChange('mileage', e.target.value)}
												className={`w-full border rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
													errors.mileage ? 'border-red-500' : 'border-gray-300'
												}`}
												placeholder="ex: 15000"
												min="0"
												max="500000"
											/>
										</div>
										{errors.mileage && (
											<p className="mt-1 text-sm text-red-600 flex items-center">
												<AlertTriangle className="h-4 w-4 mr-1" />
												{errors.mileage}
											</p>
										)}
									</div>
								</div>
							</div>
						)}

						{/* Descriere */}
						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<FileText className="h-5 w-5 mr-2" />
								Descriere
							</h2>
							
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-2">
									Descriere detaliată *
								</label>
								<textarea
									value={formData.description}
									onChange={(e) => handleInputChange('description', e.target.value)}
									rows={6}
									className={`w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-gray-900 focus:border-transparent ${
										errors.description ? 'border-red-500' : 'border-gray-300'
									}`}
									placeholder="Descrie vehiculul în detaliu: starea tehnică, dotările, istoricul, etc."
								/>
								{errors.description && (
									<p className="mt-1 text-sm text-red-600 flex items-center">
										<AlertTriangle className="h-4 w-4 mr-1" />
										{errors.description}
									</p>
								)}
							</div>
						</div>

						{/* Imagini */}
						<div>
							<h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
								<Camera className="h-5 w-5 mr-2" />
								Imagini
							</h2>
							
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-2">
										Adaugă imagini * (maximum 10)
									</label>
									<div className="flex items-center justify-center w-full">
										<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
											<div className="flex flex-col items-center justify-center pt-5 pb-6">
												<Upload className="w-8 h-8 mb-4 text-gray-500" />
												<p className="mb-2 text-sm text-gray-500">
													<span className="font-semibold">Click pentru a încărca</span> sau trage și lasă
												</p>
												<p className="text-xs text-gray-500">PNG, JPG sau JPEG (MAX. 5MB fiecare)</p>
											</div>
											<input
												type="file"
												className="hidden"
												multiple
												accept="image/*"
												onChange={handleImageUpload}
											/>
										</label>
									</div>
									{errors.images && (
										<p className="mt-1 text-sm text-red-600 flex items-center">
											<AlertTriangle className="h-4 w-4 mr-1" />
											{errors.images}
										</p>
									)}
								</div>

								{/* Preview imagini */}
								{imagePreviews.length > 0 && (
									<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
										{imagePreviews.map((preview, index) => (
											<div key={index} className="relative">
												<img
													src={preview}
													alt={`Preview ${index + 1}`}
													className="w-full h-24 object-cover rounded-lg border border-gray-200"
												/>
												<button
													type="button"
													onClick={() => removeImage(index)}
													className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
												>
													<X className="h-4 w-4" />
												</button>
											</div>
										))}
									</div>
								)}
							</div>
						</div>

						{/* Butoane */}
						<div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
							<button
								type="button"
								onClick={() => navigate('/listings')}
								className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
							>
								Anulează
							</button>
							<button
								type="submit"
								disabled={isLoading}
								className="flex-1 bg-gray-900 text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
							>
								{isLoading ? (
									<>
										<div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
										Se publică...
									</>
								) : (
									<>
										<Check className="h-5 w-5 mr-2" />
										Publică anunțul
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
};

export default CreateListingPage;