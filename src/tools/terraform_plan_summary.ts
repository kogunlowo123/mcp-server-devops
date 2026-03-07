import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";

const execAsync = promisify(exec);

interface PlanSummary {
  add: number;
  change: number;
  destroy: number;
  resources: ResourceChange[];
  rawSummary: string;
}

interface ResourceChange {
  action: string;
  resource: string;
  type: string;
}

export function registerTerraformPlanSummary(server: McpServer): void {
  server.tool(
    "terraform_plan_summary",
    "Run terraform plan and return a structured summary of changes",
    {
      workingDir: z
        .string()
        .describe("Path to the Terraform working directory"),
      varFile: z
        .string()
        .optional()
        .describe("Path to a .tfvars variable file"),
      targets: z
        .array(z.string())
        .optional()
        .describe("List of specific resources to target"),
      refreshOnly: z
        .boolean()
        .optional()
        .describe("Only refresh state, do not plan changes"),
    },
    async ({ workingDir, varFile, targets, refreshOnly = false }) => {
      try {
        if (!fs.existsSync(workingDir)) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Directory not found at ${workingDir}`,
              },
            ],
            isError: true,
          };
        }

        let cmd = "terraform plan -no-color";
        if (varFile) cmd += ` -var-file=${varFile}`;
        if (refreshOnly) cmd += " -refresh-only";
        if (targets) {
          for (const target of targets) {
            cmd += ` -target=${target}`;
          }
        }

        const { stdout } = await execAsync(cmd, {
          cwd: workingDir,
          maxBuffer: 20 * 1024 * 1024,
          timeout: 300000,
        });

        const lines = stdout.split("\n");
        const resources: ResourceChange[] = [];

        for (const line of lines) {
          const createMatch = line.match(
            /^\s*#\s+(\S+)\s+will be (created|destroyed|updated|replaced)/
          );
          if (createMatch) {
            resources.push({
              resource: createMatch[1],
              action: createMatch[2],
              type: createMatch[1].split(".")[0],
            });
          }
        }

        const summaryMatch = stdout.match(
          /Plan:\s+(\d+)\s+to add,\s+(\d+)\s+to change,\s+(\d+)\s+to destroy/
        );

        const summary: PlanSummary = {
          add: summaryMatch ? parseInt(summaryMatch[1], 10) : 0,
          change: summaryMatch ? parseInt(summaryMatch[2], 10) : 0,
          destroy: summaryMatch ? parseInt(summaryMatch[3], 10) : 0,
          resources,
          rawSummary:
            summaryMatch?.[0] ?? "No changes. Infrastructure is up-to-date.",
        };

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(summary, null, 2) },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Terraform error: ${message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
