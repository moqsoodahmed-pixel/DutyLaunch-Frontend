/**
 * High-precision geographic boundary coordinates and landmass points for India
 * and key regional context (Arabian Peninsula, Persian Gulf, Sri Lanka)
 * for the 3D globe animation in DutyLaunch.
 */

// Authentic boundary outline of India (Latitude, Longitude in degrees)
export const INDIA_BOUNDARY = [
  // Northern tip: Ladakh & Kashmir
  [35.67, 76.85],
  [35.50, 77.67],
  [34.80, 78.85],
  [34.30, 79.20],
  [33.30, 79.15],
  [32.50, 78.60],
  [31.80, 78.90],
  [31.20, 79.35],
  [30.40, 80.35],
  [30.15, 81.05], // Lipulekh (Uttarakhand / Nepal tripoint)
  // Along Nepal border (India side)
  [29.20, 80.20],
  [28.80, 80.10],
  [28.20, 81.30],
  [27.60, 82.30],
  [27.20, 84.00],
  [26.80, 85.20],
  [26.50, 86.50],
  [26.40, 88.10],
  // Sikkim
  [27.10, 88.10],
  [27.80, 88.20],
  [28.08, 88.60],
  [27.80, 88.90],
  [27.10, 88.90],
  // Bhutan border (India side)
  [26.80, 89.80],
  [26.80, 91.50],
  [27.20, 92.10],
  // Arunachal Pradesh
  [27.60, 92.50],
  [28.10, 93.50],
  [28.60, 94.50],
  [29.20, 95.50],
  [29.45, 96.20],
  [28.80, 97.00],
  [28.20, 97.40], // Easternmost tip (Dong / Kibithu)
  // Eastern border: Nagaland, Manipur, Mizoram
  [27.20, 96.50],
  [26.50, 95.20],
  [25.60, 94.80],
  [24.80, 94.30],
  [24.00, 93.30],
  [23.00, 93.20],
  [22.20, 93.00],
  [21.60, 92.80], // Southern tip of Mizoram
  [22.20, 92.30],
  [23.00, 92.20],
  // Tripura loop
  [23.30, 91.30],
  [24.20, 92.00],
  // Meghalaya / Assam
  [25.20, 91.80],
  [25.20, 90.00],
  [25.80, 89.80],
  // West Bengal / Bangladesh border
  [26.30, 89.00],
  [25.60, 88.60],
  [24.80, 88.20],
  [24.20, 88.60],
  [23.00, 88.80],
  [22.20, 89.10],
  // Bay of Bengal Coastline (Sundarbans to Kanyakumari)
  [21.65, 87.50], // Digha / West Bengal
  [20.80, 86.90], // Odisha coast / Paradip
  [19.80, 85.80], // Puri
  [19.30, 85.00], // Chilika
  [18.30, 84.10],
  [17.70, 83.30], // Visakhapatnam
  [16.80, 82.30], // Kakinada
  [15.80, 80.80], // Krishna delta
  [14.50, 80.20], // Nellore
  [13.10, 80.30], // Chennai
  [11.90, 79.80], // Puducherry
  [10.80, 79.85], // Nagapattinam
  [9.30, 79.15],  // Palk Strait / Rameshwaram
  [8.80, 78.15],  // Tuticorin
  [8.08, 77.55],  // KANYAKUMARI (Southernmost mainland tip)
  // Arabian Sea Coastline (Kanyakumari to Gujarat)
  [8.50, 76.90],  // Thiruvananthapuram
  [9.50, 76.30],  // Alappuzha
  [10.00, 76.20], // Kochi
  [11.25, 75.80], // Kozhikode
  [12.50, 75.00], // Kannur / Kasaragod
  [12.90, 74.85], // Mangalore
  [14.20, 74.45], // Bhatkal
  [15.30, 73.80], // Goa
  [16.00, 73.50], // Malvan
  [17.00, 73.30], // Ratnagiri
  [18.95, 72.82], // Mumbai
  [20.00, 72.75], // Dahanu
  [20.50, 72.85], // Daman
  [21.20, 72.80], // Surat / Gulf of Khambhat
  [21.75, 72.25], // Bhavnagar
  [20.75, 70.90], // Diu / Gir Somnath
  [21.60, 69.60], // Porbandar
  [22.25, 68.95], // Dwarka (Westernmost peninsula)
  [22.80, 69.80], // Gulf of Kutch
  [23.25, 68.60], // Kutch coast
  [23.75, 68.20], // Kori Creek / Western border
  // Western international border: Gujarat, Rajasthan, Punjab, J&K
  [24.30, 70.80], // Rann of Kutch
  [24.80, 71.10], // Barmer
  [25.80, 70.40],
  [26.90, 70.50], // Jaisalmer
  [28.00, 71.80], // Bikaner
  [29.00, 72.50],
  [29.90, 73.80], // Sri Ganganagar
  [30.80, 74.50], // Firozpur
  [31.60, 74.90], // Amritsar / Wagah
  [32.20, 75.40], // Gurdaspur
  [32.50, 74.80], // Jammu
  [33.30, 74.30], // Rajouri
  [34.15, 73.90], // Baramulla
  [34.70, 74.40], // Kupwara
  [35.00, 75.50], // Kargil north
  [35.67, 76.85], // Back to start (Ladakh Karakoram)
];

// Major Indian cities with lat/lon for markers and connections
export const INDIA_CITIES = [
  { name: 'Bengaluru', lat: 12.97, lon: 77.59, hq: true },
  { name: 'Mumbai', lat: 19.07, lon: 72.87 },
  { name: 'New Delhi', lat: 28.61, lon: 77.20 },
  { name: 'Hyderabad', lat: 17.38, lon: 78.48 },
  { name: 'Chennai', lat: 13.08, lon: 80.27 },
  { name: 'Kolkata', lat: 22.57, lon: 88.36 },
  { name: 'Ahmedabad', lat: 23.02, lon: 72.57 },
  { name: 'Kochi', lat: 9.93, lon: 76.26 },
  { name: 'Pune', lat: 18.52, lon: 73.85 },
  { name: 'Jaipur', lat: 26.91, lon: 75.78 },
  { name: 'Lucknow', lat: 26.84, lon: 80.94 },
  { name: 'Chandigarh', lat: 30.73, lon: 76.77 },
  { name: 'Bhopal', lat: 23.25, lon: 77.41 },
  { name: 'Guwahati', lat: 26.14, lon: 91.73 },
  { name: 'Srinagar', lat: 34.08, lon: 74.79 },
  { name: 'Patna', lat: 25.59, lon: 85.13 },
  { name: 'Bhubaneswar', lat: 20.29, lon: 85.82 },
];

// Interior landmass points to create a rich glowing dotted territory inside India
export const INDIA_LANDMASS_POINTS = [
  // North
  [34.0, 75.0], [33.5, 76.2], [33.8, 77.5], [32.8, 76.0], [32.0, 77.0],
  [31.5, 75.5], [31.0, 76.8], [30.5, 77.5], [30.0, 78.5], [29.5, 76.8],
  [28.8, 77.2], [28.5, 78.5], [29.0, 79.5], [28.2, 75.8], [27.8, 76.5],
  // West & Central
  [27.0, 71.5], [26.5, 72.8], [26.0, 74.0], [25.5, 73.0], [25.0, 72.0],
  [24.5, 73.5], [24.0, 70.0], [23.5, 71.5], [23.0, 70.5], [22.5, 71.8],
  [23.0, 72.8], [22.0, 73.5], [21.5, 71.0], [21.5, 73.0], [21.0, 74.5],
  [25.0, 76.0], [24.5, 77.5], [23.5, 77.5], [23.0, 79.0], [22.0, 77.8],
  [21.5, 79.0], [22.5, 81.0], [21.0, 81.5], [20.0, 79.5], [19.5, 77.5],
  [20.0, 75.5], [19.5, 74.0], [19.0, 73.5], [18.5, 75.0], [18.0, 74.0],
  // South
  [17.5, 76.5], [17.0, 74.5], [16.5, 76.0], [16.0, 74.8], [15.5, 75.5],
  [15.0, 76.8], [14.5, 75.8], [14.0, 77.0], [13.5, 76.0], [13.0, 77.5],
  [12.5, 76.5], [12.0, 77.8], [11.5, 76.8], [11.0, 78.5], [10.5, 77.2],
  [10.0, 78.0], [9.5, 77.8],  [9.0, 78.0],  [8.5, 77.5],  [8.3, 77.3],
  // East & Deccan
  [17.5, 78.5], [16.5, 80.0], [15.5, 79.5], [14.5, 79.0], [13.5, 80.0],
  [12.5, 79.5], [11.5, 79.2], [18.0, 82.5], [19.0, 83.5], [20.0, 84.5],
  [20.5, 85.5], [21.5, 84.0], [21.5, 86.0], [22.5, 85.0], [22.5, 87.0],
  [23.5, 84.5], [23.5, 86.5], [24.5, 84.0], [24.5, 86.0], [25.5, 84.5],
  [25.5, 86.5], [26.0, 84.0], [26.0, 86.0], [26.5, 87.5], [24.0, 87.8],
  // Northeast
  [26.0, 90.5], [26.5, 92.0], [26.8, 93.5], [27.2, 94.5], [27.8, 95.5],
  [25.5, 91.5], [25.0, 93.0], [24.5, 94.0], [23.5, 92.8], [24.0, 91.8],
  [27.5, 88.5],
];

// Regional coastline context: Arabian Peninsula, Persian Gulf, and Sri Lanka
export const ARABIA_BOUNDARY = [
  // Oman & Yemen coast
  [16.5, 53.0],
  [17.5, 55.5],
  [19.0, 57.8],
  [20.5, 58.8],
  [22.5, 59.8],
  [23.6, 58.5], // Muscat
  [24.5, 56.7], // Sohar
  [25.6, 56.3], // Musandam / Strait of Hormuz
  [26.0, 56.2],
  // UAE & Persian Gulf (Dubai, Abu Dhabi, Qatar)
  [25.3, 55.3], // Dubai
  [24.5, 54.4], // Abu Dhabi
  [24.1, 52.6],
  [25.3, 51.5], // Doha / Qatar
  [26.0, 51.2],
  [26.2, 50.6], // Bahrain
  [26.8, 50.0], // Dammam / Saudi coast
  [28.0, 48.8],
  [29.3, 48.0], // Kuwait
];

// Sri Lanka boundary for immediate oceanic context
export const SRI_LANKA_BOUNDARY = [
  [9.8, 80.2], // Jaffna
  [8.6, 81.2], // Trincomalee
  [7.7, 81.7], // Batticaloa
  [6.8, 81.8],
  [5.9, 80.5], // Dondra Head
  [6.0, 80.2], // Galle
  [6.9, 79.8], // Colombo
  [8.0, 79.8],
  [9.0, 79.8],
  [9.8, 80.2],
];
