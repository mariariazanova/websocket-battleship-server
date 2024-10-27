import { httpServer } from './http_server';
import './ws_server';

const HTTP_PORT = 8181;

httpServer.listen(HTTP_PORT);

httpServer.on('listening', () => {
  // eslint-disable-next-line no-console
  console.log(`HTTP server is running on port ${HTTP_PORT}`);
});

httpServer.on('error', (err) => {
  const error = err as NodeJS.ErrnoException;

  if (error?.code === 'EADDRINUSE') {
    // eslint-disable-next-line no-console
    console.error(
      `Port ${HTTP_PORT} is already in use. Trying an alternative port...`,
    );

    const alternativePort = parseInt(HTTP_PORT.toString(), 10) + 1;

    httpServer.listen(alternativePort);
    // eslint-disable-next-line no-console
    console.log(`Server is now running on port ${alternativePort}`);
  } else {
    // eslint-disable-next-line no-console
    console.error(`Error occurred: ${error.message}`);

    process.exit(1);
  }
});
