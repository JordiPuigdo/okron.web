import GeneratePreventive from 'app/(pages)/preventive/components/GeneratePreventive';
import FinalizeWorkOrdersDaysBefore from 'app/(pages)/workOrders/components/FinalizeWorkOrdersDaysBefore';
import { SvgAccount, SvgLogOut, SvgMenu } from 'app/icons/icons';
import { UserPermission, UserType } from 'app/interfaces/User';
import { useSessionStore } from 'app/stores/globalStore';
import useRoutes from 'app/utils/useRoutes';
import LanguageSelector from 'components/LanguageSelector';
import SignOperator from 'components/operator/SignOperator';
import QuickActions from 'components/QuickActions';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import FaviconUpdater from './FavIcontUpdater';

export const metadata = {
  title: 'Okron',
  description: 'Gestió',
};

const Header: React.FC = () => {
  const {
    loginUser,
    operatorLogged,
    setLoginUser,
    setOperatorLogged,
    setIsMenuOpen,
    isMenuOpen,
    config,
  } = useSessionStore(state => state);

  const router = useRouter();
  const ROUTES = useRoutes();
  const pathname = usePathname();

  const handleMenuClick = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  function logOut() {
    setLoginUser(undefined);
    setOperatorLogged(undefined);
    router.push(ROUTES.home);
  }

  return (
    <header className="flex items-center justify-between bg-white text-lg font-semibold text-white p-4 w-full sticky transition-all shadow-md">
      <FaviconUpdater />

      <div className="flex items-center gap-3 pl-1">
        <button onClick={handleMenuClick}>
          <SvgMenu width={30} height={30} className="text-okron-main" />
        </button>
        <div className="ml-2 flex">
          <Link href="/menu">
            <img
              src={config?.company.urlLogo}
              alt="Components Mecànics Logo"
              className={config?.company.cssLogo}
            />
          </Link>
        </div>

        <div className="flex items-center">
          <SignOperator />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-black">
          {operatorLogged &&
            operatorLogged?.codeOperatorLogged +
              ' - ' +
              operatorLogged?.nameOperatorLogged}
        </div>
        <div>
          {loginUser?.permission == UserPermission.Administrator &&
            pathname === '/menu' &&
            loginUser?.userType == UserType.Maintenance && (
              <div className="flex flex-row gap-2 bg-white rounded-xl">
                <FinalizeWorkOrdersDaysBefore />
                <GeneratePreventive />
              </div>
            )}
        </div>
        <div className="flex">
          <QuickActions />
        </div>

        <div className="flex items-center justify-end pr-2 text-gray-700 gap-1">
          <SvgAccount />
          {loginUser?.username &&
            loginUser?.username.charAt(0)?.toUpperCase() +
              loginUser?.username?.slice(1)}
          <div className="flex">
            <LanguageSelector />
          </div>
          <button
            type="button"
            className="hover:text-purple-900"
            onClick={logOut}
          >
            <SvgLogOut />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
