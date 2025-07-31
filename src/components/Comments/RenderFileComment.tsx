import { useState } from 'react';
import { WorkOrderComment } from 'app/interfaces/workOrder';
import Image from 'next/image';

import { DialogFileComment } from './DialogFileComment';

export const RenderFileComment = ({
  comment,
}: {
  comment: WorkOrderComment;
}) => {
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {comment.urls.map((url, index) => {
        const isImage = url.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        const isVideo = url.match(/\.(mp4|mov|avi)$/i);
        const finalUrl = url.replace(/ /g, '%20');

        if (isImage) {
          return (
            <div
              key={index}
              className="relative w-full aspect-video rounded-md overflow-hidden border hover:cursor-pointer"
              onClick={() => setZoomedImage(url)}
            >
              <Image
                src={finalUrl}
                alt={`image-${index}`}
                fill
                className="object-cover"
              />
            </div>
          );
        }

        if (isVideo) {
          return (
            <div
              key={index}
              className="w-full aspect-video border rounded-md overflow-hidden"
            >
              <video controls className="w-full h-full object-contain">
                <source
                  src={finalUrl}
                  type={`video/${finalUrl.split('.').pop()}`}
                />
              </video>
            </div>
          );
        }

        return (
          <div
            key={index}
            className="p-3 border rounded bg-gray-100 flex items-center justify-between"
          >
            <span className="truncate max-w-[70%]">
              {finalUrl.split('/').pop()}
            </span>
            <button
              onClick={() => window.open(finalUrl, '_blank')}
              className="text-blue-500 hover:underline text-sm"
            >
              Obre
            </button>
          </div>
        );
      })}

      <DialogFileComment
        zoomedImage={zoomedImage}
        handleCloseZoomedImage={() => setZoomedImage(null)}
      />
    </div>
  );
};
