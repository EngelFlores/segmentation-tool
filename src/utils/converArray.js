const convertToArray = (points) => {
  return points.map(({ x, y }) => [x, y]);
}

export default convertToArray;