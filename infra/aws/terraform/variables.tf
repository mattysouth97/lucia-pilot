variable "aws_region" {
  description = "AWS region for all resources. Seoul (ap-northeast-2) is the target for Lucia Pilot."
  type        = string
  default     = "ap-northeast-2"
}

variable "instance_ami" {
  description = <<-EOT
    AMI ID for the k6 load-test instance. Must be built with Packer before apply.
    Run: packer build infra/aws/packer/k6-loadtest.pkr.hcl
    The output AMI ID (ami-xxxxxxxxxxxxxxxxx) is set here.
    No default — this must be explicitly provided.
  EOT
  type        = string
}

variable "ssh_cidr" {
  description = <<-EOT
    CIDR block allowed to SSH into the load-test instance (port 22).
    Set to the PM's office or VPN egress IP in /32 notation, e.g. "203.0.113.10/32".
    No default — this must be explicitly provided to avoid wide-open SSH.
  EOT
  type        = string
}

variable "pm_email_for_alarms" {
  description = <<-EOT
    Email address that receives the CloudWatch billing alarm ($50 USD threshold).
    AWS will send a confirmation email — the PM must click the confirmation link
    before the alarm becomes active.
    No default — this must be explicitly provided.
  EOT
  type        = string
}

variable "project_tag" {
  description = "Value for the Project tag applied to all resources. Used as a name prefix."
  type        = string
  default     = "lucia-pilot"
}
