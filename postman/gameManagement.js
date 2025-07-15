// Create new game
// pre-request

const requestBody = {
  entryFee: "0.1",
  maxPlayers: 4,
};

pm.request.body.raw = JSON.stringify(requestBody, null, 2);

// post-response

pm.test("Status code is 200 or 302", function () {
  pm.expect(pm.response.code).to.be.oneOf([200, 302]);
});

const jsonData = pm.response.json();

// Handle redirect case
if (jsonData.redirectToGameId) {
  console.log("Redirect to existing game:", jsonData.redirectToGameId);
  pm.environment.set("GAME_ID", jsonData.redirectToGameId);
  pm.test("Redirected to existing game", function () {
    pm.expect(jsonData.success).to.eql(false);
    pm.expect(jsonData).to.have.property("redirectToGameId");
  });
} else {
  // Handle success case
  pm.test("Game created successfully", function () {
    pm.expect(jsonData.success).to.be.true;
    pm.expect(jsonData).to.have.property("game");
  });

  pm.test("Game has correct structure", function () {
    const game = jsonData.game;
    pm.expect(game).to.have.property("id");
    pm.expect(game).to.have.property("poolId");
    pm.expect(game).to.have.property("status");
    pm.expect(game).to.have.property("currentPlayers");
    pm.expect(game).to.have.property("maxPlayers");
    pm.expect(game).to.have.property("entryFee");
    pm.expect(game).to.have.property("prizePool");
  });

  pm.test("Game has correct initial values", function () {
    const game = jsonData.game;
    pm.expect(game.status).to.equal("WAITING");
    pm.expect(game.currentPlayers).to.equal(1);
    pm.expect(game.maxPlayers).to.equal(4);
    pm.expect(parseFloat(game.entryFee)).to.equal(0.1);
  });

  pm.test("Set game ID for future tests", function () {
    pm.environment.set("GAME_ID", jsonData.game.id);
    console.log("Game ID set:", jsonData.game.id);
    console.log("Pool ID:", jsonData.game.poolId);
  });
}

// List available games

pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has games array", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success");
  pm.expect(jsonData).to.have.property("games");
  pm.expect(jsonData.games).to.be.an("array");
});

pm.test("Games have correct structure", function () {
  const jsonData = pm.response.json();
  if (jsonData.games.length > 0) {
    const game = jsonData.games[0];
    pm.expect(game).to.have.property("id");
    pm.expect(game).to.have.property("poolId");
    pm.expect(game).to.have.property("status");
    pm.expect(game).to.have.property("currentPlayers");
    pm.expect(game).to.have.property("maxPlayers");
    pm.expect(game).to.have.property("participants");
    pm.expect(game.participants).to.be.an("array");
  }
});

pm.test("All games are waiting", function () {
  const jsonData = pm.response.json();
  jsonData.games.forEach((game) => {
    pm.expect(game.status).to.equal("WAITING");
    pm.expect(game.currentPlayers).to.be.lessThan(4);
  });
});
