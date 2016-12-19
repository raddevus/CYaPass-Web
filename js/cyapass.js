// cyapass.js

var ctx = null;
var theCanvas = null;
window.addEventListener("load", initApp);

// *******************************
// ****** begin CYaPass code *****
// *******************************
var centerPoint = 50;
var postWidth = 6;
var numOfCells = 6;
var offset = 5;
var cellSize = 50;
var postSize = 6;
var allPosts = [];
var postOffset = Math.trunc(postSize / 2)
var us = new UserPath();

function Point (p){
	this.x = p.x || -1;
	this.y = p.y || -1;
}

function generateAllPosts(){
	allPosts = [];
	for (var x = 0; x < numOfCells; x++)
	{
		for (var y = 0; y < numOfCells; y++)
		{
			allPosts.push(new Point({x:(centerPoint * x) - (postWidth / 2),y:(centerPoint * y) - (postWidth / 2)}));
			//console.log(allPosts[allPosts.length-1]);
		}
	}
	console.log("generateAllPosts() post count: " + allPosts.length);
}

function drawPosts(){
	for (var pointCounter = 0; pointCounter < allPosts.length;pointCounter++) {
		drawCircle(allPosts[pointCounter], "OrangeRed", "OrangeRed", postSize);
	}

}

function drawGridLines(){
	for (var y = 0; y < numOfCells; ++y)
	{
		drawLine(new Point({x:0, y:y * cellSize}), new Point({x:numOfCells * cellSize,y:y * cellSize}),"black");
	}

	for (var x = 0; x < numOfCells; ++x)
	{
		drawLine(new Point({x: x * cellSize, y:0}),new Point({x: x * cellSize, y:numOfCells * cellSize}), "black");
	}
}

function drawCircle(pt, fillStyle, strokeStyle, circleSize, lineWidth){
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle= strokeStyle;
		ctx.globalAlpha = 1;
		ctx.lineWidth = lineWidth || 1;
		ctx.beginPath();
		ctx.arc(pt.x + postOffset, pt.y + postOffset,circleSize,0,2*Math.PI);
		ctx.stroke();
		ctx.fill();
		// reset opacity
		ctx.globalAlpha = 1;
}

function hitTest(p, pointArray, areaSize){
	// iterate through all points
	var loopCount = 0;
	for (var x = 0;x<pointArray.length;x++){
		if ((Math.abs(p.x - pointArray[x].x) <= areaSize) && Math.abs(p.y - pointArray[x].y) <= areaSize){
			return x;
		}
	} 
/*	for (var i = 0; i < allPosts.length;i++){
		if ((p.x >= (allPosts[i].x + offset) - postWidth) && (p.x <= (allPosts[i].x + offset) + postWidth))
		{
			if ((p.y >= (allPosts[i].y + offset) - postWidth) && (p.y <= (allPosts[i].y + offset) + postWidth))
			{
				p = allPosts[i];
				return loopCount;
			}
		}
		loopCount++;
	} */
	return -1;
}

function getMousePos(evt) {
	
	var rect = theCanvas.getBoundingClientRect();
	var currentPoint = {};
	currentPoint.x = evt.clientX - rect.left;
	currentPoint.y = evt.clientY - rect.top;
	console.log(currentPoint);
	return currentPoint;
}

function mouseDownHandler(event){

	selectNewPoint(event)
	drawHighlight();
	drawUserShape();
	generatePassword();
	console.log("mouseDown");
}

function selectNewPoint(event){
	var currentPoint = getMousePos(event);
	var hitTestIdx = hitTest(currentPoint, allPosts, postSize + 9);
	if (hitTestIdx == -1){
		return;
	}
	console.log("hitTestIdx : " + hitTestIdx);
	currentPoint = allPosts[hitTestIdx]; // this sets it to the exact values of the post center
	us.append(currentPoint, Math.trunc(hitTestIdx + (hitTestIdx * Math.trunc(hitTestIdx / 6) * 10)));
	us.CalculateGeometricValue();
	console.log(currentPoint.x + " : " + currentPoint.y);
}

function drawHighlight(){
	
	// there are not points so return without attempting highlight
	if (us.allPoints.length < 1){return;}
	
	drawCircle(new Point({x:us.allPoints[0].x, y:us.allPoints[0].y}), "rgba(0, 0, 0, 0)", "orange", 10, 2);

}

function drawUserShape(){
	for (var i = 0; i < us.allSegments.length;i++){
		drawLine(us.allSegments[i].Begin, us.allSegments[i].End, "green", 4, true);
	}
}

function generatePassword(){
	selectedItem = $("#SiteListBox").val();
	if (selectedItem == null || selectedItem == ""){
		return;
	}
	if (us.allSegments.length <= 0)
	{
		return;
	}
	ComputeHashBytes();
	addUppercaseLetter();
	if ($("#addSpecialCharsCheckBox").attr('checked') || $("#addSpecialCharsCheckBox").prop('checked')){
		addSpecialChars();
	}
	
}

function ComputeHashBytes(){
	console.log("computing hash...");
	console.log("selectedItem : " + selectedItem);
	var hashValue = sha256(us.PointValue+selectedItem);
	console.log(hashValue);
	$("#passwordText").val(hashValue);
}

function addButtonClick(){
	$("#siteKeyErrMsg").text("");
	$("#AddSiteKeyModal").modal('toggle');
}
var allSiteKeys = [];
function addSiteKey(item, isInit){
	
	//1. get currently selected item in the list 
	//$("#SiteListBox").val("test").change();
	$("#siteKeyErrMsg").text("");
	if (item === undefined || item === null){
		var item = $("#SiteKeyItem").val();
		console.log("undefined ITEM");
	}
	
	if (item != ""){
		$('#SiteListBox').append( new Option(item,item) );
		$('#AddSiteKeyModal').modal('hide');
		$("#SiteKeyItem").val("");
		$('#SiteListBox').val(item).change();
		
		if (!isInit){
			allSiteKeys.push(item);
			saveToLocalStorage(allSiteKeys);
		}
	}
	else{
		$("#siteKeyErrMsg").text("Please type a valid site/key.");
	}
}

function addUppercaseLetter(){
	var target = $("#passwordText").val();
	
	if (target == null || target == ""){ return;}
	console.log("target : " + target);
	if ($("#addUppercaseCheckBox").attr('checked') || $("#addUppercaseCheckBox").prop('checked')){
		console.log("checked");
		
		var foundChar = "";
		for (var i =0; i < target.length;i++){
			//console.log("target.length : " + target.length);
			if (isNaN(target[i])){
				console.log(target[i]);
				foundChar = target[i];
				target[i] = target[i].toUpperCase();
				console.log(target[i].toUpperCase());
				i = target.length;
			}
		}
		if (foundChar != ""){
			$("#passwordText").val(target.replace(foundChar, foundChar.toUpperCase()));
		}
		
	}
	else{
		$("#passwordText").val(target.toLowerCase());
	}
	console.log("adduppercaseletter...");
}

function addSpecialChars(){
	console.log("addSpecialChars...");
	var specialChars = $("#specialChars").val();
	if (specialChars == null || specialChars == ""){ return;}
	var target = $("#passwordText").val();
	if (target === null || target == ""){ return;}

	if ($("#addSpecialCharsCheckBox").attr('checked') || $("#addSpecialCharsCheckBox").prop('checked')){
		console.log("special chars...");
		var charOffset = 2;
        var pwd = target.substring(0, charOffset);
		console.log("target : " + target);
		pwd += specialChars;
		console.log("1 pwd : " + pwd);
		pwd = pwd + target.substring(2, target.length - charOffset);
		console.log("2 pwd : " + pwd);
		$("#passwordText").val(pwd);
	}
	else{
		generatePassword();
	}
}

function handleEnterKey(e){
	if(e.which == 13) {
		addSiteKey();
	}
}
var selectedItem;
function deleteButtonClick(){
	//
	selectedItem = $("#SiteListBox").val();
	if (selectedItem != null && selectedItem != ""){
		$("#siteKeyDelMsg").text("Click [OK] to delete the site/key: ");
		$("#siteKeyDelValue").text(selectedItem);
		$("#DeleteSiteKeyModal").modal('toggle');
	}
}

function clearButtonClick(){
	us = new UserPath();
	drawBackground();
	generateAllPosts();
	drawGridLines();
	drawPosts();
	$("#passwordText").val("");
}

function deleteSiteKey(){
	var removeItem = "#SiteListBox option[value='" + selectedItem + "']";
	$(removeItem).remove();
	deleteItemFromLocalStorage(selectedItem);
	$("#DeleteSiteKeyModal").modal('hide');
	$("#passwordText").val("");
}

// *******************************
// *******************************

//############################### localStorage methods ##########################
//###############################################################################
function removeAllKeysFromLocalStorage()
{
	localStorage.removeItem('siteKeys'); 
	console.log("success remove!");
}
//  $scope.allFeeds = JSON.parse(localStorage["siteKeys"]);

function saveToLocalStorage()
{
  // Put the object into storage

  localStorage.setItem('siteKeys', JSON.stringify(allSiteKeys));
  console.log(JSON.stringify(allSiteKeys));
  console.log("wrote siteKeys to localStorage");
  
}

function deleteItemFromLocalStorage(item){
	console.log("Removing : " + item);
	var idx = allSiteKeys.lastIndexOf(item);
	console.log("idx : " + idx);
	if (idx > -1){
		allSiteKeys.splice(idx,1);
		saveToLocalStorage();
	}
}

function initSiteKeys(){
	if (localStorage.getItem("siteKeys") !== null) {
		allSiteKeys = JSON.parse(localStorage["siteKeys"]);
	
		console.log(allSiteKeys);
		for (var j = 0; j < allSiteKeys.length;j++)
		{
			addSiteKey(allSiteKeys[j],true);
			console.log(allSiteKeys[j]);
		}
	}
}

function initApp(){
	theCanvas = document.getElementById("mainGrid");
	ctx = theCanvas.getContext("2d");
	
	ctx.canvas.height  = 255;
	ctx.canvas.width = ctx.canvas.height;
	$("#OKSiteKeyButton").click(addSiteKey);
	$("#OKDeleteButton").click(deleteSiteKey);
	$("#AddSiteKeyModal").keypress(handleEnterKey);
	$('#AddSiteKeyModal').on('shown.bs.modal', function () {
		$("#SiteKeyItem").focus();
	});
	$('#SiteListBox').on('change', generatePassword);

	$('#addUppercaseCheckBox').on('change', addUppercaseLetter);
	$('#addSpecialCharsCheckBox').on('change', addSpecialChars);
	$("#specialChars").on('input', addSpecialChars);
	$("#passwordText").removeClass("noselect");

	theCanvas.addEventListener("mousedown", mouseDownHandler);
	drawBackground();
	generateAllPosts();
	drawGridLines();
	drawPosts();
	initSiteKeys();
	//removeAllKeysFromLocalStorage();
}

function drawLine(p, p2, color, lineWidth, isUsingOffset){
	ctx.beginPath();
	var currentStrokeStyle = ctx.strokeStyle;
	ctx.strokeStyle = color;
	ctx.globalAlpha = 1;
	ctx.lineWidth = lineWidth || 1;
	if (isUsingOffset != undefined && isUsingOffset){
		ctx.moveTo(p.x + offset/2, p.y+offset/2);
		ctx.lineTo(p2.x + offset/2, p2.y+offset/2);
		console.log("using offset...");
	}
	else{
		ctx.moveTo(p.x,p.y);
		ctx.lineTo(p2.x, p2.y);
	}
	// console.log ("p.x : " + p.x + " p.y : " + p.y + " p2.x : " + p2.x + " p2.y : " +  p2.y);
	ctx.stroke();
	ctx.strokeStyle = currentStrokeStyle;
	ctx.globalAlpha = 1;
}

function drawBackground() {
	ctx.globalAlpha = 1;
	
	ctx.fillStyle=  "#F0F0F0";//"lightgrey";
	ctx.fillRect(0,0,ctx.canvas.height,ctx.canvas.width);
}

function genRandomNumber(end){
	return Math.floor(Math.random() * end) +1;
}

function getRandomColor(){
	switch (genRandomNumber(5)){
		case 1 :{
			return  "red";
		}
		case 2 : {
			return  "darkgreen";
		}
		case 3: {
			return "purple";
		}
		case 4: {
			return "blue";
		}
		case 5 :{
			return "yellow";
		}
	}
}

function Segment(begin, end, pointValue){
	this.Begin = begin;
	this.End = end;
	this.PointValue = pointValue;
	
}

function UserPath(){
	this.allSegments = [];
	this.currentPoint = null;
	this.allPoints = [];
	this.previousPostValue = 0;
	this.PointValue = 0;
	
	this.append = function(currentPoint, postValue){
		this.currentPoint = currentPoint;
		if (this.allPoints.length >= 1)
		{
			if (this.allPoints[this.allPoints.length - 1].x == this.currentPoint.x && 
				this.allPoints[this.allPoints.length - 1].y == this.currentPoint.y)
                {
                    // user clicked the same point twice
					console.log("clicked same point twice: return");
                    return;
                }
			console.log("postValue + this.previousPostValue : " + (postValue + this.previousPostValue));
			this.allSegments.push(new Segment(this.allPoints[this.allPoints.length-1], this.currentPoint, postValue + this.previousPostValue));
		}
		this.allPoints.push(this.currentPoint);
		console.log("allPoints.length : " + this.allPoints.length);
		this.previousPostValue = postValue;
	}
	
	this.CalculateGeometricValue = function(){
		this.PointValue = 0;
		for (var i =0; i < this.allSegments.length;i++){
			this.PointValue += this.allSegments[i].PointValue;
		}
		console.log(this.PointValue);
	}
}