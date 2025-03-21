import { UserPermission } from "app/interfaces/User";

interface TabWO {
  key: string;
  permission: UserPermission;
}
enum Tab {
  OPERATORTIMES = "Temps Operaris",
  COMMENTS = "Comentaris",
  SPAREPARTS = "Recanvis",
  INSPECTIONPOINTS = "Punts d'Inspecció",
  EVENTSWORKORDER = "Events",
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
          {Tab[tab.key as keyof typeof Tab]}{" "}
          {/* Display tab label based on enum */}
        </p>
      ))}
    </div>
  );
};

export default TabsComponent;
