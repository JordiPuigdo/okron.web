import { SparePartsConsumedsReport } from "app/interfaces/SparePart";
import { BarChartComponent } from "designSystem/BarChart/BarChartComponent";

interface sparePartBarchart {
  sparePartsConsumeds: SparePartsConsumedsReport[];
}

const SparePartBarchart: React.FC<sparePartBarchart> = ({
  sparePartsConsumeds,
}) => {
  const sparePartConsumes = new Map<string, number>();
  sparePartsConsumeds.forEach((sparePart) => {
    if (sparePartConsumes.has(sparePart.sparePartCode)) {
      sparePartConsumes.set(
        sparePart.sparePartCode,
        sparePartConsumes!.get(sparePart.sparePartCode)! +
          sparePart.sparePartNumber
      );
    } else {
      sparePartConsumes.set(sparePart.sparePartCode, sparePart.sparePartNumber);
    }
  });

  const chartData = Array.from(sparePartConsumes.entries())
    .map(([sparePartCode, sparePartNumber]) => ({
      sparePartCode,
      sparePartNumber,
    }))
    .sort((a, b) => b.sparePartNumber - a.sparePartNumber)
    .slice(0, 10);
  return (
    <BarChartComponent
      category={["sparePartNumber"]}
      chartData={chartData}
      index="sparePartCode"
      title=""
      showLegend={false}
      yAxisWidth={100}
    />
  );
};

export default SparePartBarchart;
