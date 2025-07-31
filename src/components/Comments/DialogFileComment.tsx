import { SvgCross } from 'app/icons/designSystem/SvgCross';
import { Dialog, DialogContent } from 'components/Dialog';
import { Button } from 'designSystem/Button/Buttons';
import Image from 'next/image';

interface Props {
  zoomedImage: string | null;
  handleCloseZoomedImage: () => void;
}

export const DialogFileComment = ({
  zoomedImage,
  handleCloseZoomedImage,
}: Props) => {
  return (
    <Dialog open={zoomedImage !== null} onOpenChange={handleCloseZoomedImage}>
      <DialogContent hideClose className="w-full bg-okron-200/90 right-0">
        <div className="flex p-12 flex-col w-full h-full border items-center justify-center">
          <Button
            className="flex w-full justify-end"
            onClick={handleCloseZoomedImage}
          >
            <SvgCross className="cursor-pointer h-6 w-6 appearance-none p-1" />
          </Button>
          {zoomedImage && (
            <Image
              src={zoomedImage.replace(/ /g, '%20')}
              alt="Imatge ampliada"
              width={1200}
              height={1200}
              className="rounded-3xl p-4 object-contain"
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
