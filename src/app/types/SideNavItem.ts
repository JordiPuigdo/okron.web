import { SVGProps } from "react";
import { UserPermission, UserType } from "app/interfaces/User";

export type SideNavItem = {
  key: number;
  title: string;
  path: string;
  submenu?: boolean;
  submenuItems?: SideNavItem[];
  permission: UserPermission[];
  userType: UserType[];
  icon?: React.FunctionComponent<SVGProps<SVGSVGElement>>;
};

let keyCounter = 1; // Initialize a counter for generating unique keys

export const generateKey = (): number => {
  return keyCounter++;
};
