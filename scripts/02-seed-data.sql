-- Insert barangays data
INSERT INTO barangays (id, name, current_level, daily_consumption, shortage_threshold, priority, water_needed) VALUES
('B1', 'Tondo', 2500, 500, 2000, 10, 5000),
('B2', 'Binondo', 1800, 300, 1500, 8, 3500),
('B3', 'Malate', 3000, 600, 2500, 9, 4000),
('B4', 'Ermita', 1200, 400, 1000, 7, 6000),
('B5', 'Sampaloc', 2200, 450, 1800, 9, 4500),
('B6', 'Santa Mesa', 1600, 350, 1400, 6, 3000),
('B7', 'Quiapo', 2800, 550, 2300, 8, 5500),
('B8', 'San Nicolas', 1400, 320, 1200, 5, 2800)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  current_level = EXCLUDED.current_level,
  daily_consumption = EXCLUDED.daily_consumption,
  shortage_threshold = EXCLUDED.shortage_threshold,
  priority = EXCLUDED.priority,
  water_needed = EXCLUDED.water_needed;

-- Insert pumping stations data
INSERT INTO pumping_stations (id, name, capacity) VALUES
('PS1', 'Putatan Station', 10000),
('PS2', 'Balara Station', 12000),
('PS3', 'La Mesa Station', 8000),
('PS4', 'Novaliches Station', 9500)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  capacity = EXCLUDED.capacity;

-- Insert cost matrix data
INSERT INTO cost_matrix (station_id, barangay_id, cost) VALUES
('PS1', 'B1', 20), ('PS1', 'B2', 25), ('PS1', 'B3', 30), ('PS1', 'B4', 35),
('PS1', 'B5', 40), ('PS1', 'B6', 45), ('PS1', 'B7', 22), ('PS1', 'B8', 28),
('PS2', 'B1', 15), ('PS2', 'B2', 18), ('PS2', 'B3', 35), ('PS2', 'B4', 40),
('PS2', 'B5', 20), ('PS2', 'B6', 25), ('PS2', 'B7', 30), ('PS2', 'B8', 32),
('PS3', 'B1', 45), ('PS3', 'B2', 40), ('PS3', 'B3', 15), ('PS3', 'B4', 18),
('PS3', 'B5', 50), ('PS3', 'B6', 55), ('PS3', 'B7', 42), ('PS3', 'B8', 48),
('PS4', 'B1', 35), ('PS4', 'B2', 30), ('PS4', 'B3', 25), ('PS4', 'B4', 20),
('PS4', 'B5', 15), ('PS4', 'B6', 18), ('PS4', 'B7', 38), ('PS4', 'B8', 35)
ON CONFLICT (station_id, barangay_id) DO UPDATE SET
  cost = EXCLUDED.cost;
