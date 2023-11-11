---
title : port is already in use
date : 2021-03-02 00:00:00 +09:00
categories : [Error, Port]
tags : [Error, Port]
---
## port is already in use

### MacOS
```shell
# port check
$ lsof -i tcp:[port]

# kill pid
$ kill -9 [pid]
```

### Linux
```shell
# port check
$ netstat -a -o [| grep port]

# kill pid
$ taskkill /f /pid [pid]
```

