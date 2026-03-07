import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetch from "node-fetch";

interface JenkinsBuildResponse {
  queueUrl?: string;
  buildNumber?: number;
  status: string;
}

export function registerJenkinsTriggerBuild(server: McpServer): void {
  server.tool(
    "jenkins_trigger_build",
    "Trigger a Jenkins build job with optional parameters and wait for queue info",
    {
      jenkinsUrl: z
        .string()
        .url()
        .describe("Jenkins server base URL (e.g. https://jenkins.example.com)"),
      jobName: z
        .string()
        .describe("Full job name or path (e.g. folder/my-job)"),
      parameters: z
        .record(z.string())
        .optional()
        .describe("Build parameters as key-value pairs"),
      token: z
        .string()
        .optional()
        .describe("Jenkins API token for authentication"),
      username: z
        .string()
        .optional()
        .describe("Jenkins username for authentication"),
      waitForStart: z
        .boolean()
        .optional()
        .describe("Wait for the build to start before returning. Defaults to false."),
    },
    async ({
      jenkinsUrl,
      jobName,
      parameters,
      token,
      username,
      waitForStart = false,
    }) => {
      try {
        const encodedJob = jobName
          .split("/")
          .map((part) => encodeURIComponent(part))
          .join("/job/");

        const hasParams = parameters && Object.keys(parameters).length > 0;
        const endpoint = hasParams ? "buildWithParameters" : "build";
        let url = `${jenkinsUrl}/job/${encodedJob}/${endpoint}`;

        if (hasParams) {
          const queryParts = Object.entries(parameters).map(
            ([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`
          );
          url += `?${queryParts.join("&")}`;
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/x-www-form-urlencoded",
        };

        if (username && token) {
          const encoded = Buffer.from(`${username}:${token}`).toString("base64");
          headers["Authorization"] = `Basic ${encoded}`;
        }

        const response = await fetch(url, {
          method: "POST",
          headers,
        });

        if (!response.ok && response.status !== 201) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Jenkins API error: ${response.status} ${response.statusText}`,
              },
            ],
            isError: true,
          };
        }

        const result: JenkinsBuildResponse = {
          status: "queued",
          queueUrl: response.headers.get("location") ?? undefined,
        };

        if (waitForStart && result.queueUrl) {
          await new Promise((resolve) => setTimeout(resolve, 3000));
          const queueResponse = await fetch(`${result.queueUrl}api/json`, {
            headers,
          });
          if (queueResponse.ok) {
            const queueData = (await queueResponse.json()) as Record<string, unknown>;
            const executable = queueData.executable as
              | { number: number }
              | undefined;
            if (executable) {
              result.buildNumber = executable.number;
              result.status = "started";
            }
          }
        }

        return {
          content: [
            { type: "text" as const, text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [
            { type: "text" as const, text: `Jenkins error: ${message}` },
          ],
          isError: true,
        };
      }
    }
  );
}
