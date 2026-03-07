import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import Dockerode from "dockerode";

export function registerDockerListContainers(server: McpServer): void {
  server.tool(
    "docker_list_containers",
    "List Docker containers with optional filtering by status",
    {
      status: z
        .enum(["running", "stopped", "all"])
        .optional()
        .describe("Filter containers by status. Defaults to 'all'."),
      host: z
        .string()
        .optional()
        .describe("Docker host URL. Defaults to local socket."),
    },
    async ({ status = "all", host }) => {
      try {
        const dockerOptions: Dockerode.DockerOptions = host
          ? { host, port: 2375 }
          : { socketPath: "/var/run/docker.sock" };

        const docker = new Dockerode(dockerOptions);

        const allFilter = status === "all";
        const containers = await docker.listContainers({
          all: allFilter || status === "stopped",
        });

        const filtered = containers.filter((c) => {
          if (status === "running") return c.State === "running";
          if (status === "stopped") return c.State !== "running";
          return true;
        });

        const results = filtered.map((c) => ({
          id: c.Id.substring(0, 12),
          name: c.Names?.[0]?.replace(/^\//, "") ?? "unknown",
          image: c.Image,
          state: c.State,
          status: c.Status,
          ports: c.Ports?.map(
            (p) => `${p.PublicPort ?? ""}:${p.PrivatePort}/${p.Type}`
          ),
          created: new Date(c.Created * 1000).toISOString(),
        }));

        return {
          content: [
            {
              type: "text" as const,
              text: JSON.stringify(results, null, 2),
            },
          ],
        };
      } catch (error) {
        const message =
          error instanceof Error ? error.message : String(error);
        return {
          content: [{ type: "text" as const, text: `Error: ${message}` }],
          isError: true,
        };
      }
    }
  );
}
