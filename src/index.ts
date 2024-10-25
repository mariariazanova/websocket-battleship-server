import { httpServer } from './http_server';
import './ws_server';

const HTTP_PORT = 8181;

httpServer.listen(HTTP_PORT);

httpServer.on('listening', () => {
    console.log(`HTTP server is running on port ${HTTP_PORT}`);
});

httpServer.on('error', (err) => {
    const error = err as NodeJS.ErrnoException;
    console.log(error);
    if (error?.code === 'EADDRINUSE') {
        console.error(`Port ${HTTP_PORT} is already in use. Trying an alternative port...`);
        const alternativePort = parseInt(HTTP_PORT.toString()) + 1; // Use an alternative port
        httpServer.listen(alternativePort);
        console.log(`Server is now running on port ${alternativePort}`);
    } else {
        console.error(`Error occurred: ${error.message}`);
        process.exit(1); // Exit if it’s a different kind of error
    }
});
