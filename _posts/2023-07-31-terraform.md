---
title : Terraform 사용해서 Openstack Vm 생성해보기
date : 2023-07-31 00:00:00 +09:00
categories : [Cloud, Terraform]
tags : [Terraform, Nginx, Openstack] 
---
## Terraform for Openstack Vm Create


### Terraform Install for Mac

```shell
$ brew tap hashicorp/tap

$ brew install hashicorp/tap/terraform

$ brew update

$ terraform -help
```

### Terraform init / apply / destroy

```shell
# 명령어를 실행하면 디렉토리 내의 .tf 파일을 모두 실행한다.
# terraform start all
$ terraform init 

# terraform start
$ terraform apply [].tf 

# terraform stop
$ terraform destroy

```

### Nginx Using Terraform

```shell
# nginx using docker
$ vi tf-nginx.tf 
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

### Openstack Vm create

```shell
# Define required providers
$ vi tf-openstack.tf 
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
  
  # name만 넣어주어도 됨
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

### Variable 선언 & 사용
```shell
variable "credentials" {
  type = map(string)
  default = {
    auth_url = `auth_url`
    user_name = `user_name`
    password = `password`
    tenant_id = `tenant_id`
  }
}

provider "openstack" {
  auth_url    = var.credentials.auth_url
  user_name   = var.credentials.user_name
  password    = var.credentials.password
  tenant_id   = var.credentials.tenant_id
}



```

### for each문 사용
```shell
variable "networks" {
  type = map(string)
  default = {
    internal-network = "192.192.10.1"
    external-network = "192.192.20.1"
    test-network = "192.192.30.1"
  }
}

resource "openstack_compute_instance_v2" "instance" {
  dynamic "network" {
    for_each = var.networks
    content {
        name = network.key
        fixed_ip_v4 = network.value
    }
  }
}



```


