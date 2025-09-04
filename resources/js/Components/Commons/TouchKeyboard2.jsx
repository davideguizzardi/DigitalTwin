import React, { useState, useEffect } from 'react';
import { BsFillShiftFill } from "react-icons/bs";
import { TextInput } from 'flowbite-react';

export const TouchKeyboard2 = ({ inputValue,forceOpen=false, ...textInputProps }) => {
  const [value, setValue] = useState('');
  const [maiusc, setMaiusc] = useState(false);
  const [keyboardMode, setKeyboardMode] = useState('abc');
  const [showKeyboard, setShowKeyboard] = useState(forceOpen);

  const buttonBaseStyle = 'rounded-md text-2xl p-1';

  const isTouchDevice=() =>{
  return (('ontouchstart' in window) ||
     (navigator.maxTouchPoints > 0) ||
     (navigator.msMaxTouchPoints > 0));
}

  useEffect(() => {
    if (inputValue) setValue(inputValue);
  }, [inputValue]);

  const handleKeyPress = (key) => {
    setValue((prev) => {
      const updated = prev + key;
      if (textInputProps.onChange) {
        textInputProps.onChange({ target: { value: updated } });
      }
      return updated;
    });
  };

  const handleBackspace = () => {
    setValue((prev) => {
      const updated = prev.slice(0, -1);
      if (textInputProps.onChange) {
        textInputProps.onChange({ target: { value: updated } });
      }
      return updated;
    });
  };

  const renderKeyRow = (keys) => (
    <>
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleKeyPress(maiusc && keyboardMode === 'abc' ? key.toUpperCase() : key);
          }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className={`${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 w-10`}
        >
          {maiusc && keyboardMode === 'abc' ? key.toUpperCase() : key}
        </button>
      ))}
    </>
  );

  // Keyboard layouts
  const layouts = {
    abc: [
      ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
      ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
      ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
    ],
    '123': [
      ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
      ['@', '#', '€', '_', '&', '-', '+', '(', ')', '/'],
      ['*', '"', '\'', ':', ';', '!', '?', ',', '.'],
    ],
  };

  return (
    <div className="relative flex flex-col gap-2 shadow-md rounded-md bg-zinc-50">
      <TextInput
        value={value}
        onFocus={() => setShowKeyboard(true)}
        onBlur={() => setShowKeyboard(false || forceOpen)}
        className="w-full"
        {...textInputProps}
      />

      {showKeyboard && !isTouchDevice() && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 z-50 bg-zinc-50 shadow-lg p-2 rounded-md flex flex-col gap-2">
          {layouts[keyboardMode].map((row, index) => (
            <div key={index} className="flex flex-row gap-2 justify-center">
              {renderKeyRow(row)}
            </div>
          ))}


          <div className="flex flex-row gap-2 justify-center items-center mt-1">
            {keyboardMode === 'abc' && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setMaiusc(!maiusc);
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
                className={`${buttonBaseStyle} bg-green-500 text-white hover:bg-green-600`}
              >
                <BsFillShiftFill/>
              </button>
            )}

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setKeyboardMode((prev) => (prev === 'abc' ? '123' : 'abc'));
              }}
              className={`text-xl p-1 rounded-full bg-blue-500 text-white hover:bg-blue-600`}
            >
              {keyboardMode === 'abc' ? '?123' : 'ABC'}
            </button>

            <button
              key={"/"}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleKeyPress("/");
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className={`${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 w-10`}
            >
              {"/"}
            </button>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleKeyPress(' ');
              }}
              className={`${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 w-36 h-10`}
            >
              {/*Space*/}
            </button>

            
            <button
              key={"."}
              type="button"
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleKeyPress(".");
              }}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              className={`${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 w-10`}
            >
              {"."}
            </button>

            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBackspace();
              }}
              className={`${buttonBaseStyle} bg-red-500 text-white hover:bg-red-600`}
            >
              ⌫
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
