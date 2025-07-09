import 'react-time-picker/dist/TimePicker.css';

import React, { useEffect, useRef } from 'react';
import TimePicker from 'react-time-picker';

type TimePickerWrapperProps = {
  value: string | null;
  onChange: (value: string | null) => void;
};

const TimePickerWrapper = ({ value, onChange }: TimePickerWrapperProps) => {
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (wrapperRef.current) {
      const input = wrapperRef.current.querySelector('input');
      if (input) {
        input.setAttribute('tabindex', '0'); // Asegura tabulación
        input.classList.add(
          'w-full',
          'border',
          'border-gray-300',
          'rounded',
          'px-2',
          'py-1',
          'focus:outline-none',
          'focus:ring',
          'focus:border-blue-300'
        );
      }
    }
  }, []);

  const changeEventHandler = (value: string | null) => {
    console.log('value', value);
    // const target = event.target as HTMLInputElement;
    //const value = target.value;
    // onChange(value);
  };

  return (
    <div ref={wrapperRef}>
      <TimePicker
        value={value ?? ''}
        onChange={e => changeEventHandler(e)}
        disableClock
        format="HH:mm"
        locale="ca-ES"
        clearIcon={null}
        clockIcon={null}
        className="w-full"
      />
    </div>
  );
};

export default TimePickerWrapper;
