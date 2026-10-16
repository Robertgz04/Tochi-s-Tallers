import { forwardRef, type InputHTMLAttributes } from 'react';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PropiedadesSearchInput extends InputHTMLAttributes<HTMLInputElement> {
  onLimpiar?: () => void;
}

export const SearchInput = forwardRef<HTMLInputElement, PropiedadesSearchInput>(
  ({ className, value, onLimpiar, ...props }, ref) => (
    <div className={cn('relative w-full sm:max-w-xs', className)}>
      <Search
        className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted"
        aria-hidden="true"
      />
      <input
        ref={ref}
        type="search"
        value={value}
        className="h-10 w-full rounded-xl border border-white/[0.09] bg-[#111620] pl-10 pr-9 text-sm text-foreground placeholder:text-muted/50 transition-all duration-200 hover:border-white/20 focus:border-primary/60 focus:bg-[#141a26] focus:outline-none focus:ring-2 focus:ring-primary/20 [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {Boolean(value) && onLimpiar && (
        <button
          type="button"
          onClick={onLimpiar}
          aria-label="Limpiar búsqueda"
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted hover:text-foreground"
        >
          <X className="h-4 w-4" aria-hidden="true" />
        </button>
      )}
    </div>
  ),
);
SearchInput.displayName = 'SearchInput';
