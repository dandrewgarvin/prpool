variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "application_name" {
  type        = string
  description = "Common name to be used through infrastructure spec"
}

variable "github_url" {
  type = string
  description = "Complete git repo for application. ie. https://github.com/guidecx/gcx-core.git"
}