RATING = {};

(function () {

RATING.init = () => {
  console.log('hello rating');
  console.log(MAIN.data);

  const data = MAIN.data.filter(d => {
      return d.owners > 1000 && d.numRatings > 50
  });

  const margin = {top: 10, left: 100};
  const width = 840;
  const height = 440;

  const svg = d3.select('#svg3').append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleLinear([0, 1], [0, width]);
  const y = d3.scaleLog([1e4, 1e8], [height, 0]);

  svg.selectAll('.gamept')
    .data(data)
    .enter()
    .append('circle')
        .attr('cx', d => x(d.rating))
        .attr('cy', d => y(d.owners) + (Math.random()-0.5)*12)
        .attr('r', 3)
        .attr('appid', d => d.appid)
        .attr('class', 'gamept');

  // Bottom axis.
  svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));
  svg.append('text')
      .attr('x', width/2)
      .attr('y', height + margin.top + 36)
      .style('text-anchor', 'middle')
      .text('Percentage of Positive Ratings');

  // Left axis.
  svg.append('g')
      .call(d3.axisLeft(y)
          .tickValues([2e4, 5e4, 1e5, 2e5, 5e5, 1e6, 2e6, 5e6, 1e7, 2e7, 5e7, 1e8])
          .tickFormat(d3.format(',d')));
  svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('x', -height / 2)
      .attr('y', -90)
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .text('Approximate Number of Owners');
};

})();
