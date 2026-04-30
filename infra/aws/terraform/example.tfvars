# example.tfvars — Lucia Pilot FR-O-001 load test
#
# Copy this file to lucia-pilot.auto.tfvars and fill in the required values.
# Do NOT commit lucia-pilot.auto.tfvars to git (it contains environment-specific
# values). Add it to .gitignore.
#
# Required variables (no defaults — terraform apply will fail without them):

# AMI ID produced by: packer build infra/aws/packer/k6-loadtest.pkr.hcl
# Example format: ami-0a1b2c3d4e5f67890
instance_ami = "ami-REPLACE_WITH_PACKER_OUTPUT"

# CIDR block for SSH access. Use your office or VPN egress IP in /32 notation.
# Example: "203.0.113.10/32"
ssh_cidr = "YOUR_IP_ADDRESS/32"

# Email address for the $50 USD billing alarm. AWS will send a confirmation.
# You must click the confirmation link before the alarm becomes active.
pm_email_for_alarms = "your-email@example.com"

# Optional — defaults shown below. Override only if needed.
# aws_region  = "ap-northeast-2"
# project_tag = "lucia-pilot"
