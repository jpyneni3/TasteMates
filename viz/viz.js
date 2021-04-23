var mapContainer = d3.select('#map')
var infoContainer = d3.select('#infographic')
var historyContainer = d3.select('#History')

var w = 600
var h = 600
var global_business = []
var business_words = []
var w2 = 400
var h2 = 400
var rating_scale = d3.scaleLinear().domain([0,5]).range([1,6])
var svg = mapContainer.append('svg')
  .attr('width', w)
  .attr('height', h)
  .style("align", "center")
  .call(d3.zoom().scaleExtent([0, Infinity]).on("zoom", function () {
    svg.attr("transform", d3.event.transform)
  }))
  .append("g")

var default_html =  "Hover over a neighborhood or restaurant to see information <br/> Select a cuisine and/or set a minimum rating to filter the data <br/> Select a user to see their recommended restaurants <br/> Toggle 'Buddy Mode' to see the recommended users <br/>"


var neighborhood_tip = d3.tip()
                         .attr('class', 'd3-tip')
                         .html(function(d) {
                             return "<b>Neighborhood</b>: " + d.properties.NAME + "<br/>"
                         })
 var restaurant_tip = d3.tip()
                          .attr('class', 'd3-tip')
                          .html(function(d) {
                              return "<b>Name</b>: " + d.name + "<br/>"
                              + "<b>Rating</b>: " + d.stars + "<br/>"
                              + "<b>Cuisine</b>: " + d.cuisine + "<br/>"
                              +"<b>Neighborhood</b>: " + d.neighborhood  + "<br/>"

                          })


var business_poi = d3.csv('poi/part_1_w_neighb.csv', function(d){
      d.latitude = +d.latitude
      d.longitude = +d.longitude
      d.stars = +d.stars
      return d
  })

 var user_recs = d3.json('user_data/recommendations_for_selected_users.json')
  // List of words
  var myWords = ["Hello", "Everybody", "How", "Are", "You", "Today", "It", "Is", "A", "Lovely", "Day", "I", "Love", "Coding", "In", "My", "Van", "Mate","Hello", "Everybody", "How", "Are", "You", "Today", "It", "Is", "A", "Lovely", "Day", "I", "Love", "Coding", "In", "My", "Van", "Mate"]

business_words = d3.json('restaurant_hotwords.json')
Promise.all([d3.json('map_data/city-limits.json'),d3.json('map_data/neighborhoods.json'),business_poi, d3.csv('user_data/user_info.csv'),user_recs,business_words]).then(function(data){
    global_business = data[2]
    business_words = data[5]
    ready(data[0],data[1],data[2], data[3], data[4])
})
function ready(city_limits, hoods,businesses, users, user_recs) {
console.log("finished with part 4")
cuisines = businesses.map(d=>d.cuisine)
cuisines = Array.from(new Set(cuisines))
console.log(cuisines)

ratings = businesses.map(d=>d.stars)
ratings = Array.from(new Set(ratings))
console.log(ratings)

var menu = document.getElementById("cuisines")
var new_element = document.createElement("option")
cuisines.sort()
for (let c of cuisines){
            var new_element = document.createElement("option")
            new_element.text = c
            new_element.value = c
            menu.add(new_element)
}

var rating_menu = document.getElementById("rating_filter")
console.log(rating_menu)
var new_element = document.createElement("option")
ratings.sort()
for (let r of ratings){
            var new_element = document.createElement("option")
            new_element.text = r
            new_element.value = r
            rating_menu.add(new_element)
}

var user_menu = document.getElementById("users")
var new_element = document.createElement("option")
console.log(users)
for (let u of users){
            var new_element = document.createElement("option")
            new_element.text = u.name
            new_element.value = u.user_id
            user_menu.add(new_element)
}

var other_menu = document.getElementById("buddies")
var new_element = document.createElement("option")
console.log(other_menu)
new_element.text = 'Nikki'
new_element.value = "liO90_tbVWaGMKlabg9zoQ"
other_menu.add(new_element)

selectedCuisine = document.getElementById("cuisines").options[0].value
selectedRating = document.getElementById("rating_filter").options[0].value
selectedUser = document.getElementById("users").options[0].value
console.log(selectedCuisine)
console.log(selectedRating)
console.log(selectedUser)
createMap(city_limits, hoods,businesses,null)

// event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
     document.getElementById("cuisines").onchange = function(){
        selectedCuisine = document.getElementById("cuisines").value
        console.log(selectedCuisine)
        console.log(selectedRating)
        if (selectedRating == ""){
            console.log("not set")
        }
        // create Choropleth with default option. Call createMapAndLegend() with required arguments.
        business_filtered = businesses.filter(function(d){
            if (selectedRating == "" && selectedCuisine != ""){
                return d.cuisine == selectedCuisine
            } else if(selectedCuisine == ""){
                return d.stars >= selectedRating
            }
            else{
                return d.cuisine == selectedCuisine && d.stars >= selectedRating
            }

        })
        svg.selectAll("*").remove()
        createMap(city_limits, hoods,business_filtered,null)
    }
// event listener for the dropdown. Update choropleth and legend when selection changes. Call createMapAndLegend() with required arguments.
     document.getElementById("rating_filter").onchange = function(){
        selectedRating = document.getElementById("rating_filter").value
        console.log(selectedRating)
        if (selectedCuisine == ""){
            console.log("not set")
        }
        //create Choropleth with default option. Call createMapAndLegend() with required arguments.
        business_filtered = businesses.filter(function(d){
            if (selectedCuisine == ""){
                return d.stars >= selectedRating
            } else{
                return d.cuisine == selectedCuisine && d.stars >= selectedRating
            }

        })
        svg.selectAll("*").remove()
        createMap(city_limits, hoods,business_filtered,null)
    }

    document.getElementById("users").onchange = function(){
       selectedUser = document.getElementById("users").value
       console.log(selectedUser)
       if (selectedUser == ""){
           createMap(city_limits, hoods,businesses,null)
           return
       }
       //create Choropleth with default option. Call createMapAndLegend() with required arguments.

       svg.selectAll("*").remove()
       document.getElementById("rating_filter").selectedIndex = 0
       document.getElementById("cuisines").selectedIndex = 0
       console.log(user_recs)
       console.log(user_recs[selectedUser])
       console.log(user_recs[selectedUser]['recommended_business_id'])
       console.log(selectedUser)
       one = businesses.filter(function(d){
          return user_recs[selectedUser]['recommended_business_id'].indexOf(d.business_id) !== -1

       })
       console.log(one)
       other = "liO90_tbVWaGMKlabg9zoQ"
       two = businesses.filter(function(d){
          return user_recs[other]['recommended_business_id'].indexOf(d.business_id) !== -1

       })
       console.log(one)
       console.log(two)
       createMap(city_limits, hoods,one,user_recs[selectedUser],two, user_recs[other])
   }

}

function createMap(city_limits, hoods,businesses, recs, other_business, other_recs) {
  console.log(businesses)
  console.log(recs)
  console.log(other_business)
  console.log(other_recs)
  if (recs){
      var rec_scale = d3.scaleLinear().domain([d3.min(recs.scores),d3.max(recs.scores)]).range([2,6])
  } else{
      console.log("No recs")
  }

  if (other_recs){
      console.log("there are other recs")
      var orec_scale = d3.scaleLinear().domain([d3.min(other_recs.scores),d3.max(other_recs.scores)]).range([2,6])
  }else{
      console.log("there are no otehr recs")
  }
  var projection = d3.geoTransverseMercator()
    .rotate([83 + 10 / 60, -32])
    .fitSize([w, h], city_limits)

  var geoPath = d3.geoPath()
    .projection(projection)


  svg.call(neighborhood_tip)
  svg.call(restaurant_tip)


  svg.append('g')
    .selectAll('path')
    .data(city_limits.features)
    .enter()
    .append('path')
    .attr('d', geoPath)
    .attr('class', 'city-limits')

 console.log("drew city limits")

  // add the neighborhoods
  svg.append('g')
    .selectAll('path')
    .data(hoods.features)
    .enter()
    .append('path')
    .attr('d', geoPath)
    .attr('class', 'neighborhoods')
    .on('mouseover', function(d) {
      d3.select(this).style('fill', "#0491a8")
      console.log(neighborhood_tip)
      neighborhood_tip.show(d)
      change_div_neigh(d.properties.NAME)

    })
    .on('mouseout', function() {
     d3.select(this).style('fill', "#b8d4e4")
     neighborhood_tip.hide()
     infoContainer.html(default_html)
    })


console.log("drew neighborhoods")

 svg.selectAll("circle")
    .data(businesses)
    .enter()
    .append("circle")
    .attr("cx", function(d){
        return projection([d.longitude,d.latitude])[0]
    })
    .attr("cy", function(d){return projection([d.longitude,d.latitude])[1]})
    .attr("r", function(d){
        if (recs){
            return rec_scale(recs.scores[recs.recommended_business_id.indexOf(d.business_id)])
        }else{
            return 2
        }

    })
    .attr("fill", "#157251")
    .on('mouseover', function(d) {
        if (recs){
            score = recs.scores[recs.recommended_business_id.indexOf(d.business_id)]
            change_div_rest(d,score)
        }
        else{
            change_div_rest(d)
        }

      restaurant_tip.show(d)
    })
    .on('mouseout', function() {
        restaurant_tip.hide()
        infoContainer.html(default_html)

    })
    if (other_business){
        console.log("toggled")
        console.log(other_business)
        console.log(other_recs)
        svg.selectAll("g")
           .data(other_business)
           .enter()
           .append("circle")
           .attr("cx", function(d){
               return projection([d.longitude,d.latitude])[0]
           })
           .attr("cy", function(d){return projection([d.longitude,d.latitude])[1]})
           .attr("r", function(d){
               if (other_recs){
                   return rec_scale(other_recs.scores[other_recs.recommended_business_id.indexOf(d.business_id)])
               }else{
                   return 10
               }
           })
           .attr("fill", "#d46803")
           .on('mouseover', function(d) {
               if (recs){
                   score = other_recs.scores[other_recs.recommended_business_id.indexOf(d.business_id)]
                   change_div_rest(d,score)
               }
               else{
                   change_div_rest(d)
               }

             restaurant_tip.show(d)
           })
           .on('mouseout', function() {
               restaurant_tip.hide()
               infoContainer.html(default_html)

           })
    }



//manual legend
svg.append("text").attr("x", w-130).attr("y", h-70).attr("text-anchor", "left").style("font-size", "14px").text("Legend")
svg.append("circle").attr("cx",w-122.5).attr("cy",h-50).attr("r", 7.5).style("fill", "#157251")
svg.append("text").attr("x", w-110).attr("y", h-45).attr("text-anchor", "left").style("font-size", "12px").text("Your Restaurants")
svg.append("circle").attr("cx",w-122.5).attr("cy",h-30).attr("r", 7.5).style("fill", "#d46803")
svg.append("text").attr("x", w-110).attr("y", h-25).attr("text-anchor", "left").style("font-size", "12px").text("Buddy Restaurants")

function change_div_neigh(name){
    console.log("in change div")
    display = "<b>Neighborhood</b>: " + name + "<br/>"
    infoContainer.html(display)
    // var imgs = svg.selectAll("img").data([0])
    // url = "./pics/harshith.jpeg"
    // infoContainer.append("img").attr("src", url)
    //     .attr("x", "60")
    //     .attr("y", "-60")
    //     .attr("width", "200")
    //     .attr("height", "200");
}

function change_div_rest(d, score){

    display = "<b>Name</b>: " + d.name + "<br/>"
    + "<b>Rating</b>: " + d.stars + "<br/>"
    + "<b>Cuisine</b>: " + d.cuisine + "<br/>"
    +"<b>Neighborhood</b>: " + d.neighborhood  + "<br/>"
    if (score){
        display = display + "<b>Recommendation Score</b>: " + score  + "<br/>"
    }
  infoContainer.html(display)
  console.log(business_words)
  console.log(d.business_id)
  if (d.business_id in business_words ){
      myWords = business_words[d.business_id].reverse()
      console.log(myWords)
  } else{
      myWords = ["This", "is", "a", "test","This", "is", "a", "test","This", "is", "a", "test","This", "is", "a", "test"]
  }



  var size_scale = d3.scaleLinear().domain([0,11]).range([15,50])
  var color = d3.scaleQuantize().domain([0,11]).range(['#feedde','#fdbe85','#fd8d3c','#d94701'])
          // set the dimensions and margins of the graph
    var margin = {top: 10, right: 10, bottom: 10, left: 10},
        width = 450 - margin.left - margin.right,
        height = 450 - margin.top - margin.bottom;

    // append the svg object to the body of the page
    var viz_svg = infoContainer.append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    // Constructs a new cloud layout instance. It run an algorithm to find the position of words that suits your requirements
    // Wordcloud features that are different from one word to the other must be here
    var layout = d3.layout.cloud()
      .size([width, height])
      .words(myWords.map(function(d) { return {text: d}; }))
      .padding(3)        //space between words
      .fontSize(60)      // font size of words
      .on("end", draw);
    layout.start();

    // This function takes the output of 'layout' above and draw the words
    // Wordcloud features that are THE SAME from one word to the other can be here
    function draw(words) {
      viz_svg.append("g")
          .attr("transform", "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")")
          .selectAll("text")
            .data(words)
          .enter().append("text")
            .style("font-size", function(d) {
                return size_scale(words.indexOf(d))+ "px"; })
            .style("fill", function(d) {
                return color(words.indexOf(d))})
            .attr("text-anchor", "middle")
            .style("font-family", "Impact")
            .attr("transform", function(d) {
              return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
            })
            .text(function(d) { return d.text; });
    }
}



    if (recs){
        history_html = "What you've liked in the past: <br/>"
        console.log(recs.best_rated_restaurants)
        hist = recs.best_rated_restaurants
        console.log(global_business)
        hist_ = global_business.filter(function(d){
            return recs.best_rated_restaurants.indexOf(d.business_id) !== -1
        })
        for (r in hist_){
            history_html = history_html + hist_[r].name + "<br/>"
        }
        console.log(hist_)
        historyContainer.html(history_html)
    } else {
        historyContainer.html()
    }




}