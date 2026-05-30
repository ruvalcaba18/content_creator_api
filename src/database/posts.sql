
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  text TEXT,
  image TEXT,
  schedule_days VARCHAR(50),
  schedule_time VARCHAR(10),
  last_posted TIMESTAMP,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
