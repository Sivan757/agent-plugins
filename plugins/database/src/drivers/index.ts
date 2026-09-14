import { mysqlDriver } from './mysql.js';
import { postgresqlDriver } from './postgresql.js';
import { DRIVER_TYPES, type Capability, type Driver, type DriverType } from './types.js';

const DRIVERS: Record<DriverType, Driver> = {
  mysql: mysqlDriver,
  postgresql: postgresqlDriver,
};

export function isDriverType(value: unknown): value is DriverType {
  return typeof value === 'string' && Object.prototype.hasOwnProperty.call(DRIVERS, value);
}

/** The driver for a connection, or null when its `type` is not one we ship. */
export function driverForType(type: unknown): Driver | null {
  return isDriverType(type) ? DRIVERS[type] : null;
}

export function knownTypes(): readonly DriverType[] {
  return DRIVER_TYPES;
}

/** The engine names that declare a capability, for a corrective error message. */
export function enginesWith(capability: Capability): string[] {
  return DRIVER_TYPES.filter((type) => DRIVERS[type].capabilities.has(capability));
}

export { DRIVER_TYPES };
export type { Driver, DriverType };
