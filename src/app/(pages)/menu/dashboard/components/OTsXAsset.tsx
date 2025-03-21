import { AssetChartProps } from '../DashboardMM/DashboardMM';

export default function OTsXAsset({
  chartAssets,
}: {
  chartAssets: AssetChartProps[];
}) {
  return (
    <div>
      <p className="text-2xl mb-4 font-semibold text-left">
        Top Equips amb més Correctius
      </p>

      <ul className="grid grid-rows-3 gap-4 w-full">
        {chartAssets.map((asset, index) => (
          <li
            key={index}
            className="bg-gray-100 p-4 rounded-md shadow-md flex justify-between items-center gap-4"
          >
            <div className="flex flex-col space-y-2 w-full">
              <div className="flex justify-between items-center w-full mb-2">
                <span className="text-lg font-semibold">{asset.asset}</span>
                <div className="flex items-center gap-2">
                  <span className="text-md font-semibold mr-3">
                    {asset.number} Ordres de treball
                  </span>
                  {index === 0 && (
                    <span className="bg-red-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      1r
                    </span>
                  )}
                  {index === 1 && (
                    <span className="bg-yellow-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      2n
                    </span>
                  )}
                  {index === 2 && (
                    <span className="bg-green-500 text-white px-2 py-1 rounded-md text-xs font-semibold">
                      3r
                    </span>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 gap-2">
                <div className="px-4 py-1 font-semibold rounded-full bg-[#F2DADD] text-[#E14F62]">
                  {asset.Correctius} Correctius
                </div>

                <div className="px-4 py-1 font-semibold rounded-full bg-[#D5DFF4] text-[#4E80EE]">
                  {asset.Preventius} Preventius
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
