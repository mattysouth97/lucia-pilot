output "instance_public_ip" {
  description = "Public IP address of the k6 load-test EC2 instance."
  value       = aws_instance.loadtest.public_ip
}

output "s3_results_bucket" {
  description = "Name of the S3 bucket where k6 result JSON artifacts are uploaded."
  value       = aws_s3_bucket.results.bucket
}

output "ssh_command" {
  description = "Ready-to-paste SSH command for the PM to connect to the load-test instance."
  value       = "ssh -i <your-key.pem> ubuntu@${aws_instance.loadtest.public_ip}"
}
