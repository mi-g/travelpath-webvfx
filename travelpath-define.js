/*

Copyright (c) 2018-present Michel Gutierrez

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated 
documentation files (the "Software"), to deal in the Software without restriction, including without limitation 
the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, 
and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions 
of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED 
TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL 
THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS 
IN THE SOFTWARE.

*/

function HideSteps() {
	document.querySelectorAll(".step").forEach((element)=>{
		element.style.display = "none";
	});
}

function ShowStep(step) {
	document.querySelectorAll(".step"+step).forEach((element)=>{
		element.style.display = "block";
	});
}

function Template(text) {
	return `<!DOCTYPE html>
<html lang="en">
	<head>
	<meta charset="utf-8">
	<title>Path</title>
	<style>
		html, body	{margin: 0; width: 100%; height: 100%; overflow: hidden; background-color: rgba(0,0,0,0);}
	</style>
	
	</head>
	<body data-control="3:30">
	</body>
	<script src="webvfx.js"></script>
	<script>
	//<![CDATA[
	
	TravelPath({
		stokeStyle: "#ff0000", // path color
		lineWidth: 10,         // path line width in pixels
		lineDash: [1,15]       // dash pattern, set to null for no dashed line
	});

	function TravelPath(config) {
	
		var width = document.body.offsetWidth;
		var height = document.body.offsetHeight;
		var canvas = document.createElement("canvas");
		canvas.width = width;
		canvas.height = height;
		document.body.appendChild(canvas);
		var data = GetData();
		var img = new Image();
		img.onload = DrawImage;
		img.src = data.image;
		
		function DrawImage() {
			var imgRatio = img.width / img.height;
			var canvasRatio = canvas.width / canvas.height;
			var xOffset, yOffset, scale, cWidth, cHeight;
			if(imgRatio>canvasRatio) {
				xOffset = 0;
				scale = width / img.width;
				cWidth = width;
				cHeight = img.height * scale;
				yOffset = (height - cHeight)/2;
			} else {
				yOffset = 0;
				scale = height / img.height;
				cHeight = height;
				cWidth = img.width * scale
				xOffset = (width - cWidth)/2;
			}
			var ctx = canvas.getContext("2d");
			ctx.strokeStyle = config.strokeStyle;
			ctx.lineCap = "round";
			ctx.lineWidth = 10;
			if(config.lineDash)
				ctx.setLineDash(config.lineDash);
		
			function renderPath(time, browser, frame_number, frame_rate) {
				var pathIndex = Math.floor(data.path.length*time);
				ctx.clearRect(0,0,width,height);
				ctx.drawImage(img,xOffset,yOffset,img.width*scale,img.height*scale);
				ctx.beginPath();
				ctx.moveTo(data.path[0]*cWidth+xOffset,data.path[1]*cHeight+yOffset);
				data.path.slice(1,pathIndex+1).forEach(function(coord) {
					var x = coord[0];
					var y = coord[1];
					ctx.lineTo(x*cWidth+xOffset,y*cHeight+yOffset);
				});
				ctx.stroke();
			}
			webvfx_add_to_frame = (typeof webvfx_add_to_frame === "undefined" && [] || webvfx_add_to_frame); 
			webvfx_add_to_frame.push(renderPath)
		}
		
		
		function GetData() {
			return ${text}
		}
	}
	//]]>
	</script>
</html>`;

}

function Step3(image,path) {
	HideSteps();
	ShowStep(3);
	var textarea = document.querySelector("textarea");
	var text = JSON.stringify({
		path,
		image
	},null,4);
	textarea.appendChild(document.createTextNode(Template(text)));
}

function Step2(img) {
	ShowStep(2);
	var canvas = document.querySelector("canvas");
	var width = canvas.offsetWidth;
	var height = canvas.offsetHeight;
	canvas.width = width;
	canvas.height = height;
	var imgRatio = img.width / img.height;
	var canvasRatio = canvas.width / canvas.height;
	var xOffset, yOffset, scale, cWidth, cHeight;
	if(imgRatio>canvasRatio) {
		xOffset = 0;
		scale = width / img.width;
		cWidth = width;
		cHeight = img.height * scale;
		yOffset = (height - cHeight)/2;
	} else {
		yOffset = 0;
		scale = height / img.height;
		cHeight = height;
		cWidth = img.width * scale
		xOffset = (width - cWidth)/2;
	}
	var ctx = canvas.getContext("2d");
	ctx.drawImage(img,xOffset,yOffset,img.width*scale,img.height*scale);
	var path = [];
	function MouseMove(event) {
		var rect = event.target.getBoundingClientRect();
		var x = event.clientX - rect.left - xOffset; 
		var y = event.clientY - rect.top - yOffset;  
		ctx.beginPath();
		var prevPos = path[path.length-1];
		ctx.moveTo(prevPos[0]*cWidth+xOffset,prevPos[1]*cHeight+yOffset);
		ctx.lineTo(x + xOffset, y + yOffset);
		ctx.stroke();
		path.push([ x / cWidth, y / cHeight ]);
	}
	function MouseUp(event) {
		canvas.removeEventListener("mousemove",MouseMove);
		canvas.removeEventListener("mouseup",MouseUp);
        var canvas2 = document.createElement('canvas');
        canvas2.width = cWidth;
        canvas2.height = cHeight;
		var context2 = canvas2.getContext('2d');
		context2.drawImage(img,0,0,cWidth,cHeight);
		Step3(canvas2.toDataURL("image/png"),path);
	}
	function MouseDown(event) {
		var rect = event.target.getBoundingClientRect();
		var x = event.clientX - rect.left - xOffset; 
		var y = event.clientY - rect.top - yOffset;  
		path.push([ x / cWidth, y / cHeight ]);
		canvas.removeEventListener("mousedown",MouseDown);
		canvas.addEventListener("mousemove",MouseMove);
		canvas.addEventListener("mouseup",MouseUp);
		ctx.moveTo(x + xOffset, y+yOffset);
		ctx.strokeStyle = "#ff0000";
		ctx.lineWidth = Math.min(cWidth,cHeight)/100;
	}
	canvas.addEventListener("mousedown",MouseDown);
}

document.addEventListener("DOMContentLoaded",()=>{
	ShowStep(1);
	var loadButton = document.getElementById("load");
	loadButton.addEventListener("change",()=>{
		HideSteps();
		var file = loadButton.files[0];
		var fr = new FileReader();
		fr.onload = () => {
			var img = new Image();
			img.onload = () => {
				Step2(img);
			}
			img.src = fr.result;
		};
		fr.readAsDataURL(file);
	});
});
