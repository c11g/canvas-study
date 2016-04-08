'use strict';
/*
 common.js 가져와야함
 drawArc, saveSurface, restoreSurface 사용
*/

// 옵션
var option = {
	// 바둑판 색
	'boardColor': '#f0c964',
	// 라인 색
	'lineColor': '#000',
	// 라인 간격
	'columnGap': 48,
	// 라인 수
	'columnNum': 19,
	// 바둑판이랑 캔버스의 간격
	'margin': 20,
	// 바둑판이랑 안에 선의 내부간격
	'padding': 30,
	// 화점 숨기기
	'hidePoint': false,
	// 지금 턴
	'whoTurn': 1,
	// 턴 색(#를 포함한 6자리로 입력)
	'turnColor1': '#000000',
	'turnColor2': '#ffffff',
	// 승리미션
	'winCount': 5,

	// 아래는 게임 구동의 필요한 프로퍼티로 건들지 않기
	// 좌표
	'coordinate': {},
	// 히스토리 
	'historyCoordinate': [],
	// dataURL 저장
	'unDoUrl': '',
	// 히스토리 모드 구분
	'historyMode': 'off',
	// 무르기 구분
	'unDoCheck': false,
	// 게임엔드 구분
	'gameEnd': false,
	// 실행방지
	'clickDisble': false
};

// 실행
init();

// 동작
canvas.onmousemove = function(event){
	// 좌표 구하기
	option.coordinate = window2board(event);
	
	// 실행 방지 조건 확인
	disableConditions();

	// 러버밴드를 위한 이전 화면 띄우고
	restoreSurface();

	// 히스토리 모드가 아니고, 실행방지가 거짓이면 실행
	if ( option.historyMode === 'off' && option.clickDisble === false ) {
		// 바둑돌 그리기, 마지막 인수에 true는 러버밴드시에만 들어감(투명도 설정)
		drawBadukStone(option.coordinate.simpleX, option.coordinate.simpleY, true);
	}
}

canvas.onmouseup = function(event){
	// 히스토리 모드가 아니고, 실행방지가 거짓이면 실행
	if ( option.historyMode === 'off' && option.clickDisble === false ) {
		// 현재 좌표를 새로 받고
		option.coordinate = window2board(event);
		
		// 이전 화면 띄우고
		restoreSurface();
		
		// 무르기를 대비해서 현재 화면 이미지 url 저장(toDataURL)
		// save & restore랑 역할은 같은데, 굳이 이미지url로 하는 이유는
		// save & restore를 이미 히스토리에서 쓰고 있는데 현재 지식으로는 생각처럼 2개로 구분해서 사용이 안댐.
		saveUndo();
		
		// 바둑돌 그리기
		drawBadukStone(option.coordinate.simpleX, option.coordinate.simpleY);

		// 히스토리 남기기
		// 현재의 턴이 누구였는지,
		option.coordinate.whoTurn = option.whoTurn;
		// 히스토리 배열에 돌의 좌표 및 턴 정보 객체 넘기기
		option.historyCoordinate.push(option.coordinate);

		// 무르기에서 나오기 (* 무르기 한 후 true 에서 다시 돌을 놓을때 false로 변경 )
		option.unDoCheck = false;

		// 화면 저장
		saveSurface();
		
		// 승리 판별 후 게임엔드 시킬지 확인
		option.gameEnd = distinctionWinner(option.whoTurn);

		// 턴 체인지
		changeTurn();
		
		// 게임 엔드가 true면 종료!
		if ( option.gameEnd ) {
			document.getElementById('result').style.backgroundColor = ( option.whoTurn === 1 ) ? option.turnColor2 : option.turnColor1;
			document.getElementById('result').style.color = ( option.whoTurn === 1 ) ? option.turnColor1 : option.turnColor2;
			document.getElementById('winColor').innerHTML = ( option.whoTurn === 1 ) ? 2 : 1;
		}
	}
}

// 히스토리 모드 토글
document.getElementById('showHistory').onclick = function(){
	// 화면 복원
	restoreSurface();

	// 히스토리 모드가 꺼있다면
	if ( option.historyMode === 'off' ) {
		// 버튼의 변화를 알 수 있게 클래스
		this.className = 'on';
		// 히스토리 모드 켜짐 설정
		option.historyMode = 'on';
		// 숫자 출력
		showHistory();
	} else {
	// 히스토리 모드가 켜있으면
		// 버튼 클래스 원복
		this.className = '';
		// 히스토리 모드 꺼짐 설정
		option.historyMode = 'off';
		// 화면 복원
		restoreSurface();
	}
}

// 무르기
document.getElementById('unDo').onclick = function(){
	// 히스토리 모드가 아니고, 무르기를 한 상태가 아니고, 첫 수가 아니라면 실행
	if( option.historyMode === 'off' && option.unDoCheck === false && option.historyCoordinate[0] !== undefined ){
		// 게임 결과창 다시 원복
		document.getElementById('result').style.backgroundColor = '#777';
		document.getElementById('result').style.color = '#fff'
		document.getElementById('winColor').innerHTML = '?';
		// 게임엔드 상태라면 다시 이전으로 돌리기
		option.gameEnd = false;
		// 턴 체인지
		changeTurn();
		// 무르기 
		drawUndo();
	}
}

/* 함수 리스트
	바둑판 그리기: drawBadukBoard
	바둑돌 그리기: drawBadukStone
	좌표 변환(보정좌표, 간단좌표): window2board
	실행방지 조건 : disableConditions
	hex값을 rgba로 변환: hexToRgba
	턴 체인지: changeTurn
	히스토리 보기: showHistory
	직전 이미지 url 저장: saveUndo
	무르기: drawUndo
	승리판별: distinctionWinner
*/

// 초기화
function init(){
	// 캔버스 지우기
	context.clearRect(0, 0, canvas.width, canvas.height);
	// 바둑판 그리기
	drawBadukBoard(option.hidePoint);
	// 저장
	saveSurface();
}

// 바둑판 그리기
function drawBadukBoard(hidePoint){
	// 판 스타일
	context.fillStyle = option.boardColor;
	context.strokeStyle = '#a99153';
	context.lineWidth = 0.5;
	context.shadowColor = 'rgba(0, 0, 0, 0.5)';
	context.shadowOffsetX = 4;
	context.shadowOffsetY = 4;
	context.shadowBlur = 20;

	// 바둑판 사이즈
	var boardSize = option.columnGap * (option.columnNum - 1) + option.padding * 2;

	// 바둑판
	context.beginPath();
	context.rect(option.margin, option.margin, boardSize, boardSize);
	context.fill();
	context.stroke();

	// 라인 스타일
	context.strokeStyle = option.lineColor;
	context.lineWidth = 1;

	// 가로선
	context.beginPath();
	var i = 0, gap = 0;
	while ( i < option.columnNum) {
		context.moveTo(option.margin + option.padding, option.margin + option.padding + gap);
		context.lineTo(option.margin + boardSize - option.padding, option.margin + option.padding + gap);
		i = i + 1;
		gap = gap + option.columnGap;
	}
	context.stroke();

	// 세로선
	context.beginPath();
	var i = 0, gap = 0;
	while ( i < option.columnNum) {
		context.moveTo(option.margin + option.padding + gap, option.margin + option.padding);
		context.lineTo(option.margin + option.padding + gap, option.margin + boardSize - option.padding);
		i = i + 1;
		gap = gap + option.columnGap;
	}
	context.stroke();

	if ( !hidePoint ) {
		// 화점 스타일
		context.fillStyle = '#111';
		context.shadowColor = 'rgba(255, 255, 255, 0)';
		context.beginPath();

		// 화점 그리기
		for (var idX = 3; idX < 18; ) {
			for (var idY = 3; idY < 18; ) {
				drawArc(option.columnGap * idX + option.margin + option.padding, option.columnGap * idY + option.margin + option.padding, 5, 'fill');
				idY += 6;
			}
			idX += 6;
		}
	}
}

// 바둑돌 그리기
function drawBadukStone(x, y, rubberBand){
	// 보정좌표
	x = option.coordinate.revisionX;
	y = option.coordinate.revisionY;

	// 간격에 맞게 돌 반지름 조정
	var _r = ( option.columnGap / 2 ) - 1;

	// 돌 그림자 스타일
	context.shadowColor = 'rgba(0, 0, 0, 0.6)';
	context.shadowOffsetY = 0;
	context.shadowOffsetX = 0;
	context.shadowBlur = 10;

	// 패스 생성
	context.beginPath();
	context.arc(x, y, _r, 0, 2*Math.PI);
	
	if( !rubberBand ) {
		// 돌의 컬러
		context.fillStyle = ( option.whoTurn === 1 ) ? option.turnColor1 : option.turnColor2;
	} else {
		// 러버밴드시 투명도 추가
		context.shadowColor = 'rgba(0, 0, 0, 0)';
		context.fillStyle = ( option.whoTurn === 1 ) ? hexToRgba(option.turnColor1, 0.3) : hexToRgba(option.turnColor2, 0.3);
		context.strokeStyle = ( option.whoTurn === 1 ) ? option.turnColor1 : option.turnColor2;
		context.stroke();
	}
	context.fill();
}

// 좌표 변환(보정좌표, 간단좌표)
function window2board(event){
	return {
		'revisionX': ( option.margin + option.padding ) + ( Math.round( (event.clientX - option.margin - option.padding) / option.columnGap ) ) * option.columnGap,
		'revisionY': ( option.margin + option.padding ) + ( Math.round( (event.clientY - option.margin - option.padding) / option.columnGap ) ) * option.columnGap,
		'simpleX': Math.round( (event.clientX - option.margin - option.padding) / option.columnGap ) + 1,
		'simpleY': Math.round( (event.clientY - option.margin - option.padding) / option.columnGap ) + 1
	}
}

// 실행방지 조건
function disableConditions(){
	option.clickDisble = option.coordinate.simpleX < 1 || option.coordinate.simpleX > option.columnNum || option.coordinate.simpleY < 1 || option.coordinate.simpleY > option.columnNum || option.historyMode === 'on' || option.gameEnd === true;

	// 클릭한 곳에 이미 돌이 있으면 실행 방지
	for ( var index in option.historyCoordinate ) {
		if ( option.historyCoordinate[index].revisionX === option.coordinate.revisionX && option.historyCoordinate[index].revisionY === option.coordinate.revisionY ) {
			return option.clickDisble = true;
		}
	}
}

// hex값을 rgba로 변환
function hexToRgba(hex, alpha) {
	hex = hex.slice(1, hex.length);
	
	var bigint = parseInt(hex, 16);
	var r = (bigint >> 16) & 255;
	var g = (bigint >> 8) & 255;
	var b = bigint & 255;
	var a = ( alpha === undefined ) ? 1 : 0.3;

	return 'rgba(' + [r, g, b, a].join() + ')';
}

// 턴 체인지
function changeTurn(){
	option.whoTurn = ( option.whoTurn === 2 ) ? 1 : 2;
}

// 히스토리 보기
function showHistory(){
	// 직전 화면 저장
	saveSurface();

	// 히스토리모드 on
	option.historyMode = 'on';

	// 폰트 스타일
	context.font = '15px Arial';
	context.textAlign = 'center';
	context.textBaseline = 'middle';

	// 히스토리 출력
	for ( var index in option.historyCoordinate ) {
		context.fillStyle = ( option.historyCoordinate[index].whoTurn === 1 )
			? option.turnColor2
			: option.turnColor1;
		context.fillText( parseInt(index) + 1, option.historyCoordinate[index].revisionX, option.historyCoordinate[index].revisionY );
	}
}

// 직전 이미지 url 저장
function saveUndo(){
	option.unDoUrl = canvas.toDataURL();
}

// 무르기
function drawUndo(){
	// 이미지 생성 후 직전 이미지 url 입력
	var image = new Image();
	image.src = option.unDoUrl;

	// 무르기 실행 체크
	option.unDoCheck = true;

	// 캔버스 지우고 이미지 그리기
	context.clearRect(0, 0, canvas.width, canvas.height);
	context.drawImage(image, 0, 0);

	// 이미지 로딩후 저장
	saveSurface();

	// 직전 돌 히스토리에서 삭제
	option.historyCoordinate.pop();
}

// 승리판별
function distinctionWinner(turn){
	// 돌을 기준으로 상하좌우 라인 배열 생성
	var _arr = [ [], [], [], [] ],
		_arr1 = [ [], [], [], [] ];

	for ( var index in option.historyCoordinate ) {
		// 색이 같고
		if ( option.historyCoordinate[index].whoTurn === turn ) {
			// Y축이 같으면, X축 저장
			if ( option.coordinate.simpleY === option.historyCoordinate[index].simpleY ){
				_arr[0].push(option.historyCoordinate[index].simpleX);
			}
			// X축이 같으면, Y축 저장
			if ( option.coordinate.simpleX === option.historyCoordinate[index].simpleX ){
				_arr[1].push(option.historyCoordinate[index].simpleY);
			}
			// 정대각좌표(↘)
			if ( (option.coordinate.simpleX - option.coordinate.simpleY) === option.historyCoordinate[index].simpleX - option.historyCoordinate[index].simpleY ){
				_arr[2].push(option.historyCoordinate[index].simpleX);
			}
			// 반대각좌표(↗)
			if ( (option.coordinate.simpleX + option.coordinate.simpleY) === option.historyCoordinate[index].simpleX + option.historyCoordinate[index].simpleY ){
				_arr[3].push(option.historyCoordinate[index].simpleX);
			}
		}
	}

	// 해당 좌표를 바둑판 배열로 변환 후
	// 돌이 있으면 1, 없으면 0
	for ( var i = 0; i < _arr.length; i++ ) {
		for ( var j = 0; j < option.columnNum; j++ ) {
			_arr1[i][j] = ( _arr[i].indexOf(j+1) !== -1 ) ? 1 : 0;
		}
		_arr1[i] = _arr1[i].join('');
	}

	// 승리 조건을 가져와서 '1111' 형태로 구현
	var winCondition = '';
	for ( var i = 0; i < option.winCount; i++ ) {
		winCondition += '1';
	}

	// 승리 조건이 성립하면 true 변환
	for ( var i = 0; i < _arr1.length; i++ ) {
		if ( _arr1[i].indexOf(winCondition) !== -1 && _arr1[i].indexOf(winCondition+'1') === -1 ) {
			return true;
		}
	}
}