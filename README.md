# heroku-seoserver

Phantom JS server designed to serve static HTML when javascript is disabled.

E.g. An Angular app serving a request to the Google bot.

Try it:
	$ curl --header "x-forwarded-host: positivespace.io" http://heroku-seoserver.herokuapp.com/christopher

This will return the full HTML of `/home` page after your javascript has updated the DOM and 10 seconds have passed.

(Optionally) You can create an event called `__htmlReady__` and trigger it from within your app when the page is loaded. heroku-seoserver will watch for this event and return immediately rather than wait for the entire 10 seconds to pass.


## Installation

1. Fork and clone the repository. heroku-seoserver.herokuapp.com is just an example running on one free dyno. If you want to handle any load you will have to create and scale your own server. 
2. `cd` into the repo and create the Heroku app 
	$ heroku apps:create example
3. Update the config vars to support multiple buildpacks, and the phantomjs path
	$ heroku config:set BUILDPACK_URL=https://github.com/ddollar/heroku-buildpack-multi.git PATH=vendor/phantomjs/bin
4. Push the server to Heroku
	$ git push heroku master:master


### Adding to an AngularJS project
heroku-seoserver is compatible with the [angular-seo module](https://github.com/steeve/angular-seo). Add it to you app and trigger it whenever a page is fully loaded.

You can trigger it for each page individually, or you can insert it on $routeChangeSuccess.
	$rootScope.$on '$routeChangeSuccess', (event, current, previous) ->
	    $timeout ->
	        $scope.htmlReady()
	    , 200


### Routing bots in Rails on Heroku
The easiest, albeit resource intensive solution, seems to be to use the Rails router as a proxy to seoserver when the user agent is a bot.

This can cause serious problems for small apps becuase it forces your Rails app to serve 2 requests. First the initial request from the bot, and second the request from heroku-seoserver. [Liberal caching](https://github.com/smothers/heroku-seoserver#caching) is a good solution, but it's not greate

#### Routes
	# Put this at the bottom of your routes file as a catch all
	# Route wildcard routes to angular for client side routing - only route URIs not URLs like .html or .jpg
	match "*path", to: "pages#wildcard", constraints: lambda { |request| !request.path.split('/').last.include?('.') }

#### Controller
	require 'net/http'

	class PagesController < ApplicationController
		def wildcard
			if request.env["HTTP_USER_AGENT"] and request.env["HTTP_USER_AGENT"].match(/\(.*https?:\/\/.*\)|Twitterbot/)
				uri = URI("http://your-heroku-seoserver.com#{request.path}")
				uri.query = URI.encode_www_form(params)
				req = Net::HTTP::Get.new(uri)
				req["x-forwarded-host"] = "www.your-domain.com"
				res = Net::HTTP.start(uri.hostname, uri.port) { |http| http.request(req) }
				render text: res.body, layout: false, :content_type => "text/html"
			else
				render :layout => 'angular', :template => 'pages/wildcard'
			end
		end
	end


### Caching
Caching of the static HTML returned by heroku-seoserver is highly recommended.

[CloudFlare](https://www.cloudflare.com/) offers free page caching and is very easy to configure.


### Local development

1. Install NPM, and PhantomJS
2. `npm install`
3. `./s` to start the server
4. `curl --header "x-forwarded-host: localhost:3000" localhost:4000/home`


#### Active use cases
[Positive Space](http://www.poisitivespace.io) - CloudFlare, Heroku, Rails, Angular - Is using an exact clone of this repo to serve bot requests.

[Consignd](http://www.consignd.com) - S3, Heroku, Rails, Angular - Is using a slight variation of this repo to serve bot requests.

(create a pull request to add your site)


##### Many thanks to

seoserver - https://github.com/fouasnon/seoserver/blob/master/lib/phantom-server.js
angularseo - https://github.com/steeve/angular-seo
yearofmoo - http://www.yearofmoo.com/2012/11/angularjs-and-seo.html
The NYC Angular Meetup - http://www.meetup.com/AngularJS-NYC/

