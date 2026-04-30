packer {
  required_version = ">= 1.10"

  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1.3"
    }
  }
}

# ---------------------------------------------------------------------------
# Variables
# ---------------------------------------------------------------------------

variable "aws_region" {
  description = "AWS region in which to build the AMI."
  type        = string
  default     = "ap-northeast-2"
}

variable "instance_type" {
  description = "Instance type used during the Packer build. t3.medium is sufficient."
  type        = string
  default     = "t3.medium"
}

variable "k6_version" {
  description = "k6 release version to install (without the 'v' prefix)."
  type        = string
  default     = "0.52.0"
}

variable "go_version" {
  description = "Go version required to compile xk6-mqtt."
  type        = string
  default     = "1.22.3"
}

variable "node_version" {
  description = "Node.js major version for fabric-network SDK."
  type        = string
  default     = "20"
}

# ---------------------------------------------------------------------------
# Source — Ubuntu 22.04 LTS (Canonical official AMI, ap-northeast-2)
# ---------------------------------------------------------------------------

source "amazon-ebs" "k6_loadtest" {
  region        = var.aws_region
  instance_type = var.instance_type

  # Use the latest Ubuntu 22.04 LTS AMI published by Canonical.
  source_ami_filter {
    filters = {
      name                = "ubuntu/images/hvm-ssd/ubuntu-jammy-22.04-amd64-server-*"
      root-device-type    = "ebs"
      virtualization-type = "hvm"
    }
    owners      = ["099720109477"] # Canonical
    most_recent = true
  }

  ssh_username = "ubuntu"

  ami_name        = "lucia-pilot-k6-loadtest-{{timestamp}}"
  ami_description = "k6 + xk6-mqtt + fabric-network Node SDK for Lucia Pilot FR-O-001 load test"

  tags = {
    Project     = "lucia-pilot"
    Environment = "load-test"
    BaseOS      = "ubuntu-22.04"
    K6Version   = var.k6_version
    ManagedBy   = "packer"
  }

  # Encrypt the root volume at rest.
  launch_block_device_mappings {
    device_name           = "/dev/sda1"
    volume_size           = 20
    volume_type           = "gp3"
    delete_on_termination = true
    encrypted             = true
  }
}

# ---------------------------------------------------------------------------
# Build — install k6, xk6-mqtt, fabric-network Node SDK, jq, awscli
# ---------------------------------------------------------------------------

build {
  name    = "k6-loadtest"
  sources = ["source.amazon-ebs.k6_loadtest"]

  # Step 1: system updates and baseline tools
  provisioner "shell" {
    inline = [
      "set -euo pipefail",
      "export DEBIAN_FRONTEND=noninteractive",
      "sudo apt-get update -qq",
      "sudo apt-get install -y --no-install-recommends curl unzip jq git build-essential ca-certificates gnupg lsb-release",
    ]
  }

  # Step 2: install Go (required to compile xk6 and xk6-mqtt)
  provisioner "shell" {
    inline = [
      "set -euo pipefail",
      "curl -fsSL https://go.dev/dl/go${var.go_version}.linux-amd64.tar.gz -o /tmp/go.tar.gz",
      "sudo rm -rf /usr/local/go",
      "sudo tar -C /usr/local -xzf /tmp/go.tar.gz",
      "rm /tmp/go.tar.gz",
      "echo 'export PATH=$PATH:/usr/local/go/bin:/home/ubuntu/go/bin' | sudo tee /etc/profile.d/go.sh",
    ]
  }

  # Step 3: install k6 from official binary release
  provisioner "shell" {
    inline = [
      "set -euo pipefail",
      "curl -fsSL https://github.com/grafana/k6/releases/download/v${var.k6_version}/k6-v${var.k6_version}-linux-amd64.tar.gz -o /tmp/k6.tar.gz",
      "tar -xzf /tmp/k6.tar.gz -C /tmp",
      "sudo mv /tmp/k6-v${var.k6_version}-linux-amd64/k6 /usr/local/bin/k6",
      "sudo chmod +x /usr/local/bin/k6",
      "rm -rf /tmp/k6.tar.gz /tmp/k6-v${var.k6_version}-linux-amd64",
      "k6 version",
    ]
  }

  # Step 4: build xk6-mqtt extension and bake a custom k6 binary
  # xk6-mqtt allows k6 to publish MQTT messages — required for FR-O-001 MQTT load.
  provisioner "shell" {
    inline = [
      "set -euo pipefail",
      "export PATH=$PATH:/usr/local/go/bin",
      "export HOME=/home/ubuntu",
      "go install go.k6.io/xk6/cmd/xk6@latest",
      "~/go/bin/xk6 build --with github.com/pmalhaire/xk6-mqtt@latest --output /usr/local/bin/k6-mqtt",
      "sudo chmod +x /usr/local/bin/k6-mqtt",
      "/usr/local/bin/k6-mqtt version",
    ]
  }

  # Step 5: install Node.js (for fabric-network SDK if needed during test setup)
  provisioner "shell" {
    inline = [
      "set -euo pipefail",
      "curl -fsSL https://deb.nodesource.com/setup_${var.node_version}.x | sudo -E bash -",
      "sudo apt-get install -y nodejs",
      "node --version",
      "npm --version",
    ]
  }

  # Step 6: install fabric-network Node SDK globally
  # Used for any test harness code that submits Fabric transactions directly.
  provisioner "shell" {
    inline = [
      "set -euo pipefail",
      "sudo npm install -g fabric-network@2.2.20 fabric-ca-client@2.2.20",
    ]
  }

  # Step 7: install AWS CLI v2
  provisioner "shell" {
    inline = [
      "set -euo pipefail",
      "curl -fsSL https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip -o /tmp/awscliv2.zip",
      "unzip -q /tmp/awscliv2.zip -d /tmp",
      "sudo /tmp/aws/install",
      "rm -rf /tmp/awscliv2.zip /tmp/aws",
      "aws --version",
    ]
  }

  # Step 8: create the working directory for k6 scenarios
  provisioner "shell" {
    inline = [
      "set -euo pipefail",
      "mkdir -p /home/ubuntu/k6-scenarios",
      "chown ubuntu:ubuntu /home/ubuntu/k6-scenarios",
    ]
  }
}
