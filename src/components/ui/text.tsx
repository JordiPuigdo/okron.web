import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { twMerge } from 'tailwind-merge';

const AnimateOnViewport = dynamic(
  () => import('components/common/AnimateOnViewport'),
  { ssr: false }
);

export const Title = ({
  size = 'xl',
  as = 'h3',
  className = '',
  wrapperClassName = '',
  isAnimated = false,
  origin = 'bottom',
  onClick = undefined,
  children,
  id = '',
}: {
  size?: '3xl' | '2xl' | 'xl' | 'xldr';
  weight?: string;
  as?: 'h3' | 'h2' | 'h1';
  className?: string;
  wrapperClassName?: string;
  isAnimated?: boolean;
  origin?: 'top' | 'right' | 'bottom' | 'left';
  children: ReactNode;
  onClick?: (...args: any[]) => void;
  id?: string;
}) => {
  const HtmlComponent = as;

  const STYLES = {
    '3xl': 'text-4xl lg:text-6xl',
    '2xl': 'text-3xl lg:text-5xl',
    xl: 'text-xl lg:text-2xl',
    xldr: 'text-[28px] leading-[36px]',
  };

  const styles = twMerge(
    `font-gtUltra text-hg-secondary font-bold text-balance ${STYLES[size]} ${className}`
  );

  if (isAnimated) {
    return (
      <AnimateOnViewport className={wrapperClassName} origin={origin}>
        <HtmlComponent className={styles} onClick={onClick} id={id}>
          {children}
        </HtmlComponent>
      </AnimateOnViewport>
    );
  }

  return (
    <HtmlComponent className={styles} onClick={onClick} id={id}>
      {children}
    </HtmlComponent>
  );
};

export const Text = ({
  size = 'default',
  as = 'p',
  className = '',
  wrapperClassName = '',
  onClick = undefined,
  children,
  isAnimated = false,
  origin = 'bottom',
  id = '',
  rest,
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xldr' | '2xl' | 'default';
  as?: 'h1' | 'h2' | 'h3' | 'p' | 'span';
  className?: string;
  wrapperClassName?: string;
  onClick?: (...args: any[]) => void;
  children: ReactNode;
  isAnimated?: boolean;
  origin?: 'top' | 'right' | 'bottom' | 'left';
  id?: string;
  [key: string]: any;
}) => {
  const HtmlComponent = as;

  const styles = `text-left ${
    size !== 'default' ? `text-${size}` : ''
  } ${className}`;

  if (isAnimated) {
    return (
      <AnimateOnViewport origin={origin} className={wrapperClassName}>
        <HtmlComponent className={styles} onClick={onClick} id={id}>
          {children}
        </HtmlComponent>
      </AnimateOnViewport>
    );
  }

  return (
    <HtmlComponent className={styles} onClick={onClick} {...rest} id={id}>
      {children}
    </HtmlComponent>
  );
};
