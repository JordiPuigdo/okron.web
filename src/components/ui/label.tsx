'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { useTranslations } from 'app/hooks/useTranslations';
import { cn } from 'app/lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const labelVariants = cva(
  'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
);

interface LabelProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>,
    VariantProps<typeof labelVariants> {
  name: string;
}

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  LabelProps
>(({ className, name, ...props }, ref) => {
  const { t } = useTranslations();

  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(labelVariants(), className)}
      {...props}
    >
      {t(name)}
    </LabelPrimitive.Root>
  );
});

Label.displayName = 'Label';
