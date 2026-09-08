import React, { useState } from 'react';
import {
  Smartphone,
  Tablet,
  Monitor,
  Maximize2,
  SlidersHorizontal,
  Download,
  Share2,
  Layers,
  Sparkles,
  Check,
  TrendingUp,
  ShieldCheck,
  Zap,
  ArrowRight,
} from 'lucide-react';

interface ContentAreaProps {
  activeNav: string;
}

export const ContentArea: React.FC<ContentAreaProps> = ({ activeNav }) => {
  const [activeTab, setActiveTab] = useState<'grid' | 'breakpoints' | 'guidelines'>('grid');
  const [selectedDensity, setSelectedDensity] = useState<'comfortable' | 'compact'>('comfortable');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const metrics = [
    {
      id: 'metric-viewports',
      label: 'Active Breakpoints',
      value: 'sm · md · lg · xl',
      subtext: '4 fluid screen tiers',
      icon: Monitor,
      trend: '+100% Coverage',
    },
    {
      id: 'metric-performance',
      label: 'CSS Bundle Engine',
      value: 'Tailwind v4',
      subtext: 'Zero-runtime style pass',
      icon: Zap,
      trend: 'Ultra Fast',
    },
    {
      id: 'metric-compliance',
      label: 'Semantic Structure',
      value: 'HTML5 · WAI-ARIA',
      subtext: 'Screen reader accessible',
      icon: ShieldCheck,
      trend: 'WCAG AA',
    },
    {
      id: 'metric-density',
      label: 'Layout Scaling',
      value: 'Adaptive Flow',
      subtext: 'Header, Main & Footer',
      icon: Layers,
      trend: '100% Dynamic',
    },
  ];

  const cardsData = [
    {
      id: 'card-1',
      title: 'Header Module',
      category: 'Top Navigation',
      description:
        'Sticky top positioning with subtle backdrop blur, responsive mobile drawer toggle, and global action controls.',
      badge: 'Sticky Top',
      status: 'Active',
      stats: 'H: 64px · Z: 40',
    },
    {
      id: 'card-2',
      title: 'Content Canvas',
      category: 'Main Body',
      description:
        'Fluid flex-1 container that expands to fill viewport height, preserving sticky footer anchoring regardless of content volume.',
      badge: 'Fluid Flex-1',
      status: 'Optimal',
      stats: 'Max: 1280px · Responsive',
    },
    {
      id: 'card-3',
      title: 'Footer Matrix',
      category: 'Bottom Anchor',
      description:
        'Multi-column adaptive grid scaling from single-column on phones to 6-column distribution on ultrawide monitors.',
      badge: 'Adaptive Grid',
      status: 'Ready',
      stats: 'Auto-stretch · 4 Tiers',
    },
    {
      id: 'card-4',
      title: 'Fluid Container Rules',
      category: 'Layout Mechanics',
      description:
        'Container outer padding strictly exceeds internal element spacing, adhering to mathematical rhythm principles.',
      badge: 'Scale Math',
      status: 'Verified',
      stats: 'Padding: 16-32px',
    },
  ];

  const breakpointSpecs = [
    {
      icon: Smartphone,
      name: 'Mobile Viewport',
      range: '< 640px',
      behavior: 'Collapses header navigation into sliding drawer; single column card stack; stacked footer.',
      classRule: 'base / w-full',
    },
    {
      icon: Tablet,
      name: 'Tablet Viewport',
      range: '640px – 1023px',
      behavior: '2-column layout grid, condensed inline search, and dual-column footer groupings.',
      classRule: 'sm: / md:grid-cols-2',
    },
    {
      icon: Monitor,
      name: 'Desktop Viewport',
      range: '1024px – 1279px',
      behavior: 'Full horizontal header navigation, 3-column primary grid, and 4-column footer.',
      classRule: 'lg:grid-cols-3',
    },
    {
      icon: Maximize2,
      name: 'Widescreen Viewport',
      range: '≥ 1280px',
      behavior: 'Centered max-width constraint (max-w-7xl) with generous horizontal padding.',
      classRule: 'xl:max-w-7xl mx-auto',
    },
  ];

  const handleCopyCode = (snippet: string, key: string) => {
    navigator.clipboard?.writeText?.(snippet);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  return (
    <main id="content-area" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 transition-colors duration-200">
      {/* Page Breadcrumb & Header Title */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-8 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400 mb-1">
            <span>Home</span>
            <span>/</span>
            <span className="capitalize">{activeNav}</span>
            <span>/</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">Responsive Main Layout</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
            Main Application Layout
          </h1>
          <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400 max-w-2xl">
            A cohesive three-tier architecture comprising a persistent navigation header, an adaptive content area, and a structured multi-column footer.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Density Selector */}
          <div className="flex items-center rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-1 text-xs font-medium text-zinc-600 dark:text-zinc-400">
            <button
              id="density-comfortable"
              onClick={() => setSelectedDensity('comfortable')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                selectedDensity === 'comfortable'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Comfortable
            </button>
            <button
              id="density-compact"
              onClick={() => setSelectedDensity('compact')}
              className={`rounded-md px-2.5 py-1 transition-colors ${
                selectedDensity === 'compact'
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-semibold'
                  : 'hover:text-zinc-900 dark:hover:text-zinc-100'
              }`}
            >
              Compact
            </button>
          </div>

          <button
            id="share-layout-btn"
            type="button"
            onClick={() => handleCopyCode(window.location.href, 'share')}
            className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors shadow-xs"
          >
            {copiedKey === 'share' ? <Check className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            <span>{copiedKey === 'share' ? 'Link Copied' : 'Share'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {metrics.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.id}
              id={metric.id}
              className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">{metric.label}</span>
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{metric.value}</span>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-zinc-500 dark:text-zinc-400">{metric.subtext}</span>
                  <span className="font-semibold text-emerald-700 dark:text-emerald-400">{metric.trend}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Interactive Tabs */}
      <div className="mt-8">
        <div className="flex border-b border-zinc-200 dark:border-zinc-800">
          <button
            id="tab-grid"
            onClick={() => setActiveTab('grid')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'grid'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <Layers className="h-4 w-4" />
            <span>Layout Modules</span>
          </button>
          <button
            id="tab-breakpoints"
            onClick={() => setActiveTab('breakpoints')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'breakpoints'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Responsive Breakpoints</span>
          </button>
          <button
            id="tab-guidelines"
            onClick={() => setActiveTab('guidelines')}
            className={`flex items-center gap-2 border-b-2 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'guidelines'
                ? 'border-zinc-900 dark:border-zinc-100 text-zinc-900 dark:text-zinc-100 font-semibold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:border-zinc-300 dark:hover:border-zinc-700 hover:text-zinc-700 dark:hover:text-zinc-200'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Architecture Specs</span>
          </button>
        </div>

        {/* Tab 1: Layout Modules */}
        {activeTab === 'grid' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {cardsData.map((card) => (
                <div
                  key={card.id}
                  id={card.id}
                  className={`flex flex-col justify-between rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-xs transition hover:border-zinc-300 dark:hover:border-zinc-700 ${
                    selectedDensity === 'compact' ? 'p-4' : 'p-6'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {card.category}
                      </span>
                      <span className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-700 dark:text-zinc-300">
                        {card.badge}
                      </span>
                    </div>
                    <h3 className="mt-3 text-base font-semibold text-zinc-900 dark:text-zinc-100">{card.title}</h3>
                    <p className="mt-2 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{card.description}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                    <span>{card.stats}</span>
                    <span className="inline-flex items-center gap-1 font-medium text-zinc-900 dark:text-zinc-100">
                      <span>{card.status}</span>
                      <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Showcase Section: Structure Blueprint */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div>
                  <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Layout Hierarchy Blueprint</h2>
                  <p className="mt-1 text-xs text-zinc-600 dark:text-zinc-400">
                    Visual map of the primary DOM tree elements, CSS classes, and positioning anchors.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                    Sticky Footer Enabled
                  </span>
                </div>
              </div>

              <div className="mt-6 space-y-3 font-mono text-xs">
                {/* Visual Header Block */}
                <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                    <span className="rounded bg-zinc-800 dark:bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-white dark:text-zinc-900">HEADER</span>
                    <code>&lt;header className="sticky top-0 z-40 bg-white/90 dark:bg-zinc-950/90 backdrop-blur"&gt;</code>
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Brand + Nav + Theme Toggle + Mobile Drawer</span>
                </div>

                {/* Visual Content Block */}
                <div className="rounded-lg border-2 border-dashed border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-950/50 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                    <span className="rounded bg-zinc-700 dark:bg-zinc-300 px-2 py-0.5 text-[10px] font-bold text-white dark:text-zinc-900">CONTENT</span>
                    <code>&lt;main className="flex-1 max-w-7xl mx-auto px-4 py-8"&gt;</code>
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Expands dynamically with flex-1</span>
                </div>

                {/* Visual Footer Block */}
                <div className="rounded-lg border border-zinc-300 dark:border-zinc-700 bg-zinc-100/70 dark:bg-zinc-800/50 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100 font-semibold">
                    <span className="rounded bg-zinc-800 dark:bg-zinc-200 px-2 py-0.5 text-[10px] font-bold text-white dark:text-zinc-900">FOOTER</span>
                    <code>&lt;footer className="border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"&gt;</code>
                  </div>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">Multi-column Grid + Meta info</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Responsive Breakpoints */}
        {activeTab === 'breakpoints' && (
          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            {breakpointSpecs.map((bp) => {
              const BpIcon = bp.icon;
              return (
                <div
                  key={bp.name}
                  className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 shadow-xs flex flex-col justify-between hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200">
                          <BpIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{bp.name}</h3>
                          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{bp.range}</span>
                        </div>
                      </div>
                      <code className="rounded bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-[11px] font-mono text-zinc-700 dark:text-zinc-300">
                        {bp.classRule}
                      </code>
                    </div>
                    <p className="mt-4 text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">{bp.behavior}</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center justify-between text-xs">
                    <span className="text-zinc-500 dark:text-zinc-400">Breakpoint Active</span>
                    <span className="font-semibold text-zinc-900 dark:text-zinc-100">Tested & Scalable</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Tab 3: Architecture Guidelines */}
        {activeTab === 'guidelines' && (
          <div className="mt-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 sm:p-8 shadow-xs">
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Responsive Layout Principles</h2>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-zinc-600 dark:text-zinc-400">
              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-4">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">1. Sticky Header Positioning</h4>
                <p className="leading-relaxed">
                  Utilizes <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">sticky top-0 z-40</code> with a gentle <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">backdrop-blur-md</code>. This keeps navigation and the theme toggle readily accessible across deep scrolls.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-4">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">2. Flexbox Sticky Footer</h4>
                <p className="leading-relaxed">
                  The parent shell uses <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">min-h-screen flex flex-col</code> and the content area leverages <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">flex-1</code>. This guarantees the footer stays locked to the bottom even on sparse pages.
                </p>
              </div>

              <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/40 p-4">
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 mb-2">3. Mobile-First Progressive Enhancement</h4>
                <p className="leading-relaxed">
                  Base styles target mobile screens with full touch targets (≥44px). Progressive modifiers (<code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">sm:</code>, <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">md:</code>, <code className="bg-zinc-100 dark:bg-zinc-800 px-1 py-0.5 rounded text-zinc-800 dark:text-zinc-200">lg:</code>) expand the layout into structured grids.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};
