import React, { useState, useEffect } from 'react';
import { OSState, WindowState, AppId, FileItem } from './types';
import SigeonWindow from './SigeonWindow';
import MSpexExecutive from './apps/MSpexExecutive';
import Calculator from './apps/Calculator';
import Paint from './apps/Paint';
import Notepad from './apps/Notepad';
import Terminal from './apps/Terminal';
import ClockApp from './apps/ClockApp';
import SettingsApp from './apps/SettingsApp';
import SaveAsDialog from './components/SaveAsDialog';
import ConfirmDialog from './components/ConfirmDialog';

const initialFiles: FileItem[] = [
  { name: 'CALC.PEX', id: 'calc', isSystem: true },
  { name: 'PAINT.PEX', id: 'paint', isSystem: true },
  { name: 'NOTEPAD.PEX', id: 'notepad', isSystem: true },
  { name: 'WRITE.PEX', id: 'wordpad', isSystem: true },
  { name: 'TERMINAL.PEX', id: 'terminal', isSystem: true },
  { name: 'CLOCK.PEX', id: 'clock', isSystem: true },
  { name: 'SETTINGS.PEX', id: 'settings', isSystem: true },
  { name: 'EXPLORER.PEX', id: 'explorer', isSystem: true },
  { name: 'ABC.TXT', content: 'This is a sample text file.\n\nSigeon OS is great!', isSystem: false },
  { name: 'README.DOC', content: 'Welcome to Sigeon OS 1.01!\n\nThis is a documentation file.', isSystem: false },
  { name: 'CONFIG.SYS', content: 'FILES=30\nBUFFERS=20', isSystem: true },
  { name: 'AUTOEXEC.BAT', content: 'ECHO OFF\nCLS', isSystem: true },
  { name: 'KERNEL.PEX', isSystem: true },
  { name: 'SYSTEM.INI', isSystem: true },
  { name: 'WIN.INI', isSystem: true },
];

export default function SigeonOS() {
  const [bootStage, setBootStage] = useState(0);
  const [shutdownState, setShutdownState] = useState<'none' | 'shutdown'>('none');
  const [pcName, setPcName] = useState<string>(() => localStorage.getItem('sigeon_pc_name') || '');
  const [setupMode, setSetupMode] = useState<boolean>(!localStorage.getItem('sigeon_pc_name'));
  const [files, setFiles] = useState<FileItem[]>(() => {
    const saved = localStorage.getItem('sigeon_files');
    return saved ? JSON.parse(saved) : initialFiles;
  });

  const [bsodState, setBsodState] = useState<boolean>(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    onYes: () => void;
    onNo: () => void;
    onCancel: () => void;
  } | null>(null);

  const [saveDialog, setSaveDialog] = useState<{
    targetWindowId: string;
    defaultAppId: 'notepad' | 'wordpad';
    content: string;
    callback?: (savedFilename: string) => void;
  } | null>(null);

  useEffect(() => {
    localStorage.setItem('sigeon_files', JSON.stringify(files));
  }, [files]);

  useEffect(() => {
    if (bootStage < 5) {
       const timer = setTimeout(() => {
          setBootStage(b => b + 1);
       }, 800 + Math.random() * 400);
       return () => clearTimeout(timer);
    }
  }, [bootStage]);

  const [osState, setOsState] = useState<OSState>(() => {
    const isComputer = typeof window !== 'undefined' && window.innerWidth >= 768;
    return {
      windows: [
        {
          id: 'executive-1',
          appId: 'explorer',
          title: 'MS-PEX Executive',
          x: isComputer ? 30 : 10,
          y: isComputer ? 30 : 10,
          width: isComputer ? 580 : 320,
          height: isComputer ? 400 : 240,
          zIndex: 10,
          isMinimized: false,
          isMaximized: false,
        }
      ],
      activeWindowId: 'executive-1',
      nextZIndex: 11,
    };
  });

  const bringToFront = (id: string) => {
    setOsState(prev => ({
      ...prev,
      windows: prev.windows.map(w => 
        w.id === id ? { ...w, zIndex: prev.nextZIndex } : w
      ),
      activeWindowId: id,
      nextZIndex: prev.nextZIndex + 1
    }));
  };

  const closeWindow = (id: string) => {
    setOsState(prev => {
      const winToClose = prev.windows.find(w => w.id === id);
      if (winToClose && winToClose.appId === 'explorer') {
        setTimeout(() => handleShutdown(), 100);
      }
      return {
        ...prev,
        windows: prev.windows.filter(w => w.id !== id),
        activeWindowId: prev.activeWindowId === id ? null : prev.activeWindowId
      };
    });
  };

  const openApp = (appId: AppId, props?: any) => {
    const id = `${appId}-${Date.now()}`;
    const titles: Record<AppId, string> = {
      calc: 'Calculator',
      paint: 'Paint',
      notepad: 'Notepad',
      wordpad: 'Write',
      terminal: 'Terminal',
      explorer: 'MS-PEX Executive',
      clock: 'Clock',
      settings: 'Settings'
    };

    const isComputer = typeof window !== 'undefined' && window.innerWidth >= 768;

    setOsState(prev => ({
      ...prev,
      windows: [
        ...prev.windows,
        {
          id,
          appId,
          title: props?.filename ? `${titles[appId]} - ${props.filename}` : titles[appId],
          x: 30 + (prev.windows.length * 20) % 100,
          y: 30 + (prev.windows.length * 20) % 100,
          width: appId === 'calc' ? 200 : appId === 'clock' ? 180 : (isComputer ? 500 : 320),
          height: appId === 'calc' ? 240 : appId === 'clock' ? 220 : (isComputer ? 360 : 240),
          zIndex: prev.nextZIndex,
          isMinimized: false,
          isMaximized: false,
          props
        }
      ],
      activeWindowId: id,
      nextZIndex: prev.nextZIndex + 1
    }));
  };

  const openFile = (file: FileItem) => {
    if (file.id) {
       openApp(file.id);
    } else if (file.name.endsWith('.TXT')) {
       openApp('notepad', { filename: file.name, content: file.content || '', originalContent: file.content || '' });
    } else if (file.name.endsWith('.DOC')) {
       openApp('wordpad', { filename: file.name, content: file.content || '', originalContent: file.content || '' });
    } else {
       // Cannot open
    }
  };

  const updateWindow = (id: string, updates: Partial<WindowState>) => {
    setOsState(prev => ({
      ...prev,
      windows: prev.windows.map(w => w.id === id ? { ...w, ...updates } : w)
    }));
  };

  const handleShutdown = () => {
    localStorage.setItem('sigeon_files', JSON.stringify(files));
    setOsState(p => ({ ...p, windows: [] }));
    setShutdownState('shutdown');
  };

  const handleRestart = () => {
    localStorage.setItem('sigeon_files', JSON.stringify(files));
    window.location.reload();
  };

  const handleDeleteFile = (fileName: string) => {
    const file = files.find(f => f.name === fileName);
    if (file && file.isSystem) {
       alert("Cannot delete system file: " + fileName);
       return;
    }
    setFiles(prev => prev.filter(f => f.name !== fileName));
  };

  const saveFile = (fileName: string, content: string, windowId?: string) => {
    // 1. Update virtual file list
    setFiles(prev => {
      const exists = prev.find(f => f.name === fileName);
      if (exists) {
        return prev.map(f => f.name === fileName ? { ...f, content } : f);
      }
      return [...prev, { name: fileName, content, isSystem: false }];
    });

    // 2. Sync updated props to open windows to make them "clean" (matching originalContent with content)
    setOsState(prev => {
      return {
        ...prev,
        windows: prev.windows.map(w => {
          const matchesId = windowId && w.id === windowId;
          const matchesFilename = w.props?.filename === fileName;
          if (matchesId || matchesFilename) {
            const isWordpadApp = w.appId === 'wordpad';
            const displayTitle = isWordpadApp ? `Write - ${fileName}` : `Notepad - ${fileName}`;
            return {
              ...w,
              title: displayTitle,
              props: {
                ...w.props,
                filename: fileName,
                content: content,
                originalContent: content
              }
            };
          }
          return w;
        })
      };
    });
  };

  const handleRequestSaveAs = (windowId: string, content: string, defaultExt: string, callback: (savedFilename: string) => void) => {
    setSaveDialog({
      targetWindowId: windowId,
      defaultAppId: defaultExt === 'DOC' ? 'wordpad' : 'notepad',
      content: content,
      callback: (savedName) => {
        saveFile(savedName, content, windowId);
        callback(savedName);
      }
    });
  };

  const handleCloseRequest = (id: string) => {
    const win = osState.windows.find(w => w.id === id);
    if (!win) return;

    if (win.appId === 'explorer') {
      handleShutdown();
      return;
    }

    if (win.appId === 'notepad' || win.appId === 'wordpad') {
      const content = win.props?.content || '';
      const originalContent = win.props?.originalContent || '';

      if (content !== originalContent) {
        const filename = win.props?.filename || (win.appId === 'wordpad' ? 'UNTITLED.DOC' : 'UNTITLED.TXT');
        setConfirmDialog({
          title: win.appId === 'wordpad' ? 'Write' : 'Notepad',
          message: `Save changes to ${filename}?`,
          onYes: () => {
            setConfirmDialog(null);
            if (win.props?.filename && win.props.filename !== 'UNTITLED.TXT' && win.props.filename !== 'DOCUMENT.DOC') {
              saveFile(win.props.filename, content, id);
              closeWindow(id);
            } else {
              setSaveDialog({
                targetWindowId: id,
                defaultAppId: win.appId as 'notepad' | 'wordpad',
                content: content,
                callback: (savedName) => {
                  saveFile(savedName, content, id);
                  closeWindow(id);
                }
              });
            }
          },
          onNo: () => {
            setConfirmDialog(null);
            closeWindow(id);
          },
          onCancel: () => {
            setConfirmDialog(null);
          }
        });
        return;
      }
    }

    closeWindow(id);
  };

  const triggerBsod = () => setBsodState(true);

  if (bsodState) {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#1e72d2] text-white flex flex-col p-4 sm:p-8 z-[9999] font-sans overflow-hidden">
        <div className="flex flex-row items-center gap-2 sm:gap-4 mb-4 sm:mb-8 mt-2 sm:mt-12">
           <svg viewBox="0 0 16 16" fill="white" className="w-16 h-16 sm:w-[120px] sm:h-[120px] opacity-90 shrink-0" shapeRendering="crispEdges">
             <rect x="5" y="2" width="5" height="1" />
             <rect x="4" y="3" width="7" height="1" />
             <rect x="3" y="4" width="2" height="1" />
             <rect x="6" y="4" width="6" height="1" />
             <rect x="3" y="5" width="9" height="1" />
             <rect x="12" y="5" width="2" height="1" />
             <rect x="2" y="6" width="10" height="1" />
             <rect x="12" y="6" width="3" height="1" />
             <rect x="2" y="7" width="11" height="1" />
             <rect x="2" y="8" width="10" height="1" />
             <rect x="3" y="9" width="8" height="1" />
             <rect x="4" y="10" width="7" height="1" />
             <rect x="6" y="11" width="1" height="2" />
             <rect x="8" y="11" width="1" height="2" />
             <rect x="5" y="13" width="2" height="1" />
             <rect x="7" y="13" width="2" height="1" />
           </svg>
           <div className="flex flex-col items-start gap-1 sm:gap-2">
             <h1 className="text-lg sm:text-4xl font-bold bg-[#0d4c94] px-2 sm:px-4 py-1 sm:py-2 shadow-md inline-block">SigeonOS Blue Screen Of</h1>
             <h1 className="text-lg sm:text-4xl font-bold bg-[#0d4c94] px-2 sm:px-4 py-1 sm:py-2 shadow-md inline-block">Death</h1>
           </div>
        </div>
        <p className="text-base sm:text-3xl mb-4 sm:mb-8 max-w-3xl leading-snug sm:leading-relaxed">
          Your PC ran into a problem and needs to restart.<br className="hidden sm:block"/>
          We're just collecting some error info, and then we'll restart for you.
        </p>
        <p className="text-base sm:text-3xl mb-4 sm:mb-12">85% complete</p>
        <div className="mt-auto text-[10px] sm:text-sm text-gray-200">
          <p>For more information about this issue and possible seeds, visit our website.</p>
          <p className="mt-2 sm:mt-4 text-[8px] sm:text-xs opacity-70">Stop code: 00420001</p>
        </div>
      </div>
    );
  }

  if (shutdownState === 'shutdown') {
    return (
      <div className="absolute inset-0 w-full h-full bg-black text-white flex items-center justify-center font-sans tracking-widest p-4 z-50">
        <div className="text-xl text-center">It is now safe to close the tab.</div>
      </div>
    );
  }

  if (bootStage < 5) {
    return (
      <div className="absolute inset-0 w-full h-full bg-black text-white flex flex-col items-center justify-center font-sans tracking-widest p-4 z-50">
         <div className="mb-6 text-white">
           <svg viewBox="0 0 16 16" fill="currentColor" className="w-16 h-16 sm:w-24 sm:h-24" shapeRendering="crispEdges">
             <rect x="5" y="2" width="5" height="1" />
             <rect x="4" y="3" width="7" height="1" />
             <rect x="3" y="4" width="2" height="1" />
             <rect x="6" y="4" width="6" height="1" />
             <rect x="3" y="5" width="9" height="1" />
             <rect x="12" y="5" width="2" height="1" />
             <rect x="2" y="6" width="10" height="1" />
             <rect x="12" y="6" width="3" height="1" />
             <rect x="2" y="7" width="11" height="1" />
             <rect x="2" y="8" width="10" height="1" />
             <rect x="3" y="9" width="8" height="1" />
             <rect x="4" y="10" width="7" height="1" />
             <rect x="6" y="11" width="1" height="2" />
             <rect x="8" y="11" width="1" height="2" />
             <rect x="5" y="13" width="2" height="1" />
             <rect x="7" y="13" width="2" height="1" />
           </svg>
         </div>
         <div className="text-3xl mb-4 text-center">Welcome to Sigeon OS 1.01.</div>
         <div className="text-xl text-[#55ff55] h-8 mt-4">
           {bootStage === 0 && "Loading KERNEL.PEX..."}
           {bootStage === 1 && "Loading SYSTEM.INI..."}
           {bootStage === 2 && "Loading WIN.INI..."}
           {bootStage === 3 && "Loading MS-PEX Executive..."}
           {bootStage === 4 && "Starting Desktop..."}
         </div>
      </div>
    );
  }

  if (setupMode) {
    return (
      <div className="absolute inset-0 w-full h-full bg-[#0000aa] text-white flex flex-col items-center justify-center font-sans tracking-widest p-4 z-50 text-center">
        <h1 className="text-2xl mb-8 border-b-2 border-white pb-2">SIGEON OS SETUP</h1>
        <p className="mb-4">Please enter a name for this computer:</p>
        <input 
          type="text" 
          value={pcName}
          onChange={e => setPcName(e.target.value)}
          className="bg-black text-white border-2 border-white p-2 outline-none text-center mb-8 w-64 max-w-full"
          maxLength={15}
          autoFocus
        />
        <button 
          className="bg-gray-300 text-black px-6 py-2 border-2 border-black active:bg-gray-500 font-bold hover:bg-white"
          onClick={() => {
            if (pcName.trim()) {
              localStorage.setItem('sigeon_pc_name', pcName.trim());
              setPcName(pcName.trim());
              setSetupMode(false);
            }
          }}
        >
          CONTINUE
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative" onPointerDown={() => setOsState(p => ({...p, activeWindowId: null}))}>
      {osState.windows.map(win => (
        <SigeonWindow 
          key={win.id} 
          windowState={win} 
          isActive={osState.activeWindowId === win.id}
          bringToFront={() => bringToFront(win.id)}
          closeWindow={() => handleCloseRequest(win.id)}
          updateWindow={(updates) => updateWindow(win.id, updates)}
        >
          {win.appId === 'explorer' && <MSpexExecutive files={files} openFile={openFile} deleteFile={handleDeleteFile} onShutdown={handleShutdown} onRestart={handleRestart} pcName={pcName} />}
          {win.appId === 'calc' && <Calculator />}
          {win.appId === 'paint' && <Paint />}
          {win.appId === 'notepad' && (
            <Notepad 
              content={win.props?.content} 
              filename={win.props?.filename} 
              saveFile={(filename, content) => saveFile(filename, content, win.id)}
              onChange={(text) => updateWindow(win.id, { props: { ...win.props, content: text } })}
              onRequestSaveAs={(text, ext, callback) => handleRequestSaveAs(win.id, text, ext, callback)}
            />
          )}
          {win.appId === 'wordpad' && (
            <Notepad 
              isWordpad 
              content={win.props?.content} 
              filename={win.props?.filename} 
              saveFile={(filename, content) => saveFile(filename, content, win.id)}
              onChange={(text) => updateWindow(win.id, { props: { ...win.props, content: text } })}
              onRequestSaveAs={(text, ext, callback) => handleRequestSaveAs(win.id, text, ext, callback)}
            />
          )}
          {win.appId === 'terminal' && <Terminal pcName={pcName} triggerBsod={triggerBsod} />}
          {win.appId === 'clock' && <ClockApp />}
          {win.appId === 'settings' && <SettingsApp pcName={pcName} setPcName={(name) => { setPcName(name); localStorage.setItem('sigeon_pc_name', name); }} />}
        </SigeonWindow>
      ))}
      
      {/* Minimized icons area could go at the bottom, but Windows 1.0 put them as little boxes at the bottom of the screen */}
      <div className="absolute bottom-0 left-0 right-0 flex gap-2 p-1 bg-[#55ff55]">
         {/* Render minimized windows here if we implemented minimization */}
      </div>

      {/* Save As Dialog */}
      <SaveAsDialog 
        isOpen={saveDialog !== null}
        pcName={pcName}
        defaultAppId={saveDialog?.defaultAppId || 'notepad'}
        existingFiles={files}
        onSave={(savedName) => {
          if (saveDialog?.callback) {
            saveDialog.callback(savedName);
          }
          setSaveDialog(null);
        }}
        onCancel={() => setSaveDialog(null)}
      />

      {/* Confirm Dialog */}
      <ConfirmDialog 
        isOpen={confirmDialog !== null}
        title={confirmDialog?.title || 'Notepad'}
        message={confirmDialog?.message || ''}
        onYes={confirmDialog?.onYes || (() => {})}
        onNo={confirmDialog?.onNo || (() => {})}
        onCancel={confirmDialog?.onCancel || (() => {})}
      />
    </div>
  );
}
