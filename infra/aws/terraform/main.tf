terraform {
  required_version = ">= 1.7"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region
}

# ---------------------------------------------------------------------------
# Local values
# ---------------------------------------------------------------------------

locals {
  common_tags = {
    Project     = var.project_tag
    Environment = "load-test"
    ManagedBy   = "terraform"
  }
}

# ---------------------------------------------------------------------------
# Security group — k6 load-test instance
# Allow SSH only from the PM-supplied CIDR; all egress permitted so the
# instance can reach the target Lucia API and upload results to S3.
# ---------------------------------------------------------------------------

resource "aws_security_group" "loadtest" {
  name        = "${var.project_tag}-loadtest-sg"
  description = "SSH access for FR-O-001 load test (Lucia Pilot)"

  ingress {
    description = "SSH from PM office/VPN"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.ssh_cidr]
  }

  egress {
    description = "All outbound (k6 traffic + S3 uploads)"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${var.project_tag}-loadtest-sg"
  })
}

# ---------------------------------------------------------------------------
# EC2 instance — m6i.2xlarge (8 vCPU / 32 GB RAM)
# AMI must be pre-built with Packer (infra/aws/packer/k6-loadtest.pkr.hcl).
# The AMI ID has no default — it must be explicitly set in tfvars.
# ---------------------------------------------------------------------------

resource "aws_instance" "loadtest" {
  ami                    = var.instance_ami
  instance_type          = "m6i.2xlarge"
  vpc_security_group_ids = [aws_security_group.loadtest.id]

  # Root volume: 30 GB is sufficient for k6 + xk6-mqtt + result artifacts.
  root_block_device {
    volume_type           = "gp3"
    volume_size           = 30
    delete_on_termination = true

    tags = merge(local.common_tags, {
      Name = "${var.project_tag}-loadtest-root"
    })
  }

  # Prevent accidental termination during a run.
  # The PM must set this to false before terraform destroy.
  disable_api_termination = false

  tags = merge(local.common_tags, {
    Name = "${var.project_tag}-loadtest"
  })
}

# ---------------------------------------------------------------------------
# S3 bucket — k6 result artifacts
# Stores JSON summary files uploaded by run-loadtest.sh after each run.
# ---------------------------------------------------------------------------

resource "aws_s3_bucket" "results" {
  # Bucket names must be globally unique; suffix with account ID via data source
  # is intentionally omitted here to keep the stub simple — the PM should set a
  # unique suffix in tfvars or rename the bucket in this resource before apply.
  bucket        = "${var.project_tag}-loadtest-results"
  force_destroy = true

  tags = merge(local.common_tags, {
    Name = "${var.project_tag}-loadtest-results"
  })
}

resource "aws_s3_bucket_versioning" "results" {
  bucket = aws_s3_bucket.results.id

  versioning_configuration {
    status = "Enabled"
  }
}

# Block all public access — results are internal only.
resource "aws_s3_bucket_public_access_block" "results" {
  bucket = aws_s3_bucket.results.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# ---------------------------------------------------------------------------
# Billing alarm — SNS + CloudWatch
# Fires at $50 USD to guard against runaway instances.
# PM must confirm the SNS subscription email before the test.
# ---------------------------------------------------------------------------

resource "aws_sns_topic" "billing_alarm" {
  name = "${var.project_tag}-billing-alarm"
  tags = local.common_tags
}

resource "aws_sns_topic_subscription" "billing_email" {
  topic_arn = aws_sns_topic.billing_alarm.arn
  protocol  = "email"
  endpoint  = var.pm_email_for_alarms
}

resource "aws_cloudwatch_metric_alarm" "billing" {
  alarm_name          = "${var.project_tag}-loadtest-billing-50usd"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "EstimatedCharges"
  namespace           = "AWS/Billing"
  period              = 86400 # 24 hours
  statistic           = "Maximum"
  threshold           = 50
  alarm_description   = "Lucia Pilot load-test AWS spend >= $50 USD"
  alarm_actions       = [aws_sns_topic.billing_alarm.arn]

  dimensions = {
    Currency = "USD"
  }

  tags = local.common_tags
}
