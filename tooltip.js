TOOLTIP = {};

(function() {
  gamesByAppid = {};

  TOOLTIP.init = () => {
    MAIN.data.forEach(g => {
      gamesByAppid[g.appid] = g;
    });
  }

  const el = d3.select('#tooltip');
  TOOLTIP.game = (appid) => {
    const g = gamesByAppid[appid];
    let strs = [
      `<b>${g.name}</b>`,
      `<b>Owners</b>: ${d3.format('.1s')(g.owners)}`,
      `<b>Developer</b>: ${g.developer.replace(/;/g, ', ')}`,
      `<b>Publisher</b>: ${g.publisher.replace(/;/g, ', ')}`,
      `<b>Released</b>: ${g.date}`,
      `<b>Genres</b>: ${g.genres.replace(/;/g, ', ')}`,
      `<b>Positive Ratings</b>: ${Math.round(g.rating*100)}%`,
    ];
    const html = strs.join('<br/>');
    el.style('display', 'block')
      .style('left', (d3.event.pageX + 10) + 'px')
      .style('top', (d3.event.pageY + 10) + 'px')
      .html(html);
  };
  TOOLTIP.update = () => {
    el.style('left', (d3.event.pageX + 10) + 'px')
      .style('top', (d3.event.pageY + 10) + 'px')
  };
  TOOLTIP.hide = () => {
    el.style('display', 'none');
  };
})();
