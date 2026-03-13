
export type Role = 'SUPERADMIN' | 'ADMIN' | 'USER';

export interface Permissions {
  canManageUsers: boolean;
  canManageFleet: boolean;
  canManageShifts: boolean;
  canManageSedes: boolean;
  canManageConductores: boolean;
  canManageBitacoras: boolean;
  isReadOnly: boolean;
}

export const getPermissions = (role: Role | string): Permissions => {
  switch (role) {
    case 'SUPERADMIN':
      return {
        canManageUsers: true,
        canManageFleet: true,
        canManageShifts: true,
        canManageSedes: true,
        canManageConductores: true,
        canManageBitacoras: true,
        isReadOnly: false,
      };
    case 'ADMIN':
      return {
        canManageUsers: false,
        canManageFleet: true,
        canManageShifts: true,
        canManageSedes: true,
        canManageConductores: true,
        canManageBitacoras: true,
        isReadOnly: false,
      };
    case 'USER':
    default:
      return {
        canManageUsers: false,
        canManageFleet: false,
        canManageShifts: false,
        canManageSedes: false,
        canManageConductores: false,
        canManageBitacoras: false,
        isReadOnly: true,
      };
  }
};
