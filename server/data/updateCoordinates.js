// Script to update coordinates in the existing MemStorage events

// Add this function to server/index.ts after the database and routes are initialized
function addCoordinatesToEvents() {
  const coordinates = [
    // San Francisco, CA for Tech Innovation Summit
    { id: 1, latitude: '37.7749', longitude: '-122.4194' },
    
    // Austin, TX for Global Music Festival
    { id: 2, latitude: '30.2672', longitude: '-97.7431' },
    
    // New York, NY for Art Exhibition
    { id: 3, latitude: '40.7128', longitude: '-74.0060' },
    
    // London, UK for Digital Skills Workshop
    { id: 4, latitude: '51.5074', longitude: '-0.1278' },
    
    // Chicago, IL for Startup Competition
    { id: 5, latitude: '41.8781', longitude: '-87.6298' },
    
    // Paris, France for Culinary Masterclass
    { id: 6, latitude: '48.8566', longitude: '2.3522' },
    
    // Bali, Indonesia for Wellness Retreat
    { id: 7, latitude: '-8.3405', longitude: '115.0920' }
  ];
  
  console.log('Adding coordinates to mock events...');
  
  // This code assumes we have the MemStorage instance available
  // You'll need to access your storage instance and update the events
  
  // For example, if using the storage exported from server/storage.ts:
  // coordinates.forEach(coord => {
  //   storage.updateEvent(coord.id, {
  //     latitude: coord.latitude,
  //     longitude: coord.longitude
  //   });
  // });
  
  console.log('Done adding coordinates to mock events');
}

// Make sure to export the function
module.exports = { addCoordinatesToEvents };