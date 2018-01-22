function getLoggedInUser () {
  ipcRenderer.send('getLoggedInUser');
}

function getChat (id) {
  window.currentChatId = id;
  ipcRenderer.send('getChat', id);
}

function getFullChat(){
  ipcRenderer.send('getFullChat', window.currentChatId);
}

function getChatList () {
  ipcRenderer.send('getChatList');
}

function getUnfollowers () {
  ipcRenderer.send('getUnfollowers');
}

function unfollow (userId) {
  ipcRenderer.send('unfollow', userId);
}

function newMessageArrived() {
  ipcRenderer.send("newMessageArrived");
    
  var snd = new Audio(__dirname + './newmsg.mp3');
  snd.volume = 0.005;
  snd.play();
}

// This code runs once the DOM is loaded (just in case you missed it).
document.addEventListener('DOMContentLoaded', () => {


  ipcRenderer.on('loggedInUser', (evt, user) => {
    window.loggedInUserId = user.id;
    window.loggedInUser = user;
    setProfilePic();
  });

  ipcRenderer.on('chatList', (evt, chats_) => {
        if (!window.chats.length || window.chats[0].items[0].id !== chats_[0].items[0].id) {
        window.chats = chats_
        renderChatList(window.chats)
    }
  });

  ipcRenderer.on('chat', (evt, chat_, isFullChat) => {
    let isNewMessage = (
      !window.chat.items || !window.chat.items.length ||
      !chat_.items.length || window.chat.items[0].id != chat_.items[0].id
       || getIsSeenText(chat_) != getIsSeenText(window.chat)
    )

    if ((isNewMessage || isFullChat) && isCurrentChat(chat_)) renderChat(chat_);
  });

  ipcRenderer.on('searchResult', (evt, users) => {
    renderSearchResult(users);
  });

  ipcRenderer.on('focusNotifiedChat', (evt) => {
    document.querySelector(`#${window.notifiedChatId}`).click();
  });

  ipcRenderer.on('unfollowers', (evt, users) => {
    renderUnfollowers(users);
  });

  ipcRenderer.on('webviewBack', (evt) => {
      document.querySelector('webview').goBack();
  });
  ipcRenderer.on('webviewForward', (evt) => {
      document.querySelector('webview').goForward();
  });

  document.querySelector('button.open-emoji').onclick = () => {
    const onEmojiSelected = (emoji) => {
      document.querySelector(MSG_INPUT_SELECTOR).value += emoji;
      document.querySelector('.emojis').classList.add('hide');
      document.querySelector(MSG_INPUT_SELECTOR).focus();
    }
    window.showEmojis(
      document.querySelector('.emojis-header'),
      document.querySelector('.emojis-body'),
      onEmojiSelected
    )
  }

  let searchForm = document.querySelector('.chat-list input[name=search]');
  searchForm.onkeyup = (e) => {
    const value = searchForm.value;
    const trimmedValue = value.trim()

    if (trimmedValue.length > 3) {
      ipcRenderer.send('searchUsers', searchForm.value)
    } else if (trimmedValue.length === 0) {
      renderChatList(window.chats)
    }
  }

  document.querySelector('#unfollowers').onclick = () => getUnfollowers();
  document.querySelector('#logout').onclick = () => ipcRenderer.send('logout');
  document.querySelector('#showfullchat').onclick = () => {
     getFullChat();
  }
  
  document.querySelector('#seen-flagger').onclick = (e) => {
    window.shouldSendSeenFlags = !window.shouldSendSeenFlags;
    e.target.innerText = window.shouldSendSeenFlags
      ? `DON'T SEND "SEEN" RECEIPTS`
      : `SEND "SEEN" RECEIPTS`;
  }

  // close modal viewer when esc is pressed
  document.onkeyup = (e) => {
    if (e.keyCode == 27) { // ESC keycode
      document.querySelector('.viewer').classList.remove('active');
    }

  }



  getLoggedInUser();
  getChatList();
})