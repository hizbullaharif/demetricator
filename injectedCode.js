// BASE URL
export const BASE_URL = 'https://twitter.com/home';

// code that will be auto called for decrometer only
// only threads,comments and likes are hided for now
export default INJECTEDCODE = `try{

  // ? capture any open request
  (function () {
    var open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function () {
      this.addEventListener('load', function () {
        var message = {status: this.status, response: this.response};
        window.ReactNativeWebView.postMessage(JSON.stringify(message));
      });
      open.apply(this, arguments);
    };
  })();


  // ? Turn ON decrometer
  (function () {
    // KNOWN BUGS
    // need to rework tweetdeck time demetrication to opacity rather than
    // hiding ... b/c notifications column twitches on toggle with hide
  
    var demetricated = true; // launch in demetricated state
    var hidetimes;
    var curURL = window.location.href;
    var version = "1.4.0";
  
    var newTwitter = false;
    //var titleResetting = false;
  
    // a few metrics are easy, hidden via CSS. this style is mirrored in
    // twitterdemetricator.css in order to inject *before* DOM renders on
    // first load, so need to maintain state in these vars plus that file
    var demetricatedStyle =
      '.ProfileCardStats-statValue, .ProfileTweet-actionCountForPresentation, .ProfileNav-value, a[data-tweet-stat-count] strong, .ep-MetricAnimation, .ep-MetricValue, .MomentCapsuleLikesFacepile-countNum, .stats li a strong { opacity:0 !important; } .count-wrap { display:hide !important; } div:not(.ProfileTweet-actionList)[aria-label="Tweet actions"] span, div[data-testid="like"] div span, div[data-testid="reply"] div span, div[data-testid="retweet"] div span, div.r-z2knda.r-1wbh5a2 a > span:first-child, a.r-jwli3a[aria-haspopup] span div div, div.r-7o8qx1 div.r-axxi2z, div.css-1dbjc4n a.css-4rbku5 span.r-vw2c0b , span span.r-jwli3a, div[dir="auto"] span.r-jwli3a { opacity:0;/*display:none;*/ } div[data-testid="unretweet"] div span, div[data-testid="unlike"] div span, a[dir="auto"] div.css-1dbjc4n.r-xoduu5.r-1udh08xa, a[dir="auto"] div.css-1dbjc4n.r-xoduu5.r-1udh08x:not(.r-h9hxbl), div.css-1dbjc4n.r-1w6e6rj a[dir="auto"] span:nth-child(1) span, div.css-1dbjc4n.r-ku1wi2 a[dir="auto"] span:nth-child(1) span { /*display:none;*/opacity:0; }';
  
    function main() {
      // inititally it will add demetricator here
      addGlobalStyle(demetricatedStyle, "demetricator");
  
      // catch everything else tagged for hide/show
  
      var elements = document.querySelectorAll(".notdemetricated");
  
      for (var i = 0; i < elements.length; i++) {
        elements[i].style.display = "none";
      }
  
      var elements = document.querySelectorAll(".demetricate-tooltip");
      for (var i = 0; i < elements.length; i++) {
        elements[i].classList.add("js-tooltip-demetricated");
        elements[i].classList.remove("js-tooltip");
      }
  
      // record state
  
      // console reporting
      console.log("Twitter Demetricator, ver. " + version + " -- by Ben Grosser");
      console.log("https://bengrosser.com/projects/twitter-demetricator/");
      console.log(" ... loaded for URL --> " + window.location);
  
      if (document.getElementById("react-root")) {
        newTwitter = true;
      }
  
      function demetricateMiddleMetricPopup(element) {
        var txt = element.textContent;
        var htm = element.innerHTML;
  
        //console.log("dmmp txt: " + txt);
        //console.log("dmmp htm: " + htm);
  
        if (txt !== undefined && htm !== undefined) {
          var parsed;
  
          if (newTwitter) {
            parsed = element.innerHTML.match(
              /([\s\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\s\S]*)/
            );
          } else {
            parsed = element.innerHTML
              .replace(/&nbsp;/gi, " ")
              .match(/([\s\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\s\S]*)/);
            //match(/([\S]*)\s+(\d+(?:[,|\s|.]\d+)*)\s+([\s\S]*)/);
          }
  
          if (parsed) {
            var newhtml =
              parsed[1] +
              " <span class='notdemetricated' style='display:none;'>" +
              parsed[2] +
              " </span>" +
              parsed[3];
            element.innerHTML = newhtml;
          }
  
          // else maybe it's a language that starts this sentence w/ num
          // like german: 127.839 „Gefällt mir“-Angaben
          else {
            parsed = element.innerHTML.match(/^(\d+(?:[,|\s|.]\d+)*\s?)\s+(.*)/);
  
            //console.log("NEW: " + parsed);
            if (parsed) {
              var newhtml =
                "<span class='notdemetricated' style='display:none;'>" +
                parsed[1] +
                "</span> " +
                parsed[2];
              element.innerHTML = newhtml;
            }
          }
        }
      }
  
      // ! this code is
  
      if (curURL.includes("tweetdeck.twitter")) {
        ready(
          "time.tweet-timestamp a, time.tweet-timestamp span",
          function (element) {
            demetricateRelativeTime(element, element);
          }
        );
      }
  
      // check timestamp content to ensure it's an age count
      // some are tagged as such by Twitter, but some are not
      function demetricateRelativeTime(timeTarget, hideTarget) {
        if (hideTarget.classList.contains("demetricator_checked")) return;
        else hideTarget.classList.add("demetricator_checked");
  
        // relative times on permalinks are present by hidden by default
        // so never reveal them
        if (hideTarget.parentElement.classList.contains("permalink-header"))
          return;
  
        var txt = timeTarget.textContent;
  
        if (
          txt.includes("Jan") ||
          txt.includes("Feb") ||
          txt.includes("Mar") ||
          txt.includes("Apr") ||
          txt.includes("May") ||
          txt.includes("Jun") ||
          txt.includes("Jul") ||
          txt.includes("Aug") ||
          txt.includes("Sep") ||
          txt.includes("Oct") ||
          txt.includes("Nov") ||
          txt.includes("Dec") ||
          txt.includes("Earlier")
        ) {
          return;
        } else {
          //hideTarget.classList.add("notdemetricated");
          hideTarget.classList.add("notdemetricated-time");
          if (hidetimes && demetricated) {
            hideTarget.style.display = "none";
            var ariaHiddenDivs =
              hideTarget.parentElement.parentElement.parentElement.querySelectorAll(
                'div[aria-hidden="true"]'
              );
            for (var i = 0; i < ariaHiddenDivs.length; i++) {
              ariaHiddenDivs[i].classList.add("notdemetricated-time");
              ariaHiddenDivs[i].style.display = "none";
            }
          }
        }
      }
  
      // ! code for the sidebar trends
      if (newTwitter) {
        ready(
          'div[aria-label="Timeline: Trending now"] div div div div div span, div[aria-label="Timeline: Explore"] div div div div div span',
          function (element) {
            if (element.querySelector(":scope > svg"))
              return; // ignore elements that wrap svgs
            else cloneAndDemetricateLeadingNum(element, "Tweets");
          }
        );
  
        ready(
          'div[aria-label="Timeline: Trends"] div div div div div span span',
          function (element) {
            cloneAndDemetricateLeadingNum(element, "Tweets");
          }
        );
      }
  
      function cloneAndDemetricateLeadingNum(element, dTxt) {
        if (
          element.classList.contains("demetricated") ||
          element.classList.contains("notdemetricated")
        )
          return;
        var txt = element.textContent.trim();
        var cleantxt = txt.replace(/&nbsp;/gi, " ");
        var parsed = cleantxt.match(
          /^(\d+(?:[,|\s|.]\d+)*\s?([K|k|M|m|]?|Tsd.|Mio.|mil|E|tn))\s+(.*)/
        );
  
        if (parsed) {
          var orig = element;
          var clone = orig.cloneNode(true);
          clone.textContent = parsed[3];
          clone.classList.add("demetricated");
          orig.classList.add("notdemetricated");
          if (demetricated) orig.style.display = "none";
          else clone.style.display = "none";
          orig.parentNode.insertBefore(clone, orig.nextSibling);
        } else {
          demetricateMiddleMetricPopup(element);
        }
      }
    }
  
    // originally from https://gist.github.com/Geruhn/7644599
    function addGlobalStyle(css, idname) {
      var head, style;
      head = document.head || document.getElementsByTagName("head")[0];
      if (!head) {
        return;
      }
      style = document.createElement("style");
      style.type = "text/css";
      style.appendChild(document.createTextNode(css));
      style.setAttribute("id", idname);
  
      head.appendChild(style);
    }
  
    // cleaner syntax than match()
    String.prototype.contains = function (it) {
      return this.indexOf(it) != -1;
    };
  
    // CHANGE 1.0
    // remove into one file for 1.0
    // jquery direct pasted below
    // from https://code.jquery.com/jquery-3.2.1.min.js
    //
  
    // CHANGE 1.0?
    // move into own file 1.0
    //
    // rynamorr ready.js
    // https://github.com/ryanmorr/ready
    // with very minor adjustment for vanilla js
    /*
     * Common variables
     */
    let observer;
    const listeners = [];
    const doc = window.document;
    const MutationObserver =
      window.MutationObserver || window.WebKitMutationObserver;
  
    /*
     * Checks a selector for new matching
     * elements and invokes the callback
     * if one is found
     *
     * @param {String} selector
     * @param {Function} fn
     * @api private
     */
    function checkSelector(selector, fn) {
      const elements = doc.querySelectorAll(selector);
      for (let i = 0, len = elements.length; i < len; i++) {
        const element = elements[i];
        if (!element.ready) {
          element.ready = true;
          fn.call(element, element);
        }
      }
    }
  
    /*
     * Check all selectors for new elements
     * following a change in the DOM
     * * @api private
     */
    function checkListeners() {
      listeners.forEach((listener) =>
        checkSelector(listener.selector, listener.fn)
      );
    }
  
    /*
     * Remove a listener
     *
     * @param {String} selector
     * @param {Function} fn
     * @api private
     */
    function removeListener(selector, fn) {
      let i = listeners.length;
      while (i--) {
        const listener = listeners[i];
        if (listener.selector === selector && listener.fn === fn) {
          listeners.splice(i, 1);
          if (!listeners.length && observer) {
            observer.disconnect();
            observer = null;
          }
        }
      }
    }
  
    /*
     * Add a selector to watch for when a matching
     * element becomes available in the DOM
     *
     * @param {String} selector
     * @param {Function} fn
     * @return {Function}
     * @api public
     */
    //export default function ready(selector, fn) {
    function ready(selector, fn) {
      if (!observer) {
        observer = new MutationObserver(checkListeners);
        observer.observe(doc.documentElement, {
          childList: true,
          characterData: true,
          subtree: true,
        });
      }
      listeners.push({ selector, fn });
      checkSelector(selector, fn);
      return () => removeListener(selector, fn);
    }
    document.addEventListener("DOMContentLoaded", function () {
      main();
    });
  })()}catch(err){
    alert(err)
  }`;

//alert show if there is any Error
export const injectedCodeForAlert = `
window.onerror = function(message, sourcefile, lineno, colno, error) {
  alert("Message: " + message + " - Source: " + sourcefile + " Line: " + lineno + ":" + colno);
  return true;
};
true;
`;
