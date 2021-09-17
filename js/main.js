//  DATA SOURCE = CARTO DB data table
//  see commented out sections for code appropriate to use with local geojson or topojson file (i.e. from /data)
//  to connect with CARTO DB:  
//   1. use ajax request to call carto sql api  (+ carto.js external script)
//   2. use topojson-server to transform data to a topojson (+ topojson external script)
//   3. data extracted from carto db has all lowercase header names -- change header names throughout entire main.js 

(function(){

//pseudo-global variables

var attrArray = ["acres_2017", 
                 "acres_2018", 
                 "acres_2019", 
                 "permitfee",
                 "time4permi",
                 "burnprogra", 
                 "trend_2017", 
                 "trend_2018", 
                 "trend_2019", 
                 "liabilityl", 
                 "permitrequ", 
                 "firecounci",  
                 "fcnname", 
                 "link"];

var expressed = attrArray[11]; // initial attribute expressed

var stateName = "NaN";  // pseudoglobal variable to track state activation (selection). default means no state selected

var attrcol = {
    acres_2017: {1: "#b3cde0", 2: "#6497b1", 3: "#005b96", 4: "#03396c", 5: "#011f4b"},
    acres_2018: {1: "#b3cde0", 2: "#6497b1", 3: "#005b96", 4: "#03396c", 5: "#011f4b"}, 
    acres_2019: {1: "#b3cde0", 2: "#6497b1", 3: "#005b96", 4: "#03396c", 5: "#011f4b"}, 
    burnprogra: {"Yes": "#011f4b", "No": "#b3cde081"},
    firecounci: {"Yes": "#005b96", "No": "#b3cde081", "Regional":"#011f4b"},
    liabilityl: {1:"#6497b1", 2:"#005b96", 3:"#011f4b", 4:"#b3cde081" },//"#03396c"
    permitfee: {"N/A":"#b3cde081", "Not Required":"#011f4b", "Sometimes":"#005b96", "Required":"#011f4b"},  //"#011f4b" "#005b96"
    permitrequ: {"Required":"#b3cde0", "Not Required":"#011f4b"},
    time4permi: {1:"#b3cde081", 2:"#011f4b", 3:"#005b96"},
    trend_2017: {"Down":"#b3cde0", "Same":"#005b96", "Up":"#011f4b"}, 
    trend_2018: {"Down":"#b3cde0", "Same":"#005b96", "Up":"#011f4b"}, 
    trend_2019: {"Down":"#b3cde0", "Same":"#005b96", "Up":"#011f4b"},
}; 

window.onload = setMap();

//set up choropleth map
function setMap(){ 

    var width = 700,
        height = 500;
    
    var map = d3.select(".map") // class map in bootstrap column 
        .append("svg")
        .attr("class", "map")
        .attr("width", width)
        .attr("height", height);

    var projection = d3.geoAlbersUsa()
        .scale(900)
        .translate([width / 2, height / 2]);
        
    var path = d3.geoPath() //path generator
        .projection(projection);
    
    createLegend(expressed);  

    // ajax request 
    $.getJSON("https://staceymarion.cartodb.com/api/v2/sql?q=SELECT * FROM usaStates1 WHERE the_geom IS NOT NULL&format=geojson", callback); // converted data to geojson; had to run a rewinding : https://observablehq.com/@john-guerra/d3-black-box-map
   
      function callback(data){
      var usa = data;

      var topo = topojson.topology({foo: usa});
      
      var americanStates = topojson.feature(topo, topo.objects.foo).features;

      setEnumerationUnits(americanStates, map, path);

      // update map when li items in accordion is clicked
      $(".attrli").on("click", function () {
          var id = $(this).attr("id");
          updateMap(id);
      }); 

    }; // end of callback

    //accordion menu
    $(function() {
        var Accordion = function(el, multiple) {
            this.el = el || {};
            
            this.multiple = multiple || false;
        
            var dropdownlink = this.el.find('.dropdownlink');
            
            dropdownlink.on('click',
                            { el: this.el, multiple: this.multiple },
                            this.dropdown);    
        };
    
        Accordion.prototype.dropdown = function(e) {
        var $el = e.data.el,
            $this = $(this),
            //this is the ul.submenuItems
            $next = $this.next();
    
        $next.slideToggle(); // this opens the submenu items
        $this.parent().toggleClass('open'); 
    
        if(!e.data.multiple) {
            //show only one menu at the same time
            $el.find('.submenuItems').not($next).slideUp().parent().removeClass('open');
            $el.find('.dropdownlink').not($this).parent().removeClass('open'); // this removes highlighting 
            }
        };
    
        var accordion = new Accordion($('.accordion-menu'), false); 
    });    
};

//function to add color to states
function setEnumerationUnits(americanStates, map, path) {
    var states = map.selectAll(".states")
        .data(americanStates)
        .enter()
        .append("path")
        .attr("class", function (d) {
            return "states " + d.properties.name.replace(" ", "_");  //  .states selects all state elements
        })
        .attr("id", function (d) {
            return d.properties.name.replace(" ", "_");
        }) // creates ID tag for states
        .attr("d", path)  // added
        .style("fill", function(d){
            var value = d.properties[expressed];   
            if(value) {
                return attrcol[expressed][d.properties[expressed]];  
            } else {
                return "#ccc";  
            }    
        })
        //highlight on mouseover
        .on("mouseover", function(event, d){
            highlight(d.properties);
        })
        .on("mouseout", function(event, d){
            dehighlight(d.properties);
        })
        // add click function
        .on("click", function(event, d){
            activate(d.properties);
        })

        var desc = states.append("desc")
            .text('{"stroke": "white", "stroke-width": "0.8px"}') // upon mouseover, style returns to original
};

// infolabel on click
function activate(props) {
    // this gets id of clicked state
    $(".states").click(function() {       
        stateName = this.id;    // assign id of clicked state                                                   to the global variable, referring to "id" in setEnumerationUnits 
    });

    //remove (old) label info with click
    d3.select(".infoLabel")
        .remove(); 
    d3.select(".labelTitle")
        .remove(); 
    d3.select(".labelContent")
        .remove();  

    //variables for label creation
    var labelName = props.name;
    var labelAttribute;    
    var link = props["link"];
    var cbmplink = props["link_cbmp"];                                                                   //<-------- assign a variable for our new column in order to 
    var linktext = props["fcname"];
    var linkInternal = linktext.link("firecolinks.html");

    //if, else if statements to makeup label content
    if (expressed == "acres_2017") {
        if (props[expressed] == 1) {
            labelAttribute = "<1,000 forestry acres burned in 2017";
        } else if (props[expressed] == 2) {
            labelAttribute = "1,001-50,000 forestry acres burned in 2017";
        } else if (props[expressed] == 3) {
            labelAttribute = "50,001-250,000 forestry acres burned in 2017";
        } else if (props[expressed] == 4) {
            labelAttribute = "250,001-1,000,000 forestry acres burned in 2017";
        } else if (props[expressed] == 5) {
            labelAttribute = ">1,000,000 forestry acres burned in 2017";
        };
    } else if (expressed == "acres_2018") {
        if (props[expressed] == 1) {
            labelAttribute = "<1,000 forestry acres burned in 2018";
        } else if (props[expressed] == 2) {
            labelAttribute = "1,001-50,000 forestry acres burned in 2018";
        } else if (props[expressed] == 3) {
            labelAttribute = "50,001-250,000 forestry acres burned in 2018";
        } else if (props[expressed] == 4) {
            labelAttribute = "250,001-1,000,000 forestry acres burned in 2018";
        } else if (props[expressed] == 5) {
            labelAttribute = ">1,000,000 forestry acres burned in 2018";
        };
    } else if (expressed == "acres_2019") {
        if (props[expressed] == 1) {
            labelAttribute = "<1,000 forestry acres burned in 2019";
        } else if (props[expressed] == 2) {
            labelAttribute = "1,001-50,000 forestry acres burned in 2019";
        } else if (props[expressed] == 3) {
            labelAttribute = "50,001-250,000 forestry acres burned in 2019";
        } else if (props[expressed] == 4) {
            labelAttribute = "250,001-1,000,000 forestry acres burned in 2019";
        } else if (props[expressed] == 5) {
            labelAttribute = ">1,000,000 forestry acres burned in 2019";
        };
    } else if (expressed == "permitfee") {
        if (props[expressed] == "Required") {
            labelAttribute = "Fee required with permit application";
        } else if (props[expressed] == "Sometimes") {
            labelAttribute = "Fee sometimes required with permit application";
        } else if (props[expressed] == "Not Required") {
            labelAttribute = "No fee with permit application";
        } else if (props[expressed] == "N/A") {
            labelAttribute = "Not applicable";
        };
    } else if (expressed == "time4permi") {
        if (props[expressed] == 1) {
            labelAttribute = "Not applicable";
        } else if (props[expressed] == 2) {
            labelAttribute = "Permit must be obtained at least day of burn";
        } else if (props[expressed] == 3) {
            labelAttribute = "Permit must be obtained more than 1 day before burn";
        };
    } else if (expressed == "burnprogra") {
        if (props[expressed] == "Yes") {
            if (cbmplink !== null) {
            labelAttribute =  "<a href=\'" + cbmplink+"\'>" + "Has a state-certified burn program (link)" +"</a>"}
            else {labelAttribute = "Has a state-certified burn program"
            }; 
        } else if (props[expressed] == "No") {
            labelAttribute = "Does not have state-certified burn program";
        };
    } else if (expressed == "trend_2017") {
        labelAttribute = "Trend in forestry acres burned, 2017: " + props[expressed];
    } else if (expressed == "Trend_2018") {
        labelAttribute = "Trend in forestry acres burned, 2018: " + props[expressed];
    } else if (expressed == "Trend_2019") {
        labelAttribute = "Trend in forestry acres burned, 2019: " + props[expressed];
    } else if (expressed == "liabilityl") {
        if (props[expressed] == 1) {
            labelAttribute = "Strict Liability";
        } else if (props[expressed] == 2) {
            labelAttribute = "Simple Negligence";
        } else if (props[expressed] == 3) {
            labelAttribute = "Gross Negligence";
        } else if (props[expressed] == 4) {
            labelAttribute = "No law pertaining to fire liability or unknown";
        };
    } else if (expressed == "permitrequ") {
        labelAttribute = "Permit " + props[expressed] + " to burn";
    } else if (expressed == "firecounci") {
        if (props[expressed] == "Yes" ) {         
            labelAttribute = " " + "<a href=\'" + link+"\'>"+ linktext + "</a>"; 
        } else if (props[expressed] == "No") {
            labelAttribute = "No state fire council";
        } else if (props[expressed] == "Regional") {
            labelAttribute = " "+ linkInternal ;  // linkInternal links to interal page firecolinks.html
        };
    };

    //create label
    var infoLabel = d3.select(".map")
        .append("div")
        .attr("class", "infoLabel")
        .attr("id", stateName);   
            
    var labelTitle = infoLabel.html(labelName) 
        .attr("class", "labelTitle");

    var labelContent = labelTitle.append("div")
        .html(labelAttribute)
        .attr("class", "labelContent");

};

// highlight on mouseover 
function highlight(props){
    var propsName = props.name.replace(" ","_")   
    
    var selected = d3.selectAll("." + propsName).raise() 
        .style("stroke", "white")
        .style("stroke-width", "3"); 
}; 

//dehighlighting with mouseout
function dehighlight(props){
    
    var propsName = props.name.replace(" ","_")
    var selected = d3.selectAll("." + propsName)
        .style("stroke", function(){
            return getStyle(this, "stroke")
        })
        .style("stroke-width", function(){
            return getStyle(this, "stroke-width")
        });

    function getStyle(element, styleName){
        var styleText = d3.select(element)
            .select("desc")
            .text();

        var styleObject = JSON.parse(styleText);

        return styleObject[styleName];
    };
};

// create legend
function createLegend(expressed) {

    var svg = d3.select(".legend")   
        .append("svg")  
        .attr("width", 240)
        .attr("height", 400)
        .attr("class", "svg");   
    
    //if, else if statement to choose the legend to be shown that corresponds with expressed; expressed in header title 
    if (expressed == "acres_2017") {  
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#b3cde0").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#6497b1").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 220).attr("r", 8).style("fill", "#03396c").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 250).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 10).attr("y", 100).text("Reported Agency Acres Burned").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("<1,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("1,001-50,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("50,001-250,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 222).text("250,001-1,000,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 252).text(">1,000,000").style("font-size", "16px").attr("alignment-baseline","middle");
    } else if (expressed == "acres_2018") {  
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#b3cde0").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#6497b1").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 220).attr("r", 8).style("fill", "#03396c").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 250).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 10).attr("y", 100).text("Reported Agency Acres Burned").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("<1,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("1,001-50,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("50,001-250,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 222).text("250,001-1,000,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 252).text(">1,000,000").style("font-size", "16px").attr("alignment-baseline","middle");
    } else if (expressed == "acres_2019") {  
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#b3cde0").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#6497b1").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 220).attr("r", 8).style("fill", "#03396c").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 250).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 10).attr("y", 100).text("Reported Agency Acres Burned").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("<1,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("1,001-50,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("50,001-250,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 222).text("250,001-1,000,000").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 252).text(">1,000,000").style("font-size", "16px").attr("alignment-baseline","middle"); 
    } else if (expressed == "permitfee") {
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#b3cde081").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 220).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 10).attr("y", 100).text("Burn Permit Application Fee").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("N/A").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("Not Required").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("Sometimes").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 222).text("Required").style("font-size", "16px").attr("alignment-baseline","middle");
    } else if (expressed == "time4permi") {
        svg.append("circle").attr("cx", 10).attr("cy" ,130).attr("r", 8).style("fill", "#b3cde081").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 7).attr("y", 100).text("Burn Permit Authorization").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("N/A").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("Day of Burn").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("More than 1 Day").style("font-size", "16px").attr("alignment-baseline","middle");
    } else if (expressed == "burnprogra") {
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#b3cde081").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 0).attr("y", 100).text("Certified Rx Burn Manager Program").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("Yes").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("In Development").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("No").style("font-size", "16px").attr("alignment-baseline","middle");
    } else if (expressed == "trend_2017") {
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#b3cde0").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 0).attr("y", 100).text("Trend from prior survey").style("font-size", "18px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("Down (>10% decrease)").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("Same (Within 10%)").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("Up (>10% increase)").style("font-size", "16px").attr("alignment-baseline","middle"); 
    } else if (expressed == "trend_2018") {
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#b3cde0").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 0).attr("y", 100).text("Trend from prior survey").style("font-size", "18px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("Down (>10% decrease)").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("Same (Within 10%)").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("Up (>10% increase)").style("font-size", "16px").attr("alignment-baseline","middle"); 
    } else if (expressed == "trend_2019") {
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#b3cde0").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 0).attr("y", 100).text("Trend from prior survey").style("font-size", "18px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("Down (>10% decrease)").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("Same (Within 10%)").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("Up (>10% increase)").style("font-size", "16px").attr("alignment-baseline","middle"); 
    } else if (expressed == "liabilityl") {
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#6497b1").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 220).attr("r", 8).style("fill", "#b3cde081").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 15).attr("y", 100).text("Burn Liability Law").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("Strict Liability").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("Simple Negligence").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("Gross Negligence").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 222).text("No Law").style("font-size", "16px").attr("alignment-baseline","middle");
    } else if (expressed == "permitrequ") {
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#b3cde0").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 0).attr("y", 100).text("Burn Permit Requirements").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("Required").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("Not Required").style("font-size", "16px").attr("alignment-baseline","middle");
    } else if (expressed == "firecounci") {
        svg.append("circle").attr("cx", 10).attr("cy", 130).attr("r", 8).style("fill", "#005b96").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 160).attr("r", 8).style("fill", "#b3cde081").style("stroke", "black").style("stroke-width", .5);
        svg.append("circle").attr("cx", 10).attr("cy", 190).attr("r", 8).style("fill", "#011f4b").style("stroke", "black").style("stroke-width", .5);
        svg.append("text").attr("x", 0).attr("y", 100).text("State Fire Council").style("font-size", "20px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 132).text("Yes").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 162).text("No").style("font-size", "16px").attr("alignment-baseline","middle");
        svg.append("text").attr("x", 30).attr("y", 192).text("Regional").style("font-size", "16px").attr("alignment-baseline","middle");
    }; 
};

//dropdown change event handler
function updateMap(attribute, usa) { 
    //change the expressed attribute
    expressed = attribute;

    //recolor enumeration units
    var states = d3.selectAll(".states ")
        .transition()
        .duration(1000)
        .style("fill", function(d){
            var value = d.properties[expressed];   
            if(value) {
                return attrcol[expressed][d.properties[expressed]]; 
            } else {
                return "#ccc";  
            }    
    });
   
    //update legend
    var legend = d3.select(".legend")
    var legendText = legend.append("text")
        .attr("class", "legendText")
        .style ("fill", function(d) {
            var value = expressed;
                if(value) {
                    d3.select(".svg").remove();
                    return createLegend(expressed);
                } else {
                    return "#ccc";
                }
        }); 
};

})(); // last line of main.js