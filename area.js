AREA = {};

(function() {

// Number of groups to create.
const NUM_AGGS = 7;

/**
 * Initialize the area chart visualization.
 *
 * aggField is the name of the field on which to aggregate.
 *     Examples: 'developer' and 'publisher'.
 */
AREA.init = (aggField) => {
  // Get top NUM_AGGS aggField values.
  let agg = d3.nest()
      .key(d => d[aggField])
      .rollup(v => d3.sum(v, d => d.owners))
      .entries(MAIN.data);
  agg.sort((a, b) => b.value - a.value);
  topAggSet = {}
  topAggKeys = []
  let i = 0;
  for (; i < NUM_AGGS; i++) {
    topAggSet[agg[i].key] = true
    topAggKeys.push(i);
  }
  topAggKeys.push(i);
  topAggs = Object.keys(topAggSet);
  topAggs.push('Other');

  let gamesByYear = d3.nest()
      .key(d => d.year)
      .key(d => {
        if (topAggSet[d[aggField]]) {
          return d[aggField];
        } else {
          return 'Other';
        }
      })
      .rollup(v => d3.sum(v, d => d.owners))
      .entries(MAIN.data);
  gamesByYear.sort((a, b) => b.key - a.key);
  gamesByYear = gamesByYear.filter((d) =>
    +d.key >= 2000 && +d.key <= 2018
  );

  // Get the top games for each ${aggField}.
  let gamesByAgg = d3.nest()
      .key(d => d[aggField])
      .object(MAIN.data.filter(d => topAggSet[d[aggField]]));
  Object.keys(gamesByAgg).forEach((agg) => {
    // Get only the top X games, then sort by year.
    gamesByAgg[agg] = gamesByAgg[agg]
        .sort((a, b) => b.owners - a.owners)
        .slice(0, 5)
        .sort((a, b) => a.year - b.year);
  });

  const margin = {top: 10, left: 100};
  const width = 850;
  const height = 440;

  const svg = d3.select('#svg1')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleLinear([2000, 2018], [0, width]);
  const y = d3.scaleLinear([0, 3e8], [height, 0]);
  // const schemeCategory = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a", "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2", "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5"];
  const schemeCategory = d3.schemeCategory10;
  const color = d3.scaleOrdinal(topAggs, schemeCategory);

  const stacked = d3.stack()
      .keys(topAggs)
      .value((d, key) => {
          const entry = d.values.filter((v) => v.key == key)[0];
          return entry ? entry.value : 0;
      })
  (gamesByYear);

  // Horizontal grid lines.
  svg.append('g')
      .attr('class', 'gridline')
      .call(d3.axisLeft(y).tickSize(-width).tickFormat(''));
  const keyToClass = (key) => key.toLowerCase().replace(/ /, '-');
  svg.selectAll('layers')
      .data(stacked)
      .enter()
      .append('path')
          .style('fill', d => color(d.key))
          .attr('class', d => `vis1-area area-${keyToClass(d.key)}`)
          .attr('d', d3.area()
              .x((d, i) => x(d.data.key))
              .y0(d => y(d[0]))
              .y1(d => y(d[1]))
          )
      .on('mouseover', handleMouseOver)
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleMouseOut);

  // Bottom axis.
  svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));
  svg.append('text')
      .attr('x', width/2)
      .attr('y', height + margin.top + 36)
      .style('text-anchor', 'middle')
      .text('Year of Release');

  // Left axis.
  svg.append('g')
      .call(d3.axisLeft(y));
  svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -100)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Approximate Number of Owners');

  // Legend.
  const rectSize = 20;
  const rectMargin = 5;
  const legendX = margin.left - 50;
  svg.append('rect')
      .attr('x', legendX-15)
      .attr('y', 0)
      .attr('width', 220)
      .attr('height', 220)
      .attr('class', 'legend-bg');
  svg.selectAll('rects')
      .data(topAggs)
      .enter()
      .append('rect')
          .attr('x', legendX)
          .attr('y', (d, i) => 10 + i * (rectSize+rectMargin))
          .attr('width', rectSize)
          .attr('height', rectSize)
          .style('fill', (d) => color(d))
      .on('mouseover', handleLegendMouseOver)
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleLegendMouseOut);
  svg.selectAll('labels')
      .data(topAggs)
      .enter()
      .append('text')
          .attr('x', legendX + rectSize * 1.3)
          .attr('y', (d, i) => 20 + i * (rectSize+rectMargin))
          .text(d => d)
          .attr('text-anchor', 'left')
          .style('alignment-baseline', 'middle')
          .style('fill', (d) => color(d))
      .on('mouseover', handleLegendMouseOver)
      .on('mousemove', handleMouseMove)
      .on('mouseout', handleLegendMouseOut);

  // Legend mouseover.
  function handleLegendMouseOver(d) {
    d3.selectAll('.vis1-area').style('opacity', 0.2);
    d3.select(`.area-${keyToClass(d)}`).style('opacity', 1);
    handleMouseOver({key: d});
  }
  function handleLegendMouseOut(d) {
    d3.selectAll('.vis1-area').style('opacity', 1);
    handleMouseOut();
  }

  // Area tooltip.
  const tooltip = d3.select('#tooltip');
  function handleMouseOver(d) {
    let gameStrings = [];
    if (d.key != 'Other') {
      gameStrings = ['Top games:'];
      gamesByAgg[d.key].forEach(g => {
        gameStrings.push(`${g.year}: ${g.name} (${d3.format('.1s')(g.owners)} owners)`);
      });
    }
    tooltip
        .style('display', 'block')
        .style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY + 10) + 'px')
        .html([`<b class="tooltip-title">${d.key}</b>`]
                  .concat(gameStrings).join('<br/>'));
  }
  function handleMouseMove() {
    tooltip
        .style('left', (d3.event.pageX + 10) + 'px')
        .style('top', (d3.event.pageY + 10) + 'px')
  }
  function handleMouseOut() {
    tooltip.style('display', 'none');
  }

};

})();
