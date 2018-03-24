var detailsTimer;

$(document).ready(function(){
  
  $(".action_links").on("click", function(){
    
    switch(this.id){
      
      case "delete":
        chrome.management.uninstallSelf({showConfirmDialog: true}, function(){
          var err = chrome.runtime.lastError;
          if(err) console.warn("Couldn't uninstall", err);
        });
        break;
        
      case "donate":
        $("#charity_picker").show();
        break;
        
      case "feedback":
        console.log("Opening feedback");
        break;
        
      case "source":
        console.log("Opening source code");
        break;
    }
  });
  
  $(".donate_link").on("click", function(){
    console.log("clicked", this.id);
  });
  
});
