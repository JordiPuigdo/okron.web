interface Props {
  customerSign: string;
  workerSign: string;
}

export const Signatures: React.FC<Props> = ({ customerSign, workerSign }) => {
  return (
    <div className="flex justify-center items-center w-full">
      <div className="flex flex-col items-center w-full border border-gray-300 rounded-md shadow pt-2 ">
        <span className="font-medium text-gray-700 mb-2 ">Firma Client</span>
        <img src={customerSign} alt="Firma cliente" className="max-h-24" />
      </div>

      <div className="flex flex-col items-center w-full border border-gray-300 rounded-md shadow pt-2 ">
        <span className="font-medium text-gray-700 mb-2">Firma Tècnic</span>
        <img src={workerSign} alt="Firma técnico" className="max-h-24 " />
      </div>
    </div>
  );
};
