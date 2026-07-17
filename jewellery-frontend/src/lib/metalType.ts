import type { MetalType } from '@/types/api'

const METAL_TYPE_LABELS: Record<MetalType, string> = {
  GOLD_PLATED: 'Gold Plated',
  ROSE_GOLD_PLATED: 'Rose Gold Plated',
  SILVER_PLATED: 'Silver Plated',
  PLATINUM_PLATED: 'Platinum Plated',
  OXIDIZED: 'Oxidized',
  BRASS: 'Brass',
  OTHER: 'Other',
}

export function formatMetalType(value: string): string {
  return METAL_TYPE_LABELS[value as MetalType] ?? value.replaceAll('_', ' ')
}
