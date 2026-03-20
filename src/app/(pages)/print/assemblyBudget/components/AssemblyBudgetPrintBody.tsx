import {
  AssemblyArticle,
  AssemblyFolder,
  AssemblyNode,
  BudgetNodeType,
} from 'app/interfaces/Budget';
import { formatCurrencyServerSider } from 'app/utils/utils';

export const AssemblyBudgetPrintBody = ({
  nodes,
}: {
  nodes: AssemblyNode[];
}) => {
  return (
    <div className="mt-6 space-y-4">
      <div className="border border-gray-300 rounded">
        <div className="bg-blue-50 p-3 border-b border-gray-300">
          <h3 className="font-bold text-sm">Detall del Pressupost de Montatge</h3>
        </div>

        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-300">
              <th className="p-2 text-left text-xs font-medium text-gray-600 w-1/12">
                Codi
              </th>
              <th className="p-2 text-left text-xs font-medium text-gray-600 w-5/12">
                Descripció
              </th>
              <th className="p-2 text-center text-xs font-medium text-gray-600 w-1/12">
                Quantitat
              </th>
              <th className="p-2 text-center text-xs font-medium text-gray-600 w-2/12">
                Preu Unitari
              </th>
              <th className="p-2 text-center text-xs font-medium text-gray-600 w-2/12">
                Total
              </th>
            </tr>
          </thead>
          <tbody>
            {nodes.map(node => (
              <NodeRows key={node.id} node={node} depth={0} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

function NodeRows({ node, depth }: { node: AssemblyNode; depth: number }) {
  if (node.nodeType === BudgetNodeType.Folder) {
    const folder = node as AssemblyFolder;
    return (
      <>
        <tr className="bg-gray-50 border-b border-gray-200">
          <td
            className="p-2 text-sm font-bold text-gray-800"
            style={{ paddingLeft: `${depth * 20 + 8}px` }}
          >
            {folder.code}
          </td>
          <td className="p-2 text-sm font-bold text-gray-800">
            {folder.description}
          </td>
          <td className="p-2" />
          <td className="p-2" />
          <td className="p-2 text-center text-sm font-bold text-gray-800">
            {formatCurrencyServerSider(folder.totalAmount)}
          </td>
        </tr>
        {folder.children?.map(child => (
          <NodeRows key={child.id} node={child} depth={depth + 1} />
        ))}
      </>
    );
  }

  const article = node as AssemblyArticle;
  return (
    <tr className="border-b border-gray-200 last:border-b-0">
      <td
        className="p-2 text-sm text-gray-600"
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
      >
        {article.code}
      </td>
      <td className="p-2 text-sm">{article.description}</td>
      <td className="p-2 text-center text-sm">{article.quantity}</td>
      <td className="p-2 text-center text-sm">
        {formatCurrencyServerSider(article.unitPrice)}
      </td>
      <td className="p-2 text-center text-sm font-medium">
        {formatCurrencyServerSider(article.totalAmount)}
      </td>
    </tr>
  );
}
