// Central place for enums shared across models/controllers.
// Mirrors the frontend's src/utils/binHelpers.js thresholds exactly so the
// backend and UI never disagree on what "Full" or "Almost Full" means.

const ROLES = {
  ADMIN: 'Administrator',
  OFFICER: 'Municipality Officer',
  WORKER: 'Waste Collection Worker',
};

const STATUS = {
  NORMAL: 'Normal',
  ALMOST_FULL: 'Almost Full',
  FULL: 'Full',
  OFFLINE: 'Offline',
};

const SENSOR_STATUS = {
  ONLINE: 'Online',
  OFFLINE: 'Offline',
};

const PRIORITY = {
  LOW: 'Low',
  MEDIUM: 'Medium',
  HIGH: 'High',
};

function getStatusFromFill(fillLevel) {
  if (fillLevel >= 90) return STATUS.FULL;
  if (fillLevel >= 71) return STATUS.ALMOST_FULL;
  return STATUS.NORMAL;
}

function priorityFromFill(fillLevel) {
  if (fillLevel >= 90) return PRIORITY.HIGH;
  if (fillLevel >= 71) return PRIORITY.MEDIUM;
  return PRIORITY.LOW;
}

module.exports = {
  ROLES,
  STATUS,
  SENSOR_STATUS,
  PRIORITY,
  getStatusFromFill,
  priorityFromFill,
};
