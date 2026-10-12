// IndiaStay database — schema + non-destructive migrations.
const Database = require("better-sqlite3");
const path = require("path");

const db = new Database(path.join(__dirname, "indiastay.db"));
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'guest',
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS hotels (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    city TEXT NOT NULL,
    area TEXT NOT NULL,
    price INTEGER NOT NULL,
    image TEXT,
    description TEXT,
    long_description TEXT,
    amenities TEXT,
    total_rooms INTEGER NOT NULL DEFAULT 5,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS room_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT DEFAULT '',
    price INTEGER NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 2,
    quantity INTEGER NOT NULL DEFAULT 1,
    amenities TEXT DEFAULT '[]',
    image TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    hotel_id TEXT NOT NULL REFERENCES hotels(id),
    room_type_id INTEGER REFERENCES room_types(id),
    confirmation_code TEXT UNIQUE,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    rooms INTEGER NOT NULL,
    guests INTEGER NOT NULL,
    total INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'confirmed',
    payment_status TEXT NOT NULL DEFAULT 'not_required',
    payment_provider TEXT,
    payment_reference TEXT,
    refund_status TEXT NOT NULL DEFAULT 'not_applicable',
    refund_amount INTEGER NOT NULL DEFAULT 0,
    refund_reference TEXT,
    refund_processed_at TEXT,
    price_per_night INTEGER,
    cancelled_at TEXT,
    cancellation_reason TEXT,
    checked_in_at TEXT,
    checked_out_at TEXT,
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS reviews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    hotel_id TEXT NOT NULL REFERENCES hotels(id),
    user_id INTEGER NOT NULL REFERENCES users(id),
    booking_id INTEGER REFERENCES bookings(id),
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'published',
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS wishlist (
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hotel_id TEXT NOT NULL REFERENCES hotels(id) ON DELETE CASCADE,
    created_at TEXT DEFAULT (datetime('now')),
    PRIMARY KEY (user_id, hotel_id)
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    actor_user_id INTEGER REFERENCES users(id),
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id TEXT,
    metadata TEXT DEFAULT '{}',
    created_at TEXT DEFAULT (datetime('now'))
  );
`);

// Non-destructive migrations for databases created by Phase 1.
function columns(table) {
  return db.prepare(`PRAGMA table_info(${table})`).all().map(c => c.name);
}
function addColumn(table, name, sql) {
  if (!columns(table).includes(name)) db.exec(`ALTER TABLE ${table} ADD COLUMN ${name} ${sql}`);
}

addColumn("users", "role", "TEXT NOT NULL DEFAULT 'guest'");
addColumn("users", "active", "INTEGER NOT NULL DEFAULT 1");

addColumn("hotels", "active", "INTEGER NOT NULL DEFAULT 1");
addColumn("hotels", "created_at", "TEXT");
addColumn("hotels", "updated_at", "TEXT");
addColumn("hotels", "helpline", "TEXT");

// Demo enquiry numbers for this sample-hotel dataset. Replace with verified
// property contact numbers before publishing the site for real customers.
const hotelsWithoutHelpline = db.prepare("SELECT id FROM hotels WHERE helpline IS NULL OR helpline = '' ORDER BY city, name").all();
const setHotelHelpline = db.prepare("UPDATE hotels SET helpline=? WHERE id=?");
const assignDemoHelplines = db.transaction(() => {
  hotelsWithoutHelpline.forEach((hotel, index) => {
    setHotelHelpline.run(`90000${String(10000 + index).padStart(5, "0")}`, hotel.id);
  });
});
assignDemoHelplines();

addColumn("bookings", "room_type_id", "INTEGER");
addColumn("bookings", "confirmation_code", "TEXT");
addColumn("bookings", "status", "TEXT NOT NULL DEFAULT 'confirmed'");
addColumn("bookings", "payment_status", "TEXT NOT NULL DEFAULT 'not_required'");
addColumn("bookings", "payment_method", "TEXT NOT NULL DEFAULT 'later'");
addColumn("bookings", "payment_provider", "TEXT");
addColumn("bookings", "payment_reference", "TEXT");
addColumn("bookings", "refund_status", "TEXT NOT NULL DEFAULT 'not_applicable'");
addColumn("bookings", "refund_amount", "INTEGER NOT NULL DEFAULT 0");
addColumn("bookings", "refund_reference", "TEXT");
addColumn("bookings", "refund_processed_at", "TEXT");
addColumn("bookings", "price_per_night", "INTEGER");
addColumn("bookings", "cancelled_at", "TEXT");
addColumn("bookings", "cancellation_reason", "TEXT");
addColumn("bookings", "checked_in_at", "TEXT");
addColumn("bookings", "checked_out_at", "TEXT");
addColumn("bookings", "updated_at", "TEXT");

addColumn("reviews", "booking_id", "INTEGER");
addColumn("reviews", "status", "TEXT NOT NULL DEFAULT 'published'");
addColumn("reviews", "updated_at", "TEXT");

// Backfill timestamps and create one Standard room type per legacy hotel.
// This keeps all existing 96 hotels and their old price/inventory intact.
db.prepare("UPDATE hotels SET active=COALESCE(active,1), created_at=COALESCE(created_at,datetime('now')), updated_at=COALESCE(updated_at,datetime('now'))").run();

const insertRoom = db.prepare(`
  INSERT INTO room_types (hotel_id,name,description,price,capacity,quantity,amenities,image)
  VALUES (?,?,?,?,?,?,?,?)
`);
const legacyHotels = db.prepare(`
  SELECT h.* FROM hotels h
  WHERE NOT EXISTS (SELECT 1 FROM room_types r WHERE r.hotel_id=h.id)
`).all();
const createLegacyRooms = db.transaction(() => {
  for (const h of legacyHotels) {
    insertRoom.run(h.id, "Standard Room", "Comfortable standard room", h.price, 2, h.total_rooms, h.amenities || "[]", h.image || null);
  }
});
createLegacyRooms();

// Add three room choices to higher-priced hotels that still only have the
// legacy Standard Room. This migration is idempotent and preserves existing rooms.
const premiumHotels = db.prepare(`
  SELECT h.* FROM hotels h
  WHERE h.active=1 AND h.price >= 8000
    AND (SELECT COUNT(*) FROM room_types r WHERE r.hotel_id=h.id AND r.active=1) = 1
`).all();
const addPremiumRoomTypes = db.transaction(() => {
  const addRoom = db.prepare(`
    INSERT INTO room_types (hotel_id,name,description,price,capacity,quantity,amenities,image)
    VALUES (?,?,?,?,?,?,?,?)
  `);
  for (const h of premiumHotels) {
    const existing = db.prepare("SELECT id FROM room_types WHERE hotel_id=? AND active=1 ORDER BY price,id").get(h.id);
    if (!existing) continue;
    const baseAmenities = h.amenities || "[]";
    addRoom.run(h.id, "Deluxe Room", "Spacious deluxe room with upgraded comfort", Math.round(h.price * 1.35), 3, Math.max(1, Math.floor((h.total_rooms || 3) / 3)), baseAmenities, h.image || null);
    addRoom.run(h.id, "Executive Room", "Premium room with extra space and amenities", Math.round(h.price * 1.75), 3, Math.max(1, Math.floor((h.total_rooms || 3) / 4)), baseAmenities, h.image || null);
  }
});
addPremiumRoomTypes();

// Give old bookings a room type, preserve their existing totals as price snapshots,
// and assign stable confirmation numbers.
const defaultRoom = db.prepare("SELECT id FROM room_types WHERE hotel_id=? ORDER BY id LIMIT 1");
const oldBookings = db.prepare("SELECT * FROM bookings WHERE room_type_id IS NULL").all();
const updateBooking = db.prepare(`
  UPDATE bookings
  SET room_type_id=?, confirmation_code=COALESCE(confirmation_code,?),
      price_per_night=COALESCE(price_per_night, ?),
      status=COALESCE(status,'confirmed'),
      payment_status=COALESCE(payment_status,'not_required'),
      payment_method=COALESCE(payment_method,'later'),
      updated_at=COALESCE(updated_at,datetime('now'))
  WHERE id=?
`);
const backfillBookings = db.transaction(() => {
  for (const b of oldBookings) {
    const r = defaultRoom.get(b.hotel_id);
    if (r) {
      const nights = Math.max(1, Math.round((new Date(b.check_out)-new Date(b.check_in))/86400000));
      const p = Math.round(b.total / Math.max(1, nights*b.rooms));
      updateBooking.run(r.id, `IS-LEGACY-${b.id}`, p, b.id);
    }
  }
});
backfillBookings();

// Existing Phase-1 reviews remain published. New reviews are verified in routes/reviews.js.
db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS idx_bookings_confirmation ON bookings(confirmation_code);
  CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(hotel_id, check_in, check_out);
  CREATE INDEX IF NOT EXISTS idx_bookings_user ON bookings(user_id, created_at);
  CREATE INDEX IF NOT EXISTS idx_room_types_hotel ON room_types(hotel_id, active);
  CREATE INDEX IF NOT EXISTS idx_reviews_hotel ON reviews(hotel_id, status);
  CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at);
`);

module.exports = db;
