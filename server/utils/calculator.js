/**
 * Business Logic Calculations
 */

// Safe date helper
const safeDate = (date) => {
  if (!date) return null;
  try {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
};

// Calculate medicine status based on stock and expiry
exports.calculateMedicineStatus = (stock, expiryDate, minStockLevel = 10) => {
  const now = new Date();
  const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const expiry = safeDate(expiryDate);

  if (stock === 0) {
    return 'out-of-stock';
  }
  
  if (!expiry) {
    return 'in-stock'; // Can't determine expiry, default to in-stock
  }
  
  if (expiry <= thirtyDaysFromNow) {
    return 'expiring-soon';
  }
  
  if (stock <= minStockLevel) {
    return 'low-stock';
  }
  
  return 'in-stock';
};

// Calculate profit margin
exports.calculateProfitMargin = (buyingPrice, sellingPrice) => {
  if (buyingPrice === 0) return 0;
  return ((sellingPrice - buyingPrice) / buyingPrice * 100).toFixed(2);
};

// Calculate profit per unit
exports.calculateProfitPerUnit = (buyingPrice, sellingPrice) => {
  return sellingPrice - buyingPrice;
};

// Calculate bill totals
exports.calculateBillTotals = (consultationFee, medicines = [], services = []) => {
  const medicinesTotal = medicines.reduce((sum, item) => {
    return sum + (item.price * item.quantity);
  }, 0);

  const servicesTotal = services.reduce((sum, item) => {
    return sum + item.price;
  }, 0);

  const grandTotal = consultationFee + medicinesTotal + servicesTotal;

  return {
    consultationFee,
    medicinesTotal,
    servicesTotal,
    grandTotal
  };
};

// Calculate daily earnings
exports.calculateDailyEarnings = (bills) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return bills
    .filter(bill => {
      const billDate = new Date(bill.createdAt);
      billDate.setHours(0, 0, 0, 0);
      return billDate.getTime() === today.getTime();
    })
    .reduce((sum, bill) => sum + bill.totalAmount, 0);
};

// Calculate monthly growth
exports.calculateMonthlyGrowth = (currentMonthBills, previousMonthBills) => {
  const currentTotal = currentMonthBills.reduce((sum, bill) => sum + bill.totalAmount, 0);
  const previousTotal = previousMonthBills.reduce((sum, bill) => sum + bill.totalAmount, 0);

  if (previousTotal === 0) {
    return currentTotal > 0 ? 100 : 0;
  }

  return ((currentTotal - previousTotal) / previousTotal * 100).toFixed(2);
};

// Calculate revenue breakdown
exports.calculateRevenueBreakdown = (bills) => {
  const breakdown = {
    consultation: 0,
    medicines: 0,
    services: 0,
    total: 0
  };

  bills.forEach(bill => {
    breakdown.consultation += bill.consultationFee || 0;
    breakdown.medicines += bill.medicinesTotal || 0;
    breakdown.services += bill.servicesTotal || 0;
    breakdown.total += bill.totalAmount || 0;
  });

  return breakdown;
};

// Get date range for analytics
exports.getDateRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  switch (period) {
    case 'today':
      return {
        start: today,
        end: now
      };
    
    case 'week':
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      return {
        start: weekStart,
        end: now
      };
    
    case 'month':
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start: monthStart,
        end: now
      };
    
    case 'year':
      const yearStart = new Date(today.getFullYear(), 0, 1);
      return {
        start: yearStart,
        end: now
      };
    
    default:
      return {
        start: today,
        end: now
      };
  }
};

// Format currency (Indian Rupees)
exports.formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
};

// Format date safely
exports.formatDate = (date) => {
  const d = safeDate(date);
  if (!d) return null;
  return d.toISOString().split('T')[0];
};

// Get days difference safely
exports.getDaysDifference = (date1, date2) => {
  const d1 = safeDate(date1);
  const d2 = safeDate(date2);
  
  if (!d1 || !d2) return 0;
  
  const diffTime = Math.abs(d2 - d1);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
