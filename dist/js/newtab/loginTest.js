(async() => {
    async function checkServerOk(){
        let isLoginServerOk = await promises.fetchUrl({url: globalSettings.loginUrl})
        let isQueryServerOk = await promises.fetchUrl({url: globalSettings.queryURL})
    
        try{

    
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

      function handleLoad({elems, event, loggedIn}) {
        console.log(arguments);
        if (loggedIn.status) {
    
          console.log("yes");
          return;
        } else {
    
            console.log("yes");
          return;
        }
      }

      console.log(isLoginServerOk);
})()