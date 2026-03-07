# mcp-server-devops

An MCP (Model Context Protocol) server providing tools for common DevOps operations. Integrates with Docker, Helm, Ansible, Jenkins, and Terraform through a unified interface.

## Architecture

```mermaid
flowchart TD
    A[MCP Client] -->|stdio| B[MCP Server]
    B --> C[docker_list_containers]
    B --> D[docker_build]
    B --> E[helm_list_releases]
    B --> F[ansible_run_playbook]
    B --> G[jenkins_trigger_build]
    B --> H[terraform_plan_summary]

    C --> I[Docker Engine]
    D --> I
    E --> J[Kubernetes Cluster]
    F --> K[Ansible Controller]
    G --> L[Jenkins Server]
    H --> M[Terraform CLI]

    style A fill:#4A90D9,stroke:#2C5F8A,color:#FFFFFF
    style B fill:#2ECC71,stroke:#1A9B52,color:#FFFFFF
    style C fill:#F39C12,stroke:#C47F0E,color:#FFFFFF
    style D fill:#F39C12,stroke:#C47F0E,color:#FFFFFF
    style E fill:#9B59B6,stroke:#7A3D94,color:#FFFFFF
    style F fill:#E74C3C,stroke:#B83A2F,color:#FFFFFF
    style G fill:#1ABC9C,stroke:#148F77,color:#FFFFFF
    style H fill:#3498DB,stroke:#2476AB,color:#FFFFFF
    style I fill:#34495E,stroke:#2C3E50,color:#FFFFFF
    style J fill:#34495E,stroke:#2C3E50,color:#FFFFFF
    style K fill:#34495E,stroke:#2C3E50,color:#FFFFFF
    style L fill:#34495E,stroke:#2C3E50,color:#FFFFFF
    style M fill:#34495E,stroke:#2C3E50,color:#FFFFFF
```

## Tools

| Tool | Description |
|------|-------------|
| `docker_list_containers` | List Docker containers with status filtering |
| `docker_build` | Build Docker images from a Dockerfile |
| `helm_list_releases` | List Helm releases across namespaces |
| `ansible_run_playbook` | Execute Ansible playbooks with variable support |
| `jenkins_trigger_build` | Trigger Jenkins build jobs with parameters |
| `terraform_plan_summary` | Run terraform plan and return structured summaries |

## Installation

```bash
npm install
npm run build
```

## Usage

### As a standalone server

```bash
npm start
```

### With Docker

```bash
docker build -t mcp-server-devops .
docker run -i --rm mcp-server-devops
```

### MCP Client Configuration

```json
{
  "mcpServers": {
    "devops": {
      "command": "node",
      "args": ["dist/index.js"],
      "cwd": "/path/to/mcp-server-devops"
    }
  }
}
```

## Development

```bash
npm run dev
npm run lint
npm run clean
```

## Requirements

- Node.js >= 18
- Docker CLI (for Docker tools)
- Helm CLI (for Helm tools)
- Ansible (for Ansible tools)
- Terraform CLI (for Terraform tools)
- Jenkins API access (for Jenkins tools)

## License

MIT License - see [LICENSE](LICENSE) for details.
