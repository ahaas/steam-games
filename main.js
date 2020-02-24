(function() {

MAIN = {};

MAIN.data = {};

d3.csv('data/steam.csv', (d) => {
  return {
    name: d.name,
  };
}).then((d) => {
  console.log(d);
  MAIN.data = d;
});


})();
