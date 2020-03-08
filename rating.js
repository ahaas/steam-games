RATING = {};

(function () {

RATING.init = () => {
  console.log('hello rating');
  console.log(MAIN.data);

  const data = MAIN.data.filter(d => {
      return d.owners > 1000 && d.numRatings > 50
  });

  const margin = {top: 20, left: 80};
  const width = 700;
  const height = 450;

  const svg = d3.select('#svg3').append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

  const x = d3.scaleLinear([0, 1], [0, width]);
  const y = d3.scaleLog([1e4, 1e8], [height, 0]);

  svg.selectAll('.gamept')
    .data(data)
    .enter()
    .append('circle')
        .attr('cx', d => x(d.rating))
        .attr('cy', d => y(d.owners))
        .attr('r', 1.5)
        .attr('appid', d => d.appid)
        .style('fill', '#fff');

  // Bottom axis.
  svg.append('g')
      .attr('transform', 'translate(0,' + height + ')')
      .call(d3.axisBottom(x));

  // Left axis.
  svg.append('g')
      .call(d3.axisLeft(y).tickFormat(d3.format(',d')));
};

})();
