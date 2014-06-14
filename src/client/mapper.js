/* globals document, XMLHttpRequest, window */
(function() {
    window.addEventListener("load", function() {
        var domain = window.prompt("Please enter a domain"),
            pleaseWaitEl = document.getElementById("pleaseWait"),
            xhr = new XMLHttpRequest();
        
        if (domain) {
            xhr.open("get", "/map?domain=" + encodeURIComponent(domain));
            
            xhr.onload = function() {
                var pageObj = JSON.parse(xhr.responseText);
                
                pleaseWaitEl.className = "hidden";
                document.getElementById("siteMap").textContent = JSON.stringify(pageObj, null, 3);
            };
            
            xhr.onerror = function() {
                pleaseWaitEl.className = "hidden";
                // TODO display error               
            };
            
            xhr.send();
            pleaseWaitEl.className = "";
        }
        else {
            pleaseWaitEl.className = "hidden";
            //TODO display error
        }
    });
}());