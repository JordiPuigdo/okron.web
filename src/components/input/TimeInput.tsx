import React from 'react';

type TimeInputProps = {
  value: string;
  onChange: (value: string) => void;
  name?: string;
  required?: boolean;
  className?: string;
};

const TimeInput = ({
  value,
  onChange,
  name,
  required,
  className,
}: TimeInputProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    const digits = raw.replace(/\D/g, '');

    if (digits.length > 4) return;

    let formatted = digits;
    if (digits.length >= 3) {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2, 4)}`;
    }

    onChange(formatted);
  };

  return (
    <input
      type="text"
      name={name}
      required={required}
      value={value}
      onChange={handleChange}
      placeholder="00:00"
      maxLength={5}
      className={
        className ??
        'w-full border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring focus:border-blue-300'
      }
      inputMode="numeric"
      pattern="[0-2][0-9]:[0-5][0-9]"
    />
  );
};

export default TimeInput;
