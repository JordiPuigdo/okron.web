import { OperatorType } from './Operator';

export interface User {
  username: string;
  password: string;
}

export interface LoginUser {
  token: string;
  refreshToken: string;
  refreshTokenExpiryTime: Date;
  agentId: string;
  username: string;
  permission: UserPermission;
  userType: UserType;
}

export enum UserPermission {
  Worker,
  OfficeUser,
  Administrator,
  SuperAdministrator,
  SpareParts,
  Production,
  Warehouse,
}

export enum UserType {
  Maintenance,
  Production,
  Warehouse,
}

export interface OperatorLogged {
  idOperatorLogged: string;
  codeOperatorLogged: string;
  nameOperatorLogged: string;
  operatorLoggedType: OperatorType;
}
