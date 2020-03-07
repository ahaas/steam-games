GOTY = {};

(function() {

const prepData = () => {

  let gamesByYear = d3.nest()
      .key(d => d.year)
      .object(MAIN.data);

  // For each year...
  Object.keys(gamesByYear).map(year => {
    // Sort games in `year` by owners.
    gamesByYear[year].sort((g1, g2) => g2.owners - g1.owners);

    // Filter out the non-top games.
    const maxOwners = gamesByYear[year][0].owners;
    let maxOwners2 = -1;
    let i = 0;  // Will be set to the first index with fewer than maxOwners.
    let j = 0;  // Will be set to the first index with fewer than maxOwners2.

    for (; j < gamesByYear[year].length; j++) {
      if (maxOwners2 < 0 && gamesByYear[year][j].owners < maxOwners) {
        maxOwners2 = gamesByYear[year][j].owners;
        i = j;
      }
      if (maxOwners2 > 0 && gamesByYear[year][j].owners < maxOwners2) {
        break;
      }
    }
    if (i == 0) {
      i = 1;
      j = 1;
    }

    gamesByYear[year] = {
      max: gamesByYear[year].slice(0, i),
      runnersUp: gamesByYear[year].slice(i, j),
    };
  });

  return gamesByYear;

};

GOTY.init = () => {

  const gamesByYear = prepData();
  console.log(gamesByYear);
  const container = document.getElementById('vis2');
  for (let i=2000; i <= 2019; i++) {
    const max = gamesByYear[i].max[0].name;
    container.innerHTML += `<div data-year="${i}" class="goty-year"></div>`
  }
  Array.from(document.getElementsByClassName('goty-year'))
      .forEach(div => {
        const year = div.getAttribute('data-year')
        div.innerHTML = `<div class="year-label">${year}</div>`;
      });

}

})();
