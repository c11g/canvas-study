'use strict';
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