import math


EARTH_RADIUS_KM = 6371.0


def calculate_haversine_distance(lat1, lon1, lat2, lon2):
    """
    Calculate the great circle distance between two points 
    on the earth (specified in decimal degrees) in kilometers.
    """
    lat1_rad = math.radians(lat1)
    lon1_rad = math.radians(lon1)
    lat2_rad = math.radians(lat2)
    lon2_rad = math.radians(lon2)

    dlat = lat2_rad - lat1_rad
    dlon = lon2_rad - lon1_rad

    a = (math.sin(dlat / 2.0) ** 2 +
         math.cos(lat1_rad) * math.cos(lat2_rad) * math.sin(dlon / 2.0) ** 2)
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))

    return round(EARTH_RADIUS_KM * c, 2)


def get_bounding_box(lat, lon, radius_km):
    """
    Calculate min/max latitude and longitude for a bounding box
    surrounding a point with a given radius in km.
    """
    # 1 deg lat ~ 111.0 km
    lat_change = radius_km / 111.0
    # 1 deg lon ~ 111.0 * cos(lat) km
    lon_change = radius_km / (111.0 * math.cos(math.radians(lat)) + 1e-6)

    return {
        'min_lat': lat - lat_change,
        'max_lat': lat + lat_change,
        'min_lon': lon - lon_change,
        'max_lon': lon + lon_change,
    }
