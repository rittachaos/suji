import { request } from '../http';

export function fetchDashboardOverview(rangeDays = 30) {
  return request({ url: `/dashboard/overview?rangeDays=${rangeDays}` });
}
