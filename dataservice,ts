export interface TripData {
  destination: string;
  days: number;
  coordinates: { lat: number; lng: number };
  weather: { temp: string; condition: string; desc: string };
  budget: {
    total: string;
    breakdown: number[]; // [Flights, Hotels, Activities, Food]
  };
  itinerary: {
    day: number;
    time: string;
    title: string;
    desc: string;
  }[];
  transport: {
    icon: string;
    title: string;
    desc: string;
    status: string;
    statusClass: string;
  };
}

const DESTINATIONS: Record<string, any> = {
  tokyo: {
    name: 'Tokyo',
    lat: 35.6762,
    lng: 139.6503,
    weather: { temp: '22°C', condition: 'Clear Sky', desc: 'Perfect for city exploration' },
    activities: ['Visit Senso-ji Temple', 'Explore Akihabara', 'Sushi Making Class', 'Shibuya Crossing', 'Tokyo Skytree'],
    transport: { icon: '🚅', title: 'Shinkansen', desc: 'Platform 14 in 15m', status: 'On Time', statusClass: 'pulse-green' }
  },
  paris: {
    name: 'Paris',
    lat: 48.8566,
    lng: 2.3522,
    weather: { temp: '16°C', condition: 'Partly Cloudy', desc: 'Great for museum visits' },
    activities: ['Eiffel Tower Tour', 'Louvre Museum', 'Seine River Cruise', 'Montmartre Walk', 'Croissant Tasting'],
    transport: { icon: '✈️', title: 'Flight AF-110', desc: 'Gate D in 30m', status: 'Boarding', statusClass: 'pulse-yellow' }
  },
  goa: {
    name: 'Goa',
    lat: 15.2993,
    lng: 74.1240,
    weather: { temp: '32°C', condition: 'Sunny', desc: 'Ideal beach weather' },
    activities: ['Baga Beach Relaxing', 'Dudhsagar Trek', 'Night Market Shopping', 'Heritage Walk in Old Goa', 'Sunset Cruise'],
    transport: { icon: '✈️', title: 'Flight AI-302', desc: 'Gate 2 in 45m', status: 'On Time', statusClass: 'pulse-green' }
  },
  newyork: {
    name: 'New York',
    lat: 40.7128,
    lng: -74.0060,
    weather: { temp: '19°C', condition: 'Windy', desc: 'Brisk city walks' },
    activities: ['Central Park Stroll', 'Broadway Show', 'Statue of Liberty', 'Times Square at Night', 'MET Museum'],
    transport: { icon: '🚕', title: 'Yellow Cab', desc: 'Arriving in 2m', status: 'Arriving', statusClass: 'pulse-green' }
  },
  patagonia: {
    name: 'Patagonia',
    lat: -50.3379,
    lng: -72.2653,
    weather: { temp: '8°C', condition: 'Overcast', desc: 'Chilly, dress warm' },
    activities: ['Glacier Trekking', 'Torres del Paine Hike', 'Wildlife Photography', 'Fjord Cruise', 'Gaucho Ranch Visit'],
    transport: { icon: '🚌', title: 'Coach 4B', desc: 'Departs in 1h', status: 'Scheduled', statusClass: 'pulse-green' }
  },
  kyoto: {
    name: 'Kyoto',
    lat: 35.0116,
    lng: 135.7681,
    weather: { temp: '20°C', condition: 'Sunny', desc: 'Perfect for temple visits' },
    activities: ['Fushimi Inari Shrine', 'Arashiyama Bamboo Forest', 'Kinkaku-ji', 'Tea Ceremony', 'Gion District Walk'],
    transport: { icon: '🚅', title: 'Bullet Train', desc: 'Platform 2', status: 'On Time', statusClass: 'pulse-green' }
  }
};

export class DataService {
  public static generateTripData(query: string, targetBudget?: number): TripData {
    const q = query.toLowerCase();
    
    // Extract days
    const dayMatch = q.match(/(\d+)\s*-?\s*day/);
    const days = dayMatch ? parseInt(dayMatch[1], 10) : 3; // Default to 3 days

    // Identify destination
    let destKey = 'goa'; // default
    for (const key of Object.keys(DESTINATIONS)) {
      const name = DESTINATIONS[key].name.toLowerCase();
      if (q.includes(key) || q.includes(name) || (key === 'newyork' && (q.includes('new york') || q.includes('ny') || q.includes('nyc')))) {
        destKey = key;
        break;
      }
    }

    const destInfo = DESTINATIONS[destKey];
    
    // Generate Budget
    const baseBudget = targetBudget && targetBudget > 1000 ? targetBudget : days * 4000;
    const flights = Math.floor(baseBudget * 0.4);
    const hotels = Math.floor(baseBudget * 0.3);
    const activities = Math.floor(baseBudget * 0.15);
    const food = Math.max(0, baseBudget - flights - hotels - activities);

    // Generate Itinerary
    const itinerary = [];
    for (let i = 1; i <= Math.min(days, 5); i++) { // Limit to 5 items for UI brevity
      itinerary.push({
        day: i,
        time: '09:00 AM',
        title: destInfo.activities[(i - 1) % destInfo.activities.length],
        desc: `Enjoy the best of ${destInfo.name} with this curated experience.`
      });
      if (i === 1) {
         itinerary.push({
          day: 1,
          time: '02:00 PM',
          title: 'Hotel Check-in',
          desc: 'Relax and freshen up.'
        });
      }
    }

    return {
      destination: destInfo.name,
      days: days,
      coordinates: { lat: destInfo.lat, lng: destInfo.lng },
      weather: destInfo.weather,
      budget: {
        total: `₹ ${baseBudget.toLocaleString()}`,
        breakdown: [flights, hotels, activities, food]
      },
      itinerary: itinerary,
      transport: destInfo.transport
    };
  }
}
