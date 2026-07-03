export type AppId = 'calc' | 'paint' | 'notepad' | 'wordpad' | 'terminal' | 'explorer' | 'clock' | 'settings';

export interface WindowState {
  id: string;
  appId: AppId;
  title: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
  isMinimized: boolean;
  isMaximized: boolean;
  props?: any;
}

export interface FileItem {
  name: string;
  id?: AppId;
  content?: string;
  isSystem?: boolean;
}

export interface OSState {
  windows: WindowState[];
  activeWindowId: string | null;
  nextZIndex: number;
}
