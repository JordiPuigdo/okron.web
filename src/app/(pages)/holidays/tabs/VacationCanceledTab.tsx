import { useVacations } from 'app/hooks/useVacations';
import { useSessionStore } from 'app/stores/globalStore';

export function VacationApprovalsTab() {
  const { loginUser } = useSessionStore();
  const { fetchVacationRequests } = useVacations();

  return <></>;
}
