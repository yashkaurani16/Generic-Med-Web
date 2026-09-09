import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'light' | 'dark';
  onToggle: () => void;
  className?: string;
  idPrefix?: string;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  theme,
  onToggle,
  className = '',
  idPrefix = 'header',
}) => {
  const isDark = theme === 'dark';

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <button
        id={`${idPrefix}-theme-toggle`}
        type="button"
        role="switch"
        aria-checked={isDark}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        onClick={onToggle}
        className="group relative inline-flex h-9 w-16 shrink-0 cursor-pointer items-center rounded-full border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 p-1 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-zinc-950"
      >
        <span className="sr-only">Toggle theme</span>
        {/* Background icons for visual cues */}
        <span className="absolute inset-0 flex items-center justify-between px-2 text-zinc-400 dark:text-zinc-500 pointer-events-none">
          <Sun className="h-3.5 w-3.5" />
          <Moon className="h-3.5 w-3.5" />
        </span>

        {/* Sliding Thumb */}
        <span
          className={`pointer-events-none relative z-10 flex h-7 w-7 transform items-center justify-center rounded-full bg-white dark:bg-zinc-900 shadow-sm transition-transform duration-200 ease-in-out ${
            isDark ? 'translate-x-7 text-amber-400' : 'translate-x-0 text-amber-500'
          }`}
        >
          {isDark ? (
            <Moon className="h-4 w-4 fill-current text-zinc-100" />
          ) : (
            <Sun className="h-4 w-4 fill-current text-amber-500" />
          )}
        </span>
      </button>
    </div>
  );
};
