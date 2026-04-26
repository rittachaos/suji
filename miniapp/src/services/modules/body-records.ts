import { ApiListResult, BodyRecordPayload } from '@/types/api';
import { request } from '../http';

export function fetchBodyRecords(page = 1, pageSize = 20) {
  return request<never, ApiListResult<BodyRecordPayload>>({
    url: `/body-records?page=${page}&pageSize=${pageSize}`,
  });
}

export function createBodyRecord(payload: BodyRecordPayload) {
  return request<BodyRecordPayload, BodyRecordPayload>({
    url: '/body-records',
    method: 'POST',
    data: payload,
  });
}
