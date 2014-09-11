// Array which contains all the images
var initialImagesArray = [];


// "wrapper" div
var wrapperDiv = document.getElementById("wrapper");
// "window" where our slider will appear
var outerDiv = document.getElementById('first');
// div which we will slide
var slidingDiv = document.getElementById("second");

// control buttons
var leftButton = document.getElementById("left_button");
var rightButton = document.getElementById("right_button");

// width for slidingDiv. will be set up in ParseXML function
var totalWidth;

// setting up width and height of outerDiv.
// Its customizable but for best result width should be 2.7 (or less) times greater than height.
var outerDivHeight = 300;
var outerDivWidth = 500;

outerDiv.style.width = outerDivWidth +"px";
outerDiv.style.height = outerDivHeight + "px";
//setting up size of wrapper. It should be a bit wider (1.2 times good enough) than outer div.
wrapperDiv.style.width = outerDivWidth * 1.2 +"px";
wrapperDiv.style.height = outerDivHeight + "px";

// setting up sizes of buttons.
rightButton.style.width = outerDivWidth / 10 + "px";
rightButton.style.height = outerDivWidth / 10 + "px";
leftButton.style.width = outerDivWidth / 10 + "px";
leftButton.style.height = outerDivWidth / 10 + "px";

// side margins for images
var imageMargins = outerDivWidth / 100;

//initial slide
slidingDiv.style.left = '0px';

// creating and adding images to the slidingDiv

function createSlidingDiv() {
    for (var i = 0; i < initialImagesArray.length; i++) {
        var img = document.createElement("img");
        img.src = initialImagesArray[i];
        // setting up margins. We divide imageMargins by 2 because it contains value for both sides
        img.style.marginLeft = imageMargins / 2 +"px";
        img.style.marginRight = imageMargins / 2 +"px";
        img.onload = function () {
            totalWidth += imgResize(this);
            slidingDiv.style.width = totalWidth + "px";
        };
        slidingDiv.appendChild(img);
    }
};

// uploading images from XML file
document.body.onload = function () {
    GetXMLFile("books.xml", ParseXML);
};

// resize images, so they fit height of outerDiv. Returns width so we can increase innerDiv's width
function imgResize(image){
    var factor = outerDivHeight / image.height;
    var initialWidth = image.width;
    image.style.height = outerDivHeight +'px';
    initialWidth *= factor;
    image.style.width = initialWidth +'px';
    return initialWidth;
};

// variables needed for rightSlide, leftSlide functions
var currChild = 0;
var allChildren = slidingDiv.children;
// initial indentation for slidingDiv
var indent = 0;
// needed if we come to last image and have to slide not its full length
var fitLastIndent;
// needed to check if we have to use fitLastIndent
var inReverse = false;

//slide slidingDiv to the right
function rightSlide() {
    if (currChild == allChildren.length-2){
        // count how long we still have to slide right, to fit the outerDiv
        fitLastIndent = (allChildren[currChild].width + allChildren[currChild+1].width) - outerDivWidth;

        //converting fitLastIndent to negative value so we can slide to the right
        fitLastIndent = (fitLastIndent < 0) ? fitLastIndent : -fitLastIndent;

        indent += fitLastIndent;
        currChild++;
        rightButton.style.opacity = "0.5";
        inReverse = true;
    }
    else if (currChild + 1 < allChildren.length){
        indent += - allChildren[currChild].width - imageMargins;
        currChild++;
    }
    slidingDiv.style.left = indent + 'px';
    leftButton.style.opacity = "1";
}

//slide slidingDiv to the left
function slideLeft(){
    if (inReverse){
        indent += -(fitLastIndent);
        inReverse = false;
        currChild--;
    } else if(currChild == 0){
        leftButton.style.opacity = "0.5";
        return;
    }
    else{
        currChild--;
        indent += allChildren[currChild].width + imageMargins;
    }
    slidingDiv.style.left = indent + "px";
    rightButton.style.opacity = '1';
}

// setting up event handlers for buttons
rightButton.onclick = rightSlide;
leftButton.onclick = slideLeft;

//======================XML parsing=======================================================

//Функция-обработчик ответа
function ParseXML(Response)
{
    //Получаем документ
    var doc = Response.responseXML.documentElement;
    //Проходимся по всем элементам-записям и  составляем их репрезентацию

    var items = doc.getElementsByTagName("image");

    for (var i = 0; i < items.length; i++){
        initialImagesArray.push(items[i].textContent);
    }
    // setting up totalWidth. 10 stands for side margins of image. If you change css for image - change this too
    totalWidth = initialImagesArray.length * imageMargins;

}

/*
 Функция создания XMLHttpRequest
 */
function CreateRequest()
{
    var Request = false;
    if (window.XMLHttpRequest)
    {
        //Gecko-совместимые браузеры, Safari, Konqueror
        Request = new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        //Internet explorer
        Request = new ActiveXObject("Microsoft.XMLHTTP");
    }
    if (!Request)
    {
        alert("Невозможно создать XMLHttpRequest");
    }

    return Request;
}

/*
 Функция посылки запроса к файлу на сервере
 r_method  — тип запроса: GET или POST
 r_path    — путь к файлу
 r_handler — функция-обработчик ответа от сервера
 */
function SendRequest(r_method, r_path, r_handler)
{
    //Создаём запрос
    var Request = CreateRequest();
    //Назначаем пользовательский обработчик
    Request.onreadystatechange = function()
    {
        //Если обмен данными завершен
        if (Request.readyState == 4)
        {
            //Передаем управление обработчику пользователя
            r_handler(Request);
            createSlidingDiv();
        }
    };
    //Инициализируем соединение
    Request.open(r_method, r_path, true);
    Request.send(null);
}

/*
 Функция для получения файла
 filename — имя файла (относительный или абсолютный от корня Web-сайта)
 handler — функция-обработчик результата
 */
function GetXMLFile(filename, handler)
{
    SendRequest("GET",filename,handler);
}