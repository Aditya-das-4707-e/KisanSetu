/* Mock data — clearly DEMO. Later replaced by Laravel REST API.
   Keep shape stable so js/api.js can swap to fetch() without UI changes. */
window.MockDB = (() => {
  const crops = [
    { name: "Tomato", local: "Tamatar", aliases: ["Takali"], category: "vegetable", units: ["kg", "quintal", "tonne"] },
    { name: "Potato", local: "Aloo", aliases: ["Alu", "Batata"], category: "vegetable", units: ["kg", "quintal", "tonne"] },
    { name: "Onion", local: "Pyaz", aliases: ["Kanda"], category: "vegetable", units: ["kg", "quintal", "tonne"] },
    { name: "Brinjal", local: "Baingan", aliases: ["Vangi"], category: "vegetable", units: ["kg", "quintal"] },
    { name: "Cabbage", local: "Patta Gobhi", aliases: [], category: "vegetable", units: ["kg", "quintal"] },
    { name: "Cauliflower", local: "Phool Gobhi", aliases: [], category: "vegetable", units: ["kg", "quintal"] },
    { name: "Chilli", local: "Mirch", aliases: ["Mirchi"], category: "spice", units: ["kg", "quintal"] },
    { name: "Garlic", local: "Lehsun", aliases: [], category: "spice", units: ["kg", "quintal"] },
    { name: "Ginger", local: "Adrak", aliases: [], category: "spice", units: ["kg", "quintal"] },
    { name: "Rice", local: "Chawal", aliases: ["Dhan"], category: "grain", units: ["kg", "quintal", "tonne"] },
    { name: "Wheat", local: "Gehun", aliases: [], category: "grain", units: ["kg", "quintal", "tonne"] },
    { name: "Maize", local: "Makka", aliases: ["Bhutta"], category: "grain", units: ["kg", "quintal", "tonne"] },
    { name: "Mustard", local: "Sarson", aliases: [], category: "oilseed", units: ["kg", "quintal"] },
    { name: "Soybean", local: "Soya", aliases: [], category: "oilseed", units: ["kg", "quintal", "tonne"] },
    { name: "Cotton", local: "Kapas", aliases: [], category: "cash", units: ["kg", "quintal"] },
    { name: "Sugarcane", local: "Ganna", aliases: [], category: "cash", units: ["kg", "quintal", "tonne"] },
    { name: "Banana", local: "Kela", aliases: [], category: "fruit", units: ["kg", "quintal"] },
    { name: "Mango", local: "Aam", aliases: [], category: "fruit", units: ["kg", "quintal", "tonne"] },
    { name: "Apple", local: "Seb", aliases: [], category: "fruit", units: ["kg", "quintal"] }
  ];

  const markets = [
    { name: "Kolkata New Market", state: "West Bengal", district: "Kolkata" },
    { name: "Howrah Mandi", state: "West Bengal", district: "Howrah" },
    { name: "Burdwan Mandi", state: "West Bengal", district: "Purba Bardhaman" },
    { name: "Azadpur Mandi", state: "Delhi", district: "North Delhi" },
    { name: "Vashi APMC", state: "Maharashtra", district: "Thane" }
  ];

  // Deterministic pseudo-random for stable demo charts
  function seeded(str) {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
    return () => { h = Math.imul(h ^ (h >>> 13), 16777619); return ((h >>> 0) % 1000) / 1000; };
  }

  const basePrice = {
    Tomato: 28, Potato: 25, Onion: 32, Brinjal: 30, Cabbage: 18, Cauliflower: 22,
    Chilli: 95, Garlic: 140, Ginger: 80, Rice: 55, Wheat: 30, Maize: 24,
    Mustard: 62, Soybean: 48, Cotton: 72, Sugarcane: 4.2, Banana: 40, Mango: 110, Apple: 150
  };

  // marketPrices: one row per crop (demo source)
  const marketPrices = crops.map((c, i) => {
    const base = basePrice[c.name] || 30;
    const rnd = seeded(c.name);
    const min = +(base * (0.72 + rnd() * 0.08)).toFixed(2);
    const max = +(base * (1.18 + rnd() * 0.12)).toFixed(2);
    const modal = +((min + max) / 2).toFixed(2);
    const m = markets[i % markets.length];
    const d = new Date(); d.setHours(d.getHours() - (i % 9) - 1);
    return {
      crop: c.name, market: m.name, state: m.state, district: m.district,
      min_price: min, max_price: max, modal_price: modal, unit: "quintal",
      per_kg: +(modal / 100).toFixed(2) * 100 / 100, // modal is already per-kg in demo
      source: "demo", recorded_at: d.toISOString(),
      trend_pct: +(((rnd() - 0.45) * 14).toFixed(1))
    };
  });
  // Fix per_kg: treat modal as ₹/kg directly for demo simplicity
  marketPrices.forEach(r => { r.per_kg = r.modal_price; });

  // priceHistory: 365 daily points per crop
  const priceHistory = {};
  crops.forEach(c => {
    const base = basePrice[c.name] || 30;
    const rnd = seeded("hist-" + c.name);
    const pts = [];
    const today = new Date();
    for (let i = 364; i >= 0; i--) {
      const d = new Date(today); d.setDate(d.getDate() - i);
      const seasonal = Math.sin(i / 30) * base * 0.08;
      const jitter = (rnd() - 0.5) * base * 0.14;
      const avg = Math.max(1, +(base + seasonal + jitter).toFixed(2));
      pts.push({
        date: d.toISOString().slice(0, 10),
        min: +(avg * 0.86).toFixed(2),
        avg,
        max: +(avg * 1.16).toFixed(2)
      });
    }
    priceHistory[c.name] = pts;
  });

  const farmers = [
    { id: 1, name: "Ravi Das", crop: "Tomato", quantity_kg: 500, price_per_kg: 26, distance_km: 12, locality: "Near Burdwan Mandi", district: "Purba Bardhaman", verified: true, shared_contact: false },
    { id: 2, name: "Sita Kisku", crop: "Potato", quantity_kg: 1200, price_per_kg: 23, distance_km: 22, locality: "Near Hooghly Chowk", district: "Hooghly", verified: true, shared_contact: false },
    { id: 3, name: "Abdul Sheikh", crop: "Onion", quantity_kg: 800, price_per_kg: 30, distance_km: 8, locality: "Near Howrah Mandi", district: "Howrah", verified: false, shared_contact: false },
    { id: 4, name: "Meera Patil", crop: "Cotton", quantity_kg: 2000, price_per_kg: 70, distance_km: 35, locality: "Near Vashi APMC", district: "Thane", verified: true, shared_contact: true },
    { id: 5, name: "Gopal Singh", crop: "Wheat", quantity_kg: 3000, price_per_kg: 29, distance_km: 18, locality: "Near Azadpur Mandi", district: "North Delhi", verified: false, shared_contact: false },
    { id: 6, name: "Lakshmi Rao", crop: "Chilli", quantity_kg: 300, price_per_kg: 92, distance_km: 27, locality: "Near Vashi APMC", district: "Thane", verified: true, shared_contact: false }
  ];

  const buyers = [
    { id: 1, name: "FreshMart", crop: "Tomato", quantity_kg: 1000, price_per_kg: 29, distance_km: 6, locality: "Near New Market, Kolkata", district: "Kolkata", verified: true, shared_contact: false },
    { id: 2, name: "DailyVeg", crop: "Potato", quantity_kg: 5000, price_per_kg: 25, distance_km: 9, locality: "Near Howrah Mandi", district: "Howrah", verified: true, shared_contact: false },
    { id: 3, name: "Hotel Grand", crop: "Onion", quantity_kg: 600, price_per_kg: 33, distance_km: 11, locality: "Near Salt Lake", district: "Kolkata", verified: false, shared_contact: false },
    { id: 4, name: "Agro Traders", crop: "Rice", quantity_kg: 10000, price_per_kg: 56, distance_km: 20, locality: "Near Azadpur Mandi", district: "North Delhi", verified: true, shared_contact: true }
  ];

  const alerts = [
    { id: 1, crop: "Tomato", condition: "above", threshold: 30, location: "Kolkata", channel: ["in-app"], active: true },
    { id: 2, crop: "Onion", condition: "below", threshold: 28, location: "Howrah", channel: ["in-app", "email"], active: true }
  ];

  const locations = {
    states: {
      "West Bengal": { districts: {
        "Kolkata": ["New Market", "Salt Lake", "Sealdah", "Gariahat", "Behala"],
        "Howrah": ["Howrah Town", "Uluberia", "Bally", "Domjur"],
        "Purba Bardhaman": ["Burdwan", "Katwa", "Memari", "Kalna"],
        "Hooghly": ["Chinsurah", "Serampore", "Arambagh", "Singur"],
        "Nadia": ["Krishnanagar", "Ranaghat", "Kalyani", "Tehatta"],
        "Murshidabad": ["Berhampore", "Jangipur", "Lalbagh", "Domkal"]
      } },
      "Delhi": { districts: {
        "North Delhi": ["Azadpur", "Narela", "Model Town", "Alipur"],
        "South Delhi": ["Saket", "Hauz Khas", "Mehrauli", "Kalkaji"],
        "East Delhi": ["Laxmi Nagar", "Gandhi Nagar", "Preet Vihar", "Shahdara"],
        "West Delhi": ["Rajouri Garden", "Janakpuri", "Najafgarh", "Tilak Nagar"]
      } },
      "Maharashtra": { districts: {
        "Thane": ["Vashi", "Thane West", "Kalyan", "Ulhasnagar"],
        "Nashik": ["Nashik City", "Sinnar", "Malegaon", "Igatpuri"],
        "Pune": ["Pune City", "Baramati", "Junnar", "Shirur"],
        "Nagpur": ["Nagpur City", "Hingna", "Kamptee", "Umred"],
        "Aurangabad": ["Aurangabad City", "Paithan", "Sillod", "Kannad"]
      } },
      "Punjab": { districts: {
        "Ludhiana": ["Ludhiana City", "Khanna", "Jagraon", "Samrala"],
        "Amritsar": ["Amritsar City", "Ajnala", "Attari", "Majitha"],
        "Patiala": ["Patiala City", "Rajpura", "Samana", "Nabha"],
        "Bathinda": ["Bathinda City", "Rampura Phul", "Talwandi Sabo", "Maur"]
      } },
      "Haryana": { districts: {
        "Karnal": ["Karnal City", "Gharaunda", "Assandh", "Nilokheri"],
        "Hisar": ["Hisar City", "Hansi", "Barwala", "Adampur"],
        "Rohtak": ["Rohtak City", "Meham", "Sampla", "Kalanaur"],
        "Sirsa": ["Sirsa City", "Dabwali", "Rania", "Ellenabad"]
      } },
      "Uttar Pradesh": { districts: {
        "Lucknow": ["Lucknow City", "Mohanlalganj", "Bakshi Ka Talab", "Malihabad"],
        "Kanpur Nagar": ["Kanpur City", "Ghatampur", "Bilhor", "Narwal"],
        "Varanasi": ["Varanasi City", "Pindra", "Rohaniya", "Cholapur"],
        "Agra": ["Agra City", "Fatehabad", "Kheragarh", "Etmadpur"],
        "Meerut": ["Meerut City", "Mawana", "Sardhana", "Daurala"],
        "Bareilly": ["Bareilly City", "Aonla", "Baheri", "Faridpur"]
      } },
      "Bihar": { districts: {
        "Patna": ["Patna City", "Danapur", "Barh", "Masaurhi"],
        "Muzaffarpur": ["Muzaffarpur City", "Motihari Road", "Kanti", "Sahebganj"],
        "Gaya": ["Gaya City", "Bodh Gaya", "Sherghati", "Tekari"],
        "Bhagalpur": ["Bhagalpur City", "Sultanganj", "Naugachia", "Kahalgaon"]
      } },
      "Madhya Pradesh": { districts: {
        "Bhopal": ["Bhopal City", "Berasia", "Huzur", "Phanda"],
        "Indore": ["Indore City", "Mhow", "Depalpur", "Sanwer"],
        "Gwalior": ["Gwalior City", "Dabra", "Bhitarwar", "Morar"],
        "Jabalpur": ["Jabalpur City", "Sihora", "Patan", "Majholi"],
        "Ujjain": ["Ujjain City", "Nagda", "Badnagar", "Tarana"]
      } },
      "Rajasthan": { districts: {
        "Jaipur": ["Jaipur City", "Chomu", "Sanganer", "Kotputli"],
        "Jodhpur": ["Jodhpur City", "Phalodi", "Bilara", "Osian"],
        "Kota": ["Kota City", "Sangod", "Ramganj Mandi", "Kaithoon"],
        "Udaipur": ["Udaipur City", "Mavli", "Vallabhnagar", "Gogunda"],
        "Sri Ganganagar": ["Ganganagar City", "Sadulshahar", "Padampur", "Raisinghnagar"]
      } },
      "Gujarat": { districts: {
        "Ahmedabad": ["Ahmedabad City", "Daskroi", "Sanand", "Viramgam"],
        "Surat": ["Surat City", "Bardoli", "Olpad", "Mangrol"],
        "Rajkot": ["Rajkot City", "Jetpur", "Gondal", "Dhoraji"],
        "Vadodara": ["Vadodara City", "Karjan", "Dabhoi", "Savli"],
        "Anand": ["Anand City", "Khambhat", "Borsad", "Petlad"]
      } },
      "Odisha": { districts: {
        "Khordha": ["Bhubaneswar", "Jatni", "Begunia", "Bolagarh"],
        "Cuttack": ["Cuttack City", "Banki", "Athagarh", "Salepur"],
        "Sambalpur": ["Sambalpur City", "Burla", "Kuchinda", "Rengali"],
        "Ganjam": ["Berhampur", "Bhanjanagar", "Aska", "Chhatrapur"]
      } },
      "Chhattisgarh": { districts: {
        "Raipur": ["Raipur City", "Arang", "Abhanpur", "Tilda"],
        "Bilaspur": ["Bilaspur City", "Takhatpur", "Kota", "Masturi"],
        "Durg": ["Durg City", "Bhilai", "Patan", "Dhamdha"],
        "Korba": ["Korba City", "Katghora", "Pali", "Kartala"]
      } },
      "Jharkhand": { districts: {
        "Ranchi": ["Ranchi City", "Bundu", "Tamar", "Silli"],
        "Dhanbad": ["Dhanbad City", "Jharia", "Govindpur", "Topchanchi"],
        "Bokaro": ["Bokaro City", "Chas", "Bermo", "Gomia"],
        "Hazaribagh": ["Hazaribagh City", "Barhi", "Barkagaon", "Katkamdag"]
      } },
      "Karnataka": { districts: {
        "Bengaluru Urban": ["Bengaluru City", "Anekal", "Hosakote", "Devanahalli"],
        "Mysuru": ["Mysuru City", "Nanjangud", "Hunsur", "T. Narasipura"],
        "Belagavi": ["Belagavi City", "Gokak", "Bailhongal", "Athani"],
        "Ballari": ["Ballari City", "Hosapete", "Sandur", "Siruguppa"]
      } },
      "Tamil Nadu": { districts: {
        "Chennai": ["Chennai City", "Guindy", "Ambattur", "Sholinganallur"],
        "Coimbatore": ["Coimbatore City", "Pollachi", "Mettupalayam", "Sulur"],
        "Madurai": ["Madurai City", "Thirumangalam", "Melur", "Vadipatti"],
        "Salem": ["Salem City", "Attur", "Mettur", "Omalur"],
        "Thanjavur": ["Thanjavur City", "Kumbakonam", "Pattukkottai", "Orathanadu"]
      } },
      "Andhra Pradesh": { districts: {
        "Guntur": ["Guntur City", "Tenali", "Mangalagiri", "Sattenapalli"],
        "Krishna": ["Vijayawada", "Machilipatnam", "Gudivada", "Nuzvid"],
        "Anantapur": ["Anantapur City", "Hindupur", "Guntakal", "Tadipatri"],
        "East Godavari": ["Rajahmundry", "Kakinada", "Peddapuram", "Pithapuram"]
      } },
      "Telangana": { districts: {
        "Hyderabad": ["Hyderabad City", "Secunderabad", "Charminar", "Kukatpally"],
        "Warangal": ["Warangal City", "Hanamkonda", "Jangaon", "Parkal"],
        "Nizamabad": ["Nizamabad City", "Bodhan", "Armoor", "Kamareddy"],
        "Khammam": ["Khammam City", "Kothagudem", "Sathupalli", "Madhira"]
      } },
      "Kerala": { districts: {
        "Thiruvananthapuram": ["Trivandrum City", "Neyyattinkara", "Attingal", "Nedumangad"],
        "Kochi": ["Kochi City", "Aluva", "Muvattupuzha", "Perumbavoor"],
        "Thrissur": ["Thrissur City", "Chalakudy", "Kodungallur", "Wadakkanchery"],
        "Palakkad": ["Palakkad City", "Ottapalam", "Mannarkkad", "Alathur"]
      } },
      "Assam": { districts: {
        "Kamrup Metro": ["Guwahati", "Dispur", "Sonapur", "Chandrapur"],
        "Nagaon": ["Nagaon Town", "Kaliabor", "Raha", "Dhing"],
        "Dibrugarh": ["Dibrugarh Town", "Naharkatia", "Moran", "Tengakhat"],
        "Barpeta": ["Barpeta Town", "Howly", "Sarthebari", "Chenga"]
      } }
    },
    demo_locality: { state: "West Bengal", district: "Kolkata", city: "New Market", label: "Kolkata, West Bengal" }
  };

  return { crops, markets, marketPrices, priceHistory, farmers, buyers, alerts, locations };
})();
