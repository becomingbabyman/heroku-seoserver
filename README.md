# heroku-seoserver

Phantom JS server used to proxy bot requests

e.g. `curl --header "x-forwarded-host: localhost:3000" http://localhost:4000/home`

will return the full HTML of /home page after Angular has populated the templates.

### heroku config

- `BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git`
- `PATH=<get original PATH and add>:vendor/phantomjs/bin`


### heroku-seoserver is derrived from seoserver

https://github.com/fouasnon/seoserver/blob/master/lib/phantom-server.js
