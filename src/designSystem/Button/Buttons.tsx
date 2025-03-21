import { ReactNode } from 'react';
import Link from 'next/link';
import { twMerge } from 'tailwind-merge';

type ButtonTypes =
  | 'create'
  | 'edit'
  | 'delete'
  | 'cancel'
  | 'detail'
  | 'save'
  | 'others'
  | 'none';
type ButtonSizes = 'sm' | 'md' | 'lg' | 'xl';

type ButtonProps = {
  type?: ButtonTypes;
  size?: ButtonSizes;
  href?: string;
  className?: string;
  customStyles?: string;
  wrapperClassName?: string;
  onClick?: (...args: any[]) => void;
  children: ReactNode;
  disabled?: boolean;
  isAnimated?: boolean;
  origin?: 'top' | 'right' | 'bottom' | 'left';
  [key: string]: any;
};

export const Button = ({
  type = 'create',
  size = 'md',
  href = '',
  className = '',
  customStyles = '',
  wrapperClassName = '',
  onClick = undefined,
  children,
  disabled = false,
  isAnimated = false,
  origin = 'bottom',
  id = '',
  tooltip = '',
  ...rest
}: ButtonProps) => {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };
  if (href) {
    return (
      <Link
        href={href}
        className={twMerge(
          `relative overflow-visible inline-block ${disabled ? '' : className}`
        )}
        onClick={handleClick}
        {...rest}
      >
        <ButtonBody
          type={type}
          disabled={disabled}
          size={size}
          customStyles={customStyles}
        >
          {children}
        </ButtonBody>
      </Link>
    );
  }

  return (
    <button
      className={twMerge(
        `transition-all relative group overflow-visible ${className}`
      )}
      onClick={handleClick}
      type={rest?.isSubmit ? 'submit' : 'button'}
    >
      <ButtonBody
        id={id}
        type={type}
        size={size}
        customStyles={customStyles}
        disabled={disabled}
        {...rest}
      >
        {children}
      </ButtonBody>
    </button>
  );
};

const ButtonBody = ({
  type,
  size,
  customStyles,
  disabled = false,
  children,
  id,
  ...rest
}: {
  type: ButtonTypes;
  size: ButtonSizes;
  customStyles?: string;
  disabled?: boolean;
  children: ReactNode;
  id?: string;
}) => {
  const DISABLED_STYLES =
    'bg-gray-200 text-gray-500 hover:bg-gray-200 hover:text-gray-500 cursor:default w-full text-center justify-center rounded-none';

  const STYLES: any = {
    common: 'transition-all relative text-center rounded-full',
    none: ' ',
    create:
      'bg-okron-btCreate text-white px-4 py-2 rounded-md hover:bg-okron-btCreateHover focus:outline-none focus:ring focus:border-blue-300',
    edit: 'bg-okron-btEdit text-white px-4 py-2 rounded-md hover:bg-okron-btEditHover focus:outline-none focus:ring focus:border-blue-300',
    delete:
      'bg-okron-btDelete text-white px-4 py-2 rounded-md hover:bg-okron-btDeleteHover focus:outline-none focus:ring focus:border-blue-300',
    cancel:
      'bg-okron-btnCancel text-white px-4 py-2 rounded-md hover:bg-okron-btnCancelHover focus:outline-none focus:ring focus:border-blue-300',
    others:
      'bg-orange-500 text-white p-2 rounded-md hover:bg-orange-600 items-center gap-2',
    detail:
      'text-center text-white bg-okron-btDetail hover:bg-okron-btnDetailHover',
    sm: 'items-center text-xs font-medium h-[32px] px-4',
    md: 'items-center font-medium h-[40px] px-4',
    lg: 'items-center text-md font-semibold h-[48px] px-6',
    xl: `${
      type === 'create' ? 'h-[64px] text-lg' : 'h-[60px] text-md'
    } font-semibold px-6`,
  };

  const styles = twMerge(
    `${STYLES.common} ${STYLES[type]} ${STYLES[size]} ${customStyles} ${
      disabled ? DISABLED_STYLES : ''
    }`
  );
  return (
    <div id={id} className={` ${styles} `} {...rest}>
      {children}
    </div>
  );
};
