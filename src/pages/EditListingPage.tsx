import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Store, Clock, Upload, X } from 'lucide-react';
import SuccessModal from '../components/SuccessModal';

// Lista de mărci de motociclete
const motorcycleBrands = [
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

const availabilityOptions = [
  {
    value: "pe_stoc",
    label: "Pe stoc",
    icon: Store
  },
  {
    value: "la_comanda",
    label: "La comandă",
    icon: Clock
  }
];

const features = [
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
    "Scărițe reglabile"
];

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [sellerType, setSellerType] = useState('individual');
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    brand: '',
    model: '',
    year: '',
    price: '',
    mileage: '',
    engine_capacity: '',
    fuel_type: '',
    transmission: '',
    color: '',
    availability: 'pe_stoc',
    description: '',
    features: [] as string[],
    images: [] as string[]
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [imagesToRemove, setImagesToRemove] = useState<string[]>([]);

  useEffect(() => {
    loadListing();
  }, [id]);
  
  useEffect(() => {
    // Update the form data when sellerType changes
    if (sellerType === 'dealer' && formData.availability === undefined) {
      setFormData(prev => ({
        ...prev,
        availability: 'pe_stoc'
      }));
    }
  }, [sellerType]);

  const loadListing = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          id: data.id,
          title: data.title || '',
          brand: data.brand || '',
          model: data.model || '',
          year: data.year?.toString() || '',
          price: data.price?.toString() || '',
          mileage: data.mileage?.toString() || '',
          engine_capacity: data.engine_capacity?.toString() || '',
          fuel_type: data.fuel_type || '',
          transmission: data.transmission || '',
          color: data.color || '',
          availability: data.availability || 'pe_stoc',
          description: data.description || '',
          features: data.features || [],
          images: data.images || []
        });
        
        setSellerType(data.seller_type || 'individual');
      }
    } catch (error) {
      console.error('Error loading listing:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const uploadedUrls: string[] = [];

    // Verificăm dacă am atins limita de 10 imagini
    if (files.length + formData.images.length - imagesToRemove.length > 10) {
      alert('Poți încărca maximum 10 imagini');
      setUploading(false);
      return;
    }

    try {
      for (const file of Array.from(files)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Math.random()}.${fileExt}`;
        const filePath = `listings/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('listing-images')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('listing-images')
          .getPublicUrl(filePath);

        uploadedUrls.push(data.publicUrl);
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Error uploading images:', error);
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const imageToRemove = formData.images[index];
    setImagesToRemove(prev => [...prev, imageToRemove]);
    setFormData(prev => ({ 
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleFeatureToggle = (feature: string) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.includes(feature)
        ? prev.features.filter(f => f !== feature)
        : [...prev.features, feature]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    // Setăm flag-urile pentru a preveni reîncărcarea și duplicate submissions
    sessionStorage.setItem('isSubmittingListing', 'true');
    sessionStorage.setItem('submissionInProgress', 'true');
    setLoading(true);
    
    try {
      const { error } = await supabase
      .from('listings')
      .update({
        title: formData.title,
        brand: formData.brand,
        model: formData.model,
        year: parseInt(formData.year),
        price: parseFloat(formData.price),
        mileage: parseInt(formData.mileage),
        engine_capacity: parseInt(formData.engine_capacity),
        fuel_type: formData.fuel_type,
        transmission: formData.transmission,
        color: formData.color,
        availability: formData.availability,
        description: formData.description,
        features: formData.features, 
        images: formData.images,
        updated_at: new Date().toISOString(),
        status: "pending" // Setăm statusul la pending pentru a aștepta aprobarea
      })
      .eq('id', id);

      if (error) throw error;

      setShowSuccessModal(true);
      
    } catch (error) {
      console.error('Error updating listing:', error);
      alert('A apărut o eroare la actualizarea anunțului. Te rugăm să încerci din nou.');
    } finally {
      // Curățăm flag-urile
      sessionStorage.removeItem('isSubmittingListing');
      sessionStorage.removeItem('submissionInProgress');
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
  };

  const handleGoHome = () => {
    navigate('/');
  };

  const handleViewListing = () => {
    navigate(`/anunt/${id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Se încarcă anunțul...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Editează anunțul</h1>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Titlu anunț *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Marcă *
                </label>
                <select
                  name="brand"
                  value={formData.brand}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Selectează marca</option>
                  {motorcycleBrands.map(brand => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model *
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  An fabricație *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="1900"
                  max={new Date().getFullYear()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preț (EUR) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kilometraj
                </label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacitate motor (cc)
                </label>
                <input
                  type="number"
                  name="engine_capacity"
                  value={formData.engine_capacity}
                  onChange={handleInputChange}
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tip combustibil
                </label>
                <select
                  name="fuel_type"
                  value={formData.fuel_type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Selectează</option>
                  <option value="benzina">Benzină</option>
                  <option value="electric">Electric</option>
                  <option value="hibrid">Hibrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transmisie
                </label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  <option value="">Selectează</option>
                  <option value="manuala">Manuală</option>
                  <option value="automata">Automată</option>
                  <option value="semi-automata">Semi-automată</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Culoare
                </label>
                <input
                  type="text"
                  name="color"
                  value={formData.color}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 ${sellerType === 'dealer' ? '' : 'hidden'}`}>
                  Disponibilitate
                </label>
                <div className={sellerType === 'dealer' ? '' : 'hidden'}>
                  <select
                  name="availability"
                  value={formData.availability}
                  onChange={handleInputChange}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                  >
                  {availabilityOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descriere
              </label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Descriere detaliată a motocicletei..."
              />
            </div>

            {/* Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Caracteristici și accesorii
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {features.map(feature => (
                  <label key={feature} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.features.includes(feature)}
                      onChange={() => handleFeatureToggle(feature)}
                      className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                    />
                    <span className="text-sm text-gray-700">{feature}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Images */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4">
                Imagini
              </label>
              
              {/* Current Images */}
              {formData.images.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Imagine ${index + 1}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Upload New Images */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label
                  htmlFor="image-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <Upload className="w-12 h-12 text-gray-400 mb-4" />
                  <p className="text-sm text-gray-600 text-center">
                    {uploading ? 'Se încarcă...' : 'Faceți clic pentru a încărca imagini sau trageți și plasați aici'}
                  </p>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/anunt/${id}`)}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Anulează
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {loading ? 'Se salvează...' : 'Salvează modificările'}
              </button>
            </div>
          </form>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          onGoHome={handleGoHome}
          onViewListing={handleViewListing}
          title="Modificări salvate!"
          message="Modificările tale au fost trimise spre aprobare. Anunțul va fi actualizat după ce va fi revizuit de echipa noastră."
          showViewButton={true}
        />
      )}
    </div>
  );
};

export default EditListingPage;