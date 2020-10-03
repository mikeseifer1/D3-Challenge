// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";

var chosenYAxis = "heatlhcare"

// function used for updating x-scale var upon click on axis label
function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
      ])
      .range([0, width]);
  
    return xLinearScale;
  
  }

function yScale(healthData, chosenYAxis) {
    // create scales
    var yLinearScale = d3.scaleLinear()
    .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2
    ])
    .range([height, 0]);

    return yLinearScale;
  
}

  // function used for updating xAxis var upon click on axis label
function renderAxesX(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
  }




function renderAxesY(newYScale, yAxis) {
var leftAxis = d3.axisBottom(newYScale);

yAxis.transition()
    .duration(1000)
    .call(leftAxis);

return yAxis;
}
// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}

function renderStateAbbr(stateAbbr, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    stateAbbr.transition()
      .duration(1000)
      .attr("x", d => newXScale(d[chosenXAxis]))
      .attr("y", d => newYScale(d[chosenYAxis]));
  
    return stateAbbr;
}
  // function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    var labelx;
    var labely;
  
    if (chosenXAxis === "age") {
      labelx = "Age:";
    }
    else  if (chosenXAxis === "poverty"){
      labelx = "Poverty:";
    }

    else {
        labelx = "Income: $"
    }


    if (chosenYAxis === "smokes") {
        labely = "Smokes:";
    }
    else  if (chosenYAxis === "healthcare"){
        labely = "Healthcare:";
    }

    else {
        labely = "Obesity: %"
    }
  

    var toolTip = d3.tip()
    .attr("class", "d3-tip")
   // .offset([80, -60])
    .style("font-size", "8px")
    .html(function(d) {
      return (`${d.state}<br>${labelx} ${d[chosenXAxis]} <br>
      ${labely} ${d[chosenYAxis]} `);
    });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function(data, index) {
        toolTip.hide(data);
        });
    
    return circlesGroup;}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData, err) {
    if (err) throw err;
// parse data
    healthData.forEach(function(data) {
        data.smokes = +data.smokes;
        data.age = +data.age;
        data.healthcare = +data.healthcare;
        data.poverty = +data.poverty;
        data.obesity = +data.obesity;
        data.income = +data.income;
    });
  console.log(healthData);
    // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);


    // append y axis
    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);



    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("class", "stateCircle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d.smokers))
    .attr("r", 12)
    .attr("opacity", ".5");


    var stateAbbr = chartGroup.selectAll("abbr")
    .data(healthData)
    .enter()
    .append("text")
    .text(d => d.abbr)
    .attr("class", "stateText")
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d.smokers))
    //.attr("r", 12)
    //.attr("opacity", ".5");
    .attr("font-size", "8px");

    // Create group for two x-axis labels
    var labelsGroupX = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .text("Poverty %");

    var ageLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 50)
        .attr("value", "age")
        .classed("inactive", true)
        .text("Age (media) ");

    var houseLabel = labelsGroupX.append("text")
        .attr("x", 0)
        .attr("y", 80)
        .attr("value", "income")
        .classed("inactive", true)
        .text("Household Income (Median) ");



// append y axis
    var labelsGroupY = chartGroup.append("g")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height/2))

    var healthLabel = labelsGroup.append("text")
        .attr("dx", "-10em")
        .attr("dy", "-2em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("active", true)
        .text("Healthcare %");

    var obeseLabel = labelsGroup.append("text")
        .attr("dx", "-10em")
        .attr("dy", "-6em")
        .attr("value", "healthcare") // value to grab for event listener
        .classed("inactive", true)
        .text("Obese %");


    var smokersLabel = labelsGroup.append("text")
        .attr("dx", "-10em")
        .attr("dy", "-4em")
        .attr("value", "smokes") // value to grab for event listener
        .classed("inactive", true)
        .text("Smokes");






// updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

// x axis labels event listener
    labelsGroupX.selectAll("text")
    .on("click", function() {
        // get value of selection
        var Xvalue = d3.select(this).attr("value");
        if (Xvalue !== chosenXAxis) {

            // replaces chosenXAxis with value
            chosenXAxis = Xvalue;

            // console.log(chosenXAxis)

            // functions here found above csv import
            // updates x scale for new data
            xLinearScale = xScale(healthData, chosenXAxis);

            // updates x axis with transition
            xAxis = renderAxesX(xLinearScale, xAxis);

            // updates circles with new x values
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            
            // Render statest
            stateAbbr = renderStateAbbr(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            // updates tooltips with new info
            circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

            // changes classes to change bold text
            if (chosenXAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                houseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenXAxis === "income") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                houseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

            else {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                houseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    })

    labelsGroupY.selectAll("text")
        .on("click", function() {   // get value of selection
            var Yvalue = d3.select(this).attr("value");
            if (Yvalue !== chosenYAxis) {
    
                // replaces chosenXAxis with value
                chosenYAxis = Yvalue;
    
                // console.log(chosenXAxis)
    
                // functions here found above csv import
                // updates y scale for new data
                yLinearScale = yScale(healthData, chosenYAxis);
    
                // updates y axis with transition
                yAxis = renderAxesY(yLinearScale, yAxis);
    
                // updates circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                
                // Render statest
                stateAbbr = renderStateAbbr(stateAbbr, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
    // changes classes to change bold text
            if (chosenYAxis === "age") {
                ageLabel
                    .classed("active", true)
                    .classed("inactive", false);
                houseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "income") {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                houseLabel
                    .classed("active", true)
                    .classed("inactive", false);
                povertyLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }

            else {
                ageLabel
                    .classed("active", false)
                    .classed("inactive", true);
                houseLabel
                    .classed("active", false)
                    .classed("inactive", true);
                povertyLabel
                    .classed("active", true)
                    .classed("inactive", false);
            }
        }
    })
})
.catch(function(error) {
    console.log(error);
});