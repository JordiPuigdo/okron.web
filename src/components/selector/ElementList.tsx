export type ElementList = {
  id: string;
  description: string;
  image?: string;
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
    <div className="bg-white max-h-96 overflow-y-scroll">
      {elements.map((element, index) => (
        <div
          key={element.id}
          id={`element-${index}`}
          className={`py-2 px-4 flex items-center justify-between gap-8 bg-zinc-100 hover:bg-gray-200 cursor-pointer ${
            selectedElementIndex === index ? "bg-gray-200 " : ""
          }`}
          onClick={() => handleElementClick(element)}
        >
          <p className="font-medium">{element.description}</p>
          <img src={element.image} alt="" className=" w-8" />
        </div>
      ))}
    </div>
  );
};

export default ElementListComponent;
