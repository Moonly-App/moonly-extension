let clockTimeout;

let scrollTimer,
  lastScrollFireTime;

function isElementInViewportNear(el) {
  const rect = el.getBoundingClientRect();
  return rect.top - 100 <= document.documentElement.clientHeight;
}

let storedCategory = JSON.parse(localStorage.getItem("saved-category"));

let catsArray;
if (storedCategory && storedCategory.length) {
  catsArray = storedCategory;
} else {
  catsArray = [];
}

$(document).ready(() => {
  $.ajax({
    method: "POST",
    url: globalSettings.queryURL,
    data: JSON.stringify(queries.getCats()),
    contentType: "application/json"
  }).done(msg => {
    updateData("cats", msg, "CategoriesList");
  });

  loadMore();

  $("body").on("scroll", e => {
    const minScrollTime = 2000;
    const now = new Date().getTime();
    if (!scrollTimer) {
      if (now - lastScrollFireTime > 3 * minScrollTime) {
        checkLoadMore(); // fire immediately on first scroll
        lastScrollFireTime = now;
      }
      scrollTimer = setTimeout(() => {
        scrollTimer = null;
        lastScrollFireTime = new Date().getTime();
        checkLoadMore();
      }, minScrollTime);
    }
  });

});

function extractHostname(url) {
  let hostname;
  //find & remove protocol (http, ftp, etc.) and get hostname
  if (url.indexOf("://") > -1) {
    hostname = url.split("/")[2];
  } else {
    hostname = url.split("/")[0];
  }
  //find & remove port number
  hostname = hostname.split(":")[0];
  //find & remove "?"
  hostname = hostname.split("?")[0];

  return hostname;
}

function extractRootDomain(url) {
  let domain = extractHostname(url);
  const splitArr = domain.split(".");
  const arrLen = splitArr.length;

  //extracting the root domain here
  if (arrLen > 2) {
    domain = `${splitArr[arrLen - 2]}.${splitArr[arrLen - 1]}`;
  }
  return domain;
}

function updatePostsForLimit(limit) {
  if (!limit) {
    console.log("No limit provided");
    return;
  }
  console.log("Loading More", limit);
  $.ajax({
    method: "POST",
    url: globalSettings.queryURL,
    data: JSON.stringify(queries.getPosts(limit)),
    contentType: "application/json"
  }).done(msg => {
    updateData("posts", msg, "PostsList");
  });
}

function updatePostsForCat(cat, limit) {
  if (!cat) {
    console.log(`Category is empty`);
    return;
  }
  $.ajax({
    method: "POST",
    url: globalSettings.queryURL,
    data: JSON.stringify(queries.getACat(cat, limit)),
    contentType: "application/json"
  }).done(msg => {
    //  console.log(msg)

    updateData("posts", msg, "PostsList");
  });
}

function loadMore() {
  let storedCategory = JSON.parse(localStorage.getItem("saved-category"));
  let limit = window.currentPostListCount || 0;
  limit += 12;

  if (storedCategory) {
    updatePostsForCat(storedCategory, limit);
  } else {
    updatePostsForLimit(limit);
  }
}

function checkLoadMore() {
  if (isElementInViewportNear($("#loadMorePosts")[0])) {
    console.log("load more");
    loadMore();
  }
}

const clearLocalStorage = document.getElementById("allCats");
clearLocalStorage.addEventListener("click", () => {
  localStorage.clear();
});

function localStorageCatLoader(slug) {

  if (!catsArray.includes(slug)) {
    catsArray.push(slug);
  } else {
    const index = catsArray.findIndex(category => category === slug);
    catsArray.splice(index, 1);
  }
  localStorage.setItem("saved-category", JSON.stringify(catsArray));
  updatePostsForCat(catsArray);
}


function updateData(sel, msg, list) {

  if (list === "PostsList") {
    window.currentPostListCount = msg[0].data["PostsList"].length;
  }
  //${storedCategory.includes(elem.slug) ? "<i class='fa fa-check' style='display:block;'></i>" : null}
  
  try {
    let map = msg[0].data[list].map(elem => {
      if (list == "CategoriesList") {
        return $(`<li>
            
            <a href="${globalSettings.homeURL}/?cat=${elem.slug}" target="_blank" class="${elem.slug} liCat">
            <span class="checkIconWrapper">
              ${catsArray.includes(elem.slug)
          ? "<i class='fa fa-check faStored'></i>"
          : "<i class='fa fa-check faInstant'></i>"}
          </span>
          <img class="catImage" src="${elem.image}" />
              ${elem.name}
            </a>
          </li>`).click(e => {
          e.preventDefault();
          e.stopPropagation();
          localStorageCatLoader(elem.slug);          

          $(e.target).toggleClass('active');
          $(".displayNoneDefault").toggleClass('active');
          

          if($(e.target).find('.checkIconWrapper .fa-check').length > 0) {
            $(e.target).remove('.fa-check');
          } else {
            let addIcon = document.createElement("i");
            addIcon.className = 'fa fa-check';
            $(e.target).append(addIcon);
          }
          

          console.log(e.target);

          //  var index = catsArray.indexOf(elem.slug)
          //  catsArray.splice(index, 1);
          //  console.log(catsArray);

        });
      } else {
        return `
          <li class="posts-item">
            <div class="posts-item-content">
              <a href="${elem.url}" class="posts-thumbnail" style="background-image:url('${elem.image || elem.thumbnailUrl}');"></a>
              <div class="postItemAuthorInfo">
                <div class="posts-item-user">
                  <div class="avatar">
                    <a href="${globalSettings.homeURL}/users/${elem.user.username}">
                      <span>
                        <img alt="" class="avatar-image" src="${elem.user.avatarUrl}" title="">
                      </span>
                    </a>
                  </div>

                  <div class="dateWrapper">
                    <span class="spanBy">by </span>
                    <span class="users-name">${elem.user.username}</span>
                    <div class="posts-item-date">${elem.postedAt
          ? moment(new Date(elem.postedAt)).fromNow()
          : ""}</div>
                  </div>
                </div>
              </div>

              <div class="postInfoWrapper">
                
                <h3 class="posts-item-title">
                  <a class="posts-item-title-link" href="${elem.url}">
                  ${elem.title}
                  </a>
                </h3>
                <span class="post-url-domain"><img src="http://s2.googleusercontent.com/s2/favicons?domain_url=${elem.url && extractRootDomain(elem.url)}" /> ${elem.url && extractRootDomain(elem.url)}</span>
                <p class="posts-item-desc-excerpt">${elem.excerpt}</p>
                <div class="posts-categories">
                ${elem.categories.map(({
                slug,
                name,
                image}) => {
                    // for each category
                    // return the proper html
                    // NOTE: on the console, we see each category has slug and name, we wrap the whole things in a backtick
                    return `<span class="posts-category ${slug}"><img class="catImage" src=${image} />${name}</span>`;
                    // then we join them with a space so it shows with a space
                  })
                  .join(" ")}
                </div>
              </div>

              <div class="posts-item-meta">
                <div class="posts-stats">
                  <span class="posts-stats-item">
                    <img src="/img/click.png" alt="clicks number">
                    <span>${elem.clickCount ||  0}</span>
                  </span>
                  <span class="posts-stats-item">
                  <i class="icon fa fa-fw fa-bookmark icon-bookmark" aria-hidden="true" data-reactid="349"></i>
                    <span class="savedNo">
                      ${elem.baseScore ||  0}
                    </span>
                  </span>
                </div>
                <div>
                <div><i class="fa fa-fw fa-comments"></i><span class="faCommNo">${elem.commentCount ||  0}</span></div>
                </div>
              </div>
              
          </li>
            `;
      }
    });
    Promise.all(map).then(() => {
      //  console.log(map)
      $(`.${sel}`).html(map);
    });
  } catch (e) {
    console.log(e);
  }
}
/*
$(function() {  
  $("#sidebarCats").niceScroll({
    autohidemode: false,
  });
  
});

*/

async function showPopupLogin({ loggedIn}){
  console.log("here I am");
 
    let loggedIn = await promises.isLoggedin();
    await showPopupLogin();
    console.log(loggedIn);
}

/*
let storedWizard = JSON.parse(localStorage.getItem("moonlyWizard"));

  if (storedWizard) {
    alert("wizard is stored");
  } else {
    alert("wizard is NOT stored");
  }
*/
window.onload = function() {


  document.getElementById("Save").onclick = function fun() {
      localStorage.setItem('moonlyWizard', 'activated');
      document.getElementById("wizardOverlay").style.display = 'none';
  }
}

let storedWizard = localStorage.getItem("moonlyWizard");
console.log(storedWizard);

if (storedWizard) {
  document.getElementById("wizardOverlay").style.display = 'none';
}