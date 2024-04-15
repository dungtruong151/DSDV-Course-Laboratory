// Function to draw the bar chart
function drawBarChart(dataset) {
    const svg = d3.select("#bar-chart")
        .append("svg")
        .attr("width", 400)
        .attr("height", 200);

    const barWidth = 400 / dataset.length;

    svg.selectAll("rect")
        .data(dataset)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * barWidth)
        .attr("y", (d) => 200 - d)
        .attr("width", barWidth)
        .attr("height", (d) => d)
        .attr("fill", (d) => `rgb(${d}, ${d * 2}, ${d * 3})`);

    svg.selectAll("text")
        .data(dataset)
        .enter()
        .append("text")
        .text((d) => d)
        .attr("x", (d, i) => i * barWidth + barWidth / 2)
        .attr("y", (d) => 200 - d - 3)
        .attr("text-anchor", "middle");
}

// Function to draw the scatterplot
function drawScatterplot(data) {
    const scatterplot = d3.select("#scatterplot")
        .append("svg")
        .attr("width", 400)
        .attr("height", 400);

    const colorScale = d3.scaleOrdinal(d3.schemeCategory10)
        .domain(["Lab", "Midterm", "Final"]);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.midterm)])
        .range([50, 350]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.final)])
        .range([350, 50]);

    const xAxis = d3.axisBottom().scale(xScale);
    scatterplot.append("g").attr("transform", "translate(0, 350)").call(xAxis);

    const yAxis = d3.axisLeft().scale(yScale);
    scatterplot.append("g").attr("transform", "translate(50, 0)").call(yAxis);

    scatterplot.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => xScale(d.midterm))
        .attr("cy", d => yScale(d.final))
        .attr("r", 5)
        .attr("fill", d => colorScale(d.name.split('_')[0]));
}

// Function to draw the histogram
function drawHistogram(data) {
    const histogramData = d3.histogram()
        .value(d => d.total)
        .domain([0, 100])
        .thresholds(10)(data);

    const histogram = d3.select("#histogram")
        .append("svg")
        .attr("width", 400)
        .attr("height", 200);

    const xScale = d3.scaleLinear()
        .domain([0, d3.max(histogramData, d => d.length)])
        .range([0, 400]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(histogramData, d => d.x1)])
        .range([200, 0]);

    histogram.selectAll("rect")
        .data(histogramData)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * (400 / histogramData.length))
        .attr("y", d => yScale(d.length))
        .attr("width", 400 / histogramData.length - 1)
        .attr("height", d => 200 - yScale(d.length))
        .attr("fill", "steelblue");

    histogram.append("line")
        .attr("x1", 0)
        .attr("y1", 200)
        .attr("x2", 400)
        .attr("y2", 200)
        .attr("stroke", "black")
        .attr("stroke-width", 2);
}

// Read data and draw charts
d3.csv("https://tungth.github.io/data/vis-lab2-data.csv", rowConverter)
    .then(data => {
        console.log(data);
        const dataset = Array.from({length: 20}, () => Math.floor(Math.random() * 100)); // Generate dynamic data for the bar chart
        drawBarChart(dataset);
        drawScatterplot(data);
        drawHistogram(data);
    });

// CSV row conversion function
function rowConverter(row) {
    return {
        midterm: +row.Midterm,
        final: +row.Final,
        total: (+row.Midterm * 0.4) + (+row.Final * 0.6),
        name: row.Student_ID + '_' + row.Lab
    };
}
