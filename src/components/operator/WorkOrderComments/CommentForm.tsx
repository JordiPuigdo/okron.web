import React, { useEffect, useRef, useState } from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSpinner } from 'app/icons/icons';
import { WorkOrderCommentType } from 'app/interfaces/workOrder';
import { ImageIcon, X } from 'lucide-react';

import { CommentTypeSelector } from './CommentTypeSelector';

interface CommentFormProps {
  onSubmit: (
    comment: string,
    type: WorkOrderCommentType,
    files: File[]
  ) => Promise<unknown>;
  isFinished: boolean;
  isLoading: boolean;
}

export const CommentForm: React.FC<CommentFormProps> = ({
  onSubmit,
  isFinished,
  isLoading,
}) => {
  const { t } = useTranslations();
  const { isCRM } = usePermissions();
  const [newComment, setNewComment] = useState('');
  const [newCommentType, setNewCommentType] = useState<WorkOrderCommentType>(
    WorkOrderCommentType.External
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      previewUrls.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const newUrls = files.map(file => URL.createObjectURL(file));
    setSelectedFiles(prev => [...prev, ...files]);
    setPreviewUrls(prev => [...prev, ...newUrls]);

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemoveFile = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async () => {
    const result = await onSubmit(newComment, newCommentType, selectedFiles);
    if (result) {
      setNewComment('');
      setNewCommentType(WorkOrderCommentType.External);
      previewUrls.forEach(url => URL.revokeObjectURL(url));
      setSelectedFiles([]);
      setPreviewUrls([]);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const isSubmitDisabled =
    isFinished || isLoading || (!newComment.trim() && selectedFiles.length === 0);

  return (
    <div className="py-2 flex flex-col gap-2">
      <div className="flex flex-row gap-2">
        <textarea
          disabled={isFinished}
          placeholder={t('comment.placeholder')}
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-indigo-500"
          rows={3}
        />
        <div className="flex flex-col gap-2">
          {isCRM && (
            <CommentTypeSelector
              value={newCommentType}
              onChange={setNewCommentType}
              disabled={isFinished}
            />
          )}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isFinished}
            className={`p-2 flex items-center justify-center rounded-md border ${
              isFinished
                ? 'border-gray-200 text-gray-300'
                : 'border-gray-300 text-gray-500 hover:border-indigo-400 hover:text-indigo-500'
            }`}
            title={t('upload.images')}
          >
            <ImageIcon size={18} />
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={`p-2 flex text-white text-sm rounded-md items-center justify-center ${
              isSubmitDisabled
                ? 'bg-gray-500'
                : 'bg-indigo-500 hover:bg-indigo-600 focus:outline-none focus:bg-indigo-600'
            }`}
            disabled={isSubmitDisabled}
          >
            {t('add.comment')}
            {isLoading && <SvgSpinner className="ml-2" />}
          </button>
        </div>
      </div>

      {previewUrls.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {previewUrls.map((url, index) => (
            <div key={url} className="relative">
              <img
                src={url}
                alt={selectedFiles[index]?.name}
                className="h-16 w-16 object-cover rounded-md border border-gray-200"
              />
              <button
                type="button"
                onClick={() => handleRemoveFile(index)}
                className="absolute -top-1.5 -right-1.5 bg-white border border-gray-300 rounded-full p-0.5 text-gray-500 hover:text-red-500 hover:border-red-300"
                title={t('remove.image')}
              >
                <X size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={isFinished}
      />
    </div>
  );
};
