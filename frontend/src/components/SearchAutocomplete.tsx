import React, { useState, useEffect, useRef } from 'react';
import { Search, Pill, Lock, ShieldCheck, X, Loader2 } from 'lucide-react';
import { Medicine } from '../types';

interface SearchAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (medicine: Medicine) => void;
  placeholder?: string;
  className?: string;
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  value,
  onChange,
  onSelect,
  placeholder = 'Search by brand, generic name, or therapeutic class...',
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<Medicine[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced fetch
  useEffect(() => {
    const query = value.trim();
    if (query.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/medicines?search=${encodeURIComponent(query)}&limit=6`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setSuggestions(data.medicines || []);
          setIsOpen((data.medicines || []).length > 0);
        }
      } catch (err) {
        console.error('Search autocomplete fetch failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (medicine: Medicine) => {
    onChange(medicine.name);
    setIsOpen(false);
    if (onSelect) {
      onSelect(medicine);
    }
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    const regex = new RegExp(`(${query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <mark key={i} className="bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 font-semibold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setHighlightedIndex(-1);
          }}
          onFocus={() => {
            if (suggestions.length > 0) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full h-11 pl-10 pr-10 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 shadow-xs transition"
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin text-emerald-600 dark:text-emerald-400" />
          )}
          {value && (
            <button
              onClick={() => {
                onChange('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="p-1 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              aria-label="Clear search"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
            <span>MEDICINE SUGGESTIONS</span>
            <span className="text-[10px] font-normal">Use ↑↓ to navigate</span>
          </div>
          <ul className="max-h-72 overflow-y-auto py-1 divide-y divide-zinc-100 dark:divide-zinc-800/60" role="listbox">
            {suggestions.map((medicine, idx) => (
              <li
                key={medicine.id}
                role="option"
                aria-selected={highlightedIndex === idx}
                onMouseEnter={() => setHighlightedIndex(idx)}
                onClick={() => handleSelect(medicine)}
                className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between gap-3 transition-colors ${
                  highlightedIndex === idx
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${
                    medicine.isPrescriptionRequired
                      ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    <Pill className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs sm:text-sm font-semibold truncate">
                      {highlightMatch(medicine.name, value)}
                    </div>
                    <div className="text-[11px] text-zinc-500 truncate flex items-center gap-1.5">
                      <span>Generic: {highlightMatch(medicine.genericName, value)}</span>
                      <span>·</span>
                      <span>{medicine.strength}</span>
                      <span>·</span>
                      <span>{medicine.dosageForm}</span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 font-medium">
                    {medicine.therapeuticClass.split('/')[0].trim()}
                  </span>
                  {medicine.isPrescriptionRequired ? (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold flex items-center gap-0.5">
                      <Lock className="h-3 w-3" /> Rx
                    </span>
                  ) : (
                    <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
                      <ShieldCheck className="h-3 w-3" /> OTC
                    </span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
