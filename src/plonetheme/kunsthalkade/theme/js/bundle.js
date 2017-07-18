/* This is a bundle that uses RequireJS to pull in dependencies.
   These dependencies are defined in the registry.xml file */


/* do not include jquery multiple times */
if (window.jQuery) {
  define('jquery', [], function() {
    return window.jQuery;
  });
}

/* jquery.scrolly v1.0.0-dev | (c) @ajlkn | MIT licensed */
(function(e){function u(s,o){var u,a,f;if((u=e(s))[t]==0)return n;a=u[i]()[r];switch(o.anchor){case"middle":f=a-(e(window).height()-u.outerHeight())/2;break;default:case r:f=Math.max(a,0)}return typeof o[i]=="function"?f-=o[i]():f-=o[i],f}var t="length",n=null,r="top",i="offset",s="click.scrolly",o=e(window);e.fn.scrolly=function(i){var o,a,f,l,c=e(this);if(this[t]==0)return c;if(this[t]>1){for(o=0;o<this[t];o++)e(this[o]).scrolly(i);return c}l=n,f=c.attr("href");if(f.charAt(0)!="#"||f[t]<2)return c;a=jQuery.extend({anchor:r,easing:"swing",offset:0,parent:e("body,html"),pollOnce:!1,speed:1e3},i),a.pollOnce&&(l=u(f,a)),c.off(s).on(s,function(e){var t=l!==n?l:u(f,a);t!==n&&(e.preventDefault(),a.parent.stop().animate({scrollTop:t},a.speed,a.easing))})}})(jQuery);
/* jquery.scrollzer v0.2 | (c) @ajlkn | MIT licensed */
jQuery.scrollzer=function(e,t){var r=jQuery(window),a=jQuery(document);r.load(function(){var i,o,s,l,n,c,u=jQuery.extend({activeClassName:"active",suffix:"-link",pad:50,firstHack:!1,lastHack:!1},t),d=[],f=jQuery();for(i in e)s=jQuery("#"+e[i]),l=jQuery("#"+e[i]+u.suffix),s.length<1||l.length<1||(o={},o.link=l,o.object=s,d[e[i]]=o,f=f.add(l));var v,h=function(){var e;for(i in d)e=d[i],e.start=Math.ceil(e.object.offset().top)-u.pad,e.end=e.start+Math.ceil(e.object.innerHeight());r.trigger("scroll")};r.resize(function(){window.clearTimeout(v),v=window.setTimeout(h,250)});var j,m=function(){f.removeClass("scrollzer-locked")};r.scroll(function(e){var t=0,o=!1;n=r.scrollTop(),window.clearTimeout(j),j=window.setTimeout(m,250);for(i in d)i!=c&&n>=d[i].start&&n<=d[i].end&&(c=i,o=!0),t++;u.lastHack&&n+r.height()>=a.height()&&(c=i,o=!0),o&&!f.hasClass("scrollzer-locked")&&(f.removeClass(u.activeClassName),d[c].link.addClass(u.activeClassName))}),r.trigger("resize")})};

/* skel.js v3.0.1 | (c) skel.io | MIT licensed */

var skel = (function() { "use strict"; var _ = {

  /******************************/
  /* Properties                 */
  /******************************/

    /**
     * IDs of breakpoints that are currently active.
     * @type {array}
     */
    breakpointIds: null,

    /**
     * Events.
     * @type {object}
     */
    events: {},

    /**
     * Are we initialized?
     * @type {bool}
     */
    isInit: false,

    /**
     * Objects.
     * @type {object}
     */
    obj: {

      // Attachments.
        attachments: {},

      // Breakpoints.
        breakpoints: {},

      // Head.
        head: null,

      // States.
        states: {}

    },

    /**
     * State ID delimiter (don't change this).
     * @type {string}
     */
    sd: '/',

    /**
     * Current state.
     * @type {object}
     */
    state: null,

    /**
     * State handlers.
     * @type {object}
     */
    stateHandlers: {},

    /**
     * Current state ID.
     * @type {string}
     */
    stateId: '',

    /**
     * Internal vars.
     * @type {object}
     */
    vars: {},

  /******************************/
  /* Methods: Utility           */
  /******************************/

    /**
     * Does stuff when the DOM is ready.
     * @param {function} f Function.
     */
    DOMReady: null,

    /**
     * Wrapper/polyfill for (Array.prototype|String).indexOf.
     * @param {Array|string} search Object or string to search.
     * @param {integer} from Starting index.
     * @return {integer} Matching index (or -1 if there's no match).
     */
    indexOf: null,

    /**
     * Wrapper/polyfill for Array.isArray.
     * @param {array} x Variable to check.
     * @return {bool} If true, x is an array. If false, x is not an array.
     */
    isArray: null,

    /**
     * Safe replacement for "for..in". Avoids stuff that doesn't belong to the array itself (eg. properties added to Array.prototype).
     * @param {Array} a Array to iterate.
     * @param {function} f(index) Function to call on each element.
     */
    iterate: null,

    /**
     * Determines if a media query matches the current browser state.
     * @param {string} query Media query.
     * @return {bool} True if it matches, false if not.
     */
    matchesMedia: null,

    /**
     * Extends x by y.
     * @param {object} x Target object.
     * @param {object} y Source object.
     */
    extend: function(x, y) {

      _.iterate(y, function(k) {

        if (_.isArray(y[k])) {

          if (!_.isArray(x[k]))
            x[k] = [];

          _.extend(x[k], y[k]);

        }
        else if (typeof y[k] == 'object') {

          if (typeof x[k] != 'object')
            x[k] = {};

          _.extend(x[k], y[k]);

        }
        else
          x[k] = y[k];

      });

    },

    /**
     * Creates a new style element.
     * @param {string} content Content.
     * @return {DOMHTMLElement} Style element.
     */
    newStyle: function(content) {

      var e = document.createElement('style');
        e.type = 'text/css';
        e.innerHTML = content;

      return e;

    },

  /******************************/
  /* Methods: API               */
  /******************************/

    /**
     * Temporary element for canUse()
     * @type {DOMElement}
     */
    _canUse: null,

    /**
     * Determines if the browser supports a given property.
     * @param {string} p Property.
     * @return {bool} True if property is supported, false if not.
     */
    canUse: function(p) {

      // Create temporary element if it doesn't already exist.
        if (!_._canUse)
          _._canUse = document.createElement('div');

      // Check for property.
        var e = _._canUse.style,
          up = p.charAt(0).toUpperCase() + p.slice(1);

        return  (
              p in e
            ||  ('Moz' + up) in e
            ||  ('Webkit' + up) in e
            ||  ('O' + up) in e
            ||  ('ms' + up) in e
        );

    },

  /******************************/
  /* Methods: Events            */
  /******************************/

    /**
     * Registers one or more events.
     * @param {string} names Space-delimited list of event names.
     * @param {function} f Function.
     */
    on: function(names, f) {

      var a = names.split(/[\s]+/);

      _.iterate(a, function(i) {

        var name = a[i];

        // Manually trigger event if applicable.
          if (_.isInit) {

            // Init.
              if (name == 'init') {

                // Trigger event.
                  (f)();

                // This only gets called once, so there's no need to actually
                // register it.
                  return;

              }

            // Change.
              else if (name == 'change') {

                // Trigger event.
                  (f)();

              }

            // Activate / Not.
              else {

                var x = name.charAt(0);

                if (x == '+' || x == '!') {

                  var y = name.substring(1);

                  if (y in _.obj.breakpoints) {

                    // Activate.
                      if (x == '+' && _.obj.breakpoints[y].active) {

                        // Trigger event.
                          (f)();

                      }

                    // Not.
                      else if (x == '!' && !_.obj.breakpoints[y].active) {

                        // Trigger event.
                          (f)();

                        // This only gets called once, so there's no need to actually
                        // register it.
                          return;

                      }

                  }

                }

              }

          }

        // No previous events of this type registered? Set up its array.
          if (!_.events[name])
            _.events[name] = [];

        // Register event.
          _.events[name].push(f);

      });

      return _;

    },

    /**
     * Triggers an event.
     * @param {string} name Name.
     */
    trigger: function(name) {

      // No events registered? Bail.
        if (!_.events[name] || _.events[name].length == 0)
          return;

      // Step through and call events.
        _.iterate(_.events[name], function(k) {
          (_.events[name][k])();
        });

      return _;

    },

  /******************************/
  /* Methods: Breakpoints       */
  /******************************/

    /**
     * Gets a breakpoint.
     * @param {string} id Breakpoint ID.
     * @return {Breakpoint} Breakpoint.
     */
    breakpoint: function(id) {
      return _.obj.breakpoints[id];
    },

    /**
     * Sets breakpoints.
     * @param {object} breakpoints Breakpoints.
     */
    breakpoints: function(breakpoints) {

      // Breakpoint class.
        function Breakpoint(id, media) {

          this.name = this.id = id;
          this.media = media;
          this.active = false;
          this.wasActive = false;

        };

          Breakpoint.prototype.matches = function() {
            return (_.matchesMedia(this.media));
          };

          Breakpoint.prototype.sync = function() {

            this.wasActive = this.active;
            this.active = this.matches();

          };

      // Create breakpoints.
        _.iterate(breakpoints, function(id) {
          _.obj.breakpoints[id] = new Breakpoint(id, breakpoints[id]);
        });

      // Initial poll.
        window.setTimeout(function() {
          _.poll();
        }, 0);

      return _;

    },

  /******************************/
  /* Methods: States            */
  /******************************/

    /**
     * Adds a state handler.
     * @param {string} id ID.
     * @param {function} f Handler function.
     */
    addStateHandler: function(id, f) {

      // Add handler.
        _.stateHandlers[id] = f;

      // Call it.
        //_.callStateHandler(id);

    },

    /**
     * Calls a state handler.
     * @param {string} id ID.
     */
    callStateHandler: function(id) {

      // Call handler.
        var attachments = (_.stateHandlers[id])();

      // Add attachments to state (if any).
        _.iterate(attachments, function(i) {
          _.state.attachments.push(attachments[i]);
        });

    },

    /**
     * Switches to a different state.
     * @param {string} newStateId New state ID.
     */
    changeState: function(newStateId) {

      // Sync all breakpoints.
        _.iterate(_.obj.breakpoints, function(id) {
          _.obj.breakpoints[id].sync();
        });

      // Set last state var.
        _.vars.lastStateId = _.stateId;

      // Change state ID.
        _.stateId = newStateId;
        _.breakpointIds = (_.stateId === _.sd ? [] : _.stateId.substring(1).split(_.sd));

        //console.log('[skel] changing states (id: "' + _.stateId + '")');

      // Get state.
        if (!_.obj.states[_.stateId]) {

          //console.log('[skel] - not found. building ...');

          // Build state.
            _.obj.states[_.stateId] = {
              attachments: []
            };

            _.state = _.obj.states[_.stateId];

          // Call all state handlers.
            _.iterate(_.stateHandlers, _.callStateHandler);

        }
        else {

          //console.log('[skel] - found');

          // Get state.
            _.state = _.obj.states[_.stateId];

        }

      // Detach all attachments *EXCEPT* state's.
        _.detachAll(_.state.attachments);

      // Attach state's attachments.
        _.attachAll(_.state.attachments);

      // Expose state and stateId as vars.
        _.vars.stateId = _.stateId;
        _.vars.state = _.state;

      // Trigger change event.
        _.trigger('change');

      // Trigger activate/deactivate events.
        _.iterate(_.obj.breakpoints, function(id) {

          // Breakpoint is now active ...
            if (_.obj.breakpoints[id].active) {

              // ... and it wasn't active before? Trigger activate event.
                if (!_.obj.breakpoints[id].wasActive)
                  _.trigger('+' + id);

            }

          // Breakpoint is not active ...
            else {

              // ... but it was active before? Trigger deactivate event.
                if (_.obj.breakpoints[id].wasActive)
                  _.trigger('-' + id);

            }

        });

    },

    /**
     * Generates a state-specific config.
     * @param {object} baseConfig Base config.
     * @param {object} breakpointConfigs Breakpoint-specific configs.
     * @return {object} State-specific config.
     */
    generateStateConfig: function(baseConfig, breakpointConfigs) {

      var x = {};

      // Extend with base config.
        _.extend(x, baseConfig);

      // Extend with configs for each active breakpoint.
        _.iterate(_.breakpointIds, function(k) {
          _.extend(x, breakpointConfigs[_.breakpointIds[k]]);
        });

      return x;

    },

    /**
     * Gets the current state ID.
     * @return {string} State ID.
     */
    getStateId: function() {

      var stateId = '';

      _.iterate(_.obj.breakpoints, function(id) {

        var b = _.obj.breakpoints[id];

        // Active? Append breakpoint ID to state ID.
          if (b.matches())
            stateId += _.sd + b.id;

      });

      return stateId;

    },

    /**
     * Polls for state changes.
     */
    poll: function() {

      var newStateId = '';

      // Determine new state.
        newStateId = _.getStateId();

        if (newStateId === '')
          newStateId = _.sd;

      // State changed?
        if (newStateId !== _.stateId)
          _.changeState(newStateId);

    },

  /******************************/
  /* Methods: Attachments       */
  /******************************/

    /**
     * Attach point for attach()
     * @type {DOMElement}
     */
    _attach: null,

    /**
     * Attaches a single attachment.
     * @param {object} attachment Attachment.
     * @return bool True on success, false on failure.
     */
    attach: function(attachment) {

      var h = _.obj.head,
        e = attachment.element;

      // Already attached? Bail.
        if (e.parentNode
        &&  e.parentNode.tagName)
          return false;

      // Add to <head>

        // No attach point yet? Use <head>'s first child.
          if (!_._attach)
            _._attach = h.firstChild;

        // Insert element.
          h.insertBefore(e, _._attach.nextSibling);

        // Permanent attachment? Make its element the new attach point.
          if (attachment.permanent)
            _._attach = e;

      //console.log('[skel] ' + attachment.id + ': attached (' + attachment.priority + ')');

      return true;

    },

    /**
     * Attaches a list of attachments.
     * @param {array} attachments Attachments.
     */
    attachAll: function(attachments) {

      var a = [];

      // Organize attachments by priority.
        _.iterate(attachments, function(k) {

          if (!a[ attachments[k].priority ])
            a[ attachments[k].priority ] = [];

          a[ attachments[k].priority ].push(attachments[k]);

        });

      // Reverse array order.
        a.reverse();

      // Step through each priority.
        _.iterate(a, function(k) {
          _.iterate(a[k], function(x) {
            _.attach(a[k][x]);
          });
        });

    },

    /**
     * Detaches a single attachment.
     * @param {object} attachment Attachment.
     * @return bool True on success, false on failure.
     */
    detach: function(attachment) {

      var e = attachment.element;

      // Permanent or already detached? Bail.
        if (attachment.permanent
        ||  !e.parentNode
        ||  (e.parentNode && !e.parentNode.tagName))
          return false;

      // Detach.
        e.parentNode.removeChild(e);

      return true;

    },

    /**
     * Detaches all attachments.
     * @param {object} exclude A list of attachments to exclude.
     */
    detachAll: function(exclude) {

      var l = {};

      // Build exclusion list (for faster lookups).
        _.iterate(exclude, function(k) {
          l[exclude[k].id] = true;
        });

      _.iterate(_.obj.attachments, function(id) {

        // In our exclusion list? Bail.
          if (id in l)
            return;

        // Attempt to detach.
          _.detach(_.obj.attachments[id]);

      });

    },

    attachment: function(id) {
      return (id in _.obj.attachments ? _.obj.attachments[id] : null);
    },

    /**
     * Creates a new attachment.
     * @param {string} id ID.
     * @param {DOMElement} element DOM element.
     */
    newAttachment: function(id, element, priority, permanent) {

      return (_.obj.attachments[id] = {
        id: id,
        element: element,
        priority: priority,
        permanent: permanent
      });

    },

  /******************************/
  /* Methods: Init              */
  /******************************/

    /**
     * Initializes skel.
     * This has to be explicitly called by the user.
     */
    init: function() {

      // Initialize stuff.
        _.initMethods();
        _.initVars();
        _.initEvents();

      // Tmp.
        _.obj.head = document.getElementsByTagName('head')[0];

      // Mark as initialized.
        _.isInit = true;

      // Trigger init event.
        _.trigger('init');

      //console.log('[skel] initialized.');

    },

    /**
     * Initializes browser events.
     */
    initEvents: function() {

      // On resize.
        _.on('resize', function() { _.poll(); });

      // On orientation change.
        _.on('orientationChange', function() { _.poll(); });

      // Wrap "ready" event.
        _.DOMReady(function() {
          _.trigger('ready');
        });

      // Non-destructively register skel events to window.

        // Load.
          if (window.onload)
            _.on('load', window.onload);

          window.onload = function() { _.trigger('load'); };

        // Resize.
          if (window.onresize)
            _.on('resize', window.onresize);

          window.onresize = function() { _.trigger('resize'); };

        // Orientation change.
          if (window.onorientationchange)
            _.on('orientationChange', window.onorientationchange);

          window.onorientationchange = function() { _.trigger('orientationChange'); };

    },

    /**
     * Initializes methods.
     */
    initMethods: function() {

      // _.DOMReady (based on github.com/ded/domready by @ded; domready (c) Dustin Diaz 2014 - License MIT)

        // Hack: Use older version for browsers that don't support addEventListener (*cough* IE8).
          if (!document.addEventListener)
            !function(e,t){_.DOMReady = t()}("domready",function(e){function p(e){h=1;while(e=t.shift())e()}var t=[],n,r=!1,i=document,s=i.documentElement,o=s.doScroll,u="DOMContentLoaded",a="addEventListener",f="onreadystatechange",l="readyState",c=o?/^loaded|^c/:/^loaded|c/,h=c.test(i[l]);return i[a]&&i[a](u,n=function(){i.removeEventListener(u,n,r),p()},r),o&&i.attachEvent(f,n=function(){/^c/.test(i[l])&&(i.detachEvent(f,n),p())}),e=o?function(n){self!=top?h?n():t.push(n):function(){try{s.doScroll("left")}catch(t){return setTimeout(function(){e(n)},50)}n()}()}:function(e){h?e():t.push(e)}});
        // And everyone else.
          else
            !function(e,t){_.DOMReady = t()}("domready",function(){function s(t){i=1;while(t=e.shift())t()}var e=[],t,n=document,r="DOMContentLoaded",i=/^loaded|^c/.test(n.readyState);return n.addEventListener(r,t=function(){n.removeEventListener(r,t),s()}),function(t){i?t():e.push(t)}});

      // _.indexOf

        // Wrap existing method if it exists.
          if (Array.prototype.indexOf)
            _.indexOf = function(x,b) { return x.indexOf(b) };

        // Otherwise, polyfill.
          else
            _.indexOf = function(x,b){if (typeof x=='string') return x.indexOf(b);var c,a=(b)?b:0,e;if(!this){throw new TypeError()}e=this.length;if(e===0||a>=e){return -1}if(a<0){a=e-Math.abs(a)}for(c=a;c<e;c++){if(this[c]===x){return c}}return -1};

      // _.isArray

        // Wrap existing method if it exists.
          if (Array.isArray)
            _.isArray = function(x) { return Array.isArray(x) };

        // Otherwise, polyfill.
          else
            _.isArray = function(x) { return (Object.prototype.toString.call(x) === '[object Array]') };

      // _.iterate

        // Use Object.keys if it exists (= better performance).
          if (Object.keys)
            _.iterate = function(a, f) {

              if (!a)
                return [];

              var i, k = Object.keys(a);

              for (i = 0; k[i]; i++) {

                if ((f)(k[i], a[k[i]]) === false)
                  break;

              }

            };

        // Otherwise, fall back on hasOwnProperty (= slower, but works on older browsers).
          else
            _.iterate = function(a, f) {

              if (!a)
                return [];

              var i;

              for (i in a)
                if (Object.prototype.hasOwnProperty.call(a, i)) {

                  if ((f)(i, a[i]) === false)
                    break;

                }

            };

      // _.matchesMedia

        // Default: Use matchMedia (all modern browsers)
          if (window.matchMedia)
            _.matchesMedia = function(query) {

              if (query == '')
                return true;

              return window.matchMedia(query).matches;

            };

        // Polyfill 1: Use styleMedia/media (IE9, older Webkit) (derived from github.com/paulirish/matchMedia.js)
          else if (window.styleMedia || window.media)
            _.matchesMedia = function(query) {

              if (query == '')
                return true;

              var styleMedia = (window.styleMedia || window.media);

              return styleMedia.matchMedium(query || 'all');

            };

        // Polyfill 2: Use getComputed Style (???) (derived from github.com/paulirish/matchMedia.js)
          else if (window.getComputedStyle)
            _.matchesMedia = function(query) {

              if (query == '')
                return true;

              var style = document.createElement('style'),
                script = document.getElementsByTagName('script')[0],
                info = null;

              style.type = 'text/css';
              style.id = 'matchmediajs-test';
              script.parentNode.insertBefore(style, script);
              info = ('getComputedStyle' in window) && window.getComputedStyle(style, null) || style.currentStyle;

              var text = '@media ' + query + '{ #matchmediajs-test { width: 1px; } }';

              if (style.styleSheet)
                style.styleSheet.cssText = text;
              else
                style.textContent = text;

              return info.width === '1px';

            };

        // Polyfill 3: Manually parse (IE<9)
          else
            _.matchesMedia = function(query) {

              // Empty query? Always succeed.
                if (query == '')
                  return true;

              // Parse query.
                var k, s, a, b, values = { 'min-width': null, 'max-width': null },
                  found = false;

                a = query.split(/\s+and\s+/);

                for (k = 0; k < a.length; k++) {

                  s = a[k];

                  // Operator (key: value)
                    if (s.charAt(0) == '(') {

                      s = s.substring(1, s.length - 1);
                      b = s.split(/:\s+/);

                      if (b.length == 2) {

                        values[ b[0].replace(/^\s+|\s+$/g, '') ] = parseInt( b[1] );
                        found = true;

                      }

                    }

                }

              // No matches? Query likely contained something unsupported so we automatically fail.
                if (!found)
                  return false;

              // Check against viewport.
                var w = document.documentElement.clientWidth,
                  h = document.documentElement.clientHeight;

                if ((values['min-width'] !== null && w < values['min-width'])
                ||  (values['max-width'] !== null && w > values['max-width'])
                ||  (values['min-height'] !== null && h < values['min-height'])
                ||  (values['max-height'] !== null && h > values['max-height']))
                  return false;

              return true;

            };

      // _.newStyle

        // IE<9 fix.
          if (navigator.userAgent.match(/MSIE ([0-9]+)/)
          &&  RegExp.$1 < 9)
            _.newStyle = function(content) {

              var e = document.createElement('span');
                e.innerHTML = '&nbsp;<style type="text/css">' + content + '</style>';

              return e;

            };

    },

    /**
     * Initializes the vars.
     */
    initVars: function() {

      var x, y, a, ua = navigator.userAgent;

      // browser, browserVersion.
        x = 'other';
        y = 0;
        a = [
          ['firefox',   /Firefox\/([0-9\.]+)/],
          ['bb',      /BlackBerry.+Version\/([0-9\.]+)/],
          ['bb',      /BB[0-9]+.+Version\/([0-9\.]+)/],
          ['opera',   /OPR\/([0-9\.]+)/],
          ['opera',   /Opera\/([0-9\.]+)/],
          ['edge',    /Edge\/([0-9\.]+)/],
          ['safari',    /Version\/([0-9\.]+).+Safari/],
          ['chrome',    /Chrome\/([0-9\.]+)/],
          ['ie',      /MSIE ([0-9]+)/],
          ['ie',      /Trident\/.+rv:([0-9]+)/]
        ];

        _.iterate(a, function(k, v) {

          if (ua.match(v[1])) {

            x = v[0];
            y = parseFloat(RegExp.$1);

            return false;

          }

        });

        _.vars.browser = x;
        _.vars.browserVersion = y;

      // os, osVersion.
        x = 'other';
        y = 0;
        a = [
          ['ios',     /([0-9_]+) like Mac OS X/,      function(v) { return v.replace('_', '.').replace('_', ''); }],
          ['ios',     /CPU like Mac OS X/,        function(v) { return 0 }],
          ['wp',      /Windows Phone ([0-9\.]+)/,     null],
          ['android',   /Android ([0-9\.]+)/,       null],
          ['mac',     /Macintosh.+Mac OS X ([0-9_]+)/,  function(v) { return v.replace('_', '.').replace('_', ''); }],
          ['windows',   /Windows NT ([0-9\.]+)/,      null],
          ['bb',      /BlackBerry.+Version\/([0-9\.]+)/,  null],
          ['bb',      /BB[0-9]+.+Version\/([0-9\.]+)/,  null]
        ];

        _.iterate(a, function(k, v) {

          if (ua.match(v[1])) {

            x = v[0];
            y = parseFloat( v[2] ? (v[2])(RegExp.$1) : RegExp.$1 );

            return false;

          }

        });

        _.vars.os = x;
        _.vars.osVersion = y;

      // IEVersion.
        _.vars.IEVersion = (_.vars.browser == 'ie' ? _.vars.browserVersion : 99);

      // touch.
        _.vars.touch = (_.vars.os == 'wp' ? (navigator.msMaxTouchPoints > 0) : !!('ontouchstart' in window));

      // mobile.
        _.vars.mobile = (_.vars.os == 'wp' || _.vars.os == 'android' || _.vars.os == 'ios' || _.vars.os == 'bb');

    },

}; _.init(); return _; })();

// UMD Wrapper (github.com/umdjs/umd/blob/master/returnExports.js | @umdjs + @nason)
(function(root, factory) {

  root.skel = factory();

}(this, function() { return skel; }));

(function($) {

  /**
   * Generate an indented list of links from a nav. Meant for use with panel().
   * @return {jQuery} jQuery object.
   */
  $.fn.navList = function() {

    var $this = $(this);
      $a = $this.find('a'),
      b = [];

    $a.each(function() {

      var $this = $(this),
        indent = Math.max(0, $this.parents('li').length - 1),
        href = $this.attr('href'),
        target = $this.attr('target');

      b.push(
        '<a ' +
          'class="link depth-' + indent + '"' +
          ( (typeof target !== 'undefined' && target != '') ? ' target="' + target + '"' : '') +
          ( (typeof href !== 'undefined' && href != '') ? ' href="' + href + '"' : '') +
        '>' +
          '<span class="indent-' + indent + '"></span>' +
          $this.text() +
        '</a>'
      );

    });

    return b.join('');

  };

  /**
   * Panel-ify an element.
   * @param {object} userConfig User config.
   * @return {jQuery} jQuery object.
   */
  $.fn.panel = function(userConfig) {

    // No elements?
      if (this.length == 0)
        return $this;

    // Multiple elements?
      if (this.length > 1) {

        for (var i=0; i < this.length; i++)
          $(this[i]).panel(userConfig);

        return $this;

      }

    // Vars.
      var $this = $(this),
        $body = $('body'),
        $window = $(window),
        id = $this.attr('id'),
        config;

    // Config.
      config = $.extend({

        // Delay.
          delay: 0,

        // Hide panel on link click.
          hideOnClick: false,

        // Hide panel on escape keypress.
          hideOnEscape: false,

        // Hide panel on swipe.
          hideOnSwipe: false,

        // Reset scroll position on hide.
          resetScroll: false,

        // Reset forms on hide.
          resetForms: false,

        // Side of viewport the panel will appear.
          side: null,

        // Target element for "class".
          target: $this,

        // Class to toggle.
          visibleClass: 'visible'

      }, userConfig);

      // Expand "target" if it's not a jQuery object already.
        if (typeof config.target != 'jQuery')
          config.target = $(config.target);

    // Panel.

      // Methods.
        $this._hide = function(event) {

          // Already hidden? Bail.
            if (!config.target.hasClass(config.visibleClass))
              return;

          // If an event was provided, cancel it.
            if (event) {

              event.preventDefault();
              event.stopPropagation();

            }

          // Hide.
            config.target.removeClass(config.visibleClass);

          // Post-hide stuff.
            window.setTimeout(function() {

              // Reset scroll position.
                if (config.resetScroll)
                  $this.scrollTop(0);

              // Reset forms.
                if (config.resetForms)
                  $this.find('form').each(function() {
                    this.reset();
                  });

            }, config.delay);

        };

      // Vendor fixes.
        $this
          .css('-ms-overflow-style', '-ms-autohiding-scrollbar')
          .css('-webkit-overflow-scrolling', 'touch');

      // Hide on click.
        if (config.hideOnClick) {

          $this.find('a')
            .css('-webkit-tap-highlight-color', 'rgba(0,0,0,0)');

          $this
            .on('click', 'a', function(event) {

              var $a = $(this),
                href = $a.attr('href'),
                target = $a.attr('target');

              if (!href || href == '#' || href == '' || href == '#' + id)
                return;

              // Cancel original event.
                event.preventDefault();
                event.stopPropagation();

              // Hide panel.
                $this._hide();

              // Redirect to href.
                window.setTimeout(function() {

                  if (target == '_blank')
                    window.open(href);
                  else
                    window.location.href = href;

                }, config.delay + 10);

            });

        }

      // Event: Touch stuff.
        $this.on('touchstart', function(event) {

          $this.touchPosX = event.originalEvent.touches[0].pageX;
          $this.touchPosY = event.originalEvent.touches[0].pageY;

        })

        $this.on('touchmove', function(event) {

          if ($this.touchPosX === null
          ||  $this.touchPosY === null)
            return;

          var diffX = $this.touchPosX - event.originalEvent.touches[0].pageX,
            diffY = $this.touchPosY - event.originalEvent.touches[0].pageY,
            th = $this.outerHeight(),
            ts = ($this.get(0).scrollHeight - $this.scrollTop());

          // Hide on swipe?
            if (config.hideOnSwipe) {

              var result = false,
                boundary = 20,
                delta = 50;

              switch (config.side) {

                case 'left':
                  result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX > delta);
                  break;

                case 'right':
                  result = (diffY < boundary && diffY > (-1 * boundary)) && (diffX < (-1 * delta));
                  break;

                case 'top':
                  result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY > delta);
                  break;

                case 'bottom':
                  result = (diffX < boundary && diffX > (-1 * boundary)) && (diffY < (-1 * delta));
                  break;

                default:
                  break;

              }

              if (result) {

                $this.touchPosX = null;
                $this.touchPosY = null;
                $this._hide();

                return false;

              }

            }

          // Prevent vertical scrolling past the top or bottom.
            if (($this.scrollTop() < 0 && diffY < 0)
            || (ts > (th - 2) && ts < (th + 2) && diffY > 0)) {

              event.preventDefault();
              event.stopPropagation();

            }

        });

      // Event: Prevent certain events inside the panel from bubbling.
        $this.on('click touchend touchstart touchmove', function(event) {
          event.stopPropagation();
        });

      // Event: Hide panel if a child anchor tag pointing to its ID is clicked.
        $this.on('click', 'a[href="#' + id + '"]', function(event) {

          event.preventDefault();
          event.stopPropagation();

          config.target.removeClass(config.visibleClass);

        });

    // Body.

      // Event: Hide panel on body click/tap.
        jQuery("#website-wrapper").on('click touchend', function(event) {
          $this._hide(event);
        });

      // Event: Toggle.
        $body.on('click', 'a[href="#' + id + '"]', function(event) {

          event.preventDefault();
          event.stopPropagation();

          config.target.toggleClass(config.visibleClass);

        });

    // Window.

      // Event: Hide on ESC.
        if (config.hideOnEscape)
          $window.on('keydown', function(event) {

            if (event.keyCode == 27)
              $this._hide(event);

          });

    return $this;

  };

  /**
   * Apply "placeholder" attribute polyfill to one or more forms.
   * @return {jQuery} jQuery object.
   */
  $.fn.placeholder = function() {

    // Browser natively supports placeholders? Bail.
      if (typeof (document.createElement('input')).placeholder != 'undefined')
        return $(this);

    // No elements?
      if (this.length == 0)
        return $this;

    // Multiple elements?
      if (this.length > 1) {

        for (var i=0; i < this.length; i++)
          $(this[i]).placeholder();

        return $this;

      }

    // Vars.
      var $this = $(this);

    // Text, TextArea.
      $this.find('input[type=text],textarea')
        .each(function() {

          var i = $(this);

          if (i.val() == ''
          ||  i.val() == i.attr('placeholder'))
            i
              .addClass('polyfill-placeholder')
              .val(i.attr('placeholder'));

        })
        .on('blur', function() {

          var i = $(this);

          if (i.attr('name').match(/-polyfill-field$/))
            return;

          if (i.val() == '')
            i
              .addClass('polyfill-placeholder')
              .val(i.attr('placeholder'));

        })
        .on('focus', function() {

          var i = $(this);

          if (i.attr('name').match(/-polyfill-field$/))
            return;

          if (i.val() == i.attr('placeholder'))
            i
              .removeClass('polyfill-placeholder')
              .val('');

        });

    // Password.
      $this.find('input[type=password]')
        .each(function() {

          var i = $(this);
          var x = $(
                $('<div>')
                  .append(i.clone())
                  .remove()
                  .html()
                  .replace(/type="password"/i, 'type="text"')
                  .replace(/type=password/i, 'type=text')
          );

          if (i.attr('id') != '')
            x.attr('id', i.attr('id') + '-polyfill-field');

          if (i.attr('name') != '')
            x.attr('name', i.attr('name') + '-polyfill-field');

          x.addClass('polyfill-placeholder')
            .val(x.attr('placeholder')).insertAfter(i);

          if (i.val() == '')
            i.hide();
          else
            x.hide();

          i
            .on('blur', function(event) {

              event.preventDefault();

              var x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

              if (i.val() == '') {

                i.hide();
                x.show();

              }

            });

          x
            .on('focus', function(event) {

              event.preventDefault();

              var i = x.parent().find('input[name=' + x.attr('name').replace('-polyfill-field', '') + ']');

              x.hide();

              i
                .show()
                .focus();

            })
            .on('keypress', function(event) {

              event.preventDefault();
              x.val('');

            });

        });

    // Events.
      $this
        .on('submit', function() {

          $this.find('input[type=text],input[type=password],textarea')
            .each(function(event) {

              var i = $(this);

              if (i.attr('name').match(/-polyfill-field$/))
                i.attr('name', '');

              if (i.val() == i.attr('placeholder')) {

                i.removeClass('polyfill-placeholder');
                i.val('');

              }

            });

        })
        .on('reset', function(event) {

          event.preventDefault();

          $this.find('select')
            .val($('option:first').val());

          $this.find('input,textarea')
            .each(function() {

              var i = $(this),
                x;

              i.removeClass('polyfill-placeholder');

              switch (this.type) {

                case 'submit':
                case 'reset':
                  break;

                case 'password':
                  i.val(i.attr('defaultValue'));

                  x = i.parent().find('input[name=' + i.attr('name') + '-polyfill-field]');

                  if (i.val() == '') {
                    i.hide();
                    x.show();
                  }
                  else {
                    i.show();
                    x.hide();
                  }

                  break;

                case 'checkbox':
                case 'radio':
                  i.attr('checked', i.attr('defaultValue'));
                  break;

                case 'text':
                case 'textarea':
                  i.val(i.attr('defaultValue'));

                  if (i.val() == '') {
                    i.addClass('polyfill-placeholder');
                    i.val(i.attr('placeholder'));
                  }

                  break;

                default:
                  i.val(i.attr('defaultValue'));
                  break;

              }
            });

        });

    return $this;

  };

  /**
   * Moves elements to/from the first positions of their respective parents.
   * @param {jQuery} $elements Elements (or selector) to move.
   * @param {bool} condition If true, moves elements to the top. Otherwise, moves elements back to their original locations.
   */
  $.prioritize = function($elements, condition) {

    var key = '__prioritize';

    // Expand $elements if it's not already a jQuery object.
      if (typeof $elements != 'jQuery')
        $elements = $($elements);

    // Step through elements.
      $elements.each(function() {

        var $e = $(this), $p,
          $parent = $e.parent();

        // No parent? Bail.
          if ($parent.length == 0)
            return;

        // Not moved? Move it.
          if (!$e.data(key)) {

            // Condition is false? Bail.
              if (!condition)
                return;

            // Get placeholder (which will serve as our point of reference for when this element needs to move back).
              $p = $e.prev();

              // Couldn't find anything? Means this element's already at the top, so bail.
                if ($p.length == 0)
                  return;

            // Move element to top of parent.
              $e.prependTo($parent);

            // Mark element as moved.
              $e.data(key, $p);

          }

        // Moved already?
          else {

            // Condition is true? Bail.
              if (condition)
                return;

            $p = $e.data(key);

            // Move element back to its original location (using our placeholder).
              $e.insertAfter($p);

            // Unmark element as moved.
              $e.removeData(key);

          }

      });

  };

})(jQuery);

/*
  Prologue by HTML5 UP
  html5up.net | @ajlkn
  Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
*/

(function($) {
  skel.breakpoints({
    wide: '(min-width: 961px) and (max-width: 1880px)',
    normal: '(min-width: 961px) and (max-width: 1620px)',
    narrow: '(min-width: 961px) and (max-width: 1320px)',
    narrower: '(max-width: 960px)',
    mobile: '(max-width: 736px)'
  });

  $(function() {

    var $window = $(window),
      $body = $('body');

    // Disable animations/transitions until the page has loaded.
      $body.addClass('is-loading');

      $window.on('load', function() {
        $body.removeClass('is-loading');
      });

    // CSS polyfills (IE<9).
      if (skel.vars.IEVersion < 9)
        $(':last-child').addClass('last-child');

    // Fix: Placeholder polyfill.
      $('form').placeholder();

    // Prioritize "important" elements on mobile.
      skel.on('+mobile -mobile', function() {
        $.prioritize(
          '.important\\28 mobile\\29',
          skel.breakpoint('mobile').active
        );
      });

      // Header (narrower + mobile).

      // Toggle.
      $(
        '<div id="headerToggle">' +
          '<a href="#left-header" class="toggle">M<br>E<br>N<br>U</a>' +
        '</div>'
      )
        .appendTo($body);

      // Header.
      $('#left-header')
        .panel({
          delay: 200,
          hideOnClick: true,
          hideOnSwipe: false,
          resetScroll: true,
          resetForms: true,
          side: 'left',
          target: $body,
          visibleClass: 'header-visible'
        });

      // Fix: Remove transitions on WP<10 (poor/buggy performance).
        if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
          $('#headerToggle, #left-header, #website-wrapper')
            .css('transition', 'none');

  });

})(jQuery);


var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

jQuery(document).ready(function($){
  +function(t,e,i){"use strict";var r={calc:!1};e.fn.rrssb=function(t){var r=e.extend({description:i,emailAddress:i,emailBody:i,emailSubject:i,image:i,title:i,url:i},t);r.emailSubject=r.emailSubject||r.title,r.emailBody=r.emailBody||(r.description?r.description:"")+(r.url?"\n\n"+r.url:"");for(var s in r)r.hasOwnProperty(s)&&r[s]!==i&&(r[s]=a(r[s]));r.url!==i&&(e(this).find(".rrssb-facebook a").attr("href","https://www.facebook.com/sharer/sharer.php?u="+r.url),e(this).find(".rrssb-tumblr a").attr("href","http://tumblr.com/share/link?url="+r.url+(r.title!==i?"&name="+r.title:"")+(r.description!==i?"&description="+r.description:"")),e(this).find(".rrssb-linkedin a").attr("href","http://www.linkedin.com/shareArticle?mini=true&url="+r.url+(r.title!==i?"&title="+r.title:"")+(r.description!==i?"&summary="+r.description:"")),e(this).find(".rrssb-twitter a").attr("href","https://twitter.com/intent/tweet?text="+(r.description!==i?r.description:"")+"%20"+r.url),e(this).find(".rrssb-hackernews a").attr("href","https://news.ycombinator.com/submitlink?u="+r.url+(r.title!==i?"&text="+r.title:"")),e(this).find(".rrssb-reddit a").attr("href","http://www.reddit.com/submit?url="+r.url+(r.description!==i?"&text="+r.description:"")+(r.title!==i?"&title="+r.title:"")),e(this).find(".rrssb-googleplus a").attr("href","https://plus.google.com/share?url="+(r.description!==i?r.description:"")+"%20"+r.url),e(this).find(".rrssb-pinterest a").attr("href","http://pinterest.com/pin/create/button/?url="+r.url+(r.image!==i?"&amp;media="+r.image:"")+(r.description!==i?"&description="+r.description:"")),e(this).find(".rrssb-pocket a").attr("href","https://getpocket.com/save?url="+r.url),e(this).find(".rrssb-github a").attr("href",r.url),e(this).find(".rrssb-print a").attr("href","javascript:window.print()"),e(this).find(".rrssb-whatsapp a").attr("href","whatsapp://send?text="+(r.description!==i?r.description+"%20":r.title!==i?r.title+"%20":"")+r.url)),(r.emailAddress!==i||r.emailSubject)&&e(this).find(".rrssb-email a").attr("href","mailto:"+(r.emailAddress?r.emailAddress:"")+"?"+(r.emailSubject!==i?"subject="+r.emailSubject:"")+(r.emailBody!==i?"&body="+r.emailBody:""))};var s=function(){var t=e("<div>"),i=["calc","-webkit-calc","-moz-calc"];e("body").append(t);for(var s=0;s<i.length;s++)if(t.css("width",i[s]+"(1px)"),1===t.width()){r.calc=i[s];break}t.remove()},a=function(t){if(t!==i&&null!==t){if(null===t.match(/%[0-9a-f]{2}/i))return encodeURIComponent(t);t=decodeURIComponent(t),a(t)}},n=function(){e(".rrssb-buttons").each(function(t){var i=e(this),r=e("li:visible",i),s=r.length,a=100/s;r.css("width",a+"%").attr("data-initwidth",a)})},l=function(){e(".rrssb-buttons").each(function(t){var i=e(this),r=i.width(),s=e("li",i).not(".small").eq(0).width(),a=e("li.small",i).length;if(s>170&&1>a){i.addClass("large-format");var n=s/12+"px";i.css("font-size",n)}else i.removeClass("large-format"),i.css("font-size","");25*a>r?i.removeClass("small-format").addClass("tiny-format"):i.removeClass("tiny-format")})},o=function(){e(".rrssb-buttons").each(function(t){var i=e(this),r=e("li",i),s=r.filter(".small"),a=0,n=0,l=s.eq(0),o=parseFloat(l.attr("data-size"))+55,c=s.length;if(c===r.length){var h=42*c,u=i.width();u>h+o&&(i.removeClass("small-format"),s.eq(0).removeClass("small"),d())}else{r.not(".small").each(function(t){var i=e(this),r=parseFloat(i.attr("data-size"))+55,s=parseFloat(i.width());a+=s,n+=r});var m=a-n;m>o&&(l.removeClass("small"),d())}})},c=function(t){e(".rrssb-buttons").each(function(t){var i=e(this),r=e("li",i);e(r.get().reverse()).each(function(t,i){var s=e(this);if(s.hasClass("small")===!1){var a=parseFloat(s.attr("data-size"))+55,n=parseFloat(s.width());if(a>n){var l=r.not(".small").last();e(l).addClass("small"),d()}}--i||o()})}),t===!0&&u(d)},d=function(){e(".rrssb-buttons").each(function(t){var i,s,a,l,o,c=e(this),d=e("li",c),h=d.filter(".small"),u=h.length;u>0&&u!==d.length?(c.removeClass("small-format"),h.css("width","42px"),a=42*u,i=d.not(".small").length,s=100/i,o=a/i,r.calc===!1?(l=(c.innerWidth()-1)/i-o,l=Math.floor(1e3*l)/1e3,l+="px"):l=r.calc+"("+s+"% - "+o+"px)",d.not(".small").css("width",l)):u===d.length?(c.addClass("small-format"),n()):(c.removeClass("small-format"),n())}),l()},h=function(){e(".rrssb-buttons").each(function(t){e(this).addClass("rrssb-"+(t+1))}),s(),n(),e(".rrssb-buttons li .rrssb-text").each(function(t){var i=e(this),r=i.width();i.closest("li").attr("data-size",r)}),c(!0)},u=function(t){e(".rrssb-buttons li.small").removeClass("small"),c(),t()},m=function(e,r,s,a){var n=t.screenLeft!==i?t.screenLeft:screen.left,l=t.screenTop!==i?t.screenTop:screen.top,o=t.innerWidth?t.innerWidth:document.documentElement.clientWidth?document.documentElement.clientWidth:screen.width,c=t.innerHeight?t.innerHeight:document.documentElement.clientHeight?document.documentElement.clientHeight:screen.height,d=o/2-s/2+n,h=c/3-a/3+l,u=t.open(e,r,"scrollbars=yes, width="+s+", height="+a+", top="+h+", left="+d);u&&u.focus&&u.focus()},f=function(){var t={};return function(e,i,r){r||(r="Don't call this twice without a uniqueId"),t[r]&&clearTimeout(t[r]),t[r]=setTimeout(e,i)}}();e(document).ready(function(){try{e(document).on("click",".rrssb-buttons a.popup",{},function(t){var i=e(this);m(i.attr("href"),i.find(".rrssb-text").html(),580,470),t.preventDefault()})}catch(i){}e(t).resize(function(){u(d),f(function(){u(d)},200,"finished resizing")}),h()}),t.rrssbInit=h}(window,jQuery);


  if (document.documentMode) {
     document.documentElement.className+=' ie'+document.documentMode;
  }

  var body = document.body,
    timer;

if (jQuery('.portlet-collection-front-page-collection').length) {
  imagesLoaded('.portlet-collection-front-page-collection #row-items', function() {
    var elem = document.querySelector('.portlet-collection-front-page-collection #row-items');
    var msnry = new Masonry(elem, {
       itemSelector: '.portlet-item',
       gutter: 16,
       fitWidth: true,
       columnWidth: 210,
       horizontalOrder: true
    });
    $(".portlet-collection-front-page-collection").addClass('init');
  });
}

  if (jQuery("body").hasClass('template-advancedsearch')) {
    jQuery("#advanced_search_form").submit(function() {
        jQuery('input').each(function() {
            if (jQuery(this).val() == '') {
                jQuery(this).attr("name", '');
            }
        });
    });
  }

  jQuery(".rrssb-buttons a.popup").on("click", function(event) {
    event.preventDefault();
  });

  jQuery("#sharing-buttons-toggle").on('click', function(event) {
    event.preventDefault();
    jQuery(".sharing-buttons-wrapper").toggleClass('open');
  });

  jQuery('#images-only-filter').change(function(){
    if (jQuery(this).attr('checked')){
        jQuery(this).val('False');
    } else { 
        jQuery(this).val('True');
    }
  });

  if (jQuery("#row-items").length) {
    jQuery('.tileImage').hover(function() {
      jQuery(this).parents('article.entry, .col-lg-4').find('.item-title a').addClass('hover');
    },
    function() {
      jQuery(this).parents('article.entry, .col-lg-4').find('.item-title a').removeClass('hover');
    });
  }

  jQuery('ul.nav li.dropdown').click(function() {
      jQuery(this).closest('.dropdown-menu').stop(true, true).show();
      jQuery(this).toggleClass("open");
  });
  
  if (isMobile.any()) {
    jQuery("body").addClass("mobile");
  } else {
    jQuery("body").addClass("no-touch");
  }
});

_logger = {}
_logger.debug = false;

_logger.log = function(text) {
  if (_logger.debug) {
    console.log(text);
  }
};

require(['jquery', 'pat-registry'],
  function(jQuery, registry) {
    jQuery(document).on('readyAgain', function(event, data) {
      var scansearch = jQuery('body');
      if (event.type == "readyAgain") {
        scansearch = data.fieldset_id;
        registry.scan(jQuery(scansearch));
      }
    });
});

require([
  'jquery',
], function($, dep1, logger){
  'use strict';
  // initialize only if we are in top frame
  if (window.parent === window) {
    jQuery(document).ready(function() {
      jQuery('body').addClass('kunsthalkade-main');
    });
  }
});


