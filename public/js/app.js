(function indexJS() {
    var gamesDB = new PouchDB('games'),
        games = gamesDB.allDocs({include_docs: true}),
        totalGames,
        /**
         * Get a random floating point number between `min` and `max`.
         *
         * @param {number} min - min number
         * @param {number} max - max number
         * @return {float} a random floating point number
         */
         getRandom = function getRandom(min, max) {
            return Math.random() * (max - min) + min;
         },
        /**
         * Get a random integer between `min` and `max`.
         *
         * @param {number} min - min number
         * @param {number} max - max number
         * @return {int} a random integer
         */
        getRandomInt = function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        },
        /**
         * Gets two players, and makes sure they are not equal to each other
         * @param totalPlayers
         * @returns {{playerOne: int, playerTwo: (int|*)}}
         */
        getPlayerIDs = function getPlayerID(totalPlayers) {
            if (!totalPlayers) {
                return false;
            }
            var playerOne = getRandomInt(1, totalPlayers),
                obj;
            do {
                playerTwo = getRandomInt(1, totalPlayers)
            } while (playerTwo === playerOne);

            obj = {
                playerOne: playerOne,
                playerTwo: playerTwo
            };
            return obj;
        },
        /**
         *
         * @param response
         * @returns {*}
         */
        getGames = function getGames(response) {
            totalGames = response.total_rows;
            $("#totalGames").html(totalGames);
            return response;
        },
        /**
         * Destroy the databases
         * @returns {*}
         */
        destroyDB = function destroyDBs() {
            return gamesDB.destroy();
        },
        /**
         *
         * @param response
         * @returns {boolean}
         */
        addFakeGames = function addFakeGames(response) {
            if (totalGames) {
                return false;
            }
            var newGames = 100,
                newPlayers = 10,
                i,
                winner = 0,
                gameWinner,
                gameObj = [],
                gamePlayers = {},
                playerArr = [],
                playerObj = {
                    id: null,
                    firstName: null,
                    lastName: null,
                    totalGames: null,
                    gamesWon: null,
                    gamesLost: null
                };
            for (i = 0; i < newPlayers; i += 1) {
                playerObj.firstName = Faker.Name.firstName();
                playerObj.lastName = Faker.Name.lastName();
                playerObj.totalGames = 0;
                playerObj.gamesWon = 0;
                playerObj.gamesLost = 0 ;
                playerObj.id += 1;
                playerArr.push(playerObj);
            }

            for (i = 0; i < newGames; i += 1) {
                debugger;
                gamePlayers = getPlayerIDs(playerObj.length);
                winner = getRandomInt(1, 2);
                playerArr[gamePlayers.playerOne].totalGames += 1;
                playerArr[gamePlayers.playerTwo].totalGames += 1;
                if (winner === 1) {
                    gameWinner = playerArr[gamePlayers.playerOne].id;
                    playerArr[gamePlayers.playerOne].gamesWon += 1;
                    playerArr[gamePlayers.playerTwo].gamesLost += 1;
                }
                if (winner === 2) {
                    gameWinner = playerArr[gamePlayers.playerTwo].id;
                    playerArr[gamePlayers.playerOne].gamesLost += 1;
                    playerArr[gamePlayers.playerTwo].gamesWon += 1;
                }

                gameObj.push({
                    playerOne: playerObj.id[gamePlayers.playerOne],
                    playerTwo: playerObj.id[gamePlayers.playerTwo],
                    winner: gameWinner,
                    gameDate: Faker.Date.recent(100)
                });
            }
            return gamesDB.put({
                _id: 'games',
                games: gameObj,
                players: playerObj
            });
        },
        getGamesWonAndLost = function getGamesWonAndLost(response) {
            gamesDB.query(function getDocs(doc) {
                emit(doc);
            }).then(function (res){
                console.log(res);
            });
        };


    // begin spinner loading
    games.then(getGames)
        .then(addFakeGames)
        .then(function () {
            // End spinner loading
            console.log("Finished loading");
        });
    window.destroyDB = destroyDB;
    window.gamesDB = gamesDB;

    Vue.component('pool-usercard', {
        template: '#userCards-template',
        computed: {

        },
        methods: {
            gamesWon: function (game) {

            }
        }
    });
    new Vue({
        el: '#mainApp'
    });
}());
