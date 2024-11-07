import { Button } from '../components/primatives/Button.tsx';
import { IS_BROWSER } from '$fresh/runtime.ts';
import { Input } from '../components/primatives/Input.tsx';
import { useState } from 'preact/hooks';
import { InputEventWithValue } from '../types/input-event-with-value.ts';

export default function Login() {
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [openRequest, setOpenRequest] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = async (e: Event) => {
    e.preventDefault();
    setOpenRequest(true);

    const response = await fetch(`/api/login${globalThis.location.search}`, {
      method: 'POST',
      body: JSON.stringify({ username: userName, password }),
    });

    if (response.status === 200) {
      // Get the navBack url param from the browser
      console.dir(globalThis.location.search);

      const location = response.headers.get('location');
      globalThis.location.replace(location ?? '/');
    } else {
      setPassword('');
      setErrorMessage('Failed to authenticate. Invalid user name or password.');
    }

    setOpenRequest(false);
  };

  return (
    <div class='m-6' onSubmit={handleSubmit}>
      <div class='w-fit flex flex-col gap-3'>
        <label class='flex flex-col'>
          Username
          <Input
            type='text'
            name='username'
            isErrored={!!errorMessage}
            onChange={(e: InputEventWithValue) => setUserName(e.target.value)}
            value={userName}
          />
        </label>

        <label class='flex flex-col'>
          Password
          <Input
            type='password'
            name='password'
            isErrored={!!errorMessage}
            onChange={(e: InputEventWithValue) => setPassword(e.target.value)}
            onKeyUp={(e) => {
              if (e.key === 'Enter') {
                // NOTE: Seems like we don't need the below but we should
                // test more before removing it.
                // const target = e.target as HTMLInputElement;
                // if (target.value !== password) {
                //   console.log('updating password');
                //   setPassword(target.value);
                // }
                return handleSubmit(e);
              }
            }}
            value={password}
          />
        </label>

        <div class='flex justify-end'>
          <Button
            style={{ width: '4.5rem' }}
            disabled={!IS_BROWSER}
            onClick={handleSubmit}
            enableSpinner={openRequest}
            variant='primary'
          >
            Login
          </Button>
        </div>
      </div>
      <div class='mt-3 flex text-red-600 font-semibold'>{errorMessage}</div>
    </div>
  );
}
