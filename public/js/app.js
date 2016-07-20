(function indexJS() {
    'use strict';
    // Todo:  Add a global setError, setSuccess, hideError, hideSuccess.
    /**
     *
     * @type {PouchDB}
     */
    var gamesDB = new PouchDB('games'),
        totalGames = 0,
        totalPlayers = 0,
        gamesObj,
        playersObj,
        rev,
        ignoreFunc = function ignoreFunc(ignore) {
            console.log(ignore);
            return Promise.resolve();
        },
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
         * @throws Error
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
            }).catch(function () {
                addFakeGames();
                return getPlayersAndGames();
            });
        },
        /**
         * This is an inefficient solution, but for demo purposes,
         * whenever a CRUD operation is performed on the database, this
         * will empty the DOM and repopulate it with the new values.
         */
        refreshAll = function refreshAll() {
            getPlayersAndGames()
                .then(function () {
                    $("#playerList").empty();
                    $("#gameList").empty();
                    return Promise.resolve();
                })
                .then(addUserTemplateToDom)
                .then(addGamesTemplateToDom)
                .catch(ignoreFunc);
        },
        /**
         * Mildly naive approach, you could use a filter and return each element
         * in the player position to get the largest of the data-ids.
         * @param e
         */
        addPlayer = function addPlayer(e) {
            e.preventDefault();
            var el = this,
                firstName = el.playerFirstName.value,
                lastName = el.playerLastName.value;
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
                    .then(refreshAll)
                    .then(function () {
                        $("#addNewPlayerModal").modal('hide');
                    })
                    .catch(ignoreFunc);
            }).catch(ignoreFunc);
        },
        /**
         * @param e
         */
        removePlayer = function removePlayer(e) {
            e.preventDefault();
            var removePlayer,
                id = Number($(this).closest('form').attr('data-id'));
            gamesDB.get('games').then(function (resp) {
                resp.players.forEach(function (value, index) {
                    if (Number(value.id) === id) {
                        removePlayer = index;
                    }
                });
                if (removePlayer != null) {
                    resp.players.splice(removePlayer, 1);
                }
                return gamesDB.put(resp)
                    .then(refreshAll)
                    .catch(function catchAndReload(err) {
                        refreshAll();
                        ignoreFunc(err);
                    });
            }).catch(ignoreFunc);
        },
        removeGame = function removeGame(e) {
            e.preventDefault();
            var $el = $(this).closest('form'),
                id = $el.attr('data-id'),
                winner = $el.find('.gameWinner').attr("data-id"),
                loser = $el.find('.gameLoser').attr("data-id"),
                removeGame;
            id = Number(id);
            winner = Number(winner);
            loser = Number(loser);
            gamesDB.get('games').then(function (resp) {
                resp.games.forEach(function (value, index) {
                    if (value.id === id) {
                        removeGame = index;
                    }
                });
                if (removeGame != null) {
                    resp.games.splice(removeGame, 1);
                }
                // Update to prevent error condition where user is deleted.
                if (resp.players[winner]) {
                    resp.players[winner].totalGames -= 1;
                    resp.players[winner].gamesWon -= 1;
                }
                if (resp.players[loser]) {
                    resp.players[loser].totalGames -= 1;
                    resp.players[loser].gamesLost -= 1;
                }
                return gamesDB.put(resp)
                    .then(refreshAll)
                    .catch(function catchAndReload(err) {
                        refreshAll();
                        ignoreFunc(err);
                    });
            }).catch(ignoreFunc);
        },
        /**
         * Destroy the databases
         * @returns {*}
         */
        destroyDB = function destroyDBs() {
            return gamesDB.destroy().then(function (res) {
                console.log("DB Destroyed");
            }).catch(ignoreFunc);
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
                    playerOne: playerOne.id,
                    playerTwo: playerTwo.id,
                    winner: gameWinner,
                    gameDate: faker.date.recent(100)
                });
            }
            return gamesDB.put({
                _id: 'games',
                games: gameArr,
                players: playerArr
            }).then(getPlayersAndGames).catch(ignoreFunc);
        },
        saveAddGame = function saveAddGame(e) {
            e.preventDefault();
            var el = this,
                playerOne = Number(el.playerOneSelect.value),
                playerTwo = Number(el.playerTwoSelect.value),
                winner = Number(el.winner.value),
                loser = winner === playerOne ? playerTwo : playerOne,
                gameDate = moment().toDate(this.gamePlayDate.value);
            if (playerOne === playerTwo) {
                alert("While it might help your ego, you cannot play a game against yourself and call yourself the winner");
                return false;
            }
            gamesDB.get('games').then(function (resp) {
                var len = resp.games.length - 1,
                    id = resp.games[len].id + 1,
                    game = {
                        id: id,
                        playerOne: playerOne,
                        playerTwo: playerTwo,
                        winner: winner,
                        gameDate: gameDate
                    };
                resp.players[playerOne].totalGames += 1;
                resp.players[playerTwo].totalGames += 1;
                resp.players[winner].gamesWon += 1;
                resp.players[loser].gamesLost += 1;

                resp.games.push(game);

                return gamesDB.put(resp)
                    .then(refreshAll)
                    .then(function () {
                        $("#newGameModal").modal('hide');
                    })
                    .catch(ignoreFunc);
            }).catch(ignoreFunc);

        },
        saveEditGame = function (e) {
            e.preventDefualt();

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
                return gamesDB.put(resp)
                    .then(refreshAll)
                    .then(function () {
                        $("#playerModal").modal('hide');
                    })
                    .catch(ignoreFunc);
            }).catch(ignoreFunc);
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
         * The default player is setup so that when a user gets deleted
         * and the game tries to look it up, it does not return an error.
         * @param id
         * @returns {{firstName: string, gamesLost: number, gamesWon: number, id: null, lastName: null, totalGames: number}}
         */
        getPlayerForID = function getPlayerForID(id) {
            var player = {
                firstName: "Unknown or Deleted",
                gamesLost: 0,
                gamesWon: 0,
                id: 'NaN',
                lastName: '',
                totalGames: 0
            };
            playersObj.forEach(function (value) {
                if (id === Number(value.id)) {
                    player = value;
                }
            });
            return player;
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
            if (obj) {
                if (obj.players) {
                    obj = obj.players;
                }
            } else {
                obj = playersObj;
            }
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
                    playerOne = getPlayerForID(value.playerOne),
                    playerTwo = getPlayerForID(value.playerTwo),
                    loser = playerOne.id === winner ? playerTwo.id : playerOne.id,
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
                clone.querySelector('.gameWinner').setAttribute('data-id', winner);
                clone.querySelector('.gameLoser').innerHTML = loserName;
                clone.querySelector('.gameLoser').setAttribute('data-id', loser);
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
            $("#addNewPlayerModal").modal('show');
        },
        toggleNewGame = function toggleNewGame(e) {
            changeWinner();
            $("#gamePlayDate").val(moment().format('YYYY-MM-DD'));
            $("#newGameModal").modal('show');
        },
        toggleEditGame = function toggleEditGame(e) {
            $("#editGameModal").modal('show');
            debugger;
            var $el = $(this).closest('.content');
            changeEditWinner($el);
        },
        changeWinner = function changeWinner() {
            var $playerOne = $("select[name='playerOneSelect']"),
                $playerTwo = $("select[name='playerTwoSelect']"),
                playerOneVal = $playerOne.val(),
                playerTwoVal = $playerTwo.val(),
                $winner = $("select[name='winner']"),
                optionOne,
                optionTwo;
            $winner.empty();
            optionOne = document.createElement('OPTION');
            optionTwo = document.createElement('OPTION');
            optionOne.value = playerOneVal;
            optionTwo.value = playerTwoVal;
            optionOne.innerHTML = $playerOne.find('option:selected').html();
            optionTwo.innerHTML = $playerTwo.find('option:selected').html();
            $winner.append(optionOne).append(optionTwo);
        };



    $('body').dimmer('show');
    // begin spinner loading
    gamesDB.then(getPlayersAndGames)
        .then(addUserTemplateToDom)
        .then(addGamesTemplateToDom)
        .then(function () {
            $('body').dimmer('hide');
        }).catch(function (ignore) {
            console.log(ignore);
            $('body').dimmer('hide');
        });
    window.destroyDB = destroyDB;
    window.gamesDB = gamesDB;
    window.getRandomInt = getRandomInt;
    window.getGamesWonAndLost = getGamesWonAndLost;

    /**
     * Todo:
     *
     */

    $("#toggleUsers").off('click').on('click', toggleUserVisibility);
    $("#toggleGames").off('click').on('click', toggleGameVisibility);
    $("#showAddPlayer").off('click').on('click', toggleNewPlayer);
    $("#showAddGame").off('click').on('click', toggleNewGame);
    $("#editPlayerForm").off('submit').on('submit', saveEditUser);
    $("#newGameForm").off('submit').on('submit', saveAddGame);
    $("#newPlayerForm").off('submit').on('submit', addPlayer);
    $(document)
        .off('click.editUser')
        .off('click.removeUser')
        .off('change.changePlayerOne')
        .off('change.changePlayerTwo')
        .off('click.deleteGame')
        .on('click.editUser', '.editUser', showPlayerModal)
        .on('click.deleteGame', '.deleteGame', removeGame)
        .on('change.changePlayer change.changePlayerTwo',
            '[name="playerOneSelect"], [name="playerTwoSelect"]', changeWinner)
        .on('click.removeUser', '.deleteUser', removePlayer);
}());
