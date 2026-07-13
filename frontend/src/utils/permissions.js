import { ROLES } from "../app/constants";

export const PERMISSIONS = {
  [ROLES.ADMIN]: [
    "dashboard:view", "capture:start", "capture:stop", "capture:replay",
    "prediction:create", "models:view", "models:manage", "dataset:view",
    "alerts:view", "alerts:export", "alerts:clear", "alerts:delete",
    "logs:view", "logs:export", "logs:clear", "users:view", "users:manage",
    "profile:view",
  ],
  [ROLES.SECURITY_ANALYST]: [
    "dashboard:view", "capture:start", "capture:stop", "capture:replay",
    "prediction:create", "models:view", "dataset:view", "alerts:view",
    "alerts:export", "logs:view", "logs:export", "profile:view",
  ],
};

export const ROUTE_PERMISSIONS = {
  "/dashboard": "dashboard:view",
  "/live-capture": "capture:start",
  "/manual-prediction": "prediction:create",
  "/models": "models:view",
  "/dataset-overview": "dataset:view",
  "/alerts-logs": "alerts:view",
  "/profile": "profile:view",
  "/admin/users": "users:view",
};

export function hasPermission(role, permission) {
  return Boolean(role && PERMISSIONS[role]?.includes(permission));
}

export function canAccessRoute(role, route) {
  const permission = ROUTE_PERMISSIONS[route];
  return permission ? hasPermission(role, permission) : true;
}
