export const createFormData = (values: Record<string, string>) => {
  const formData = new URLSearchParams();
  Object.entries(values).forEach(([k, v]) => {
    formData.append(k, v);
  });

  const body = formData.toString();

  return {
    payload: body,
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  };
};
