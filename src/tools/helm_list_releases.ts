import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

interface HelmRelease {
  name: string;
  namespace: string;
  revision: string;
  updated: string;
  status: string;
  chart: string;
  app_version: string;
}

export function registerHelmListReleases(server: McpServer): void {
  server.tool(
    "helm_list_releases",
    "List Helm releases across namespaces with optional filtering",
    {
      namespace: z
        .string()
        .optional()
        .describe("Kubernetes namespace. Use '--all-namespaces' or omit for all."),
      filter: z
        .string()
        .optional()
        .describe("Filter releases by name pattern"),
      kubeContext: z
        .string()
        .optional()
        .describe("Kubernetes context to use"),
    },
    async ({ namespace, filter, kubeContext }) => {
      try {
        let cmd = "helm list -o json";
        if (namespace) {
          cmd += ` -n ${namespace}`;
        } else {
          cmd += " --all-namespaces";
        }
        if (filter) cmd += ` --filter ${filter}`;
        if (kubeContext) cmd += ` --kube-context ${kubeContext}`;

        const { stdout } = await execAsync(cmd);
        const releases: HelmRelease[] = JSON.parse(stdout || "[]");

        const summary = {
          total: releases.length,
          deployed: releases.filter((r) => r.status === "deployed").length,
          failed: releases.filter((r) => r.status === "failed").length,
          releases: releases.map((r) => ({
            name: r.name,
            namespace: r.namespace,
            chart: r.chart,
            appVersion: r.app_version,
            status: r.status,
            revision: r.revision,
            updated: r.updated,
          })),
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
          content: [{ type: "text" as const, text: `Helm error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
