const gravity = 1.0;//const型は変更不可
let terrains,texts;//グループ
let bodyImg, wingImg,headImg,legImg,tailImg;
let headDirection = 0;//頭の角度
let headSpead = 0.1;//頭の角度を変更するスピード
let flySpeedDefault = 10.0;
let flySpeed = flySpeedDefault;//飛ぶスピード
let keyWalkR = pKeyWalkR = keyWalkL = pKeyWalkL = 0;
let keyFlyR = pKeyFlyR = keyFlyL = pKeyFlyL = 0;
let playerDirection = true;//playerのむいている向き　true:right false:left
let flyFlag = false;//trueなら飛んでいる

let camTargetX, camTargetY;

//preload 画像の呼び出しに使う
function preload() {
  bodyImg = loadImage('img/bird_body.png');
  wingImg=loadImage('img/bird_wing.png')
  headImg = loadImage('img/bird_head.png');
  legImg = loadImage('img/bird_leg.png');
  tailImg = loadImage('img/bird_tail.png');
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  colorMode(HSB, 360, 100, 100, 100);

  terrains = new Group();//地形グループ
  texts = new Group();//文字グループ
  playerSprite = createSprite(width / 2, height / 2, 100,100);//プレイヤーのスプライト
  playerSprite.restitution = 0.8;//反発係数
  playerSprite.friction = 0.01;//摩擦係数
  playerSprite.addImage(bodyImg);
  groundSprite = createSprite(width / 2, height, width, 200);//地面のスプライト
  groundSprite.immovable = true;//immovable:trueで動かなくなる
  groundSprite.addToGroup(terrains);

  camTargetX = playerSprite.position.x;
  camTargetY = playerSprite.position.y;
}

function draw() {
  background(180,25,80);

  cameraFunction();
  ptail();
  pMove();
  textsDraw();
  drawSprites();
  pWing();
  pHead();
  pLeg();
  test();
}

//cameraに関する変数
function cameraFunction() {
  let zoomTarget = 1;
  //閾値を越えるほどはなれたらtargetを設定
  if (abs(playerSprite.position.x - camera.position.x) > width / 4) {
    camTargetX = playerSprite.position.x;
  }

  if (abs(playerSprite.position.y - camera.position.y+height/4) > height / 4) {
    camTargetY = playerSprite.position.y-height/4;
  }

  //targetに向かってじわじわと寄る
  camera.position.x += (camTargetX - camera.position.x) / 10;
  camera.position.y += (camTargetY - camera.position.y) / 10;

  //飛行モードならズームアウトし、陸上なら戻す
  if (flyFlag) { camera.zoom=max(camera.zoom*0.98,0.4) }
  else { camera.zoom=min(camera.zoom*1.005,1) }
}

//playerの移動に関する関数
function pMove() {
  //障害物と接した時、速度が出ていればバウンドし、低速なら着地する
  if (playerSprite.overlap(terrains)) {
    if (playerSprite.getSpeed() > 20) {
      playerSprite.bounce(terrains);
    } else {
      playerSprite.collide(terrains);
      playerSprite.rotation = 0;
      flySpeed = flySpeedDefault;
    }
  } else {//障害物に接していないとき、重力を受ける
    flySpeed *= 0.9;//flySpeedが下がる
    if (flySpeed < flySpeedDefault / 10) {//飛行状態でないなら重力を受ける
      flyFlag = false;
      playerSprite.addSpeed(gravity, 90);//下方向へのスピードを加速
    } else {
      flyFlag = true;
      playerSprite.addSpeed(gravity/10, 90);//飛行状態なら重力を軽減する
    }
  }

  //進む方向が右か左かでplayerDirectionを分ける
  if (90 <= playerSprite.getDirection() &&playerSprite.getDirection() < 270) playerDirection = false;
  else playerDirection = true;
}

//playerのheadに関する関数
function pHead() {
  push();
  translate(playerSprite.position.x- cos(radians(playerSprite.rotation+90))*playerSprite.height / 4 * 3, playerSprite.position.y - sin(radians(playerSprite.rotation+90))*playerSprite.height / 4 * 3);//座標平面をplayerSpriteの頭部分に移動
    if (!playerDirection) scale(-1, 1);
  rotate(-radians(headDirection));//headDirection分回転
  translate(headImg.width / 4, 0);//X座標の調整
  if (headDirection > 90) scale(1, -1);//もし後ろを向いていたら上下反転
  imageMode(CENTER);
  image(headImg, 0, 0);
  pop();

  if (keyDown(32)) {//もしスペースキー(32)が押されていたら
    headDirection += headSpead;//方向を変化させる
    if (headDirection > 180||headDirection<0) headSpead *= -1;//限界値に達したらスピードを反転させる
    headSpead = constrain(headSpead * 1.1,-4,4);//スピードの上限を設定する
  } else {
    if (headSpead > 0) headSpead = 0.1;//headspeadを初期化
  else headSpead = -0.1;
  }
}

//playerのlegに関する変数
function pLeg() {
  //Rleg
  push();
  translate(playerSprite.position.x - playerSprite.width / 6, playerSprite.position.y+playerSprite.height/6);
  rotate(radians(map(keyWalkR, 0, 3, -45, 45)));
  rotate(radians(map(keyWalkL, 0, 3, 15, -15)));
  translate(0, legImg.height / 2);
  if (!playerDirection) scale(-1, 1);
  imageMode(CENTER);
  image(legImg, 0, 0);
  pop();

  //Lreg
  push();
  translate(playerSprite.position.x + playerSprite.width / 6, playerSprite.position.y+playerSprite.height/6);
  rotate(radians(map(keyWalkL, 0, 3, 45, -45)));
  rotate(radians(map(keyWalkR, 0, 3, -15, 15)));
  translate(0, legImg.height / 2);
  if (!playerDirection) scale(-1, 1);
  imageMode(CENTER);
  image(legImg, 0, 0);
  pop();
}

function ptail(){
  push();
  translate(playerSprite.position.x, playerSprite.position.y);
  //左右の処理
  if (playerDirection) {
    translate(-playerSprite.width / 3, 0);
  } else {
    translate(playerSprite.width / 3, 0);
    scale(-1, 1);
  }
  rotate(radians(min(map(playerSprite.getSpeed(), 0, 10, 0, 120), 120)));//speedによって尻尾の角度が変化する
  translate(0, tailImg.height / 2);
  imageMode(CENTER);
  image(tailImg, 0, 0);
  pop();
}

function pWing() {
  //Rwing
  push();
  translate(playerSprite.position.x+playerSprite.width/2, playerSprite.position.y);
  rotate(radians(map(keyFlyR, 0, 3, -30, 90)));
  translate(0, -wingImg.height);//CORNERを合わせる
  imageMode(CORNER);
  image(wingImg, 0, 0);
  pop();

  //Lwing
  push();
  translate(playerSprite.position.x-playerSprite.width/2, playerSprite.position.y);
  scale(-1, 1);//Lwingは左右反転
  rotate(radians(map(keyFlyL, 0, 3, -30, 90)));
  translate(0, -wingImg.height);//CORNERを合わせる
  imageMode(CORNER);
  image(wingImg, 0, 0);
  pop();
}

//textsの動きに関する関数
function textsDraw() {
  for (let i = 0; i < texts.length; i++){//textsグループの数繰り返す
    texts[i].addSpeed(gravity / 10, 90);//重力を受ける
    texts[i].bounce(terrains,function(){texts[i].life*=0.5});//地面にぶつかるとbounceしlifeが減る
    texts[i].draw = function () {//描画方法を以下に変更する
      fill(255, map(texts[i].life, 240, 0, 255, 0));//lifeに応じて透明度をmapする
      textSize(map(texts[i].life, 240, 0, 32, 16));//lifeに応じてtextSizeをmapする
      text(texts[i].text, 0, 0);//謎の方法でしまったkeyを表示する
    }
  }
}

function keyPressed() {
  pKeyWalkR = keyWalkR;
  pKeyWalkL = keyWalkL;
  pKeyFlyR = keyFlyR;
  pKeyFlyL = keyFlyL;
  switch (keyCode) {//keyCodeをswitchで識別。keyだと小文字大文字でズレるため
    case 54:
    case 55:
    case 56:
      keyWalkR = 0;
      break;
    case 89:
    case 85:
    case 73:
      keyWalkR = 1;
      break;
    case 72:
    case 74:
    case 75:
      keyWalkR = 2;
      break;
    case 78:
    case 77:
    case 188:
      keyWalkR = 3;
      break;
    case 51:
    case 52:
    case 53:
      keyWalkL = 0;
      break;
    case 69:
    case 82:
    case 84:
      keyWalkL = 1;
      break;
    case 68:
    case 70:
    case 71:
      keyWalkL = 2;
      break;
    case 67:
    case 86:
    case 66:
      keyWalkL = 3;
      break;
    case 57:
    case 48:
    case 189:
    case 222:
    case 220:
      keyFlyR = 0;
      break;
    case 79:
    case 80:
    case 192:
    case 219:
      keyFlyR = 1;
      break;
    case 76:
    case 187:
    case 186:
    case 221:
      keyFlyR = 2;
      break;
    case 190:
    case 191:
    case 226:
      keyFlyR = 3;
      break;
    case 49:
    case 50:
      keyFlyL = 0;
      break;
    case 81:
    case 87:
      keyFlyL = 1;
      break;
    case 65:
    case 83:
      keyFlyL = 2;
      break;
    case 90:
    case 88:
      keyFlyL = 3;
      break;
    default:
      console.log("keyCode:" + keyCode);
  }
  let walkSpeed = Math.abs(keyWalkR - pKeyWalkR) - Math.abs(keyWalkL - pKeyWalkL);//RとLの差だけ加速
  playerSprite.addSpeed(walkSpeed, 0);

  //差の二乗でパワーを初期化
  let flyRPower = pow(keyFlyR - pKeyFlyR,2);
  let flyLPower = pow(keyFlyL - pKeyFlyL, 2);
  //パワーによってプレイヤーの見かけの角度を変化
  playerSprite.rotation += flyRPower;
  playerSprite.rotation -= flyLPower;
  //パワーの合算だけスピードを増やす
  flySpeed += (flyRPower) + (flyLPower);
  //翼の入力をしていたならば見かけの方向を参照して飛ぶ
  if (flyRPower > 0 || flyLPower > 0) {
    playerSprite.addSpeed(flySpeed, playerSprite.rotation - 90);
  }

  //textのspawn
  let textSprite = createSprite(playerSprite.position.x, playerSprite.position.y - playerSprite.height / 4 * 3, 10, 10);//headの位置にスプライトを生成する
  textSprite.addToGroup(texts);
  textSprite.life = 240;//スプライトの寿命を決める
  textSprite.addSpeed(random(2, 4), -headDirection);//頭の向く方向にランダムなスピードを与える
  textSprite.text = key;//謎の方法でkeyをスプライトにしまう。なんで？？？？
}

//テストするための場所
function test() {
  // rect(playerSprite.position.x, playerSprite.position.y, playerSprite.width, playerSprite.height);//positionと大きさの確認→ポジションは中央
}
