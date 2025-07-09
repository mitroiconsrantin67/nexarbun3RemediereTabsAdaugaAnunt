import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Search, Filter, X, ChevronDown, ChevronUp, MapPin, Calendar, Gauge, Fuel, Settings, Building, User, Check, AlertTriangle, RefreshCw, Store, Clock, Tag } from 'lucide-react';
import { listings, enhancedListings, romanianCities } from '../lib/supabase';
import NetworkErrorHandler from '../components/NetworkErrorHandler';

const SearchPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [allListings, setAllListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    category: '',
    location: '',
    priceMin: '',
    priceMax: '',
    yearMin: '',
    yearMax: '',
    mileageMax: '',
    engineMin: '',
    engineMax: '',
    sellerType: '',
    fuel: '',
    transmission: '',
    condition: '',
    brand: '',
    model: ''
  });

  const itemsPerPage = 12;

  // Lista mărcilor de motociclete
  const motorcycleBrands = [
    'Yamaha', 'Honda', 'BMW', 'Ducati', 'KTM', 'Suzuki', 'Kawasaki', 
    'Harley-Davidson', 'Triumph', 'Aprilia', 'Husqvarna', 'Beta',
    'Sherco', 'Gas Gas', 'TM Racing', 'Husaberg', 'MV Agusta',
    'Moto Guzzi', 'Indian', 'Victory', 'Buell', 'Erik Buell Racing',
    'Zero', 'Energica', 'Lightning', 'Alta Motors', 'Cake'
  ];

  // Încărcare date la mount și când se schimbă filtrele
  useEffect(() => {
    loadListings();
  }, []);

  // Parsare parametri URL
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const query = urlParams.get('q') || '';
    const category = urlParams.get('category') || '';
    const locationParam = urlParams.get('location') || '';
    
    setSearchQuery(query);
    setFilters(prev => ({
      ...prev,
      category,
      location: locationParam
    }));
  }, [location.search]);

  const loadListings = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error: supabaseError } = await enhancedListings.getAll();
      
      if (supabaseError) {
        throw supabaseError;
      }
      
      setAllListings(data || []);
    } catch (err) {
      console.error('Error loading listings:', err);
      setError('Nu s-au putut încărca anunțurile. Te rugăm să încerci din nou.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setFilters({
      category: '',
      location: '',
      priceMin: '',
      priceMax: '',
      yearMin: '',
      yearMax: '',
      mileageMax: '',
      engineMin: '',
      engineMax: '',
      sellerType: '',
      fuel: '',
      transmission: '',
      condition: '',
      brand: '',
      model: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
    navigate('/cautare', { replace: true });
  };

  // Filtrare și căutare
  const filteredListings = React.useMemo(() => {
    return allListings.filter(listing => {
      // Căutare în text
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = !searchQuery || 
        listing.title?.toLowerCase().includes(searchLower) ||
        listing.brand?.toLowerCase().includes(searchLower) ||
        listing.model?.toLowerCase().includes(searchLower) ||
        listing.category?.toLowerCase().includes(searchLower) ||
        listing.location?.toLowerCase().includes(searchLower) ||
        listing.seller_name?.toLowerCase().includes(searchLower);

      // Filtre
      const matchesCategory = !filters.category || 
        listing.category?.toLowerCase() === filters.category.toLowerCase();
      
      const matchesLocation = !filters.location || 
        listing.location?.toLowerCase().includes(filters.location.toLowerCase());
      
      const matchesPrice = 
        (!filters.priceMin || listing.price >= parseInt(filters.priceMin)) &&
        (!filters.priceMax || listing.price <= parseInt(filters.priceMax));
      
      const matchesYear = 
        (!filters.yearMin || listing.year >= parseInt(filters.yearMin)) &&
        (!filters.yearMax || listing.year <= parseInt(filters.yearMax));
      
      const matchesMileage = !filters.mileageMax || 
        listing.mileage <= parseInt(filters.mileageMax);
      
      const matchesEngine = 
        (!filters.engineMin || listing.engine_capacity >= parseInt(filters.engineMin)) &&
        (!filters.engineMax || listing.engine_capacity <= parseInt(filters.engineMax));
      
      const matchesSellerType = !filters.sellerType || 
        listing.seller_type === filters.sellerType;
      
      const matchesFuel = !filters.fuel || 
        listing.fuel_type?.toLowerCase() === filters.fuel.toLowerCase();
      
      const matchesTransmission = !filters.transmission || 
        listing.transmission?.toLowerCase() === filters.transmission.toLowerCase();
      
      const matchesCondition = !filters.condition || 
        listing.condition?.toLowerCase() === filters.condition.toLowerCase();

      const matchesBrand = !filters.brand || 
        listing.brand?.toLowerCase() === filters.brand.toLowerCase();

      const matchesModel = !filters.model || 
        listing.model?.toLowerCase().includes(filters.model.toLowerCase());

      return matchesSearch && matchesCategory && matchesLocation && 
             matchesPrice && matchesYear && matchesMileage && matchesEngine &&
             matchesSellerType && matchesFuel && matchesTransmission && 
             matchesCondition && matchesBrand && matchesModel;
    });
  }, [searchQuery, filters, allListings]);

  // Paginare
  const totalPages = Math.ceil(filteredListings.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentListings = filteredListings.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (error) {
    return <NetworkErrorHandler onRetry={loadListings} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header de căutare */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Caută motociclete după marcă, model, categorie..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-nexar-accent focus:border-transparent text-lg"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2 bg-nexar-accent text-white px-4 py-3 rounded-lg hover:bg-nexar-gold transition-colors"
              >
                <Filter className="h-5 w-5" />
                <span>Filtre</span>
              </button>
              
              <div className="text-sm text-gray-600">
                {filteredListings.length} rezultate
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar cu filtre */}
          <div className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Filtrează Rezultatele</h2>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {showFilters ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </button>
              </div>
              
              {showFilters && (
                <div className="space-y-4">
                  {/* Filtru Tip Vânzător (Dealer/Privat) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tip dealer/privat
                    </label>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleFilterChange('sellerType', filters.sellerType === 'dealer' ? '' : 'dealer')}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border transition-colors ${
                          filters.sellerType === 'dealer'
                            ? 'bg-nexar-accent text-white border-nexar-accent'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <Building className="h-4 w-4" />
                        <span className="text-sm">Dealer</span>
                      </button>
                      <button
                        onClick={() => handleFilterChange('sellerType', filters.sellerType === 'private' ? '' : 'private')}
                        className={`flex-1 flex items-center justify-center space-x-2 py-2 px-3 rounded-lg border transition-colors ${
                          filters.sellerType === 'private'
                            ? 'bg-nexar-accent text-white border-nexar-accent'
                            : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <User className="h-4 w-4" />
                        <span className="text-sm">Privat</span>
                      </button>
                    </div>
                  </div>

                  {/* Filtru Brand */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Brand
                    </label>
                    <select
                      value={filters.brand}
                      onChange={(e) => handleFilterChange('brand', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nexar-accent focus:border-transparent"
                    >
                      <option value="">Toate mărcile</option>
                      {motorcycleBrands.map(brand => (
                        <option key={brand} value={brand}>{brand}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtru Model */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Model
                    </label>
                    <input
                      type="text"
                      placeholder="Model"
                      value={filters.model}
                      onChange={(e) => handleFilterChange('model', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nexar-accent focus:border-transparent"
                    />
                  </div>

                  {/* Filtru An */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      An
                    </label>
                    <input
                      type="number"
                      placeholder="An fabricație"
                      value={filters.yearMin}
                      onChange={(e) => handleFilterChange('yearMin', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nexar-accent focus:border-transparent"
                    />
                  </div>

                  {/* Filtru Capacitate Motor (cc) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      cc
                    </label>
                    <input
                      type="number"
                      placeholder="Capacitate motor (cc)"
                      value={filters.engineMin}
                      onChange={(e) => handleFilterChange('engineMin', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nexar-accent focus:border-transparent"
                    />
                  </div>

                  {/* Filtru Preț */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Preț
                    </label>
                    <input
                      type="number"
                      placeholder="Preț maxim (EUR)"
                      value={filters.priceMax}
                      onChange={(e) => handleFilterChange('priceMax', e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-nexar-accent focus:border-transparent"
                    />
                  </div>
                  
                  {/* Butoane de acțiune */}
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={clearFilters}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
                    >
                      <X className="h-4 w-4" />
                      <span>Resetează</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Conținut principal */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-nexar-accent"></div>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Nu am găsit rezultate
                </h3>
                <p className="text-gray-600 mb-6">
                  Încearcă să modifici criteriile de căutare sau filtrele.
                </p>
                <button
                  onClick={clearFilters}
                  className="bg-nexar-accent text-white px-6 py-3 rounded-lg hover:bg-nexar-gold transition-colors"
                >
                  Resetează filtrele
                </button>
              </div>
            ) : (
              <>
                {/* Grid cu anunțuri */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {currentListings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>

                {/* Paginare */}
                {totalPages > 1 && (
                  <div className="flex justify-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => goToPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Anterior
                      </button>
                      
                      {[...Array(totalPages)].map((_, index) => {
                        const page = index + 1;
                        return (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-2 rounded-lg ${
                              currentPage === page
                                ? 'bg-nexar-accent text-white'
                                : 'border border-gray-300 hover:bg-gray-50'
                            }`}
                          >
                            {page}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Următorul
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Componentă pentru cardul de anunț
const ListingCard = ({ listing }) => {
  const navigate = useNavigate();
  
  const handleClick = () => {
    navigate(`/anunt/${listing.id}`);
  };

  const getMainImage = () => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0];
    }
    return 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg';
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group border border-gray-100"
    >
      <div className="relative">
        <img
          src={getMainImage()}
          alt={listing.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            e.target.src = 'https://images.pexels.com/photos/2116475/pexels-photo-2116475.jpeg';
          }}
        />
        
        {/* Badge categorie */}
        <div className="absolute top-3 left-3">
          <span className="bg-nexar-accent text-white px-2 py-1 rounded-full text-xs font-semibold">
            {listing.category}
          </span>
        </div>

        {/* Badge tip vânzător */}
        <div className="absolute top-3 right-3">
          {listing.seller_type === 'dealer' ? (
            <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <Building className="h-3 w-3" />
              <span>DEALER</span>
            </div>
          ) : (
            <div className="bg-gray-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span>PRIVAT</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-nexar-accent transition-colors">
          {listing.title}
        </h3>
        
        <div className="text-2xl font-bold text-nexar-accent mb-3">
          €{listing.price?.toLocaleString()}
        </div>

        <div className="grid grid-cols-2 gap-3 text-sm text-gray-600 mb-3">
          <div className="flex items-center space-x-1">
            <Calendar className="h-4 w-4" />
            <span>{listing.year}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Gauge className="h-4 w-4" />
            <span>{listing.mileage?.toLocaleString()} km</span>
          </div>
          <div className="flex items-center space-x-1">
            <MapPin className="h-4 w-4" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Settings className="h-4 w-4" />
            <span>{listing.engine_capacity} cc</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <div className="w-6 h-6 bg-nexar-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
              {listing.seller_name?.charAt(0).toUpperCase()}
            </div>
            <span>{listing.seller_name}</span>
          </div>
          
          <div className="text-xs text-gray-500 flex items-center space-x-1">
            <Clock className="h-3 w-3" />
            <span>
              {new Date(listing.created_at).toLocaleDateString('ro-RO')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;