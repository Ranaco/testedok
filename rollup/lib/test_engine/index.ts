import { exec } from "child_process";
import * as fs from "fs";
import * as path from "path";

class CartesiTestManager {
  private baseDir: string = "/home/dapp/tests";

  /**
   * Ensures a directory exists, creating it if necessary.
   * @param dirPath - Directory path to ensure.
   */
  private ensureDirExists(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  }

  /**
   * Initializes a new project for the given bounty in the Cartesi VM.
   * @param bountyId - Unique ID for the bounty.
   * @param test - Test script template for the bounty.
   * @param statement - Problem statement or description.
   */
  async createProject(
    bountyId: string,
    test: string,
    statement: string,
  ): Promise<string> {
    try {
      const projDir = path.join(this.baseDir, `k-${bountyId}`);
      this.ensureDirExists(projDir);

      this.execPromise("touch ~/hello.txt");

      // Initialize project
      const res = await this.execPromise(
        `bash -c "forge init '${projDir}' --offline --no-git && echo pass || echo fail"`,
      );

      console.log("VM res", res);

      if (res.trim() === "fail") {
        throw new Error("Failed to create project");
      }

      // Write project files
      this.ensureDirExists(path.join(projDir, "test"));
      this.ensureDirExists(path.join(projDir, "src"));
      fs.writeFileSync(path.join(projDir, "README.md"), statement);
      fs.writeFileSync(path.join(projDir, "test", "test.t.sol"), test);

      console.log(`Project initialized for bounty: ${bountyId}`);
      return "pass";
    } catch (error) {
      console.error(`Error creating project for bounty ${bountyId}:`, error);
      return "fail";
    }
  }

  /**
   * Runs tests in the Cartesi VM for a specific submission.
   * @param test - Test script for the submission.
   * @param submission - Solidity contract submission code.
   * @param bountyId - ID of the associated bounty.
   * @param submissionId - ID of the specific submission.
   * @returns Test result status and logs or errors.
   */
  async runTests(
    submission: string,
    bountyId: string,
    submissionId: string,
  ): Promise<{ success: boolean; logs?: string[] }> {
    try {
      const projDir = path.join(this.baseDir, `k-${bountyId}`);
      if (!fs.existsSync(projDir)) {
        throw new Error(
          `Project directory for bounty ${bountyId} does not exist.`,
        );
      }

      const submissionFilePath = path.join(projDir, "src", `Submission.sol`);

      fs.writeFileSync(submissionFilePath, submission);

      console.log(`Running tests for submission: ${submissionId}`);

      // Compile and test using Foundry
      await this.execPromise(`bash -c "forge build --root '${projDir}'"`);
      const testResults = await this.execPromise(
        `bash -c "(forge test --root '${projDir}') && echo pass || echo fail"`,
      );

      if (testResults.trim() === "fail") {
        throw new Error("Test failed: \n" + testResults);
      }

      console.log(`Test passed for submission: ${submissionId}`);
      return { success: true, logs: [testResults] };
    } catch (error: any) {
      console.error(`Test failed for submission: ${submissionId}`, error);
      return { success: false, logs: [error.message] };
    }
  }

  /**
   * Executes a shell command and resolves/rejects with the result.
   * @param command - Shell command to execute.
   * @returns Promise resolving to stdout or rejecting with stderr.
   */
  private execPromise(command: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      exec(command, { shell: "bash" }, (error, stdout, stderr) => {
        if (error) {
          reject(stderr || error.message);
        } else {
          resolve(stdout.trim());
        }
      });
    });
  }
}

const manager = () => new CartesiTestManager();

export default manager;
