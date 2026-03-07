import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import Dockerode from "dockerode";
import * as fs from "fs";
import * as path from "path";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export function registerDockerBuild(server: McpServer): void {
  server.tool(
    "docker_build",
    "Build a Docker image from a Dockerfile in the specified context directory",
    {
      contextPath: z
        .string()
        .describe("Path to the build context directory containing the Dockerfile"),
      imageName: z
        .string()
        .describe("Name and optional tag for the built image (e.g. myapp:latest)"),
      dockerfile: z
        .string()
        .optional()
        .describe("Path to Dockerfile relative to context. Defaults to 'Dockerfile'."),
      buildArgs: z
        .record(z.string())
        .optional()
        .describe("Build arguments as key-value pairs"),
      noCache: z
        .boolean()
        .optional()
        .describe("Disable build cache. Defaults to false."),
    },
    async ({ contextPath, imageName, dockerfile = "Dockerfile", buildArgs, noCache = false }) => {
      try {
        const dockerfilePath = path.resolve(contextPath, dockerfile);
        if (!fs.existsSync(dockerfilePath)) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Error: Dockerfile not found at ${dockerfilePath}`,
              },
            ],
            isError: true,
          };
        }

        let cmd = `docker build -t ${imageName} -f ${dockerfile}`;
        if (noCache) cmd += " --no-cache";
        if (buildArgs) {
          for (const [key, value] of Object.entries(buildArgs)) {
            cmd += ` --build-arg ${key}=${value}`;
          }
        }
        cmd += ` ${contextPath}`;

        const { stdout, stderr } = await execAsync(cmd, {
          maxBuffer: 10 * 1024 * 1024,
        });

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(
                {
                  success: true,
                  image: imageName,
                  output: stdout.split("\n").slice(-10).join("\n"),
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
          content: [{ type: "text" as const, text: `Build error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
