import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  stages: [
    { duration: '10m', target: 3000 },
  ],
};

export default () => {
  const response = http.get('http://localhost:3001/users');

  check(response, {
    "response code was 200": (res) => res.status == 200,
   });

  sleep(1);
};