var tabUrl;
var getCurrentTimeFunction = 'document.getElementsByTagName("video")[0].currentTime';


/*
 * Setups and the UI and populates bookmark folder dropdown 
 */
function setup() {

  //Checks if url is youtube or not
  if (tabUrl.hostname != "www.youtube.com") {
    console.log("not youtube");
    document.querySelector("#form").classList.add("hidden");
    var form = document.querySelector("#form");
    console.log(form);
    return;
  }

  document.querySelector("#error").classList.add("hidden");
  var gettingTree = browser.bookmarks.getTree();
  gettingTree.then(populateFolderDropdown, onRejected);
}

/*
 * Setups the UI when page is not a youtube video
 */
function setupError() {
  document.querySelector("#form").classList.add("hidden");
}

function onCreated(node) {
  document.querySelector("#success").style.display = 'block';
  var name = document.querySelector("#name").value = "";
  setTimeout(function () { document.querySelector("#success").style.display = 'none'; }, 2000);
  console.log(node);
}

/*
 * Handles the save event
 */
function formPost(e) {
  //Get the current url
  browser.tabs.query({ currentWindow: true, active: true }).then(queryInfo => {
    browser.tabs.get(queryInfo[0].id).then(tab => {
      tabUrl = new URL(tab.url);
    });
  });
  //Get current
  var executing = browser.tabs.executeScript({
    code: getCurrentTimeFunction
  });
  executing.then(saveBookmark, onError);
  e.preventDefault();
}

/*
 * Saves bookmark
 */
function saveBookmark(result) {
  tabUrl.searchParams.set("t", Math.floor(result[0]));
  if (document.getElementById("trimPlayList").checked) {
    tabUrl.searchParams.delete("list");
    tabUrl.searchParams.delete("index");
  }
  var url = tabUrl.href;
  var name = document.querySelector("#name").value;
  var folder = document.querySelector("#folder").value;
  console.log("saving bookmark url: " + url + " name: " + name + " folder: " + folder);

  var createBookmark = browser.bookmarks.create({
    title: name,
    url: url,
    parentId: folder

  });
  createBookmark.then(onCreated);
}

function onExecuted(result) {
  setup();
}

function onError(error) {
  setupError();
}

/*
 * Adds a single bookmark folder to dropdown
 */
function addOption(bookmarkItem) {
  if (!bookmarkItem.url) {
    var select = document.querySelector("#folder");
    var opt = document.createElement("option");
    opt.value = bookmarkItem.id;
    opt.text = bookmarkItem.title;
    select.add(opt, null);
  }
  if (bookmarkItem.children) {
    for (let child of bookmarkItem.children) {
      addOption(child);
    }
  }
}

/*
 * Populate dropdown with all bookmark folders
 */
function populateFolderDropdown(bookmarkItems) {
  addOption(bookmarkItems[0], 0);
  document.querySelector("#folder").remove(0);
}

function onRejected(error) {
  console.log(`An error: ${error}`);
}

//Add form click event
document.querySelector("form").addEventListener("submit", formPost);

//ON loaded attemp to setup the plugin
document.addEventListener("DOMContentLoaded", function (event) {  
  browser.tabs.query({ currentWindow: true, active: true }).then(queryInfo => {
    browser.tabs.get(queryInfo[0].id).then(tab => {
      tabUrl = new URL(tab.url);

      var executing = browser.tabs.executeScript({
        code: getCurrentTimeFunction
      });
      executing.then(onExecuted, onError);
    });

  });
});
