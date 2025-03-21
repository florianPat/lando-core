# Build Example

This example exists primarily to test the following documentation:

* [Build Steps](https://docs.lando.dev/config/services.html#build-steps)
* [Overrides](https://docs.lando.dev/config/services.html#overrides)
* [Using Dockerfiles](https://docs.lando.dev/config/services.html#using-dockerfiles)

See the [Landofiles](https://docs.lando.dev/config/lando.html) in this directory for the exact magicks.

## Start up tests

```bash
# Should start successfully and verify build steps run at more or less the right times
lando poweroff
lando start
```

## Verification commands

Run the following commands to verify things work as expected

```bash
# Should have mounted overridden nginx volume
lando exec nginx -- cat /var/www/test.txt | grep MOUNTED

# Should have injected overridden envvar into nginx
lando exec nginx -- env | grep THING=STUFF

# Should have built appserver from a custom docker image
lando exec appserver -- env | grep CUSTOM=PIROG

# Should be able to rebuild without pulling local image
lando rebuild -y

# Should rerun build steps even if containers are manually removed and stuff
lando destroy -y
lando start -y
docker rm -f lando-build_nginx_1
docker rm -f lando-build_appserver_1
lando start -y
lando exec appserver -- vim --version
lando exec appserver -- cat /var/www/build.txt
lando exec appserver -- cat /run_as_root.txt
lando exec appserver -- cat /var/www/run.txt

# Should be able to set the timezone in a Lando service.
# This tests the 'How do I set the timezone in a Lando service?' guide.
# https://docs.lando.dev/guides/how-do-i-set-the-timezone-of-a-lando-service.html
lando exec nginx -- date | grep -E "EST|EDT"

# Should be able to handle running things from different directories when building from local dockerfile
# https://github.com/lando/lando/issues/2102
cd php
lando exec appserver -- pwd | grep /app/php
```

## Destroy tests

```bash
# Should destroy successfully
lando destroy -y
lando poweroff

# Should remove custom image
docker rmi --force pirog/php:7.1-fpm-custom
```
