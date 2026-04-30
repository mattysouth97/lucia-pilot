# Lucia Pilot — AWS Provisioning (FR-O-001 Load Test)

## Overview

This directory contains the Terraform, Packer, and k6 scaffolding required to run the
FR-O-001 load test on AWS. The load test validates that the Lucia settlement platform
meets NFR-1 (settlement latency <= 5 s end-to-end) and NFR-3 (dashboard refresh <= 3 s)
at the 9,354-building production tier.

**P0.13 milestone**: FR-O-001 load test must complete and pass before the end of week 8.
Plan reference: `.omc/plans/lucia-pilot-implementation.md` section P0.13.

---

## PM Responsibility

> This provisioning step requires real AWS credentials and incurs real costs.
> It is **not** executed by autopilot. The PM must perform these steps manually
> on a machine with AWS CLI configured and the IAM credentials below.

Estimated cost: one m6i.2xlarge (8 vCPU / 32 GB) running for approximately 2 hours
(smoke + full runs) in ap-northeast-2. Spot pricing recommended for the test instance.

---

## Prerequisites

### AWS Account Requirements

1. An IAM user (or assumed role) with the following minimum policy attached:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "EC2LoadTest",
      "Effect": "Allow",
      "Action": [
        "ec2:RunInstances",
        "ec2:TerminateInstances",
        "ec2:DescribeInstances",
        "ec2:DescribeInstanceStatus",
        "ec2:CreateSecurityGroup",
        "ec2:DeleteSecurityGroup",
        "ec2:AuthorizeSecurityGroupIngress",
        "ec2:RevokeSecurityGroupIngress",
        "ec2:DescribeSecurityGroups",
        "ec2:CreateKeyPair",
        "ec2:DeleteKeyPair",
        "ec2:DescribeKeyPairs",
        "ec2:DescribeImages",
        "ec2:DescribeVpcs",
        "ec2:DescribeSubnets"
      ],
      "Resource": "*"
    },
    {
      "Sid": "S3Results",
      "Effect": "Allow",
      "Action": [
        "s3:CreateBucket",
        "s3:DeleteBucket",
        "s3:PutObject",
        "s3:GetObject",
        "s3:ListBucket",
        "s3:DeleteObject",
        "s3:PutBucketTagging",
        "s3:PutBucketVersioning"
      ],
      "Resource": [
        "arn:aws:s3:::lucia-pilot-loadtest-*",
        "arn:aws:s3:::lucia-pilot-loadtest-*/*"
      ]
    },
    {
      "Sid": "BillingAlarm",
      "Effect": "Allow",
      "Action": [
        "cloudwatch:PutMetricAlarm",
        "cloudwatch:DeleteAlarms",
        "cloudwatch:DescribeAlarms",
        "sns:CreateTopic",
        "sns:DeleteTopic",
        "sns:Subscribe",
        "sns:SetTopicAttributes"
      ],
      "Resource": "*"
    }
  ]
}
```

2. A billing alarm must be configured before any `terraform apply`. Set the threshold
   at $50 USD to guard against runaway instances. The Terraform config creates an SNS
   alarm; supply `pm_email_for_alarms` in `example.tfvars`.

3. AWS CLI configured: `aws configure` with the IAM credentials above, region
   `ap-northeast-2` (Seoul).

---

## Step 1 — Build the AMI with Packer

The k6 load-generator AMI bakes in: k6 binary, xk6-mqtt extension (compiled from
source), fabric-network Node.js SDK, jq, and awscli. This avoids per-run install time.

```bash
cd infra/aws/packer
packer init k6-loadtest.pkr.hcl
packer build k6-loadtest.pkr.hcl
# Note the output AMI ID (ami-xxxxxxxxxxxxxxxxx) — set it as instance_ami in tfvars.
```

Packer uses Ubuntu 22.04 LTS as the base image (official Canonical AMI for
ap-northeast-2). Build time is approximately 8 minutes.

---

## Step 2 — Provision infrastructure with Terraform

```bash
cd infra/aws/terraform
cp example.tfvars lucia-pilot.auto.tfvars
# Edit lucia-pilot.auto.tfvars — fill in instance_ami, ssh_cidr, pm_email_for_alarms.
terraform init
terraform plan -var-file=lucia-pilot.auto.tfvars
terraform apply -var-file=lucia-pilot.auto.tfvars
```

Terraform creates:
- One m6i.2xlarge EC2 instance (on-demand; swap to spot by editing `main.tf`).
- A security group allowing SSH only from `ssh_cidr` (your office/VPN CIDR).
- An S3 bucket for k6 result JSON artifacts.
- A CloudWatch billing alarm notifying `pm_email_for_alarms`.

After `apply`, Terraform prints `instance_public_ip`, `s3_results_bucket`, and a
ready-to-paste `ssh_command`.

---

## Step 3 — Run the FR-O-001 load test

```bash
# Smoke run (N=1,000 buildings, 5 minutes) — verify the harness works
bash infra/aws/run-loadtest.sh smoke

# Full run (N=9,354 buildings, 15 minutes) — the real FR-O-001 acceptance gate
bash infra/aws/run-loadtest.sh full
```

The script:
1. Reads Terraform outputs for the instance IP and S3 bucket name.
2. SCPs the k6 scenario to the instance.
3. SSHes in and runs k6, streaming output locally.
4. Uploads the JSON result summary to S3.
5. Prints the S3 URL for the report.

Results must show p95 settlement latency < 5 s and p95 dashboard refresh < 3 s for the
FR-O-001 milestone to be marked green. See `k6-scenarios/README.md` for pass criteria.

---

## Step 4 — Tear down

```bash
cd infra/aws/terraform
terraform destroy -var-file=lucia-pilot.auto.tfvars
```

Do not leave the instance running after the test. The billing alarm is a safety net,
not a substitute for explicit teardown.

---

## File map

```
infra/aws/
  README.md                    (this file)
  run-loadtest.sh              (orchestration script — entry point for the PM)
  terraform/
    main.tf                    (EC2 instance, security group, S3 bucket, billing alarm)
    variables.tf               (input variable declarations)
    outputs.tf                 (IP, bucket name, SSH command)
    example.tfvars             (template — copy to *.auto.tfvars and fill in)
  packer/
    k6-loadtest.pkr.hcl        (AMI bake: k6 + xk6-mqtt + fabric-network Node SDK)
  k6-scenarios/
    lucia-load.js              (k6 script: MQTT publish + HTTP settlement polling)
    README.md                  (scenario tiers and pass criteria)
```
