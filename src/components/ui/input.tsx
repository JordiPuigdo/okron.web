import * as React from 'react';
import { cn } from 'app/lib/utils';

// ---- Tipos ---- //

type TextInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  mode?: 'text'; // por defecto
};

type NumberInputProps = Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value' | 'onChange'
> & {
  mode: 'number';
  value: number | null;
  onValueChange: (value: number | null) => void;
  allowDecimals?: boolean; // <- AQUÍ decides si puede tener decimales
  allowNegative?: boolean;
  preventSubmitOnEnter?: boolean;
  maxDecimals?: number; // opcional: limitar nº de decimales
};

export type InputProps = TextInputProps | NumberInputProps;

// ---- Componente ---- //

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (props, ref) => {
    // =========================
    // MODO NUMÉRICO
    // =========================
    if (props.mode === 'number') {
      const {
        value,
        onValueChange,
        allowDecimals = false,
        allowNegative = false,
        preventSubmitOnEnter = true,
        maxDecimals,
        className,
        ...rest
      } = props;

      const [inner, setInner] = React.useState<string>(
        value ?? value === 0 ? String(value) : ''
      );

      // sincroniza con value externo
      React.useEffect(() => {
        if (value === null || value === undefined) {
          setInner('');
        } else if (!Number.isNaN(value)) {
          setInner(String(value));
        }
      }, [value]);

      const parseAndEmit = (raw: string) => {
        if (raw === '') {
          onValueChange(null);
          return;
        }

        // permitir coma como separador decimal
        const normalized = raw.replace(',', '.');

        let parsed = Number(normalized);
        if (Number.isNaN(parsed)) {
          return;
        }

        if (!allowNegative && parsed < 0) {
          return;
        }

        if (!allowDecimals) {
          // → forzamos entero
          parsed = Math.trunc(parsed);
          onValueChange(parsed);
          return;
        }

        if (typeof maxDecimals === 'number') {
          const factor = Math.pow(10, maxDecimals);
          parsed = Math.round(parsed * factor) / factor;
        }

        onValueChange(parsed);
      };

      const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        setInner(raw);
        parseAndEmit(raw);
      };

      const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (preventSubmitOnEnter && event.key === 'Enter') {
          event.preventDefault();
        }

        const forbiddenBase = ['e', 'E', '+'];
        const forbiddenDecimals = ['.', ','];
        const forbiddenNegative = ['-'];

        const forbidden: string[] = [...forbiddenBase];

        if (!allowDecimals) {
          forbidden.push(...forbiddenDecimals);
        }
        if (!allowNegative) {
          forbidden.push(...forbiddenNegative);
        }

        if (forbidden.includes(event.key)) {
          event.preventDefault();
        }
      };

      return (
        <input
          ref={ref}
          type="number"
          inputMode={allowDecimals ? 'decimal' : 'numeric'}
          step={allowDecimals ? '0.01' : 1}
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-right',
            className
          )}
          value={inner}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          {...rest}
        />
      );
    }

    // =========================
    // MODO TEXTO (el de siempre)
    // =========================

    const { className, type, ...restText } = props as TextInputProps;

    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className
        )}
        {...restText}
      />
    );
  }
);

Input.displayName = 'Input';
