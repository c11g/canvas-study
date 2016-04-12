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
	context.save();
	var gridGap = spacing || 50,
		numGrid = gridGap / canvas.width,
		lineColor,
		fontColor;

	// shadow 없애기
	context.shadowColor = undefined;
	context.shadowOffsetX = 0;
	context.shadowOffsetY = 0;
	context.shadowBlur = 0;

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
	context.restore();
}

// x,y 좌표구하기
function window2canvas(e){
	// 브라우저내 캔버스 위치
	var offsetTop = canvas.getBoundingClientRect().top,
		offsetleft = canvas.getBoundingClientRect().left;

	return {
		'x': e.clientX - offsetleft, 'y': e.clientY - offsetTop
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

// 포인트 생성자
var Point = function (x, y) {
	this.x = x;
	this.y = y;
}

// 다각형 생성자
var Polygon = function (centerX, centerY, radius, sides, startAngle, strokeStyle, fillStyle, filled) {
	this.x = centerX;
	this.y = centerY;
	this.radius = radius;
	this.sides = sides;
	this.startAngle = startAngle;
	this.strokeStyle = strokeStyle;
	this.fillStyle = fillStyle;
	this.filled = filled;
}

// 다각형 프로토타입
Polygon.prototype = {
	getPoints: function(){
		var points = [],
			angle = this.startAngle || 0;
		for ( var i = 0; i < this.sides; i++ ) {
			points.push( new Point( this.x + this.radius * Math.sin(angle),
									this.y - this.radius * Math.cos(angle) ) );
			angle += 2 * Math.PI / this.sides;
		}
		return points;
	},
	createPath: function(context){
		var points = this.getPoints();
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for( var i = 1; i < this.sides; i++ ){
			context.lineTo(points[i].x, points[i].y);
		}
		context.closePath();
	},
	stroke: function(context){
		context.save();
		this.createPath(context);
		context.strokeStyle = this.strokeStyle;
		context.stroke();
		context.restore();
	},
	fill: function(context){
		context.save();
		this.createPath(context);
		context.fillStyle = this.fillStyle;
		context.fill();
		context.restore();
	},
	move: function(x, y){
		this.x = x;
		this.y = y;
	}
};