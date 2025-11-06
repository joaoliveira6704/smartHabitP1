let handPose;
let video;
let hands = [];

function preload() {
  handPose = ml5.handPose();
}

function setup() {
  createCanvas(460, 300);
  video = createCapture(VIDEO);
  video.size(460, 300);
  video.hide();
  handPose.detectStart(video, gotHands);
}

function draw() {
  image(video, 0, 0, width, height);
  for (let i = 0; i < hands.length; i++) {
    let hand = hands[i];
    let connections = [
      [0, 1],
      [1, 2],
      [2, 3],
      [3, 4],
      [0, 5],
      [5, 6],
      [6, 7],
      [7, 8],
      [0, 9],
      [9, 10],
      [10, 11],
      [11, 12],
      [0, 13],
      [13, 14],
      [14, 15],
      [15, 16],
      [0, 17],
      [17, 18],
      [18, 19],
      [19, 20],
      [5, 9],
      [9, 13],
      [13, 17],
    ];

    // Desenhar ligações
    stroke(255, 0, 0);
    strokeWeight(2);
    for (let j = 0; j < connections.length; j++) {
      let [start, end] = connections[j];
      let kp1 = hand.keypoints[start];
      let kp2 = hand.keypoints[end];
      line(kp1.x, kp1.y, kp2.x, kp2.y);
    }

    // Desenhar pontos
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
