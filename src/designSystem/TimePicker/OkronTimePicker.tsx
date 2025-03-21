import React from 'react';

interface OkronTimePickerProps {
  selectedTime: string;
  onTimeChange: (time: string) => void;
  startTme?: number;
  endTime?: number;
  interval?: number;
}

const OkronTimePicker: React.FC<OkronTimePickerProps> = ({
  selectedTime,
  onTimeChange,
  startTme = 0,
  endTime = 23,
  interval = 15,
}) => {
  const generateTimes = () => {
    const times = [];
    for (let hour = startTme; hour <= endTime; hour++) {
      for (let minute = 0; minute < 60; minute += interval) {
        const time = `${hour.toString().padStart(2, '0')}:${minute
          .toString()
          .padStart(2, '0')}`;
        times.push(time);
      }
    }
    return times;
  };

  const times = generateTimes();

  return (
    <select
      value={selectedTime}
      onChange={e => onTimeChange(e.target.value)}
      className="border border-gray-300 p-2 rounded-md w-full"
    >
      {times.map(time => (
        <option key={time} value={time}>
          {time}
        </option>
      ))}
    </select>
  );
};

export default OkronTimePicker;
