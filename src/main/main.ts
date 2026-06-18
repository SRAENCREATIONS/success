import './style.css';
import { SceneManager } from './scene';
import { DataService } from './dataService';
import type { TripData } from './dataService';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D Scene
  const sceneManager = new SceneManager('canvas-container');
  
  // Initialize Budget Chart
  const ctx = document.getElementById('budgetChart') as HTMLCanvasElement;
  let budgetChart: any = null;
  if (ctx && (window as any).Chart) {
    budgetChart = new (window as any).Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Flights', 'Hotels', 'Activities', 'Food'],
        datasets: [{
          data: [8500, 5000, 3000, 2000],
          backgroundColor: [
            '#8A2BE2',
            '#00C9FF',
            '#92FE9D',
            'rgba(255, 255, 255, 0.3)'
          ],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '75%',
        plugins: {
          legend: {
            position: 'right',
            labels: { color: '#a0a0a0', font: { family: 'Inter', size: 11 } }
          }
        }
      }
    });
  }
  
  // UI Interactions
  const animateBtn = document.getElementById('btn-animate-route');
  const tripInput = document.getElementById('trip-input') as HTMLInputElement;
  const destinationInput = document.getElementById('destination-input') as HTMLInputElement;
  const budgetInput = document.getElementById('budget-input') as HTMLInputElement;
  const brochureContent = document.getElementById('brochure-content');
  const downloadBtn = document.getElementById('btn-download-brochure');

  const renderBrochure = (tripData: TripData) => {
    if (!brochureContent) return;

    brochureContent.innerHTML = `
      <div class="brochure-card">
        <h4>${tripData.destination} • ${tripData.days}-Day Trip</h4>
        <p class="budget-summary">Budget: ${tripData.budget.total}</p>
        <p>${tripData.weather.desc} | ${tripData.weather.temp}, ${tripData.weather.condition}</p>

        <div class="brochure-row">
          <div class="brochure-item">
            <h5>Top Activities</h5>
            <ul>
              ${tripData.itinerary.slice(0, 4).map((item: { title: string }) => `<li>${item.title}</li>`).join('')}
            </ul>
          </div>
          <div class="brochure-item">
            <h5>Transport</h5>
            <p>${tripData.transport.icon} ${tripData.transport.title}</p>
            <p>${tripData.transport.desc}</p>
          </div>
        </div>

        <div class="brochure-row">
          <div class="brochure-item">
            <h5>Route</h5>
            <p>Navigate the globe to ${tripData.destination} coordinates.</p>
          </div>
          <div class="brochure-item">
            <h5>Budget Split</h5>
            <p>Flights: ₹ ${tripData.budget.breakdown[0].toLocaleString()}</p>
            <p>Hotels: ₹ ${tripData.budget.breakdown[1].toLocaleString()}</p>
            <p>Activities: ₹ ${tripData.budget.breakdown[2].toLocaleString()}</p>
            <p>Food: ₹ ${tripData.budget.breakdown[3].toLocaleString()}</p>
          </div>
        </div>
      </div>
    `;
  };

  if (downloadBtn) {
    downloadBtn.addEventListener('click', () => {
      window.print();
    });
  }

  if (animateBtn && tripInput && destinationInput && budgetInput) {
    // Handle Enter key across all form fields
    const submitOnEnter = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        animateBtn.click();
      }
    };

    tripInput.addEventListener('keypress', submitOnEnter);
    destinationInput.addEventListener('keypress', submitOnEnter);
    budgetInput.addEventListener('keypress', submitOnEnter);

    animateBtn.addEventListener('click', () => {
      const destination = destinationInput.value.trim();
      const query = tripInput.value.trim();
      const budgetValue = parseInt(budgetInput.value.replace(/[^0-9]/g, ''), 10);
      const prompt = destination || query || 'Goa';
      const budget = Number.isFinite(budgetValue) && budgetValue > 0 ? budgetValue : undefined;

      // Visual feedback on button
      animateBtn.innerText = "Crafting Route... 🚀";
      animateBtn.style.opacity = '0.7';
      
      setTimeout(() => {
        const tripData = DataService.generateTripData(prompt, budget);

        // Update Weather
        document.getElementById('weather-temp')!.innerText = tripData.weather.temp;
        document.getElementById('weather-cond')!.innerText = tripData.weather.condition;
        document.getElementById('weather-desc')!.innerText = tripData.weather.desc;

        // Update Transport
        document.getElementById('transport-icon')!.innerText = tripData.transport.icon;
        document.getElementById('transport-title')!.innerText = tripData.transport.title;
        document.getElementById('transport-desc')!.innerText = tripData.transport.desc;
        const statusEl = document.getElementById('transport-status')!;
        statusEl.innerText = tripData.transport.status;
        statusEl.className = `status ${tripData.transport.statusClass}`;

        // Update Budget Total and Chart
        document.getElementById('budget-total')!.innerText = tripData.budget.total;
        if (budgetChart) {
          budgetChart.data.datasets[0].data = tripData.budget.breakdown;
          budgetChart.update();
        }

        // Update Itinerary
        const itineraryContainer = document.getElementById('itinerary-container');
        if (itineraryContainer) {
          itineraryContainer.innerHTML = tripData.itinerary.map((item: TripData['itinerary'][number]) => `
            <div class="timeline-item">
              <div class="dot"></div>
              <div class="time">Day ${item.day} • ${item.time}</div>
              <h4>${item.title}</h4>
              <p>${item.desc}</p>
            </div>
          `).join('');
        }

        // Animate globe from Mumbai to destination
        const startLat = 19.0760; // Mumbai
        const startLng = 72.8777;
        sceneManager.animateRoute(startLat, startLng, tripData.coordinates.lat, tripData.coordinates.lng);

        renderBrochure(tripData);

        // Reset Button
        animateBtn.innerText = "Journey Generated ✨";
        animateBtn.style.opacity = '1';
        animateBtn.style.background = "linear-gradient(135deg, #00C9FF, #92FE9D)";
        
        setTimeout(() => {
          animateBtn.innerText = "Craft Journey ✨";
          animateBtn.style.background = "var(--primary-gradient)";
        }, 3000);

      }, 1000); // Simulate network/AI generation delay
    });
  }

  // Sidebar Trip Interactions
  const tripCards = document.querySelectorAll('.trip-card');
  tripCards.forEach(card => {
    card.addEventListener('click', () => {
      const title = card.querySelector('h4')?.innerText;
      if (title === 'Kyoto Serenity') {
        // Tokyo to Kyoto
        sceneManager.animateRoute(35.6762, 139.6503, 35.0116, 135.7681);
      } else if (title === 'Patagonia Trails') {
        // Buenos Aires to Patagonia
        sceneManager.animateRoute(-34.6037, -58.3816, -50.3379, -72.2653);
      }
    });
  });

  // Generic Button Interactivity (Header & Bottom Bar)
  const navButtons = document.querySelectorAll('.header nav button, .bottom-bar .icon-btn');
  navButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const parent = (e.currentTarget as HTMLElement).parentElement;
      if (parent) {
        parent.querySelectorAll('button').forEach(b => b.classList.remove('active'));
      }
      (e.currentTarget as HTMLElement).classList.add('active');
    });
  });

  // Chips Interactivity
  const chips = document.querySelectorAll('.chip');
  chips.forEach(chip => {
    chip.addEventListener('click', (e) => {
      const target = e.currentTarget as HTMLElement;
      if (target.style.background === 'rgba(138, 43, 226, 0.4)') {
        target.style.background = 'rgba(255, 255, 255, 0.05)';
        target.style.borderColor = 'var(--glass-border)';
      } else {
        target.style.background = 'rgba(138, 43, 226, 0.4)';
        target.style.borderColor = 'var(--accent-color)';
      }
    });
  });
});
