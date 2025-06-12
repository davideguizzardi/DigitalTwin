import React, { useState, useEffect } from 'react';
import { TextInput } from 'flowbite-react';

export const NumericKeyboard = ({ inputValue, forceOpen = false, ...textInputProps }) => {
  const [value, setValue] = useState('');
  const [showKeyboard, setShowKeyboard] = useState(forceOpen);

  const buttonBaseStyle = 'rounded-md text-2xl p-1';

  useEffect(() => {
    if (inputValue != null) setValue(inputValue);
  }, [inputValue]);

  const handleKeyPress = (key) => {
    setValue((prev) => {
      const updated = prev + key;
      textInputProps.onChange?.({ target: { value: updated } });
      return updated;
    });
  };

  const handleBackspace = () => {
    setValue((prev) => {
      const updated = prev.slice(0, -1);
      textInputProps.onChange?.({ target: { value: updated } });
      return updated;
    });
  };

  const keys = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    ['0'],
  ];

  return (
    <div className="relative flex flex-col gap-2 shadow-md rounded-md bg-zinc-50">
      <TextInput
        value={value}
        onFocus={() => setShowKeyboard(true)}
        onBlur={() => setShowKeyboard(false || forceOpen)}
        className="w-full"
        {...textInputProps}
      />

      {showKeyboard && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-zinc-50 shadow-lg p-2 rounded-md flex flex-col gap-2">
          {keys.map((row, idx) => (
            <div key={idx} className="flex flex-row gap-2 justify-center">
              {row.map((key) => (
                <button
                  key={key}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleKeyPress(key);
                  }}
                  className={`${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 w-10`}
                >
                  {key}
                </button>
              ))}
            </div>
          ))}

          <div className="flex flex-row gap-2 justify-center mt-2">
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBackspace();
              }}
              className={`${buttonBaseStyle} bg-red-500 text-white hover:bg-red-600 w-24`}
            >
              ⌫
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
