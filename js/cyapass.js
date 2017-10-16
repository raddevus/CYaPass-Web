// cyapass.js

var ctx = null;
var theCanvas = null;
window.addEventListener("load", initApp);

// *******************************
// ****** begin CYaPass code *****
// *******************************
var pwd = "";
var allSiteKeys = [{}];
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
	//console.log("mouseDown");
}

function selectNewPoint(event){
	var currentPoint = getMousePos(event);
	var hitTestIdx = hitTest(currentPoint, allPosts, postSize + 9);
	if (hitTestIdx == -1){
		return;
	}
	console.log("hitTestIdx : " + hitTestIdx);
	currentPoint = allPosts[hitTestIdx]; // this sets it to the exact values of the post center
	us.append(currentPoint, Math.trunc(hitTestIdx + (hitTestIdx * Math.trunc(hitTestIdx / numOfCells) * 10)));
	us.CalculateGeometricValue();
	console.log(currentPoint.x + " : " + currentPoint.y);
}

function drawHighlight(){
	// there are no points so return without attempting highlight
	if (us.allPoints.length < 1){return;}
	
	drawCircle(new Point({x:us.allPoints[0].x, y:us.allPoints[0].y}), "rgba(0, 0, 0, 0)", "orange", 10, 2);
}

function drawUserShape(){
	for (var i = 0; i < us.allSegments.length;i++){
		drawLine(us.allSegments[i].Begin, us.allSegments[i].End, "green", 4, true);
	}
}

function generatePassword(){
	selectedItem = $("#SiteListBox option:selected").text();
	if (selectedItem == null || selectedItem == ""){
		return;
	}
	if (us.allSegments.length <= 0)
	{
		return;
	}
	ComputeHashBytes();
	console.log("ComputeHashBytes() : " + pwd);
	addUppercaseLetter();
	console.log ("pwd 1: " + pwd);
	if ($("#addSpecialCharsCheckBox").attr('checked') || $("#addSpecialCharsCheckBox").prop('checked')){
		addSpecialChars();
	}
	if ($("#maxLengthCheckBox").attr('checked') || $("#maxLengthCheckBox").prop('checked')){
		setMaxLength();
	}
	
	$("#passwordText").val(pwd);
}

function setMaxLength(){
	var maxLength = $("#maxLength").val();
	pwd = pwd.substr(0, maxLength);
}

function ComputeHashBytes(){
	console.log("computing hash...");
	console.log("selectedItem : " + selectedItem);
	var hashValue = sha256(us.PointValue + selectedItem.toString());
	console.log(hashValue);
	pwd = hashValue;
}

function addButtonClick(){
	$("#siteKeyErrMsg").text("");
	$("#AddSiteKeyModal").modal('toggle');
}

function addSiteKey(){

	//1. get currently selected item in the list 
	//$("#SiteListBox").val("test").change();
	console.log("addSiteKey 1");
	$("#siteKeyErrMsg").text("");
	var item = new SiteKey($("#SiteKeyItem").val());
	console.log("addSiteKey 2");
	//item = item.toString().trim();
	console.log("item : " + item);
	console.log("getDecodedKey : " + item);
	if (item !== null && item !== ""){
		var localOption = new Option(getDecodedKey(item.Key), item, false, true);
		$('#SiteListBox').append($(localOption) );
		$('#AddSiteKeyModal').modal('hide');
		$("#SiteKeyItem").val("");
		$('#SiteListBox').val(item.toString()).change();
		allSiteKeys.push(item);
		saveToLocalStorage();
	}
	else{
		$("#siteKeyErrMsg").text("Please type a valid site/key.");
	}
}

function loadSiteKeyList(item){
	console.log("loadSiteKeyList item : " + item.Key);
	var localOption = new Option(decodeURI(atob(item.Key)), item, true, true);
		$('#SiteListBox').append($(localOption) );
}

function addUppercaseLetter(){
	var target = pwd;

	if (target == null || target == ""){ return;}
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
			pwd = target.replace(foundChar, foundChar.toUpperCase());
		}
		
	}
	else{
		pwd = target.toLowerCase();
	}
	console.log("adduppercaseletter...");
}

function addSpecialChars(){
	console.log("addSpecialChars...");
	var specialChars = $("#specialChars").val();
	if (specialChars == null || specialChars == ""){ return;}
	var target = pwd;
	if (target === null || target == ""){ return;}

	if ($("#addSpecialCharsCheckBox").attr('checked') || $("#addSpecialCharsCheckBox").prop('checked')){
		console.log("special chars...");
		var charOffset = 2;
        var localPwd = target.substring(0, charOffset);
		console.log("target : " + target);
		localPwd += specialChars;
		console.log("1 localPwd : " + localPwd);
		localPwd = localPwd + target.substring(2, target.length - charOffset);
		console.log("2 localPwd : " + localPwd);
		pwd = localPwd;
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
	selectedItem = $("#SiteListBox option:selected").text();
	console.log(selectedItem);
	if (selectedItem !== null && selectedItem !== ""){
		$("#siteKeyDelMsg").text("Click [OK] to delete the site/key: ");
		$("#siteKeyDelValue").text(selectedItem);
		$("#DeleteSiteKeyModal").modal('toggle');
		//loadSiteKeyList();
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
	console.log("selectedItem : " );
	console.log(selectedItem);
	var removeItem = "#SiteListBox option[value='" + selectedItem + "']";
	$(removeItem).remove();
	deleteItemFromLocalStorage(getEncodedKey(selectedItem));
	$("#DeleteSiteKeyModal").modal('hide');
	$("#passwordText").val("");
}

//###############################################################################
//############################### localStorage methods ##########################
//###############################################################################
function removeAllKeysFromLocalStorage()
{
	localStorage.removeItem('siteKeys'); 
	console.log("success remove!");
}

function saveToLocalStorage()
{
  // Put the object into storage

  localStorage.setItem('siteKeys', JSON.stringify(allSiteKeys));
  console.log(JSON.stringify(allSiteKeys));
  console.log("wrote siteKeys to localStorage");
  
}

function deleteItemFromLocalStorage(encodedKey){
	console.log("Removing : " + encodedKey);
	for (var i =0; i < allSiteKeys.length;i++){
		if (encodedKey == allSiteKeys[i].Key){
			allSiteKeys.splice(i,1);
			console.log("i : " + i);
			saveToLocalStorage();
			initSiteKeys();
		}
	}
}
// #####################################################################
// #####################################################################

function initSiteKeys(){
	$("#SiteListBox").empty();
	if (localStorage.getItem("siteKeys") !== null) {
		allSiteKeys = JSON.parse(localStorage["siteKeys"]);
			
		if (localStorage.getItem("isConverted") === null){
			var e = {};
			e.shiftKey = true;
			convertSiteKeys(e);
			localStorage.setItem("isConverted", true);
		}
	//
		
		for (var j = 0; j < allSiteKeys.length;j++)
		{
			console.log(allSiteKeys[j].Key);
			loadSiteKeyList(allSiteKeys[j]);
			console.log(allSiteKeys[j].Key);
		}
	}
}

function convertSiteKeys(e){
	if (e.shiftKey){
		if (localStorage.getItem("siteKeys") !== null) {
			var tempString = localStorage["siteKeys"];
			allSiteKeys = JSON.parse(localStorage["siteKeys"]);
			var allSiteKeyObjects = [{}];
			allSiteKeyObjects.splice(0,1);
			for (var j=0; j < allSiteKeys.length;j++){
				var s = new SiteKey(getDecodedKey(allSiteKeys[j]));
				allSiteKeyObjects.push(s);
			}
			allSiteKeys = allSiteKeyObjects;
			saveToLocalStorage();
		}
	}
}

function initApp(){
	allSiteKeys.splice(0,1);
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

	$('#addUppercaseCheckBox').on('change', generatePassword);
	$('#addSpecialCharsCheckBox').on('change', generatePassword);
	$("#specialChars").on('input', generatePassword);
	$("#maxLength").on('input', generatePassword);
	$("#maxLengthCheckBox").on('change', generatePassword);
	
	$("#passwordText").removeClass("noselect");

	theCanvas.addEventListener("mousedown", mouseDownHandler);
	drawBackground();
	generateAllPosts();
	drawGridLines();
	drawPosts();
	initSiteKeys();
	//removeAllKeysFromLocalStorage(); // -- used for testing
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

function SiteKey (initKey){
	if (typeof(initKey) === "object"){
		console.log("In if...");
		this.MaxLength =  initKey.MaxLength || 0;
		this.HasSpecialChars = initKey.HasSpecialChars || false;
		this.HasUpperCase = initKey.HasUpperCase || false;
		this.Key = btoa(encodeURI(initKey.Key));
		
	}
	else{
		console.log("In else...");
		this.MaxLength =  0;
		this.HasSpecialChars = false;
		this.HasUpperCase = false;
		this.Key = btoa(encodeURI(initKey));
	}
}
function getEncodedKey(keyValue){
	return btoa(encodeURI(keyValue));
}
function getDecodedKey(keyValue){
		return decodeURI(atob(keyValue));
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
			if (this.isSegmentUnique(postValue + this.previousPostValue)){
				// segment has never been added to add it.
				this.allSegments.push(new Segment(this.allPoints[this.allPoints.length-1], this.currentPoint, postValue + this.previousPostValue));
			}
		}
		this.allPoints.push(this.currentPoint);
		console.log("allPoints.length : " + this.allPoints.length);
		this.previousPostValue = postValue;
	}
	
	this.isSegmentUnique = function (pointValue){
		// Insures that the same segment is not added to segment array and not calculated for points
		//returns false if the segment is already in the array, else true (segment is unique)
		for (var z = 0; z < this.allSegments.length;z++){
			if (this.allSegments[z].PointValue == pointValue){
				return false;
			}
		}
		return true;
	}
	
	this.CalculateGeometricValue = function(){
		this.PointValue = 0;
		for (var i =0; i < this.allSegments.length;i++){
			this.PointValue += this.allSegments[i].PointValue;
		}
		console.log(this.PointValue);
	}
}