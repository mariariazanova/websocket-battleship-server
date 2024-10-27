import { Position, ShipState } from '../interfaces/ship';
import { shipsConfiguration } from '../constants/ships-configuration';

export function getRandomShips(): ShipState[] {
  const allPositions = [];

  for (let x = 0; x < 10; x += 1) {
    for (let y = 0; y < 10; y += 1) {
      allPositions.push({ x, y });
    }
  }

  const shuffledPositions = shuffleArray(allPositions);

  return findRandomShips(shuffledPositions);
}

export const canPlaceShip = (
  x: number,
  y: number,
  length: number,
  direction: boolean,
  field: boolean[][],
): boolean => {
  for (let i = 0; i < length; i += 1) {
    const shipX = x + (direction ? 0 : i);
    const shipY = y + (direction ? i : 0);

    if (shipX >= 10 || shipY >= 10 || field[shipX][shipY]) {
      return false;
    }
  }

  const checkOffsets = [-1, 0, 1];

  for (let i = 0; i < length; i += 1) {
    const shipX = x + (direction ? 0 : i);
    const shipY = y + (direction ? i : 0);

    // eslint-disable-next-line no-restricted-syntax
    for (const offsetX of checkOffsets) {
      // eslint-disable-next-line no-restricted-syntax
      for (const offsetY of checkOffsets) {
        const checkX = shipX + offsetX;
        const checkY = shipY + offsetY;

        if (
          !(offsetX === 0 && offsetY === 0) &&
          checkX >= 0 &&
          checkY >= 0 &&
          checkX < 10 &&
          checkY < 10
        ) {
          if (field[checkX][checkY]) {
            return false;
          }
        }
      }
    }
  }

  return true;
};

export const shuffleArray = <T>(array: T[]): T[] => {
  const arrayCopy = [...array];

  for (let i = arrayCopy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));

    [arrayCopy[i], arrayCopy[j]] = [arrayCopy[j], arrayCopy[i]];
  }

  return arrayCopy;
};

export const findRandomShips = (possiblePositions: Position[]): ShipState[] => {
  const ships: ShipState[] = [];
  const shipModel = shipsConfiguration;
  const field: boolean[][] = Array.from({ length: 10 }, () =>
    Array(10).fill(false),
  );

  shipModel.sort((a, b) => b.length - a.length);

  shipModel.forEach((shipModel) => {
    for (let k = 0; k < shipModel.count; k += 1) {
      let placed = false;

      const shuffledPositions = [...possiblePositions].sort(
        () => Math.random() - 0.5,
      );

      // eslint-disable-next-line no-restricted-syntax
      for (const pos of shuffledPositions) {
        const randomDirection = Math.random() < 0.5;

        if (
          canPlaceShip(pos.x, pos.y, shipModel.length, randomDirection, field)
        ) {
          placed = true;

          const remainingCells = new Set<string>();

          for (let i = 0; i < shipModel.length; i += 1) {
            const shipX = pos.x + (randomDirection ? 0 : i);
            const shipY = pos.y + (randomDirection ? i : 0);

            field[shipX][shipY] = true;
            remainingCells.add(`${shipX},${shipY}`);
          }

          const ship: ShipState = {
            length: shipModel.length,
            direction: randomDirection,
            position: pos,
            type: shipModel.type,
            remainingCells,
          };

          ships.push(ship);
          break;
        }
      }

      if (!placed) {
        // eslint-disable-next-line no-console
        console.warn(`Unable to place ${shipModel.type}. Moving on.`);
      }
    }
  });

  return ships;
};

// export const findRandomShips = (possiblePositions: { x, y }[]): any => {
//   const ships: ShipState[] = [];
//   const shipModels = shipsConfiguration;
//   const field: boolean[][] = Array.from({ length: 10 }, () => Array(10).fill(false));
//
//   shipModels.sort((a, b) => b.length - a.length);
//
//   shipModels.forEach(shipModel => {
//     for (let k = 0; k < shipModel.count; k++) {
//       let hasPosition = false;
//
//       for (const pos of possiblePositions) {
//         const randomDirection = Math.random() < 0.5;
//
//         if (canPlaceShip(pos.x, pos.y, shipModel.length, randomDirection, field)) {
//           hasPosition = true;
//
//           const remainingCells = new Set<string>();
//
//           for (let i = 0; i < shipModel.length; i++) {
//             const shipX = pos.x + (randomDirection ? 0 : i);
//             const shipY = pos.y + (randomDirection ? i : 0);
//
//             field[shipX][shipY] = true;
//             remainingCells.add(`${shipX},${shipY}`);
//           }
//
//           const ship: ShipState = {
//             length: shipModel.length,
//             direction: randomDirection,
//             position: pos,
//             type: shipModel.type,
//             remainingCells: remainingCells,
//           };
//
//           ships.push(ship);
//           break;
//         }
//       }
//
//       if (!hasPosition) {
//         console.warn(`Unable to place ${shipModel.type}. Moving on.`);
//         continue;
//       }
//     }
//   });
// }
