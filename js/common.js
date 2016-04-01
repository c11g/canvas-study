'use strict';

var canvas = document.getElementById('canvas'),
	context = canvas.getContext('2d');

/* 함수 리스트
격자무늬 그리기: drawGrid
원 그리기: drawArc
곡선 그리기: drawCurveTo
캔버스 좌표 구하기 : window2canvas
좌표 갱신: refreshPos
저장: saveSurface
복구: restoreSurface
*/

// grid
function drawGrid(lineColor, fontColor, spacing){
	var gridGap = spacing || 50,
		numGrid = gridGap / canvas.width,
		lineColor,
		fontColor;

	context.strokeStyle = lineColor;
	context.fillStyle = fontColor;
	context.font = '10px NanumGothic';

	// horizontal
	for ( var posY = gridGap - 0.5, count = 0; posY < canvas.height; posY += gridGap ) {
		count++;
		context.lineWidth = (count % 2 === 1)
			? 0.5
			: 1;
		context.beginPath();
		context.moveTo(0, posY);
		context.lineTo(canvas.width, posY);
		context.stroke();
		if( (posY + 0.5) % 10 === 0 ){
			context.fillText(posY + 0.5, canvas.width - 20, posY );
		}
	}

	// vertical
	for ( var posX = gridGap - 0.5, count = 0; posX < canvas.width; posX += gridGap ) {
		count++;
		context.lineWidth = (count % 2 === 1)
			? 0.5
			: 1;
		context.beginPath();
		context.moveTo(posX, 0);
		context.lineTo(posX, canvas.height);
		context.stroke();
		if( (posX + 0.5) % 10 === 0 ){
			context.fillText(posX + 0.5, posX, 10);
		}
	}
}

// x,y 좌표구하기
function window2canvas(e){
	// 브라우저내 캔버스 위치
	var offsetTop = canvas.getBoundingClientRect().top,
		offsetleft = canvas.getBoundingClientRect().left;

	return {
		'x': e.clientX - offsetleft, 'y': e.clientY - offsetleft
	}
}

// 좌표 갱신
function refreshPos(e){
	finishPos = window2canvas(e);
}

// save
var drawSurface;
function saveSurface(){
	drawSurface = context.getImageData(0, 0, canvas.width, canvas.height);
}

// restore
function restoreSurface(){
	context.putImageData(drawSurface, 0, 0);
}

// 원 그리기
function drawArc(x, y, r, method){
	var method = (method === undefined)
		? 'stroke'
		: method;

	context.beginPath();
	context.arc(x, y, r, 0, 2 * Math.PI);

	context[method]();
}

// 곡선 그리기
function drawCurveTo(controlPointX1, controlPointY1, controlPointX2, controlPointY2, finishPointX, finishPointY){
	if ( arguments.length === 4 ) {
		// 이차 곡선 그리기
		var finishPointX = controlPointX2,
			finishPointY = controlPointY2;

		context.quadraticCurveTo(controlPointX1, controlPointY1, finishPointX, finishPointY);

	} else if ( arguments.length === 6 ) {
		// 다항 곡선 그리기
		context.bezierCurveTo(controlPointX1, controlPointY1, controlPointX2, controlPointY2, finishPointX, finishPointY);
	}
}