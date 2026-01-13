// ::::::::::::::::::::::::::::::::::::::: FORMATTER FUNCTIONS

export function formatDateDDMMYYHHMM(input, time = true) {
  const date = new Date(input);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (!time) {
    return `${day}-${month}-${year}`;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}-${month}-${year} ${hours}:${minutes}`;
}

export function formatDateDDMMSlashYYHHMM(input, time = true) {
  const date = new Date(input);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (!time) {
    return `${day}/${month}/${year}`;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

export function formatDateYYMMDDHHMM(input, time = true) {
  const date = new Date(input);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (!time) {
    return `${year}-${month}-${day}`;
  }

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// ::::::::::::::::::::::::::::::::::::::: MAIN FORMATTER USING SELECTED ID

const MONTHS_EN = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const MONTHS_KH = [
  "មករា",
  "កុម្ភៈ",
  "មីនា",
  "មេសា",
  "ឧសភា",
  "មិថុនា",
  "កក្កដា",
  "សីហា",
  "កញ្ញា",
  "តុលា",
  "វិច្ឆិកា",
  "ធ្នូ",
];

const KH_NUMBERS = ["០", "១", "២", "៣", "៤", "៥", "៦", "៧", "៨", "៩"];

const toKhNumber = (num) => num.toString().replace(/\d/g, (d) => KH_NUMBERS[d]);

export function formatDateTextEN(input) {
  const date = new Date(input);
  if (isNaN(date)) return "N/A";

  const day = date.getDate();
  const month = MONTHS_EN[date.getMonth()];
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}

export function formatDateTextKH(input) {
  const date = new Date(input);
  if (isNaN(date)) return "N/A";

  const day = toKhNumber(date.getDate());
  const month = MONTHS_KH[date.getMonth()];
  const year = toKhNumber(date.getFullYear());

  return `${day}-${month}-${year}`;
}

export function formatDateBySelectedFormat(input, time = true, isText = false) {
  let config = localStorage.getItem("config")
    ? JSON.parse(localStorage.getItem("config"))
    : {};

  if (!input) return "N/A";

  // ✅ TEXT MODE
  if (isText) {
    return `en:${formatDateTextEN(input)};kh:${formatDateTextKH(input)}`;
  }

  // ✅ NORMAL MODE
  switch (config?.datetime_format?.active) {
    case 1:
      return formatDateDDMMYYHHMM(input, time);
    case 2:
      return formatDateDDMMSlashYYHHMM(input, time);
    case 3:
      return formatDateYYMMDDHHMM(input, time);
    default:
      const date = new Date(input);
      if (!time) {
        return date.toISOString().split("T")[0];
      }
      return date.toISOString();
  }
}

export function calculateExpireRemainDays(expireDate) {
  if (!expireDate) return null;

  const today = new Date();
  const end = new Date(expireDate);

  // reset time to avoid partial-day issues
  today.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);

  const diffTime = end - today;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
}

export function calculateAge(dateString) {
  const birthDate = new Date(dateString)
  if (isNaN(birthDate.getTime())) return ""

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const m = today.getMonth() - birthDate.getMonth()

  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age < 0 ? "" : age
}


export function formatDateBySelectedFormatDisplay() {
  let config = localStorage.getItem("config")
    ? JSON.parse(localStorage.getItem("config"))
    : {};

  switch (config?.datetime_format?.active) {
    case 1:
      return "d-m-Y";
    case 2:
      return "d/m/Y";
    case 3:
      return "Y-m-d";
    default:
      return "d/m/Y";
  }
}

export const convertTo12Hour = (hour) => {
  const suffix = hour >= 12 ? "pm" : "am";
  const twelveHour = hour % 12 || 12;
  return `${twelveHour}${suffix}`;
};

export const expireDays = (input) => {
  if (!input) return 0;
  const target = new Date(String(input).replace(" ", "T"));
  if (isNaN(target)) return 0;

  const now = new Date();
  const diffTime = target - now;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export function formatDurationHistory(input) {
  const date = new Date(input);
  const now = new Date();
  const diff = now - date;

  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return "Just now";

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60)
    return minutes + " minute" + (minutes > 1 ? "s ago" : " ago");

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours + " hour" + (hours > 1 ? "s ago" : " ago");

  const days = Math.floor(hours / 24);
  if (days < 30) return days + " day" + (days > 1 ? "s ago" : " ago");

  const months = Math.floor(days / 30);
  if (months < 12) return months + " month" + (months > 1 ? "s ago" : " ago");

  const years = Math.floor(months / 12);
  return years + " year" + (years > 1 ? "s ago" : " ago");
}
