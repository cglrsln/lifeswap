import type { ComponentRef, RefObject } from 'react';
import { Platform, Share, type View } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import type { RunSummary } from '@/engine/types';

export function shareMessage(summary: RunSummary): string {
  return [
    `I lived a life as a ${summary.careerName.toLowerCase()} in Lifeswap.`,
    `${summary.endingTitle} · age ${summary.age} · happiness ${summary.happiness}`,
    "Live a thousand lives you'd never get to try.",
  ].join('\n');
}

export async function shareRecapCard(
  ref: RefObject<ComponentRef<typeof View> | null>,
  summary: RunSummary,
): Promise<'shared' | 'saved' | 'text'> {
  const message = shareMessage(summary);
  if (!ref.current) {
    await Share.share({ message });
    return 'text';
  }
  const target = ref.current as never;
  if (Platform.OS === 'web') {
    const dataUrl = await captureRef(target, { format: 'png', quality: 1, result: 'data-uri' });
    return shareWebImage(dataUrl, message);
  }
  const uri = await captureRef(target, { format: 'png', quality: 1, result: 'tmpfile', fileName: 'lifeswap-life' });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'image/png',
      dialogTitle: 'Share this life',
      UTI: 'public.png',
    });
    return 'shared';
  }
  await Share.share({ message, url: uri });
  return 'shared';
}

async function shareWebImage(dataUrl: string, message: string): Promise<'shared' | 'saved' | 'text'> {
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const file = new File([blob], 'lifeswap-life.png', { type: 'image/png' });
  const nav = typeof navigator !== 'undefined' ? navigator : undefined;
  if (nav?.canShare?.({ files: [file] }) && nav.share) {
    await nav.share({ files: [file], title: 'Lifeswap', text: message });
    return 'shared';
  }
  if (typeof document !== 'undefined') {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'lifeswap-life.png';
    link.click();
    URL.revokeObjectURL(url);
    return 'saved';
  }
  await Share.share({ message });
  return 'text';
}
