# GoogleMapsMapboxAbstraction
So Google decided to change their whole maps API pricing structure... Anyway, we were well on our way off Google maps when that happened. In the process of becoming "self-sustaining", I tried out a ton of different open source and proprietory map-serving solutions. Ultimately, I settled on serving mapbox tiles on the back-end and using mapbox-gl on the front-end.

In the end, the mapbox-gl is much smoother until you have 100 or so HTML markers on the map, then it starts to lag a bit. According to the authors, converting markers to symbols is the way to go as symbols are rendered via WebGL -- we haven't made this change-over yet though. Also, note that IE 11 has poor WebGL performance. If either of these are an issue, you'd maybe consider going with Leaflet.

Note that while mapbox-gl is free to use, mapbox tileserver is not -- I think it's like $500-1000, but based on the ease of deployment (Docker) and it's performance, I'd say it's worth every penny. I'm currently serving mapbox tiles on a Digital Ocean droplet (4 cores / 16 GB ram) behind a load balancer which has plenty of power for our 25k map loads a day.

Note that I only ported the front-end methods that made sense for my project. Also, this is written in Angular, and is meant to be more of a guide. It should be pretty easy to port the FE code to any another framework as map stuff pretty much operates on the window object.

The Mapbox-gl script that we are using can be found at:
https://api.tiles.mapbox.com/mapbox-gl-js/v0.44.2/mapbox-gl.js

Best,

- Grant
