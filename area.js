AREA = {};

(function() {

// Number of groups to create.
const NUM_AGGS = 9;

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
  console.log(topAggs, topAggKeys);

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
  console.log(gamesByYear);

  const margin = {top: 20, left: 80};
  const width = 700;
  const height = 400;

  const svg = d3.select('#svg1')
      .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleLinear([2000, 2018], [0, width]);
  const y = d3.scaleLinear([0, 3.5e8], [height, 0]);
  const color = d3.scaleOrdinal(topAggs, d3.schemeCategory10);

  const stacked = d3.stack()
      .keys(topAggKeys)
      .value((d, key) => d.values[key] ? d.values[key].value : 0)
  (gamesByYear);
  console.log(stacked);

  svg.selectAll('layers')
      .data(stacked)
      .enter()
      .append('path')
          .style('fill', d => color(d.key))
          .attr('d', d3.area()
              .x((d, i) => x(d.data.key))
              .y0(d => y(d[0]))
              .y1(d => y(d[1]))
          );

  // Bottom axis.
  svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x).tickFormat(d3.format('d')));

  // Left axis.
  svg.append('g')
      .call(d3.axisLeft(y));

  // Legend.
  const rectSize = 20;
  const rectMargin = 5;
  console.log(topAggKeys);
  svg.selectAll('rects')
      .data(topAggKeys)
      .enter()
      .append('rect')
          .attr('x', width + margin.left)
          .attr('y', (d, i) => 10 + i * (rectSize+rectMargin))
          .attr('width', rectSize)
          .attr('height', rectSize)
          .style('fill', (d) => color(d));
  svg.selectAll('labels')
      .data(topAggKeys)
      .enter()
      .append('text')
          .attr('x',width + margin.left + rectSize * 1.3)
          .attr('y', (d, i) => 20 + i * (rectSize+rectMargin))
          .text(d => d)
          .attr('text-anchor', 'left')
          .style('alignment-baseline', 'middle')
          .style('fill', (d) => color(d));

};

})();
