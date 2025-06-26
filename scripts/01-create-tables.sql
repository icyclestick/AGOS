-- Create barangays table
CREATE TABLE IF NOT EXISTS barangays (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  current_level INTEGER NOT NULL,
  daily_consumption INTEGER NOT NULL,
  shortage_threshold INTEGER NOT NULL,
  priority INTEGER NOT NULL,
  water_needed INTEGER NOT NULL
);

-- Create pumping_stations table
CREATE TABLE IF NOT EXISTS pumping_stations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  capacity INTEGER NOT NULL
);

-- Create cost_matrix table
CREATE TABLE IF NOT EXISTS cost_matrix (
  station_id TEXT NOT NULL,
  barangay_id TEXT NOT NULL,
  cost INTEGER NOT NULL,
  PRIMARY KEY (station_id, barangay_id),
  FOREIGN KEY (station_id) REFERENCES pumping_stations(id),
  FOREIGN KEY (barangay_id) REFERENCES barangays(id)
);
