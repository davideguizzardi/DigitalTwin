import React, { useEffect, useState, useRef ,createContext} from 'react';
import TouchKeyboard from '../Commons/TouchKeyboard';

export const KeyboardContext=createContext()

const KeyboardProvider = ({ children }) => {
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [keyboardPos, setKeyboardPos] = useState({ top: 0, left: 0, width: 300 });
  const [inputValue, setInputValue] = useState('');
  const focusedInputRef = useRef(null);

  const updateKeyboardPosition = () => {
    const el = focusedInputRef.current;
    if (!el || !['INPUT', 'TEXTAREA'].includes(el.tagName)) return;

    const rect = el.getBoundingClientRect();
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const scrollX = window.scrollX || document.documentElement.scrollLeft;

    setKeyboardPos({
      top: rect.bottom + scrollY + 8, // space between input and keyboard
      left: rect.left + scrollX,
      width: rect.width,
    });
  };

  useEffect(() => {
    const handleFocus = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
        focusedInputRef.current = e.target; // Set ref to the focused input
        setShowKeyboard(true);
        updateKeyboardPosition();
      }
    };

    const handleBlur = () => {
      setTimeout(() => {
        const active = document.activeElement;
        if (!['INPUT', 'TEXTAREA'].includes(active.tagName)) {
          setShowKeyboard(false);
        }
      }, 100);
    };

    window.addEventListener('focusin', handleFocus);
    window.addEventListener('focusout', handleBlur);
    window.addEventListener('scroll', updateKeyboardPosition);
    window.addEventListener('resize', updateKeyboardPosition);

    return () => {
      window.removeEventListener('focusin', handleFocus);
      window.removeEventListener('focusout', handleBlur);
      window.removeEventListener('scroll', updateKeyboardPosition);
      window.removeEventListener('resize', updateKeyboardPosition);
    };
  }, []);

  return (
    <KeyboardContext.Provider value={{inputValue}}>
      {children}
      {showKeyboard && (
        <div
          style={{
            position: 'absolute',
            top: `${keyboardPos.top}px`,
            left: `${keyboardPos.left}px`,
            width: `${keyboardPos.width}px`,
            zIndex: 9999,
          }}
        >
          <TouchKeyboard focusedInputRef={focusedInputRef} setInputValue={setInputValue}/>
        </div>
      )}
    </KeyboardContext.Provider>
  );
};

export default KeyboardProvider;
