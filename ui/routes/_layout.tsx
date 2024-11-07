import { PageProps } from '$fresh/server.ts';
import NavBarUserMenu from '../islands/NavBarUserMenu.tsx';

export default function Layout({ Component, state }: PageProps) {
  return (
    <main>
      <div class='flex flex-row items-center justify-between p-4 bg-gray-100'>
        <div class='flex-none'>
          Logo
        </div>
        <div class='flex flex-1 items-center justify-center'>
          {state.userId
            ? (
              <nav class='flex gap-4'>
                <div>
                  <a href='/'>Home</a>
                </div>
                <div>
                  <a href='/templates'>Templates</a>
                </div>
                <div>
                  <a href='/instances'>Instances</a>
                </div>
              </nav>
            )
            : null}
        </div>
        <div class='flex-none'>
          {/* <a href='/logout'>Logout</a> */}
          {state.userId ? <NavBarUserMenu /> : (
            <>
              <a href='/register'>Register</a> / <a href='/login'>Login</a>
            </>
          )}
        </div>
      </div>
      <div class='mx-4 pt-4'>
        <Component />
      </div>
    </main>
  );
}
