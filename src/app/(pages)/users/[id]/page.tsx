import Container from "components/layout/Container";
import MainLayout from "components/layout/MainLayout";

export default function EditUser({ params }: { params: { id: string } }) {
  return (
    <MainLayout>
      <Container>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-center gap-4">
            <span className="font-semibold text-l flex text-white p-1 hover:bg-purple-900 rounded-md items-center">
              Usuari
            </span>
            <input
              type="text"
              className="p-3 border border-gray-300 rounded-md w-full"
              value={params.id}
            />
          </div>
          <div className="flex flex-row gap-4">
            <button
              type="button"
              className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 flex items-center"
            >
              Editar
            </button>
            <button
              type="button"
              className="bg-red-500 text-white p-2 rounded-md hover:bg-red-600 flex items-center"
            >
              Eliminar
            </button>
          </div>
        </div>
      </Container>
    </MainLayout>
  );
}
