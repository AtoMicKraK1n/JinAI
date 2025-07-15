// User Login/Registration
pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Response has required fields", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success");
  pm.expect(jsonData).to.have.property("user");
  pm.expect(jsonData).to.have.property("token");
  pm.expect(jsonData.success).to.be.true;
});

pm.test("User object has correct structure", function () {
  const jsonData = pm.response.json();
  const user = jsonData.user;
  pm.expect(user).to.have.property("id");
  pm.expect(user).to.have.property("walletAddress");
  pm.expect(user).to.have.property("username");
  pm.expect(user).to.have.property("totalGamesPlayed");
  pm.expect(user).to.have.property("totalWins");
  pm.expect(user).to.have.property("totalEarnings");
});

// Verify Token
pm.test("Set environment variables", function () {
  const jsonData = pm.response.json();
  if (jsonData.success) {
    pm.environment.set("JWT_TOKEN", jsonData.token);
    pm.environment.set("USER_ID", jsonData.user.id);
    console.log("Token set:", jsonData.token.substring(0, 20) + "...");
    console.log("User ID set:", jsonData.user.id);
  }
});

pm.test("Status code is 200", function () {
  pm.response.to.have.status(200);
});

pm.test("Token is valid", function () {
  const jsonData = pm.response.json();
  pm.expect(jsonData).to.have.property("success");
  pm.expect(jsonData.success).to.be.true;
});

pm.test("User data matches", function () {
  const jsonData = pm.response.json();
  const user = jsonData.user;
  pm.expect(user.id).to.equal(pm.environment.get("USER_ID"));
  pm.expect(user.walletAddress).to.equal(pm.environment.get("WALLET_ADDRESS"));
});
