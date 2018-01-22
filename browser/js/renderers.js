const Store = require('electron-store');
const storage = new Store();
//const webview = document.querySelector('webview')
const fs = require('fs');
const path = require("path");
const TabGroup = require("electron-tabs");
let tabGroup = new TabGroup();
let webview = undefined;

onload = () => {
        
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

    let maintab = tabGroup.addTab({
        title: "IG",
        src: "https://instagram.com/",
        visible: true,
        active: true,
        closable: false,    
        webviewAttributes: {
          preload: path.join(__dirname, 'preload.js'),
        }
    });
    webview = maintab.webview;
    


    // UPDATE INFLUENCER DATA
    function updateInfluencer (name, listID, imgURL, rating, costPP, views, sales, followerCount, engagement) {
        var inf = new Influencer(name, listID, imgURL, rating, costPP, views, sales, followerCount, engagement);
        window.influencerData[name] = inf;
        storage.set("influencerData", window.influencerData);
        renderInfluencers();
    }


    // LOAD DATA FROM STORAGE
    if(storage.has("influencerList")){
        window.influencerLists = storage.get('influencerList');
    }else{
        window.influencerLists = {};
        window.influencerLists.list = [];
    }
    renderInfluencerList(window.influencerLists.list);

    
    if(storage.has("influencerData")){
        window.influencerData = storage.get("influencerData");
    }else{
        window.influencerData = {};
    }
    renderInfluencers();


    // CREATE NEW LIST
    function createInfluencerList(name){
        if(name.length > 1){
            window.influencerLists.list.push(name);
            storage.set("influencerList", window.influencerLists);
            renderInfluencerList(window.influencerLists.list);
            $("#influencerListList").val(name);
            renderInfluencers();
        }
    }

    var createInfListButton = document.querySelector('.influencerCreateListButton');
    createInfListButton.onclick = () => {
        var name = $('.influencerCreateListTextbox').val();
        createInfluencerList(name);
        $('.influencerCreateListTextbox').val("")
    }

    // DELETE LIST
    var influencerDeleteListButton = document.querySelector('.influencerDeleteListButton');
    influencerDeleteListButton.onclick = () => {
        var index = window.influencerLists.list.indexOf($("#influencerListList").val());
        if (index > -1) {
            window.influencerLists.list.splice(index, 1);
        }
        storage.set("influencerList", window.influencerLists);
        renderInfluencerList(window.influencerLists.list);
        $("#influencerListList").attr('selectedIndex', 0);
        renderInfluencers();
    }
    


    // ADD INFLUENCER TO LIST
    var influencerAddToListButton = document.querySelector('.influencerAddToListButton');
    influencerAddToListButton.onclick = () => {
        var src = tabGroup.getActiveTab().webview.src;
        var username = src.substring(src.search(".com/") + ".com/".length);
        username = username.replace("/", "");
        if(username.length < 2){return;}

        var imgURL = "https://png.pngtree.com/element_pic/00/16/09/0757cee82e3b4b7.jpg";
        /*document.getElementById("view").innerHTML.substring(document.getElementById("view").innerHTML.search("<img class=\"_9bt3u\" src=\"") + "<img class=\"_9bt3u\" src=\"".length); 
        imgURL = imgURL.substring(0, imgURL.search("\"") + 1);*/

        
        var listID = $("#influencerListList").val();
        var infOld = window.influencerData[username];
        if(infOld != undefined){
            window.influencerData[username].listID = listID;
            storage.set("influencerData", window.influencerData);
        }else{
            updateInfluencer(username, listID, imgURL, 0, "", "", "", "", "");
        }
        renderInfluencers();

        tabGroup.getActiveTab().webview.send("triggerUpdate");
    }
    

    // REMOVE INFLUENCER FROM LIST
    var influencerRemoveFromListButton = document.querySelector('.influencerRemoveFromListButton');
    influencerRemoveFromListButton.onclick = () => {
        var src = tabGroup.getActiveTab().webview.src;
        var username = src.substring(src.search(".com/") + ".com/".length);
        username = username.replace("/", "");
        if(username.length < 2){return;}

        window.influencerData[username].listID = "";
        storage.set("influencerData", window.influencerData);
        renderInfluencers();
    }


    function TextFromRating(rating){
      if(rating == 0){
        return "Not Rated Yet";
      }else if(rating == 1){
        return "Useless/Botted/Idiot";
      }else if(rating == 2){
        return "Page was Overused";
      }else if(rating == 3){
        return "Watching Page";
      }else if(rating == 4){
        return "Needs More Testing";
      }else if(rating == 5){
        return "Breaks About Even";
      }else if(rating == 6){
        return "Good First Posts";
      }else if(rating == 7){
        return "Perfect, Use Often";
      }
    }

    // RENDER INFLUENCERS OF CURRENT SELECTED LIST
    function renderInfluencers(){
        var ul = document.querySelector('#influencerListDiv');
        ul.innerHTML = "";
        var listID = $("#influencerListList").val();

        var username = webview.src.substring(webview.src.search(".com/") + ".com/".length);
        username = username.replace("/", "");

        var sortedKeys = Object.keys(window.influencerData).sort(function(a,b){return window.influencerData[b].rating-window.influencerData[a].rating})

        $.each(sortedKeys, function(index, key){
            var value = window.influencerData[key];
            if(value.listID == listID){
                var rating = TextFromRating(value.rating);
                var cost = value.costPP;
                if(cost.length > 0){cost = " - $" + cost;}
                var followers = value.followerCount;
                if(parseInt(value.followerCount) > 10000){followers = "Followers: " + Math.ceil(followers/1000) + "k";}
                if(value.engagement != undefined){ followers = followers + " - "; }


                var li = document.createElement('div');
                li.style.width = "218px";
                li.style.height = "55px";
                li.style.cursor = "pointer";
                li.style.float = "left";
                li.style.overflow = "hidden";
                li.style.margin = "5px";
                li.style.marginBottom = "0px";
                li.style.padding = "10px";
                li.appendChild(dom(`<img style="margin-right: 10px; float: left;" class="thumb" src="${value.imgURL}">`));
                li.appendChild(dom(`<p style="margin: 0; float: left; max-width: 160px; overflow: hidden; text-overflow: ellipsis;">${value.name}<br><span style='font-size: 12px;'>${rating}${cost}<br/>${followers}${value.engagement}</span></p>`));
                li.style.border = "1px solid transparent";
                li.classList.add("greyBGHover");

                if(username.length > 2 && username == value.name){
                    li.style.borderBottom = "1px solid #dd3322";
                }else{
                    li.style.borderBottom = "1px solid #dddddd";
                }

                li.onclick = () => {
                    webview.loadURL(`https://instagram.com/${value.name}`);

                    var selectNameString = "#" + value.name.replaceAll(".", "\\.");
                    if($(selectNameString).length){
                        $(selectNameString).click();
                    }else{
                        $("#userSearchBar").val(value.name);
                        $("#userSearchBar").trigger('keyup');
                        setTimeout(function(){$(selectNameString).click();}, 1000);
                    }

                    renderInfluencers();
                }
                ul.appendChild(li);
            }
            
        });
    }


    var infSelect = document.querySelector('#influencerListList');
    infSelect.onchange = function(){
        renderInfluencers();
    };


    // REACT TO MESSAGES FROM PRELOAD.JS DOM
    function AddWebviewCallbacks(webv){

      // OPEN NEW TAB IN NEW TAB
      webv.addEventListener('new-window', (event) => {
        event.preventDefault()
		var newTitle = event.url.substr(event.url.indexOf(".com") + 4)
		if(newTitle.indexOf("/") > -1){
			newTitle = newTitle.substr(0, newTitle.indexOf("/"))
		}
        let newtab = tabGroup.addTab({
          title: newTitle,
          src: event.url,
          visible: true,
          webviewAttributes: {
            preload: path.join(__dirname, 'preload.js'),
          }
        });

        AddWebviewCallbacks(newtab.webview)
        
      })

      // CALLBACKS FROM PRELOAD.JS
      webv.addEventListener('ipc-message',function(event){

          var type = event.channel.type;
          var data = event.channel.data;

          if(type == "updateInfluencer"){
              var lID = "";
              if(window.influencerData[data.name] == undefined){
                lID = "";
              }else{
                lID = window.influencerData[data.name].listID;
              }
              updateInfluencer(data.name, lID, data.imgURL, data.rating, data.costPP, data.views, data.sales, data.followerCount, data.engagement);
          }
          if(type == "openChat"){
              if($("#"+data).length){
                  $("#"+data).click();
              }else{
                  $("#userSearchBar").val(data);
                  $("#userSearchBar").trigger('keyup');
                  setTimeout(function(){$("#"+data).click();}, 1000);
              }
          }
      });


      // INJECT CSS INTO BROWSER
      webv.addEventListener('dom-ready', function () {
        webv.insertCSS(fs.readFileSync(path.join(__dirname, '/css/IGstyle.css'), 'utf8'));
      });

      
      webv.addEventListener('did-finish-load', () => {OnNavigation(webv)})
      webv.addEventListener('did-frame-finish-load', () => {OnNavigation(webv)})
    }




    // LOAD ADDITIONAL DATA INTO WEBVIEW
    function OnNavigation(webv){

        if(webv.src.indexOf("instagram.com/") !== -1 && webv.lastUrl != webv.src){

            webv.lastUrl = webv.src;
            renderInfluencers();
            

            var username = webv.src.substring(webv.src.search(".com/") + ".com/".length);
            username = username.replace("/", "");
            if(username.length < 2){return;}
            //webv.openDevTools();


            webv.send("showInfluencerData", window.influencerData[username]);


            var xmlhttpPhlanx = new XMLHttpRequest();
            xmlhttpPhlanx.onreadystatechange = function() {
                if (this.readyState == 4 && this.status == 200) {
                    var data = this.responseText;
                    var str = "<span style='font-size: 20px;'>Engagement: </span><b style='color: #1b9b1b'>" + data.substring(data.search("<h4>"), data.search("</h4>")).replace("<h4>", "").replace("</h4>", "") + "</b>";
                    webv.send("editEngagement", {msg:str});

                           
                    var xmlhttpSB = new XMLHttpRequest();
                    xmlhttpSB.onreadystatechange = function() {
                        if (this.readyState == 4 && this.status == 200) {
                          webv.send("editGraph", {msg:this.responseText});
                        }
                    };

                    xmlhttpSB.open("GET", "https://socialblade.com/instagram/user/" + username, true);
                    xmlhttpSB.send();

                }
            };
            xmlhttpPhlanx.open("GET", "https://phlanx.com/engagement-calculator?insta=" + username, true);
            xmlhttpPhlanx.send();

        }
    }


    AddWebviewCallbacks(webview)
}



function renderInfluencerList(infList){
    var select = document.querySelector('#influencerListList');
    select.innerHTML = ("");
    infList.forEach((user) => {
        var ht = "<option value='"+name+"'>"+ + "</option>";
        var li = document.createElement("OPTION");
        li.setAttribute("label", `${user}`);
        li.setAttribute("value", `${user}`);
        select.appendChild(li);
    })
}


function renderMessage (message, direction, time, type) {
  var renderers = {
    mediaShare: renderMessageAsPost,
    text: renderMessageAsText,
    like: renderMessageAsLike,
    media: renderMessageAsImage,
    reel_share: renderMessageAsUserStory, // replying to a user's story
    link: renderMessageAsLink
  }

  var div = dom(`<div class="message ${direction}"></div>`);
  var divContent = dom('<div class="content"></div>');

  if (direction === 'inward') {
    var senderUsername = window.chat.accounts.find((account) => {
      return account.id == message._params.accountId
    })._params.username;
    divContent.appendChild(dom(`<p class="message-sender">${senderUsername}</p>`));
  }

  if (!type && typeof message === 'string') type = 'text';

  if (renderers[type]) renderers[type](divContent, message);
  else renderMessageAsText(divContent, '<unsupported message format>', true);

  divContent.appendChild(dom(
    `<p class="message-time">
      ${time ? formatTime(time) : 'sending ...'}
    </p>`)
  );
  div.appendChild(divContent);
  
  return div
}

function renderMessageAsPost (container, message) {
  var post = message.mediaShare._params;

  if (post.images) {
    // carousels have nested arrays before getting to image url
    var img = dom(`<img src="${post.images[0].url || post.images[0][0].url}">`);
    img.onload = () => scrollToChatBottom();
    container.appendChild(img);
  }

  if (post.caption) {
    container.appendChild(dom(`<p class="post-caption">${truncate(post.caption, 30)}</p>`));
  }
  container.classList.add('ig-media');
  container.onclick = () => renderPost(post)
}

function renderPost (post) {
  const postDom = dom('<div class="center"></div>');
  if (post.videos) {
    postDom.appendChild(dom(`<video width="${post.videos[0].width}" controls>
                                <source src="${post.videos[0].url}" type="video/mp4">
                              </video>`));
  } else if (post.carouselMedia && post.carouselMedia.length) {
    window.carouselInit(postDom, post.images.map((el) => el[0].url))
  } else {
    postDom.appendChild(dom(`<img src="${post.images[0].url}"/>`));
  }
  if (post.caption) {
    postDom.appendChild(dom(`<p class="post-caption">${post.caption}</p>`));
  }
  const browserLink = dom('<button class="view-on-ig">View on Instagram</button>')
  browserLink.onclick = () => openInBrowser(post.webLink)
  postDom.appendChild(browserLink);
  showInViewer(postDom);
}

function renderMessageAsUserStory (container, message) {
  if (message._params.reelShare.media.image_versions2) {
    var url = message._params.reelShare.media.image_versions2.candidates[0].url
    var img = dom(`<img src="${url}">`);
    img.onload = () => scrollToChatBottom();
    container.appendChild(img);
    container.classList.add('ig-media');

    container.addEventListener('click', () => {
      if (message._params.reelShare.media.video_versions) {
        const videoUrl = message._params.reelShare.media.video_versions[0].url;
        showInViewer(dom(`<video controls src="${videoUrl}">`));
      } else {
        showInViewer(dom(`<img src="${url}">`));
      }
    })
  }

  if (message._params.reelShare.text) {
    container.appendChild(document.createTextNode(message._params.reelShare.text));
  }
}

function renderMessageAsImage (container, message) {
  var url = typeof message === 'string' ? message : message._params.media[0].url
  var img = dom(`<img src="${url}">`);
  img.onload = () => scrollToChatBottom();
  container.appendChild(img);
  container.classList.add('ig-media');

  container.addEventListener('click', () => {
    showInViewer(dom(`<img src="${url}">`));
  })
}

function renderMessageAsLike (container) {
  renderMessageAsImage(container, 'img/love.png');
}

function renderMessageAsText (container, message, noContext) {
  var text = typeof message === 'string' ? message : message._params.text;
  container.appendChild(document.createTextNode(text));
  if (!noContext) container.oncontextmenu = () => renderContextMenu(text);
}

function renderMessageAsLink (container, message) {
  const { link } = message.link._params;
  const text = message.link._params.text;
  if (link.image && link.image.url) {
    var img = dom(`<img src="${link.image.url}">`);
    img.onload = () => scrollToChatBottom();
    container.appendChild(img);
  }
  // replace all contained links with anchor tags
  container.innerHTML += text.replace(URL_REGEX, (url) => {
    return `<a class="link-in-message">${url}</a>`;
  });
  container.classList.add('ig-media');
  container.onclick = () => {
    // for links that don't have protocol included
      //const url = /^(http|https):\/\//.test(link.url) ? link.url : `http://${link.url}`;
      openInBrowser(text);
  }
}

function renderContextMenu (text) {
  const menu = new Menu();
  const menuItem = new MenuItem({
    label: 'Quote Message',
    click: () => quoteText(text)
  });
  const menuItem2 = new MenuItem({
    label: 'Copy to Browser',
    click: () => openInBrowser(text)
  });
  menu.append(menuItem);
  menu.append(menuItem2);
  menu.popup();
}

function renderChatListItem (username, msgPreview, thumbnail, id) {
  var li = document.createElement('li');
  li.appendChild(dom(`<div><img class="thumb" src="${thumbnail}"></div>`));
  li.appendChild(dom(`<div class="username"><b>${username}</b><br>${msgPreview}</div>`));
  return li;
}


function renderSearchResult (users) {
  var ul = document.querySelector('.chat-list ul');
  ul.innerHTML = "";
  users.forEach((user) => {
      var li = renderChatListItem(user._params.username, 'send a message', user._params.picture);
      li.setAttribute("id", `${user._params.username}`);

    li.onclick = () => {
      setActive(li);
      if (window.chatUsers[user.id]) {
        getChat(window.chatUsers[user.id]);
      } else {
        window.currentChatId = DUMMY_CHAT_ID;
        renderChat({items: [], accounts: [user]});
      }
    }
    ul.appendChild(li);
  })
}

function renderChatList (chatList) {
  var ul = document.querySelector('.chat-list ul');
  ul.innerHTML = "";
  chatList.forEach((chat_) => {
    var msgPreview = getMsgPreview(chat_);
    var usernames = getUsernames(chat_, true);
    var thumbnail = chat_.accounts[0]._params.picture;
    var li = renderChatListItem(usernames, msgPreview, thumbnail, chat_.id);
    var fullUsername = getUsernames(chat_, false);
    li.setAttribute("id", `${fullUsername}`);

    registerChatUser(chat_);
    if (isActive(chat_)) setActive(li);
    // don't move this down!
    addNotification(li, chat_);
    chatsHash[chat_.id] = chat_;

    li.onclick = () => {
      markAsRead(chat_.id, li);
      setActive(li);
      getChat(chat_.id);
    }
    ul.appendChild(li);
  })
}

function renderChatHeader (chat_) {
  let usernames = getUsernames(chat_);
  let b = dom(`<b>${usernames}</b>`);

  if (chat_.accounts.length === 1) {
    // open user profile in browser
    b.onclick = () => webview.loadURL(`https://instagram.com/${usernames}`)
  }
  let chatTitleContainer = document.querySelector('.chat-title');
  chatTitleContainer.innerHTML = '';
  chatTitleContainer.appendChild(b);
}

function renderChat (chat_) {
  window.chat = chat_;

  var msgContainer = document.querySelector('.chat .messages');
  msgContainer.innerHTML = '';
  renderChatHeader(chat_);
  var messages = chat_.items.slice().reverse();
  messages.forEach((message) => {
    if (message._params.accountId == window.loggedInUserId) var direction = 'outward';
    else var direction = 'inward';

    var div = renderMessage(message, direction,
      message._params.created, message._params.type
    );
    msgContainer.appendChild(div);
  })
  renderMessageSeenText(msgContainer, chat_);
  scrollToChatBottom();

  addSubmitHandler(chat_);
  addAttachmentSender(chat_);
  document.querySelector(MSG_INPUT_SELECTOR).focus();
}

function renderMessageSeenText (container, chat_) {
  container.appendChild(dom(`<div class="seen italic outward">${getIsSeenText(chat_)}</div>`));
}

function renderUnfollowers (users) {
  var ul = dom(`<ul class="unfollowers"></ul>`);
  users.forEach((user) => {
    var li = dom(
      `<li>
        <img class="thumb" src="${user._params.picture}">
        <div class="">${user._params.username}</div>
      </li>`
    );
    var unfollowButton = dom(`<button class="unfollow-button">UNFOLLOW</button>`);
    unfollowButton.onclick = () => {
      unfollow(user.id);
      li.remove();
    }
    li.appendChild(unfollowButton);
    ul.appendChild(li);
  })

  showInViewer(ul);
}