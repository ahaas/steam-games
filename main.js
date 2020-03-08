(function() {

MAIN = {};

MAIN.data = {};

const ownersRe = /^([\d]*)/;  // Extract the low end of the estimate.

d3.csv('data/steam.csv', (d) => {
  return {
    appid: d.appid,
    name: d.name,
    date: d.release_date,
    year: +d.release_date.substring(0, 4),
    developer: d.developer,
    publisher: d.publisher,
    owners: +d.owners.match(ownersRe)[0],
    numRatings: (+d.positive_ratings) + (+d.negative_ratings),
    rating: (+d.positive_ratings) /
             ((+d.positive_ratings) + (+d.negative_ratings)),
  };
}).then((d) => {
  MAIN.data = d;
  AREA.init('publisher');
  GOTY.init();
  RATING.init();
});


})();
