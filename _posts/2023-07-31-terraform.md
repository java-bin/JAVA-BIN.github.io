---
title : Terraform
date : 2023-07-31 00:00:00 +09:00
categories : [Cloud, Terraform]
tags : [Terraform, Openstack] 
---
### Terraform for Openstack Vm Create

## Terraform Install (for Mac)

```shell
$ brew tap hashicorp/tap

$ brew install hashicorp/tap/terraform

$ brew update

$ terraform -help
```

## Terraform apply / destroy

```shell
# 명령어를 실행하면 디렉토리 내의 .tf 파일을 모두 실행한다.

$ terraform init // terraform start

$ terraform apply // start apps

$ terraform destroy // stop apps

```

## nginx 

```shell
$ vi tf-nginx.tf 
```
```shell
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0.1"
    }
  }
}

provider "docker" {}

resource "docker_image" "nginx" {
  name = "nginx"
  keep_locally = false
}

resource "docker_container" "nginx" {
  image = docker_image.nginx.image_id
  name  = "tutorial"

  ports {
    internal = 80
    external = 8000
  }
}
```

## Openstack Vm create

```shell
$ vi tf-openstack.tf 
```
```shell
# Define required providers
terraform {
required_version = ">= 0.14.0"
  required_providers {
    openstack = {
      source  = "terraform-provider-openstack/openstack"
      version = "~> 1.51.1"
    }
  }
}

# Configure the OpenStack Provider
provider "openstack" {
  auth_url    = `auth_url`
  user_name   = `user_name`
  password    = `password`
  tenant_id   = `tenant_id`
}

# Create a web server
resource "openstack_compute_instance_v2" "instance" {
  name      	  = `instance_name`
  image_id  	  = `image_id`
  flavor_id 	  = `flavor_id`
  security_groups = [`security_groups}]
  
  network {
    uuid = `network_id`
    name = `network_name`
  }
}

resource "openstack_blockstorage_volume_v3" "volume" {
  name = `volume_name`
  size = 1
}

resource "openstack_compute_volume_attach_v2" "attached" {
  instance_id = openstack_compute_instance_v2.instance.id
  volume_id   = openstack_blockstorage_volume_v3.volume.id
}
```


