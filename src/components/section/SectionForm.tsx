'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { SvgSpinner } from 'app/icons/icons';
import Section from 'app/interfaces/Section';
import SectionService from 'app/services/sectionService';
import useRoutes from 'app/utils/useRoutes';
import { useRouter } from 'next/navigation';

interface SectionFormProps {
  id?: string;
}

const SectionForm: React.FC<SectionFormProps> = ({ id }) => {
  const sectionService = new SectionService(
    process.env.NEXT_PUBLIC_API_BASE_URL || ''
  );
  const { register, handleSubmit, setValue } = useForm<Section>();
  const [loading, setLoading] = useState(false);
  const [section, SetSection] = useState<Section | undefined>(undefined);
  const [messageNotification, setMessageNotification] = useState<
    string | undefined
  >(undefined);

  const router = useRouter();
  const ROUTES = useRoutes();

  useEffect(() => {
    async function getSection() {
      await sectionService
        .getSection(id!)
        .then(sectionData => {
          SetSection(sectionData);
          setValue('id', sectionData.id);
          setValue('code', sectionData.code);
          setValue('description', sectionData.description);
        })
        .catch((error: any) => {
          console.error('error: ', error);
        });
    }

    if (id != 'id') {
      getSection();
    }
  }, [id]);

  const onSubmit = async (data: Section) => {
    setLoading(true);
    try {
      if (section) {
        await sectionService.updateSection(data);
        setMessageNotification('Secció actualitzada');
        setTimeout(() => {
          router.push(ROUTES.configuration.section);
        }, 2000);
      } else {
        await sectionService.createSection(data.code, data.description);
        setMessageNotification('Secció creada');
        setTimeout(() => {
          router.push(ROUTES.configuration.section);
        }, 2000);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  async function deleteSection() {
    try {
      setLoading(true);
      await sectionService.deleteSection(section!.id);
      setMessageNotification('Secció eliminada');
      setTimeout(() => {
        router.push(ROUTES.configuration.section);
      }, 2000);
    } catch (error) {
      console.error('Error:', error);
    }
  }

  return (
    <div className="flex justify-center items-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
      >
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Codi:
          <input
            type="text"
            {...register('code')}
            defaultValue={section?.code || ''}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </label>
        <label className="block text-gray-700 text-sm font-bold mb-2">
          Descripció:
          <input
            type="text"
            defaultValue={section?.description || ''}
            {...register('description')}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          />
        </label>
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white flex items-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          >
            {section ? 'Actualitzar' : 'Crear'}
            {loading && <SvgSpinner />}
          </button>
          {section && (
            <button
              type="button"
              disabled={loading}
              className="bg-red-500 hover:bg-red-700 text-white flex items-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              onClick={deleteSection}
            >
              Eliminar
              {loading && <SvgSpinner />}
            </button>
          )}
          <button
            type="button"
            disabled={loading}
            className="bg-gray-500 hover:bg-gray-700 text-white flex items-center font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            onClick={() => {
              router.push(ROUTES.configuration.section);
            }}
          >
            Cancelar
            {loading && <SvgSpinner />}
          </button>
          {messageNotification != undefined && (
            <span className="text-green-400">{messageNotification}</span>
          )}
        </div>
      </form>
    </div>
  );
};

export default SectionForm;
