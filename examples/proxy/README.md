# Proxy Example

This example exists primarily to test the following documentation:

* [Proxy](https://docs.devwithlando.io/config/proxy.html)

See the [Landofiles](https://docs.devwithlando.io/config/lando.html) in this directory for the exact magicks.

## Start up tests

```bash
# Should start successfully
lando poweroff
lando start
```

## Verification commands

Run the following commands to verify things work as expected

```bash
# Should start up the proxy container
docker ps | grep landoproxyhyperion5000gandalfedition

# Should return 404 when no route is found
curl -s -o /dev/null -I -w "%{http_code}" idonotexist.lndo.site | grep 404

# Should return 200 for all proxied domains
curl -s -o /dev/null -I -w "%{http_code}" http://web3.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://sub.lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://another-way-to-eighty.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://l337.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lando4.lndo.site | grep 200

# Should also work over https if ssl is true and we have certs
curl -s -o /dev/null -Ik -w "%{http_code}" https://web3.lndo.site | grep 200
curl -s -o /dev/null -Ik -w "%{http_code}" https://lando4.lndo.site | grep 200
lando info -s web3 | grep hasCerts | grep true
lando exec web4 -- cat \$LANDO_SERVICE_CERT
lando exec web4 -- env | grep LANDO_SERVICE_CERT | grep /certs/cert.crt

# Should route to a different port if specified
curl -s -o /dev/null -I -w "%{http_code}" http://another-way-to-eighty.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://web3.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lets.combine.really.lndo.site/everything/for-real | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lets.combine.things.lndo.site/everything/for-real | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://l337.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lando4.lndo.site | grep 200
lando exec php --user root -- curl -s -o /dev/null -I -w "%{http_code}" http://web3:8080 | grep 200
lando exec php --user root -- curl -s -o /dev/null -I -w "%{http_code}" http://l337:8888 | grep 200
lando exec php --user root -- curl -s -o /dev/null -I -w "%{http_code}" https://web4:8443 | grep 200

# Should handle wildcard entries
curl -s -o /dev/null -I -w "%{http_code}" http://thiscouldbeanything-lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://wild.socouldthis.lando-proxy.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://give.me.lots.lndo.site/more/subs | grep 200

# Should handle object proxy format
curl -s -o /dev/null -I -w "%{http_code}" http://web5.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://object-format.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://object-format.lndo.site/test | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://headers.l337.lndo.site | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lando4.lndo.site | grep 200

# Should handle sites in subdirectories
curl -s -o /dev/null -I -w "%{http_code}" http://lando-proxy.lndo.site/api | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lets.see.what.happens.in.a.lndo.site/subdir | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://or.in.a.deeper.lndo.site/subdirectory/tree/ | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://lets.combine.really.lndo.site/everything/for-real | grep 200
curl -s -o /dev/null -I -w "%{http_code}" http://give.me.lots.lndo.site/more/subs | grep 200
curl http://web3.lndo.site/actually-web-2 | grep "Welcome to nginx!"

# Should load in custom middleware if specified
curl http://object-format.lndo.site | grep X-Lando-Test | grep on
curl -I http://headers.l337.lndo.site | grep X-Lando-Test | grep on
curl -k https://object-format.lndo.site | grep X-Lando-Test | grep on
curl -k https://object-format.lndo.site | grep X-Lando-Test-Ssl | grep on

# Should only load secure middleware for https
curl http://object-format.lndo.site | grep X-Lando-Test-Ssl || echo $? | grep 1
curl -k https://object-format.lndo.site | grep X-Lando-Test-Ssl | grep on

# Should generate a default certs config file and put it in the right place
docker exec landoproxyhyperion5000gandalfedition-proxy-1 cat /proxy_config/default-certs.yaml | grep certFile | grep /certs/cert.crt
docker exec landoproxyhyperion5000gandalfedition-proxy-1 cat /proxy_config/default-certs.yaml | grep keyFile | grep /certs/cert.key

# Should generate proxy cert files and move them into the right location as needed
docker exec lando-proxy-web3-1 cat /proxy_config/web3.lando-proxy.yaml| grep certFile | grep "/lando/certs/web3.lando-proxy.crt"
docker exec lando-proxy-web3-1 cat /proxy_config/web3.lando-proxy.yaml| grep keyFile | grep "/lando/certs/web3.lando-proxy.key"
lando exec web4 -- cat \$LANDO_SERVICE_CERT
lando exec web4 -- env | grep LANDO_SERVICE_CERT | grep /certs/cert.crt
lando exec web4 -- cat \$LANDO_SERVICE_KEY
lando exec web4 -- env | grep LANDO_SERVICE_KEY | grep /certs/cert.key
```

## Destroy tests

```bash
# Should destroy successfully
lando destroy -y
lando poweroff
```
