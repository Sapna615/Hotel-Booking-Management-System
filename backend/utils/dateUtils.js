/**
 * Date utility functions for Room Occupancies and Booking management
 */

// Format any date or date-string to YYYY-MM-DD in UTC
function formatDateToYYYYMMDD(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }
  const year = d.getUTCFullYear();
  const month = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Normalize date to UTC midnight for consistent database comparisons
function normalizeToUtcMidnight(dateInput) {
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) {
    throw new Error('Invalid date provided');
  }
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
}

// Calculate the number of nights between check-in and check-out
function calculateNights(checkInInput, checkOutInput) {
  const checkIn = normalizeToUtcMidnight(checkInInput);
  const checkOut = normalizeToUtcMidnight(checkOutInput);

  const diffTime = checkOut.getTime() - checkIn.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

// Generate an array of YYYY-MM-DD night strings for the duration of stay
// Check-out day is not an occupied night (guest leaves on check-out day)
function generateOccupancyNights(checkInInput, checkOutInput) {
  const checkIn = normalizeToUtcMidnight(checkInInput);
  const checkOut = normalizeToUtcMidnight(checkOutInput);

  if (checkOut <= checkIn) {
    throw new Error('Check-out date must be strictly after check-in date');
  }

  const nights = [];
  const current = new Date(checkIn.getTime());

  while (current < checkOut) {
    nights.push({
      night: formatDateToYYYYMMDD(current),
      date: new Date(current.getTime()),
    });
    current.setUTCDate(current.getUTCDate() + 1);
  }

  return nights;
}

// Validate check-in and check-out dates
function validateDateRange(checkInInput, checkOutInput) {
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));

  const checkIn = normalizeToUtcMidnight(checkInInput);
  const checkOut = normalizeToUtcMidnight(checkOutInput);

  if (checkIn < todayUtc) {
    return { valid: false, message: 'Check-in date cannot be in the past' };
  }

  if (checkOut <= checkIn) {
    return { valid: false, message: 'Check-out date must be at least one day after check-in date' };
  }

  const nights = calculateNights(checkIn, checkOut);
  if (nights > 30) {
    return { valid: false, message: 'Reservations cannot exceed 30 consecutive nights' };
  }

  return { valid: true, nights };
}

module.exports = {
  formatDateToYYYYMMDD,
  normalizeToUtcMidnight,
  calculateNights,
  generateOccupancyNights,
  validateDateRange,
};

