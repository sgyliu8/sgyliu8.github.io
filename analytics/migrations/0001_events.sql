CREATE TABLE IF NOT EXISTS events (
  event_id TEXT PRIMARY KEY,
  occurred_at INTEGER NOT NULL,
  day TEXT NOT NULL,
  path TEXT NOT NULL CHECK (path IN ('/', '/zh/', '/cv/', '/zh/cv/')),
  ip TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  city TEXT NOT NULL DEFAULT ''
);
CREATE INDEX IF NOT EXISTS events_time ON events(occurred_at DESC);
CREATE INDEX IF NOT EXISTS events_day_ip ON events(day, ip);
CREATE TABLE IF NOT EXISTS daily_counts (
  day TEXT NOT NULL,
  path TEXT NOT NULL,
  views INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (day, path)
);
CREATE TABLE IF NOT EXISTS lifetime_counts (
  path TEXT PRIMARY KEY,
  views INTEGER NOT NULL DEFAULT 0,
  first_at INTEGER NOT NULL,
  last_at INTEGER NOT NULL
);
CREATE TRIGGER IF NOT EXISTS count_new_event AFTER INSERT ON events BEGIN
  INSERT INTO daily_counts(day, path, views) VALUES (NEW.day, NEW.path, 1)
    ON CONFLICT(day, path) DO UPDATE SET views = views + 1;
  INSERT INTO lifetime_counts(path, views, first_at, last_at)
    VALUES (NEW.path, 1, NEW.occurred_at, NEW.occurred_at)
    ON CONFLICT(path) DO UPDATE SET views = views + 1, last_at = MAX(last_at, NEW.occurred_at);
END;
