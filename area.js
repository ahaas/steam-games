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

  const margin = {top: 10, left: 100};
  const width = 700;
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
  const legendX = width + margin.left - 90;
  svg.selectAll('rects')
      .data(topAggs)
      .enter()
      .append('rect')
          .attr('x', legendX)
          .attr('y', (d, i) => 10 + i * (rectSize+rectMargin))
          .attr('width', rectSize)
          .attr('height', rectSize)
          .style('fill', (d) => color(d));
  svg.selectAll('labels')
      .data(topAggs)
      .enter()
      .append('text')
          .attr('x', legendX + rectSize * 1.3)
          .attr('y', (d, i) => 20 + i * (rectSize+rectMargin))
          .text(d => d)
          .attr('text-anchor', 'left')
          .style('alignment-baseline', 'middle')
          .style('fill', (d) => color(d));

};

})();
