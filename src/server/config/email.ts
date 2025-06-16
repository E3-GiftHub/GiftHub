/**
 * Email configuration constants
 */
export const EMAIL_CONFIG = {
  // Base URL for the application
  APP_URL: process.env.DOMAIN_URL?.replace(/\/$/, '') ?? 'https://gifthub-five.vercel.app',
  
  // Asset URLs
  LOGO_URL: `${process.env.DOMAIN_URL?.replace(/\/$/, '') ?? 'https://gifthub-five.vercel.app'}/logo.png`,
  
  // Common email paths
  PATHS: {
    INBOX: '/inbox',
    EVENT_VIEW: '/event-view',
    WISHLIST_VIEW: '/wishlist-view',
    PROFILE_EDIT: '/profile-edit',
  }
} as const;

/**
 * Generate common email URLs
 */
export const getEmailUrls = (eventId?: number, useWishlistView = false, useProfileEdit = false) => {
  let eventUrl = EMAIL_CONFIG.APP_URL;
  
  if (useProfileEdit) {
    eventUrl = `${EMAIL_CONFIG.APP_URL}${EMAIL_CONFIG.PATHS.PROFILE_EDIT}`;
  } else if (eventId) {
    const basePath = useWishlistView ? EMAIL_CONFIG.PATHS.WISHLIST_VIEW : EMAIL_CONFIG.PATHS.EVENT_VIEW;
    const queryParam = useWishlistView ? 'eventId' : 'id';
    eventUrl = `${EMAIL_CONFIG.APP_URL}${basePath}?${queryParam}=${eventId}`;
  }
  
  return {
    app: EMAIL_CONFIG.APP_URL,
    inbox: `${EMAIL_CONFIG.APP_URL}${EMAIL_CONFIG.PATHS.INBOX}`,
    event: eventUrl,
    logo: EMAIL_CONFIG.LOGO_URL,
  };
};
