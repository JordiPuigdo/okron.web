import { useState } from 'react';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import {
  CreateDocumentationRequest,
  DeleteDocumentationRequest,
  ObjectToInsert,
} from 'app/interfaces/Documentation';
import SparePart from 'app/interfaces/SparePart';
import DocumentationService from 'app/services/documentationService';
import { useSessionStore } from 'app/stores/globalStore';

interface DocumentationSparePartProps {
  sparePart: SparePart;
}

export default function DocumentationSparePart({
  sparePart,
}: DocumentationSparePartProps) {
  const { t } = useTranslations();
  const documentationService = new DocumentationService(
    process.env.NEXT_PUBLIC_API_BASE_URL!
  );
  const { loginUser } = useSessionStore(state => state);

  const [loadingMap, setLoadingMap] = useState<{ [key: string]: boolean }>({});
  const toggleLoading = (key: string) => {
    setLoadingMap(prevLoadingMap => ({
      ...prevLoadingMap,
      [key]: !prevLoadingMap[key],
    }));
  };
  function handleDocumentationAdd() {
    const fileInput = document.getElementById('fileInput');
    if (fileInput) {
      fileInput.click();
    }
  }

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      toggleLoading('DOCUMENTATION');
      const request: CreateDocumentationRequest = {
        userId: '65d8cae3567750628478d06b',
        fileName: file.name,
        file: file,
        objectId: sparePart!.id,
        object: ObjectToInsert.SparePart,
      };

      documentationService
        .createDocumentation(request)
        .then(response => {
          if (response) {
            // sparePartService.cleanCache();
            toggleLoading('DOCUMENTATION');
            window.location.reload();
          }
        })
        .catch(error => {
          console.log(error);
          // setShowErrorMessage(true);
          toggleLoading('DOCUMENTATION');
        });
    }
  }

  function handleDeleteDocumentation(id: string, fileName: string) {
    toggleLoading('DELETEDOCUMENTATION');
    const request: DeleteDocumentationRequest = {
      userId: loginUser?.agentId || '',
      objectId: sparePart!.id,
      object: ObjectToInsert.SparePart,
      fileId: id,
      fileName: fileName,
    };

    documentationService.deleteDocumentation(request).then(response => {
      if (response) {
        console.log(response);
        // sparePartService.cleanCache();
        toggleLoading('DOCUMENTATION');
        window.location.reload();
      }
    });
  }

  return (
    <div className="flex flex-col w-full p-2 border border-gray-200 rounded-lg bg-white shadow-sm">
      <h2 className="font-semibold mb-2">{t('documentation')}</h2>

      <div className="flex flex-col flex-grow gap-2">
        {sparePart?.documentation?.map(document => (
          <div
            key={document.id}
            className="flex items-center justify-between p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <a
              href={document.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
            >
              {document.fileName}
            </a>

            <button
              type="button"
              onClick={() =>
                handleDeleteDocumentation(document.id!, document.fileName!)
              }
              className="flex items-center bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              disabled={loadingMap['DELETEDOCUMENTATION']}
            >
              {t('delete')}
              {loadingMap['DELETEDOCUMENTATION'] && (
                <SvgSpinner className="w-5 h-5 ml-2" />
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <input
          type="file"
          id="fileInput"
          accept=".pdf"
          className="hidden"
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={handleDocumentationAdd}
          className="flex items-center bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          disabled={loadingMap['DOCUMENTATION']}
        >
          {t('add.documentation')}
          {loadingMap['DOCUMENTATION'] && (
            <SvgSpinner className="w-5 h-5 ml-2" />
          )}
        </button>
      </div>
    </div>
  );
}
