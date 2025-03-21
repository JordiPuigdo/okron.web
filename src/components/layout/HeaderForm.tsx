'use client';
import { SvgMachines } from 'app/icons/icons';
import { useRouter } from 'next/navigation';

interface HeaderFormProps {
  header: string;
  isCreate: boolean;
}

export const HeaderForm = ({ header, isCreate }: HeaderFormProps) => {
  const router = useRouter();
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
            onClick={() => router.back()}
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

          <h2 className="text-2xl font-bold text-black mx-auto">{header}</h2>
        </div>
      </div>
    );
};
