---
title : Kubernetes HA Install In Linux
date : 2024-02-04 00:00:00 +09:00
categories : [Cloud, Kubernetes]
tags : [Cloud, Kubernetes]
---
## Kubernetes HA 구성 using kubeadm

Kubernetes를 설치한다.

5개의 노드 (마스터 3개 / 워커 2개) 구성

### Master 3 / Worker 2 Default Setting
```shell
# each node
# swap off
$ swapoff -a
$ echo 0 > /proc/sys/vm/swappiness
$ sed -e '/swap/ s/^#*/#/' -i /etc/fstab

# docker install
$ sudo apt update
$ sudo apt install docker.io
$ sudo systemctl start docker
$ sudo systemctl enable docker

# docker daemon change for k8s
# docker daemon driver cgroupfs -> systemd setting
$ cat << EOF | sudo tee –a /etc/docker/daemon.json
{
  "exec-opts": ["native.cgroupdriver=systemd"],
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "100m"
  },
  "storage-driver": "overlay2"
}
EOF

# docker restart
$ sudo mkdir -p /etc/systemd/system/docker.service.d
$ sudo systemctl daemon-reload
$ sudo systemctl restart docker

# k8s install for ubuntu 20.04 LTS
$ sudo apt-get update
$ sudo apt-get install -y apt-transport-https ca-certificates curl
$ sudo curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/kubernetes-archive-keyring.gpg
$ echo "deb [signed-by=/usr/share/keyrings/kubernetes-archive-keyring.gpg] https://apt.kubernetes.io/ kubernetes-xenial main" | sudo tee /etc/apt/sources.list.d/kubernetes.list
$ sudo apt-get update
$ sudo apt-get install -y kubelet kubeadm kubectl
$ sudo apt-mark hold kubelet kubeadm kubectl

sudo vi /etc/hosts
[master1 ip]         master1
[master2 ip]         master2
[master3 ip]         master3
[worker1 ip]         worker1
[worker2 ip]         worker2

# 각 노드 서버에서 실행
# master1
hostnamectl set-hostname master1
# master2
hostnamectl set-hostname master2
# master3
hostnamectl set-hostname master3
# worker1
hostnamectl set-hostname worker1
# worker2
hostnamectl set-hostname worker2
```

### Master Node HAProxy Setting
```shell
# master1 node
# Master 3중 구성을 위해 HAProxy install
$ apt install haproxy
$ systemctl start haproxy
$ systemctl enable haproxy
$ vi /etc/haproxy/haproxy.cfg
defaults
    log global
    mode tcp
    option tcplog
    option dontlognull
    timeout connect 5000
    timeout client 50000
    timeout server 50000

frontend k8s-api
    bind 0.0.0.0:26443
    mode tcp
    default_backend k8s-master-nodes

backend k8s-master-nodes
    mode tcp
    balance roundrobin
    server master1 [master1 ip]:6443 check
    server master2 [master2 ip]:6443 check
    server master3 [master3 ip]:6443 check

$ systemctl restart haproxy

# HAProxy 사용했을 경우 LB를 port를 입력하
$ kubeadm init --control-plane-endpoint "<마스터 서비스 IP>:<Port>" --upload-certs --pod-network-cidr=10.244.0.0/16
```

### Master Node / Worker Node Join
```shell
# maste2 / master3 --control-plane 포함
$ kubeadm join <마스터 서비스 IP>:<Port> --token <토큰> --discovery-token-ca-cert-hash <해시> -- control-plane --certificate-key <해>
# worker1 / worker2
$ kubeadm join <마스터 서비스 IP>:<Port> --token <토큰> --discovery-token-ca-cert-hash <해시>

# join 명령어 재생성
$ kubeadm token create --print-join-command
```

### Kubectl 명령어 사용
```shell
# master node
$ mkdir -p $HOME/.kube
$ sudo cp -i /etc/kubernetes/admin.conf $HOME/.kube/config
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config

# worker node
$ mkdir -p $HOME/.kube
# master node 에서 file을 가지고온다
$ vi ~/.kube/config 
$ sudo chown $(id -u):$(id -g) $HOME/.kube/config
```

### CNI Install
```shell
# CNI install (calico)
$ kubectl apply -f https://docs.projectcalico.org/manifests/calico.yaml
```

### Kubectl Namespace Create
```shell
$ kubectl create ns common
```
