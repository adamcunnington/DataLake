
const dateUtils = {

  // Return the date in ISO 8601 format (YYYY-MM-DD)
  dateToIso8601(date) {
    return date.toISOString().substr(0, 10);
  },

  // Return the date in UK format (DD-MM-YYYY)
  dateToString(date) {

    let day = date.getDate(),
      month = date.getMonth() + 1,
      year = date.getFullYear();

    if (day < 10) {
      day = '0' + day;
    }
    if (month < 10) {
      month = '0' + month;
    }

    return day + '-' + month + '-' + year;
  },

  getWeekday(date) {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday'
    ];
    return days[date.getDay()];
  },

  isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  },

  isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
  }

};

export default dateUtils;
