// Constants
const margin = { top: 30, right: 100, bottom: 30, left: 100 };
const width = 800 - margin.left - margin.right;
const height = 600 - margin.top - margin.bottom;

// SVG Container
const svg = d3.select("#chart")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Province list container
const provinceListContainer = d3.select("#province-list");

// Load data
d3.csv("https://tungth.github.io/data/vn-provinces-data.csv", rowConverter)
    .then(data => {
        let sortCriterion = "GRDP-VND";
        let remainingProvinces = data.slice(20); // Provinces not on the chart

        // Draw initial chart
        drawChart(data.slice(0, 20), sortCriterion);
 
        // Update province list
        updateProvinceList(remainingProvinces);

        // Add button event listener
        d3.select("#add-btn").on("click", () => {
            provinceListContainer.style("display", "block");
        });
        // Remove button event listener
        d3.select("#remove-btn").on("click", () => {
            // Remove last province from data
            data.pop();

            // Remove the last province's bar and label
            svg.select(".bar:last-of-type").remove();
            svg.select(".province-label:last-of-type").remove();

            // Remove the bottom tick and label from the Y-axis scale
            svg.select(".y-axis")
                .selectAll("g.tick")
                .filter(function(d, i) {
                    return i === data.length;
                })
                .remove(); 
        
            // Update Y-axis scale
            y.domain(data.map((d, i) => i + 1));
        
            // Update Y-axis
            svg.select(".y-axis")
                .transition()
                .duration(500)
                .call(yAxis);

            // Update chart with transition
            drawChart(data.slice(0, 20), sortCriterion);
        });


        // Province list event listener
        provinceListContainer.on("click", function () {
            const selectedProvince = d3.event.target.textContent;
            const newProvince = remainingProvinces.find(d => d.province === selectedProvince);
            if (newProvince) {
                // Add new province to data
                data.push(newProvince);

                // Update remaining provinces list
                remainingProvinces = remainingProvinces.filter(d => d.province !== selectedProvince);
                updateProvinceList(remainingProvinces);

                // Hide province list container
                provinceListContainer.style("display", "none");

                // Update chart with transition
                drawChart(data.slice(0, 20), sortCriterion);
            }
        });
    })
    .catch(error => console.log(error));

// Function to draw chart
function drawChart(data, sortCriterion) {
    // Sort data based on criterion
    data = data.sort((a, b) => {
        if (sortCriterion === "name") {
            return d3.ascending(a[sortCriterion], b[sortCriterion]);
        } else {
            return b[sortCriterion] - a[sortCriterion];
        }
    });

    // Update scales
    const x = d3.scaleLinear()
        .domain([0, d3.max(data, d => d["GRDP-VND"])])
        .range([0, width]);

    const y = d3.scaleBand()
        .domain(data.map((d, i) => i + 1))
        .range([0, height])
        .padding(0.1);

    // Define the color scale
    const colorScale = d3.scaleSequential()
        .domain([0, data.length - 1])
        .interpolator(d3.interpolateYlOrRd); // Using the YlOrRd (Yellow to Red) color scheme

    // Update axes
    const xAxis = d3.axisBottom(x)
        .ticks(5)
        .tickFormat(d => Math.round(d / 100));
    const yAxis = d3.axisLeft(y).tickFormat(d => (data[d - 1]["GRDP-VND"] / 100).toFixed(2));

    svg.selectAll(".x-axis").remove();
    svg.selectAll(".y-axis").remove();

    svg.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${height})`)
        .call(xAxis)
        .append("text")
        .attr("x", width)
        .attr("y", 20)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("GRDP in VND");

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -50)
        .attr("dy", "0.71em")
        .attr("fill", "#000")
        .text("Sorted by GRDP VND");

    // Enter, update, exit
    const bars = svg.selectAll(".bar")
        .data(data, (d, i) => i + 1);

    // Exit 
    bars.exit()
        .transition()
        .duration(500)
        .attr("width", 0)
        .remove();

    // Enter
    const enterBars = bars.enter()
        .append("rect")
        .attr("class", "bar")
        .attr("y", (d, i) => y(i + 1))
        .attr("height", y.bandwidth())
        .attr("fill", "none")
        .attr("width", 0);

    // Update
    bars.merge(enterBars)
        .transition()
        .duration(500)
        .attr("fill", (d, i) => colorScale(data.length - i - 1)) // Assign color based on index
        .attr("width", (d) => x(d["GRDP-VND"]))
        .attr("y", (d, i) => y(i + 1))
        .attr("height", y.bandwidth());

    // Province labels at the end of bars
    svg.selectAll(".province-label").remove();
    svg.selectAll(".province-label")
        .data(data)
        .enter()
        .append("text")
        .attr("class", "province-label")
        .attr("x", d => x(d["GRDP-VND"]))
        .attr("y", (d, i) => y(i + 1) + y.bandwidth() / 2)
        .attr("dx", 5)
        .attr("dy", "0.35em")
        .text(d => d.province);
}

// Function to update province list
function updateProvinceList(provinces) {
    const listItems = provinceListContainer.selectAll("p").data(provinces);
    listItems.exit().remove();
    listItems.enter().append("p").merge(listItems).text(d => d.province);
}

// Function to convert data types
function rowConverter(row) {
    return {
        province: row.province,
        "GRDP-VND": +row["GRDP-VND"].replace(",", ""),
        "GRDP-USD": +row["GRDP-USD"]
    };
}
