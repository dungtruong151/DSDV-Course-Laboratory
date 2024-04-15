
d3.csv("https://tungth.github.io/data/vn-provinces-data.csv", rowConverter)
  .then(data => {
    console.log(data);
    drawChart(data);
  });

function rowConverter(d) {
  return {
    province: d.province,
    population: +d.population,
    grdp: parseFloat(d['GRDP-VND'].replace(',', '.')), 
    area: +d.area
  };
}

function drawChart(data) {
  const svgWidth = 600;
  const svgHeight = 400;
  const margin = { top: 20, right: 20, bottom: 50, left: 80 };
  const chartWidth = svgWidth - margin.left - margin.right;
  const chartHeight = svgHeight - margin.top - margin.bottom;

  const svg = d3.select("#chart")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

  const xScale = d3.scaleLinear()
    .domain(d3.extent(data, d => d.population))
    .range([margin.left, svgWidth - margin.right]);

  const yScale = d3.scaleLinear()
    .domain([0, 180]) 
    .range([svgHeight - margin.bottom, margin.top]);

  const areaScale = d3.scaleSqrt()
    .domain(d3.extent(data, d => d.area))
    .range([3, 12]);

  const colorScale = d3.scaleSequential()
    .domain(d3.extent(data, d => d.population / d.area))
    .interpolator(d3.interpolateTurbo);

  svg.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", d => xScale(d.population))
    .attr("cy", d => yScale(d.grdp))
    .attr("r", d => areaScale(d.area))
    .attr("fill", d => colorScale(d.population / d.area));

  const xAxis = d3.axisBottom(xScale);
  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
    .attr("transform", `translate(0,${svgHeight - margin.bottom})`)
    .call(xAxis)
    .append("text")
    .attr("x", chartWidth) 
    .attr("y", -10)
    .attr("text-anchor", "end")
    .text("Population");

  svg.append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(yAxis)
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", chartWidth / 2)
    .attr("x", -chartHeight / 2) 
    .attr("dy", "-2em") 
    .attr("text-anchor", "middle")
    .text("GRDP-VND (million VND/person/year)");
}
