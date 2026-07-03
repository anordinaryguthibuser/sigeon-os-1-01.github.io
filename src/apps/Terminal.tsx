import React, { useState, useRef, useEffect } from 'react';

interface TerminalProps {
  pcName: string;
  triggerBsod?: () => void;
}

export default function Terminal({ pcName, triggerBsod }: TerminalProps) {
  const prompt = `${pcName}\\C:\\SIGEON>`;
  const [history, setHistory] = useState<string[]>(['MS-PEX Executive Shell v1.01', 'Copyright (C) Sigeon Corp.', '']);
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const newHistory = [...history, `${prompt}${input}`];
      
      const cmd = input.trim().toLowerCase();
      if (cmd === 'dir') {
        newHistory.push('CALC.PEX  PAINT.PEX  NOTEPAD.PEX  WRITE.PEX  TERMINAL.PEX  EXPLORER.PEX  CLOCK.PEX');
      } else if (cmd === 'ver') {
        newHistory.push('Sigeon OS Version 1.01');
      } else if (cmd === 'help') {
        newHistory.push('Available commands: DIR, VER, CLS, HELP, CRASH');
      } else if (cmd === 'crash') {
        if (triggerBsod) triggerBsod();
        return;
      } else if (cmd === 'cls') {
        setHistory([]);
        setInput('');
        return;
      } else if (cmd !== '') {
        newHistory.push(`Bad command or file name`);
      }
      
      setHistory(newHistory);
      setInput('');
    }
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'instant' });
  }, [history]);

  return (
    <div className="flex flex-col h-full bg-black text-white p-2 overflow-auto" onClick={(e) => {
      // Focus input when clicking anywhere in terminal
      const inputEl = e.currentTarget.querySelector('input');
      if (inputEl) inputEl.focus();
    }}>
      {history.map((line, i) => (
        <div key={i} className="whitespace-pre-wrap">{line}</div>
      ))}
      <div className="flex">
        <span className="mr-2">{prompt}</span>
        <input 
          type="text" 
          className="flex-1 bg-transparent outline-none border-none text-white font-mono"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
      <div ref={endRef} />
    </div>
  );
}
