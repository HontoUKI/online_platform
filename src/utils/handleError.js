export function handleError(err, setToast) {
  const fallback = "Что-то пошло не так. Попробуйте позже.";

  if (err.message === "Failed to fetch") {
    return setToast({
      message: "Сервер временно недоступен. Проверьте подключение.",
      type: "error",
    });
  }

  if (err.response) {
    const detail = err.response.data?.detail;

    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
        ? detail.map((d) => d.msg).join(", ")
        : fallback;

    return setToast({ message, type: "error" });
  }

  setToast({ message: fallback, type: "error" });
}
