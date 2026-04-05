#!/usr/bin/env node

const { execSync } = require('child_process');

const command = process.argv[2];
const isProd = process.env.NODE_ENV === 'production';

const basePath = isProd ? 'dist' : 'src';
const fileExt = isProd ? 'js' : 'ts';
const executor = isProd ? 'node' : 'ts-node -r tsconfig-paths/register';

const dataSourcePath = `${basePath}/modules/shared/providers/database/implementations/postgres/postgres.database-connection.${fileExt}`;

const validCommands = ['show', 'run', 'revert', 'generate'];

if (!validCommands.includes(command)) {
  console.error(`❌ Comando inválido: ${command}`);
  console.error(`Comandos válidos: ${validCommands.join(', ')}`);
  process.exit(1);
}

try {
  const cmd = `${executor} ./node_modules/typeorm/cli.js migration:${command} -d ${dataSourcePath}`;
  console.log(`📍 NODE_ENV=${process.env.NODE_ENV || 'development'} → ${dataSourcePath}`);

  // Executar comando e capturar saída para tratamento de erro
  const result = execSync(cmd, {
    stdio: 'pipe', // Capturar stdout/stderr em vez de herdar
    encoding: 'utf8',
  });

  console.log(result);
} catch (error) {
  // Se o comando for 'run', tentar tratamento especial
  if (command === 'run') {
    const errorMessage = error.stderr || error.message || '';

    // Verificar se é erro de tabela já existente
    if (
      errorMessage.includes('duplicate key value violates unique constraint') ||
      errorMessage.includes('migrations_id_seq') ||
      errorMessage.includes('already exists') ||
      (errorMessage.includes('migrations') && errorMessage.includes('already exists'))
    ) {
      console.log('ℹ️  Tabela de migrações já existe. Verificando migrações pendentes...');

      try {
        // Verificar migrações pendentes
        const showCmd = `${executor} ./node_modules/typeorm/cli.js migration:show -d ${dataSourcePath}`;
        const showOutput = execSync(showCmd, { encoding: 'utf8', stdio: 'pipe' });

        console.log('📋 Status das migrações:');
        console.log(showOutput);

        // Verificar se há migrações pendentes ([ ] indica pendente)
        const hasPending = showOutput.includes('[ ]');

        if (!hasPending) {
          console.log('✅ Nenhuma migração pendente. Aplicação pode continuar.');
          process.exit(0);
        } else {
          console.log('⚠️  Há migrações pendentes. Tentando executar apenas as pendentes...');

          // Tentar executar apenas as migrações pendentes
          try {
            const runCmd = `${executor} ./node_modules/typeorm/cli.js migration:run -d ${dataSourcePath}`;
            const runResult = execSync(runCmd, { stdio: 'inherit' });
            console.log('✅ Migrações pendentes executadas com sucesso.');
            process.exit(0);
          } catch (runError) {
            console.log('❌ Falha ao executar migrações pendentes.');
            console.error(runError.message);
            process.exit(1);
          }
        }
      } catch (showError) {
        console.log('⚠️  Não foi possível verificar status das migrações.');
        console.log('🔄 Continuando sem verificar... (pode haver migrações pendentes)');
        process.exit(0);
      }
    }
  }

  // Para outros erros, mostrar e sair
  console.error('❌ Erro durante execução das migrações:');
  if (error.stdout) console.log(error.stdout);
  if (error.stderr) console.error(error.stderr);
  console.error(error.message);
  process.exit(1);
}
