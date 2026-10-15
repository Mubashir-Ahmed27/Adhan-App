// Adhan App - Islamic Prayer Times Tracker

// DOM Elements
const cityNameEl = document.getElementById('city-name');
const currentDateEl = document.getElementById('current-date');
const nextPrayerNameEl = document.getElementById('next-prayer-name');
const countdownEl = document.getElementById('countdown');

// Prayer time elements
const prayerTimeElements = {
    Fajr: document.getElementById('fajr-time'),
    Sunrise: document.getElementById('sunrise-time'),
    Dhuhr: document.getElementById('dhuhr-time'),
    Asr: document.getElementById('asr-time'),
    Maghrib: document.getElementById('maghrib-time'),
    Isha: document.getElementById('isha-time')
};

// Prayer rows for highlighting
const prayerRows = document.querySelectorAll('.prayer-row');

// State
let prayerTimes = {};
let currentLocation = null;
let countdownInterval = null;
let currentDate = new Date();

// Prayer order
const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// API Configuration
const API_BASE = 'https://api.aladhan.com/v1';

// Initialize the app
function init() {
    loadLocation();
    updateDate();
    startCountdown();
}

// Load user location
function loadLocation() {
    cityNameEl.textContent = 'Detecting location...';
    
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                currentLocation = {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                };
                
                try {
                    // Get city name from coordinates
                    await fetchCityName(position.coords.latitude, position.coords.longitude);
                    
                    // Fetch prayer times
                    await fetchPrayerTimes();
                    
                    // Update UI with prayer times
                    updatePrayerTimesUI();
                    
                    // Determine next prayer
                    updateNextPrayer();
                } catch (error) {
                    console.error('Error loading data:', error);
                    cityNameEl.textContent = 'Error loading data';
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                cityNameEl.textContent = 'Location access denied';
                // Fallback: use a default location (Mecca)
                fallbackToDefaultLocation();
            }
        );
    } else {
        cityNameEl.textContent = 'Geolocation not supported';
        fallbackToDefaultLocation();
    }
}

// Fallback to default location (Mecca)
async function fallbackToDefaultLocation() {
    cityNameEl.textContent = 'Mecca, Saudi Arabia';
    currentLocation = { latitude: 21.4225, longitude: 39.8262 };
    
    try {
        await fetchPrayerTimes();
        updatePrayerTimesUI();
        updateNextPrayer();
    } catch (error) {
        console.error('Error loading fallback data:', error);
    }
}

// Fetch city name from coordinates using reverse geocoding
async function fetchCityName(lat, lng) {
    try {
        // Using OpenStreetMap Nominatim API
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`
        );
        const data = await response.json();
        
        if (data && data.address) {
            const city = data.address.city || data.address.town || data.address.village || data.address.hamlet;
            const country = data.address.country;
            cityNameEl.textContent = `${city}, ${country}`;
        } else {
            cityNameEl.textContent = 'Unknown Location';
        }
    } catch (error) {
        console.error('Error fetching city name:', error);
        cityNameEl.textContent = 'Unknown Location';
    }
}

// Fetch prayer times from Aladhan API
async function fetchPrayerTimes() {
    if (!currentLocation) {
        throw new Error('Location not set');
    }
    
    const date = currentDate.toISOString().split('T')[0];
    const { latitude, longitude } = currentLocation;
    
    const response = await fetch(
        `${API_BASE}/timings/${date}?latitude=${latitude}&longitude=${longitude}&method=2`
    );
    
    if (!response.ok) {
        throw new Error('Failed to fetch prayer times');
    }
    
    const data = await response.json();
    prayerTimes = data.data.timings;
}

// Update prayer times in the UI
function updatePrayerTimesUI() {
    for (const [prayer, element] of Object.entries(prayerTimeElements)) {
        if (prayerTimes[prayer]) {
            element.textContent = formatTime(prayerTimes[prayer]);
        }
    }
}

// Format time from HH:MM:SS to HH:MM
function formatTime(timeString) {
    if (!timeString) return '--:--';
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
}

// Update the current date display
function updateDate() {
    const options = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    };
    currentDateEl.textContent = currentDate.toLocaleDateString('en-US', options);
}

// Determine and update the next prayer
function updateNextPrayer() {
    const now = new Date();
    let nextPrayer = null;
    let nextPrayerTime = null;
    let minDiff = Infinity;
    
    // Remove previous active class
    prayerRows.forEach(row => row.classList.remove('active'));
    
    for (const prayer of PRAYER_ORDER) {
        if (!prayerTimes[prayer]) continue;
        
        const prayerDate = new Date(currentDate);
        const [hours, minutes, seconds] = prayerTimes[prayer].split(':');
        prayerDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        
        const diff = prayerDate - now;
        
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextPrayer = prayer;
            nextPrayerTime = prayerDate;
        }
    }
    
    // If no future prayer found today, get first prayer of next day
    if (!nextPrayer) {
        nextPrayer = PRAYER_ORDER[0];
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);
        
        // We need to fetch next day's prayer times
        fetchNextDayPrayerTimes(nextDate);
        return;
    }
    
    // Update next prayer display
    nextPrayerNameEl.textContent = nextPrayer;
    
    // Highlight the next prayer row
    const nextPrayerRow = document.querySelector(`[data-prayer="${nextPrayer}"]`);
    if (nextPrayerRow) {
        nextPrayerRow.classList.add('active');
    }
    
    // Start countdown to next prayer
    startCountdown(nextPrayerTime);
}

// Fetch next day's prayer times
async function fetchNextDayPrayerTimes(date) {
    if (!currentLocation) return;
    
    const dateStr = date.toISOString().split('T')[0];
    const { latitude, longitude } = currentLocation;
    
    try {
        const response = await fetch(
            `${API_BASE}/timings/${dateStr}?latitude=${latitude}&longitude=${longitude}&method=2`
        );
        const data = await response.json();
        const nextDayTimes = data.data.timings;
        
        const nextPrayer = PRAYER_ORDER[0];
        const prayerDate = new Date(date);
        const [hours, minutes, seconds] = nextDayTimes[nextPrayer].split(':');
        prayerDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        
        nextPrayerNameEl.textContent = nextPrayer;
        
        // Highlight the next prayer row
        const nextPrayerRow = document.querySelector(`[data-prayer="${nextPrayer}"]`);
        if (nextPrayerRow) {
            nextPrayerRow.classList.add('active');
        }
        
        startCountdown(prayerDate);
    } catch (error) {
        console.error('Error fetching next day prayer times:', error);
    }
}

// Start countdown timer
function startCountdown(targetTime = null) {
    // Clear existing interval
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    const now = new Date();
    const target = targetTime || getNextPrayerTime();
    
    if (!target) {
        countdownEl.textContent = '00:00:00';
        return;
    }
    
    countdownInterval = setInterval(() => {
        const now = new Date();
        const diff = target - now;
        
        if (diff <= 0) {
            // Time has arrived, refresh
            clearInterval(countdownInterval);
            loadLocation();
            return;
        }
        
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        
        countdownEl.textContent = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // Add visual indicators for urgency
        countdownEl.className = '';
        if (hours === 0 && minutes <= 30) {
            countdownEl.classList.add('countdown-warning');
        }
        if (hours === 0 && minutes <= 5) {
            countdownEl.classList.add('countdown-critical');
        }
    }, 1000);
}

// Get the next prayer time from current prayerTimes
function getNextPrayerTime() {
    const now = new Date();
    let nextTime = null;
    let minDiff = Infinity;
    
    for (const prayer of PRAYER_ORDER) {
        if (!prayerTimes[prayer]) continue;
        
        const prayerDate = new Date(currentDate);
        const [hours, minutes, seconds] = prayerTimes[prayer].split(':');
        prayerDate.setHours(parseInt(hours), parseInt(minutes), parseInt(seconds));
        
        const diff = prayerDate - now;
        
        if (diff > 0 && diff < minDiff) {
            minDiff = diff;
            nextTime = prayerDate;
        }
    }
    
    return nextTime;
}

// Refresh prayer times at midnight
function setupMidnightRefresh() {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    
    const timeout = midnight - now;
    
    setTimeout(() => {
        currentDate = new Date();
        updateDate();
        fetchPrayerTimes().then(() => {
            updatePrayerTimesUI();
            updateNextPrayer();
        });
        setupMidnightRefresh();
    }, timeout);
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    init();
    setupMidnightRefresh();
});

// Handle visibility change - refresh when tab becomes visible
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh the countdown
        updateNextPrayer();
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        formatTime,
        getNextPrayerTime,
        updateNextPrayer,
        fetchPrayerTimes
    };
}
