const winston = require('winston');

// Configurar o logger
const logger = winston.createLogger({
    level: 'info',  // Define o nível mínimo de log
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ timestamp, level, message }) => {
        return `${timestamp} ${level}: ${message}`;
      })
    ),
    transports: [
      // Transporte de arquivo para log
      new winston.transports.File({ 
        filename: 'app.log', 
        options: { flags: 'a' },  // Garantir que o arquivo é aberto no modo 'append' (não substitui)
        level: 'info',            // Nível de log
        format: winston.format.json(), // Formato do log
        handleExceptions: true  // Não interrompe a aplicação se um erro ocorrer ao escrever o log
      }),
      // Transporte de console para log (assíncrono)
      new winston.transports.Console({ 
        format: winston.format.simple(),
        handleExceptions: true // Não interrompe a aplicação no caso de erro de log
      })
    ],
    exitOnError: false  // Garante que a aplicação não termine caso um erro de log ocorra
  });


module.exports = {logger};
