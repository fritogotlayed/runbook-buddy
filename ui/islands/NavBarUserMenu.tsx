import { useState } from 'preact/hooks';
import { Show } from '../components/primatives/Show.tsx';
import { Button } from '../components/primatives/Button.tsx';
import { Chevron } from '../components/icons/chevron.tsx';

export default function NavBarUserMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const onButtonClick = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div class='relative inline-block text-left'>
      <div>
        <Button
          type='button w-full justify-center gap-x-1.5'
          class='inline-flex w-full gap-x-1.5'
          variant='secondary'
          id='menu-button'
          aria-expanded='true'
          aria-haspopup='true'
          onClick={onButtonClick}
        >
          Options
          <Chevron orientation={isOpen ? 'up' : 'down'} darkness={'light'} />
        </Button>
      </div>

      <Show when={isOpen}>
        <div
          class='absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none'
          role='menu'
          aria-orientation='vertical'
          aria-labelledby='menu-button'
          tabindex={-1}
        >
          <div class='py-1' role='none'>
            <a
              href='/account'
              class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              role='menuitem'
              tabindex={-1}
              id='menu-item-0'
            >
              Account
            </a>
            <a
              href='#'
              class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              role='menuitem'
              tabindex={-1}
              id='menu-item-1'
            >
              Duplicate
            </a>
          </div>
          <div class='py-1' role='none'>
            <a
              href='#'
              class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              role='menuitem'
              tabindex={-1}
              id='menu-item-2'
            >
              Archive
            </a>
            <a
              href='#'
              class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              role='menuitem'
              tabindex={-1}
              id='menu-item-3'
            >
              Move
            </a>
          </div>
          <div class='py-1' role='none'>
            <a
              href='#'
              class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              role='menuitem'
              tabindex={-1}
              id='menu-item-4'
            >
              Share
            </a>
            <a
              href='#'
              class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              role='menuitem'
              tabindex={-1}
              id='menu-item-5'
            >
              Add to favorites
            </a>
          </div>
          <div class='py-1' role='none'>
            <a
              href='/logout'
              class='block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100'
              role='menuitem'
              tabindex={-1}
              id='logout'
            >
              Logout
            </a>
          </div>
        </div>
      </Show>
    </div>
  );
}
