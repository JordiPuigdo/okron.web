import {
  ResultInspectionPoint,
  SaveInspectionResultPointRequest,
  WorkOrderInspectionPoint,
} from 'app/interfaces/workOrder';
import { workOrderService } from 'app/services/workOrderService';

export async function checkAllInspectionPoints(
  workOrderInspectionPoints: WorkOrderInspectionPoint[],
  workOrderId: string
): Promise<WorkOrderInspectionPoint[]> {
  const updatedPoints: WorkOrderInspectionPoint[] = [];

  for (const inspectionPoint of workOrderInspectionPoints) {
    const saveInspectionPointResult: SaveInspectionResultPointRequest = {
      WorkOrderId: workOrderId,
      WorkOrderInspectionPointId: inspectionPoint.id,
      resultInspectionPoint: ResultInspectionPoint.Ok,
    };

    try {
      const response = await workOrderService.saveInspectionPointResult(
        saveInspectionPointResult
      );

      const updatedPoint: WorkOrderInspectionPoint = {
        ...inspectionPoint,
        check: true,
      };
      updatedPoints.push(updatedPoint);
    } catch (error) {
      console.log(`Error saving inspection point: ${error}`);
    }
  }

  return updatedPoints;
}
