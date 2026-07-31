// Village registry — each village represents a Gram Panchayat jurisdiction.
// The Bin ID -> location lookup (the core trick of this project: no GPS
// module needed because the ESP32 only ever needs to report its Bin ID)
// is built from this file plus the landmark list in bins.js.

export const VILLAGES = [
  { id: 'kothapeta', name: 'Kothapeta', ward: 'Ward 4', mandal: 'Ravulapalem Mandal' },
  { id: 'ravulapalem', name: 'Ravulapalem', ward: 'Ward 2', mandal: 'Ravulapalem Mandal' },
  { id: 'mandapeta', name: 'Mandapeta', ward: 'Ward 7', mandal: 'Mandapeta Mandal' },
  { id: 'devarapalli', name: 'Devarapalli', ward: 'Ward 1', mandal: 'Devarapalli Mandal' },
  { id: 'anaparthi', name: 'Anaparthi', ward: 'Ward 5', mandal: 'Anaparthi Mandal' },
]

export const LANDMARKS = [
  'Near Government School',
  'Near Primary Health Centre',
  'Panchayat Office Road',
  'Near Bus Stand',
  'Market Yard Entrance',
  'Temple Street',
  'Near Anganwadi Centre',
  'Canal Road Junction',
  'Near Rice Mill',
  'Housing Colony Gate',
  'Near Water Tank',
  'Church Street',
  'Weavers Colony',
  'Near Veterinary Hospital',
  'Railway Gate Road',
  'Co-operative Bank Street',
  'Near Community Hall',
  'Fish Market Lane',
  'Old Bridge Road',
  'Government Hospital Backgate',
]
