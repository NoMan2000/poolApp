(function indexJS() {
    var playerDB = new PouchDB('players'),
        players = playerDB.allDocs({include_docs: true}),
        totalPlayers,
        getPlayers = function getPlayers(response) {
            totalPlayers = response.total_rows;
            $("#totalPlayers").html(totalPlayers);
            return response;
        },
        addFakePlayers = function addFakePlayers(data) {
            console.log(data);
            if (totalPlayers) {
                return false;
            }
            var newPlayers = 10,
                i = 0;
            for (i; i < newPlayers; i += 1) {
                playerDB.put({
                    _id: 'player_' + i,
                    firstName: Faker.Name.firstName(),
                    lastName: Faker.Name.lastName(),
                    totalGames: 0
                });
            }

        };
    players
        .then(getPlayers)
        .then(addFakePlayers);
}());
