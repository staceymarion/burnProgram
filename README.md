# *Rx-Fire-State-Legislation*
#### Website build by Stacey Marion
#### Web map developed by Stacey Marion, Josh Riebe, Theodore Nguyen

### Objectives
1. Main Objective
    1. Visualize disparities among US states with respect to prescribed fire-related laws, permitting systems, insurance liabilty, and certification programs. 
    2. Create insights about the sails and barriers to effective application of prescribed fire.
    3. Use data to inform discussion about proposed legislative changes in Wisconsin. Use data to support proposed changes.
2. Requirements Document
3. Wireframes
    1. TBD

<img src="https://i.imgur.com/EdjUFr8.jpg" width="1024" height="768">

<img src="https://i.imgur.com/mknDTQS.jpg" width="1024" height="768">

## **Dependencies:**
* [JQuery 3.5.1](https://jquery.com/)
* [D3 6.6.0](https://d3js.org/)

## **Code Version:**
Last Updated: 2 April, 2021

### **Description:**
This interactive choropleth map, built using D3 and JQuery, will investigate State disparities in prescribed fire outcomes (acreage burned, etc) as relates to State law, permitting, and certification programs. Prior static maps exist for data circa 2018, however, these maps are difficult to access within a PDF report and do not allow a reader to make comprehensive insights about patterns of prescribed fire implementation related to multiple State-specific legislature and administrative factors.

### Interaction

| Name          | Description      | Operator                | Operand |
| ------------- |:----------------:| -----------------------:| -------:|
| State Hover | Hover over a state to trigger a popup with the state name and its associated attributes. | Retrieve: Objects | What: state name, associated attributes |
| Attribute (Accordion) Menu | Vertical side panel serves as tabs for maps with a single attribute. | Resymbolize: Attributes | What: tabs with single attribute |
| Query Panel | Modify the prepopulated parameters displayed on the map to reveal only states with specified number of fire legislations. | Filter: Location | Where: location of state |
| Results Panel | Display results from the query panel on the states which match the users' criterion. | Sequence: Objects | What: results from user's input |
| Compare | Comparison tool allows qualitative visualization of varying states of interest, i.e., comparing to states with more burning. Visualization utilizing a side-by-side panel represents each state with a number of key attributes, which can be ranked. | Filter, Retrieve: Objects | Where: Location, Who: name of the state, What: comparison of different states by filtering and ranking different attributes |
| Timeline | Scroll through different years to receive information on the year in which fire legislations were created by state. | Sequence: Objects | When: year that fire legislation was created (ex: 2018) |
| Share | Create a URL to share the map at its current modifications, which can be copied manually by the user. | Export: Location & attributes | What: user may use url to save work |

### Representation

| Layer         | Source           | Proposed Symbolization  |
| ------------- |:----------------:| -----------------------:|
| Basemap | US states, Natural Earth | Generalized state boundary outlines. Adapt for different maps |
| Legend | 2020 National Rx Fire Report | Text content |
| State Fire Councils | 2020 National Rx Fire Report | Choropleth - nominal. + Text context/popup content as link |
| State Certified Burn Programs | 2020 National Rx Fire Report | Choropleth - nominal |
| Acres Burned Per State | 2020 National Rx Fire Report | Proportional symbol |
| State Burn Permit Requirements | 2020 National Rx Fire Report | Choropleth - nominal |
| State Burn Authorization Time | 2020 National Rx Fire Report | Choropleth - nominal |
| Rx Fire Trends | 2020 National Rx Fire Report | Choropleth - nominal |
| State Liability Law | 2020 National Rx Fire Report | Choropleth - nominal |
| Regional Summaries | 2020 National Rx Fire Report | Choropleth - nominal |
| State Rx Fire Legislation | Multiple. Internal: WhatOtherStatesAreDoing.wordx | Text context or popup content |
| State Fire Dashboards | Multiple. Internal: WhatOtherStatesAreDoing.wordx | Text context or popup content as link |
| Fire Regime | LANDFIRE | Overlay |
| Wildfire Potential? | TBD | Isopleth |
| State Budget | https://www.stateforesters.org/ | Proportional Symbol |
| Fire Risk (Actuarial Data) | Mitchell and XX 2006 https://prescribedfire.org/wp-content/uploads/2018/02/WIPFC-LiabilityLetter.pdf | Isopleth |
| New Legislation | TBD | Symbol or highlight  for new legislation (within 1 or 2 years?); provide link to law or brief on law update |
| Text Introduction | Ancillary information about prescribed burning | Text box |
| Report Card Grade | Develop scoring systems | Panel |
| Case Study | Consider having a pre-made case study | Create pre-guided case study using sequenced pop-ups |




