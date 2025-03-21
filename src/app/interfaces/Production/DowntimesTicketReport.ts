import { Downtimes } from './Downtimes';

export interface DowntimesTicketReport {
  assetCode: string;
  assetDescription: string;
  downtimesTicketReportList: DowntimesTicketReportList[];
  assetChild: DowntimesTicketReport[];
}

export interface DowntimesTicketReportList {
  workOrderCode: string;
  workOrderDescription: string;
  workOrderId: string;
  downtimeReason: string;
  downtimesWorkOrder: DowntimesTicketReportModel[];
}

export interface DowntimesTicketRequest {
  from: string;
  to: string;
}

export interface DowntimesTicketReportModel extends Downtimes {
  percentage: number;
}
