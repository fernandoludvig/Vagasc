import { PrismaClient, UserRole, SpaceType, VehicleType, SpaceAmenity } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuários de exemplo
  const hashedPassword = await bcrypt.hash('123456', 12);

  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: 'admin@vagasc.com' },
      update: {},
      create: {
        email: 'admin@vagasc.com',
        name: 'Admin VagaSC',
        password: hashedPassword,
        role: UserRole.ADMIN,
        isVerified: true,
        phone: '+55 48 99999-9999',
      },
    }),
    prisma.user.upsert({
      where: { email: 'proprietario@vagasc.com' },
      update: {},
      create: {
        email: 'proprietario@vagasc.com',
        name: 'Maria Silva',
        password: hashedPassword,
        role: UserRole.HOST,
        isVerified: true,
        phone: '+55 48 99999-8888',
      },
    }),
    prisma.user.upsert({
      where: { email: 'usuario@vagasc.com' },
      update: {},
      create: {
        email: 'usuario@vagasc.com',
        name: 'João Santos',
        password: hashedPassword,
        role: UserRole.CLIENT,
        isVerified: true,
        phone: '+55 48 99999-7777',
      },
    }),
  ]);

  console.log('✅ Usuários criados:', users.length);

  // Criar vagas de exemplo em Florianópolis
  const spaces = await Promise.all([
    prisma.parkingSpace.create({
      data: {
        title: 'Vaga no Centro - Próximo ao Mercado Público',
        description: 'Vaga coberta e segura no centro de Florianópolis, ideal para quem trabalha na região.',
        address: 'Rua Felipe Schmidt, 200, Centro, Florianópolis - SC',
        latitude: -27.5954,
        longitude: -48.5480,
        pricePerHour: 5.00,
        pricePerDay: 25.00,
        spaceType: SpaceType.COMMERCIAL,
        vehicleTypes: [VehicleType.CAR, VehicleType.MOTORCYCLE],
        amenities: [SpaceAmenity.COVERED, SpaceAmenity.SECURITY_CAMERA, SpaceAmenity.LIGHTING],
        instructions: 'Vaga coberta no térreo do prédio. Use o código de acesso fornecido.',
        ownerId: users[1].id, // Maria Silva
        isActive: true,
        autoApprove: true,
      },
    }),
    prisma.parkingSpace.create({
      data: {
        title: 'Vaga na Lagoa da Conceição',
        description: 'Vaga descoberta com fácil acesso, próxima à Lagoa da Conceição.',
        address: 'Rua das Rendeiras, 150, Lagoa da Conceição, Florianópolis - SC',
        latitude: -27.6000,
        longitude: -48.4500,
        pricePerHour: 8.00,
        pricePerDay: 40.00,
        spaceType: SpaceType.RESIDENTIAL,
        vehicleTypes: [VehicleType.CAR, VehicleType.MOTORCYCLE, VehicleType.VAN],
        amenities: [SpaceAmenity.LIGHTING, SpaceAmenity.GATED],
        instructions: 'Vaga na frente da casa. Portão automático com controle remoto.',
        ownerId: users[1].id, // Maria Silva
        isActive: true,
        autoApprove: false,
      },
    }),
    prisma.parkingSpace.create({
      data: {
        title: 'Vaga em Canasvieiras - Próximo à Praia',
        description: 'Vaga ideal para quem vai à praia de Canasvieiras. Apenas 2 quadras da areia.',
        address: 'Rua das Flores, 300, Canasvieiras, Florianópolis - SC',
        latitude: -27.4300,
        longitude: -48.4500,
        pricePerHour: 10.00,
        pricePerDay: 50.00,
        spaceType: SpaceType.RESIDENTIAL,
        vehicleTypes: [VehicleType.CAR, VehicleType.MOTORCYCLE],
        amenities: [SpaceAmenity.COVERED, SpaceAmenity.SECURITY_CAMERA],
        instructions: 'Vaga coberta no quintal. Acesso pela lateral da casa.',
        ownerId: users[1].id, // Maria Silva
        isActive: true,
        autoApprove: true,
      },
    }),
    prisma.parkingSpace.create({
      data: {
        title: 'Vaga no Aeroporto - Estacionamento Seguro',
        description: 'Vaga segura para deixar o carro durante viagens. Próximo ao aeroporto.',
        address: 'Rua do Aeroporto, 100, Carianos, Florianópolis - SC',
        latitude: -27.6700,
        longitude: -48.5500,
        pricePerHour: 3.00,
        pricePerDay: 20.00,
        spaceType: SpaceType.COMMERCIAL,
        vehicleTypes: [VehicleType.CAR, VehicleType.MOTORCYCLE, VehicleType.VAN],
        amenities: [SpaceAmenity.COVERED, SpaceAmenity.SECURITY_CAMERA, SpaceAmenity.LIGHTING, SpaceAmenity.GATED],
        instructions: 'Vaga em estacionamento comercial com segurança 24h.',
        ownerId: users[1].id, // Maria Silva
        isActive: true,
        autoApprove: true,
      },
    }),
  ]);

  console.log('✅ Vagas criadas:', spaces.length);

  // Criar algumas reservas de exemplo
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        spaceId: spaces[0].id,
        userId: users[2].id, // João Santos
        startDateTime: new Date('2024-01-15T09:00:00Z'),
        endDateTime: new Date('2024-01-15T17:00:00Z'),
        totalAmount: 40.00,
        platformFee: 4.00,
        ownerAmount: 36.00,
        status: 'COMPLETED',
        accessCode: '1234',
        paymentStatus: 'PAID',
      },
    }),
    prisma.booking.create({
      data: {
        spaceId: spaces[1].id,
        userId: users[2].id, // João Santos
        startDateTime: new Date('2024-01-20T14:00:00Z'),
        endDateTime: new Date('2024-01-20T18:00:00Z'),
        totalAmount: 32.00,
        platformFee: 3.20,
        ownerAmount: 28.80,
        status: 'CONFIRMED',
        accessCode: '5678',
        paymentStatus: 'PAID',
      },
    }),
  ]);

  console.log('✅ Reservas criadas:', bookings.length);

  // Criar algumas avaliações
  const reviews = await Promise.all([
    prisma.review.create({
      data: {
        bookingId: bookings[0].id,
        spaceId: spaces[0].id,
        authorId: users[2].id, // João Santos
        targetId: users[1].id, // Maria Silva
        rating: 5,
        comment: 'Excelente vaga! Muito bem localizada e segura. Recomendo!',
        type: 'SPACE_REVIEW',
      },
    }),
    prisma.review.create({
      data: {
        bookingId: bookings[1].id,
        spaceId: spaces[1].id,
        authorId: users[1].id, // Maria Silva
        targetId: users[2].id, // João Santos
        rating: 5,
        comment: 'Usuário muito educado e pontual. Recomendo!',
        type: 'USER_REVIEW',
      },
    }),
  ]);

  console.log('✅ Avaliações criadas:', reviews.length);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('\n📊 Resumo:');
  console.log(`- ${users.length} usuários criados`);
  console.log(`- ${spaces.length} vagas criadas`);
  console.log(`- ${bookings.length} reservas criadas`);
  console.log(`- ${reviews.length} avaliações criadas`);
  
  console.log('\n🔑 Credenciais de teste:');
  console.log('Admin: admin@vagasc.com / 123456');
  console.log('Proprietário: proprietario@vagasc.com / 123456');
  console.log('Usuário: usuario@vagasc.com / 123456');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
