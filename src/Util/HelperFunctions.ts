export const findClosest = (arr: Array<number>, target: number) => {
  let res = arr[0];
  let lo = 0,
    hi = arr.length - 1;

  while (lo <= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);

    // Update res if mid is closer to target
    if (Math.abs(arr[mid] - target) < Math.abs(res - target)) {
      res = arr[mid];

      // In case of a tie, prefer larger value
    } else if (Math.abs(arr[mid] - target) === Math.abs(res - target)) {
      res = Math.max(res, arr[mid]);
    }

    if (arr[mid] === target) {
      return arr[mid];
    } else if (arr[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return res;
};

export const throttle = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) => {
  let isWaiting = false;

  return (...args: T) => {
    if (isWaiting) {
      return;
    }

    callback(...args);
    isWaiting = true;

    setTimeout(() => {
      isWaiting = false;
    }, delay);
  };
};
