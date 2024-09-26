import { Commands } from '../enums/commands';
import { wsServer } from '../ws_server';
import { getCurrentUserName, getUserByIndex, getUserByName } from '../database/users-database';

export const createGame = (data: any, userId: number): void => {
    console.log("Creating game...");
    console.log(data);
    console.log(userId);
    const currentUserName = getCurrentUserName();
    const currentUser = getUserByName(currentUserName);

    // const getResponse = (index: number) => ({
    //     type: Commands.CREATE_GAME,
    //     data: JSON.stringify(
    //         {
    //             idGame: 1,
    //             idPlayer: currentUser.id, //getUserByIndex(index).id,
    //         }),
    //     id: 0,
    // });
    const response =  ({
        type: Commands.CREATE_GAME,
        data: JSON.stringify(
            {
                idGame: 1,
                idPlayer: currentUser.id, //getUserByIndex(index).id,
            }),
        id: 0,
    });


    let index = 0;

    wsServer.clients.forEach(client => {
        console.log(index);
        client.send(JSON.stringify(response));
        console.log('Response create_game: ', response, JSON.stringify(response));
        index++;
    });
};

export const addShips = (data: any): void => {
  // console.log(data);
  const { gameId, ships, indexPlayer } = JSON.parse(data);
  console.log(gameId);
  console.log(ships);
  console.log(indexPlayer);

  ships.push({
      userId: indexPlayer,
      ships,
  });
};
