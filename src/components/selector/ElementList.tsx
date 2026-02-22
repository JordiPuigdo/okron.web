export type ElementList = {
  id: string;
  code?: string;
  description: string;
  image?: string;
  [key: string]: string | undefined;
};

type ElemntListProps = {
  elements: ElementList[];
  selectedElementIndex: number;
  handleElementClick: (element: ElementList) => void;
};

const ElementListComponent: React.FC<ElemntListProps> = ({
  elements,
  selectedElementIndex,
  handleElementClick,
}) => {
  return (
    <div className="mt-2 bg-white border border-gray-200 rounded-md shadow-sm max-h-96 overflow-y-auto">
      {elements.map((element, index) => (
        <div
          key={element.id}
          id={`element-${index}`}
          className={`py-2 px-4 flex items-center justify-between gap-8 text-gray-900 ${
            selectedElementIndex === index
              ? 'bg-gray-200'
              : 'bg-white hover:bg-gray-100 cursor-pointer'
          }`}
          onClick={() => handleElementClick(element)}
        >
          <div className="flex flex-col">
            <p className="font-medium text-gray-900">{element.description}</p>
            {element.code && (
              <p className="text-xs text-gray-500">{element.code}</p>
            )}
          </div>
          <img src={element.image} alt="" className=" w-8" />
        </div>
      ))}
    </div>
  );
};

export default ElementListComponent;
