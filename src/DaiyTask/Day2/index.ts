interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

type role = 'admin' | 'user';

interface ResponseData<T> {
  data: T;
  status: number;
  message: string;
  role: role;
}

type UserResponse = ResponseData<User>;

function mockData<T>(data: T): ResponseData<T> {
  return {
    data,
    status: 200,
    message: 'success',
    role: 'admin',
  };
}

console.log(
  mockData<User>({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
  }),
);
