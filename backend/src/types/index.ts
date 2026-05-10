export interface CargoEvent {
  type: 'CREATED' | 'STATUS_UPDATE' | 'DB_CHANGE';
  cargoId?: string;
  payload: Record<string, unknown>;
  originalQueue?: string;
}

export interface AlertPayload {
  message: string;
  level: 'info' | 'warn' | 'error';
  timestamp?: string;
}

export interface DbChangeEvent {
  operationType: string;
  ns?: { coll: string };
  fullDocument?: Record<string, unknown>;
}