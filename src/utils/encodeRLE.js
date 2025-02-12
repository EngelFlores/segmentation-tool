const encodeRLE = (width, height, points) => {

  let mask = Array.from({ length: height }, () => Array(width).fill(0));

  points.forEach(([x, y]) => {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 0 && x < width && y >= 0 && y < height) {
      mask[y][x] = 1;
    }
  });

  let counts = [];
  let currentVal = 0;
  let count = 0;

  for (let row of mask) {
    for (let pixel of row) {
      if (pixel === currentVal) {
        count++;
      } else {
        counts.push(count);
        currentVal = pixel;
        count = 1;
      }
    }
  }
  counts.push(count);
  return counts;
}

export default encodeRLE;