// This JavaScript file handles the cookie consent functionality

document.addEventListener('DOMContentLoaded', function() {
    // Check if user has already made a cookie choice
    const cookieConsent = getCookieConsent();
    
    if (!cookieConsent) {
        // Show the cookie banner if no choice has been made
        showCookieBanner();
    } else {
        // Apply the saved cookie preferences
        applyCookiePreferences(cookieConsent);
    }
    
    // Initialize cookie settings modal toggle
    const cookieSettingsLinks = document.querySelectorAll('.cookie-settings-link');
    cookieSettingsLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            showCookieModal();
        });
    });
});

// Function to show the cookie consent banner
function showCookieBanner() {
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) {
        cookieBanner.classList.add('active');
        
        // Set up event listeners for the buttons
        const acceptAllBtn = document.getElementById('accept-all-cookies');
        const customizeBtn = document.getElementById('customize-cookies');
        const rejectNonEssentialBtn = document.getElementById('reject-non-essential');
        
        if (acceptAllBtn) {
            acceptAllBtn.addEventListener('click', function() {
                acceptAllCookies();
            });
        }
        
        if (customizeBtn) {
            customizeBtn.addEventListener('click', function() {
                showCookieModal();
            });
        }
        
        if (rejectNonEssentialBtn) {
            rejectNonEssentialBtn.addEventListener('click', function() {
                rejectNonEssentialCookies();
            });
        }
    }
}

// Function to show the cookie settings modal
function showCookieModal() {
    const cookieModal = document.getElementById('cookie-modal');
    const cookieBanner = document.getElementById('cookie-banner');
    
    if (cookieBanner) {
        cookieBanner.classList.remove('active');
    }
    
    if (cookieModal) {
        cookieModal.classList.add('active');
        
        // Set up event listeners for the modal buttons
        const savePreferencesBtn = document.getElementById('save-preferences');
        const closeModalBtn = document.getElementById('close-cookie-modal');
        
        if (savePreferencesBtn) {
            savePreferencesBtn.addEventListener('click', function() {
                saveCustomPreferences();
            });
        }
        
        if (closeModalBtn) {
            closeModalBtn.addEventListener('click', function() {
                cookieModal.classList.remove('active');
                if (!getCookieConsent()) {
                    showCookieBanner();
                }
            });
        }
        
        // Close modal when clicking outside
        cookieModal.addEventListener('click', function(e) {
            if (e.target === cookieModal) {
                cookieModal.classList.remove('active');
                if (!getCookieConsent()) {
                    showCookieBanner();
                }
            }
        });
        
        // Load current preferences into the modal
        loadCurrentPreferences();
    }
}

// Function to accept all cookies
function acceptAllCookies() {
    const preferences = {
        essential: true,
        analytics: true,
        preferences: true,
        thirdParty: true,
        consentGiven: true,
        timestamp: new Date().toISOString()
    };
    
    // Save the preferences
    saveCookiePreferences(preferences);
    
    // Hide the banner
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) {
        cookieBanner.classList.remove('active');
    }
    
    // Apply the preferences
    applyCookiePreferences(preferences);
}

// Function to reject non-essential cookies
function rejectNonEssentialCookies() {
    const preferences = {
        essential: true,
        analytics: false,
        preferences: false,
        thirdParty: false,
        consentGiven: true,
        timestamp: new Date().toISOString()
    };
    
    // Save the preferences
    saveCookiePreferences(preferences);
    
    // Hide the banner
    const cookieBanner = document.getElementById('cookie-banner');
    if (cookieBanner) {
        cookieBanner.classList.remove('active');
    }
    
    // Apply the preferences
    applyCookiePreferences(preferences);
}

// Function to save custom preferences from the modal
function saveCustomPreferences() {
    const analyticsCheckbox = document.getElementById('analytics-checkbox');
    const preferencesCheckbox = document.getElementById('preferences-checkbox');
    const thirdPartyCheckbox = document.getElementById('third-party-checkbox');
    
    const preferences = {
        essential: true, // Essential cookies are always enabled
        analytics: analyticsCheckbox ? analyticsCheckbox.checked : false,
        preferences: preferencesCheckbox ? preferencesCheckbox.checked : false,
        thirdParty: thirdPartyCheckbox ? thirdPartyCheckbox.checked : false,
        consentGiven: true,
        timestamp: new Date().toISOString()
    };
    
    // Save the preferences
    saveCookiePreferences(preferences);
    
    // Hide the modal
    const cookieModal = document.getElementById('cookie-modal');
    if (cookieModal) {
        cookieModal.classList.remove('active');
    }
    
    // Apply the preferences
    applyCookiePreferences(preferences);
    
    // Show a notification that preferences were saved
    showNotification('Cookie preferences saved!');
}

// Function to load current preferences into the modal
function loadCurrentPreferences() {
    const preferences = getCookieConsent();
    
    if (preferences) {
        const analyticsCheckbox = document.getElementById('analytics-checkbox');
        const preferencesCheckbox = document.getElementById('preferences-checkbox');
        const thirdPartyCheckbox = document.getElementById('third-party-checkbox');
        
        if (analyticsCheckbox) {
            analyticsCheckbox.checked = preferences.analytics;
        }
        
        if (preferencesCheckbox) {
            preferencesCheckbox.checked = preferences.preferences;
        }
        
        if (thirdPartyCheckbox) {
            thirdPartyCheckbox.checked = preferences.thirdParty;
        }
    }
}

// Function to save cookie preferences to localStorage
function saveCookiePreferences(preferences) {
    localStorage.setItem('ucleusConsent', JSON.stringify(preferences));
}

// Function to get cookie consent from localStorage
function getCookieConsent() {
    const consent = localStorage.getItem('ucleusConsent');
    return consent ? JSON.parse(consent) : null;
}

// Function to apply cookie preferences
function applyCookiePreferences(preferences) {
    // Apply essential cookies - always on
    // Your implementation for setting essential cookies
    
    // Apply analytics cookies if allowed
    if (preferences.analytics) {
        enableAnalytics();
    } else {
        disableAnalytics();
    }
    
    // Apply preferences cookies if allowed
    if (preferences.preferences) {
        enablePreferencesCookies();
    } else {
        disablePreferencesCookies();
    }
    
    // Apply third party cookies if allowed
    if (preferences.thirdParty) {
        enableThirdPartyCookies();
    } else {
        disableThirdPartyCookies();
    }
}

// Example implementation functions for different cookie types
function enableAnalytics() {
    // Example: Initialize Google Analytics
    console.log('Analytics cookies enabled');
    // In production, you would initialize your analytics here
}

function disableAnalytics() {
    // Example: Remove Google Analytics cookies
    console.log('Analytics cookies disabled');
    // In production, you would disable your analytics here
}

function enablePreferencesCookies() {
    console.log('Preferences cookies enabled');
    // Implementation for preferences cookies
}

function disablePreferencesCookies() {
    console.log('Preferences cookies disabled');
    // Implementation for removing preferences cookies
}

function enableThirdPartyCookies() {
    console.log('Third party cookies enabled');
    // Implementation for third party cookies
}

function disableThirdPartyCookies() {
    console.log('Third party cookies disabled');
    // Implementation for removing third party cookies
}

// Function to show a notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'cookie-notification';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Trigger animation
    setTimeout(() => {
        notification.classList.add('active');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}