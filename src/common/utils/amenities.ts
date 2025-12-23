// Mapping from database amenity names to translation keys
export const getAmenityTranslationKey = (amenityName: string): string => {
  const amenityMap: Record<string, string> = {
    'Swimming Pool': 'swimming_pool',
    Gym: 'gym',
    Parking: 'parking',
    WiFi: 'wifi',
    'Air Conditioning': 'air_conditioning',
    Elevator: 'elevator',
    Security: 'security',
    Garden: 'garden',
    Balcony: 'balcony',
    Terrace: 'terrace',
    Fireplace: 'fireplace',
    'Laundry Room': 'laundry_room',
    Concierge: 'concierge',
    Doorman: 'doorman',
    'Pet Friendly': 'pet_friendly',
    'BBQ Area': 'bbq_area',
    Spa: 'spa',
    Sauna: 'sauna',
    Jacuzzi: 'jacuzzi',
    'Tennis Court': 'tennis_court',
    'Basketball Court': 'basketball_court',
    Playground: 'playground',
    Clubhouse: 'clubhouse',
    'Storage Room': 'storage_room',
    'Bicycle Storage': 'bicycle_storage',
    'Central Heating': 'central_heating',
    'Cable TV': 'cable_tv',
    Intercom: 'intercom',
    Furnished: 'furnished',
    'Outdoor Kitchen': 'outdoor_kitchen',
    'Rooftop Deck': 'rooftop_deck',
    'Guest Suite': 'guest_suite',
    'Private Entrance': 'private_entrance',
    'Solar Panels': 'solar_panels',
    'Smart Home System': 'smart_home_system',
    'Home Automation': 'home_automation',
    'Wine Cellar': 'wine_cellar',
    Library: 'library',
    'Media Room': 'media_room',
    'Study Room': 'study_room',
    'Indoor Pool': 'indoor_pool',
    'Garden Patio': 'garden_patio',
    'Fire Alarm': 'fire_alarm',
    'Carbon Monoxide Detector': 'carbon_monoxide_detector',
    'Backup Generator': 'backup_generator',
    'Security Cameras': 'security_cameras',
    Soundproofing: 'soundproofing',
    'High-Speed Internet': 'high_speed_internet',
    'Electric Vehicle Charging Station': 'electric_vehicle_charging_station',
    'Valet Parking': 'valet_parking',
  };

  return amenityMap[amenityName] || amenityName.toLowerCase().replace(/\s+/g, '_');
};

// Helper function to get translated amenity name
export const getTranslatedAmenityName = (
  amenityName: string,
  t: (key: string) => string
): string => {
  const translationKey = getAmenityTranslationKey(amenityName);
  return t(`amenities:${translationKey}`);
};
