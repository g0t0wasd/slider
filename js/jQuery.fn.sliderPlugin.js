(function($){
    var defaults = {
      width : 500,
      height : 300,
      src : "books.xml",
      scrollSpeed : 700 // slower value - faster scrolling
    };

    var options;

    $.fn.sliderPlugin = function(params){

        options = $.extend({}, defaults, options, params);

// creating DOM
        var wrapper = $('<div>',{
            id: "wrapper"
        });
        var img1 = $('<img>',{
           id : "left_button",
           class : "controller",
           src : "images/arrow_left.png"
        });
        var img2 = $('<img>',{
            id : "right_button",
            class : "controller",
            src : "images/arrow_right.png"
        });
        var first = $("<div>", {
            id : "first"
        });
        var second = $("<div>", {
            id : "second"
        });
        $(wrapper).appendTo(this);
        $(img1).appendTo(wrapper);
        $(first).insertAfter(img1);
        $(second).appendTo(first);
        $(img2).insertAfter(first);

// Array which contains all the images
        var initialImagesArray = [];


// "wrapper" div
        var wrapperDiv = $("#wrapper");
// "window" where our slider will appear
        var outerDiv = $('#first');
// div which we will slide
        var slidingDiv = $("#second");

// control buttons
        var leftButton = $("#left_button");
        var rightButton = $("#right_button");
// width for slidingDiv. will be set up in ParseXML function
        var totalWidth;

// setting up width and height of outerDiv.
// Its customizable but for best result width should be 2.7 (or less) times greater than height.
        var outerDivHeight = options.height;
        var outerDivWidth = options.width;

        outerDiv.css("width",outerDivWidth);
        outerDiv.css("height",outerDivHeight);
//setting up size of wrapper. It should be a bit wider (1.2 times good enough) than outer div.
        wrapperDiv.css("width",outerDivWidth * 1.2);
        wrapperDiv.css("height",outerDivHeight);

// setting up sizes of buttons.
        rightButton.css("width", outerDivWidth / 10);
        rightButton.css("height", outerDivWidth / 10);
        leftButton.css("width",outerDivWidth / 10);
        leftButton.css("height",outerDivWidth / 10);

// side margins for images
        var imageMargins = outerDivWidth / 100;

//initial slide
        slidingDiv.css("left",0);

// creating and adding images to the slidingDiv

        function createSlidingDiv() {
            for (var i = 0; i < initialImagesArray.length; i++) {
                var img = $(document.createElement("img"));
                img.attr("src", initialImagesArray[i]);
                // setting up margins. We divide imageMargins by 2 because it contains value for both sides
                img.css("marginLeft",imageMargins / 2);
                img.css("marginRight",imageMargins / 2);
                img.load(function () {
                    totalWidth += imgResize(this);
                    slidingDiv.css("width",totalWidth);
                });
                slidingDiv.append(img);
            }
        };

// uploading images from XML file
        document.body.onload = function () {
            GetXMLFile(options.src, ParseXML);
        };

// resize images, so they fit height of outerDiv. Returns width so we can increase innerDiv's width
        function imgResize(image){
            var factor = outerDivHeight / image.clientHeight;
            var initialWidth = image.clientWidth;
            image.height = outerDivHeight;
            initialWidth *= factor;
            image.width = initialWidth;
            return initialWidth;
        };

        var indent = 0; // initial indent
        var t; //will contain our setInterval

        function slide(n) {
            if (indent + n > 0) {
                leftButton.css("opacity",0.5);
            } else if(indent + n < -totalWidth + outerDivWidth){
                rightButton.css("opacity",0.5);
            }
            else {
                indent += n;
                slidingDiv.css("left", indent);
                leftButton.css("opacity",1);
                rightButton.css("opacity",1);

            }
        }



        // setting up handlers.

        rightButton.mousedown(function(){t = setInterval(function() {slide(-totalWidth/options.scrollSpeed)},10)});
        rightButton.mouseup(function(){clearInterval(t)});

        leftButton.mousedown(function(){t = setInterval(function() {slide(totalWidth/options.scrollSpeed)},10)});
        leftButton.mouseup(function(){clearInterval(t)});

//======================XML parsing=======================================================

// XML Parsing function
        function ParseXML(Response)
        {
            // get document
            var doc = Response.responseXML.documentElement;

            // get all "images" from document

            var items = doc.getElementsByTagName("image");

            // for each image add its add its content to the initialImages array
            for (var i = 0; i < items.length; i++){
                initialImagesArray.push(items[i].textContent);
            }
            // setting up totalWidth.
            totalWidth = initialImagesArray.length * imageMargins;

        }

        // Creating XML request
        function CreateRequest()
        {
            var Request = false;
            // creating request based on user's browser
            if (window.XMLHttpRequest)
            {
                //Safari, Konqueror
                Request = new XMLHttpRequest();
            }
            else if (window.ActiveXObject)
            {
                //Internet explorer
                Request = new ActiveXObject("Microsoft.XMLHTTP");
                if (!Request)
                {
                    HRequest = new ActiveXObject("Msxml2.XMLHTTP");
                }
            }
            if (!Request)
            {
                alert("Impossible to create XMLHttpRequest");
            }

            return Request;
        }

        /*
         Sending request function
         r_method  — type of request: GET или POST
         r_path    — path to the file
         r_handler — function that handles the request
         */
        function SendRequest(r_method, r_path, r_handler)
        {
            //Creating request
            var Request = CreateRequest();
            //Setting up users handler
            Request.onreadystatechange = function()
            {
                //When data uploaded
                if (Request.readyState == 4)
                {
                    //Run user's request handler
                    r_handler(Request);
                    // set up DOM
                    createSlidingDiv();
                }
            };
            //Connection initializing
            Request.open(r_method, r_path, true);
            Request.send(null);
        }

        /*
         File receiving function
         filename — name of a file (relative or absolute path from root)
         handler — handler function
         */
        function GetXMLFile(filename, handler)
        {
            SendRequest("GET",filename,handler);
        }
    };
})(jQuery);