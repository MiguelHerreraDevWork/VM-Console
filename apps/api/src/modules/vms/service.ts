import { Prisma } from '@prisma/client';
import { vmNameKey, type Vm, type VmWrite } from '@repo/contracts';

import { prisma } from '../../db.js';
import { HttpError } from '../../lib/http-error.js';
import { afterVmUpdate } from './hooks.js';
import { toVmDto } from './mapper.js';

function mapPrismaError(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      throw new HttpError('VM_NAME_TAKEN', 'Ya existe una VM con ese nombre', {
        field: 'name',
      });
    }
    if (error.code === 'P2025') {
      throw new HttpError('VM_NOT_FOUND', 'VM no encontrada');
    }
  }
  throw error;
}

export async function listVms(): Promise<{ items: Vm[] }> {
  const rows = await prisma.vm.findMany({
    orderBy: { createdAt: 'desc' },
  });
  return { items: rows.map(toVmDto) };
}

export async function createVm(input: VmWrite): Promise<Vm> {
  const nameKey = vmNameKey(input.name);
  try {
    const row = await prisma.vm.create({
      data: {
        name: input.name,
        nameKey,
        cores: input.cores,
        ram: input.ram,
        disk: input.disk,
        os: input.os,
        status: input.status,
      },
    });
    return toVmDto(row);
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function updateVm(id: string, input: VmWrite): Promise<Vm> {
  const previousRow = await prisma.vm.findUnique({ where: { id } });
  if (!previousRow) {
    throw new HttpError('VM_NOT_FOUND', 'VM no encontrada');
  }
  const previous = toVmDto(previousRow);
  const nameKey = vmNameKey(input.name);

  try {
    const row = await prisma.vm.update({
      where: { id },
      data: {
        name: input.name,
        nameKey,
        cores: input.cores,
        ram: input.ram,
        disk: input.disk,
        os: input.os,
        status: input.status,
      },
    });
    const updated = toVmDto(row);
    await afterVmUpdate(previous, updated);
    return updated;
  } catch (error) {
    mapPrismaError(error);
  }
}

export async function deleteVm(id: string): Promise<void> {
  try {
    await prisma.vm.delete({ where: { id } });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2025') {
      throw new HttpError('VM_NOT_FOUND', 'VM no encontrada');
    }
    mapPrismaError(error);
  }
}
