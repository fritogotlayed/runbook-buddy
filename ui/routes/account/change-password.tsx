import { Handlers, PageProps } from '$fresh/server.ts';
import { join } from '$std/url/join.ts';
import { authenticatedFetch } from '../../helpers/authenticated-fetch.ts';
import { Input } from '../../components/primatives/Input.tsx';
import { Button } from '../../components/primatives/Button.tsx';
import { type UpdatePasswordResponseError } from '../../types/api-interchange.ts';

interface Data {
  message?: string;
  errorMessage?: string;
}

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render({});
  },

  async POST(req, ctx) {
    const data = await req.formData();
    const [
      password,
      newPassword,
      confirmNewPassword,
    ] = [
      data.get('password'),
      data.get('newPassword'),
      data.get('confirmNewPassword'),
    ];

    const authedFetch = authenticatedFetch(req);

    const url = join(
      Deno.env.get('BACKEND_API_BASE_URL') as string,
      '/users/update-password',
    );

    const resp = await authedFetch(url, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ password, newPassword, confirmNewPassword }),
    });

    if (resp.status === 200) {
      return ctx.render({
        message: 'Password updated successfully',
      });
      // const headers = new Headers();
      // headers.set('location', '/account');
      // return new Response(null, {
      //   status: 302,
      //   headers,
      // });
    }

    const body = await resp.json() as UpdatePasswordResponseError;
    return ctx.render({
      errorMessage: body.error,
    });
  },
};

export default function TemplatesPage({ data }: PageProps<Data>) {
  const { errorMessage, message } = data;

  return (
    <form method={'POST'} class='m-6'>
      <div className='w-fit flex flex-col gap-3'>
        <label className='flex flex-col'>
          Old Password
          <Input
            type='password'
            name='password'
          />
        </label>

        <label className='flex flex-col'>
          New Password
          <Input
            type='password'
            name='newPassword'
          />
        </label>

        <label className='flex flex-col'>
          Confirm Password
          <Input
            type='password'
            name='confirmNewPassword'
          />
        </label>

        <div className='flex justify-end'>
          <Button
            style={{ width: '4.5rem' }}
            variant='primary'
            type='submit'
          >
            Login
          </Button>
        </div>
      </div>
      <div className='mt-3 flex font-semibold'>{message}</div>
      <div className='mt-3 flex text-red-600 font-semibold'>{errorMessage}</div>
    </form>
  );
}
