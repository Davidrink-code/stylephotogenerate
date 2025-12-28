import { RetroStyle, StyleConfig } from './types';

export const STYLES: StyleConfig[] = [
  {
    id: RetroStyle.NOKIA,
    name: '诺基亚 3310',
    description: '经典的单色绿屏与抖动阴影效果，重现千禧年手机美学。',
    prompt: 'nokia style',
    iconName: 'smartphone',
    previewColor: 'emerald-500'
  },
  {
    id: RetroStyle.BW_CCD,
    name: '黑白 CCD',
    description: '早期数码相机的噪点、高对比度黑白质感，充满复古氛围。',
    prompt: 'ccd style',
    iconName: 'camera',
    previewColor: 'zinc-100'
  },
  {
    id: RetroStyle.GAMEBOY,
    name: '掌机 8-bit',
    description: '90年代经典的四色绿色调像素风格。',
    prompt: 'gameboy style',
    iconName: 'gamepad',
    previewColor: 'lime-500'
  },
  {
    id: RetroStyle.CRT,
    name: '电视故障风',
    description: '模拟旧电视的扫描线、噪点和色差故障效果。',
    prompt: 'crt style',
    iconName: 'tv',
    previewColor: 'pink-500'
  },
];