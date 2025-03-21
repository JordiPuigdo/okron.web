import { Column } from "../interface/interfaceTable";
import { EntityTable } from "../interface/tableEntitys";
import { TableRowComponent } from "./TableRow";
import { TableTotalRowComponent } from "./TableTotalRowComponent";

interface TableBodyProps {
  filteredData: any[];
  itemsPerPage: number;
  handleSelectedRow: (id: string) => void;
  enableCheckbox: boolean;
  selectedRows: Set<string>;
  columns: Column[];
  entity: EntityTable;
  isReport: boolean;
  tableButtons: any;
  loginUser: any;
  pathDetail: string;
  onDelete?: (id: string) => void;
  totalCounts: boolean;
  totalQuantity: number;
}

export const TableBodyComponent: React.FC<TableBodyProps> = ({
  filteredData,
  itemsPerPage,
  handleSelectedRow,
  enableCheckbox,
  selectedRows,
  columns,
  entity,
  isReport,
  tableButtons,
  loginUser,
  pathDetail,
  onDelete,
  totalCounts,
  totalQuantity,
}) => (
  <tbody className="border-b">
    {filteredData.slice(0, itemsPerPage).map((rowData, rowIndex) => (
      <TableRowComponent
        rowIndex={rowIndex}
        rowData={rowData}
        columns={columns}
        handleSelectedRow={handleSelectedRow}
        enableCheckbox={enableCheckbox}
        selectedRows={selectedRows}
        entity={entity}
        isReport={isReport}
        tableButtons={tableButtons}
        loginUser={loginUser}
        pathDetail={pathDetail}
        onDelete={onDelete}
      />
    ))}
    <TableTotalRowComponent
      totalCounts={totalCounts}
      totalQuantity={totalQuantity}
      columnsLength={columns.length}
    />
  </tbody>
);
