import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";

const execAsync = promisify(exec);

export function registerAnsibleRunPlaybook(server: McpServer): void {
  server.tool(
    "ansible_run_playbook",
    "Execute an Ansible playbook with optional inventory and extra variables",
    {
      playbookPath: z
        .string()
        .describe("Path to the Ansible playbook YAML file"),
      inventory: z
        .string()
        .optional()
        .describe("Inventory file or comma-separated host list"),
      extraVars: z
        .record(z.string())
        .optional()
        .describe("Extra variables to pass to the playbook"),
      limit: z
        .string()
        .optional()
        .describe("Limit execution to specific hosts or groups"),
      tags: z
        .string()
        .optional()
        .describe("Only run plays and tasks tagged with these values"),
      checkMode: z
        .boolean()
        .optional()
        .describe("Run in check mode (dry run). Defaults to false."),
      verbose: z
        .boolean()
        .optional()
        .describe("Enable verbose output"),
    },
    async ({
      playbookPath,
      inventory,
      extraVars,
      limit,
      tags,
      checkMode = false,
      verbose = false,
    }) => {
      try {
        if (!fs.existsSync(playbookPath)) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Playbook not found at ${playbookPath}`,
              },
            ],
            isError: true,
          };
        }

        let cmd = `ansible-playbook ${playbookPath}`;
        if (inventory) cmd += ` -i ${inventory}`;
        if (limit) cmd += ` --limit ${limit}`;
        if (tags) cmd += ` --tags ${tags}`;
        if (checkMode) cmd += " --check";
        if (verbose) cmd += " -vvv";
        if (extraVars) {
          const varsJson = JSON.stringify(extraVars);
          cmd += ` --extra-vars '${varsJson}'`;
        }

        const { stdout, stderr } = await execAsync(cmd, {
          maxBuffer: 20 * 1024 * 1024,
          timeout: 600000,
        });

        const recap = stdout
          .split("\n")
          .filter(
            (line) =>
              line.includes("ok=") ||
              line.includes("PLAY RECAP") ||
              line.includes("changed=")
          )
          .join("\n");

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  checkMode,
                  recap: recap || "Playbook completed",
                  fullOutput: stdout,
                  warnings: stderr || undefined,
                },
                null,
                2
              ),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Ansible error: ${message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
