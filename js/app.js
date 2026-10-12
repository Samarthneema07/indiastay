// ============================================================
// IndiaStay — front-end app logic.
// The frontend now uses the Express + SQLite API for users, hotels,
// bookings, availability and reviews. Only the JWT session is kept
// locally in the browser.
// ============================================================

const API_BASE = "http://localhost:4000/api";
const STORAGE_KEYS = { session: "indiastay_session" };
let apiOnline = false;

async function apiFetch(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const session = getSession();
  if (session?.token) headers.Authorization = `Bearer ${session.token}`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  let response;
  try {
    response = await fetch(`${API_BASE}${path}`, { ...options, headers, signal: controller.signal });
  } catch (fetchError) {
    if (fetchError.name === "AbortError") throw new Error("The request timed out. Please check that the IndiaStay backend is running, then try again.");
    throw new Error("Could not reach IndiaStay. Please check that the backend is running and try again.");
  } finally { clearTimeout(timeout); }
  let data = {};
  try { data = await response.json(); } catch (_) {}
  if (!response.ok) {
    const error = new Error(data.error || `Request failed (${response.status})`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function normalizeHotel(h) {
  return {
    ...h,
    area: h.area || "",
    desc: h.description || h.desc || "",
    longDesc: h.long_description || h.longDesc || h.description || "",
    amenities: Array.isArray(h.amenities) ? h.amenities : [],
    totalRooms: Number(h.total_rooms ?? h.totalRooms ?? 0),
    gallery: h.gallery || [h.image],
    rating: h.rating == null ? 0 : Number(h.rating),
    availableRooms: h.availableRooms ?? h.total_rooms ?? h.totalRooms
  };
}

async function checkAPI() {
  try { await apiFetch("/health"); apiOnline = true; return true; }
  catch (_) { apiOnline = false; return false; }
}

async function loadHotels(params = {}) {
  const qs = new URLSearchParams();
  if (params.city) qs.set("city", params.city);
  if (params.checkIn) qs.set("checkIn", params.checkIn);
  if (params.checkOut) qs.set("checkOut", params.checkOut);
  const data = await apiFetch(`/hotels${qs.toString() ? "?" + qs.toString() : ""}`);
  HOTELS = data.map(normalizeHotel);
  return HOTELS;
}

// ---------- session helpers ----------
function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (_) { return fallback; }
}
function saveJSON(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function getSession() { return loadJSON(STORAGE_KEYS.session, null); }
function setSession(data) { saveJSON(STORAGE_KEYS.session, data); }

let currentFilters = { city: "", checkIn: "", checkOut: "", guests: 2 };
let currentHotelId = null;
let selectedRating = 0;
let wishlistIds = new Set();
async function toggleWishlist(hotelId, button) {
  if (!getSession()) { openModal("loginModal"); showToast("Log in to save hotels"); return; }
  try {
    if (wishlistIds.has(hotelId)) { await apiFetch(`/wishlist/${encodeURIComponent(hotelId)}`, {method:"DELETE"}); wishlistIds.delete(hotelId); button.textContent="♡"; showToast("Removed from wishlist"); }
    else { await apiFetch(`/wishlist/${encodeURIComponent(hotelId)}`, {method:"POST"}); wishlistIds.add(hotelId); button.textContent="♥"; showToast("Saved to wishlist"); }
  } catch (err) { showToast(err.message); }
}
async function loadWishlist() {
  if (!getSession() || !apiOnline) { wishlistIds = new Set(); return; }
  try { wishlistIds = new Set((await apiFetch("/wishlist")).map(h => h.id)); } catch (_) { wishlistIds = new Set(); }
}

// ============================================================
// Room availability — read from the backend's live inventory.
// ============================================================
function getAvailableRooms(hotel, checkIn, checkOut) {
  if (hotel && hotel.availableRooms != null && checkIn === currentFilters.checkIn && checkOut === currentFilters.checkOut) {
    return Number(hotel.availableRooms);
  }
  return hotel ? Number(hotel.totalRooms || 0) : 0;
}

// ============================================================
// View routing
// ============================================================
const views = ["home", "listings", "hotel", "about", "bookings"];

function showView(name, opts) {
  opts = opts || {};
  views.forEach(v => {
    document.getElementById("view-" + v).classList.toggle("hidden", v !== name);
  });
  window.scrollTo({ top: 0, behavior: "instant" in window ? "instant" : "auto" });

  if (name === "listings") renderListings();
  if (name === "bookings") renderBookings();
  if (name === "hotel" && opts.hotelId) { currentHotelId = opts.hotelId; renderHotelDetail(opts.hotelId); }
}

document.querySelectorAll("[data-nav]").forEach(el => {
  el.addEventListener("click", e => {
    e.preventDefault();
    const target = el.getAttribute("data-nav");
    if (target === "bookings" && !getSession()) {
      openModal("loginModal");
      showToast("Log in to see your bookings");
      return;
    }
    showView(target);
  });
});

// ============================================================
// Rendering: hotel cards
// ============================================================
function starString(rating) {
  const full = Math.round(rating);
  return "★".repeat(full) + "☆".repeat(5 - full);
}

function hotelCardHTML(hotel) {
  const range = currentFilters.checkIn && currentFilters.checkOut
    ? { in: currentFilters.checkIn, out: currentFilters.checkOut }
    : defaultDateRange();
  const available = getAvailableRooms(hotel, range.in, range.out);

  return `
    <article class="hotel-card" data-hotel-id="${hotel.id}">
      <div class="card-media">
        ${available <= 0 ? `<span class="card-sold-out-badge">Sold out for these dates</span>` : ""}
        <img class="hotel-card-img" src="${hotel.image}" alt="${hotel.name}" loading="lazy">
      </div>
      <div class="hotel-card-body">
        <div class="hotel-card-top">
          <div>
            <div class="hotel-card-title">${hotel.name}</div>
            <div class="hotel-card-area">📍 ${hotel.area}, ${hotel.city}</div>
          </div>
          <button class="wishlist-btn" type="button" data-wishlist="${hotel.id}" title="Save hotel">${wishlistIds.has(hotel.id) ? "♥" : "♡"}</button>
          <div class="seal" title="Verified stay">
            <span class="seal-score">${hotel.rating}</span>
            <span class="seal-label">rated</span>
          </div>
        </div>
        <p class="hotel-card-desc">${hotel.desc}</p>
        <div class="hotel-card-footer">
          <span class="price-tag">₹${hotel.price.toLocaleString("en-IN")} <small>/ night</small></span>
          <button class="btn btn-outline btn-sm">View details</button>
        </div>
      </div>
    </article>
  `;
}

function attachCardHandlers(container) {
  container.querySelectorAll(".hotel-card").forEach(card => {
    card.addEventListener("click", (e) => {
      if (e.target.closest("[data-wishlist]")) return;
      showView("hotel", { hotelId: card.getAttribute("data-hotel-id") });
    });
    const wish = card.querySelector("[data-wishlist]");
    if (wish) wish.addEventListener("click", e => { e.stopPropagation(); toggleWishlist(wish.dataset.wishlist, wish); });
  });
}

function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  const top = [...HOTELS].sort((a, b) => b.rating - a.rating).slice(0, 3);
  grid.innerHTML = top.map(hotelCardHTML).join("");
  attachCardHandlers(grid);
}

async function renderListings() {
  const city = document.getElementById("filterCity").value;
  const maxPrice = Number(document.getElementById("filterPrice").value);
  const minRating = Number(document.getElementById("filterRating").value);
  const sortBy = document.getElementById("sortBy").value;

  if (apiOnline) {
    try { await loadHotels({ city, checkIn: currentFilters.checkIn, checkOut: currentFilters.checkOut }); }
    catch (err) { showToast(err.message); }
  }

  let list = HOTELS.filter(h =>
    (!city || h.city === city) &&
    h.price <= maxPrice &&
    h.rating >= minRating
  );

  if (sortBy === "price-asc") list.sort((a, b) => a.price - b.price);
  else if (sortBy === "price-desc") list.sort((a, b) => b.price - a.price);
  else list.sort((a, b) => b.rating - a.rating);

  const grid = document.getElementById("listingsGrid");
  document.getElementById("listingsCount").textContent = `${list.length} stay${list.length !== 1 ? "s" : ""} found`;

  grid.innerHTML = list.length
    ? list.map(hotelCardHTML).join("")
    : `<div class="empty-state">No hotels match those filters. Try widening your search.</div>`;
  attachCardHandlers(grid);
}

["filterCity", "filterRating", "sortBy"].forEach(id => {
  document.getElementById(id).addEventListener("change", renderListings);
});
const filterPriceEl = document.getElementById("filterPrice");
filterPriceEl.addEventListener("input", () => {
  document.getElementById("filterPriceVal").textContent = Number(filterPriceEl.value).toLocaleString("en-IN");
  renderListings();
});

// Home search form -> jump to listings with the chosen city applied
document.getElementById("searchForm").addEventListener("submit", async e => {
  e.preventDefault();
  const city = document.getElementById("searchCity").value;
  currentFilters.checkIn = document.getElementById("checkIn").value;
  currentFilters.checkOut = document.getElementById("checkOut").value;
  currentFilters.guests = document.getElementById("guestCount").value;
  document.getElementById("filterCity").value = city;
  showView("listings");
});

// ============================================================
// Hotel detail view
// ============================================================
function nightsBetween(checkIn, checkOut) {
  if (!checkIn || !checkOut) return 0;
  const ms = new Date(checkOut) - new Date(checkIn);
  return Math.max(0, Math.round(ms / (1000 * 60 * 60 * 24)));
}

async function renderHotelDetail(hotelId) {
  let hotel = HOTELS.find(h => h.id === hotelId);
  if (apiOnline) {
    try {
      const range = currentFilters.checkIn && currentFilters.checkOut
  ? {
      in: currentFilters.checkIn,
      out: currentFilters.checkOut
    }
  : defaultDateRange();

const qs = `?checkIn=${encodeURIComponent(range.in)}&checkOut=${encodeURIComponent(range.out)}`;

hotel = normalizeHotel(
  await apiFetch(`/hotels/${encodeURIComponent(hotelId)}${qs}`)
);
      HOTELS = HOTELS.map(h => h.id === hotel.id ? hotel : h);
    } catch (err) { showToast(err.message); }
  }
  if (!hotel) return;
  let reviews = [];
  if (apiOnline) {
    try { reviews = await apiFetch(`/hotels/${encodeURIComponent(hotelId)}/reviews`); }
    catch (_) { reviews = []; }
  } else {
    reviews = [];
  }
  const session = getSession();

  const range = currentFilters.checkIn && currentFilters.checkOut
    ? { in: currentFilters.checkIn, out: currentFilters.checkOut }
    : defaultDateRange();
  const availableNow = Number(hotel.availableRooms ?? hotel.totalRooms ?? 0);
  const availClass = availableNow <= 0 ? "sold-out" : availableNow <= 2 ? "low" : "";
  const availText = availableNow <= 0
    ? "Sold out for these dates"
    : `${availableNow} of ${hotel.totalRooms} room${hotel.totalRooms !== 1 ? "s" : ""} available for these dates`;

  const reviewsHTML = reviews.length
    ? reviews.slice().reverse().map(r => `
        <div class="review-card">
          <div class="review-top">
            <span class="review-author">${r.author}</span>
            <span class="review-date">${r.created_at ? new Date(r.created_at).toLocaleDateString("en-IN") : ""}${r.verified ? " · ✓ Verified stay" : ""}</span>
          </div>
          <div class="review-stars">${starString(r.rating)}</div>
          <p>${escapeHTML(r.text)}</p>
        </div>
      `).join("")
    : `<p class="muted">No reviews yet — be the first to share your stay.</p>`;

  const reviewFormHTML = session ? `
      <div class="review-form">
        <h3>Leave a review</h3>
        <div class="star-select" id="starSelect">
          ${[1,2,3,4,5].map(n => `<span data-star="${n}">★</span>`).join("")}
        </div>
        <textarea id="reviewText" placeholder="How was your stay?"></textarea>
        <p class="form-error hidden" id="reviewError"></p>
        <button class="btn btn-primary btn-sm" id="submitReviewBtn" style="margin-top:0.8rem;">Post review</button>
      </div>
    ` : `
      <div class="review-form">
        <p class="muted" style="margin:0;">Want to leave a review? <a href="#" id="reviewLoginLink" style="color:var(--teal); font-weight:600;">Log in</a> first.</p>
      </div>
    `;

  document.getElementById("hotelDetailContent").innerHTML = `
    <img class="hotel-hero-img" src="${hotel.gallery[0]}" alt="${hotel.name}">
    <div class="hotel-detail-wrap">
      <div class="hotel-detail-top">
        <div>
          <h1 class="hotel-detail-title">${hotel.name}</h1>
          <p class="hotel-detail-meta">📍 ${hotel.area}, ${hotel.city} · ${reviews.length} review${reviews.length !== 1 ? "s" : ""}</p>
        </div>
        <div class="seal seal-lg" title="Verified stay">
          <span class="seal-score">${hotel.rating}</span>
          <span class="seal-label">rated</span>
        </div>
      </div>

      <div class="detail-columns">
        <div>
          <p>${hotel.longDesc}</p>
          <div class="amenity-list">
            ${hotel.amenities.map(a => `<span class="amenity-pill">${a}</span>`).join("")}
          </div>

          <div class="reviews-section">
            <h2>Guest reviews</h2>
            ${reviewsHTML}
            ${reviewFormHTML}
          </div>
        </div>

        <div class="booking-box">
          <span class="price-tag">₹${hotel.price.toLocaleString("en-IN")} <small>/ night</small></span>
          <p class="rooms-left ${availClass}">${availText}</p>
          <button class="btn btn-primary btn-block" id="bookNowBtn" ${availableNow <= 0 ? "disabled" : ""}>${availableNow <= 0 ? "Sold out for these dates" : "Book this stay"}</button>
          <p class="hotel-helpline" style="margin-top:1rem;"><strong>📞 Hotel enquiry</strong><br><a href="tel:${escapeHTML(hotel.helpline || "9000010000")}">${escapeHTML(hotel.helpline || "9000010000")}</a><br><small class="muted">Demo contact number — verify before real use</small></p>
          <p class="muted" style="font-size:0.8rem; margin-top:0.8rem;">Payment is optional until online payment is configured; availability is verified by the server.</p>
        </div>
      </div>
    </div>
  `;

  // Book now
  document.getElementById("bookNowBtn").addEventListener("click", () => {
    if (!getSession()) {
      openModal("loginModal");
      showToast("Log in to book a stay");
      return;
    }
    openBookingModal(hotel);
  });

  // Review login link
  const loginLink = document.getElementById("reviewLoginLink");
  if (loginLink) loginLink.addEventListener("click", e => { e.preventDefault(); openModal("loginModal"); });

  // Star picker
  const starSelect = document.getElementById("starSelect");
  if (starSelect) {
    selectedRating = 0;
    starSelect.querySelectorAll("span").forEach(star => {
      star.addEventListener("click", () => {
        selectedRating = Number(star.getAttribute("data-star"));
        starSelect.querySelectorAll("span").forEach(s => {
          s.classList.toggle("active", Number(s.getAttribute("data-star")) <= selectedRating);
        });
      });
    });
  }

  const submitReviewBtn = document.getElementById("submitReviewBtn");
  if (submitReviewBtn) {
    submitReviewBtn.addEventListener("click", async () => {
      const text = document.getElementById("reviewText").value.trim();
      const errorEl = document.getElementById("reviewError");
      if (!selectedRating) { errorEl.textContent = "Pick a star rating first."; errorEl.classList.remove("hidden"); return; }
      if (!text) { errorEl.textContent = "Write a few words about your stay."; errorEl.classList.remove("hidden"); return; }
      errorEl.classList.add("hidden");

      try {
        await apiFetch(`/hotels/${encodeURIComponent(hotelId)}/reviews`, {
          method: "POST",
          body: JSON.stringify({ rating: selectedRating, text })
        });
        showToast("Review posted — thank you!");
        await renderHotelDetail(hotelId);
      } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
      }
    });
  }
}

function escapeHTML(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ============================================================
// Booking modal
// ============================================================
let activeBookingHotel = null;

function defaultDateRange() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const fmt = d => d.toISOString().slice(0, 10);
  return { in: fmt(today), out: fmt(tomorrow) };
}

function openBookingModal(hotel) {
  activeBookingHotel = hotel;
  const fallback = defaultDateRange();
  document.getElementById("bookingHotelId").value = hotel.id;
  document.getElementById("bookingCheckIn").value = currentFilters.checkIn || fallback.in;
  document.getElementById("bookingCheckOut").value = currentFilters.checkOut || fallback.out;
  document.getElementById("bookingGuests").value = currentFilters.guests || 2;
  document.getElementById("bookingRooms").value = 1;
  const select = document.getElementById("bookingRoomType");
  const types = Array.isArray(hotel.roomTypes) ? hotel.roomTypes.filter(r => r.active !== 0) : [];
  select.innerHTML = types.length ? types.map(r => `<option value="${r.id}">${escapeHTML(r.name)} — ₹${Number(r.price).toLocaleString("en-IN")}/night</option>`).join("") : `<option value="">Standard room</option>`;
  select.value = types[0] ? String(types[0].id) : "";
  updateRoomTypeInfo();
  updateBookingTotal();
  updateAvailability();
  openModal("bookingModal");
}

function selectedRoomType(){
  const id=Number(document.getElementById("bookingRoomType")?.value);
  return (activeBookingHotel?.roomTypes||[]).find(r=>Number(r.id)===id) || (activeBookingHotel?.roomTypes||[])[0] || null;
}

function updateRoomTypeInfo(){
  const rt=selectedRoomType(); const info=document.getElementById("roomTypeInfo");
  if(!info)return;
  info.textContent=rt ? `${rt.capacity} guests/room · ${rt.quantity} rooms in inventory${rt.amenities?.length ? " · "+rt.amenities.slice(0,3).join(", ") : ""}` : "";
}

function updateBookingTotal() {
  if (!activeBookingHotel) return;
  const nights = nightsBetween(document.getElementById("bookingCheckIn").value, document.getElementById("bookingCheckOut").value);
  const rooms = Number(document.getElementById("bookingRooms").value) || 1;
  const rt=selectedRoomType();
  const total = nights * rooms * Number(rt?.price ?? activeBookingHotel.price);
  document.getElementById("bookingTotal").textContent = "₹" + total.toLocaleString("en-IN");
  updateRoomTypeInfo();
}

// Re-checks live availability every time dates or room count change,
// so a guest sees "sold out" or "only 2 left" before they even try to submit.
async function updateAvailability() {
  if (!activeBookingHotel) return;
  const checkIn = document.getElementById("bookingCheckIn").value;
  const checkOut = document.getElementById("bookingCheckOut").value;
  const nights = nightsBetween(checkIn, checkOut);
  const note = document.getElementById("bookingAvailabilityNote");
  const submitBtn = document.querySelector("#bookingForm button[type=submit]");

  if (!checkIn || !checkOut || nights <= 0) {
    note.textContent = "";
    note.className = "availability-note hidden";
    submitBtn.disabled = false;
    return;
  }

  let available = getAvailableRooms(activeBookingHotel, checkIn, checkOut);
  if (apiOnline) {
    try {
      const liveHotel = normalizeHotel(await apiFetch(`/hotels/${encodeURIComponent(activeBookingHotel.id)}?checkIn=${encodeURIComponent(checkIn)}&checkOut=${encodeURIComponent(checkOut)}`));
      activeBookingHotel = liveHotel;
      const rt=selectedRoomType();
      available = Number(rt?.availableRooms ?? liveHotel.availableRooms);
    } catch (err) {
      note.textContent = err.message;
      note.className = "availability-note sold-out";
      submitBtn.disabled = true;
      return;
    }
  }
  const roomsInput = document.getElementById("bookingRooms");
  roomsInput.max = Math.max(1, available);

  note.classList.remove("hidden");
  if (available <= 0) {
    note.textContent = "Sold out for these dates — try different dates or another hotel.";
    note.className = "availability-note sold-out";
    submitBtn.disabled = true;
  } else if (available <= 2) {
    note.textContent = `Only ${available} room${available !== 1 ? "s" : ""} left for these dates — book soon!`;
    note.className = "availability-note low";
    submitBtn.disabled = false;
  } else {
    note.textContent = `${available} rooms available for these dates.`;
    note.className = "availability-note";
    submitBtn.disabled = false;
  }
}

document.getElementById("bookingRoomType").addEventListener("change", () => { updateBookingTotal(); updateAvailability(); });

function updatePaymentButtonLabel() {
  const method = document.querySelector('input[name="paymentMethod"]:checked')?.value || "later";
  const btn = document.getElementById("bookingSubmitBtn");
  if (!btn || btn.disabled) return;
  btn.textContent = method === "online" ? "Proceed to secure payment" : "Send booking request";
}

document.querySelectorAll('input[name="paymentMethod"]').forEach(input => {
  input.addEventListener("change", updatePaymentButtonLabel);
});
updatePaymentButtonLabel();

["bookingCheckIn", "bookingCheckOut", "bookingRooms"].forEach(id => {
  document.getElementById(id).addEventListener("input", () => { updateBookingTotal(); updateAvailability(); });
});

document.getElementById("bookingForm").addEventListener("submit", async e => {
  e.preventDefault();
  const checkIn = document.getElementById("bookingCheckIn").value;
  const checkOut = document.getElementById("bookingCheckOut").value;
  const rooms = Number(document.getElementById("bookingRooms").value);
  const guests = Number(document.getElementById("bookingGuests").value);
  const nights = nightsBetween(checkIn, checkOut);
  const errorEl = document.getElementById("bookingError");
  if (!checkIn || !checkOut || nights <= 0) {
    errorEl.textContent = "Pick a valid check-in and check-out date.";
    errorEl.classList.remove("hidden");
    return;
  }

  const roomTypeId = Number(document.getElementById("bookingRoomType").value) || undefined;
  const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked')?.value || "later";
  const submitBtn=document.getElementById("bookingSubmitBtn");
  try {
    submitBtn.disabled=true;
    submitBtn.textContent=paymentMethod === "online" ? "Opening demo payment…" : "Sending booking request…";
    const result = await apiFetch("/bookings", {
      method: "POST",
      body: JSON.stringify({hotelId: activeBookingHotel.id,roomTypeId,checkIn,checkOut,rooms,guests,paymentMethod})
    });

    if(paymentMethod === "online") {
      // Online payment happens BEFORE admin approval. After a successful payment
      // the booking remains PENDING until the hotel/admin approves it.
      closeModal("bookingModal");
      showToast("Booking request created. Opening demo payment…");
      await openPaymentForBooking(result.id);
    } else {
      closeModal("bookingModal");
      showToast(`Booking request sent! ${result.confirmationCode} — waiting for hotel approval.`);
      window.alert("IMPORTANT CHECK-IN INSTRUCTIONS\n\nYou must carry valid original identity proof documents for every guest at check-in. This is mandatory. The hotel may ask to verify them before allowing check-in.");
    }
    await renderBookings();
    if (currentHotelId) await renderHotelDetail(currentHotelId);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("hidden");
    submitBtn.disabled=false;
    submitBtn.textContent=paymentMethod === "online" ? "Proceed to secure payment" : "Send booking request";
    await updateAvailability();
  }
});

function showDemoPaymentModal(bookingId, amount, hotelName) {
  const modal=document.getElementById("demoPaymentModal");
  if(!modal) return;
  document.getElementById("demoPaymentBookingId").value=bookingId;
  document.getElementById("demoPaymentAmount").textContent="₹"+Number(amount||0).toLocaleString("en-IN");
  document.getElementById("demoPaymentHotel").textContent=hotelName||"IndiaStay booking";
  document.getElementById("demoPaymentStep1").classList.remove("hidden");
  document.getElementById("demoPaymentStep2").classList.add("hidden");
  document.getElementById("demoPaymentStep3").classList.add("hidden");
  document.querySelectorAll(".demo-pay-method").forEach(x=>x.classList.remove("selected"));
  const first=document.querySelector(".demo-pay-method");
  if(first) first.classList.add("selected");
  document.getElementById("demoPaymentError").classList.add("hidden");
  modal.classList.remove("hidden");
}

function closeDemoPayment(){
  document.getElementById("demoPaymentModal")?.classList.add("hidden");
}

function selectDemoPaymentMethod(el){
  document.querySelectorAll(".demo-pay-method").forEach(x=>x.classList.remove("selected"));
  el.classList.add("selected");
}

async function completeDemoPayment(){
  const bookingId=Number(document.getElementById("demoPaymentBookingId").value);
  const method=document.querySelector(".demo-pay-method.selected")?.dataset.method||"upi";
  const err=document.getElementById("demoPaymentError");
  const payBtn=document.getElementById("demoPayButton");
  err.classList.add("hidden");
  payBtn.disabled=true;
  payBtn.textContent="Processing payment…";
  document.getElementById("demoPaymentStep1").classList.add("hidden");
  document.getElementById("demoPaymentStep2").classList.remove("hidden");

  await new Promise(r=>setTimeout(r,900));
  try{
    const result=await apiFetch("/payments/demo/complete",{
      method:"POST",
      body:JSON.stringify({bookingId,paymentMethod:method})
    });
    document.getElementById("demoPaymentStep2").classList.add("hidden");
    document.getElementById("demoPaymentStep3").classList.remove("hidden");
    document.getElementById("demoTransactionId").textContent=result.paymentReference||"DEMO-PAYMENT";
    await new Promise(r=>setTimeout(r,700));
    closeDemoPayment();
    showToast("Payment successful — booking is now pending hotel approval.");
    window.alert("IMPORTANT CHECK-IN INSTRUCTIONS\n\nYour booking request has been submitted. You must carry valid original identity proof documents for every guest at check-in. This is mandatory. The hotel may ask to verify them before allowing check-in.");
    await renderBookings();
    if(currentHotelId) await renderHotelDetail(currentHotelId);
  }catch(e){
    document.getElementById("demoPaymentStep2").classList.add("hidden");
    document.getElementById("demoPaymentStep1").classList.remove("hidden");
    err.textContent=e.message;
    err.classList.remove("hidden");
  }finally{
    payBtn.disabled=false;
    payBtn.textContent="Pay now";
  }
}

async function openPaymentForBooking(bookingId) {
  try{
    const bookings=await apiFetch("/bookings");
    const booking=bookings.find(b=>Number(b.id)===Number(bookingId));
    if(!booking) throw new Error("Booking not found.");
    showDemoPaymentModal(booking.id,booking.total,booking.hotel_name);
  }catch(err){ showToast(err.message); }
}

async function payForBooking(bookingId) {
  return openPaymentForBooking(bookingId);
}

// ============================================================
// Cancellation + demo refund flow
// ============================================================
function closeRefundModal(){ document.getElementById("refundCancelModal")?.remove(); }

function cancellationPolicyPreview(checkIn){
  const parts=new Intl.DateTimeFormat("en-CA",{timeZone:"Asia/Kolkata",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date());
  const todayText=`${parts.find(p=>p.type==="year").value}-${parts.find(p=>p.type==="month").value}-${parts.find(p=>p.type==="day").value}`;
  const today=Date.parse(todayText+"T00:00:00Z");
  const date=Date.parse(String(checkIn||"").slice(0,10)+"T00:00:00Z");
  const days=Number.isFinite(date)&&Number.isFinite(today)?Math.floor((date-today)/86400000):0;
  const feePercent=days>=7?0:days>=3?10:days>=1?30:50;
  const label=days>=7?"7 or more days before check-in":days>=3?"3–6 days before check-in":days>=1?"1–2 days before check-in":"Check-in day / less than 1 day";
  return {days,feePercent,label};
}

async function openRefundCancellation(booking){
  closeRefundModal();
  const paid = booking.payment_status === "paid";
  const original = Number(booking.total || 0);
  const policy=cancellationPolicyPreview(booking.check_in);
  const fee = paid ? Math.round(original * policy.feePercent / 100) : 0;
  const refund = paid ? original - fee : 0;
  const modal=document.createElement("div");
  modal.id="refundCancelModal";
  modal.className="modal-overlay refund-cancel-overlay";
  modal.innerHTML=`
    <div class="refund-cancel-modal">
      <button class="modal-close" type="button" onclick="closeRefundModal()">&times;</button>
      <div class="demo-payment-brand"><span>India</span>Stay <small>CANCELLATION</small></div>
      <p class="demo-eyebrow">BOOKING CANCELLATION</p>
      <h2>Cancel this booking?</h2>
      <p class="refund-cancel-subtitle">${paid ? "Your demo payment was already collected, so the refund will be processed automatically." : "No payment has been collected for this booking, so there is nothing to refund."}</p>
      <div class="refund-breakdown">
        <div><span>Booking amount</span><strong>₹${original.toLocaleString("en-IN")}</strong></div>
        <div><span>${paid ? `Cancellation fee (${policy.feePercent}%)` : "Payment collected"}</span><strong>${paid ? "₹"+fee.toLocaleString("en-IN") : "₹0"}</strong></div>
        <div class="refund-breakdown-total"><span>${paid ? "Refund amount" : "Refund amount"}</span><strong>₹${refund.toLocaleString("en-IN")}</strong></div>
      </div>
      <p class="refund-policy-note">${policy.label}: ${policy.feePercent}% cancellation fee and ${100-policy.feePercent}% refund for paid bookings. 7+ days: no fee; 3–6 days: 10%; 1–2 days: 30%; check-in day: 50%. ${paid?"This is a simulated demo refund.":"No payment has been collected, so no cancellation fee is charged."}</p>
      <div class="refund-cancel-actions">
        <button type="button" class="btn btn-secondary" onclick="closeRefundModal()">Keep booking</button>
        <button type="button" class="btn btn-danger" id="confirmRefundCancel">Cancel booking</button>
      </div>
      <p class="form-error hidden" id="refundCancelError"></p>
    </div>`;
  document.body.appendChild(modal);
  modal.querySelector("#confirmRefundCancel").onclick=async()=>{
    const btn=modal.querySelector("#confirmRefundCancel");
    const err=modal.querySelector("#refundCancelError");
    btn.disabled=true; btn.textContent="Processing…"; err.classList.add("hidden");
    try{
      const result=await apiFetch(`/bookings/${encodeURIComponent(booking.id)}`,{method:"DELETE"});
      modal.querySelector(".refund-cancel-modal").innerHTML=`
        <div class="demo-success">
          <div class="demo-check">✓</div>
          <p class="demo-eyebrow">CANCELLATION COMPLETE</p>
          <h2>Booking cancelled</h2>
          <p>${escapeHTML(result.message||"Your booking has been cancelled successfully.")}</p>
          <div class="refund-success-box">
            <div><span>Booking amount</span><strong>₹${Number(result.originalAmount||0).toLocaleString("en-IN")}</strong></div>
            <div><span>Cancellation fee</span><strong>₹${Number(result.cancellationFee||0).toLocaleString("en-IN")}</strong></div>
            <div><span>Refund amount</span><strong>₹${Number(result.refundAmount||0).toLocaleString("en-IN")}</strong></div>
            <div><span>Refund status</span><strong class="refund-done">${escapeHTML(result.refundStatus||"not_applicable")}</strong></div>
            ${result.refundReference?`<div><span>Refund reference</span><strong>${escapeHTML(result.refundReference)}</strong></div>`:""}
          </div>
          <p class="refund-demo-note">This is a simulated refund for the college/demo build. No real money was moved.</p>
          <button type="button" class="btn btn-primary btn-block" onclick="closeRefundModal()">Done</button>
        </div>`;
      showToast(result.refundStatus==="refunded" ? `Booking cancelled — ₹${Number(result.refundAmount||0).toLocaleString("en-IN")} refund processed.` : "Booking cancelled");
      await renderBookings();
      if(currentHotelId) await renderHotelDetail(currentHotelId);
    }catch(e){
      err.textContent=e.message; err.classList.remove("hidden"); btn.disabled=false; btn.textContent="Cancel booking";
    }
  };
}

// ============================================================
// My Bookings view
// ============================================================

// ============================================================
async function renderBookings() {
  const session = getSession();
  const listEl = document.getElementById("bookingsList");
  if (!session) {
    listEl.innerHTML = `<div class="empty-state">Log in to see your bookings.</div>`;
    return;
  }
  let mine = [];
  try { mine = await apiFetch("/bookings"); }
  catch (err) { listEl.innerHTML = `<div class="empty-state">${escapeHTML(err.message)}</div>`; return; }
  if (!mine.length) {
    listEl.innerHTML = `<div class="empty-state">No bookings yet. Find a hotel you like and book your stay!</div>`;
    return;
  }

  const labels={pending:"Pending approval",awaiting_payment:"Approved — payment required",pending_payment:"Payment pending",confirmed:"Confirmed",checked_in:"Checked in",completed:"Completed",cancelled:"Cancelled",no_show:"No show"};
  listEl.innerHTML = mine.map(b => {
    const status=b.status||"pending";
    const canCancel=["pending","pending_payment","awaiting_payment","confirmed"].includes(status);
    const canPay=(status==="pending_payment" || status==="awaiting_payment") && b.payment_status!=="paid";
    const paymentText=b.payment_status==="paid" ? (status==="pending" ? "Paid · awaiting approval" : "Paid") : (canPay ? "Payment required" : (b.payment_status||""));
    return `
      <div class="booking-item ${status} booking-clickable" data-booking-id="${b.id}" data-hotel-id="${escapeHTML(b.hotel_id)}" role="link" tabindex="0" aria-label="Open ${escapeHTML(b.hotel_name)} hotel page">
        <div class="booking-main">
          <div class="booking-heading-row">
            <h4>${escapeHTML(b.hotel_name)}</h4>
            <span class="booking-status status-${status}">${escapeHTML(labels[status]||status)}</span>
          </div>
          <p class="muted" style="margin:0;">${b.check_in} → ${b.check_out} · ${nightsBetween(b.check_in, b.check_out)} night${nightsBetween(b.check_in, b.check_out) !== 1 ? "s" : ""} · ${b.rooms} room${b.rooms !== 1 ? "s" : ""} · ${b.guests} guests</p>
          <p class="booking-meta">${escapeHTML(b.room_type_name||"Standard Room")} · ${escapeHTML(b.confirmation_code||("#"+b.id))} · ${escapeHTML(paymentText)}</p>
        </div>
        <div style="display:flex; align-items:center; gap:.7rem; flex-wrap:wrap;">
          <strong>₹${Number(b.total).toLocaleString("en-IN")}</strong>
          ${canPay ? `<button class="btn btn-primary btn-sm" data-pay="${b.id}">Pay now</button>` : ""}
          ${canCancel ? `<button class="btn btn-danger btn-sm" data-cancel="${b.id}">Cancel</button>` : ""}
        </div>
      </div>`;
  }).join("");

  listEl.querySelectorAll(".booking-clickable").forEach(card => {
    const openHotel=()=>{const hotelId=card.getAttribute("data-hotel-id");if(hotelId)showView("hotel",{hotelId});};
    card.addEventListener("click",e=>{if(e.target.closest("button,a,input,select,textarea"))return;openHotel();});
    card.addEventListener("keydown",e=>{if((e.key==="Enter"||e.key===" ")&&!e.target.closest("button,a,input,select,textarea")){e.preventDefault();openHotel();}});
  });

  listEl.querySelectorAll("[data-cancel]").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id = btn.getAttribute("data-cancel");
      const booking=mine.find(x=>Number(x.id)===Number(id));
      if(booking) openRefundCancellation(booking);
    });
  });
  listEl.querySelectorAll("[data-pay]").forEach(btn => {
    btn.addEventListener("click", () => payForBooking(Number(btn.getAttribute("data-pay"))));
  });
}

// ============================================================
// Auth
// ============================================================
function refreshAuthUI() {
  const session = getSession();
  document.getElementById("loggedOutBox").classList.toggle("hidden", !!session);
  document.getElementById("loggedInBox").classList.toggle("hidden", !session);
  document.querySelectorAll(".requires-auth").forEach(el => el.classList.toggle("hidden", !session));
  if (session) {
    document.getElementById("navUserName").textContent = session.user?.name || session.name || "Guest";
    loadWishlist();
    let adminLink = document.getElementById("adminNavLink");
    if (session.user && ["super_admin","hotel_manager","receptionist"].includes(session.user.role)) {
      if (!adminLink) {
        adminLink = document.createElement("button");
        adminLink.id = "adminNavLink";
        adminLink.className = "btn btn-ghost";
        adminLink.textContent = "Admin";
        adminLink.style.marginLeft = "0.4rem";
        adminLink.onclick = () => window.location.href = "admin/index.html";
        document.getElementById("loggedInBox").appendChild(adminLink);
      }
      adminLink.classList.remove("hidden");
    } else if (adminLink) adminLink.classList.add("hidden");
  } else {
    const adminLink = document.getElementById("adminNavLink");
    if (adminLink) adminLink.classList.add("hidden");
  }

  // If we're currently looking at a hotel, re-render it so the review
  // form (which depends on login state) reflects the change immediately.
  if (!document.getElementById("view-hotel").classList.contains("hidden") && currentHotelId) {
    renderHotelDetail(currentHotelId);
  }
}

document.getElementById("signupForm").addEventListener("submit", async e => {
  e.preventDefault();
  const name = document.getElementById("signupName").value.trim();
  const email = document.getElementById("signupEmail").value.trim().toLowerCase();
  const password = document.getElementById("signupPassword").value;
  const errorEl = document.getElementById("signupError");

  try {
    const result = await apiFetch("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ name, email, password })
    });
    setSession(result);
    closeModal("signupModal");
    refreshAuthUI();
    showToast(`Welcome, ${result.user.name}!`);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("hidden");
  }
});

document.getElementById("loginForm").addEventListener("submit", async e => {
  e.preventDefault();
  const email = document.getElementById("loginEmail").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");

  try {
    const result = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password })
    });
    setSession(result);
    closeModal("loginModal");
    refreshAuthUI();
    showToast(`Welcome back, ${result.user.name}!`);
  } catch (err) {
    errorEl.textContent = err.message;
    errorEl.classList.remove("hidden");
  }
});

document.querySelector('[data-action="logout"]').addEventListener("click", () => {
  localStorage.removeItem(STORAGE_KEYS.session);
  refreshAuthUI();
  showToast("Logged out");
  showView("home");
});

// ============================================================
// Modals
// ============================================================
function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); document.getElementById(id).querySelectorAll(".form-error").forEach(e => e.classList.add("hidden")); }

document.querySelectorAll('[data-action="open-login"]').forEach(b => b.addEventListener("click", () => openModal("loginModal")));
document.querySelectorAll('[data-action="open-signup"]').forEach(b => b.addEventListener("click", () => openModal("signupModal")));
document.querySelectorAll('[data-action="close-modal"]').forEach(b => b.addEventListener("click", e => closeModal(e.target.closest(".modal-overlay").id)));
document.querySelectorAll(".modal-overlay").forEach(overlay => {
  overlay.addEventListener("click", e => { if (e.target === overlay) closeModal(overlay.id); });
});
document.querySelector('[data-action="switch-signup"]').addEventListener("click", e => { e.preventDefault(); closeModal("loginModal"); openModal("signupModal"); });
document.querySelector('[data-action="switch-login"]').addEventListener("click", e => { e.preventDefault(); closeModal("signupModal"); openModal("loginModal"); });

// ============================================================
// Toast
// ============================================================
let toastTimer = null;
function showToast(msg) {
  const toast = document.getElementById("toast");
  toast.textContent = msg;
  toast.classList.remove("hidden");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.add("hidden"), 2600);
}

// ============================================================
// Mobile hamburger (simple: toggles nav-links + auth as a stack)
// ============================================================
document.getElementById("hamburgerBtn").addEventListener("click", () => {
  const links = document.querySelector(".nav-links");
  const auth = document.querySelector(".nav-auth");
  const showing = links.style.display === "flex";
  links.style.display = showing ? "" : "flex";
  auth.style.display = showing ? "" : "flex";
  links.style.flexDirection = "column";
  auth.style.flexDirection = "column";
  if (!showing) {
    links.style.position = "absolute"; links.style.top = "64px"; links.style.left = "0"; links.style.right = "0";
    links.style.background = "var(--paper)"; links.style.padding = "1rem 1.5rem"; links.style.borderBottom = "1px solid var(--line)";
    auth.style.position = "absolute"; auth.style.top = links.offsetHeight + 74 + "px"; auth.style.left = "0"; auth.style.right = "0";
    auth.style.background = "var(--paper)"; auth.style.padding = "1rem 1.5rem";
  }
});

// ============================================================
// Init
// ============================================================
function populateCityDropdowns() {
  const options = CITIES.map(c => `<option value="${c}">${c}</option>`).join("");
  document.getElementById("searchCity").insertAdjacentHTML("beforeend", options);
  document.getElementById("filterCity").insertAdjacentHTML("beforeend", options);
}

populateCityDropdowns();
refreshAuthUI();
(async function init() {
  if (await checkAPI()) {
    try {
      await loadHotels();
      renderFeatured();
    } catch (err) {
      showToast("Could not load hotels from the server.");
      renderFeatured();
    }
  } else {
    showToast("Backend is offline — start the API on port 4000.");
    renderFeatured();
  }
})();

// default date inputs to today/tomorrow for convenience
(function setDefaultDates() {
  const today = new Date();
  const tomorrow = new Date(today.getTime() + 86400000);
  const fmt = d => d.toISOString().slice(0, 10);
  document.getElementById("checkIn").value = fmt(today);
  document.getElementById("checkOut").value = fmt(tomorrow);
})();
