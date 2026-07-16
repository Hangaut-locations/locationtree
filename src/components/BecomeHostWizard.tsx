import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building, Trees, Waves, Mountain, Tv, Frame, Home, Ship, Tent, Search, Plus, Minus, HelpCircle } from 'lucide-react';
import type { Listing } from '../types/listing';

interface BecomeHostWizardProps {
  onAddListing: (newListing: Listing) => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;

export const BecomeHostWizard: React.FC<BecomeHostWizardProps> = ({ onAddListing }) => {
  const [step, setStep] = useState<WizardStep>(1);
  const navigate = useNavigate();

  // Form States
  const [category, setCategory] = useState<string>('Rooftops');
  const [spaceType, setSpaceType] = useState<'entire' | 'room' | 'shared'>('entire');
  const [location, setLocation] = useState<string>('');
  const [guests, setGuests] = useState<number>(1);
  const [bedrooms, setBedrooms] = useState<number>(1);
  const [beds, setBeds] = useState<number>(1);
  const [bathrooms, setBathrooms] = useState<number>(1);

  const categories = [
    { name: 'Rooftops', icon: Building },
    { name: 'Tree House', icon: Trees },
    { name: 'Beach front', icon: Waves },
    { name: 'Amazing views', icon: Mountain },
    { name: 'Studio', icon: Tv },
    { name: 'Frames', icon: Frame },
    { name: 'Homes', icon: Home },
    { name: 'Houseboat', icon: Ship },
    { name: 'Cabin', icon: Tent },
  ];

  const handleNext = () => {
    if (step < 5) {
      setStep((prev) => (prev + 1) as WizardStep);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as WizardStep);
    }
  };

  const handleExit = () => {
    if (window.confirm('Are you sure you want to save and exit?')) {
      navigate('/');
    }
  };

  const handleSubmit = () => {
    // Normalize location to match valid listing locations
    const normalizedLocation = (['Paris', 'Watford', 'London'].find(
      (loc) => loc.toLowerCase() === location.trim().toLowerCase()
    ) || 'Watford') as 'Paris' | 'Watford' | 'London';

    // Mock create a new listing object
    const newListing: Listing = {
      id: `mock-listing-${Date.now()}`,
      title: `Charming ${category} Stay`,
      location: normalizedLocation,
      price: 150 + Math.floor(Math.random() * 200),
      priceUnit: 'night',
      rating: 5.0,
      reviewsCount: 1,
      images: [
        'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
        'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=600&q=80',
      ],
      category: category,
      guestsCount: guests,
      bedroomsCount: bedrooms,
      bedsCount: beds,
    };

    onAddListing(newListing);
    alert('Congratulations! Your place is successfully listed on Hangout.');
    navigate('/');
  };

  // Check step validation
  const isStepValid = () => {
    if (step === 2) return !!category;
    if (step === 3) return !!spaceType;
    if (step === 4) {
      return ['paris', 'watford', 'london'].includes(location.trim().toLowerCase());
    }
    return true;
  };

  const renderCounterRow = (
    label: string,
    value: number,
    onChange: (val: number) => void,
    min = 1
  ) => {
    return (
      <div className="flex items-center justify-between border-b border-border/40 py-5">
        <span className="text-base font-black text-foreground">{label}</span>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onChange(Math.max(min, value - 1))}
            disabled={value <= min}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-all"
          >
            <Minus className="h-4.5 w-4.5" />
          </button>
          <span className="w-5 text-center text-base font-black text-foreground">{value}</span>
          <button
            type="button"
            onClick={() => onChange(value + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted active:scale-95 cursor-pointer transition-all"
          >
            <Plus className="h-4.5 w-4.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-300">
      
      {/* Wizard Header */}
      <header className="sticky top-0 z-45 w-full border-b border-border bg-background/95 backdrop-blur-md px-6 py-4 sm:px-8 flex items-center justify-between">
        <div className="flex items-center h-12 max-w-[150px] cursor-pointer" onClick={() => navigate('/')}>
          <img src="logo.png" alt="Hangout Logo" className="h-full w-full object-contain" />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert('Support line matches available agents.')}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-black text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <HelpCircle className="h-4 w-4" />
            <span>Questions?</span>
          </button>
          <button
            onClick={handleExit}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs font-black text-foreground hover:bg-muted transition-all cursor-pointer"
          >
            <span>Save & Exit</span>
          </button>
        </div>
      </header>

      {/* Progress Bar Indicator */}
      <div className="w-full bg-muted h-1">
        <div
          className="bg-purple-950 dark:bg-purple-650 h-full transition-all duration-300"
          style={{ width: `${(step / 5) * 100}%` }}
        />
      </div>

      {/* Wizard Body Container */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 sm:px-8">
        <div className="w-full max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
          
          {/* Step 1: Introduction */}
          {step === 1 && (
            <div className="space-y-6">
              <span className="text-sm font-black text-purple-950 dark:text-purple-300 uppercase tracking-widest block">
                Step 1
              </span>
              <h1 className="text-4xl font-black text-foreground tracking-tight leading-tight">
                Tell us about your place
              </h1>
              <p className="text-base font-semibold text-muted-foreground leading-relaxed max-w-xl">
                In this step, we’ll ask you what type of space you’re listing and whether
                guests will book the whole place or room. Then tell us the location and
                how many people it can accommodate.
              </p>
            </div>
          )}

          {/* Step 2: Category Selector */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-foreground tracking-tight text-center mb-8">
                Which of these best describes your place?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  const isSelected = category === cat.name;
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setCategory(cat.name)}
                      className={`flex flex-col items-center justify-center p-6 border rounded-2xl transition-all cursor-pointer hover:border-gray-400 active:scale-95 ${
                        isSelected
                          ? 'border-purple-950 dark:border-purple-600 bg-gray-100 dark:bg-muted/40 shadow-sm'
                          : 'border-border/80 bg-card'
                      }`}
                    >
                      <Icon className="h-7 w-7 text-foreground mb-3" />
                      <span className="text-xs font-black text-foreground">{cat.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 3: Space Type */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-foreground tracking-tight text-center mb-8">
                What type of place will guests have?
              </h2>
              <div className="space-y-4">
                {/* Option 1: Entire Place */}
                <button
                  type="button"
                  onClick={() => setSpaceType('entire')}
                  className={`w-full text-left p-6 border rounded-2xl transition-all cursor-pointer hover:border-gray-400 active:scale-[0.99] block ${
                    spaceType === 'entire'
                      ? 'border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10'
                      : 'border-border/80 bg-card'
                  }`}
                >
                  <h4 className="text-sm font-black text-foreground">An entire place</h4>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">
                    Guest have the whole place to themselves
                  </p>
                </button>

                {/* Option 2: Private Room */}
                <button
                  type="button"
                  onClick={() => setSpaceType('room')}
                  className={`w-full text-left p-6 border rounded-2xl transition-all cursor-pointer hover:border-gray-400 active:scale-[0.99] block ${
                    spaceType === 'room'
                      ? 'border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10'
                      : 'border-border/80 bg-card'
                  }`}
                >
                  <h4 className="text-sm font-black text-foreground">A room</h4>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">
                    Guest have their own room in their home, plus access to shared place
                  </p>
                </button>

                {/* Option 3: Shared Room */}
                <button
                  type="button"
                  onClick={() => setSpaceType('shared')}
                  className={`w-full text-left p-6 border rounded-2xl transition-all cursor-pointer hover:border-gray-400 active:scale-[0.99] block ${
                    spaceType === 'shared'
                      ? 'border-purple-950 dark:border-purple-600 bg-purple-950/5 dark:bg-purple-800/10'
                      : 'border-border/80 bg-card'
                  }`}
                >
                  <h4 className="text-sm font-black text-foreground">A shared room in a hostel</h4>
                  <p className="text-xs font-semibold text-muted-foreground mt-1">
                    Guests sleep in a shared room in a professionally managed hostel with staffs onsite 24/7
                  </p>
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Location Map */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center mb-6">
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  Where's your place located?
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  Your address is only shared with guests after they’ve made a reservation
                </p>
              </div>

              {/* Location Input */}
              <div className="flex flex-col gap-4 max-w-md mx-auto">
                <div className="flex items-center gap-3 border border-border/80 bg-card rounded-full px-5 py-3.5 transition-colors focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-600/10 w-full">
                  <Search className="h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search hangout location (e.g. Watford, Paris, London)"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full bg-transparent text-sm font-bold text-foreground outline-none border-none p-0 focus:ring-0"
                  />
                </div>

                {/* Predefined Location Suggestions */}
                <div className="flex flex-wrap justify-center gap-2">
                  {['Paris', 'Watford', 'London'].map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setLocation(loc)}
                      className={`px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer ${
                        location.toLowerCase() === loc.toLowerCase()
                          ? 'bg-purple-950 text-white border-purple-950 dark:bg-purple-800 dark:border-purple-800 shadow-sm'
                          : 'bg-card text-foreground border-border hover:bg-muted hover:border-gray-400'
                      }`}
                    >
                      {loc}
                    </button>
                  ))}
                </div>
              </div>

              {/* Map Preview widget matching screenshots */}
              <div className="rounded-3xl border border-border bg-card overflow-hidden shadow-sm aspect-video max-w-md mx-auto relative bg-[#e5e3df]">
                {/* Google Maps mock placeholder */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/-0.118092,51.509865,12,0/400x200?access_token=mock')` }}>
                  <div className="w-full h-full flex items-center justify-center relative">
                    <div className="h-8 w-8 rounded-full bg-red-500/20 flex items-center justify-center border-2 border-red-500 shadow-md">
                      <div className="h-3 w-3 rounded-full bg-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 5: Basics */}
          {step === 5 && (
            <div className="space-y-6">
              <div className="space-y-1.5 text-center mb-6">
                <h2 className="text-2xl font-black text-foreground tracking-tight">
                  Share some basics about your place
                </h2>
                <p className="text-xs font-semibold text-muted-foreground">
                  You'll add more details later, like bed types.
                </p>
              </div>

              {/* Basics configuration drawer */}
              <div className="max-w-md mx-auto divide-y divide-border/20">
                {renderCounterRow('Guests', guests, setGuests)}
                {renderCounterRow('Bedroom', bedrooms, setBedrooms)}
                {renderCounterRow('Beds', beds, setBeds)}
                {renderCounterRow('Bathrooms', bathrooms, setBathrooms)}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Fixed Footer Actions bar */}
      <footer className="border-t border-border/60 bg-card py-5 px-6 sm:px-8 mt-auto">
        <div className="w-full max-w-2xl mx-auto flex items-center justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={step === 1}
            className="rounded-xl border border-border px-6 py-2.5 text-sm font-black text-foreground hover:bg-muted disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
          >
            Back
          </button>
          
          <button
            type="button"
            onClick={handleNext}
            disabled={!isStepValid()}
            className="rounded-full bg-purple-950 hover:bg-purple-900 dark:bg-purple-800 dark:hover:bg-purple-750 text-white font-bold py-3 px-6 text-sm shadow-md transition-all duration-150 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
          >
            {step === 5 ? 'Submit' : 'Next'}
          </button>
        </div>
      </footer>

    </div>
  );
};
