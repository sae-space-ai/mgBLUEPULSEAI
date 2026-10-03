import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number, decimals = 2): string {
  return num.toFixed(decimals);
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getStatusColor(status: 'optimal' | 'warning' | 'critical'): string {
  switch (status) {
    case 'optimal': return 'text-emerald-400';
    case 'warning': return 'text-amber-400';
    case 'critical': return 'text-red-400';
  }
}

export function getStatusBg(status: 'optimal' | 'warning' | 'critical'): string {
  switch (status) {
    case 'optimal': return 'bg-emerald-400/10 border-emerald-400/30';
    case 'warning': return 'bg-amber-400/10 border-amber-400/30';
    case 'critical': return 'bg-red-400/10 border-red-400/30';
  }
}
