import React, { useEffect,useState } from 'react';
import { usePermissions } from 'app/hooks/usePermissions';
import { useTranslations } from 'app/hooks/useTranslations';
import { SvgSave } from 'app/icons/designSystem/SvgSave';
import { SvgClose, SvgSpinner } from 'app/icons/icons';
import { WorkOrderCommentType } from 'app/interfaces/workOrder';
import { Modal } from 'designSystem/Modals/Modal';

import { CommentTypeSelector } from './CommentTypeSelector';
import { EditCommentState } from './hooks/useWorkOrderComments';

interface CommentEditModalProps {
  isOpen: boolean;
  comment: EditCommentState | null;
  onClose: () => void;
  onSave: (comment: EditCommentState) => Promise<boolean>;
  isLoading: boolean;
}

export const CommentEditModal: React.FC<CommentEditModalProps> = ({
  isOpen,
  comment,
  onClose,
  onSave,
  isLoading,
}) => {
  const { t } = useTranslations();
  const { isCRM } = usePermissions();
  const [editedComment, setEditedComment] = useState<EditCommentState>({
    id: null,
    comment: '',
    type: WorkOrderCommentType.External,
    urls: [],
  });

  useEffect(() => {
    if (comment) {
      setEditedComment(comment);
    }
  }, [comment]);

  const handleSave = async () => {
    const success = await onSave(editedComment);
    if (success) {
      onClose();
    }
  };

  const handleClose = () => {
    setEditedComment({
      id: null,
      comment: '',
      type: WorkOrderCommentType.External,
      urls: [],
    });
    onClose();
  };

  return (
    <>
      {/* Overlay oscuro de fondo */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 z-40 transition-opacity"
          onClick={handleClose}
        />
      )}

      {/* Modal de edición */}
      <Modal
        isVisible={isOpen}
        setIsVisible={onClose}
        type="center"
        width="w-[95%] md:w-[600px]"
        height="h-auto max-h-[90vh]"
        className="rounded-2xl shadow-2xl overflow-hidden"
        hideModalBackground={true}
      >
        <div className="bg-white rounded-2xl">
          {/* Header del modal */}
          <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {t('edit.comment')}
            </h2>
            <button
              onClick={handleClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              aria-label="Cerrar"
            >
              <SvgClose className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Contenido del modal */}
          <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                {t('comment')}
              </label>
              <textarea
                value={editedComment.comment}
                onChange={e =>
                  setEditedComment(prev => ({
                    ...prev,
                    comment: e.target.value,
                  }))
                }
                className="w-full border-2 border-gray-200 rounded-xl py-3 px-4 text-gray-900 placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all resize-none"
                rows={8}
                placeholder={t('comment.placeholder')}
              />
            </div>

            {isCRM && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('type')}
                </label>
                <CommentTypeSelector
                  value={editedComment.type}
                  onChange={type =>
                    setEditedComment(prev => ({ ...prev, type }))
                  }
                  variant="modal"
                />
              </div>
            )}
          </div>

          {/* Footer con botones */}
          <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
            <button
              onClick={handleSave}
              disabled={isLoading || editedComment.comment.trim().length === 0}
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <SvgSpinner className="w-4 h-4 animate-spin" />
                  {t('saving')}
                </>
              ) : (
                <>
                  <SvgSave className="w-4 h-4" />
                  {t('save')}
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
};
