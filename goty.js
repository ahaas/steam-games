GOTY = {};

(function() {

const MIN_YEAR = 2000;
const MAX_YEAR = 2019;

const prepData = () => {

  // Apply filters.
  let filteredData = [];
  let categoryFilter = '';
  if (document.getElementById('vis2-select-category')) {
    categoryFilter = document.getElementById('vis2-select-category').value;
  }
  if (categoryFilter == '') {
    filteredData = MAIN.data;
  } else {
    MAIN.data.forEach(g => {
      if (g.genres.includes(categoryFilter) ||
          g.categories.includes(categoryFilter)) {
        filteredData.push(g);
      }
    });
  }

  console.log('filtered: ', filteredData);

  // Organize data by year.
  let gamesByYear = d3.nest()
      .key(d => d.year)
      .object(filteredData);

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
      topGames: gamesByYear[year].slice(0, i),
      runnersUp: gamesByYear[year].slice(i, j),
    };
  });

  return gamesByYear;

};

// not in use
const getMaxTopGameOwners = (gamesByYear) => {
  let out = 0;
  for (let year=MIN_YEAR; year <= MAX_YEAR; year++) {
    const yearOwners = getTopGameOwners(gamesByYear, year);
    if (yearOwners > out) {
      out = yearOwners;
    }
  }
  return out;
}

// not in use
const getTopGameOwners = (gamesByYear, year) => {
  let out = 0;
  gamesByYear[year].topGames.forEach(g => {
    out += g.owners;
  });
  return out;
}

const drawChart = () => {
  const gamesByYear = prepData();
  const container = document.getElementById('vis2-dynamic');
  container.innerHTML = '';
  // const maxTopGameOwners = getMaxTopGameOwners(gamesByYear);
  for (let i=MIN_YEAR; i <= MAX_YEAR; i++) {
    container.innerHTML += `<div data-year="${i}" class="goty-year"></div>`
  }
  Array.from(document.getElementsByClassName('goty-year'))
      .forEach(div => {
        const year = div.getAttribute('data-year');
        // const width = getTopGameOwners(gamesByYear, year) / maxTopGameOwners * 100;
        const width = 100;
        html = ''
        html += `<div class="year-label">${year}</div>`;
        html += `<div class="games-container">`;
        html += `<div class="games-bar" style="width: ${width}%;">`;
        if (gamesByYear[year]) {
          gamesByYear[year].topGames.forEach(g => {
            html += `<div data-appid="${g.appid}" class="top-game">${g.name}</div>`;
          });
        }
        html += `</div>`
        html += `</div>`
        div.innerHTML = html;
      });
  d3.selectAll('.top-game')
      .on('mouseover', function() {
        TOOLTIP.game(this.getAttribute('data-appid'));
      })
      .on('mousemove', TOOLTIP.update)
      .on('mouseout', TOOLTIP.hide);
};

GOTY.init = () => {
  drawChart();

  // Add filters.
  const outerContainer = document.getElementById('vis2');
  d3.select(outerContainer).append('label')
      .attr('for', 'vis2-select-category')
      .html('Category: ');
  const categoriesSelector = d3.select(outerContainer).append('select')
      .attr('id', 'vis2-select-category')
      .on('change', () => {
        drawChart();
      });
  const categories = [
    '',
    'Massively Multiplayer',
    'RPG',
    'Indie',
    'Simulation',
    'Strategy',
  ];

  categoriesSelector.selectAll('option').data(categories)
      .enter().append('option')
      .attr('value', d => d)
      .text(d => d);
};

})();
