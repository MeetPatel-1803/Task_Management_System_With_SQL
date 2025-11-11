const toUpperCase = (string) => {
  if (string.length > 0) {
    const newString = string
      .toLowerCase()
      .replace(/_([a-z])/, (m) => m.toUpperCase())
      .replace(/_/, "");
    return string.charAt(0).toUpperCase() + newString.slice(1);
  }

  return "";
};

const validationMessageKey = (apiTag, error) => {
  let key = toUpperCase(
    error.details[0].context.key || error.details[0].context.label
  );
  let type = error.details[0].type.split(".");
  type = toUpperCase(type[1]);
  key = apiTag + key + type;
  return key;
};

const randomTokens = (length) => {
  let token = "";
  for (let i = 1; i <= length; i++) {
    token += Math.random().toString(36).substring(2);
  }
  return token;
};

module.exports = {
  validationMessageKey,
  randomTokens,
};
