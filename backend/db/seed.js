// Run with: npm run seed
// Loads the same sample hotels used on the frontend into SQLite,
// so the real API returns the same demo data you're used to.
// Generated to span 24 cities across India.
const db = require("./database");

const hotels = [
  {
    "id": "h1",
    "name": "Connaught Place Heritage Inn",
    "city": "Delhi",
    "area": "Connaught Place",
    "price": 3100,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Connaught Place, Delhi, a short ride from India Gate.",
    "long_description": "This heritage-style property in Connaught Place keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to India Gate. Breakfast leans local, so don't skip trying the chole bhature if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h2",
    "name": "Delhi Grand Hotel",
    "city": "Delhi",
    "area": "Karol Bagh",
    "price": 4500,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Karol Bagh, well connected across Delhi.",
    "long_description": "Delhi Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Karol Bagh that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near India Gate.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 9
  },
  {
    "id": "h3",
    "name": "Paharganj Boutique Stay",
    "city": "Delhi",
    "area": "Paharganj",
    "price": 2000,
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Paharganj, Delhi — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Paharganj is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving chole bhature, and India Gate isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h4",
    "name": "India Gate View Residency",
    "city": "Delhi",
    "area": "Hauz Khas",
    "price": 3800,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward India Gate, tucked into Hauz Khas, Delhi.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward India Gate. Located in Hauz Khas, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local chole bhature.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 4
  },
  {
    "id": "h5",
    "name": "Marine Drive Heritage Inn",
    "city": "Mumbai",
    "area": "Marine Drive",
    "price": 3900,
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Marine Drive, Mumbai, a short ride from Gateway of India.",
    "long_description": "This heritage-style property in Marine Drive keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Gateway of India. Breakfast leans local, so don't skip trying the vada pav if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h6",
    "name": "Mumbai Grand Hotel",
    "city": "Mumbai",
    "area": "Bandra",
    "price": 5800,
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Bandra, well connected across Mumbai.",
    "long_description": "Mumbai Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Bandra that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Gateway of India.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 13
  },
  {
    "id": "h7",
    "name": "Colaba Boutique Stay",
    "city": "Mumbai",
    "area": "Colaba",
    "price": 2500,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Colaba, Mumbai — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Colaba is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving vada pav, and Gateway of India isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h8",
    "name": "Gateway of India View Residency",
    "city": "Mumbai",
    "area": "Andheri",
    "price": 4800,
    "image": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Gateway of India, tucked into Andheri, Mumbai.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Gateway of India. Located in Andheri, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local vada pav.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 8
  },
  {
    "id": "h9",
    "name": "Old City Heritage Inn",
    "city": "Jaipur",
    "area": "Old City",
    "price": 2400,
    "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Old City, Jaipur, a short ride from Hawa Mahal.",
    "long_description": "This heritage-style property in Old City keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Hawa Mahal. Breakfast leans local, so don't skip trying the dal baati churma if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h10",
    "name": "Jaipur Grand Hotel",
    "city": "Jaipur",
    "area": "Malviya Nagar",
    "price": 3500,
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Malviya Nagar, well connected across Jaipur.",
    "long_description": "Jaipur Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Malviya Nagar that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Hawa Mahal.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 8
  },
  {
    "id": "h11",
    "name": "C-Scheme Boutique Stay",
    "city": "Jaipur",
    "area": "C-Scheme",
    "price": 1500,
    "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in C-Scheme, Jaipur — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in C-Scheme is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving dal baati churma, and Hawa Mahal isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h12",
    "name": "Hawa Mahal View Residency",
    "city": "Jaipur",
    "area": "Amer Road",
    "price": 2900,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Hawa Mahal, tucked into Amer Road, Jaipur.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Hawa Mahal. Located in Amer Road, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local dal baati churma.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 7
  },
  {
    "id": "h13",
    "name": "Taj Ganj Heritage Inn",
    "city": "Agra",
    "area": "Taj Ganj",
    "price": 2100,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Taj Ganj, Agra, a short ride from the Taj Mahal.",
    "long_description": "This heritage-style property in Taj Ganj keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to the Taj Mahal. Breakfast leans local, so don't skip trying the petha if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h14",
    "name": "Agra Grand Hotel",
    "city": "Agra",
    "area": "Fatehabad Road",
    "price": 3100,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Fatehabad Road, well connected across Agra.",
    "long_description": "Agra Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Fatehabad Road that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near the Taj Mahal.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 12
  },
  {
    "id": "h15",
    "name": "Sadar Bazaar Boutique Stay",
    "city": "Agra",
    "area": "Sadar Bazaar",
    "price": 1400,
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Sadar Bazaar, Agra — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Sadar Bazaar is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving petha, and the Taj Mahal isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h16",
    "name": "Taj Mahal View Residency",
    "city": "Agra",
    "area": "Civil Lines",
    "price": 2600,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward the Taj Mahal, tucked into Civil Lines, Agra.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward the Taj Mahal. Located in Civil Lines, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local petha.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 6
  },
  {
    "id": "h17",
    "name": "Golden Temple Road Heritage Inn",
    "city": "Amritsar",
    "area": "Golden Temple Road",
    "price": 1900,
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Golden Temple Road, Amritsar, a short ride from the Golden Temple.",
    "long_description": "This heritage-style property in Golden Temple Road keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to the Golden Temple. Breakfast leans local, so don't skip trying the Amritsari kulcha if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h18",
    "name": "Amritsar Grand Hotel",
    "city": "Amritsar",
    "area": "Lawrence Road",
    "price": 2800,
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Lawrence Road, well connected across Amritsar.",
    "long_description": "Amritsar Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Lawrence Road that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near the Golden Temple.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 7
  },
  {
    "id": "h19",
    "name": "Ranjit Avenue Boutique Stay",
    "city": "Amritsar",
    "area": "Ranjit Avenue",
    "price": 1200,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Ranjit Avenue, Amritsar — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Ranjit Avenue is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving Amritsari kulcha, and the Golden Temple isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h20",
    "name": "Golden Temple View Residency",
    "city": "Amritsar",
    "area": "Mall Road",
    "price": 2300,
    "image": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward the Golden Temple, tucked into Mall Road, Amritsar.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward the Golden Temple. Located in Mall Road, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local Amritsari kulcha.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 5
  },
  {
    "id": "h21",
    "name": "Mall Road Heritage Inn",
    "city": "Shimla",
    "area": "Mall Road",
    "price": 2600,
    "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Mall Road, Shimla, a short ride from The Ridge.",
    "long_description": "This heritage-style property in Mall Road keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to The Ridge. Breakfast leans local, so don't skip trying the siddu if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h22",
    "name": "Shimla Grand Hotel",
    "city": "Shimla",
    "area": "The Ridge",
    "price": 3800,
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in The Ridge, well connected across Shimla.",
    "long_description": "Shimla Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in The Ridge that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near The Ridge.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 11
  },
  {
    "id": "h23",
    "name": "Chotta Shimla Boutique Stay",
    "city": "Shimla",
    "area": "Chotta Shimla",
    "price": 1700,
    "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Chotta Shimla, Shimla — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Chotta Shimla is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving siddu, and The Ridge isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h24",
    "name": "Ridge View Residency",
    "city": "Shimla",
    "area": "Sanjauli",
    "price": 3200,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward The Ridge, tucked into Sanjauli, Shimla.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward The Ridge. Located in Sanjauli, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local siddu.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 4
  },
  {
    "id": "h25",
    "name": "Old Manali Heritage Inn",
    "city": "Manali",
    "area": "Old Manali",
    "price": 1900,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Old Manali, Manali, a short ride from Hadimba Temple.",
    "long_description": "This heritage-style property in Old Manali keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Hadimba Temple. Breakfast leans local, so don't skip trying the trout curry if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h26",
    "name": "Manali Grand Hotel",
    "city": "Manali",
    "area": "Mall Road",
    "price": 2800,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Mall Road, well connected across Manali.",
    "long_description": "Manali Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Mall Road that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Hadimba Temple.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 6
  },
  {
    "id": "h27",
    "name": "Vashisht Boutique Stay",
    "city": "Manali",
    "area": "Vashisht",
    "price": 1200,
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Vashisht, Manali — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Vashisht is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving trout curry, and Hadimba Temple isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h28",
    "name": "Hadimba Temple View Residency",
    "city": "Manali",
    "area": "Hadimba Road",
    "price": 2300,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Hadimba Temple, tucked into Hadimba Road, Manali.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Hadimba Temple. Located in Hadimba Road, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local trout curry.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 8
  },
  {
    "id": "h29",
    "name": "Laxman Jhula Heritage Inn",
    "city": "Rishikesh",
    "area": "Laxman Jhula",
    "price": 1500,
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Laxman Jhula, Rishikesh, a short ride from Laxman Jhula.",
    "long_description": "This heritage-style property in Laxman Jhula keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Laxman Jhula. Breakfast leans local, so don't skip trying the aloo puri if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h30",
    "name": "Rishikesh Grand Hotel",
    "city": "Rishikesh",
    "area": "Tapovan",
    "price": 2300,
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Tapovan, well connected across Rishikesh.",
    "long_description": "Rishikesh Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Tapovan that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Laxman Jhula.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 10
  },
  {
    "id": "h31",
    "name": "Ram Jhula Boutique Stay",
    "city": "Rishikesh",
    "area": "Ram Jhula",
    "price": 1000,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Ram Jhula, Rishikesh — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Ram Jhula is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving aloo puri, and Laxman Jhula isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h32",
    "name": "Laxman Jhula View Residency",
    "city": "Rishikesh",
    "area": "Muni Ki Reti",
    "price": 1900,
    "image": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Laxman Jhula, tucked into Muni Ki Reti, Rishikesh.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Laxman Jhula. Located in Muni Ki Reti, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local aloo puri.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 7
  },
  {
    "id": "h33",
    "name": "Baga Heritage Inn",
    "city": "Goa",
    "area": "Baga",
    "price": 3800,
    "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Baga, Goa, a short ride from Baga Beach.",
    "long_description": "This heritage-style property in Baga keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Baga Beach. Breakfast leans local, so don't skip trying the fish curry rice if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h34",
    "name": "Goa Grand Hotel",
    "city": "Goa",
    "area": "Calangute",
    "price": 5600,
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Calangute, well connected across Goa.",
    "long_description": "Goa Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Calangute that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Baga Beach.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 14
  },
  {
    "id": "h35",
    "name": "Panaji Boutique Stay",
    "city": "Goa",
    "area": "Panaji",
    "price": 2500,
    "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Panaji, Goa — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Panaji is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving fish curry rice, and Baga Beach isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h36",
    "name": "Baga Beach View Residency",
    "city": "Goa",
    "area": "Palolem",
    "price": 4700,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Baga Beach, tucked into Palolem, Goa.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Baga Beach. Located in Palolem, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local fish curry rice.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 6
  },
  {
    "id": "h37",
    "name": "Lake Pichola Heritage Inn",
    "city": "Udaipur",
    "area": "Lake Pichola",
    "price": 3400,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Lake Pichola, Udaipur, a short ride from Lake Pichola.",
    "long_description": "This heritage-style property in Lake Pichola keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Lake Pichola. Breakfast leans local, so don't skip trying the dal baati if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h38",
    "name": "Udaipur Grand Hotel",
    "city": "Udaipur",
    "area": "City Palace Road",
    "price": 5000,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in City Palace Road, well connected across Udaipur.",
    "long_description": "Udaipur Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in City Palace Road that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Lake Pichola.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 9
  },
  {
    "id": "h39",
    "name": "Fatehsagar Boutique Stay",
    "city": "Udaipur",
    "area": "Fatehsagar",
    "price": 2200,
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Fatehsagar, Udaipur — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Fatehsagar is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving dal baati, and Lake Pichola isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h40",
    "name": "Lake Pichola View Residency",
    "city": "Udaipur",
    "area": "Hiran Magri",
    "price": 4200,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Lake Pichola, tucked into Hiran Magri, Udaipur.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Lake Pichola. Located in Hiran Magri, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local dal baati.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 5
  },
  {
    "id": "h41",
    "name": "Navrangpura Heritage Inn",
    "city": "Ahmedabad",
    "area": "Navrangpura",
    "price": 2100,
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Navrangpura, Ahmedabad, a short ride from Sabarmati Ashram.",
    "long_description": "This heritage-style property in Navrangpura keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Sabarmati Ashram. Breakfast leans local, so don't skip trying the dhokla if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h42",
    "name": "Ahmedabad Grand Hotel",
    "city": "Ahmedabad",
    "area": "CG Road",
    "price": 3100,
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in CG Road, well connected across Ahmedabad.",
    "long_description": "Ahmedabad Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in CG Road that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Sabarmati Ashram.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 13
  },
  {
    "id": "h43",
    "name": "Maninagar Boutique Stay",
    "city": "Ahmedabad",
    "area": "Maninagar",
    "price": 1400,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Maninagar, Ahmedabad — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Maninagar is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving dhokla, and Sabarmati Ashram isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h44",
    "name": "Sabarmati Ashram View Residency",
    "city": "Ahmedabad",
    "area": "Sabarmati",
    "price": 2600,
    "image": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Sabarmati Ashram, tucked into Sabarmati, Ahmedabad.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Sabarmati Ashram. Located in Sabarmati, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local dhokla.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 4
  },
  {
    "id": "h45",
    "name": "Koregaon Park Heritage Inn",
    "city": "Pune",
    "area": "Koregaon Park",
    "price": 2600,
    "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Koregaon Park, Pune, a short ride from Shaniwar Wada.",
    "long_description": "This heritage-style property in Koregaon Park keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Shaniwar Wada. Breakfast leans local, so don't skip trying the misal pav if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h46",
    "name": "Pune Grand Hotel",
    "city": "Pune",
    "area": "Deccan",
    "price": 3800,
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Deccan, well connected across Pune.",
    "long_description": "Pune Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Deccan that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Shaniwar Wada.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 8
  },
  {
    "id": "h47",
    "name": "Viman Nagar Boutique Stay",
    "city": "Pune",
    "area": "Viman Nagar",
    "price": 1700,
    "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Viman Nagar, Pune — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Viman Nagar is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving misal pav, and Shaniwar Wada isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h48",
    "name": "Shaniwar Wada View Residency",
    "city": "Pune",
    "area": "Camp",
    "price": 3200,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Shaniwar Wada, tucked into Camp, Pune.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Shaniwar Wada. Located in Camp, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local misal pav.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 8
  },
  {
    "id": "h49",
    "name": "MG Road Heritage Inn",
    "city": "Bangalore",
    "area": "MG Road",
    "price": 3200,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in MG Road, Bangalore, a short ride from Lalbagh.",
    "long_description": "This heritage-style property in MG Road keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Lalbagh. Breakfast leans local, so don't skip trying the masala dosa if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h50",
    "name": "Bangalore Grand Hotel",
    "city": "Bangalore",
    "area": "Indiranagar",
    "price": 4800,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Indiranagar, well connected across Bangalore.",
    "long_description": "Bangalore Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Indiranagar that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Lalbagh.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 12
  },
  {
    "id": "h51",
    "name": "Koramangala Boutique Stay",
    "city": "Bangalore",
    "area": "Koramangala",
    "price": 2100,
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Koramangala, Bangalore — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Koramangala is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving masala dosa, and Lalbagh isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h52",
    "name": "Lalbagh View Residency",
    "city": "Bangalore",
    "area": "Whitefield",
    "price": 4000,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Lalbagh, tucked into Whitefield, Bangalore.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Lalbagh. Located in Whitefield, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local masala dosa.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 7
  },
  {
    "id": "h53",
    "name": "T Nagar Heritage Inn",
    "city": "Chennai",
    "area": "T Nagar",
    "price": 2700,
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in T Nagar, Chennai, a short ride from Marina Beach.",
    "long_description": "This heritage-style property in T Nagar keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Marina Beach. Breakfast leans local, so don't skip trying the idli sambar if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h54",
    "name": "Chennai Grand Hotel",
    "city": "Chennai",
    "area": "Marina Beach Road",
    "price": 4000,
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Marina Beach Road, well connected across Chennai.",
    "long_description": "Chennai Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Marina Beach Road that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Marina Beach.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 7
  },
  {
    "id": "h55",
    "name": "Mylapore Boutique Stay",
    "city": "Chennai",
    "area": "Mylapore",
    "price": 1800,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Mylapore, Chennai — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Mylapore is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving idli sambar, and Marina Beach isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h56",
    "name": "Marina Beach View Residency",
    "city": "Chennai",
    "area": "Adyar",
    "price": 3400,
    "image": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Marina Beach, tucked into Adyar, Chennai.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Marina Beach. Located in Adyar, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local idli sambar.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 6
  },
  {
    "id": "h57",
    "name": "Fort Kochi Heritage Inn",
    "city": "Kochi",
    "area": "Fort Kochi",
    "price": 2700,
    "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Fort Kochi, Kochi, a short ride from the Chinese fishing nets.",
    "long_description": "This heritage-style property in Fort Kochi keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to the Chinese fishing nets. Breakfast leans local, so don't skip trying the appam and stew if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h58",
    "name": "Kochi Grand Hotel",
    "city": "Kochi",
    "area": "Marine Drive",
    "price": 4000,
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Marine Drive, well connected across Kochi.",
    "long_description": "Kochi Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Marine Drive that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near the Chinese fishing nets.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 11
  },
  {
    "id": "h59",
    "name": "Ernakulam Boutique Stay",
    "city": "Kochi",
    "area": "Ernakulam",
    "price": 1800,
    "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Ernakulam, Kochi — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Ernakulam is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving appam and stew, and the Chinese fishing nets isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h60",
    "name": "Chinese fishing nets View Residency",
    "city": "Kochi",
    "area": "Willingdon Island",
    "price": 3400,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward the Chinese fishing nets, tucked into Willingdon Island, Kochi.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward the Chinese fishing nets. Located in Willingdon Island, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local appam and stew.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 5
  },
  {
    "id": "h61",
    "name": "Banjara Hills Heritage Inn",
    "city": "Hyderabad",
    "area": "Banjara Hills",
    "price": 2800,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Banjara Hills, Hyderabad, a short ride from Charminar.",
    "long_description": "This heritage-style property in Banjara Hills keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Charminar. Breakfast leans local, so don't skip trying the Hyderabadi biryani if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h62",
    "name": "Hyderabad Grand Hotel",
    "city": "Hyderabad",
    "area": "Charminar",
    "price": 4100,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Charminar, well connected across Hyderabad.",
    "long_description": "Hyderabad Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Charminar that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Charminar.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 6
  },
  {
    "id": "h63",
    "name": "Jubilee Hills Boutique Stay",
    "city": "Hyderabad",
    "area": "Jubilee Hills",
    "price": 1800,
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Jubilee Hills, Hyderabad — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Jubilee Hills is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving Hyderabadi biryani, and Charminar isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h64",
    "name": "Charminar View Residency",
    "city": "Hyderabad",
    "area": "Gachibowli",
    "price": 3500,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Charminar, tucked into Gachibowli, Hyderabad.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Charminar. Located in Gachibowli, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local Hyderabadi biryani.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 4
  },
  {
    "id": "h65",
    "name": "Palace Road Heritage Inn",
    "city": "Mysore",
    "area": "Palace Road",
    "price": 1900,
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Palace Road, Mysore, a short ride from Mysore Palace.",
    "long_description": "This heritage-style property in Palace Road keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Mysore Palace. Breakfast leans local, so don't skip trying the Mysore pak if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h66",
    "name": "Mysore Grand Hotel",
    "city": "Mysore",
    "area": "Vijayanagar",
    "price": 2800,
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Vijayanagar, well connected across Mysore.",
    "long_description": "Mysore Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Vijayanagar that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Mysore Palace.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 10
  },
  {
    "id": "h67",
    "name": "Jayalakshmipuram Boutique Stay",
    "city": "Mysore",
    "area": "Jayalakshmipuram",
    "price": 1200,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Jayalakshmipuram, Mysore — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Jayalakshmipuram is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving Mysore pak, and Mysore Palace isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h68",
    "name": "Mysore Palace View Residency",
    "city": "Mysore",
    "area": "Nazarbad",
    "price": 2300,
    "image": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Mysore Palace, tucked into Nazarbad, Mysore.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Mysore Palace. Located in Nazarbad, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local Mysore pak.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 8
  },
  {
    "id": "h69",
    "name": "Madikeri Heritage Inn",
    "city": "Coorg",
    "area": "Madikeri",
    "price": 2700,
    "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Madikeri, Coorg, a short ride from Abbey Falls.",
    "long_description": "This heritage-style property in Madikeri keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Abbey Falls. Breakfast leans local, so don't skip trying the pandi curry if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h70",
    "name": "Coorg Grand Hotel",
    "city": "Coorg",
    "area": "Virajpet",
    "price": 4000,
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Virajpet, well connected across Coorg.",
    "long_description": "Coorg Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Virajpet that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Abbey Falls.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 14
  },
  {
    "id": "h71",
    "name": "Kushalnagar Boutique Stay",
    "city": "Coorg",
    "area": "Kushalnagar",
    "price": 1800,
    "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Kushalnagar, Coorg — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Kushalnagar is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving pandi curry, and Abbey Falls isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h72",
    "name": "Abbey Falls View Residency",
    "city": "Coorg",
    "area": "Napoklu",
    "price": 3400,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Abbey Falls, tucked into Napoklu, Coorg.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Abbey Falls. Located in Napoklu, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local pandi curry.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 7
  },
  {
    "id": "h73",
    "name": "Park Street Heritage Inn",
    "city": "Kolkata",
    "area": "Park Street",
    "price": 2200,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Park Street, Kolkata, a short ride from Victoria Memorial.",
    "long_description": "This heritage-style property in Park Street keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Victoria Memorial. Breakfast leans local, so don't skip trying the kathi rolls if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h74",
    "name": "Kolkata Grand Hotel",
    "city": "Kolkata",
    "area": "Salt Lake",
    "price": 3300,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Salt Lake, well connected across Kolkata.",
    "long_description": "Kolkata Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Salt Lake that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Victoria Memorial.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 9
  },
  {
    "id": "h75",
    "name": "Esplanade Boutique Stay",
    "city": "Kolkata",
    "area": "Esplanade",
    "price": 1400,
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Esplanade, Kolkata — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Esplanade is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving kathi rolls, and Victoria Memorial isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h76",
    "name": "Victoria Memorial View Residency",
    "city": "Kolkata",
    "area": "Ballygunge",
    "price": 2700,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Victoria Memorial, tucked into Ballygunge, Kolkata.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Victoria Memorial. Located in Ballygunge, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local kathi rolls.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 6
  },
  {
    "id": "h77",
    "name": "Mall Road Heritage Inn",
    "city": "Darjeeling",
    "area": "Mall Road",
    "price": 2000,
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Mall Road, Darjeeling, a short ride from Tiger Hill.",
    "long_description": "This heritage-style property in Mall Road keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Tiger Hill. Breakfast leans local, so don't skip trying the momos if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h78",
    "name": "Darjeeling Grand Hotel",
    "city": "Darjeeling",
    "area": "Chowrasta",
    "price": 3000,
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Chowrasta, well connected across Darjeeling.",
    "long_description": "Darjeeling Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Chowrasta that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Tiger Hill.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 13
  },
  {
    "id": "h79",
    "name": "Jawahar Road Boutique Stay",
    "city": "Darjeeling",
    "area": "Jawahar Road",
    "price": 1300,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Jawahar Road, Darjeeling — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Jawahar Road is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving momos, and Tiger Hill isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h80",
    "name": "Tiger Hill View Residency",
    "city": "Darjeeling",
    "area": "Ghoom",
    "price": 2500,
    "image": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Tiger Hill, tucked into Ghoom, Darjeeling.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Tiger Hill. Located in Ghoom, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local momos.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 5
  },
  {
    "id": "h81",
    "name": "Old Town Heritage Inn",
    "city": "Bhubaneswar",
    "area": "Old Town",
    "price": 1700,
    "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Old Town, Bhubaneswar, a short ride from Lingaraj Temple.",
    "long_description": "This heritage-style property in Old Town keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Lingaraj Temple. Breakfast leans local, so don't skip trying the chhena poda if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h82",
    "name": "Bhubaneswar Grand Hotel",
    "city": "Bhubaneswar",
    "area": "Saheed Nagar",
    "price": 2500,
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Saheed Nagar, well connected across Bhubaneswar.",
    "long_description": "Bhubaneswar Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Saheed Nagar that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Lingaraj Temple.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 8
  },
  {
    "id": "h83",
    "name": "Patia Boutique Stay",
    "city": "Bhubaneswar",
    "area": "Patia",
    "price": 1100,
    "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Patia, Bhubaneswar — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Patia is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving chhena poda, and Lingaraj Temple isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h84",
    "name": "Lingaraj Temple View Residency",
    "city": "Bhubaneswar",
    "area": "Jaydev Vihar",
    "price": 2100,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Lingaraj Temple, tucked into Jaydev Vihar, Bhubaneswar.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Lingaraj Temple. Located in Jaydev Vihar, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local chhena poda.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 4
  },
  {
    "id": "h85",
    "name": "New Market Heritage Inn",
    "city": "Bhopal",
    "area": "New Market",
    "price": 1700,
    "image": "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in New Market, Bhopal, a short ride from Upper Lake.",
    "long_description": "This heritage-style property in New Market keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Upper Lake. Breakfast leans local, so don't skip trying the Bhopali gosht if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h86",
    "name": "Bhopal Grand Hotel",
    "city": "Bhopal",
    "area": "Arera Colony",
    "price": 2500,
    "image": "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Arera Colony, well connected across Bhopal.",
    "long_description": "Bhopal Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Arera Colony that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Upper Lake.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 12
  },
  {
    "id": "h87",
    "name": "MP Nagar Boutique Stay",
    "city": "Bhopal",
    "area": "MP Nagar",
    "price": 1100,
    "image": "https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in MP Nagar, Bhopal — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in MP Nagar is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving Bhopali gosht, and Upper Lake isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h88",
    "name": "Upper Lake View Residency",
    "city": "Bhopal",
    "area": "Shahpura",
    "price": 2100,
    "image": "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Upper Lake, tucked into Shahpura, Bhopal.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Upper Lake. Located in Shahpura, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local Bhopali gosht.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 8
  },
  {
    "id": "h89",
    "name": "Rajwada Heritage Inn",
    "city": "Indore",
    "area": "Rajwada",
    "price": 1500,
    "image": "https://images.unsplash.com/photo-1564501049412-61c2a3083791?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Rajwada, Indore, a short ride from Rajwada Palace.",
    "long_description": "This heritage-style property in Rajwada keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Rajwada Palace. Breakfast leans local, so don't skip trying the poha-jalebi if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h90",
    "name": "Indore Grand Hotel",
    "city": "Indore",
    "area": "Vijay Nagar",
    "price": 2300,
    "image": "https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Vijay Nagar, well connected across Indore.",
    "long_description": "Indore Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Vijay Nagar that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Rajwada Palace.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 7
  },
  {
    "id": "h91",
    "name": "Palasia Boutique Stay",
    "city": "Indore",
    "area": "Palasia",
    "price": 1000,
    "image": "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Palasia, Indore — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Palasia is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving poha-jalebi, and Rajwada Palace isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h92",
    "name": "Rajwada Palace View Residency",
    "city": "Indore",
    "area": "Sarafa Bazaar",
    "price": 1900,
    "image": "https://images.unsplash.com/photo-1561361058-c24cecae35ca?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Rajwada Palace, tucked into Sarafa Bazaar, Indore.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Rajwada Palace. Located in Sarafa Bazaar, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local poha-jalebi.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 7
  },
  {
    "id": "h93",
    "name": "Police Bazar Heritage Inn",
    "city": "Shillong",
    "area": "Police Bazar",
    "price": 1900,
    "image": "https://images.unsplash.com/photo-1595658658481-d53d3f999875?auto=format&fit=crop&w=800&q=60",
    "description": "A restored heritage property in Police Bazar, Shillong, a short ride from Umiam Lake.",
    "long_description": "This heritage-style property in Police Bazar keeps its old-world character — courtyards, high ceilings, and a genuinely local feel — while staying close to Umiam Lake. Breakfast leans local, so don't skip trying the jadoh if it's on the menu.",
    "amenities": [
      "Free Wi-Fi",
      "Heritage courtyard",
      "Rooftop café",
      "Airport pickup"
    ],
    "total_rooms": 5
  },
  {
    "id": "h94",
    "name": "Shillong Grand Hotel",
    "city": "Shillong",
    "area": "Laitumkhrah",
    "price": 2800,
    "image": "https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=800&q=60",
    "description": "A modern, business-friendly hotel in Laitumkhrah, well connected across Shillong.",
    "long_description": "Shillong Grand Hotel is built for travellers who want reliability — strong Wi-Fi, comfortable work desks, and a location in Laitumkhrah that's well connected across the city. It's a solid base whether you're here for meetings or sightseeing near Umiam Lake.",
    "amenities": [
      "Free Wi-Fi",
      "Gym",
      "In-house restaurant",
      "Conference room",
      "Airport pickup"
    ],
    "total_rooms": 11
  },
  {
    "id": "h95",
    "name": "Umiam Boutique Stay",
    "city": "Shillong",
    "area": "Umiam",
    "price": 1200,
    "image": "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=60",
    "description": "Budget-friendly boutique rooms right in Umiam, Shillong — simple, clean, and central.",
    "long_description": "Small and simple by design, this boutique stay in Umiam is built for travellers who'd rather spend on experiences than furniture. It's an easy walk to the local food stalls serving jadoh, and Umiam Lake isn't far either.",
    "amenities": [
      "Free Wi-Fi",
      "24-hour check-in",
      "Rooftop seating",
      "Locker facility"
    ],
    "total_rooms": 2
  },
  {
    "id": "h96",
    "name": "Umiam Lake View Residency",
    "city": "Shillong",
    "area": "Wards Lake",
    "price": 2300,
    "image": "https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=60",
    "description": "Rooms with views toward Umiam Lake, tucked into Wards Lake, Shillong.",
    "long_description": "Ask for a view room here and you won't regret it — many rooms look out toward Umiam Lake. Located in Wards Lake, it's a comfortable, mid-range base with a restaurant that serves a solid version of the local jadoh.",
    "amenities": [
      "Free Wi-Fi",
      "Scenic view",
      "Rooftop restaurant",
      "Room service"
    ],
    "total_rooms": 6
  }
];

const insert = db.prepare(`
  INSERT OR REPLACE INTO hotels (id, name, city, area, price, image, description, long_description, amenities, total_rooms)
  VALUES (@id, @name, @city, @area, @price, @image, @description, @long_description, @amenities, @total_rooms)
`);

const insertMany = db.transaction((rows) => {
  for (const row of rows) {
    insert.run({ ...row, amenities: JSON.stringify(row.amenities) });
  }
});

insertMany(hotels);
console.log(`Seeded ${hotels.length} hotels into indiastay.db`);
