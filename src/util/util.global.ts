export const formatDateToMySQL = (date: Date) => {
  const pad = (n: number) => (n < 10 ? "0" + n : n); // Adiciona 0 para números menores que 10
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(
    date.getSeconds()
  )}`;
};

export const formatDateToDDMMYYYY = (dateString: string): string => {
  const date = new Date(dateString);

  const day = date.getUTCDate().toString().padStart(2, "0");
  const month = (date.getUTCMonth() + 1).toString().padStart(2, "0"); // Mês é zero-indexado
  const year = date.getUTCFullYear();

  return `${day}/${month}/${year}`;
};
