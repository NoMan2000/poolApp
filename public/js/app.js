(function indexJS() {
    'use strict';
    var gamesDB = new PouchDB('games'),
        totalGames = 0,
        totalPlayers = 0,
        games = gamesDB.allDocs({include_docs: true}),
        gamesObj,
        playersObj,
        rev,
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
            totalPlayers -= 1;
            var playerOne = getRandomInt(0, totalPlayers),
                playerTwo,
                obj;
            do {
                playerTwo = getRandomInt(0, totalPlayers);
            } while (playerTwo === playerOne);

            obj = {
                playerOne: playerOne,
                playerTwo: playerTwo
            };
            return obj;
        },

        /**
         *
         * @returns {*}
         */
        getPlayersAndGames = function getPlayersAndGames() {
            return gamesDB.get('games').then(function (resp) {
                playersObj = resp.players;
                gamesObj = resp.games;
                rev = resp._rev;
                if (gamesObj) {
                    totalGames = gamesObj.length;
                    $("#totalGames").html(totalGames);
                }
                if (playersObj) {
                    totalPlayers = playersObj.length;
                    $("#totalPlayers").html(totalPlayers);
                }
                return resp;
            });
        },
        /**
         * This is an inefficient solution, but for demo purposes,
         * whenever a CRUD operation is performed on the database, this
         * will empty the DOM and repopulate it with the new values.
         */
        refreshAll = function refreshAll() {
            getPlayersAndGames().then(function (resp) {
                $("#playerList").empty();
                $("#gameList").empty();
            }).then(addUserTemplateToDom).then(addGamesTemplateToDom);
        },
        /**
         * Mildly naive approach, you could use a filter and return each element
         * in the player position to get the largest of the data-ids.
         * @param e
         */
        addPlayer = function addPlayer(e) {
            e.preventDefault();
            var firstName = e.firstName,
                lastName = e.lastName;
            gamesDB.get('games').then(function (resp) {
                var len = resp.players.length - 1,
                    id = resp.players[len].id + 1,
                    player = {
                        id: id,
                        firstName: firstName,
                        lastName: lastName,
                        totalGames: 0,
                        gamesWon: 0,
                        gamesLost: 0
                    };
                resp.players.push(player);

                return gamesDB.put(resp)
                    .then(refreshAll);
            });
        },
        /**
         * Pass in the data-id and remove the player by that value
         * @param id
         */
        removePlayer = function removePlayer(e) {
            e.preventDefault();
            var removePlayer;
            // var id = Number(id);
            gamesDB.get('games').then(function (resp) {
                resp.players.forEach(function (value, index) {
                    if (value.id === id) {
                        removePlayer = index;
                    }
                });
                if (removePlayer != null) {
                    resp.players.slice(removePlayer, 1);
                }
                return gamesDB.put(resp).then(refreshAll);;
            });
        },
        removeGame = function removeGame(id) {
            var removeGame;
            id = Number(id);
            gamesDB.get('games').then(function (resp) {
                resp.games.forEach(function (value, index) {
                    if (value.id === id) {
                        removeGame = index;
                    }
                });
                if (removeGame != null) {
                    resp.games.slice(removeGame, 1);
                }
                return gamesDB.put(resp).then(refreshAll);
            });
        },
        /**
         * Destroy the databases
         * @returns {*}
         */
        destroyDB = function destroyDBs() {
            return gamesDB.destroy().then(function (res) {
                console.log("DB Destroyed");
            });
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
                gameArr = [],
                gamePlayers = {},
                playerArr = [],
                playerOne,
                playerTwo;
            for (i = 0; i < newPlayers; i += 1) {
                playerArr.push({
                    id: i,
                    firstName: faker.name.firstName(),
                    lastName: faker.name.lastName(),
                    totalGames: 0,
                    gamesWon: 0,
                    gamesLost: 0
                });
            }

            for (i = 0; i < newGames; i += 1) {
                gamePlayers = getPlayerIDs(playerArr.length);
                winner = getRandomInt(1, 2);
                playerOne = playerArr[gamePlayers.playerOne];
                playerOne.totalGames += 1;
                playerTwo = playerArr[gamePlayers.playerTwo];
                playerTwo.totalGames += 1;
                if (winner === 1) {
                    gameWinner = playerOne.id;
                    playerOne.gamesWon += 1;
                    playerTwo.gamesLost += 1;
                }
                if (winner === 2) {
                    gameWinner = playerTwo.id;
                    playerOne.gamesLost += 1;
                    playerTwo.gamesWon += 1;
                }

                gameArr.push({
                    id: i,
                    playerOne: playerOne,
                    playerTwo: playerTwo,
                    winner: gameWinner,
                    gameDate: faker.date.recent(100)
                });
            }

            return gamesDB.put({
                _id: 'games',
                games: gameArr,
                players: playerArr
            });
        },
        saveEditUser = function saveEditUser(e) {
            e.preventDefault();
            var el = this,
                firstName = el.querySelector('input[name="editFirstName"]').value,
                lastName = el.querySelector('input[name="editLastName"]').value,
                playerIndex;
            return gamesDB.get('games').then(function (resp) {
                resp.players.forEach(function (value, index) {
                    if (value.id === Number(el.userID.value)) {
                        playerIndex = index;
                    }
                });
                if (playerIndex == null) {
                    return false;
                }
                resp.players[playerIndex].firstName = firstName;
                resp.players[playerIndex].lastName = lastName;
                return gamesDB.put(resp).then(refreshAll);
            });

        },
        showPlayerModal = function showPlayerModal(e) {
            e.preventDefault();
            var el = $(this).closest('form').get(0),
                userID = el.getAttribute('data-id'),
                firstName = el.userFirstName.value,
                lastName = el.userLastName.value;
            $("#playerModal").modal('show');
            $("#editFirstName").val(firstName);
            $("#editLastName").val(lastName);
            $("#userID").val(userID);


        },
        /**
         * @param obj
         * @returns {*}
         */
        addUserTemplateToDom = function addUserTemplateToDom(obj) {
            var template = document.getElementById('usercards-template'),
                appendTo = document.getElementById('playerList'),
                playerOneSelect = document.querySelector("select[name='playerOneSelect']"),
                playerTwoSelect =  document.querySelector("select[name='playerTwoSelect']"),
                clone;
            obj = obj || playersObj;
            obj.forEach(function createElement(value) {

                var createOption = document.createElement('OPTION');
                createOption.setAttribute('data-id', value.id);
                createOption.value = value.id;
                createOption.innerHTML = value.firstName + ' ' + value.lastName;
                var cloneOption = createOption.cloneNode(true);
                clone = document.importNode(template.content, true);
                clone.querySelector('#userFirstName').value = value.firstName;
                clone.querySelector("#userLastName").value = value.lastName;
                clone.querySelector('.card').setAttribute('data-id', value.id);
                clone.querySelector('.fullName').innerHTML = value.firstName + ' ' + value.lastName;
                clone.querySelector('.totalGames').innerHTML = value.totalGames;
                clone.querySelector('.gamesWon').innerHTML = value.gamesWon;
                clone.querySelector('.gamesLost').innerHTML = value.gamesLost;
                appendTo.appendChild(clone);
                playerOneSelect.appendChild(createOption);
                playerTwoSelect.appendChild(cloneOption);
            });

        },
        addGamesTemplateToDom = function addGamesTemplateToDom(obj) {
            var template = document.getElementById('gamescard-template'),
                appendTo = document.getElementById('gameList'),
                clone;
            obj = obj || gamesObj;

            obj.forEach(function createElement(value) {
                var gameDate = moment(value.gameDate).format("dddd, MMMM Do YYYY, h:mm:ss a"),
                    winner = value.winner,
                    playerOne = value.playerOne,
                    playerTwo = value.playerTwo,
                    winnerName,
                    loserName;
                if (playerOne.id === winner) {
                    winnerName = playerOne.firstName + ' ' + playerOne.lastName;
                    loserName = playerTwo.firstName + ' ' + playerTwo.lastName;
                } else {
                    winnerName = playerTwo.firstName + ' ' + playerTwo.lastName;
                    loserName = playerOne.firstName + ' ' + playerOne.lastName;
                }

                clone = document.importNode(template.content, true);
                clone.querySelector('.card').setAttribute('data-id', value.id);
                clone.querySelector('.gameDate').innerHTML = gameDate;

                clone.querySelector('.gameWinner').innerHTML = winnerName;
                clone.querySelector('.gameLoser').innerHTML = loserName;
                appendTo.appendChild(clone);
            });
            return obj;
        },
        getGamesWonAndLost = function getGamesWonAndLost(id) {
            if (!playersObj) {
                getPlayersAndGames();
            }
            if (!playersObj[id]) {
                return null;
            }
            return {
                gamesWon: playersObj[id].gamesWon,
                gamesLost: playersObj[id].gamesLost,
                totalGames: playersObj[id].totalGames,
                fullName: playersObj[id].firstName + " " + playersObj[id].lastName
            };
        },
        toggleUserVisibility = function toggleUserVisibility(e) {
            e.preventDefault();
            var clickToShow = "Click to show players",
                clickToHide = "Click to hide players",
                $showPlayerDesc = $("#showPlayerDesc"),
                $playerList = $("#playerList");
            $playerList.toggleClass('hide');
            if ($playerList.hasClass('hide')) {
                $showPlayerDesc.html(clickToShow);
            } else {
                $showPlayerDesc.html(clickToHide);
            }

        },
        toggleGameVisibility = function toggleGameVisibility(e) {
            e.preventDefault();
            var clickToShow = "Click to show games",
                clickToHide = "Click to hide games",
                $showGamesDesc = $("#showGamesDesc"),
                $gamesList = $("#gameList");
            $gamesList.toggleClass('hide');
            if ($gamesList.hasClass('hide')) {
                $showGamesDesc.html(clickToShow);
            } else {
                $showGamesDesc.html(clickToHide);
            }
        },
        toggleNewPlayer = function toggleNewPlayer(e) {
            $("#newPlayerForm").toggleClass('hide');
        },
        toggleNewGame = function toggleNewGame(e) {
            $("#newGameForm").toggleClass('hide');
        };



    // begin spinner loading
    games.then(getPlayersAndGames)
        .then(addFakeGames)
        .then(addUserTemplateToDom)
        .then(addGamesTemplateToDom)
        .then(function () {
            // End spinner loading
            console.log("Finished loading");
        });
    window.destroyDB = destroyDB;
    window.gamesDB = gamesDB;
    window.getRandomInt = getRandomInt;
    window.getGamesWonAndLost = getGamesWonAndLost;

    $("#toggleUsers").off('click').on('click', toggleUserVisibility);
    $("#toggleGames").off('click').on('click', toggleGameVisibility);
    $("#showAddPlayer").off('click').on('click', toggleNewPlayer);
    $("#showAddGame").off('click').on('click', toggleNewGame);
    $("#editPlayerForm").off('submit').on('submit', saveEditUser);
    $(document)
        .off('click.editUser')
        .on('click.editUser', '.editUser', showPlayerModal);
}());
