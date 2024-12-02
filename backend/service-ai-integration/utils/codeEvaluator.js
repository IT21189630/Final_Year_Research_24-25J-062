const vm = require("vm");

const evaluateCode = (code) => {
  const errors = [];
  let isValid = false;
  let feedback = "";

  try {
    // Safely execute the user code in a VM
    const script = new vm.Script(code);
    const sandbox = {};
    vm.createContext(sandbox);
    script.runInContext(sandbox);

    // Basic logic validation (example: check for specific variables)
    const hasMissionName = /let\s+missionName\s*=\s*["'].*["']/i.test(code);
    const hasAstronautName = /let\s+astronautName\s*=\s*["'].*["']/i.test(code);
    const hasMissionDay = /let\s+missionDay\s*=\s*1/i.test(code);

    if (hasMissionName && hasAstronautName && hasMissionDay) {
      isValid = true;
      feedback = "Great job! Your code is correct.";
    } else {
      feedback = "Your code is missing some required variables. Check the instructions.";
      if (!hasMissionName) errors.push("Missing variable: missionName.");
      if (!hasAstronautName) errors.push("Missing variable: astronautName.");
      if (!hasMissionDay) errors.push("Missing variable: missionDay.");
    }
  } catch (error) {
    feedback = "Syntax error in your code. Please review it.";
    errors.push(error.message);
  }

  return { isValid, feedback, errors };
};

module.exports = { evaluateCode };
