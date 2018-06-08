function getCurrentDate() {
  let currentDate = new Date();
  return currentDate.toISOString();
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

exports.getCurrentDate = getCurrentDate;
exports.sleep = sleep;