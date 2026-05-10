import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { AuthService } from './src/modules/auth/auth.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const authService = app.get(AuthService);

  console.log('--- Iniciando Seed de Usuarios en Firebase Real ---');

  try {
    await authService.register({
      email: 'admin@mindrefresh.com',
      password: 'Admin123Active!',
      name: 'Gerente Bienestar',
      role: 'admin'
    });
    console.log('✅ Usuario Administrador creado: admin@mindrefresh.com');

    await authService.register({
      email: 'user@mindrefresh.com',
      password: 'User123Active!',
      name: 'Colaborador Demo',
      role: 'colaborador'
    });
    console.log('✅ Usuario Colaborador creado: user@mindrefresh.com');

  } catch (error) {
    console.log('⚠️ Los usuarios ya existen en Firestore o hubo un error.');
  }

  await app.close();
  console.log('--- Seed Finalizado ---');
}
bootstrap();
