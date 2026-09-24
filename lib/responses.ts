export function success<T>(data: T, message = "OK", init?: ResponseInit) {
  return Response.json({ success: true, message, data }, init);
}

export function failure(message: string, status = 400) {
  return Response.json({ success: false, message }, { status });
}
