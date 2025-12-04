import { useState } from 'react';

import {
  ApprovalRequestDto,
  CreateVacationRequestDto,
  RejectionRequestDto,
  VacationBalance,
  VacationRequest,
} from '../interfaces/Vacation';
import { VacationService } from '../services/vacationService';

export const useVacations = (operatorId?: string) => {
  const [vacationRequests, setVacationRequests] = useState<VacationRequest[]>(
    []
  );
  const [vacationBalance, setVacationBalance] =
    useState<VacationBalance | null>(null);
  const [pendingRequests, setPendingRequests] = useState<VacationRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const vacationService = new VacationService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );

  const fetchVacationBalance = async (opId: string, year?: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const balance = await vacationService.getVacationBalance(opId, year);
      setVacationBalance(balance);
      return balance;
    } catch (err) {
      setError('Error fetching vacation balance');
      console.error('Error fetching vacation balance:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchVacationRequests = async (opId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const requests = await vacationService.getVacationRequests(opId);
      setVacationRequests(requests);
      return requests;
    } catch (err) {
      setError('Error fetching vacation requests');
      console.error('Error fetching vacation requests:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPendingRequests = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const requests = await vacationService.getPendingRequests();
      setPendingRequests(requests);
      return requests;
    } catch (err) {
      setError('Error fetching pending requests');
      console.error('Error fetching pending requests:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const createVacationRequest = async (dto: CreateVacationRequestDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const validation = vacationService.validateVacationRequest(dto);
      if (!validation.isValid) {
        throw new Error(validation.errors.join(', '));
      }

      const newRequest = await vacationService.createVacationRequest(dto);
      setVacationRequests([...vacationRequests, newRequest]);

      // Refresh balance after creating request
      if (operatorId) {
        await fetchVacationBalance(operatorId);
      }

      return newRequest;
    } catch (err) {
      const error = err as Error;
      setError(error.message || 'Error creating vacation request');
      console.error('Error creating vacation request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const approveVacationRequest = async (
    id: string,
    dto: ApprovalRequestDto
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await vacationService.approveVacationRequest(id, dto);

      // Update local state
      setVacationRequests(
        vacationRequests.map(req =>
          req.id === id
            ? {
                ...req,
                status: 1,
                approvedBy: dto.userId,
                approvedDate: new Date(),
              }
            : req
        )
      );
      setPendingRequests(pendingRequests.filter(req => req.id !== id));

      return true;
    } catch (err) {
      setError('Error approving vacation request');
      console.error('Error approving vacation request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const rejectVacationRequest = async (
    id: string,
    dto: RejectionRequestDto
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await vacationService.rejectVacationRequest(id, dto);

      // Update local state
      setVacationRequests(
        vacationRequests.map(req =>
          req.id === id
            ? { ...req, status: 2, rejectionReason: dto.rejectionReason }
            : req
        )
      );
      setPendingRequests(pendingRequests.filter(req => req.id !== id));

      return true;
    } catch (err) {
      setError('Error rejecting vacation request');
      console.error('Error rejecting vacation request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const reactivateVacationRequest = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await vacationService.reactivateVacationRequest(id);

      // Update local state
      setVacationRequests(
        vacationRequests.map(req =>
          req.id === id
            ? {
                ...req,
                status: 0, // VacationStatus.Pending
                rejectionReason: undefined,
                approvedDate: undefined,
                approvedBy: undefined,
              }
            : req
        )
      );

      return true;
    } catch (err) {
      setError('Error reactivating vacation request');
      console.error('Error reactivating vacation request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const cancelVacationRequest = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await vacationService.cancelVacationRequest(id);

      // Update local state
      setVacationRequests(
        vacationRequests.map(req =>
          req.id === id ? { ...req, status: 3 } : req
        )
      );

      // Refresh balance after canceling
      if (operatorId) {
        await fetchVacationBalance(operatorId);
      }

      return true;
    } catch (err) {
      setError('Error cancelling vacation request');
      console.error('Error cancelling vacation request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteVacationRequest = async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await vacationService.deleteVacationRequest(id);
      setVacationRequests(vacationRequests.filter(req => req.id !== id));
      setPendingRequests(pendingRequests.filter(req => req.id !== id));

      return true;
    } catch (err) {
      setError('Error deleting vacation request');
      console.error('Error deleting vacation request:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const calculateVacationDays = (startDate: Date, endDate: Date): number => {
    return vacationService.calculateVacationDays(startDate, endDate);
  };

  return {
    vacationRequests,
    vacationBalance,
    pendingRequests,
    isLoading,
    error,
    fetchVacationBalance,
    fetchVacationRequests,
    fetchPendingRequests,
    createVacationRequest,
    approveVacationRequest,
    rejectVacationRequest,
    cancelVacationRequest,
    reactivateVacationRequest,
    deleteVacationRequest,
    calculateVacationDays,
  };
};
