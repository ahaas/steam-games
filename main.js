(function() {

MAIN = {};

MAIN.data = {};

const ownersRe = /^([\d]*)/;  // Extract the low end of the estimate.

d3.csv('data/steam.csv', (d) => {
  return {
    name: d.name,
    date: d.release_date,
    year: +d.release_date.substring(0, 4),
    developer: d.developer,
    publisher: d.publisher,
    owners: +d.owners.match(ownersRe)[0],
  };
}).then((d) => {
  MAIN.data = d;
  AREA.init('developer');
});


})();
