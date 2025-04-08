import React, { useState, useEffect } from 'react';
import { TextInput } from 'flowbite-react';
import { Button } from 'flowbite-react';
import { StyledButton } from './StyledBasedComponents';

export const TouchKeyboard2 = ({ inputValue, ...textInputProps }) => {
  const [value, setValue] = useState("")
  const [maiusc, setMaiusc] = useState(false)
  const [showKeyboard, setShowKeyboard] = useState(false)

  const buttonBaseStyle="rounded-md text-2xl p-1 "

  useEffect(() => {
    if (inputValue)
      setValue(inputValue)
  }, [inputValue])

  const handleKeyPress = (key) => {
    setValue((prev) => {
      const updated = prev + key;
      // Notify parent
      if (textInputProps.onChange) {
        textInputProps.onChange({ target: { value: updated } });
      }
      return updated;
    });
  };

  // Function to handle backspace
  const handleBackspace = () => {
    setValue((prev) => {
      const updated = prev.slice(0, -1);
      if (textInputProps.onChange) {
        textInputProps.onChange({ target: { value: updated } });
      }
      return updated;
    });
  };




  const renderStandardKeyRow = (keys) => {
    return (<>
      {keys.map((key) => (
        <button
          key={key}
          type="button"
          onMouseDown={(e) => {
            e.preventDefault(); // Prevent text input blur
            e.stopPropagation(); // Prevent bubbling
            handleKeyPress(maiusc ? key.toUpperCase() : key);
          }}
          onClick={(e) => {
            e.preventDefault(); // Prevent form submit on click
            e.stopPropagation();
          }}
          className={`${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 w-10`}
        >
          {maiusc ? key.toUpperCase() : key}
        </button>
      ))}
    </>
    );
  };

  return (
    <div className="relative flex flex-col gap-2 shadow-md rounded-md bg-zinc-100">

      <TextInput
        value={value}
        onFocus={() => setShowKeyboard(true)}
        onBlur={() => setShowKeyboard(false)}

        {...textInputProps}
      />


      {showKeyboard &&

        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 z-50 bg-zinc-100 shadow-lg p-2 rounded-md flex flex-col gap-2">
          <div className="flex flex-row gap-2 items-center justify-center">
            {maiusc ?
              renderStandardKeyRow(['!', '@', '#', '$', '%', '^', '&', '*', '(', ')'])
              :
              renderStandardKeyRow(['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'])}
          </div>

          <div className="flex flex-row gap-2 items-center justify-center">
            {renderStandardKeyRow(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'])}

          </div>

          <div className="flex flex-row gap-2 items-center justify-center">

            {renderStandardKeyRow(['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'])}

          </div>

          <div className="flex flex-row gap-2 items-center justify-center">

            {renderStandardKeyRow(['z', 'x', 'c', 'v', 'b', 'n', 'm','.'])}

          </div>
          <div className="flex flex-row gap-2 items-center justify-center">

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
              shift
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleKeyPress(" ");
              }}
              onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation();
              }}
              className={`${buttonBaseStyle} bg-gray-200 hover:bg-gray-300 w-32`}
            >
              space
            </button>
            <button
              onMouseDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleBackspace();
              }}
              onClick={(e) => {
                e.preventDefault(); 
                e.stopPropagation();
              }}
              className={`${buttonBaseStyle} bg-red-500 text-white hover:bg-red-600`}
            >
              ⌫
            </button>

          </div>
        </div>
      }

    </div>
  );
};
