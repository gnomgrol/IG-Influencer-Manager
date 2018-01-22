String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.split(search).join(replacement);
};
var Influencer = function (name, listID, imgURL, rating, costPP, views, sales, followerCount, engagement) {  
    this.name = name;
    this.listID = listID;
    this.imgURL = imgURL;
    this.rating = rating;
    this.costPP = costPP;
    this.views = views;
    this.sales = sales;
    this.followerCount = followerCount;
    this.engagement = engagement;
}

const {ipcRenderer} = require('electron')

function LoadJQ(){
    //inject jquery to page
    window.$ = window.jQuery = require('./js/jquery-3.2.1.min.js');

    $("#updateInfluencerButton").off();
    $(document).off("click", "#updateInfluencerButton").on("click", "#updateInfluencerButton", function(){
        var name = window.location.href.substring(window.location.href.search(".com/") + ".com/".length);
        name = name.replace("/", "");

        var data = document.documentElement.innerHTML;
        var imgURL = data.substring(data.search("<img class=\"_9bt3u\" src=\"") + "<img class=\"_9bt3u\" src=\"".length); 
        imgURL = imgURL.substring(0, imgURL.search("\"") + 1);

        var followerCount = data.substring(data.search("<span class=\"_fd86t\" title=\"") + "<span class=\"_fd86t\" title=\"".length);
        followerCount = followerCount.substring(0, followerCount.search("\"")).replaceAll(",", "").replaceAll(".", "");

        var engagement = $("#engagementLabel").html();
        engagement = engagement.substring(engagement.search("1b\">") + "1b\">".length);
        engagement = engagement.substring(0, engagement.search("</b>"));

        var rating = $("#ratingDropDown").val();
        var views = $("#viewsTextBox").val();
        var sales = $("#salesTextBox").val();
        var costPP = $("#costPPTextBox").val();
        ipcRenderer.sendToHost({type: "updateInfluencer", data: new Influencer(name, "", imgURL, rating, costPP, views, sales, followerCount, engagement)});
            
        
    });
        
    $("#openChatButton").off();
    $(document).off("click", "#openChatButton").on("click", "#openChatButton", function(event){
        var name = window.location.href.substring(window.location.href.search(".com/") + ".com/".length);
        name = name.replace("/", "");
        ipcRenderer.sendToHost({type: "openChat", data: name}); 
            
        $("#openChatButton").text("Opening... ->");
        setTimeout(function(){$("#openChatButton").text("Open Chat");}, 1000);
        event.stopPropagation();
    });

        

    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "https://cdnjs.cloudflare.com/ajax/libs/dygraph/2.1.0/dygraph.min.css"
    }).appendTo("head");	
    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "https://socialblade.com/css/main.css?version=9001.86437"
    }).appendTo("head");
    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "https://socialblade.com/css/jquery.tags.css?version=9001.86437"
    }).appendTo("head");
    $("<link/>", {
        rel: "stylesheet",
        type: "text/css",
        href: "https://socialblade.com/css/jquery.nouislider.min.css"
    }).appendTo("head");

}


window.addEventListener('load', ()  => {
    LoadJQ();
});


function addCustomHMTL(data){
    if (window.jQuery) {}else{
        LoadJQ();
    }
    var html = "<div id='statsDiv' style='display: block; float: left;'>"
        
    + "<div class='dataDiv'></div>"
    + "<div class='dataDiv'><div class='dataPartDiv'><p class='dataTex'>Rating:</p><select class='dataFieldNum' id='ratingDropDown'>"
    + "<option value='0' selected='selected'>Not Rated Yet</option>"
    + "<option value='1'>Useless / Botted / Expensive</option>"
    + "<option value='2'>Page was Overused</option>"
    + "<option value='3'>Watching Page</option>"
    + "<option value='4'>Needs More Testing</option>"
    + "<option value='5'>Breaks About Even</option>"
    + "<option value='6'>Good First Posts</option>"
    + "<option value='7'>Perfect, Use Often</option></select></div>"
    + "<div class='dataPartDiv'><p class='dataTex'>Views on Page:</p><input class='dataFieldNum' type='number' id='viewsTextBox'></div>"
    + "<div class='dataPartDiv'><p class='dataTex'>Sales per Post:</p><input class='dataFieldNum' type='number' id='salesTextBox'></div>"
    + "<div class='dataPartDiv'><p class='dataTex'>Cost per 12h:</p><input class='dataFieldNum' type='number' id='costPPTextBox'></div>"
    + "<button class='onPageButton' id='updateInfluencerButton'>Update</button></div>"

	
    + "<div class='dataDiv'>"
    + "<div class='dataDiv'><p id='engagementLabel' style='line-height: 30px; font-size: 30px; display: block; margin: 0 auto; text-align: center;'></p>"
    + "<button class='onPageButton' id='openChatButton'> Open Chat </button></div>"
    + "<div id='sbDiv'></div>"
    + "</div>"    


    + "</div>";

    

    $("main").remove("#statsDiv");

    $("main").prepend(html);

    if(data != undefined){
        $("#ratingDropDown").val(data.rating);
        $("#viewsTextBox").val(data.views);
        $("#salesTextBox").val(data.sales);
        $("#costPPTextBox").val(data.costPP);
    }

}
 
ipcRenderer.on('showInfluencerData', (evt, data) => {  
    addCustomHMTL(data);
})

ipcRenderer.on('editEngagement', (evt, data) => {
    $("#engagementLabel").html(data.msg);
})

ipcRenderer.on('triggerUpdate', (evt, data) => {
    setTimeout(function() { $("#updateInfluencerButton").trigger("click"); }, 3000);
})


ipcRenderer.on('editGraph', (evt, d) => {

    var script2 = document.createElement("script");
    script2.src = "https://cdnjs.cloudflare.com/ajax/libs/dygraph/2.1.0/dygraph.min.js";
    script2.onload = function() {
    
        var data = d.msg;
        var table = data.substring(data.search("<div style=\"width: 880px; float: left;\">"), data.search("<div class=\"TableAverages\"") - "<div class=\"TableAverages\"".length);
    
			
        data = data.substring(data.search("<div id=\"DailyFollowersGraph"));
        var script = data.substring(data.search("<script"), data.search("</script>"));
        if(script.indexOf("DailyFollowersGraph") == -1){return;}
        script = script.replace("ylabel: 'Total Followers',", "");
        script = script.replace("always", "never");

        script = script.replace("<script type=\"text/javascript\">", "");
        script = script.replace("</script>", "");
		
        data = data.substring(0, data.search("</div>"));
			
			
        table = "<div class='content-container'>" + table + "</div>";
        data = "<div class='content-container' style='width: 800px;'>" + data + "</div>";
        data = data.replaceAll("860px", "700px");
			
        $("#sbDiv").html(data + table);
			
        var divs = $( "div" );
        $("#statsDiv").find(divs).css("display", "block");
	
        eval(script);
    };
    document.body.appendChild(script2);

})
