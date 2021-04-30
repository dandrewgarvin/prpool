provider "aws" {
  profile = "gcx"
  region  = "us-east-1"
}

terraform {
  required_providers {
    aws = {
      version = "~> 3.0.0"
    }
  }

  backend "s3" {
    bucket  = "terraform.guidecx.io"
    # Terraform doesn't support variables in the backend block. When creating a new
    # application be sure to replace the key with a valid path for your app
    key     = "<application-name-here>/terraform.tfstate"
    region  = "us-east-1"
    profile = "gcx"
    encrypt = true
  }
}

# Secrets

data "aws_ssm_parameter" "dockerhub_password" {
  name = "dockerhub-password"
}


# Container Registry

resource "aws_ecr_repository" "main" {
  name = var.application_name
  image_tag_mutability = "MUTABLE"

  image_scanning_configuration {
    scan_on_push = true
  }
}

# CodeBuild

data "template_file" "buildspec" {
  template = "${file("./assets/buildspec.yml")}"
}

resource "aws_iam_role" "codebuild" {
  description           = "Service Role for all ${var.application_name} CodeBuild projects"
  force_detach_policies = false
  max_session_duration  = 3600
  name                  = "codebuild-${var.application_name}-service-role"
  name_prefix           = null
  path                  = "/service-role/"
  permissions_boundary  = null
  assume_role_policy    = file("./assets/codebuild.role_policy.json")
}

resource "aws_iam_policy" "codebuild" {
  name        = "codebuild-${var.application_name}-policy"
  description = "access management for codebuild service account"
  
  # TODO: be sure to update this policy for your application
  policy      = file("./assets/codebuild.policy.json")

  lifecycle {
    create_before_destroy = true
  }
}

resource "aws_iam_role_policy_attachment" "codebuild" {
  role       = aws_iam_role.codebuild.name
  policy_arn = aws_iam_policy.codebuild.arn
}

resource "aws_codebuild_webhook" "main" {
  project_name = aws_codebuild_project.main.name

  filter_group {
    filter {
      exclude_matched_pattern = false
      pattern                 = "PULL_REQUEST_CREATED, PULL_REQUEST_UPDATED, PULL_REQUEST_REOPENED"
      type                    = "EVENT"
    }
  }
}

resource "aws_codebuild_project" "main" {
  badge_enabled  = true
  build_timeout  = 60
  description    = "codebuild for ${var.application_name}"
  encryption_key = "arn:aws:kms:us-east-1:984530831544:alias/aws/s3"
  name           = var.application_name
  queued_timeout = 480
  service_role   = aws_iam_role.codebuild.arn
  source_version = "master"

  cache {
    location = ""
    modes    = ["LOCAL_DOCKER_LAYER_CACHE", "LOCAL_SOURCE_CACHE"]
    type     = "LOCAL"
  }

  artifacts {
    encryption_disabled    = false
    override_artifact_name = false
    type                   = "NO_ARTIFACTS"
  }

  source {
    git_clone_depth = 1
    git_submodules_config {
      fetch_submodules = false
    }
    insecure_ssl        = false
    location            = var.github_url
    report_build_status = true
    type                = "GITHUB"

    buildspec = data.template_file.buildspec.rendered
  }

  environment {
    compute_type                = "BUILD_GENERAL1_SMALL"
    image                       = "aws/codebuild/amazonlinux2-x86_64-standard:1.0"
    image_pull_credentials_type = "CODEBUILD"
    privileged_mode             = false
    type                        = "LINUX_CONTAINER"
    
    environment_variable {
      name = "REPOSITORY_URI"
      type = "PLAINTEXT"
      value = aws_ecr_repository.main.repository_url
    }

    environment_variable {
      name  = "DOCKERHUB_PASSWORD"
      type  = "PARAMETER_STORE"
      value = data.aws_ssm_parameter.dockerhub_password.name
    }
  }

  logs_config {
    cloudwatch_logs {
      status = "ENABLED"
    }

    s3_logs {
      encryption_disabled = false
      status              = "DISABLED"
    }
  }
}