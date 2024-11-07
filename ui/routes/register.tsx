import { Handlers, PageProps } from '$fresh/server.ts';
import { getCookies } from '$std/http/cookie.ts';
import { join } from '$std/url/join.ts';
import { Input } from '../components/primatives/Input.tsx';
import { Button } from '../components/primatives/Button.tsx';

interface Data {
  errorMessage?: string;
}

export const handler: Handlers = {
  GET(req, ctx) {
    const cookies = getCookies(req.headers);

    if (cookies.auth) {
      // Redirect to home page if user is already logged in
      const headers = new Headers();
      headers.set('location', '/');
      return new Response(null, {
        status: 302,
        headers,
      });
    }

    return ctx.render({});
  },
  async POST(req, ctx) {
    const data = await req.formData();
    const headers = new Headers();

    const [username, password, passwordConfirm] = [
      data.get('username'),
      data.get('password'),
      data.get('passwordConfirm'),
    ];

    if (password !== passwordConfirm) {
      return ctx.render({
        errorMessage: 'Passwords do not match',
      });
    }

    const backendAuthUrl = join(
      Deno.env.get('BACKEND_API_BASE_URL') as string,
      '/register',
    );

    const registerResponse = await fetch(backendAuthUrl, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (registerResponse.status === 201) {
      headers.set('location', '/login');
      return new Response(null, {
        status: 303,
        headers,
      });
    }

    const errorMessage = await registerResponse.json();
    return ctx.render({
      errorMessage: errorMessage.error,
    });
  },
};

export default function RegisterPage({ data }: PageProps<Data>) {
  return (
    <form className='m-6' method='POST'>
      <div className='w-fit flex flex-col gap-3'>
        <label className='flex flex-col'>
          Username
          <Input
            type='text'
            name='username'
          />
        </label>

        <label className='flex flex-col'>
          Password
          <Input
            type='password'
            name='password'
          />
        </label>

        <label className='flex flex-col'>
          Confirm Password
          <Input
            type='password'
            name='passwordConfirm'
          />
        </label>

        <div className='flex justify-end'>
          <Button>Register</Button>
        </div>
      </div>
      <div className='mt-3 flex text-red-600 font-semibold'>
        {data.errorMessage}
      </div>
    </form>
  );
}
