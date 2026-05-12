const prayers = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

// Initialize Telegram Web App
const tg = window.Telegram.WebApp;
tg.expand();

// Load last searched city
window.onload = () => {
  const lastCity = localStorage.getItem('lastCity');
  if (lastCity) {
    document.getElementById('cityInput').value = lastCity;
    getPrayerTimes();
  }
};

async function getPrayerTimes() {
  const city = document.getElementById('cityInput').value.trim();
  const resultBox = document.getElementById('result');

  if (!city) return;

  resultBox.classList.remove('hidden');
  resultBox.innerHTML = '<p style="text-align:center">Loading...</p>';

  try {
    const res = await fetch(
      `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=&method=2`
    );
    const data = await res.json();

    if (data.code !== 200) {
      resultBox.innerHTML = '<p class="error-msg">City not found. Try again.</p>';
      return;
    }

    localStorage.setItem('lastCity', city);

    const timings = data.data.timings;
    const date = data.data.date.readable;

    // Find next prayer
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    let nextPrayer = null;
    for (const prayer of prayers) {
      const [h, m] = timings[prayer].split(':').map(Number);
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > currentMinutes) {
        nextPrayer = prayer;
        break;
      }
    }

    // Build HTML
    let html = `<p class="date-label">📅 ${date} — ${city}</p>`;

    for (const prayer of prayers) {
      const isNext = prayer === nextPrayer;
      html += `
        <div class="prayer-item ${isNext ? 'next' : ''}">
          <span class="prayer-name">${isNext ? '▶ ' : ''}${prayer}</span>
          <span class="prayer-time">${formatTime(timings[prayer])}</span>
        </div>`;
    }

    resultBox.innerHTML = html;

  } catch (err) {
    resultBox.innerHTML = '<p class="error-msg">Something went wrong. Check your connection.</p>';
  }
}

function formatTime(time) {
  const [h, m] = time.split(':').map(Number);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, '0')} ${ampm}`;
}
