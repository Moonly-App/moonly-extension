(async() => {
  // THIS IS UGLY
  // var app = chrome.runtime.getBackgroundPage();

function executeScripts(tabId, injectDetailsArray) {
  function createCallback(tabId, injectDetails, innerCallback) {
    return () => {
      chrome.tabs.executeScript(tabId, injectDetails, innerCallback);
    };
  }
  let callback = null;
  for (let i = injectDetailsArray.length - 1; i >= 0; --i) {
    callback = createCallback(tabId, injectDetailsArray[i], callback);
  }
  if (callback !== null)
    callback(); // execute outermost function
}


  executeScripts(null, [{
      file: "js/popup/bar.js"
    }
  ])


  // CHECK IF SERVER IS ALRIGHT
  async function checkServerOk(){
    let ops = await promises.getOptions();
    let canGetCats = await promises.getAllCats(ops);
    let isLoginServerOk = await promises.fetchUrl({url: globalSettings.loginUrl})
    let isQueryServerOk = await promises.fetchUrl({url: globalSettings.queryURL})

    try{
      if(canGetCats[0].data.CategoriesList){
        console.log(`Query Seems Ok`);
        return true;
      }

      if(!isLoginServerOk){
        console.warn(`Got no response from server.`);
        return false;
      }

      if(!isQueryServerOk){
        console.warn(`Seems like there is issue with insecure response from server. Try loading the url in browser.`);
        return false;
      }

    }catch(e){
      console.warn(e);
      return false;
    }
  }

  let isServerOk = await checkServerOk();
  if(!isServerOk) return false;
  // Check Logins

  function handleLoad({elems, event, loggedIn}) {
    console.log(arguments);
    if (loggedIn.status) {

      // FIXME: BAD IDEA TO PUT THESE HERE
      document.querySelector('#postStatus').classList.remove("alert-warning");
      document.querySelector('#postStatus').classList.add("alert-info");
      document.querySelector('#statusError').classList.add('hidden');

      elems.postCreator.classList.remove('hidden');
      return;
    } else {

      document.querySelector("#panel1").classList.remove('in', 'show', 'active')
      document.querySelector("#panel2").classList.add('in', 'show', 'active')

      document.querySelector('#postStatus').classList.remove("alert-info");
      document.querySelector('#postStatus').classList.add("alert-warning");
      document.querySelector('#statusError').innerHTML = `You are not logged in`;

      // elems.loginStatus.innerHTML = `Not Logged In`;
      elems.postCreator.classList.add('hidden');
      return;
    }
  }

  async function showPopupLogin({elems, loggedIn}){
    elems.loginPopupIframe.classList.remove('hidden');
    elems.loginPopupIframe.src = globalSettings.loginUrl;

    elems.loginPopupIframe.addEventListener("load", async(event) => {
      let loggedIn = await promises.isLoggedin();
      handleLoad({elems, event, loggedIn})
    });
  }

  async function dealWithLogin() {
    let loggedIn = await promises.isLoggedin();
    let elems = {
      loginPopupIframe: document.querySelector('#loginManager iframe'),
      loginStatus: document.querySelector('#loginStatus'),
      postCreator: document.querySelector('.postCreator')
    }

    if(loggedIn.status){
      handleLoad({elems, loggedIn});
    }
    await showPopupLogin({elems});
  }
  await dealWithLogin();

  // get options
  let ops = await promises.getOptions();
  if (!ValidURL(ops.url) || ops.url.match(globalSettings.domain)) // TODO: optimize this later
    return;

  // get Categoris
  let catPromise = await promises.getAllCats(ops);
  let catList = catPromise[0].data.CategoriesList;

  let categories = document.querySelector('ul.categories');
  categories.innerHTML = catList.map((cat) => {
    return `
    <li class="${cat.name}">
      <input id="${cat.name}" class="moonlyCatInput" type="checkbox" value="${cat._id}">
      <label class="moonlyCatLabel" for="${cat.name}"><img class="catImage" src="${cat.image}" /> ${cat.name}<i class="fa fa-check"></i></label>
    </li>
    `;
  }).join('');


  // GET EMBED DATA
  // get embed data for url
  let options = await promises.getOptions();
  let newQ = await queries.getEmbedData(options);
  let embedData = await promises.getDataForPayload({payload: newQ, settingsArgs: options})
  let eData = embedData[0].data.getEmbedData;

  // modified data
  let documentData = [
    {
      name: "title",
      placeholder: "Title",
      data: eData.title
    }, {
      name: "url",
      placeholder: "URL",
      data: options.url
    }, {
      name: "body",
      placeholder: "Body",
      data: eData.description
    }, {
      name: "thumbnailUrl",
      placeholder: "Thumbnail URL",
      data: eData.thumbnailUrl
    }
  ];

  let imageThumbnail = [
    {
      name: "thumbnailUrl",
      placeholder: "Thumbnail URL",
      data: eData.thumbnailUrl
    }
  ];

  let thumbdata = document.querySelector('div.thumbimageplace');
  thumbdata.innerHTML = imageThumbnail.map((part) => {
    return `
      ${part.data ? `<div class="popupThumbImg" style="background-image:url('${ (part.data || '')}')"/></div>`: ""}
    `;
  }).join('');

  /*
  let imageThumbnail = [
    {
      name: "thumbnailUrl",
      placeholder: "Thumbnail URL",
      data: eData.thumbnailUrl
    }
  ];

  let thumbdata = document.querySelector('div.thumbimageplace');
  thumbdata.innerHTML = imageThumbnail.map((part) => {
    return `
      ${part.data ? `<div class="popupThumbImg" style="background-image:url('${ (part.data || '')}')"/></div>`: ""}
    `;
  }).join('');
*/
  let postdata = document.querySelector('ul.postdata');
  postdata.innerHTML = documentData.map((part) => {
    return `
    <li>
      <textarea type="text" name="${part.name}" placeholder="${ (part.data || '')}">${ (part.data || '')}</textarea>
    </li>
    `;
  }).join('');

  document.querySelector('#post').addEventListener('click', async function() {
    // get post data
    let postdata = promises.getInputValues(`ul.postdata > li > textarea[type="text"]`)
    let categories = promises.getSelectedCheckboxes(`ul.categories > li > input[type="checkbox"]`);
    postdata.categories = categories;

    

    // get options
    let options = await promises.getOptions(); // TODO: DEDUP

    // make request for new post
    let newPostData = await promises.createNewPost({document: postdata, options: options})

    if (newPostData[0].data.PostsNew) {
      document.querySelector('#postStatus').classList.add("alert-success");
      document.querySelector('#postStatus').classList.remove("alert-warning");
      document.querySelector('#statusSuccess').innerHTML = `Posted Successfully :)`;
      document.querySelector('.postCreator').style.display = "none";
      document.querySelector('.heightAuto').style.height = "auto";
    } else {
      document.querySelector('#postStatus').classList.remove("alert-success")
      document.querySelector('#postStatus').classList.add("alert-warning");
      document.querySelector('#statusSuccess').innerHTML = `Could Not Create Post :( ${newPostData[0].errors[0].message.toString()}`;
    }
    console.log({postdata, newPostData, options})

  });

})()


$(function() {  
  $(".categoryWrapper").niceScroll({
    cursorwidth: "8px",
    cursorcolor: "#0036ca",
    cursorborder: "1px solid #0036ca",
    background: "#0346FE",
    autohidemode: false
  });
});