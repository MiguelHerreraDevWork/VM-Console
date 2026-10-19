import { vmSchema, type Vm, type VmOs, type VmStatus } from '@repo/contracts';
import type { Vm as PrismaVm } from '@prisma/client';

export function toVmDto(row: PrismaVm): Vm {
  return vmSchema.parse({
    id: row.id,
    name: row.name,
    cores: row.cores,
    ram: row.ram,
    disk: row.disk,
    os: row.os as VmOs,
    status: row.status as VmStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  });
}
