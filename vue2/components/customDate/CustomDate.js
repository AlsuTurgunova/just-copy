export class CustomDate {
  /**
   * Расшифровывает дату по паттерну
   * @param pattern {string}
   * @param date {string}
   * @return {Date}
   * @throws Error Дата не совпадает с паттерном
   */
  static decodeDate(pattern, date) {
    const regexMap = {
      YYYY: '(\\d{4})',
      YY: '(\\d{2})',
      MM: '(\\d{2})',
      M: '(\\d{1,2})',
      DD: '(\\d{2})',
      D: '(\\d{1,2})',
    };

    // Создаём regex со всеми паттернами
    let regexPattern = pattern;
    for (const [key, value] of Object.entries(regexMap)) {
      regexPattern = regexPattern.replace(new RegExp(key, 'g'), value);
    }
    const regex = new RegExp(`^${regexPattern}$`);
    const match = date.match(regex);

    if (!match) {
      throw new Error("Date doesn't match")
    }

    // Вытаскиваем части даты
    let year, month, day;
    let matchIndex = 1; // match[0] это полная совпавшая строка

    if (pattern.includes('YYYY')) {
      year = parseInt(match[matchIndex++], 10);
    } else if (pattern.includes('YY')) {
      year = 2000 + parseInt(match[matchIndex++], 10); // Считаем 2000 год для годов из 2 цифр
    }

    if (pattern.includes('MM')) {
      month = parseInt(match[matchIndex++], 10) - 1; // Месяцы начинаются с 0
    } else if (pattern.includes('M')) {
      month = parseInt(match[matchIndex++], 10) - 1;
    }

    if (pattern.includes('DD')) {
      day = parseInt(match[matchIndex++], 10);
    } else if (pattern.includes('D')) {
      day = parseInt(match[matchIndex++], 10);
    }

    return new Date(year, month, day);
  }

  /**
   * Кодирует дату в соответствии с паттерном
   * @param pattern {string}
   * @param date {Date}
   * @returns {string}
   */
  static encodeDate(pattern, date) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1; // Месяцы начинаются с 0
    const day = date.getDate();

    return pattern
      .replace(/YYYY/g, year)
      .replace(/YY/g, String(year).slice(-2))
      .replace(/MM/g, String(month).padStart(2, '0'))
      .replace(/M/g, month)
      .replace(/DD/g, String(day).padStart(2, '0'))
      .replace(/D/g, day);
  }
}