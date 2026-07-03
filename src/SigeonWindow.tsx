import React, { useRef, useState, useEffect } from 'react';
import { WindowState } from './types';

interface WindowProps {
  key?: string | number;
  windowState: WindowState;
  isActive: boolean;
  bringToFront: () => void;
  closeWindow: () => void;
  updateWindow: (updates: Partial<WindowState>) => void;
  children: React.ReactNode;
}

export default function SigeonWindow({ windowState, isActive, bringToFront, closeWindow, updateWindow, children }: WindowProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isResizing, setIsResizing] = useState(false);
  const [resizeStartSize, setResizeStartSize] = useState({ width: 0, height: 0 });
  const [resizeStartPointer, setResizeStartPointer] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    bringToFront();
    // Stop propagation so OS doesn't clear active window
    e.stopPropagation();
  };

  const handleTitlePointerDown = (e: React.PointerEvent) => {
    bringToFront();
    if (windowRef.current) {
      const rect = windowRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      });
      setIsDragging(true);
      
      // Capture pointer so we keep dragging even if pointer leaves the title bar
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragging) {
      // Find parent OS container bounds
      const parent = windowRef.current?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();
      
      const windowWidth = windowState.width || 0;
      const windowHeight = windowState.height || 0;

      const maxDragX = Math.max(0, parentRect.width - windowWidth);
      const maxDragY = Math.max(0, parentRect.height - windowHeight);

      let newX = e.clientX - parentRect.left - dragOffset.x;
      let newY = e.clientY - parentRect.top - dragOffset.y;
      
      newX = Math.max(0, Math.min(newX, maxDragX));
      newY = Math.max(0, Math.min(newY, maxDragY));

      updateWindow({ x: newX, y: newY });
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (isDragging) {
      setIsDragging(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  const handleResizePointerDown = (e: React.PointerEvent) => {
    e.stopPropagation();
    bringToFront();
    if (windowRef.current) {
      setResizeStartSize({
        width: windowState.width,
        height: windowState.height
      });
      setResizeStartPointer({
        x: e.clientX,
        y: e.clientY
      });
      setIsResizing(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    }
  };

  const handleResizePointerMove = (e: React.PointerEvent) => {
    if (isResizing) {
      const parent = windowRef.current?.parentElement;
      if (!parent) return;
      const parentRect = parent.getBoundingClientRect();

      const dx = e.clientX - resizeStartPointer.x;
      const dy = e.clientY - resizeStartPointer.y;

      const windowX = windowState.x || 0;
      const windowY = windowState.y || 0;

      const maxWidth = Math.max(160, parentRect.width - windowX);
      const maxHeight = Math.max(140, parentRect.height - windowY);

      let newWidth = Math.max(160, resizeStartSize.width + dx);
      let newHeight = Math.max(140, resizeStartSize.height + dy);

      newWidth = Math.min(newWidth, maxWidth);
      newHeight = Math.min(newHeight, maxHeight);

      updateWindow({ width: newWidth, height: newHeight });
    }
  };

  const handleResizePointerUp = (e: React.PointerEvent) => {
    if (isResizing) {
      setIsResizing(false);
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
  };

  if (windowState.isMinimized) {
    return null; // Handle minimization in OS component
  }

  const borderClass = isActive ? "border-black" : "border-gray-800";
  const titleBgClass = isActive ? "bg-[#0000aa]" : "bg-gray-600";
  const titleTextClass = "text-white";

  return (
    <div
      ref={windowRef}
      className={`absolute border-[3px] flex flex-col bg-white overflow-hidden shadow-none ${borderClass}`}
      style={{
        left: windowState.x,
        top: windowState.y,
        width: windowState.isMaximized ? '100%' : windowState.width,
        height: windowState.isMaximized ? '100%' : windowState.height,
        zIndex: windowState.zIndex,
      }}
      onPointerDown={handlePointerDown}
    >
      {/* Title Bar */}
      <div 
        className={`flex justify-between items-center px-2 py-1 select-none ${titleBgClass} ${titleTextClass} border-b-[3px] border-black touch-none`}
        onPointerDown={handleTitlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
      >
        <div className="flex items-center">
          {/* System Menu Icon (Hamburger-like) */}
          <div 
            className="w-5 h-5 bg-white flex flex-col justify-evenly p-0.5 border-2 border-black mr-2 cursor-pointer active:bg-gray-300"
            onClick={closeWindow}
            title="Double click to close (simulated by click here for now)"
          >
            <div className="w-full h-0.5 bg-black"></div>
            <div className="w-full h-0.5 bg-black"></div>
            <div className="w-full h-0.5 bg-black"></div>
          </div>
          <span className="font-bold tracking-widest text-lg">{windowState.title}</span>
        </div>
        
        {/* Min/Max/Close could go here, Win 1.0 had sizing boxes on the right */}
        <div className="flex gap-1">
          <div 
            className="w-6 h-6 border-2 border-black bg-white flex items-center justify-center cursor-pointer font-bold text-black active:bg-gray-300"
            onClick={(e) => {
              e.stopPropagation();
              updateWindow({ isMaximized: !windowState.isMaximized, x: 0, y: 0 });
            }}
          >
            <div className="w-3 h-3 border border-black flex items-start justify-end p-0.5"><div className="w-1.5 h-1.5 bg-black"></div></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 bg-white relative overflow-auto text-black">
        {children}
      </div>

      {/* Resize Handle */}
      {!windowState.isMaximized && (
        <div 
          className="absolute right-0 bottom-0 w-5 h-5 bg-gray-200 border-l-[2px] border-t-[2px] border-black cursor-se-resize z-50 flex items-center justify-center select-none active:bg-gray-400 touch-none"
          onPointerDown={handleResizePointerDown}
          onPointerMove={handleResizePointerMove}
          onPointerUp={handleResizePointerUp}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="black" strokeWidth="1.5" className="opacity-70 pointer-events-none">
            <line x1="10" y1="2" x2="2" y2="10" />
            <line x1="10" y1="5" x2="5" y2="10" />
            <line x1="10" y1="8" x2="8" y2="10" />
          </svg>
        </div>
      )}
    </div>
  );
}
