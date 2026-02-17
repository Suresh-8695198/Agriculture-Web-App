# Find Suppliers Backend Integration

## Overview
Successfully implemented backend integration for the Find Suppliers feature with location-based search functionality. Farmers can now search for verified suppliers near their location with real-time distance calculation.

## Implementation Details

### Backend Changes

#### 1. API Endpoint (`suppliers/views.py`)
Added `search_nearby` action to `SupplierProfileViewSet`:

**Endpoint:** `GET /api/suppliers/profiles/search_nearby/`

**Query Parameters:**
- `latitude` (optional): User's latitude coordinate
- `longitude` (optional): User's longitude coordinate
- `max_distance` (optional, default: 50): Search radius in kilometers
- `business_type` (optional): Filter by business type (seeds, fertilizers, equipment_rental, etc.)

**Features:**
- Uses Haversine formula for accurate distance calculation
- Filters for verified and active suppliers only
- Falls back to supplier location if user location not available
- Returns suppliers sorted by distance
- Includes `distance_km` field in response
- Gracefully handles missing coordinates

**Example Response:**
```json
[
  {
    "id": 1,
    "business_name": "Green Valley Suppliers",
    "owner_name": "Rajesh Kumar",
    "business_types": "seeds, fertilizers, manure",
    "rating": 4.5,
    "is_active": true,
    "distance_km": 2.5,
    "user": {
      "phone_number": "+91 98765 43210"
    },
    "full_address": "Whitefield, Bangalore Urban, Karnataka, 560066",
    "description": "Quality agricultural supplies with 15+ years of experience"
  }
]
```

### Frontend Changes

#### 1. SearchSupplier Component (`frontend/src/pages/farmer/SearchSupplier.jsx`)
Complete rewrite with dynamic data fetching:

**New Features:**
- ✅ Dynamic supplier loading from API
- ✅ GPS location detection using browser geolocation API
- ✅ Business type filter (All Types, Seeds, Fertilizer, Manure, Equipment Rental)
- ✅ Search radius filter (10, 25, 50, 100 km)
- ✅ Real-time distance display
- ✅ Loading states with spinner
- ✅ Empty state when no suppliers found
- ✅ Toast notifications for user feedback
- ✅ Call functionality with tel: links
- ✅ Supplier status badges (Available/Unavailable)
- ✅ Comprehensive error handling

**State Management:**
```javascript
const [suppliers, setSuppliers] = useState([])
const [loading, setLoading] = useState(true)
const [userLocation, setUserLocation] = useState(null)
const [searchRadius, setSearchRadius] = useState(50)
const [selectedBusinessType, setSelectedBusinessType] = useState('all')
```

**Key Functions:**
- `loadSuppliers()`: Fetches suppliers from API with filters
- `handleUseCurrentLocation()`: Gets user's GPS coordinates
- `handleSearch()`: Triggers search with current filters
- `handleCall()`: Initiates phone call to supplier
- `formatDistance()`: Formats distance in km/meters
- `getBusinessTypeBadge()`: Displays primary business type

#### 2. Styling (`frontend/src/pages/farmer/FarmerPages.css`)
Added new styles for filter components:

**New CSS Classes:**
- `.search-filters`: Grid layout for filter dropdowns
- `.filter-group`: Filter label and select wrapper
- `.filter-select`: Styled dropdown with focus states
- `.search-actions`: Button container for location and search
- `.supplier-owner`: Owner name styling
- `.supplier-description`: Description text with border

### Database Setup

#### Sample Suppliers Created
Created 5 test suppliers with real location data (Bangalore area):

1. **Green Valley Suppliers** (Whitefield)
   - Types: Seeds, Fertilizers, Manure
   - Rating: 4.5
   - Delivery: 25 km radius

2. **Agro Tech Supplies** (BTM Layout)
   - Types: Equipment Rental, Agro Tools
   - Rating: 4.8
   - Delivery: 30 km radius

3. **Farm Fresh Products** (Hoodi) - *Unavailable*
   - Types: Seeds, Manure, Fertilizers
   - Rating: 4.3
   - Pickup only

4. **Modern Agro Solutions** (Indiranagar)
   - Types: Seeds, Fertilizers, Equipment Rental
   - Rating: 4.9
   - Delivery: 50 km radius

5. **Krishna Seeds & Fertilizers** (Marathahalli)
   - Types: Seeds, Fertilizers
   - Rating: 4.6
   - Delivery: 20 km radius

**Script:** `backend/create_sample_suppliers.py`
- Default password: `password123`
- Run: `python create_sample_suppliers.py`

## Usage

### As a Farmer

1. **Enable Location Access**
   - Click "Use Current Location" button
   - Allow browser location permission
   - System fetches nearby suppliers automatically

2. **Filter Suppliers**
   - Select business type (Seeds, Fertilizers, etc.)
   - Choose search radius (10-100 km)
   - Click "Search" to apply filters

3. **View Supplier Details**
   - Distance from your location
   - Rating and availability status
   - Contact number and address
   - Business description

4. **Contact Supplier**
   - Click "Call Now" to initiate phone call
   - Only available for active suppliers
   - View Profile button for detailed information

### Without Location

If location access is denied or unavailable:
- App shows all verified suppliers
- No distance information displayed
- Manual location search (feature can be added)

## Testing

### Test the API Endpoint

1. **Get all suppliers:**
```bash
GET http://localhost:8000/api/suppliers/profiles/search_nearby/
```

2. **Search with location:**
```bash
GET http://localhost:8000/api/suppliers/profiles/search_nearby/?latitude=13.0827&longitude=77.5877&max_distance=25
```

3. **Filter by business type:**
```bash
GET http://localhost:8000/api/suppliers/profiles/search_nearby/?latitude=13.0827&longitude=77.5877&business_type=seeds
```

### Test the Frontend

1. Start the servers:
```bash
# Backend (from backend/)
python manage.py runserver

# Frontend (from frontend/)
npm run dev
```

2. Navigate to: `http://localhost:5173/farmer/search-supplier`

3. Test scenarios:
   - Click "Use Current Location" → Should load nearby suppliers
   - Change business type filter → Should filter results
   - Adjust search radius → Should update results
   - Click "Call Now" → Should initiate phone call
   - Disable location → Should show all suppliers

## Technical Details

### Distance Calculation
Uses Haversine formula for accurate geographic distance:
```python
def haversine(lon1, lat1, lon2, lat2):
    # Convert to radians
    lon1, lat1, lon2, lat2 = map(radians, [lon1, lat1, lon2, lat2])
    
    # Haversine formula
    dlon = lon2 - lon1
    dlat = lat2 - lat1
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * asin(sqrt(a))
    km = 6371 * c  # Earth's radius in kilometers
    return km
```

### Location Data Flow
1. User clicks "Use Current Location"
2. Browser navigator.geolocation API gets coordinates
3. Frontend stores coordinates in state
4. API call includes lat/long as query parameters
5. Backend calculates distance for each supplier
6. Results sorted by distance and returned
7. Frontend displays with distance badges

### Error Handling
- Invalid coordinates → 400 Bad Request
- No location permission → Fallback to all suppliers
- Network errors → Toast notification + empty state
- Missing supplier data → Graceful degradation
- Inactive suppliers → Greyed out with disabled actions

## Future Enhancements

### Potential Improvements
1. **Map View**: Integrate Google Maps/OpenStreetMap
2. **Route Navigation**: Directions to supplier location
3. **Favorites**: Save frequently contacted suppliers
4. **Reviews**: Allow farmers to rate and review suppliers
5. **Live Chat**: Real-time messaging with suppliers
6. **Product Search**: Search suppliers by specific products
7. **Booking System**: Book equipment/products in advance
8. **Push Notifications**: Get alerts for nearby suppliers
9. **Price Comparison**: Compare prices across suppliers
10. **Bulk Orders**: Group buying with other farmers

### Performance Optimizations
- Cache supplier locations
- Paginate results for large datasets
- Add Redis for geospatial queries
- Implement lazy loading for supplier cards
- Add search debouncing

## Files Modified

### Backend
- `suppliers/views.py` - Added search_nearby endpoint
- `create_sample_suppliers.py` - Sample data creation script

### Frontend
- `frontend/src/pages/farmer/SearchSupplier.jsx` - Complete rewrite
- `frontend/src/pages/farmer/FarmerPages.css` - Added filter styles

### Documentation
- `FIND_SUPPLIERS_IMPLEMENTATION.md` - This file

## Summary

✅ **Backend Integration Complete**
- Location-based search API endpoint
- Distance calculation with Haversine formula
- Business type and radius filtering
- Sample suppliers with real location data

✅ **Frontend Integration Complete**
- Dynamic data fetching from API
- GPS location detection
- Filter controls (type, radius)
- Loading, empty, and error states
- Professional UI with distance display
- Call functionality

✅ **Testing Ready**
- 5 sample suppliers created
- API endpoint functional
- Frontend responsive and error-free

The Find Suppliers feature is now fully integrated with the backend and ready for production use! 🎉
