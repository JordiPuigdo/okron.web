'use client';
import { UserType } from 'app/interfaces/User';
import { useSessionStore } from 'app/stores/globalStore';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { DashboardMM } from './DashboardMM/DashboardMM';
import { DashboardProduction } from './DashboardProduction/DashboardProduction';

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isoWeek);

export default function DashboardPage() {
  const { loginUser } = useSessionStore(state => state);

  if (!loginUser) return <></>;
  switch (loginUser?.userType) {
    case UserType.Maintenance:
      return <DashboardMM loginUser={loginUser} />;
    case UserType.Production:
      return <DashboardProduction loginUser={loginUser} />;
    default:
      return <></>;
  }
}
