const { spawn } = require("child_process");

const runPythonScript = async (userImage, referenceImage) => {
  return new Promise((resolve, reject) => {
    const python = spawn("python", ["similarity_checker.py"], {
      stdio: "pipe",
    });

    const input = JSON.stringify({ userImage, referenceImage });
    python.stdin.write(input);
    python.stdin.end();

    let data = "";
    python.stdout.on("data", (chunk) => {
      data += chunk;
    });

    python.stderr.on("data", (err) => {
      reject(err.toString());
    });

    python.on("close", () => {
      try {
        resolve(JSON.parse(data));
      } catch (error) {
        reject(error);
      }
    });
  });
};

module.exports = runPythonScript;
