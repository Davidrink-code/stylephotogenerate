export enum RetroStyle {
  NOKIA = 'NOKIA',
  BW_CCD = 'BW_CCD',
  GAMEBOY = 'GAMEBOY',
  CRT = 'CRT',
}

export interface StyleConfig {
  id: RetroStyle;
  name: string;
  description: string;
  prompt: string;
  iconName: string; // Mapping to Lucide icons string name conceptually
  previewColor: string;
}

export interface ImageState {
  original: string | null; // base64
  processed: string | null; // base64
  mimeType: string;
}

export interface ProcessingSettings {
  style: RetroStyle;
  outputWidth: number;
  outputHeight: number;
  maintainAspectRatio: boolean;
  intensity: 'low' | 'medium' | 'high';
}
