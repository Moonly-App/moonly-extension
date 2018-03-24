{
  window.queries = {
    loginCookie: function() {
      return {domain: globalSettings.domain, name: "meteor_login_token"}
    },
    getPosts: function(limit) {

      return [
        {
      "query":"query postsListQuery($terms: JSON) {\n  PostsTotal(terms: $terms)\n  PostsList(terms: $terms) {\n    __typename\n    ...PostsList\n  }\n}\n\nfragment PostsList on Post {\n  _id\n  title\n  url\n  slug\n  postedAt\n  createdAt\n  sticky\n  status\n  excerpt\n  viewCount\n  clickCount\n  userId\n  user {\n    ...UsersMinimumInfo\n    __typename\n  }\n  thumbnailUrl\n  categories {\n    ...CategoriesMinimumInfo\n    __typename\n  }\n  commentCount\n  commenters {\n    ...UsersMinimumInfo\n    __typename\n  }\n  currentUserVotes {\n    ...VoteFragment\n    __typename\n  }\n  baseScore\n  score\n  image\n  sticky\n  __typename\n}\n\nfragment UsersMinimumInfo on User {\n  _id\n  slug\n  username\n  displayName\n  emailHash\n  avatarUrl\n  __typename\n}\n\nfragment CategoriesMinimumInfo on Category {\n  _id\n  name\n  image\n  slug\n  __typename\n}\n\nfragment VoteFragment on Vote {\n  _id\n  voteType\n  power\n  __typename\n}\n",
          "variables": {
            "terms": {
              "view": "new",
              "limit": limit,
              "itemsPerPage": 12
            }
          },
          "operationName": "postsListQuery"
        }
      ]
    },
    getCats: function(modifiers) {
      return [
        {
        "query":"query categoriesListQuery($terms: JSON) {\n  CategoriesTotal(terms: $terms)\n  CategoriesList(terms: $terms) {\n    __typename\n    ...CategoriesList\n  }\n}\n\nfragment CategoriesList on Category {\n  ...CategoriesMinimumInfo\n  description\n  order\n  image\n  parentId\n  parent {\n    ...CategoriesMinimumInfo\n    __typename\n  }\n  __typename\n}\n\nfragment CategoriesMinimumInfo on Category {\n  _id\n  name\n  slug\n  image\n  __typename\n}\n",
        "variables": {
            "terms": {
                "itemsPerPage": 12
            }
        }
        ,
        "operationName":"categoriesListQuery"
    }
      ]
    },
    getACat: function(cat, limit = 12) {
      return [
        {
          "query":"query postsListQuery($terms: JSON) {\n  PostsTotal(terms: $terms)\n  PostsList(terms: $terms) {\n    __typename\n    ...PostsList\n  }\n}\n\nfragment PostsList on Post {\n  _id\n  title\n  url\n  slug\n  postedAt\n  createdAt\n  sticky\n  status\n  excerpt\n  viewCount\n  clickCount\n  userId\n  user {\n    ...UsersMinimumInfo\n    __typename\n  }\n  thumbnailUrl\n  categories {\n    ...CategoriesMinimumInfo\n    __typename\n  }\n  commentCount\n  commenters {\n    ...UsersMinimumInfo\n    __typename\n  }\n  currentUserVotes {\n    ...VoteFragment\n    __typename\n  }\n  baseScore\n  score\n  image\n  sticky\n  __typename\n}\n\nfragment UsersMinimumInfo on User {\n  _id\n  slug\n  username\n  displayName\n  emailHash\n  avatarUrl\n  __typename\n}\n\nfragment CategoriesMinimumInfo on Category {\n  _id\n  name\n  image\n  slug\n  __typename\n}\n\nfragment VoteFragment on Vote {\n  _id\n  voteType\n  power\n  __typename\n}\n",
          "variables": {
            "terms": {
              "cat": cat,
              "limit": limit,
              "view": "new",
              "itemsPerPage": 12
            }
          },
          "operationName": "postsListQuery"
        }
      ]
    },
    newPost: function(modifiers) {
      return [
        {
          "query":"mutation PostsNew($document: PostsInput) {\n  PostsNew(document: $document) {\n    ...PostsPage\n    __typename\n  }\n}\n\nfragment PostsPage on Post {\n  ...PostsList\n  body\n  htmlBody\n  __typename\n}\n\nfragment PostsList on Post {\n  _id\n  title\n  url\n  slug\n  postedAt\n  createdAt\n  sticky\n  status\n  excerpt\n  viewCount\n  clickCount\n  userId\n  user {\n    ...UsersMinimumInfo\n    __typename\n  }\n  thumbnailUrl\n  categories {\n    ...CategoriesMinimumInfo\n    __typename\n  }\n  commentCount\n  commenters {\n    ...UsersMinimumInfo\n    __typename\n  }\n  currentUserVotes {\n    ...VoteFragment\n    __typename\n  }\n  baseScore\n  score\n  __typename\n}\n\nfragment UsersMinimumInfo on User {\n  _id\n  slug\n  username\n  displayName\n  emailHash\n  avatarUrl\n  __typename\n}\n\nfragment CategoriesMinimumInfo on Category {\n  _id\n  name\n  slug\n  __typename\n}\n\nfragment VoteFragment on Vote {\n  _id\n  voteType\n  power\n  __typename\n}\n",
          "variables": {
            "document": modifiers.document
          },
          "operationName": "PostsNew"
        }
      ];
    },
    getEmbedData: function(modifiers) {
      return [
        {
          "query": "mutation getEmbedData($url: String) {\n  getEmbedData(url: $url)\n}\n",
          "variables": {
            "url": modifiers.url
          },
          "operationName": "getEmbedData"
        }
      ];
    }
  };

  const chromep = new ChromePromise();
  window.promises = {
    queryTabs: function(query) {
      return new Promise(function(resolve, reject) {
        chrome.tabs.query(query, tab => {
          resolve(tab)
        });
      });
    },

    queryCookies: function(query) {
      return new Promise(function(resolve, reject) {
        chrome.cookies.getAll(query, cookies => {
          resolve(cookies)
        });
      });
    },

    isLoggedin: function() {
      return new Promise(function(resolve, reject) {
        let returnData = {
          status: false,
          data: null,
          err: null
        }

        if (window.localStorage["Meteor.loginToken"]) {
          returnData.status = true
          returnData.data = window.localStorage["Meteor.loginToken"]
        }

        chrome.cookies.getAll(queries.loginCookie(), cookies => {
          try {
            returnData.status = true;
            returnData.data = cookies && cookies[0].value || returnData.data;
          } catch (e) {
            returnData.status = false;
            returnData.err = e;
            returnData.data = null;
            //resolve({status: false, err: e}); // TODO: reject instead of resolve?
          }
          resolve(returnData)
        });
      });
    },

    getCookiesNicely: async function() {
      let response = await promises.queryCookies(queries.loginCookie());
      return response;
    },

    getCurrentTabsNicely: async function() {
      let response = await promises.queryTabs({active: true, currentWindow: true});
      return response;
    },

    getTokenFromStorage: async function() {
      let response = window.localStorage["Meteor.loginToken"];
      return response;
    },

    getOptions: async function() {
      // gets tab and login cookies
      let tab = await this.getCurrentTabsNicely();
      let biscut = await this.getCookiesNicely();
      let tokenFromStorage = await this.getTokenFromStorage();

      let options = {
        url: tab[0].url,
        logincookie: (biscut[0] && biscut[0].value) || tokenFromStorage
      }
      return options;
    },

    getSelectedCheckboxes: function(selector) {
      return [].filter.call(document.querySelectorAll(selector), (checkbox) => checkbox.checked).map(checkbox => checkbox.value);
    },

    getInputValues: function(selector) {
      let inputs = [...document.querySelectorAll(selector)];
      return Object.assign({}, ...Object.keys(inputs).map(key => ({
        [inputs[key].name]: inputs[key].value
      })));
    },

    createNewPost: async function({document, options}) {
      let newPostQuery = queries.newPost({document: document});
      let responseData = await this.getDataForPayload({payload: newPostQuery, settingsArgs: options});
      return responseData;
    },

    getDataForPayload: async function({payload, settingsArgs}) {
      // let settings = {
      //   "async": true,
      //   "crossDomain": true,
      //   "url": globalSettings.queryURL,
      //   "method": "POST",
      //   "headers": {
      //     "authorization": settingsArgs.logincookie,
      //     "content-type": "application/json"
      //   },
      //   "processData": false,
      //   "data": JSON.stringify(payload)
      // }
      // let response = await $.ajax(settings);

      let fetchSettings = {
        method: 'post',
        headers: {
          "Authorization": settingsArgs.logincookie,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      };

      let response = await fetch(globalSettings.queryURL, fetchSettings).then((res) => res.json());

      return response;
    },

    getAllCats: async function(options) {
      let payload = queries.getCats();
      let returnData = await this.getDataForPayload({payload: payload, settingsArgs: options})
      return returnData;
    },
    fetchUrl: async function(options) {
      try {
        var response = await fetch(options.url, {method: "OPTIONS"});
        var data = await response.statusText;
        return data;
      } catch (e) {
        return false;
      }
    }
  }
}
