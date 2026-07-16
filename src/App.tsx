import { useState, useEffect } from 'react';
import './App.css';
import { Navbar } from './components/Navbar';
import { SearchHeader } from './components/SearchHeader';
import { CategorySlider } from './components/CategorySlider';
import { ListingGrid } from './components/ListingGrid';
import { FilterModal } from './components/FilterModal';
import type { FilterState } from './components/FilterModal';
import { AuthModal } from './components/AuthModal';
import { ListingDetail } from './components/ListingDetail';
import { BecomeHostWizard } from './components/BecomeHostWizard';
import { Footer } from './components/Footer';
import { locationListings, planningListings } from './data/listings';
import { Routes, Route, useNavigate, useParams, useLocation } from 'react-router-dom';
import type { Listing } from './types/listing';

function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [activeTab, setActiveTab] = useState<'location' | 'planning'>('location');
  const [activeCategory, setActiveCategory] = useState<string>('Rooftops');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [checkIn, setCheckIn] = useState<string>('');
  const [checkOut, setCheckOut] = useState<string>('');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  
  // Listings List State initialized with the static mock data
  const [listingsList, setListingsList] = useState<Listing[]>(() => [
    ...locationListings,
    ...planningListings,
  ]);

  const navigate = useNavigate();
  const location = useLocation();
  const isWizardRoute = location.pathname === '/become-a-host';

  // Detailed Filter State
  const [filters, setFilters] = useState<FilterState>({
    placeType: 'any',
    minPrice: 50,
    maxPrice: 1200,
    bedrooms: 1,
    beds: 1,
    adults: 1,
    children: 1,
    pets: 1,
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState<boolean>(false);
  const [wishlist, setWishlist] = useState<string[]>(() => {
    const saved = localStorage.getItem('wishlist');
    return saved ? JSON.parse(saved) : [];
  });

  // Handle dark mode side effects
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Persist wishlist
  useEffect(() => {
    localStorage.setItem('wishlist', JSON.stringify(wishlist));
  }, [wishlist]);

  // Wishlist toggle
  const handleWishlistToggle = (id: string) => {
    setWishlist((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Run mock loading state and set search parameters
  const handleSearchSubmit = (searchParams: { destination: string; checkIn: string; checkOut: string }) => {
    setIsLoading(true);
    setSearchQuery(searchParams.destination);
    setCheckIn(searchParams.checkIn);
    setCheckOut(searchParams.checkOut);

    // Simulate network query loading delay for skeletons
    setTimeout(() => {
      setIsLoading(false);
    }, 550);
  };

  const handleCategorySelect = (category: string) => {
    setIsLoading(true);
    setActiveCategory(category);
    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  const handleFilterApply = (appliedFilters: FilterState) => {
    setIsLoading(true);
    setFilters(appliedFilters);
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleTabChange = (tab: 'location' | 'planning') => {
    setIsLoading(true);
    setActiveTab(tab);
    navigate('/');
    
    // Reset filters to default state for the selected view context
    setActiveCategory('Rooftops');
    setSearchQuery('');
    setCheckIn('');
    setCheckOut('');
    setFilters({
      placeType: 'any',
      minPrice: 50,
      maxPrice: 1200,
      bedrooms: 1,
      beds: 1,
      adults: 1,
      children: 1,
      pets: 1,
    });

    setTimeout(() => {
      setIsLoading(false);
    }, 450);
  };

  const handleResetFilters = () => {
    setIsLoading(true);
    navigate('/');
    setActiveCategory('Rooftops');
    setSearchQuery('');
    setCheckIn('');
    setCheckOut('');
    setFilters({
      placeType: 'any',
      minPrice: 50,
      maxPrice: 1200,
      bedrooms: 1,
      beds: 1,
      adults: 1,
      children: 1,
      pets: 1,
    });
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleAddNewListing = (newListing: Listing) => {
    setListingsList((prev) => [newListing, ...prev]);
  };

  // Determine active datasource based on selected tab, including newly created listings
  const activeListingsSource = activeTab === 'location'
    ? listingsList.filter((l) => !planningListings.some((p) => p.id === l.id))
    : listingsList.filter((l) => planningListings.some((p) => p.id === l.id));

  // Filtering Logic
  const filteredListings = activeListingsSource.filter((listing) => {
    // 1. Category Filter
    if (activeCategory && listing.category !== activeCategory) {
      return false;
    }

    // 2. Search Query (Destination) Filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      const locationMatch = listing.location.toLowerCase().includes(query);
      const titleMatch = listing.title.toLowerCase().includes(query);
      if (!locationMatch && !titleMatch) {
        return false;
      }
    }

    // 3. Place Type Filter
    if (filters.placeType !== 'any') {
      const titleLower = listing.title.toLowerCase();
      if (filters.placeType === 'room') {
        const isRoom = titleLower.includes('room') || titleLower.includes('suite');
        if (!isRoom) return false;
      } else if (filters.placeType === 'entire') {
        const isEntire =
          titleLower.includes('apartment') ||
          titleLower.includes('cabin') ||
          titleLower.includes('condo') ||
          titleLower.includes('hotel') ||
          titleLower.includes('guesthouse') ||
          titleLower.includes('studios') ||
          titleLower.includes('reserve') ||
          titleLower.includes('stay');
        if (!isEntire) return false;
      }
    }

    // 4. Price range Filter
    if (listing.price < filters.minPrice || listing.price > filters.maxPrice) {
      return false;
    }

    // 5. Rooms and beds Count Filter
    if (listing.bedroomsCount < filters.bedrooms) {
      return false;
    }
    if (listing.bedsCount < filters.beds) {
      return false;
    }

    // 6. People capacity (Adults + Children) Filter
    const totalPeopleRequired = filters.adults + filters.children;
    if (listing.guestsCount < totalPeopleRequired) {
      return false;
    }

    return true;
  });

  // Listing Detail Wrapper component using hook params
  const ListingDetailWrapper = () => {
    const { id } = useParams<{ id: string }>();
    const listing = listingsList.find((l) => l.id === id);

    if (!listing) {
      return (
        <div className="mx-auto max-w-7xl px-6 py-16 text-center">
          <h3 className="text-xl font-bold text-foreground">Listing not found</h3>
          <button
            onClick={() => navigate('/')}
            className="mt-4 rounded-full bg-purple-950 text-white px-6 py-2.5 font-bold cursor-pointer"
          >
            Back to home
          </button>
        </div>
      );
    }

    return (
      <ListingDetail
        listing={listing}
        onBack={() => navigate('/')}
        onWishlistToggle={handleWishlistToggle}
        isWishlisted={wishlist.includes(listing.id)}
      />
    );
  };

  // If we are in the become-a-host step flow, render the wizard directly without main Nav/Footer
  if (isWizardRoute) {
    return (
      <Routes>
        <Route path="/become-a-host" element={<BecomeHostWizard onAddListing={handleAddNewListing} />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      {/* Navigation Header */}
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        onLoginClick={() => setIsAuthOpen(true)}
        isLoggedIn={isLoggedIn}
        onBecomeHostClick={() => navigate('/become-a-host')}
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        <Routes>
          <Route
            path="/"
            element={
              <>
                {/* Search Bar section */}
                <SearchHeader
                  activeSearch={{ destination: searchQuery, checkIn, checkOut }}
                  onSearch={handleSearchSubmit}
                  onFilterClick={() => setIsFilterModalOpen(true)}
                />

                {/* Accommodations horizontal category bar */}
                <CategorySlider
                  activeCategory={activeCategory}
                  onSelectCategory={handleCategorySelect}
                />

                {/* Listings listings grid */}
                <ListingGrid
                  listings={filteredListings}
                  isLoading={isLoading}
                  wishlist={wishlist}
                  onWishlistToggle={handleWishlistToggle}
                  onResetFilters={handleResetFilters}
                  activeDestination={searchQuery}
                  activeCategory={activeCategory}
                  activeTab={activeTab}
                  onListingClick={(listing) => navigate(`/listing/${listing.id}`)}
                />
              </>
            }
          />
          <Route path="/listing/:id" element={<ListingDetailWrapper />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />

      {/* Advanced Filter Modal with shadcn dialog */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApply={handleFilterApply}
        filteredCount={filteredListings.length}
      />

      {/* Authentication Modal with shadcn dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={() => {
          setIsLoggedIn(true);
        }}
      />
    </div>
  );
}

export default App;
