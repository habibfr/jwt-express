export default function success_response(msg, data) {
  return {
    status: msg,
    data: data,
  };
}
