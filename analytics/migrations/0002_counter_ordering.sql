-- Keep lifetime endpoints correct when requests commit out of timestamp order.
DROP TRIGGER IF EXISTS count_new_event;
CREATE TRIGGER count_new_event AFTER INSERT ON events BEGIN
  INSERT INTO daily_counts(day, path, views) VALUES (NEW.day, NEW.path, 1)
    ON CONFLICT(day, path) DO UPDATE SET views = views + 1;
  INSERT INTO lifetime_counts(path, views, first_at, last_at)
    VALUES (NEW.path, 1, NEW.occurred_at, NEW.occurred_at)
    ON CONFLICT(path) DO UPDATE SET views = views + 1,
      first_at = MIN(first_at, NEW.occurred_at),
      last_at = MAX(last_at, NEW.occurred_at);
END;
UPDATE lifetime_counts SET
  first_at = MIN(first_at, COALESCE((SELECT MIN(occurred_at) FROM events WHERE events.path = lifetime_counts.path), first_at)),
  last_at = MAX(last_at, COALESCE((SELECT MAX(occurred_at) FROM events WHERE events.path = lifetime_counts.path), last_at));
CREATE INDEX IF NOT EXISTS events_country_time ON events(country, occurred_at DESC);
