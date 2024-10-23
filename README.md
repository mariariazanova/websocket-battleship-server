# RSSchool NodeJS websocket task template
> Static http server and base task packages. 
> By default WebSocket client tries to connect to the 3000 port.

## Installation
1. Clone/download repo
2. `npm install`

## Usage
**Development**

`npm run start:dev`

* App served @ `http://localhost:8181` with nodemon

**Production**

`npm run start`

* App served @ `http://localhost:8181` without nodemon

---

**All commands**

Command | Description
--- | ---
`npm run start:dev` | App served @ `http://localhost:8181` with nodemon
`npm run start` | App served @ `http://localhost:8181` without nodemon

**Note**: replace `npm` with `yarn` in `package.json` if you use yarn.

## Notes
**2 players mode**

To check the game in 2 players mode, open link http://localhost:8181 in 2 browser tabs, 
log in as 2 different users and play from each side by turn. 

When the 1st user clicks on button 'Create room', it seems that nothing happens. In the reality a room is created, 
but it's not show on UI because it has just one player (the same player who has created it). Just go the 2nd user page
and you'll see already created room there. Join in by the 2nd user and you'll find a room with both users.

**Bot**

These rules are used to get random ships for bot:
The ships can only be placed vertically or horizontally. Diagonal placement is not allowed.
No part of a ship may go out of the board.  
Ships may not overlap each other.  No ships may be placed on another ship.
Ships can't touch each other. There should be at least one cell between all parts of all ships.

If bot shoots your ship, please wait for his next attack. Your turn is marked as 'Your turn'.