import posthog from 'posthog-js';

const POSTHOG_KEY = (import.meta as any).env?.VITE_POSTHOG_KEY || '';
const POSTHOG_HOST = (import.meta as any).env?.VITE_POSTHOG_HOST || 'https://app.posthog.com';

let isInitialized = false;

/**
 * Initialize PostHog client once on application startup.
 */
export function initAnalytics() {
  if (isInitialized) return;

  if (POSTHOG_KEY) {
    posthog.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      autocapture: true,
      capture_pageview: true,
      persistence: 'localStorage',
    });
    isInitialized = true;
    console.log('[ANALYTICS] PostHog initialized.');
  } else {
    console.log('[ANALYTICS] PostHog key not found. Operating in dev stub mode.');
  }
}

/**
 * Track custom user events (e.g. medicine_searched, add_to_cart, order_placed).
 */
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (POSTHOG_KEY && isInitialized) {
    posthog.capture(eventName, properties);
  } else {
    console.log(`[ANALYTICS EVENT] ${eventName}:`, properties);
  }
}

/**
 * Identify authenticated user and associate future events.
 */
export function identifyUser(userId: string, traits?: Record<string, any>) {
  if (POSTHOG_KEY && isInitialized) {
    posthog.identify(userId, traits);
  } else {
    console.log(`[ANALYTICS IDENTIFY] ${userId}:`, traits);
  }
}

/**
 * Track explicit page or tab navigation.
 */
export function trackPageView(pageName: string) {
  trackEvent('$pageview', { page: pageName });
}

/**
 * Reset user identity upon logout.
 */
export function resetAnalytics() {
  if (POSTHOG_KEY && isInitialized) {
    posthog.reset();
  }
}
