---
title : gophercloud
date : 2024-07-27 00:00:03 +09:00
categories : [Go, Openstack SDK, gophercloud]
tags : [Go, Openstack SDK, gophercloud]
---

## Openstack SDK
참고 사이트
- [개인 블로그](https://hayz.tistory.com/entry/%EB%B2%88%EC%97%AD-Go-%EB%A5%BC-%EC%9C%84%ED%95%9C-OpenStack-SDK-%EC%82%AC%EC%9A%A9%EB%B2%95)

### gophercloud
```bash
# go get gophercloud v1.13.0 [now]
go get -u github.com/gophercloud/gophercloud
```

### Provider
```go
// AuthOptions에 넣어줄 값을 가지고 와서 넣어준다.
opts := gophercloud.AuthOptions{
		IdentityEndpoint: "endpoint",
		Username:         "id",
		Password:         "password",
		DomainName:       "default",
		TenantID:         "tenantId",
	}
	
// 1. endpoint로 provider 생성 
provider, err := openstack.NewClient(config.IdentityEndpoint)
	
// 2. provider 인증 절차
err = openstack.Authenticate(provider, opts)
	
// 3. ServiceClient 생성 -> ex) NewIdentityV3 / Neutron / Compute / etc ..
identityClient, err := openstack.NewIdentityV3(providerClient, gophercloud.EndpointOpts{})
if err != nil {
	return "", fmt.Errorf("failed to create identity service client: %v", err)
}
```