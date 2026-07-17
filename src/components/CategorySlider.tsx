import React from 'react';
import {
  Building2,
  Trees,
  Palmtree,
  Mountain,
  Video,
  Building,
  Castle,
  Ship,
  Tent,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
}

const categories: Category[] = [
  { id: 'Rooftops', name: 'Rooftops', icon: Building2 },
  { id: 'Tree House', name: 'Tree House', icon: Trees },
  { id: 'Beach front', name: 'Beach front', icon: Palmtree },
  { id: 'Amazing Views', name: 'Amazing Views', icon: Mountain },
  { id: 'Studio', name: 'Studio', icon: Video },
  { id: 'Mansions', name: 'Mansions', icon: Building },
  { id: 'Castles', name: 'Castles', icon: Castle },
  { id: 'Houseboat', name: 'Houseboat', icon: Ship },
  { id: 'Cabin', name: 'Cabin', icon: Tent }
];

interface CategorySliderProps {
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategorySlider: React.FC<CategorySliderProps> = ({
  activeCategory,
  onSelectCategory,
}) => {
  const containerRef = React.useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (containerRef.current) {
      const scrollAmount = 200;
      containerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-7xl px-4 md:px-8 my-4 flex items-center group">
      {/* Left scroll button */}
      <button
        onClick={() => scroll('left')}
        className="absolute left-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        aria-label="Scroll left"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>

      {/* Categories container */}
      <div
        ref={containerRef}
        className="scrollbar-none flex w-full gap-8 overflow-x-auto pb-3 pt-1 scroll-smooth"
      >
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isActive = activeCategory === cat.id;

          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`flex flex-col items-center gap-2 cursor-pointer transition-[background-color,color,transform] duration-160 ease-out active:scale-97 relative py-2 px-3 rounded-xl focus:outline-none ${
                isActive
                  ? 'bg-purple-900/10 dark:bg-purple-300/15 text-purple-950 dark:text-purple-200'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/40'
              }`}
            >
              <div
                className={`flex h-11 w-11 items-center justify-center rounded-full transition-[background-color,color,transform] duration-160 ease-out ${
                  isActive
                    ? 'bg-purple-950 dark:bg-purple-800 text-white scale-110 shadow-md shadow-purple-900/10'
                    : 'bg-muted dark:bg-muted/60 text-muted-foreground'
                }`}
              >
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-semibold whitespace-nowrap tracking-tight">{cat.name}</span>
              {isActive && (
                <span className="absolute bottom-0 left-1/2 h-1 w-6 -translate-x-1/2 rounded-full bg-purple-950 dark:bg-purple-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* Right scroll button */}
      <button
        onClick={() => scroll('right')}
        className="absolute right-1 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-muted"
        aria-label="Scroll right"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
};
