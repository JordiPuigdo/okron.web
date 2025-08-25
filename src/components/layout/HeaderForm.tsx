'use client';
import { SvgPrint } from 'app/icons/designSystem/SvgPrint';
import { SvgMachines } from 'app/icons/icons';
import { getRoute } from 'app/utils/utils';
import { EntityTable } from 'components/table/interface/tableEntitys';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

interface HeaderFormProps {
  header: string;
  isCreate: boolean;
  subtitle?: string;
  canPrint?: string | undefined;
  entity?: EntityTable;
}

export const HeaderForm = ({
  header,
  isCreate,
  subtitle,
  canPrint = undefined,
  entity,
}: HeaderFormProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const query = new URLSearchParams();
  const id = searchParams.get('id') ?? '';

  function handleOnClick() {
    if (entity) {
      let finalRoute = getRoute(entity, true);

      searchParams.forEach((value, key) => {
        if (key !== 'id' && value) {
          query.set(key, value);
        }
      });

      finalRoute += `${query.toString() ? '?' + query.toString() : ''}`;

      if (id.length > 0) {
        finalRoute += `${query.toString().length > 0 ? '&' : '?'}id=${id}`;
      }

      const finalUrl = finalRoute;

      router.push(finalUrl);
    } else {
      router.back();
    }
  }

  if (isCreate)
    return (
      <div className="flex p-2 my-2">
        <div className="w-full flex flex-col gap-2 items">
          <h2 className="text-2xl font-bold text-black flex gap-2">
            <SvgMachines />
            {header}
          </h2>
        </div>
      </div>
    );
  else
    return (
      <div className="bg-white p-6 rounded-md shadow-md my-4">
        <div className="flex sm:px-12 items-center flex-col sm:flex-row">
          <div
            className="cursor-pointer mb-4 sm:mb-0"
            onClick={() => handleOnClick()}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              className="w-6 h-6 inline-block mr-2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
          </div>
          <div className="flex flex-col gap-2 justify-between w-full items-center">
            <h2 className="text-2xl font-bold text-black mx-auto">{header}</h2>
            <p>{subtitle}</p>
          </div>
          {canPrint && (
            <div>
              <Link
                href={`/print/${canPrint}`}
                passHref
                target="_blank"
                className=""
              >
                <SvgPrint className="text-black hover:text-blue-900" />
              </Link>
            </div>
          )}
        </div>
      </div>
    );
};
