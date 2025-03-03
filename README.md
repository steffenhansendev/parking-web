# [Parking Web](https://steffenhansendev.github.io/parking-web/)

## Locate an available parking lot at Frederiksbjerg now!

For [Aarhus Kommune](https://aarhus.dk/), [Sensade](https://sensade.com) has covered the city district Frederiksbjerg
with parking censors. By integrating with the [Open Data API](https://api.sensade.com/opendata/swagger/index.html)
exposing the data gathered from these, this web application implements the following:

> As a user,
>
> I want to input a location and a stall type preference
>
> Such that I can locate the available parking stall closest to this location.

This relieves the allegedly widespread customer pain of not knowing where and if a stall currently is available when
needing to park at Frederiksbjerg.

Naturally, the accuracy of the recommendation is dependent on how often new data are published by Sensade. Initially,
when the application was published, this happened approximately once each hour.

The address autocompletion capability is delivered
by [dawa-autocomplete-react](https://github.com/steffenhansendev/dawa-autocomplete-react).