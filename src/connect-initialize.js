var Fuse = {
  create: function (options) {
    var clientSecret = options.clientSecret;
    var onEvent = options.onEvent || function () {};
    var onSuccess = options.onSuccess || function () {};
    var onInstitutionSelected = options.onInstitutionSelected || function () {};
    var onExit = options.onExit || function () {};
    const url = options.overrideBaseUrl || "https://connect.letsfuse.com";

    var iframe = document.createElement("iframe");
    iframe.setAttribute("src", `${url}/intro?client_secret=${clientSecret}`);
    iframe.style.position = "fixed";
    iframe.style.top = "0";
    iframe.style.left = "0";
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.zIndex = 1000;
    iframe.style.border = "none";

    function handleMessage(event) {
      if (event.origin === url) {
        try {
          var data = JSON.parse(event.data);
          var eventName = data.event_name;

          switch (eventName) {
            case "ON_SUCCESS":
              var publicToken = data.public_token;
              onSuccess(publicToken);
              document.body.removeChild(iframe);
              break;
            case "ON_INSTITUTION_SELECTED":
              var institutionId = data.institution_id;
              var callback = function (linkToken) {
                iframe.setAttribute(
                  "src",
                  `${url}/bank-link?link_token=${linkToken}`
                );
              };
              onInstitutionSelected(institutionId, callback);
              break;
            case "ON_EXIT":
              onExit();
              document.body.removeChild(iframe);
              break;
            default:
              onEvent(eventName, data);
              break;
          }
        } catch (e) {
          console.log("Error parsing message from iframe", e);
        }
      }
    }

    window.addEventListener("message", handleMessage);

    return {
      open: function () {
        document.body.appendChild(iframe);
      },
      destroy: function () {
        window.removeEventListener("message", handleMessage);
      },
    };
  },
};
