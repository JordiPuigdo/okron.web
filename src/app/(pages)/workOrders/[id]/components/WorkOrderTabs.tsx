import { useTranslations } from "app/hooks/useTranslations";
import { UserPermission } from "app/interfaces/User";

interface TabWO {
  key: string;
  permission: UserPermission;
}
enum Tab {
  OPERATORTIMES = "OPERATORTIMES",
  COMMENTS = "COMMENTS",
  SPAREPARTS = "SPAREPARTS",
  INSPECTIONPOINTS = "INSPECTIONPOINTS",
  EVENTSWORKORDER = "EVENTSWORKORDER",
}

interface TabProps {
  availableTabs: TabWO[];
  activeTab: Tab;
  handleTabClick: (tab: Tab) => void;
  userPermission: UserPermission;
}
const TabsComponent: React.FC<TabProps> = ({
  availableTabs,
  activeTab,
  handleTabClick,
  userPermission,
}) => {
  const { t } = useTranslations();
  
  const getTabLabel = (tabKey: string): string => {
    switch (tabKey) {
      case 'OPERATORTIMES':
        return t('workorder.tabs.operator.times');
      case 'COMMENTS':
        return t('workorder.tabs.comments');
      case 'SPAREPARTS':
        return t('workorder.tabs.spare.parts');
      case 'INSPECTIONPOINTS':
        return t('workorder.tabs.inspection.points');
      case 'EVENTSWORKORDER':
        return t('workorder.tabs.events');
      default:
        return tabKey;
    }
  };
  
  // Filter available tabs based on user's permission
  const filteredTabs = availableTabs.filter(
    (tab) => tab.permission <= userPermission
  );

  return (
    <div className="p-4 flex gap-1 border-black border-b-2">
      {filteredTabs.map((tab) => (
        <p
          key={tab.key}
          className={`p-2 border-blue-500 border-2 rounded-xl hover:cursor-pointer ${
            activeTab === tab.key ? "border-t-4" : ""
          }`}
          onClick={() => handleTabClick(tab.key as Tab)}
        >
          {getTabLabel(tab.key)}
        </p>
      ))}
    </div>
  );
};

export default TabsComponent;
