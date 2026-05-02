import './style.css';
import { SceneManager } from './scene';

document.addEventListener('DOMContentLoaded', () => {
  // Initialize 3D Scene
  const sceneManager = new SceneManager('canvas-container');
  
  // Initialize Budget Chart
  const ctx = document.getElementById('budgetChart') as HTMLCanvasElement;
  if (ctx && (window as any).Chart) {
    new (window as any).Chart(ctx, {
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
  
  if (animateBtn) {
    animateBtn.addEventListener('click', () => {
      // Dummy Coordinates for Goa trip (Mumbai -> Goa approximation)
      // Mumbai: 19.0760° N, 72.8777° E
      // Goa: 15.2993° N, 74.1240° E
      const startLat = 19.0760;
      const startLng = 72.8777;
      const endLat = 15.2993;
      const endLng = 74.1240;
      
      sceneManager.animateRoute(startLat, startLng, endLat, endLng);
      
      // Visual feedback on button
      animateBtn.innerText = "Crafting Route... 🚀";
      setTimeout(() => {
        animateBtn.innerText = "Journey Generated ✨";
        animateBtn.style.background = "linear-gradient(135deg, #00C9FF, #92FE9D)";
      }, 1000);
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
