import { OperatorType } from 'app/interfaces/Operator';
import {
  DowntimesReasonsType,
  OriginDowntime,
} from 'app/interfaces/Production/Downtimes';
import {
  StateWorkOrder,
  WorkOrderCommentType,
  WorkOrderEventType,
  WorkOrderType,
} from 'app/interfaces/workOrder';
import { useSessionStore } from 'app/stores/globalStore';
import { EntityTable } from 'components/table/interface/tableEntitys';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

import { InvoiceItemType, InvoiceStatus } from '../interfaces/Invoice';
import useRoutes from './useRoutes';

dayjs.extend(customParseFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

export const translateStateWorkOrder = (
  state: any,
  t: (key: string) => string
): string => {
  switch (state) {
    case StateWorkOrder.Waiting:
      return t('workorder.state.waiting');
    case StateWorkOrder.OnGoing:
      return t('workorder.state.ongoing');
    case StateWorkOrder.Paused:
      return t('workorder.state.paused');
    case StateWorkOrder.Finished:
      return t('workorder.state.finished');
    case StateWorkOrder.PendingToValidate:
      return t('workorder.state.pending.validate');
    case StateWorkOrder.Requested:
      return t('workorder.state.requested');
    case StateWorkOrder.Open:
      return t('workorder.state.open');
    case StateWorkOrder.Closed:
      return t('workorder.state.closed');
    case StateWorkOrder.NotFinished:
      return t('workorder.state.not.finished');
    case StateWorkOrder.Invoiced:
      return t('workorder.state.invoiced');
    default:
      return '';
  }
};

export const translateWorkOrderCommentType = (
  commentType: WorkOrderCommentType,
  t: (key: string) => string
): string => {
  switch (commentType) {
    case WorkOrderCommentType.Internal:
      return t('workorder.comment.internal');
    case WorkOrderCommentType.External:
      return t('workorder.comment.external');
    case WorkOrderCommentType.NoFinished:
      return t('workorder.comment.no.finished');
    default:
      return '';
  }
};

export const translateWorkOrderEventType = (
  eventType: WorkOrderEventType,
  t: (key: string) => string
): string => {
  switch (eventType) {
    case WorkOrderEventType.Waiting:
      return t('workorder.event.waiting');
    case WorkOrderEventType.Started:
      return t('workorder.event.started');
    case WorkOrderEventType.Paused:
      return t('workorder.event.paused');
    case WorkOrderEventType.PendingToValidate:
      return t('workorder.event.pending.validate');
    case WorkOrderEventType.Finished:
      return t('workorder.event.finished');
    case WorkOrderEventType.Created:
      return t('workorder.event.created');
    case WorkOrderEventType.NotFinished:
      return t('workorder.event.not.finished');
    case WorkOrderEventType.Open:
      return t('workorder.event.open');
    default:
      return '';
  }
};

export const translateInvoiceStatus = (
  status: InvoiceStatus,
  t: (key: string) => string
): string => {
  switch (status) {
    case InvoiceStatus.Invoiced:
      return t('invoice.status.draft');
    case InvoiceStatus.Pending:
      return t('invoice.status.paid');
    default:
      return t('invoice.status.unknown');
  }
};

export const translateInvoiceItemType = (type: InvoiceItemType): string => {
  switch (type) {
    case InvoiceItemType.Labor:
      return "Mà d'Obra";
    case InvoiceItemType.SparePart:
      return 'Recanvi';
    case InvoiceItemType.Other:
      return 'Altres';
    default:
      return 'Desconegut';
  }
};

export const getInvoiceStatusColor = (status: InvoiceStatus): string => {
  switch (status) {
    case InvoiceStatus.Pending:
      return 'bg-gray-100 text-gray-800';
    case InvoiceStatus.Invoiced:
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const formatDate = (
  dateString: any,
  includeHours: boolean = true,
  includeSeconds: boolean = true
) => {
  if (!dateString) {
    return '';
  }
  if (dateString.length > 0 && dateString.includes('0001')) {
    return '';
  }

  const newDate = new Date(dateString);
  const date = dayjs(newDate);

  if (!date.isValid()) {
    return '';
  }

  let formatString = 'DD/MM/YYYY';

  if (includeHours) {
    formatString += ' HH:mm';
    if (includeSeconds) {
      formatString += ':ss';
    }
  }

  return date.format(formatString);
};

export function calculateTimeDifference(
  datefrom: string,
  dateto: string
): string {
  const date1 = new Date(datefrom);
  const date2 = new Date(dateto);
  const differenceInMilliseconds = Math.abs(date1.getTime() - date2.getTime());
  const hours = Math.floor(differenceInMilliseconds / (1000 * 60 * 60));
  const minutes = Math.floor(
    (differenceInMilliseconds % (1000 * 60 * 60)) / (1000 * 60)
  );
  const seconds = Math.floor((differenceInMilliseconds % (1000 * 60)) / 1000);

  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function validateFormattedDateTime(dateString: string): boolean {
  const format = 'DD/MM/YYYY HH:mm:ss';
  return dayjs(dateString, format).format(format) === dateString;
}

export function formatTimeSpan(timeSpan: string): string {
  // Check for the min TimeSpan value
  const MIN_TIME_SPAN = '-10675199.02:48:05.4775808';

  if (timeSpan === MIN_TIME_SPAN) {
    return ''; // Return empty string for the min value
  }

  // TimeSpan format example: "-10675199.02:48:05.4775808" or "02:30:00"
  const regex = /([-+]?)(?:(\d+)\.)?(\d+):(\d+):(\d+)/;
  const match = timeSpan.match(regex);

  if (!match) {
    return timeSpan; // Return as is if it doesn't match expected format
  }

  const sign = match[1];
  const days = match[2] || '0';
  const hours = match[3];
  const minutes = match[4];
  const seconds = match[5];

  // Convert negative sign, if necessary
  const totalHours = parseInt(hours) + parseInt(days) * 24;
  const formattedHours = totalHours.toString().padStart(2, '0');
  const formattedMinutes = minutes.padStart(2, '0');
  const formattedSeconds = seconds.padStart(2, '0');

  return `${sign}${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
}

export const translateWorkOrderType = (
  workOrderType: WorkOrderType,
  t: (key: string) => string
): string => {
  const type = Number(workOrderType) as WorkOrderType;

  switch (type) {
    case WorkOrderType.Preventive:
      return t('workorder.type.preventive');
    case WorkOrderType.Corrective:
      return t('workorder.type.corrective');
    case WorkOrderType.Ticket:
      return t('workorder.type.ticket');
    case WorkOrderType.Predicitve:
      return '';
    default:
      return 'Incorrecte';
  }
};

export const validateEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const validDomains = [
    'gmail.com',
    'hotmail.com',
    'hotmail.es',
    'hotmail.fr',
    'hotmail.it',
    'yahoo.es',
    'yahoo.com',
    'icloud.com',
    'holaglow.com',
    'outlook.com',
    'outlook.es',
    'live.com',
    'me.com',
    'msn.com',
    'telefonica.net',
  ];

  const isValidFormat = emailRegex.test(email);

  if (!isValidFormat) {
    return false;
  }

  const [, domain] = email.split('@');
  const isDomainValid = validDomains.includes(domain);

  return isDomainValid;
};

export const isOperatorLogged = () => {
  const { operatorLogged } = useSessionStore(state => state);

  return operatorLogged == undefined ? false : true;
};

export function checkOperatorCreated() {
  if (!isOperatorLogged) {
    alert('Operari no assignat');
    return false;
  } else {
    return true;
  }
}

export function startOrEndDate(date: Date, start: boolean): Date {
  const modifiedDate = new Date(date); // Make a copy of the original date

  // Conditionally set hours, minutes, seconds, and milliseconds
  if (start) {
    modifiedDate.setHours(0, 0, 0, 0); // Start of the day
  } else {
    modifiedDate.setUTCHours(23, 59, 59, 999); // End of the day in UTC
  }

  return modifiedDate; // Return the modified date
}

export function formatDateQuery(date: Date, startDate: boolean) {
  const formated = new Date(date);
  if (startDate) {
    formated.setHours(0, 0, 0, 0);
  } else {
    formated.setHours(23, 59, 59, 999);
  }

  return new Date(
    formated.getTime() - formated.getTimezoneOffset() * 60000
  ).toISOString();
}

export const translateOperatorType = (
  operatorType: any,
  t: (key: string) => string
): string => {
  switch (operatorType) {
    case OperatorType.Maintenance:
      return t('operator.type.maintenance');
    case OperatorType.Production:
      return t('operator.type.production');
    case OperatorType.Quality:
      return t('operator.type.quality');
    case OperatorType.Repairs:
      return t('operator.type.repairs');
    case OperatorType.Assembly:
      return t('operator.type.assembly');
    default:
      return '';
  }
};

export const translateDowntimeReasonType = (
  type: DowntimesReasonsType,
  t: (key: string) => string
): string => {
  switch (type) {
    case DowntimesReasonsType.Maintanance:
      return t('downtime.reason.maintenance');
    case DowntimesReasonsType.Production:
      return t('downtime.reason.production');
    default:
      return '';
  }
};

export function convertUTCDateToLocalDate(date: Date) {
  const newDate = new Date(
    date.getTime() + date.getTimezoneOffset() * 60 * 1000
  );

  const offset = date.getTimezoneOffset() / 60;
  const hours = date.getHours();

  newDate.setHours(hours - offset);

  return newDate;
}

export function differenceBetweenDates(date1: Date, date2: Date) {
  const diff = Math.abs(date1.getTime() - date2.getTime());
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  const pad = (num: number) => num.toString().padStart(2, '0');
  const fullTime = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;
  return {
    days,
    hours,
    minutes,
    seconds,
    fullTime,
  };
}

export const formatTime = (time: string): string => {
  return time.length === 5 ? `${time}:00` : time; // convierte "14:30" → "14:30:00"
};

export function isValidDateTimeFormat(dateTime: string): boolean {
  // Regular expression to match "DD/MM/YYYY HH:mm:ss" format
  const dateTimeRegex =
    /^(0[1-9]|[1-2][0-9]|3[0-1])\/(0[1-9]|1[0-2])\/\d{4} (0[0-9]|1[0-9]|2[0-3]):([0-5][0-9])$/;

  if (!dateTimeRegex.test(dateTime)) {
    return false; // String does not match the format
  }

  // Extract parts of the date and time
  const [, day, month, year, hour, minute, second] =
    dateTime.match(dateTimeRegex) || [];

  // Convert to numbers for validation
  const dayNum = parseInt(day, 10);
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  const hourNum = parseInt(hour, 10);
  const minuteNum = parseInt(minute, 10);
  const secondNum = parseInt(second, 10);

  // Validate ranges
  if (
    monthNum < 1 ||
    monthNum > 12 ||
    dayNum < 1 ||
    dayNum > 31 || // Note: further checks for month and leap year needed
    hourNum < 0 ||
    hourNum > 23 ||
    minuteNum < 0 ||
    minuteNum > 59 ||
    secondNum < 0 ||
    secondNum > 59
  ) {
    return false;
  }

  // Check for valid days in the month
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
  if (dayNum > daysInMonth) {
    return false;
  }

  return true; // String is a valid "DD/MM/YYYY HH:mm:ss" format
}

export function translateOriginDowntime(originDowntime: OriginDowntime) {
  switch (originDowntime) {
    case 0:
      return 'Manteniment';
    case 1:
      return 'Producció';
    default:
      return originDowntime;
  }
}

export const fetcher = async (url: string) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Error fetching data');
  }
  return response.json();
};

export const getRoute = (entity: EntityTable, isForHeader = false) => {
  const ROUTES = useRoutes();
  switch (entity) {
    case EntityTable.WORKORDER:
      return ROUTES.workOrders;
      break;
    case EntityTable.INVOICE:
      return ROUTES.invoices.list;
      break;
    case EntityTable.PREVENTIVE:
      return ROUTES.preventive.configuration;
      break;
    case EntityTable.INSPECTIONPOINTS:
      return ROUTES.preventive.inspectionPoints;
      break;
    case EntityTable.SPAREPART:
      return ROUTES.spareParts;
      break;
    case EntityTable.OPERATOR:
      return ROUTES.configuration.operators;
      break;
    case EntityTable.MACHINE:
      return ROUTES.configuration.machines;
      break;
    case EntityTable.WAREHOUSE:
      return ROUTES.configuration.warehouse;
      break;
    case EntityTable.PROVIDER:
      return ROUTES.configuration.provider;
      break;
    case EntityTable.ORDER:
      return isForHeader ? ROUTES.orders.purchase : ROUTES.orders.order;
      break;
    case EntityTable.Account:
      return ROUTES.accounts;
      break;
    case EntityTable.ASSET:
      return ROUTES.configuration.assets;
      break;
    case EntityTable.CUSTOMER:
      return ROUTES.customer;
    case EntityTable.DELIVERYNOTE:
      return ROUTES.deliveryNote.list;
    case EntityTable.HOLIDAY:
      return ROUTES.holidays;
    case EntityTable.VACATIONAPPROVAL:
      return ROUTES.vacationApprovals;
    case EntityTable.BUDGET:
      return '/budgets';
    default:
      return 'error';
  }
};

export const formatEuropeanCurrency = (
  value: number | string | undefined | null,
  t: (key: string) => string
): string => {
  if (value === undefined || value === null) return t('common.not.available');

  // Convert to number
  const numericValue =
    typeof value === 'string'
      ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
      : value;

  if (isNaN(numericValue)) return t('common.not.available');

  // Separate integer and decimal parts
  const parts = numericValue.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add thousands separator to integer part
  const integerWithThousands = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.'
  );

  // Build final string with European format
  return `${integerWithThousands},${decimalPart}€`;
};

export const formatCurrencyServerSider = (
  value: number | string | undefined | null
): string => {
  if (value === undefined || value === null) return '--';

  // Convert to number
  const numericValue =
    typeof value === 'string'
      ? parseFloat(value.replace(/\./g, '').replace(',', '.'))
      : value;

  if (isNaN(numericValue)) return '--';

  // Separate integer and decimal parts
  const parts = numericValue.toFixed(2).split('.');
  const integerPart = parts[0];
  const decimalPart = parts[1];

  // Add thousands separator to integer part
  const integerWithThousands = integerPart.replace(
    /\B(?=(\d{3})+(?!\d))/g,
    '.'
  );

  // Build final string with European format
  return `${integerWithThousands},${decimalPart}€`;
};
