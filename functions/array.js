const move = (array, fromIndex, toIndex) => {
  if (fromIndex < toIndex) toIndex--;
  var element = array[fromIndex];
  array.splice(fromIndex, 1);
  array.splice(toIndex, 0, element);
};

module.exports = { move };
