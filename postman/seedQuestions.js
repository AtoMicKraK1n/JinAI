pm.test("Questions seeded successfully", function () {
  pm.response.to.have.status(200);
  const jsonData = pm.response.json();
  pm.expect(jsonData.success).to.be.true;
  console.log("✅ Questions seeded for game");
});
