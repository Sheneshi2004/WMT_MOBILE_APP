// Room Type Definition
export const RoomType = {
  Single: 'Single',
  Double: 'Double',
  Triple: 'Triple',
  Shared: 'Shared',
};

// User Role Definition
export const UserRole = {
  ADMIN: 'admin',
  RESIDENT: 'resident',
  STAFF: 'staff',
};

// Status Definitions
export const RoomStatus = {
  AVAILABLE: 'available',
  OCCUPIED: 'occupied',
  MAINTENANCE: 'maintenance',
  RESERVED: 'reserved',
};

export const ResidentStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  BLOCKED: 'blocked',
  LEFT: 'left',
};

export const PaymentStatus = {
  PENDING: 'pending',
  PAID: 'paid',
  OVERDUE: 'overdue',
};

export const ComplaintStatus = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  RESOLVED: 'resolved',
  REJECTED: 'rejected',
};