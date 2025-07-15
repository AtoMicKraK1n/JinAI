pm.test("Status code is 200 or 403", function () {
  // 200 if user is participant, 403 if not
  pm.expect(pm.response.code).to.be.oneOf([200, 403]);
});

if (pm.response.code === 200) {
  pm.test("Response has questions array", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property("success");
    pm.expect(jsonData).to.have.property("questions");
    pm.expect(jsonData.questions).to.be.an("array");
  });

  pm.test("Questions have correct structure", function () {
    const jsonData = pm.response.json();
    if (jsonData.questions.length > 0) {
      const question = jsonData.questions[0];
      pm.expect(question).to.have.property("id");
      pm.expect(question).to.have.property("question");
      pm.expect(question).to.have.property("options");
      pm.expect(question).to.have.property("difficulty");
      pm.expect(question).to.have.property("category");
      pm.expect(question).to.have.property("timeLimit");
      pm.expect(question).to.have.property("orderIndex");

      // Check options structure
      pm.expect(question.options).to.have.property("A");
      pm.expect(question.options).to.have.property("B");
      pm.expect(question.options).to.have.property("C");
      pm.expect(question.options).to.have.property("D");

      // Ensure correct answer is NOT included
      pm.expect(question).to.not.have.property("correctAnswer");
    }
  });
}

if (pm.response.code === 403) {
  pm.test("User not participant error", function () {
    const jsonData = pm.response.json();
    pm.expect(jsonData.error).to.include("not a participant");
  });
}
