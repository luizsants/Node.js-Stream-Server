export function extractQueryParams(query) {
  if (typeof query !== "string" || query.length === 0) {
    console.warn("Consulta inválida fornecida:", query);
    return {};
  }
  return query
    .substring(1)
    .split("&")
    .reduce((queryParams, param) => {
      const [key, value] = param.split("=");
      queryParams[key] = value;
      console.log(queryParams)
      return queryParams;
    }, {});
}
