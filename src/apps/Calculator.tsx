import React, { useState } from 'react';

export default function Calculator() {
  const [display, setDisplay] = useState('0');
  
  const buttons = [
    '7', '8', '9', '/',
    '4', '5', '6', '*',
    '1', '2', '3', '-',
    'C', '0', '=', '+'
  ];

  const handlePress = (btn: string) => {
    if (btn === 'C') {
      setDisplay('0');
    } else if (btn === '=') {
      try {
        // eslint-disable-next-line no-eval
        setDisplay(String(eval(display)));
      } catch (e) {
        setDisplay('Error');
      }
    } else {
      setDisplay(display === '0' ? btn : display + btn);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white p-2">
      <div className="flex gap-4 mb-2 p-1 border-b-[3px] border-black bg-white select-none">
        <span className="cursor-pointer hover:bg-black hover:text-white px-1">Edit</span>
      </div>
      <div className="border-[3px] border-black p-2 mb-2 text-right text-2xl font-bold bg-white">
        {display}
      </div>
      <div className="grid grid-cols-4 gap-1 flex-1">
        {buttons.map(b => (
          <button 
            key={b}
            className="border-[3px] border-black font-bold text-xl hover:bg-black hover:text-white active:bg-gray-400 active:text-black"
            onClick={() => handlePress(b)}
          >
            {b}
          </button>
        ))}
      </div>
    </div>
  );
}
