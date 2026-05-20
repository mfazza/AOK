---
Category: Happy Path
Title: Simple Terraform change - missing provider pin and open security group
Input:
  files:
    main.tf: |
      provider "aws" {
        region = "us-west-2"
      }

      resource "aws_security_group" "sg" {
        name = "allow_all"
        ingress {
          cidr_blocks = ["0.0.0.0/0"]
          from_port = 0
          to_port = 65535
          protocol = "tcp"
        }
      }

Expected Behavior:
- Flag missing provider version pinning (suggest pinning provider)
- Flag security group with 0.0.0.0/0 and label as High severity with suggested fix
- Output follows JSON schema and includes citations from terra-pyd-conventions

Checks:
- JSON schema validation
- At least two findings returned with severities including High
- Suggested_fix includes recommended change text
