export default class Algorithm {
  /**
   * Comparison functions used to run the quicksort algorithm.
   * A comparator needs to return a positive number if `a` is greater than `b`, `0` if `a===b`, a negative number if `b` is greater than `a`.
   * @static
   * @memberof Algorithm
   */
  static comparators = {
    valueAscending: (a, b) => a - b,
    valueDescending: (a, b) => b - a
  };

  /**
   * Starts the quicksort
   * @static
   * @param  {Array} array The array to sort
   * @param  {(a,b)=>Number} comparator A comparison function that determines how to order the items
   * @return {Array} The ordered array
   * @memberof Algorithm
   */
  static async quicksort(array, comparator) {
    return await Algorithm.quicksortPartition(array, comparator);
  }

  /**
   * Recursively quicksorts an array and returns it.
   * @static
   * @param  {Array} array The array to sort
   * @param  {(a,b)=>Number} comparator A comparison function that determines how to order the items
   * @return {Array} The ordered array
   * @memberof Algorithm
   */
  static async quicksortPartition(array, comparator) {
    // If the array has 1 or less items, the array does not need sorting
    if (array.length <= 1) return array;
    let result = [];
    let partitions = {
      left: [],
      right: []
    };
    // The pivot is set as the first item in the array. `shift()` Removes it from the array and assigns it to `pivot`
    let pivot = array.shift();
    // Adds the pivot to the resulting array.
    result.push(pivot);
    // Loop through the array.
    array.forEach(element => {
      // Determine if each element in the array is greater than 0 and place them in either `partitions.left` or `partitions.right`.
      // Whether `>` or `>=` is used does not matter.
      partitions[comparator(pivot, element) > 0 ? "left" : "right"].push(
        element
      );
    });
    
    // `Promise.all` runs both the left and right sort asynchronously, instead of one after the other (non-blocking) , which can potentially offer performance improvements
    let results = await Promise.all([
      Algorithm.quicksortPartition(partitions.left, comparator),
      Algorithm.quicksortPartition(partitions.right, comparator)
    ]);

    // Prepend a quicksorted version of the left partition to the result
    result.unshift(...results[0]);

    // Append a quicksorted version of the right partition to the result
    result.push(...results[1]);

    // Return the sorted array
    return result;
  }
}
