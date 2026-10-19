import { Cpu, HardDrive, MemoryStick, type LucideIcon } from 'lucide-react';

export type Metric = 'cores' | 'ramGb' | 'diskGb';

export const metricMeta: Record<
  Metric,
  {
    label: string;
    /** Unidad corta junto a un total que ya lleva su etiqueta (pestañas, ejes). */
    unit: string;
    /** Unidad completa para valores sueltos, para que nunca sean ambiguos. */
    unitLong: string;
    /** Complemento del título del ranking: «Las 5 VMs encendidas con más …». */
    rankingNoun: string;
    icon: LucideIcon;
  }
> = {
  cores: { label: 'vCPU', unit: 'vCPU', unitLong: 'vCPU', rankingNoun: 'vCPU', icon: Cpu },
  ramGb: { label: 'RAM', unit: 'GB', unitLong: 'GB RAM', rankingNoun: 'RAM', icon: MemoryStick },
  diskGb: {
    label: 'Disco',
    unit: 'GB',
    unitLong: 'GB disco',
    rankingNoun: 'disco',
    icon: HardDrive,
  },
};

export const metricOrder: Metric[] = ['cores', 'ramGb', 'diskGb'];
