export const formatNumber = (value, digits = 0) =>
  new Intl.NumberFormat("en-US", { maximumFractionDigits: digits }).format(Number(value || 0));

export const formatPercent = (value, digits = 1) =>
  `${(Number(value || 0) * 100).toFixed(digits)}%`;

export const formatConfidence = (value) =>
  value == null ? "N/A" : `${(Number(value) * 100).toFixed(1)}%`;

export const formatDateTime = (value) => {
  if (!value) return "—";
  const parsed = new Date(value.replace?.(" ", "T") || value);
  return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
};

export const downloadCsv = (filename, rows) => {
  if (!rows?.length) return false;
  const headers = [...new Set(rows.flatMap((row) => Object.keys(row)))];
  const escape = (value) => `"${String(value ?? "").replaceAll('"', '""')}"`;
  const csv = [headers.map(escape), ...rows.map((row) => headers.map((key) => escape(row[key])))]
    .map((line) => line.join(","))
    .join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
  return true;
};
