import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerDockerListContainers } from "./tools/docker_list_containers.js";
import { registerDockerBuild } from "./tools/docker_build.js";
import { registerHelmListReleases } from "./tools/helm_list_releases.js";
import { registerAnsibleRunPlaybook } from "./tools/ansible_run_playbook.js";
import { registerJenkinsTriggerBuild } from "./tools/jenkins_trigger_build.js";
import { registerTerraformPlanSummary } from "./tools/terraform_plan_summary.js";

const server = new McpServer({
  name: "mcp-server-devops",
  version: "1.0.0",
});

registerDockerListContainers(server);
registerDockerBuild(server);
registerHelmListReleases(server);
registerAnsibleRunPlaybook(server);
registerJenkinsTriggerBuild(server);
registerTerraformPlanSummary(server);

async function main(): Promise<void> {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP DevOps Server running on stdio");
}

main().catch((error: Error) => {
  console.error("Fatal error:", error.message);
  process.exit(1);
});
