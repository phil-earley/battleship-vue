![ss-bw.jpg](https://github.com/phil-earley/battleship-vue-sockets/blob/master/screenshots/battleship-vue-sockets.png?raw=true)  

# phil-vue-battleship

Run via localhost:8080, and socket.io running on 3000 (npm start) will handle data accordingly.

## Todos:
- ✅ validate battlle message system  
- ✅ validate data stores valid  
- ✅ bind classes -> graphics on player tile  
- bind enter button keyboard listener  
- ✅ fix share text for non host... they can't really share  
- ✅ display better ghost on selected ship  
- sockets.js -> move syntax to more maps  
- vue -> break down more atomically  
- general cleanup & refactoring
- validate screen resolutions & gameplay errors

## Build Setup

``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report
```

## Run the Express/Socket.io Server  
``` bash  
# start express/socket.io/nedb
npm start
```


### Game instructions are as follows: ###
1.  ✅ Two players  
2.  ✅ Two boards (one for each player) 
3.  ✅ A board is a 8x8 grid for a total of 64 units 
4.  ✅ Each player has two or more ships that are a minimum of 3 grid units in length 
5.  ✅A ship can be considered to be composed of multiple parts. One for each grid unit 
6.  ✅Each player will place the ship(s) on the board either vertically or horizontally 
7.  ✅Players will take turns firing at their opponents ship 
8.  ✅A hit is when a ship part is in a grid unit that a player fires at 
9.  ✅A ship is sunk when all three parts have been hit 
10. ✅Grid units are specified by column and row 
11. ✅Columns are labeled A to H 
12. ✅Rows are labeled 1 to 8 
13. ✅The player grid should be displayed 

### Additional: ###
- ✅The minimum requirement is 2 ships, but you get bonus points for supporting up to 5 ships of various lengths maximum length 6 . 
- ✅Players should be able to communicate with each other . 
- ✅There should be some sort of log of actions taken by both players **[ ... ]  
    
    
For a detailed explanation on how things work, check out the [guide](http://vuejs-templates.github.io/webpack/) and [docs for vue-loader](http://vuejs.github.io/vue-loader).
