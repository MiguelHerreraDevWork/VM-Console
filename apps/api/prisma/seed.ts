import { PrismaClient, type VmStatus } from '@prisma/client';
import { vmInputSchema, vmNameKey, type VmInput } from '@repo/contracts';

import { hashPassword } from '../src/auth/password.js';
import { getConfig } from '../src/config.js';

const prisma = new PrismaClient();

const seedVms: VmInput[] = [
  { name: 'web-frontend-01', cores: 2, ram: 4, disk: 40, os: 'Ubuntu', status: 'ON' },
  { name: 'web-frontend-02', cores: 2, ram: 4, disk: 40, os: 'Debian', status: 'ON' },
  { name: 'api-gateway-01', cores: 4, ram: 8, disk: 80, os: 'Ubuntu', status: 'ON' },
  { name: 'db-primary-01', cores: 8, ram: 32, disk: 500, os: 'Rocky Linux', status: 'ON' },
  { name: 'cache-redis-01', cores: 2, ram: 8, disk: 40, os: 'Debian', status: 'OFF' },
  { name: 'batch-worker-01', cores: 4, ram: 16, disk: 120, os: 'Ubuntu', status: 'OFF' },
  { name: 'monitor-01', cores: 2, ram: 4, disk: 60, os: 'Rocky Linux', status: 'ON' },
  { name: 'legacy-windows-01', cores: 4, ram: 16, disk: 200, os: 'Windows Server', status: 'OFF' },
  { name: 'Ñandú staging', cores: 2, ram: 4, disk: 50, os: 'Ubuntu', status: 'OFF' },
  { name: 'lab-qa-01', cores: 2, ram: 8, disk: 100, os: 'Debian', status: 'ON' },
  { name: 'backup-cold-01', cores: 1, ram: 2, disk: 1000, os: 'Rocky Linux', status: 'OFF' },
  { name: 'ci-runner-01', cores: 8, ram: 16, disk: 200, os: 'Ubuntu', status: 'ON' },
];

async function upsertUser(input: {
  email: string;
  password: string;
  role: 'ADMIN' | 'CLIENT';
}) {
  const passwordHash = await hashPassword(input.password);
  return prisma.user.upsert({
    where: { email: input.email },
    update: {
      passwordHash,
      role: input.role,
    },
    create: {
      email: input.email,
      passwordHash,
      role: input.role,
    },
  });
}

async function upsertVm(raw: VmInput) {
  const vm = vmInputSchema.parse(raw);
  const nameKey = vmNameKey(vm.name);

  return prisma.vm.upsert({
    where: { nameKey },
    update: {
      name: vm.name,
      cores: vm.cores,
      ram: vm.ram,
      disk: vm.disk,
      os: vm.os,
      status: vm.status as VmStatus,
    },
    create: {
      name: vm.name,
      nameKey,
      cores: vm.cores,
      ram: vm.ram,
      disk: vm.disk,
      os: vm.os,
      status: vm.status as VmStatus,
    },
  });
}

async function main() {
  const config = getConfig();

  await upsertUser({
    email: config.SEED_ADMIN_EMAIL,
    password: config.SEED_ADMIN_PASSWORD,
    role: 'ADMIN',
  });
  await upsertUser({
    email: config.SEED_CLIENT_EMAIL,
    password: config.SEED_CLIENT_PASSWORD,
    role: 'CLIENT',
  });

  for (const vm of seedVms) {
    await upsertVm(vm);
  }

  const [admins, clients, onVms, offVms, totalVms] = await Promise.all([
    prisma.user.count({ where: { role: 'ADMIN' } }),
    prisma.user.count({ where: { role: 'CLIENT' } }),
    prisma.vm.count({ where: { status: 'ON' } }),
    prisma.vm.count({ where: { status: 'OFF' } }),
    prisma.vm.count(),
  ]);

  console.log(
    JSON.stringify(
      {
        users: { ADMIN: admins, CLIENT: clients },
        vms: { total: totalVms, ON: onVms, OFF: offVms },
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
