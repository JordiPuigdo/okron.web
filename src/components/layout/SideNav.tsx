'use client';

import React, { useState } from 'react';
import { Tooltip } from 'react-tooltip';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgArrowDown, SvgArrowRight, SvgSpinner } from 'app/icons/icons';
import { UserPermission, UserType } from 'app/interfaces/User';
import { useSessionStore } from 'app/stores/globalStore';
import { SideNavItem } from 'app/types/SideNavItem';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { SIDENAV_ITEMS } from './SideNavItems';

interface SideNavProps {
  isOpenNavBar: boolean;
}

const SideNav: React.FC<SideNavProps> = ({ isOpenNavBar }) => {
  const { loginUser, isMenuOpen } = useSessionStore(state => state);
  const loginPermission = loginUser?.permission!;
  const loginUserType = loginUser?.userType!;

  const configItem = SIDENAV_ITEMS.find(
    item => item.titleKey === 'sidebar.config'
  );
  const otherItems = SIDENAV_ITEMS.filter(
    item => item.titleKey !== 'sidebar.config'
  );

  return (
    <div className="flex flex-col md:px-4 h-full">
      <div className="pt-16 flex flex-col flex-grow">
        {otherItems.map((item, idx) => {
          return (
            item.permission.includes(loginPermission) &&
            item.userType !== undefined &&
            item.userType.includes(loginUserType) && (
              <MenuItem
                key={idx + item.key}
                item={item}
                userType={loginUserType}
                menuOpen={isMenuOpen}
                sideNavOpen={isOpenNavBar}
                userPermission={loginPermission}
              />
            )
          );
        })}
      </div>

      <div className="mt-auto flex flex-col items-start mb-10">
        <hr className="my-4 border-[#E0E0E0] w-full" />
        {configItem &&
          configItem.permission.includes(loginPermission) &&
          configItem.userType?.includes(loginUserType) && (
            <MenuItem
              key={configItem.key}
              item={configItem}
              userType={loginUserType}
              menuOpen={isMenuOpen}
              userPermission={loginPermission}
              sideNavOpen={isOpenNavBar}
            />
          )}
      </div>
    </div>
  );
};

const MenuItem = ({
  item,
  userType,
  userPermission,
  menuOpen,
  sideNavOpen,
}: {
  item: SideNavItem;
  userType: UserType;
  menuOpen: boolean;
  sideNavOpen: boolean;
  userPermission: UserPermission;
}) => {
  const pathname = usePathname();
  const { t } = useTranslations();

  const isActive = pathname === item.path;

  const [subMenuOpen, setSubMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState<{ [key: string]: boolean }>({
    [item.key]: false,
  });

  const toggleSubMenu = () => {
    setSubMenuOpen(!subMenuOpen);
  };

  return (
    <div className="w-full">
      {item.submenu ? (
        <>
          <button
            onClick={toggleSubMenu}
            className={`w-full  hover:text-okron-main ${
              isActive ? 'bg-[#F2F2F2]' : ''
            }`}
          >
            <div className="flex flex-row items-center hover:text-okron-main ">
              <span
                data-tooltip-id={`tooltip-${item.key}`}
                data-tooltip-content={t(item.titleKey)}
                data-tooltip-place="right"
                data-tooltip-delay-show={500}
                className={`font-sm 
                    text-l flex text-gray-700 p-1 w-full mb-1 rounded-md items-center  ${
                      isActive ? 'bg-[#F2F2F2] text-okron-main' : ''
                    }`}
              >
                {item.icon && (
                  <item.icon
                    className={`${
                      menuOpen
                        ? 'min-w-[16px] min-h-[16px] mr-4 '
                        : 'min-w-[24px] min-h-[24px] mb-1 '
                    } ${
                      isActive ? 'text-okron-main' : ''
                    } hover:text-okron-main`}
                  />
                )}
                <div className="text-start">{menuOpen && t(item.titleKey)}</div>
              </span>
              <Tooltip id={`tooltip-${item.key}`} />
              {subMenuOpen && menuOpen ? (
                <div className="flex justify-center">
                  <SvgArrowDown className=" w-6 h-6 " />
                </div>
              ) : (
                <div className="flex justify-center">
                  {!subMenuOpen && menuOpen && (
                    <SvgArrowRight className=" w-6 h-6 " />
                  )}
                </div>
              )}
            </div>
          </button>

          {subMenuOpen && item.titleKey != 'sidebar.config' && (
            <div className={`${sideNavOpen ? 'ml-8' : 'ml-4'} flex flex-col `}>
              {item.submenuItems?.map((subItem, idx) => {
                const isSubItemActive = pathname === subItem.path;

                const isValidPermission =
                  subItem.permission.includes(userPermission) &&
                  subItem.userType.includes(userType);

                if (!isValidPermission) return null;

                return (
                  <Link key={subItem.key} href={subItem.path}>
                    <span
                      data-tooltip-id={`tooltip-${subItem.key}`}
                      data-tooltip-content={t(subItem.titleKey)}
                      data-tooltip-place="right"
                      data-tooltip-delay-show={500}
                      className={`text-sm font-small text-gray-700 flex hover:text-okron-main rounded-md mb-2 items-center ${
                        isSubItemActive ? 'bg-[#F2F2F2] text-okron-main' : ''
                      }`}
                      onClick={() => {
                        setIsLoading(prevLoading => ({
                          ...prevLoading,
                          [subItem.key]: true,
                        }));
                      }}
                    >
                      {subItem.icon && (
                        <subItem.icon
                          className={`${
                            menuOpen
                              ? 'min-w-[16px] min-h-[16px] mr-2'
                              : 'min-w-[14px] min-h-[14px]'
                          } ${
                            isSubItemActive ? 'text-okron-main' : ''
                          } hover:text-okron-main`}
                        />
                      )}

                      {menuOpen && t(subItem.titleKey)}
                      {isLoading[subItem.key] && (
                        <SvgSpinner
                          style={{ marginLeft: '0.5rem' }}
                          className="w-5 h-5 text-okron-main"
                        />
                      )}
                    </span>
                    <Tooltip id={`tooltip-${subItem.key}`} />
                  </Link>
                );
              })}
            </div>
          )}
          {item.titleKey == 'sidebar.config' && (
            <div className="ml-2 flex flex-col">
              {item.submenuItems?.map((subItem, idx) => {
                const isSubItemActive = pathname === subItem.path;
                const isValidPermission =
                  subItem.permission.includes(userPermission) &&
                  subItem.userType.includes(userType);

                if (!isValidPermission) return null;

                if (!subMenuOpen)
                  return <div key={subItem.key} className="p-3 m-0.5"></div>;
                return (
                  <Link key={subItem.key} href={subItem.path}>
                    <span
                      data-tooltip-id={`tooltip-${subItem.key}`}
                      data-tooltip-content={t(subItem.titleKey)}
                      data-tooltip-place="right"
                      data-tooltip-delay-show={500}
                      className={` text-sm font-small text-gray-700 flex hover:text-okron-main rounded-md mb-2 items-center ${
                        isSubItemActive ? 'bg-[#F2F2F2] text-okron-main' : ''
                      }`}
                      onClick={() => {
                        setIsLoading(prevLoading => ({
                          ...prevLoading,
                          [subItem.key]: true,
                        }));
                      }}
                    >
                      {subItem.icon && (
                        <subItem.icon
                          className={`${
                            menuOpen
                              ? 'min-w-[16px] min-h-[16px] mr-2'
                              : 'min-w-[14px] min-h-[14px]'
                          } ${
                            isSubItemActive ? 'text-okron-main' : ''
                          } hover:text-okron-main`}
                        />
                      )}

                      {menuOpen && t(subItem.titleKey)}
                      {isLoading[subItem.key] && (
                        <SvgSpinner
                          style={{ marginLeft: '0.5rem' }}
                          className="w-5 h-5 text-okron-main"
                        />
                      )}
                    </span>
                    <Tooltip id={`tooltip-${subItem.key}`} />
                  </Link>
                );
              })}
            </div>
          )}
        </>
      ) : (
        <Link href={item.path}>
          <span
            data-tooltip-id={`tooltip-${item.key}`}
            data-tooltip-content={t(item.titleKey)}
            data-tooltip-place="right"
            data-tooltip-delay-show={500}
            className={`font-sm text-l flex text-gray-700 gap-2 p-1 w-full hover:text-okron-main rounded-md items-center ${
              isActive ? 'bg-[#F2F2F2] text-okron-main' : ''
            }`}
            onClick={() => {
              if (isActive) {
                setSubMenuOpen(false);
                return;
              }
              setIsLoading(prevLoading => ({
                ...prevLoading,
                [item.key]: true,
              }));
            }}
          >
            {item.icon && (
              <item.icon
                className={`${
                  menuOpen
                    ? 'min-w-[16px] min-h-[16px] mr-2'
                    : 'min-w-[24px] min-h-[24px] mb-2'
                } ${isActive ? 'text-okron-main' : ''} hover:text-okron-main`}
              />
            )}
            {menuOpen && t(item.titleKey)}
            {isLoading[item.key] && (
              <SvgSpinner
                style={{ marginLeft: '0.2rem' }}
                className="w-5 h-5 text-okron-main"
              />
            )}
          </span>
          <Tooltip id={`tooltip-${item.key}`} />
        </Link>
      )}
    </div>
  );
};

export default SideNav;
