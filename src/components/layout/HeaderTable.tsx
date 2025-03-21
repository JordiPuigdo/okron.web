'use client';

import { useState } from 'react';
import { SvgCreate, SvgMachines, SvgSpinner } from 'app/icons/icons';
import { Button } from 'designSystem/Button/Buttons';

export interface HeaderTableProps {
  title: string;
  subtitle: string;
  createButton: string;
  urlCreateButton: string;
}

export const HeaderTable = ({
  title,
  subtitle,
  createButton,
  urlCreateButton,
}: HeaderTableProps) => {
  const [isLoading, setIsLoading] = useState(false);
  return (
    <div className="flex p-2 my-2">
      <div className="w-full flex flex-col gap-2  justify-between">
        <h2 className="text-2xl font-bold text-black flex gap-2 flex-grow">
          <SvgMachines />
          {title}
        </h2>
        <span className="text-l self-start"> {subtitle}</span>
      </div>
      <div className="w-full flex flex-col justify-end items-end gap-2 ">
        <Button
          type="create"
          onClick={() => setIsLoading(true)}
          customStyles="gap-2 flex"
          href={urlCreateButton}
        >
          <SvgCreate />
          {createButton}
          {isLoading && <SvgSpinner className="w-6 h-6" />}
        </Button>
      </div>
    </div>
  );
};
