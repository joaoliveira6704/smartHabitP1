let handPose;
let video;
let hands = [];

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(580, 300);
  video = createCapture(VIDEO);
  video.size(580, 300);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0, width, height);

  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    for (let j = 0; j < hand.keypoints.length; j++) {
      let keypoint = hand.keypoints[j];
      fill(0, 255, 0);
      noStroke();
      circle(keypoint.x, keypoint.y, 10);
    }
  }
}

function detectHandRaised() {
  if (hands.length === 0) return false;

  let bigTip = hands[0].keypoints[4];
  let middleTip = hands[0].keypoints[12];

  let isRaised = bigTip.y > middleTip.y + 100;

  return isRaised;
}

window.detectHandRaised = detectHandRaised;

function gotHands(results) {
  hands = results;
}
